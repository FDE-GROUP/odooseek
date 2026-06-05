import type { OdooFieldMeta } from './types'
import { EventEmitter } from './events'
import { KeepLast } from './keep-last'
import { Mutex } from './mutex'
import { normalizeOnchangeValue, normalizeValuesForRpc, validateAllFields } from './onchange-helpers'
import { isFieldValueEmpty, validateFieldValue } from './validation'

type CallKwFn = <T = unknown>(model: string, method: string, args: unknown[], kwargs?: Record<string, unknown>) => Promise<T>

let _rpcCall: CallKwFn

export function _setCallKw(fn: CallKwFn): void {
  _rpcCall = fn
}

export interface RecordModelConfig {
  model: string
  fields: Record<string, OdooFieldMeta>
  recordId?: number
  context?: Record<string, unknown>
  readFields: string[]
}

export interface RecordModelSnapshot {
  data: Record<string, unknown>
  dirty: boolean
  isNew: boolean
  editMode: boolean
  saving: boolean
  missingFields: Set<string>
  fieldErrors: Map<string, string>
  saveError: string | null
  warning: { title: string; message: string } | null
  justSaved: boolean
}

export class RecordModel {
  private _values: Record<string, unknown> = {}
  private _changes: Record<string, unknown> = {}
  private _editMode = false
  private _saving = false
  private _saveError: string | null = null
  private _warning: { title: string; message: string } | null = null
  private _justSaved = false
  private _missingFields = new Set<string>()
  private _fieldErrors = new Map<string, string>()

  private _mutex = new Mutex()
  private _keepLast = new KeepLast()
  private _emitter = new EventEmitter()
  private _onchangeTimer: ReturnType<typeof setTimeout> | undefined

  readonly model: string
  readonly fields: Record<string, OdooFieldMeta>
  readonly recordId: number | undefined
  readonly context: Record<string, unknown>
  readonly readFields: string[]

  constructor(config: RecordModelConfig) {
    this.model = config.model
    this.fields = config.fields
    this.recordId = config.recordId
    this.context = config.context ?? {}
    this.readFields = config.readFields
  }

  get data(): Record<string, unknown> {
    return { ...this._values, ...this._changes }
  }

  get dirty(): boolean {
    if (!this._editMode) return false
    return Object.keys(this._changes).some(
      (k) => this._changes[k] !== this._values[k],
    )
  }

  get isNew(): boolean {
    return !this.recordId
  }

  // ── Subscribe / Snapshot ──────────────────────────────────

  subscribe(fn: () => void): () => void {
    return this._emitter.subscribe(fn)
  }

  getSnapshot(): RecordModelSnapshot {
    return {
      data: this.data,
      dirty: this.dirty,
      isNew: this.isNew,
      editMode: this._editMode,
      saving: this._saving,
      missingFields: new Set(this._missingFields),
      fieldErrors: new Map(this._fieldErrors),
      saveError: this._saveError,
      warning: this._warning,
      justSaved: this._justSaved,
    }
  }

  // ── Update (replaces handleChange) ────────────────────────

  update(name: string, value: unknown): void {
    this._changes[name] = value
    this._validateField(name, value)
    this._emitter.notify()
    this._debounceOnchange([name])
  }

  // ── Save (replaces handleSave + saveMutation) ─────────────

  async save(): Promise<{ success: boolean; newId?: number }> {
    return this._mutex.run(async () => {
      this._keepLast.invalidate()
      clearTimeout(this._onchangeTimer)

      const currentData = this.data
      const fieldsToValidate = Object.fromEntries(
        this.readFields.filter((k) => k in this.fields).map((k) => [k, this.fields[k]]),
      )
      const { missing, errors } = validateAllFields(fieldsToValidate, currentData)
      this._missingFields = missing
      this._fieldErrors = errors
      if (missing.size > 0 || errors.size > 0) {
        this._saveError = this._buildErrorMessage(missing, errors)
        this._emitter.notify()
        return { success: false }
      }

      this._saving = true
      this._saveError = null
      this._emitter.notify()

      try {
        const normalized = normalizeValuesForRpc(currentData, this.fields)
        if (this.isNew) {
          const newId = await _rpcCall<number>(this.model, 'create', [normalized], {
            context: this.context,
          })
          this._values = { ...currentData, id: newId }
          this._changes = {}
          this._editMode = false
          this._justSaved = true
          this._emitter.notify()
          setTimeout(() => {
            this._justSaved = false
            this._emitter.notify()
          }, 2000)
          return { success: true, newId }
        }
        await _rpcCall(this.model, 'write', [[this.recordId], normalized], {
          context: this.context,
        })
        this._values = { ...currentData }
        this._changes = {}
        this._editMode = false
        this._justSaved = true
        this._emitter.notify()
        setTimeout(() => {
          this._justSaved = false
          this._emitter.notify()
        }, 2000)
        return { success: true }
      } catch (err) {
        this._saveError = err instanceof Error ? err.message : String(err)
        this._emitter.notify()
        return { success: false }
      } finally {
        this._saving = false
        this._emitter.notify()
      }
    })
  }

  // ── Discard (replaces handleCancel) ───────────────────────

  discard(): void {
    this._changes = {}
    this._missingFields = new Set()
    this._fieldErrors = new Map()
    this._saveError = null
    this._editMode = false
    this._warning = null
    clearTimeout(this._onchangeTimer)
    this._emitter.notify()
  }

  // ── Enter edit mode ───────────────────────────────────────

  enterEdit(serverRecord?: Record<string, unknown>): void {
    if (serverRecord) this._values = { ...serverRecord }
    this._changes = {}
    this._editMode = true
    this._saveError = null
    this._warning = null
    const { missing, errors } = validateAllFields(this.fields, this.data)
    this._missingFields = missing
    this._fieldErrors = errors
    this._emitter.notify()
  }

  // ── Load from server (replaces useQuery data effect) ──────

  loadFromServer(record: Record<string, unknown>): void {
    this._values = { ...record }
    this._changes = {}
    this._saveError = null
    this._warning = null
    if (this.isNew) this._editMode = true
    this._emitter.notify()
  }

  // ── Load defaults for new record ──────────────────────────

  async loadDefaults(): Promise<void> {
    const defaults = await _rpcCall<Record<string, unknown>>(
      this.model,
      'default_get',
      [this.readFields],
      { context: this.context },
    )
    const merged = { ...defaults }
    for (const [k, v] of Object.entries(this.context)) {
      if (k.startsWith('default_')) {
        const fieldName = k.slice(8)
        if (fieldName in this.fields) merged[fieldName] = v
      }
    }
    this._values = merged
    this._changes = {}
    this._editMode = true
    const { missing, errors } = validateAllFields(this.fields, merged)
    this._missingFields = missing
    this._fieldErrors = errors
    this._emitter.notify()
    this._debounceOnchange([])
  }

  // ── Show rainbowman ───────────────────────────────────────

  showRainbowman(): void {
    this._justSaved = true
    this._emitter.notify()
    setTimeout(() => {
      this._justSaved = false
      this._emitter.notify()
    }, 2000)
  }

  // ── Internal: onchange ────────────────────────────────────

  private _debounceOnchange(fieldNames: string[]): void {
    clearTimeout(this._onchangeTimer)
    this._onchangeTimer = setTimeout(() => this._executeOnchange(fieldNames), 300)
  }

  private async _executeOnchange(changedFields: string[]): Promise<void> {
    await this._mutex.run(async () => {
      try {
        const fieldsSpec: Record<string, unknown> = {}
        for (const k of this.readFields) {
          const meta = this.fields[k]
          fieldsSpec[k] = meta?.onChange ? { onChange: true } : {}
        }

        const result = await this._keepLast.add(
          _rpcCall<{ value?: Record<string, unknown>; warning?: { title: string; message: string; type: string } }>(
            this.model,
            'onchange',
            [
              this.isNew ? [] : [this.recordId],
              normalizeValuesForRpc(this.data, this.fields),
              changedFields,
              fieldsSpec,
            ],
            { context: this.context },
          ),
        )

        if (result?.value) {
          for (const [k, v] of Object.entries(result.value)) {
            const normalized = normalizeOnchangeValue(v, this.fields[k]?.type)
            this._changes[k] = normalized
            this._validateField(k, normalized)
          }
        }
        if (result?.warning) {
          this._warning = result.warning
          this._emitter.notify()
          setTimeout(() => {
            this._warning = null
            this._emitter.notify()
          }, 5000)
        }

        this._emitter.notify()
      } catch {
        // KeepLast dropped or RPC error — ignore
      }
    })
  }

  // ── Internal: validation ──────────────────────────────────

  private _validateField(name: string, value: unknown): void {
    const meta = this.fields[name]
    if (!meta) return
    if (meta.required) {
      if (isFieldValueEmpty(value, meta.type)) this._missingFields.add(name)
      else this._missingFields.delete(name)
    }
    const err = validateFieldValue(value, meta)
    if (err) this._fieldErrors.set(name, err)
    else this._fieldErrors.delete(name)
  }

  private _buildErrorMessage(missing: Set<string>, errors: Map<string, string>): string {
    const parts: string[] = []
    for (const name of missing) {
      const label = this.fields[name]?.string || name
      parts.push(`• ${label} is required`)
    }
    for (const [name, msg] of errors) {
      const label = this.fields[name]?.string || name
      parts.push(`• ${label}: ${msg}`)
    }
    return parts.join('\n')
  }
}
