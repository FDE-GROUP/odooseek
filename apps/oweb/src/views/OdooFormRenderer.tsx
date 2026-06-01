import type {
  ButtonBoxElement,
  ButtonElement,
  FieldElement,
  FormElement,
  GroupElement,
  HeaderElement,
  OdooFieldMeta,
  StatButtonElement,
} from '@odooseek/odoo-client'
import {
  callButton,
  callKw,
  evalModifier,
  getDecorationClass as getDecoClass,
  type OdooAction,
  parseFormXml,
} from '@odooseek/odoo-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ActivityPanel } from '../components/ActivityPanel'
import { Chatter } from '../components/Chatter'
import { useConfirmDialog } from '../components/ConfirmDialog'
import { FormSheetSkeleton } from '../components/Skeleton'
import { mergeVersionPreviewIntoRecord, useHrVersion } from '../hooks/HrVersionProvider'
import { useAuth } from '../lib/auth'
import { passesXmlGroups } from '../lib/field-access'
import { getFieldWidget } from './widgets'

export interface OdooFormRendererRef {
  save: () => Promise<void>
}

interface FormRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  recordId?: number
  context?: Record<string, unknown>
  onRecordCreated?: (newId: number) => void
  onDirtyChange?: (dirty: boolean) => void
  onAction?: (action: OdooAction) => void
}

export const OdooFormRenderer = forwardRef(function OdooFormRenderer(
  {
    model,
    arch,
    fields,
    recordId,
    context = {},
    onRecordCreated,
    onDirtyChange,
    onAction,
  }: FormRendererProps,
  ref: React.Ref<OdooFormRendererRef>,
) {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const confirmDialog = useConfirmDialog()
  const formLayout = useMemo(() => parseFormXml(arch), [arch])
  const [editMode, setEditMode] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [warning, setWarning] = useState<{ title: string; message: string } | null>(null)
  const onchangeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const baselineRef = useRef<Record<string, unknown>>({})
  const formRef = useRef<HTMLDivElement>(null)
  const newRecordId = !recordId ? 0 : recordId

  const headerElement = formLayout.elements.find((e): e is HeaderElement => e.type === 'header')
  const nonHeaderElements = formLayout.elements.filter((e) => e.type !== 'header')

  const { data: record } = useQuery({
    queryKey: ['odoo', 'read', model, recordId],
    queryFn: () =>
      callKw<Array<Record<string, unknown>>>(model, 'read', [[recordId], Object.keys(fields)]),
    enabled: !!recordId,
  })

  useEffect(() => {
    if (record?.[0]) {
      baselineRef.current = { ...record[0] }
    }
  }, [record])

  const isDirty = useMemo(() => {
    if (!editMode) return false
    const baseline = baselineRef.current
    if (!baseline || Object.keys(baseline).length === 0) return false
    return Object.keys(formValues).some((k) => formValues[k] !== baseline[k])
  }, [formValues, editMode])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const triggerOnchange = useCallback(
    (fieldNames: string[], values: Record<string, unknown>) => {
      clearTimeout(onchangeTimer.current)
      onchangeTimer.current = setTimeout(async () => {
        const fieldsSpec: Record<string, unknown> = {}
        for (const [k, meta] of Object.entries(fields))
          fieldsSpec[k] = meta.onChange ? { onChange: true } : {}
        const result = await callKw<{
          value?: Record<string, unknown>
          warning?: { title: string; message: string; type: string }
        }>(
          model,
          'onchange',
          [newRecordId ? [newRecordId] : [], values, fieldNames, fieldsSpec],
          {},
        )
        if (result?.value) {
          const normalized: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(result.value))
            normalized[k] = normalizeOnchangeValue(v, fields[k]?.type)
          setFormValues((prev) => ({ ...prev, ...normalized }))
        }
        if (result?.warning) {
          setWarning(result.warning)
          setTimeout(() => setWarning(null), 5000)
        }
      }, 300)
    },
    [model, newRecordId, fields],
  )

  useEffect(() => {
    if (!recordId && !record) {
      callKw<Record<string, unknown>>(model, 'default_get', [Object.keys(fields)], { context })
        .then((defaults) => {
          const merged = { ...defaults }
          for (const [k, v] of Object.entries(context)) {
            if (k.startsWith('default_')) {
              const fieldName = k.slice(8)
              if (fieldName in fields) merged[fieldName] = v
            }
          }
          setFormValues(merged)
          baselineRef.current = { ...merged }
          setEditMode(true)
          triggerOnchange([], merged)
        })
        .catch(() => {
          setSaveError('Failed to load defaults. Some fields may be empty.')
          setTimeout(() => setSaveError(null), 5000)
          setEditMode(true)
        })
    }
  }, [model, recordId, triggerOnchange, record, fields, context])

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      newRecordId
        ? callKw(model, 'write', [[newRecordId], values])
        : callKw(model, 'create', [values]),
    onSuccess: (result) => {
      if (!newRecordId && typeof result === 'number') {
        onRecordCreated?.(result)
      } else {
        baselineRef.current = { ...formValues }
        const invalidateKey = newRecordId
          ? ['odoo', 'read', model, newRecordId]
          : ['odoo', 'read', model, recordId]
        queryClient.invalidateQueries({ queryKey: invalidateKey })
        setEditMode(false)
      }
      // Clear draft on successful save
      try {
        localStorage.removeItem(`form_draft_${model}_${recordId ?? 'new'}`)
      } catch {
        // ignore
      }
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    },
  })

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      setFormValues((prev) => {
        const next = { ...prev, [name]: value }
        triggerOnchange([name], next)
        return next
      })
    },
    [triggerOnchange],
  )

  const handleSave = useCallback(async (): Promise<void> => {
    const missing: string[] = []
    for (const [name, meta] of Object.entries(fields)) {
      if (meta.required && !formValues[name]) missing.push(meta.string || name)
    }
    if (missing.length > 0) {
      setSaveError(`Required: ${missing.join(', ')}`)
      return
    }
    setSaveError(null)
    await saveMutation.mutateAsync(formValues)
  }, [fields, formValues, saveMutation])

  const handleCancel = useCallback(() => {
    setFormValues({ ...baselineRef.current })
    setEditMode(false)
  }, [])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  // Keyboard shortcuts: Ctrl+S save, Escape cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (editMode && !saveMutation.isPending) handleSave()
      }
      if (e.key === 'Escape' && editMode) {
        e.preventDefault()
        handleCancel()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [editMode, saveMutation.isPending, handleSave, handleCancel])

  // beforeUnload: warn when leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Autosave: save after 5s idle when dirty
  useEffect(() => {
    if (!isDirty || !editMode || !newRecordId) return
    const timer = setTimeout(() => {
      handleSave()
    }, 5000)
    return () => clearTimeout(timer)
  }, [isDirty, editMode, newRecordId, handleSave])

  // Draft recovery: save draft to localStorage, restore on mount
  const draftKey = `form_draft_${model}_${recordId ?? 'new'}`
  useEffect(() => {
    if (isDirty && editMode) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formValues))
      } catch {
        // localStorage full or unavailable
      }
    }
  }, [isDirty, editMode, formValues, draftKey])

  const draftLoaded = useRef(false)
  useEffect(() => {
    if (!editMode || draftLoaded.current) return
    draftLoaded.current = true
    try {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        localStorage.removeItem(draftKey)
        setFormValues(JSON.parse(draft))
      }
    } catch {
      // invalid draft
    }
  }, [editMode, draftKey])

  // Autofocus first editable field on new record
  useEffect(() => {
    if (!editMode || !formRef.current) return
    const first = formRef.current.querySelector<HTMLInputElement>(
      'input[type="text"], textarea, select',
    )
    if (first) first.focus()
  }, [editMode])

  const handleActionButton = useCallback(
    async (btn: ButtonElement) => {
      if (btn.special === 'cancel') {
        onAction?.({ type: 'ir.actions.act_window_close' } as OdooAction)
        return
      }

      if (btn.buttonType === 'edit') {
        if (record?.[0]) {
          setFormValues({ ...record[0] })
          setEditMode(true)
        }
        return
      }

      if (btn.buttonType === 'action') {
        const context: Record<string, unknown> = {
          active_model: model,
          active_id: newRecordId,
          active_ids: [newRecordId],
        }
        try {
          const { loadAction } = await import('@odooseek/odoo-client')
          const action = await loadAction(btn.name, context)
          if (action) onAction?.(action)
        } catch (err: unknown) {
          setSaveError(err instanceof Error ? err.message : 'Action failed')
        }
        return
      }

      if (!recordId && !newRecordId) return

      const executeAction = async () => {
        const context: Record<string, unknown> = {
          active_model: model,
          active_id: newRecordId,
          active_ids: [newRecordId],
        }

        try {
          if (btn.buttonType === 'object' || !btn.buttonType) {
            let id = newRecordId
            if (!newRecordId) {
              const result = await callKw(model, 'create', [{}])
              id = typeof result === 'number' ? result : 0
            }
            const result = await callButton<OdooAction | false>(model, btn.name, [[id]], {
              context,
            })
            queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, id] })
            if (result && typeof result === 'object' && result.type) {
              onAction?.(result)
            }
          }
        } catch (err: unknown) {
          setSaveError(err instanceof Error ? err.message : 'Action failed')
        }
      }

      if (btn.confirm) {
        confirmDialog({
          title: 'Confirm',
          message: btn.confirm,
          confirmLabel: 'OK',
          variant: 'warning',
          onConfirm: executeAction,
        })
        return
      }

      executeAction()
    },
    [model, newRecordId, record, recordId, queryClient, confirmDialog, onAction],
  )

  const handleStatusChange = useCallback(
    async (value: string) => {
      if (!recordId) return
      const stateField = fields.state
      if (!stateField) return
      const writeVal = stateField.type === 'many2one' ? Number(value) : value
      await callKw(model, 'write', [[recordId], { state: writeVal }])
      queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
    },
    [model, recordId, fields.state, queryClient],
  )

  const hrVersion = useHrVersion()
  const baseRecord = editMode ? formValues : record?.[0]
  const currentRecord = useMemo(() => {
    if (!baseRecord || !hrVersion?.isReadonlyPreview || !hrVersion.previewRecord) return baseRecord
    return mergeVersionPreviewIntoRecord(baseRecord, hrVersion.previewRecord)
  }, [baseRecord, hrVersion?.isReadonlyPreview, hrVersion?.previewRecord])
  const versionReadOnly = hrVersion?.isReadonlyPreview ?? false
  const effectiveEditMode = editMode && !versionReadOnly
  const awaitingRecord = !!recordId && !record?.[0]

  if (!formLayout)
    return <div className="p-6 text-sm text-text-muted">Failed to parse form XML</div>

  const formBody = (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <HeaderBar
        headerElement={headerElement}
        stateField={fields.state}
        currentRecord={currentRecord}
        session={session}
        onAction={handleActionButton}
        onStatusChange={handleStatusChange}
        editMode={effectiveEditMode}
        isDirty={isDirty}
        justSaved={justSaved}
        saveError={saveError}
        onEdit={() => {
          if (versionReadOnly) return
          setFormValues(record?.[0] ? { ...record[0] } : { ...formValues })
          setEditMode(true)
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={saveMutation.isPending}
      />

      {saveError && (
        <div className="o_form_sheet_bg mt-1 w-full rounded border border-danger/30 bg-danger/10 px-4 py-2 text-xs text-danger">
          {saveError}
        </div>
      )}
      {warning && (
        <div className="o_form_sheet_bg mt-1 w-full rounded border border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
          <span className="font-medium">{warning.title}</span>: {warning.message}
        </div>
      )}

      <div
        ref={formRef}
        className="o_form_body min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden px-4 py-2"
      >
        <div className={recordId ? 'o_form_main' : 'o_form_main o_form_main--solo'}>
          <div className="o_form_sheet_bg">
            {awaitingRecord ? (
              <FormSheetSkeleton />
            ) : (
              <div className="o_form_sheet">
                <FormLayoutNode
                  elements={nonHeaderElements}
                  record={currentRecord}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                  editMode={effectiveEditMode}
                  onChange={handleChange}
                  onAction={onAction}
                  onButtonAction={handleActionButton}
                  session={session}
                />
                {recordId && <FormTimestamps record={record?.[0]} />}
              </div>
            )}
          </div>
          {!awaitingRecord && recordId && (
            <div className="o_form_chatter_col">
              <div className="o_form_sheet_bg">
                <ActivityPanel model={model} recordId={recordId} />
                <Chatter model={model} recordId={recordId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return formBody
})

const MAX_HEADER_BUTTONS = 3

function HeaderButtonGroup({
  buttons,
  onAction,
}: {
  buttons: ButtonElement[]
  onAction: (btn: ButtonElement) => void
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const primary = buttons.slice(0, MAX_HEADER_BUTTONS)
  const overflow = buttons.slice(MAX_HEADER_BUTTONS)

  const btnClass = (btn: ButtonElement) =>
    `px-3 py-1 text-xs font-medium transition-colors ${
      btn.class?.includes('btn-primary')
        ? 'bg-accent text-on-accent hover:bg-accent/90 rounded'
        : 'text-text-secondary hover:bg-hover rounded'
    }`

  return (
    <div className="flex items-center gap-1.5">
      {primary.map((btn, i) => (
        <button
          key={`${btn.name}-${i}`}
          type="button"
          onClick={() => onAction(btn)}
          className={btnClass(btn)}
        >
          {btn.icon && <span className="mr-1">{btn.icon}</span>}
          {btn.string || btn.name}
        </button>
      ))}
      {overflow.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOverflowOpen(!overflowOpen)}
            onBlur={() => setTimeout(() => setOverflowOpen(false), 150)}
            className="px-2 py-1 text-xs font-medium text-text-secondary hover:bg-hover rounded"
          >
            More ▾
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-border-subtle bg-surface shadow-lg">
              {overflow.map((btn, i) => (
                <button
                  key={`${btn.name}-${i}`}
                  type="button"
                  onMouseDown={() => {
                    onAction(btn)
                    setOverflowOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
                >
                  {btn.string || btn.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HeaderBar({
  headerElement,
  stateField,
  currentRecord,
  session,
  onAction,
  onStatusChange,
  editMode,
  isDirty,
  justSaved,
  saveError,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: {
  headerElement?: HeaderElement
  stateField?: OdooFieldMeta
  currentRecord?: Record<string, unknown>
  session?: Parameters<typeof passesXmlGroups>[1]
  onAction: (btn: ButtonElement) => void
  onStatusChange?: (value: string) => void
  editMode: boolean
  isDirty: boolean
  justSaved: boolean
  saveError: string | null
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => {
      const container = document.querySelector('.o_form_body')
      setScrolled(container ? container.scrollTop > 4 : false)
    }
    // Listen on the scrollable container
    const container = document.querySelector('.o_form_body')
    if (container) {
      container.addEventListener('scroll', handler, { passive: true })
      return () => container.removeEventListener('scroll', handler)
    }
  }, [])

  const stateSelection = stateField?.selection ?? []
  const stateValue = currentRecord?.state as string | undefined
  const stateIdx = stateSelection.findIndex(([k]) => k === stateValue)

  const visibleButtons = headerElement
    ? headerElement.buttons.filter((btn) => isButtonVisible(btn, currentRecord, session))
    : []

  const hasContent = stateSelection.length > 1 || visibleButtons.length > 0 || editMode

  if (!hasContent) {
    return (
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-1.5 transition-shadow">
        <div className="flex items-center gap-2">
          <span />
        </div>
        <ActionButtons
          editMode={editMode}
          isDirty={isDirty}
          justSaved={justSaved}
          saveError={saveError}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      </div>
    )
  }

  return (
    <div
      className={`sticky top-0 z-20 border-b border-border-subtle bg-surface px-4 py-1.5 transition-shadow ${scrolled ? 'shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {stateSelection.length > 1 && (
            <div className="flex items-center gap-0.5">
              {stateSelection.map(([key, label], i) => {
                const isCurrent = key === stateValue
                const isPast = stateIdx >= 0 && i < stateIdx
                const isFirst = i === 0
                const isLast = i === stateSelection.length - 1
                const baseClass = 'px-3 py-1 text-[11px] font-medium transition-colors'
                const roundedClass = isFirst ? 'rounded-l' : isLast ? 'rounded-r' : ''
                const colorClass = isCurrent
                  ? 'bg-accent text-on-accent'
                  : isPast
                    ? 'bg-success/20 text-success hover:bg-success/30'
                    : 'bg-elevated text-text-muted hover:bg-hover'
                const cursorClass = isCurrent || editMode ? 'cursor-default' : 'cursor-pointer'
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={editMode || isCurrent}
                    onClick={() => onStatusChange?.(key)}
                    className={`${baseClass} ${colorClass} ${roundedClass} ${cursorClass}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
          {visibleButtons.length > 0 && (
            <HeaderButtonGroup buttons={visibleButtons} onAction={onAction} />
          )}
        </div>
        <ActionButtons
          editMode={editMode}
          isDirty={isDirty}
          justSaved={justSaved}
          saveError={saveError}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}

function ActionButtons({
  editMode,
  isDirty,
  justSaved,
  saveError,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: {
  editMode: boolean
  isDirty: boolean
  justSaved: boolean
  saveError: string | null
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {saveError && (
        <span className="flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          Invalid
        </span>
      )}
      {isDirty && (
        <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
          Unsaved
        </span>
      )}
      {justSaved && !isDirty && (
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Saved
        </span>
      )}
      {editMode ? (
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border-default px-3 py-1 text-xs font-medium text-text-secondary hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded bg-accent px-3 py-1 text-xs font-semibold text-on-accent hover:bg-accent/90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="rounded bg-accent px-3 py-1 text-xs font-semibold text-on-accent hover:bg-accent/90"
        >
          Edit
        </button>
      )}
    </div>
  )
}

function isButtonVisible(
  btn: ButtonElement | StatButtonElement,
  record?: Record<string, unknown>,
  session?: Parameters<typeof passesXmlGroups>[1],
): boolean {
  if ('groups' in btn && btn.groups && !passesXmlGroups(btn.groups, session)) return false
  if (btn.invisible && evalModifier(btn.invisible, record)) return false
  if ('states' in btn && btn.states) {
    const allowedStates = btn.states.split(',').map((s) => s.trim())
    const currentState = record?.state as string | undefined
    if (!currentState || !allowedStates.includes(currentState)) return false
  }
  return true
}

function StatButton({
  button,
  record,
  model,
  recordId,
}: {
  button: StatButtonElement
  record?: Record<string, unknown>
  model: string
  recordId?: number
}) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  let value: React.ReactNode = ''
  let text = button.string ?? ''

  if (button.content?.type === 'field') {
    const raw = record?.[button.content.fieldName]
    value = raw != null ? String(raw) : '0'
    text = button.content.string ?? text
  } else if (button.content?.type === 'custom') {
    const raw = button.content.valueField ? record?.[button.content.valueField] : undefined
    value = raw != null ? String(raw) : ''
    text = button.content.textFallback ?? text
  }

  const handleClick = useCallback(async () => {
    if (loading) return
    if (button.confirm && !window.confirm(button.confirm)) return

    if (button.buttonType === 'action') {
      setLoading(true)
      try {
        await callKw('ir.actions.server', 'run', [[Number(button.name)]])
        if (recordId) {
          queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed. Please try again.')
        setTimeout(() => setError(null), 5000)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!recordId) return

    setLoading(true)
    try {
      if (button.buttonType === 'object') {
        await callKw(model, button.name, [[recordId]])
        queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed. Please try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }, [button, loading, model, recordId, queryClient])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={error ?? undefined}
      className={`oe_stat_button ${error ? 'oe_stat_button--error' : ''}`}
    >
      {button.icon && <i className={`fa ${button.icon} oe_stat_button_icon`} />}
      {value !== '' && <span className="oe_stat_button_value">{value}</span>}
      <span className="oe_stat_button_text">{error ?? text}</span>
    </button>
  )
}

function normalizeOnchangeValue(v: unknown, fieldType?: string): unknown {
  if (fieldType === 'many2one' && v === false) return null
  return v
}

interface NodeProps {
  elements: FormElement[]
  record?: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId?: number
  editMode?: boolean
  onChange?: (name: string, value: unknown) => void
  onAction?: (action: OdooAction) => void
  onButtonAction?: (btn: ButtonElement) => void
  level?: number
  groupCol?: number
  fieldGridSpan?: number
  session?: Parameters<typeof passesXmlGroups>[1]
}

function NotebookRenderer({
  pages,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  onAction,
  onButtonAction,
  level,
  session,
}: {
  pages: { string: string; invisible?: string; elements: FormElement[] }[]
  record?: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId?: number
  editMode?: boolean
  onChange?: (n: string, v: unknown) => void
  onAction?: (action: OdooAction) => void
  onButtonAction?: (btn: ButtonElement) => void
  level: number
  session?: Parameters<typeof passesXmlGroups>[1]
}) {
  const [activePage, setActivePage] = useState(0)
  const visiblePages = useMemo(
    () => pages.filter((p) => !evalModifier(p.invisible, record)),
    [pages, record],
  )
  const safeActive = Math.min(activePage, visiblePages.length - 1)

  // Check each page for missing required fields (edit mode only)
  const pageHasMissing = useMemo(() => {
    if (!editMode) return visiblePages.map(() => false)
    return visiblePages.map((page) => {
      const fieldEls = page.elements.filter((e) => e.type === 'field')
      return fieldEls.some((el) => {
        const fe = el as { type: 'field'; name: string }
        const meta = fields[fe.name]
        if (!meta?.required) return false
        return !record?.[fe.name]
      })
    })
  }, [visiblePages, editMode, fields, record])

  return (
    <div className="o_notebook mt-4">
      <div className="o_notebook_tabs flex border-b border-border-subtle">
        {visiblePages.map((page, pi) => (
          <button
            key={pi}
            type="button"
            onClick={() => setActivePage(pi)}
            className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
              pi === safeActive
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
            }`}
          >
            {page.string}
            {pageHasMissing[pi] && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-danger" />
            )}
          </button>
        ))}
      </div>
      <div className="o_notebook_page py-4">
        {visiblePages[safeActive] && (
          <FormLayoutNode
            elements={visiblePages[safeActive].elements}
            record={record}
            fields={fields}
            model={model}
            recordId={recordId}
            editMode={editMode}
            onChange={onChange}
            onAction={onAction}
            onButtonAction={onButtonAction}
            session={session}
            level={level + 1}
          />
        )}
      </div>
    </div>
  )
}

function HelpPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  return (
    <span className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center text-[10px] text-info cursor-help hover:opacity-80"
      >
        ?
      </button>
      {open &&
        btnRef.current &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onMouseDown={() => setOpen(false)}>
            <div
              className="absolute z-[10000] mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface p-3 text-xs leading-relaxed text-text-secondary shadow-lg"
              style={{
                top: btnRef.current?.getBoundingClientRect().bottom + 4,
                left: Math.min(
                  btnRef.current?.getBoundingClientRect().left,
                  window.innerWidth - 300,
                ),
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {text}
            </div>
          </div>,
          document.body,
        )}
    </span>
  )
}

const MAX_BUTTON_BOX = 4

function ButtonBoxRenderer({
  buttons,
  record,
  model,
  recordId,
  inline = false,
}: {
  buttons: StatButtonElement[]
  record?: Record<string, unknown>
  model: string
  recordId?: number
  /** When true, render in sheet header (no bottom border). */
  inline?: boolean
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const primary = buttons.slice(0, MAX_BUTTON_BOX)
  const overflow = buttons.slice(MAX_BUTTON_BOX)

  return (
    <div
      className={
        inline
          ? 'o_form_button_box'
          : 'flex flex-wrap gap-1 border-b border-border-subtle pb-3 mb-3'
      }
    >
      {primary.map((btn, bi) => (
        <StatButton key={bi} button={btn} record={record} model={model} recordId={recordId} />
      ))}
      {overflow.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOverflowOpen(!overflowOpen)}
            onBlur={() => setTimeout(() => setOverflowOpen(false), 150)}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-xs text-text-secondary hover:bg-hover"
          >
            More ▾
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border-subtle bg-surface shadow-lg">
              {overflow.map((btn, bi) => (
                <div key={bi} className="px-2 py-1">
                  <StatButton button={btn} record={record} model={model} recordId={recordId} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const TITLE_FIELD_NAMES = new Set(['name', 'display_name'])

function isTitleField(el: FormElement): el is FieldElement {
  if (el.type !== 'field') return false
  if (!TITLE_FIELD_NAMES.has(el.name)) return false
  const cls = el.class ?? ''
  return !!(el.nolabel || cls.includes('oe_inline') || cls.includes('text-break'))
}

function isAvatarField(el: FormElement): el is FieldElement {
  if (el.type !== 'field') return false
  const cls = el.class ?? ''
  if (cls.includes('oe_avatar')) return true
  return (
    (el.widget === 'image' || el.widget === 'contact_image') && /^(image_|avatar)/.test(el.name)
  )
}

function isGroupColumnsLayout(elements: FormElement[]): boolean {
  const items = elements.filter((e) => e.type !== 'newline')
  if (items.length < 2) return false
  return items.every((e) => e.type === 'group')
}

/** Tailwind 12-column spans for HR/Odoo `col-lg-N` layout (static classes for JIT). */
const LAYOUT_COL_SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
}

function layoutColSpanClass(span?: number): string {
  const n = span ?? 12
  return LAYOUT_COL_SPAN[n] ?? 'lg:col-span-12'
}

function partitionSheetElements(elements: FormElement[]) {
  const buttonBoxes: ButtonBoxElement[] = []
  const titleElements: FormElement[] = []
  const avatarElements: FormElement[] = []
  const body: FormElement[] = []
  let titlePhase = true

  for (const el of elements) {
    if (el.type === 'button_box') {
      buttonBoxes.push(el)
      continue
    }
    if (el.type === 'title_block') {
      for (const child of el.elements) {
        if (isAvatarField(child)) avatarElements.push(child)
        else titleElements.push(child)
      }
      continue
    }
    if (titlePhase && isAvatarField(el)) {
      avatarElements.push(el)
      continue
    }
    if (titlePhase && isTitleField(el)) {
      titleElements.push(el)
      continue
    }
    if (titlePhase && el.type === 'group') {
      const inner = el.elements.filter((c) => c.type !== 'newline')
      if (inner.length === 1 && isTitleField(inner[0])) {
        titleElements.push(inner[0])
        continue
      }
      const avatars = inner.filter(isAvatarField)
      const titles = inner.filter(isTitleField)
      const rest = inner.filter((c) => !isAvatarField(c) && !isTitleField(c))
      if (avatars.length > 0 || titles.length > 0) {
        avatarElements.push(...avatars)
        titleElements.push(...titles)
        if (rest.length === 0) continue
        body.push({ ...el, elements: rest })
        continue
      }
    }
    titlePhase = false
    body.push(el)
  }

  return { buttonBoxes, titleElements, avatarElements, body }
}

function renderGroupItems(
  elements: FormElement[],
  ctx: Omit<NodeProps, 'elements'> & { groupCol?: number },
): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let colIndex = 0
  const maxCols = Math.max(1, Math.min(ctx.groupCol ?? 2, 6))

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]

    // newline: next field starts on a new row
    if (el.type === 'newline') {
      colIndex = 0
      result.push(<div key={`nl-${i}`} style={{ gridColumn: '1 / -1' }} aria-hidden />)
      continue
    }

    const colspan = el.type === 'field' ? (el.colspan ?? 1) : 1
    if (colIndex + colspan > maxCols) {
      colIndex = 0
      result.push(<div key={`wrap-${i}`} style={{ gridColumn: '1 / -1' }} aria-hidden />)
    }

    const itemKey = `${el.type === 'field' ? 'fld' : el.type}-${i}`
    const isField = el.type === 'field'

    if (!isField) {
      result.push(
        <div key={itemKey} style={{ gridColumn: '1 / -1' }}>
          <FormLayoutNode
            elements={[el]}
            record={ctx.record}
            fields={ctx.fields}
            model={ctx.model}
            recordId={ctx.recordId}
            editMode={ctx.editMode}
            onChange={ctx.onChange}
            onAction={ctx.onAction}
            onButtonAction={ctx.onButtonAction}
            level={ctx.level}
            groupCol={ctx.groupCol}
            session={ctx.session}
          />
        </div>,
      )
      continue
    }

    result.push(
      <div key={itemKey} className="o_group_item" style={{ display: 'contents' }}>
        <FormLayoutNode
          elements={[el]}
          record={ctx.record}
          fields={ctx.fields}
          model={ctx.model}
          recordId={ctx.recordId}
          editMode={ctx.editMode}
          onChange={ctx.onChange}
          onAction={ctx.onAction}
          onButtonAction={ctx.onButtonAction}
          level={ctx.level}
          groupCol={ctx.groupCol}
          fieldGridSpan={colspan > 1 ? colspan : undefined}
          session={ctx.session}
        />
      </div>,
    )
    colIndex += colspan
    if (colIndex >= maxCols) colIndex = 0
  }
  return result
}

function FormLayoutNode({
  elements,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  onAction,
  onButtonAction,
  level = 0,
  fieldGridSpan,
  session,
}: NodeProps) {
  return (
    <>
      {elements.map((el, i) => {
        switch (el.type) {
          case 'header':
            return null
          case 'sheet': {
            const { buttonBoxes, titleElements, avatarElements, body } = partitionSheetElements(
              el.elements,
            )
            const hasTop =
              buttonBoxes.length > 0 || titleElements.length > 0 || avatarElements.length > 0
            return (
              <div key={`sheet-${i}`}>
                {hasTop && (
                  <div className="o_form_sheet_top">
                    {avatarElements.length > 0 && (
                      <div className="o_form_avatar">
                        <FormLayoutNode
                          elements={avatarElements}
                          record={record}
                          fields={fields}
                          model={model}
                          recordId={recordId}
                          editMode={editMode}
                          onChange={onChange}
                          onAction={onAction}
                          onButtonAction={onButtonAction}
                          session={session}
                          level={level + 1}
                        />
                      </div>
                    )}
                    <div className="o_form_sheet_top_content">
                      {titleElements.length > 0 && (
                        <div className="o_form_title">
                          <FormLayoutNode
                            elements={titleElements}
                            record={record}
                            fields={fields}
                            model={model}
                            recordId={recordId}
                            editMode={editMode}
                            onChange={onChange}
                            onAction={onAction}
                            onButtonAction={onButtonAction}
                            session={session}
                            level={level + 1}
                          />
                        </div>
                      )}
                      {buttonBoxes.map((bb, bbi) => {
                        const visibleBtns = bb.buttons.filter((b) =>
                          isButtonVisible(b, record, session),
                        )
                        if (visibleBtns.length === 0) return null
                        return (
                          <ButtonBoxRenderer
                            key={`sheet-bbox-${bbi}`}
                            buttons={visibleBtns}
                            record={record}
                            model={model}
                            recordId={recordId}
                            inline
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
                <FormLayoutNode
                  elements={body}
                  record={record}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                  editMode={editMode}
                  onChange={onChange}
                  onAction={onAction}
                  onButtonAction={onButtonAction}
                  session={session}
                  level={level + 1}
                />
              </div>
            )
          }
          case 'title_block':
            return (
              <div key={`title-${i}`} className="o_form_title">
                <FormLayoutNode
                  elements={el.elements}
                  record={record}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                  editMode={editMode}
                  onChange={onChange}
                  onAction={onAction}
                  onButtonAction={onButtonAction}
                  session={session}
                  level={level + 1}
                />
              </div>
            )
          case 'button': {
            const btn = el as ButtonElement
            if (!isButtonVisible(btn, record, session)) return null
            if (editMode) return null
            return (
              <div key={`btn-${i}`} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onButtonAction?.(btn)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    btn.class?.includes('btn-primary')
                      ? 'bg-accent text-on-accent hover:bg-accent/90 rounded'
                      : 'text-text-secondary hover:bg-hover rounded border border-border-default'
                  }`}
                >
                  {btn.icon && <span className="mr-1">{btn.icon}</span>}
                  {btn.string || btn.name}
                </button>
              </div>
            )
          }
          case 'button_box': {
            const bbe = el as ButtonBoxElement
            const visibleBtns = bbe.buttons.filter((b) => isButtonVisible(b, record, session))
            if (visibleBtns.length === 0) return null
            return (
              <ButtonBoxRenderer
                key={`bbox-${i}`}
                buttons={visibleBtns}
                record={record}
                model={model}
                recordId={recordId}
              />
            )
          }
          case 'layout_row':
            return (
              <div
                key={`layout-row-${i}`}
                id={el.id}
                className="o_form_layout_row mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6"
              >
                {el.columns.map((col, ci) => (
                  <div
                    key={`layout-col-${ci}`}
                    id={col.id}
                    className={`o_form_layout_column min-w-0 ${layoutColSpanClass(col.colSpan)} ${col.class?.includes('o_hr_column') ? 'o_hr_column' : ''}`}
                  >
                    <FormLayoutNode
                      elements={col.elements}
                      record={record}
                      fields={fields}
                      model={model}
                      recordId={recordId}
                      editMode={editMode}
                      onChange={onChange}
                      onAction={onAction}
                      onButtonAction={onButtonAction}
                      session={session}
                      level={level + 1}
                    />
                  </div>
                ))}
              </div>
            )
          case 'layout_column':
            return null
          case 'group': {
            if (!passesXmlGroups(el.groups, session)) return null
            if (evalModifier(el.invisible, record)) return null
            const col = Math.max(1, Math.min(el.col ?? 2, 6))

            if (isGroupColumnsLayout(el.elements)) {
              const childGroups = el.elements.filter((c): c is GroupElement => c.type === 'group')
              return (
                <div key={`grp-${i}`} className="o_group o_group_nested">
                  {el.string && (
                    <div className="o_horizontal_separator" style={{ gridColumn: '1 / -1' }}>
                      {el.string}
                    </div>
                  )}
                  <div
                    className="o_group_nested_row"
                    style={{
                      gridTemplateColumns: `repeat(${childGroups.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {childGroups.map((child, ci) => {
                      if (evalModifier(child.invisible, record)) return null
                      const childCol = Math.max(1, Math.min(child.col ?? 1, 6))
                      return (
                        <div
                          key={`grp-${i}-col-${ci}`}
                          className="o_group_col"
                          data-cols={childCol}
                        >
                          {child.string && (
                            <div className="o_horizontal_separator mb-2">{child.string}</div>
                          )}
                          {renderGroupItems(child.elements, {
                            record,
                            fields,
                            model,
                            recordId,
                            editMode,
                            onChange,
                            onAction,
                            onButtonAction,
                            level: level + 1,
                            groupCol: childCol,
                            session,
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={`grp-${i}`}
                className="o_group"
                style={{ gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))` }}
                data-cols={col}
              >
                {el.string && (
                  <div className="o_horizontal_separator" style={{ gridColumn: '1 / -1' }}>
                    {el.string}
                  </div>
                )}
                {renderGroupItems(el.elements, {
                  record,
                  fields,
                  model,
                  recordId,
                  editMode,
                  onChange,
                  onAction,
                  onButtonAction,
                  level: level + 1,
                  groupCol: col,
                  session,
                })}
              </div>
            )
          }
          case 'notebook':
            return (
              <NotebookRenderer
                key={`nb-${i}`}
                pages={el.pages}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
                editMode={editMode}
                onChange={onChange}
                onAction={onAction}
                onButtonAction={onButtonAction}
                level={level}
                session={session}
              />
            )
          case 'field': {
            const meta = fields[el.name]
            if (!meta) return null
            if (!passesXmlGroups(el.groups, session)) return null
            if (evalModifier(el.invisible, record)) return null
            if (editMode && SYSTEM_FIELDS.has(el.name)) return null
            const Widget = getFieldWidget(el, meta.type)
            let fieldReadonly = !!meta.readonly
            if (el.readonly !== undefined) {
              fieldReadonly =
                typeof el.readonly === 'string' ? evalModifier(el.readonly, record) : el.readonly
            }
            const readOnly = !editMode || fieldReadonly
            let fieldRequired = !!meta.required
            if (el.required !== undefined) {
              fieldRequired =
                typeof el.required === 'string' ? evalModifier(el.required, record) : el.required
            }
            const deco = getDecoClass(el as unknown as Record<string, unknown>, record)
            const span = fieldGridSpan ?? el.colspan
            const colSpanStyle = span ? { gridColumn: `span ${span}` } : undefined
            if (el.nolabel) {
              return (
                <div key={`fld-${i}`} className={deco} style={colSpanStyle}>
                  <Widget
                    field={el}
                    value={record?.[el.name]}
                    onChange={(v) => onChange?.(el.name, v)}
                    readOnly={readOnly}
                    meta={meta}
                    record={record}
                    model={model}
                    recordId={recordId}
                  />
                </div>
              )
            }
            // Boolean fields: checkbox first, then label
            if (meta.type === 'boolean') {
              return (
                <div
                  key={`bool-${i}`}
                  className={`flex items-center gap-2 ${deco ?? ''}`}
                  style={colSpanStyle}
                >
                  <Widget
                    field={el}
                    value={record?.[el.name]}
                    onChange={(v) => onChange?.(el.name, v)}
                    readOnly={readOnly}
                    meta={meta}
                    record={record}
                    model={model}
                    recordId={recordId}
                  />
                  <label className="o_form_label">
                    {el.string || meta.string || el.name}
                    {editMode && fieldRequired && <span className="ml-0.5 text-danger">*</span>}
                    {meta.help && <HelpPopover text={meta.help} />}
                  </label>
                </div>
              )
            }
            return (
              <div key={`fld-${i}`} className={`o_inner_group ${deco ?? ''}`} style={colSpanStyle}>
                <label className="o_form_label py-1">
                  {el.string || meta.string || el.name}
                  {editMode && fieldRequired && <span className="ml-0.5 text-danger">*</span>}
                  {meta.help && <HelpPopover text={meta.help} />}
                </label>
                <Widget
                  field={el}
                  value={record?.[el.name]}
                  onChange={(v) => onChange?.(el.name, v)}
                  readOnly={readOnly}
                  meta={meta}
                  record={record}
                  model={model}
                  recordId={recordId}
                />
              </div>
            )
          }
          case 'separator':
            return (
              <div key={`sep-${i}`} className="o_horizontal_separator col-span-full">
                {el.string}
              </div>
            )
          case 'newline':
            return <div key={`nl-${i}`} className="col-span-full" />
          case 'label':
            return (
              <span key={`lbl-${i}`} className="text-sm font-medium text-text-primary">
                {el.string}
              </span>
            )
          default:
            return null
        }
      })}
    </>
  )
}

const SYSTEM_FIELDS = new Set([
  'id',
  'create_date',
  'create_uid',
  'write_date',
  'write_uid',
  'display_name',
])

function FormTimestamps({ record }: { record?: Record<string, unknown> }) {
  if (!record) return null
  const fmtDate = (v: unknown) => {
    if (!v) return ''
    const s = String(v).slice(0, 19).replace('T', ' ')
    return s || ''
  }
  const fmtUid = (v: unknown) => {
    if (!v) return ''
    if (Array.isArray(v) && v.length >= 2) return String(v[1])
    return String(v)
  }
  const items = [
    { label: 'Created', date: record.create_date, uid: record.create_uid },
    { label: 'Modified', date: record.write_date, uid: record.write_uid },
  ]
  if (!items.some((i) => i.date)) return null
  return (
    <div className="mt-4 border-t border-border-subtle pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
      {items.map(({ label, date, uid }) =>
        date ? (
          <span key={label}>
            {label}: {fmtDate(date)}
            {fmtUid(uid) ? ` by ${fmtUid(uid)}` : ''}
          </span>
        ) : null,
      )}
    </div>
  )
}
