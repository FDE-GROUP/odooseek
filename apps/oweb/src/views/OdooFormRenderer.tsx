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
import { callKw } from '../lib/api'
import { evalModifier, getDecorationClass as getDecoClass } from '../lib/expression-evaluator'
import type {
  ButtonBoxElement,
  ButtonElement,
  FormElement,
  HeaderElement,
  OdooFieldMeta,
  StatButtonElement,
} from '../lib/odoo-types'
import { parseFormXml } from '../lib/xml-parser'
import { getFieldWidget } from './field-widgets'

export interface OdooFormRendererRef {
  save: () => Promise<void>
}

interface FormRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  recordId?: number
  onRecordCreated?: (newId: number) => void
  onDirtyChange?: (dirty: boolean) => void
}

export const OdooFormRenderer = forwardRef(function OdooFormRenderer(
  { model, arch, fields, recordId, onRecordCreated, onDirtyChange }: FormRendererProps,
  ref: React.Ref<OdooFormRendererRef>,
) {
  const queryClient = useQueryClient()
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
      callKw<Record<string, unknown>>(model, 'default_get', [Object.keys(fields)], {})
        .then((defaults) => {
          setFormValues(defaults)
          baselineRef.current = { ...defaults }
          setEditMode(true)
          triggerOnchange([], defaults)
        })
        .catch(() => {
          setEditMode(true)
        })
    }
  }, [model, recordId, triggerOnchange, record, fields])

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
        queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
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

  const handleChange = (name: string, value: unknown) => {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value }
      triggerOnchange([name], next)
      return next
    })
  }

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

  useEffect(() => {
    if (!editMode) return
    try {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        localStorage.removeItem(draftKey)
        setFormValues(JSON.parse(draft))
      }
    } catch {
      // invalid draft
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    (btn: ButtonElement) => {
      if (!newRecordId) return

      const executeAction = () => {
        if (btn.buttonType === 'edit') {
          if (record?.[0]) {
            setFormValues({ ...record[0] })
            setEditMode(true)
          }
          return
        }

        if (btn.buttonType === 'object') {
          callKw(model, btn.name, [[newRecordId]])
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
            })
            .catch((err: unknown) => {
              setSaveError(err instanceof Error ? err.message : 'Action failed')
            })
        } else if (btn.buttonType === 'action') {
          const actionId = Number(btn.name)
          callKw('ir.actions.server', 'run', [[actionId]])
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
            })
            .catch((err: unknown) => {
              setSaveError(err instanceof Error ? err.message : 'Action failed')
            })
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
    [model, newRecordId, record, recordId, queryClient, confirmDialog],
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

  if (!formLayout)
    return <div className="p-6 text-sm text-text-muted">Failed to parse form XML</div>

  const currentRecord = editMode ? formValues : record?.[0]

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <HeaderBar
        headerElement={headerElement}
        stateField={fields.state}
        currentRecord={currentRecord}
        onAction={handleActionButton}
        onStatusChange={handleStatusChange}
        editMode={editMode}
        isDirty={isDirty}
        justSaved={justSaved}
        saveError={saveError}
        onEdit={() => {
          setFormValues(record?.[0] ? { ...record[0] } : { ...formValues })
          setEditMode(true)
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={saveMutation.isPending}
      />

      {saveError && (
        <div className="mx-auto max-w-[860px] mt-2 rounded border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs text-red-400">
          {saveError}
        </div>
      )}
      {warning && (
        <div className="mx-auto max-w-[860px] mt-2 rounded border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs text-yellow-400">
          <span className="font-medium">{warning.title}</span>: {warning.message}
        </div>
      )}

      <div ref={formRef} className="flex-1 overflow-auto px-6 py-0">
        <div className="o_form_sheet mx-auto max-w-[860px] border-y border-border-subtle bg-surface px-6 py-5">
          <FormLayoutNode
            elements={nonHeaderElements}
            record={currentRecord}
            fields={fields}
            model={model}
            recordId={recordId}
            editMode={editMode}
            onChange={handleChange}
          />
          {recordId && <FormTimestamps record={record?.[0]} />}
        </div>
        <div className="mx-auto max-w-[860px]">
          <ActivityPanel model={model} recordId={recordId} />
          <Chatter model={model} recordId={recordId} />
        </div>
      </div>
    </div>
  )
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
        ? 'bg-accent text-white hover:bg-accent/90 rounded'
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
  const stateSelection = stateField?.selection ?? []
  const stateValue = currentRecord?.state as string | undefined
  const stateIdx = stateSelection.findIndex(([k]) => k === stateValue)

  const visibleButtons = headerElement
    ? headerElement.buttons.filter((btn) => isButtonVisible(btn, currentRecord))
    : []

  const hasContent = stateSelection.length > 1 || visibleButtons.length > 0 || editMode

  if (!hasContent) {
    return (
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-2">
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
    <div className="border-b border-border-subtle bg-surface px-6 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {stateSelection.length > 1 && (
            <div className="flex items-center">
              {stateSelection.map(([key, label], i) => {
                const isCurrent = key === stateValue
                const isPast = stateIdx >= 0 && i < stateIdx
                const isFirst = i === 0
                const isLast = i === stateSelection.length - 1
                return (
                  <div key={key} className="flex items-center">
                    <button
                      type="button"
                      disabled={editMode || isCurrent}
                      onClick={() => onStatusChange?.(key)}
                      className={`px-3 py-1 text-[11px] font-medium ${
                        isCurrent
                          ? 'bg-accent text-white'
                          : isPast
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                      } ${isFirst && !isCurrent ? 'rounded-l' : ''} ${isLast && !isCurrent ? 'rounded-r' : ''} ${isCurrent && isFirst ? 'rounded-l' : ''} ${isCurrent && isLast ? 'rounded-r' : ''} ${!isCurrent && !editMode ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {label}
                    </button>
                  </div>
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
        <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Invalid
        </span>
      )}
      {isDirty && (
        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Unsaved
        </span>
      )}
      {justSaved && !isDirty && (
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
            className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent/90"
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
): boolean {
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
    if (loading || !recordId) return
    if (button.confirm && !window.confirm(button.confirm)) return
    setLoading(true)
    try {
      if (button.buttonType === 'object') {
        await callKw(model, button.name, [[recordId]])
      } else if (button.buttonType === 'action') {
        await callKw('ir.actions.server', 'run', [[Number(button.name)]])
      }
      queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
    } catch {
      // action failed silently
    } finally {
      setLoading(false)
    }
  }, [button, loading, model, recordId, queryClient])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded px-3 py-1.5 text-xs text-text-secondary hover:bg-hover transition-colors disabled:opacity-50"
    >
      {button.icon && <i className={`fa ${button.icon} text-sm text-text-muted`} />}
      {value !== '' && <span className="font-semibold text-text-primary">{value}</span>}
      <span>{text}</span>
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
  level?: number
}

function NotebookRenderer({
  pages,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  level,
}: {
  pages: { string: string; invisible?: string; elements: FormElement[] }[]
  record?: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId?: number
  editMode?: boolean
  onChange?: (n: string, v: unknown) => void
  level: number
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
    <div className="mt-4">
      <div className="flex border-b border-border-subtle">
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
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
            )}
          </button>
        ))}
      </div>
      <div className="py-4">
        {visiblePages[safeActive] && (
          <FormLayoutNode
            elements={visiblePages[safeActive].elements}
            record={record}
            fields={fields}
            model={model}
            recordId={recordId}
            editMode={editMode}
            onChange={onChange}
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
        className="inline-flex items-center text-[10px] text-blue-400 cursor-help hover:text-blue-500"
      >
        ?
      </button>
      {open &&
        btnRef.current &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onMouseDown={() => setOpen(false)}>
            <div
              className="absolute z-[10000] mt-1 w-72 rounded-lg border border-border-subtle bg-surface p-3 text-xs leading-relaxed text-text-secondary shadow-lg"
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
}: {
  buttons: StatButtonElement[]
  record?: Record<string, unknown>
  model: string
  recordId?: number
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const primary = buttons.slice(0, MAX_BUTTON_BOX)
  const overflow = buttons.slice(MAX_BUTTON_BOX)

  return (
    <div className="flex flex-wrap gap-1 border-b border-border-subtle pb-3 mb-3">
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

function FormLayoutNode({
  elements,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  level = 0,
}: NodeProps) {
  return (
    <>
      {elements.map((el, i) => {
        switch (el.type) {
          case 'header':
            return null
          case 'sheet':
            return (
              <FormLayoutNode
                key={i}
                elements={el.elements}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
                editMode={editMode}
                onChange={onChange}
                level={level + 1}
              />
            )
          case 'button':
            return null
          case 'button_box': {
            const bbe = el as ButtonBoxElement
            const visibleBtns = bbe.buttons.filter((b) => isButtonVisible(b, record))
            if (visibleBtns.length === 0) return null
            return (
              <ButtonBoxRenderer
                key={i}
                buttons={visibleBtns}
                record={record}
                model={model}
                recordId={recordId}
              />
            )
          }
          case 'group': {
            if (evalModifier(el.invisible, record)) return null
            const cols = el.col ?? 2
            return (
              <div key={i} className="mb-4">
                {el.string && (
                  <div className="mb-2 text-xs font-semibold text-text-secondary">{el.string}</div>
                )}
                <div
                  className="grid gap-x-6 gap-y-2"
                  style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                  <FormLayoutNode
                    elements={el.elements}
                    record={record}
                    fields={fields}
                    model={model}
                    recordId={recordId}
                    editMode={editMode}
                    onChange={onChange}
                    level={level + 1}
                  />
                </div>
              </div>
            )
          }
          case 'notebook':
            return (
              <NotebookRenderer
                key={i}
                pages={el.pages}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
                editMode={editMode}
                onChange={onChange}
                level={level}
              />
            )
          case 'field': {
            const meta = fields[el.name]
            if (!meta) return null
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
            const colSpanStyle = el.colspan ? { gridColumn: `span ${el.colspan}` } : undefined
            if (el.nolabel) {
              return (
                <div key={i} className={deco} style={colSpanStyle}>
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
                  key={i}
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
                  <label className="text-xs font-medium text-text-secondary">
                    {el.string || meta.string || el.name}
                    {editMode && fieldRequired && <span className="ml-0.5 text-red-400">*</span>}
                    {meta.help && <HelpPopover text={meta.help} />}
                  </label>
                </div>
              )
            }
            return (
              <div
                key={i}
                className={`grid items-baseline gap-x-3 ${deco ?? ''}`}
                style={{ gridTemplateColumns: 'auto 1fr', ...colSpanStyle }}
              >
                <label className="truncate text-xs font-medium text-text-secondary py-1 text-right">
                  {el.string || meta.string || el.name}
                  {editMode && fieldRequired && <span className="ml-0.5 text-red-400">*</span>}
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
            return <hr key={i} className="my-2 border-border-subtle" />
          case 'newline':
            return <div key={i} className="col-span-full" />
          case 'label':
            return (
              <span key={i} className="text-sm font-medium text-text-primary">
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
