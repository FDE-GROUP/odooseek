import { EventEmitter } from './events'

export interface InlineEditState {
  mode: 'idle' | 'editing' | 'creating'
  recordId?: number
  values: Record<string, unknown>
}

export interface ListModelConfig {
  defaultOrder?: string
  defaultLimit?: number
}

export interface ListModelSnapshot {
  offset: number
  limit: number
  order: string
  selectedIds: Set<number>
  expandedGroups: Set<string>
  groupExtraLimits: Record<string, number>
  dragRow: number | null
  dragOverRow: number | null
  inlineEdit: InlineEditState
  validationErrors: Record<string, string>
  focusCol: number
  focusRow: number
  multiEditActive: boolean
  multiEditValues: Record<string, unknown>
}

export class ListModel {
  private _offset = 0
  private _limit: number
  private _order = ''
  private _selectedIds = new Set<number>()
  private _lastSelectedIdx = -1
  private _expandedGroups = new Set<string>()
  private _groupExtraLimits: Record<string, number> = {}
  private _dragRow: number | null = null
  private _dragOverRow: number | null = null
  private _inlineEdit: InlineEditState = { mode: 'idle', values: {} }
  private _validationErrors: Record<string, string> = {}
  private _focusCol = 0
  private _focusRow = -1
  private _multiEditActive = false
  private _multiEditValues: Record<string, unknown> = {}
  private _savedScrollTop = 0
  private _initialized = false

  private _emitter = new EventEmitter()

  constructor(config?: ListModelConfig) {
    this._limit = config?.defaultLimit ?? 80
    if (config?.defaultOrder) this._order = config.defaultOrder
    if (config?.defaultLimit) this._limit = config.defaultLimit
    this._initialized = true
  }

  get offset(): number { return this._offset }
  get limit(): number { return this._limit }
  get order(): string { return this._order }
  get selectedIds(): Set<number> { return this._selectedIds }
  get expandedGroups(): Set<string> { return this._expandedGroups }
  get groupExtraLimits(): Record<string, number> { return this._groupExtraLimits }
  get dragRow(): number | null { return this._dragRow }
  get dragOverRow(): number | null { return this._dragOverRow }
  get inlineEdit(): InlineEditState { return this._inlineEdit }
  get validationErrors(): Record<string, string> { return this._validationErrors }
  get focusCol(): number { return this._focusCol }
  get focusRow(): number { return this._focusRow }
  get multiEditActive(): boolean { return this._multiEditActive }
  get multiEditValues(): Record<string, unknown> { return this._multiEditValues }

  subscribe(fn: () => void): () => void {
    return this._emitter.subscribe(fn)
  }

  getSnapshot(): ListModelSnapshot {
    return {
      offset: this._offset,
      limit: this._limit,
      order: this._order,
      selectedIds: new Set(this._selectedIds),
      expandedGroups: new Set(this._expandedGroups),
      groupExtraLimits: { ...this._groupExtraLimits },
      dragRow: this._dragRow,
      dragOverRow: this._dragOverRow,
      inlineEdit: { ...this._inlineEdit, values: { ...this._inlineEdit.values } },
      validationErrors: { ...this._validationErrors },
      focusCol: this._focusCol,
      focusRow: this._focusRow,
      multiEditActive: this._multiEditActive,
      multiEditValues: { ...this._multiEditValues },
    }
  }

  // ── Pagination ──────────────────────────────────────────────

  sort(fieldName: string, scrollContainer?: HTMLDivElement | null): void {
    if (scrollContainer) this._savedScrollTop = scrollContainer.scrollTop
    if (this._order === fieldName) this._order = `${fieldName} desc`
    else if (this._order === `${fieldName} desc`) this._order = ''
    else this._order = fieldName
    this._offset = 0
    this._selectedIds = new Set()
    this._emitter.notify()
  }

  setPage(newOffset: number, scrollContainer?: HTMLDivElement | null): void {
    if (scrollContainer) this._savedScrollTop = scrollContainer.scrollTop
    this._offset = newOffset
    this._emitter.notify()
  }

  setPageSize(newLimit: number): void {
    this._limit = newLimit
    this._offset = 0
    this._emitter.notify()
  }

  restoreScroll(scrollContainer?: HTMLDivElement | null): void {
    if (scrollContainer && this._savedScrollTop > 0) {
      scrollContainer.scrollTop = this._savedScrollTop
      this._savedScrollTop = 0
    }
  }

  // ── Selection ───────────────────────────────────────────────

  toggleRow(id: number, shiftKey: boolean, index: number, data: Array<Record<string, unknown>>, groupByActive: boolean): void {
    if (shiftKey && this._lastSelectedIdx >= 0 && !groupByActive) {
      const start = Math.min(this._lastSelectedIdx, index)
      const end = Math.max(this._lastSelectedIdx, index)
      const rangeIds = data.slice(start, end + 1).map((r) => r.id as number)
      for (const rid of rangeIds) this._selectedIds.add(rid)
    } else {
      if (this._selectedIds.has(id)) this._selectedIds.delete(id)
      else this._selectedIds.add(id)
    }
    this._lastSelectedIdx = index
    this._emitter.notify()
  }

  toggleAll(pageRecordIds: number[], allSelected: boolean): void {
    if (allSelected) this._selectedIds = new Set()
    else this._selectedIds = new Set(pageRecordIds)
    this._emitter.notify()
  }

  clearSelection(): void {
    this._selectedIds = new Set()
    this._emitter.notify()
  }

  selectAll(ids: number[]): void {
    this._selectedIds = new Set(ids)
    this._emitter.notify()
  }

  // ── Group expansion ─────────────────────────────────────────

  toggleGroupExpand(path: string): void {
    if (this._expandedGroups.has(path)) {
      for (const p of this._expandedGroups) {
        if (p.startsWith(`${path}-`)) this._expandedGroups.delete(p)
      }
      this._expandedGroups.delete(path)
    } else {
      this._expandedGroups.add(path)
    }
    this._emitter.notify()
  }

  setGroupExtraLimits(limits: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)): void {
    this._groupExtraLimits = typeof limits === 'function' ? limits(this._groupExtraLimits) : limits
    this._emitter.notify()
  }

  // ── Drag & drop ─────────────────────────────────────────────

  setDragRow(row: number | null): void {
    this._dragRow = row
    this._emitter.notify()
  }

  setDragOverRow(row: number | null): void {
    this._dragOverRow = row
    this._emitter.notify()
  }

  clearDragState(): void {
    this._dragRow = null
    this._dragOverRow = null
    this._emitter.notify()
  }

  // ── Inline edit ─────────────────────────────────────────────

  enterEdit(record: Record<string, unknown>, editableColIndices: number[]): void {
    this._inlineEdit = {
      mode: 'editing',
      recordId: record.id as number,
      values: { ...record },
    }
    this._validationErrors = {}
    this._focusCol = editableColIndices[0] ?? 0
    this._emitter.notify()
  }

  enterCreate(defaults: Record<string, unknown>, editableColIndices: number[]): void {
    this._inlineEdit = {
      mode: 'creating',
      values: { ...defaults },
    }
    this._validationErrors = {}
    this._focusCol = editableColIndices[0] ?? 0
    this._emitter.notify()
  }

  leaveEdit(): void {
    this._inlineEdit = { mode: 'idle', values: {} }
    this._validationErrors = {}
    this._emitter.notify()
  }

  updateEdit(fieldName: string, value: unknown): void {
    this._inlineEdit.values[fieldName] = value
    if (this._validationErrors[fieldName]) {
      const next = { ...this._validationErrors }
      delete next[fieldName]
      this._validationErrors = next
    }
    this._emitter.notify()
  }

  setValidationErrors(errors: Record<string, string>): void {
    this._validationErrors = errors
    this._emitter.notify()
  }

  // ── Focus ───────────────────────────────────────────────────

  setFocusCol(col: number): void {
    this._focusCol = col
    this._emitter.notify()
  }

  setFocusRow(row: number): void {
    this._focusRow = row
    this._emitter.notify()
  }

  moveFocus(direction: 1 | -1, editableColIndices: number[]): void {
    const idx = editableColIndices.indexOf(this._focusCol)
    const next = idx + direction
    if (next < 0 || next >= editableColIndices.length) return
    this._focusCol = editableColIndices[next]
    this._emitter.notify()
  }

  // ── Multi-edit ──────────────────────────────────────────────

  setMultiEditActive(active: boolean): void {
    this._multiEditActive = active
    if (!active) this._multiEditValues = {}
    this._emitter.notify()
  }

  setMultiEditValues(values: Record<string, unknown>): void {
    this._multiEditValues = values
    this._emitter.notify()
  }

  updateMultiEditValue(fieldName: string, value: unknown): void {
    this._multiEditValues[fieldName] = value
    this._emitter.notify()
  }
}
