import type {
  ButtonElement,
  FormElement,
  HeaderElement,
  OdooFieldMeta,
} from '@odooseek/odoo-client'
import {
  callButton,
  callKw,
  evalModifier,
  isFieldValueEmpty,
  type OdooAction,
  parseFormXml,
  validateFieldValue,
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
import { ActivityPanel } from '../components/ActivityPanel'
import { Chatter } from '../components/Chatter'
import { useConfirmDialog } from '../components/ConfirmDialog'
import type { FormEditActionsProps } from '../components/FormEditActions'
import { FormSheetSkeleton } from '../components/Skeleton'
import type { WizardStep } from '../components/WizardDialog'
import { WizardDialog } from '../components/WizardDialog'
import { mergeVersionPreviewIntoRecord, useHrVersion } from '../hooks/HrVersionProvider'
import { useAuth } from '../lib/auth'
import { readRecordWithFieldFallback, resolveFormReadFields } from '../lib/form-read-fields'
import { HeaderBar } from './form/FormHeaderBar'
import { FormLayoutNode } from './form/FormLayoutNode'
import { FormTimestamps } from './form/FormTimestamps'
import {
  isWizardModel,
  normalizeOnchangeValue,
  normalizeValuesForRpc,
  validateAllFields,
  wizardBtn,
} from './form/formUtils'
import { Rainbowman } from './widgets/Rainbowman'

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
  /** Render Edit/Save/Cancel in ControlPanel via `onEditActionsChange` instead of the form chrome. */
  externalEditActions?: boolean
  onEditActionsChange?: (actions: FormEditActionsProps | null) => void
}

export type { FormEditActionsProps }

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
    externalEditActions = false,
    onEditActionsChange,
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
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map())
  const [justSaved, setJustSaved] = useState(false)
  const [showRainbowman, setShowRainbowman] = useState(false)
  const [wizardModel, setWizardModel] = useState<string | null>(null)
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([])
  const [warning, setWarning] = useState<{ title: string; message: string } | null>(null)
  const onchangeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const baselineRef = useRef<Record<string, unknown>>({})
  const formRef = useRef<HTMLDivElement>(null)
  const newRecordId = !recordId ? 0 : recordId

  const headerElement = formLayout.elements.find((e): e is HeaderElement => e.type === 'header')
  const nonHeaderElements = formLayout.elements.filter((e) => e.type !== 'header')

  const { fieldLabelMap, invisibleFieldMap } = useMemo(() => {
    const labelMap: Record<string, string> = {}
    const invisibleMap = new Map<string, string>()
    const walk = (elements: FormElement[]) => {
      for (const el of elements) {
        switch (el.type) {
          case 'field':
            labelMap[el.name] = el.string || fields[el.name]?.string || el.name
            if (el.invisible) {
              invisibleMap.set(
                el.name,
                typeof el.invisible === 'string' ? el.invisible : String(el.invisible),
              )
            }
            break
          case 'group':
            walk(el.elements)
            break
          case 'sheet':
          case 'title_block':
            walk(el.elements)
            break
          case 'layout_row':
            for (const col of el.columns) walk(col.elements)
            break
          case 'notebook':
            for (const page of el.pages) walk(page.elements)
            break
        }
      }
    }
    walk(formLayout.elements)
    return { fieldLabelMap: labelMap, invisibleFieldMap: invisibleMap }
  }, [formLayout.elements, fields])

  // Filter out invisible fields from the raw missing set
  const effectiveMissingFields = useMemo(() => {
    if (missingFields.size === 0) return missingFields
    const filtered = new Set<string>()
    for (const name of missingFields) {
      const invisibleExpr = invisibleFieldMap.get(name)
      if (invisibleExpr && evalModifier(invisibleExpr, formValues)) continue
      filtered.add(name)
    }
    return filtered
  }, [missingFields, invisibleFieldMap, formValues])

  // Filter out invisible fields from type errors
  const effectiveFieldErrors = useMemo(() => {
    if (fieldErrors.size === 0) return fieldErrors
    const filtered = new Map(fieldErrors)
    for (const name of fieldErrors.keys()) {
      const invisibleExpr = invisibleFieldMap.get(name)
      if (invisibleExpr && evalModifier(invisibleExpr, formValues)) filtered.delete(name)
    }
    return filtered
  }, [fieldErrors, invisibleFieldMap, formValues])

  const readFields = useMemo(
    () => resolveFormReadFields(formLayout.elements, fields, session ?? undefined),
    [formLayout.elements, fields, session],
  )

  const {
    data: record,
    isLoading: recordLoading,
    isError: recordError,
    error: recordErrorDetail,
  } = useQuery({
    queryKey: ['odoo', 'read', model, recordId, readFields],
    queryFn: () => readRecordWithFieldFallback(model, recordId as number, readFields),
    enabled: !!recordId && readFields.length > 0,
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
        for (const k of readFields) {
          const meta = fields[k]
          fieldsSpec[k] = meta?.onChange ? { onChange: true } : {}
        }
        const result = await callKw<{
          value?: Record<string, unknown>
          warning?: { title: string; message: string; type: string }
        }>(
          model,
          'onchange',
          [
            newRecordId ? [newRecordId] : [],
            normalizeValuesForRpc(values, fields),
            fieldNames,
            fieldsSpec,
          ],
          {},
        )
        if (result?.value) {
          const onchangeValues = result.value
          const normalized: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(onchangeValues))
            normalized[k] = normalizeOnchangeValue(v, fields[k]?.type)
          setFormValues((prev) => ({ ...prev, ...normalized }))
          // Re-validate fields changed by onchange
          setMissingFields((prev) => {
            const next = new Set(prev)
            for (const [k, v] of Object.entries(onchangeValues)) {
              const meta = fields[k]
              if (!meta?.required) {
                next.delete(k)
                continue
              }
              const norm = normalizeOnchangeValue(v, meta.type)
              if (isFieldValueEmpty(norm, meta.type)) {
                next.add(k)
              } else {
                next.delete(k)
              }
            }
            return next
          })
          // Re-validate type errors for onchange fields
          setFieldErrors((prev) => {
            const next = new Map(prev)
            for (const [k, v] of Object.entries(onchangeValues)) {
              const meta = fields[k]
              const norm = normalizeOnchangeValue(v, meta?.type)
              const typeErr = meta ? validateFieldValue(norm, meta) : null
              if (typeErr) next.set(k, typeErr)
              else next.delete(k)
            }
            return next
          })
        }
        if (result?.warning) {
          setWarning(result.warning)
          setTimeout(() => setWarning(null), 5000)
        }
      }, 300)
    },
    [model, newRecordId, fields, readFields],
  )

  useEffect(() => {
    if (!recordId && !record) {
      callKw<Record<string, unknown>>(model, 'default_get', [readFields], { context })
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
          const { missing, errors } = validateAllFields(fields, merged)
          setMissingFields(missing)
          setFieldErrors(errors)
          triggerOnchange([], merged)
        })
        .catch(() => {
          setSaveError('Failed to load defaults. Some fields may be empty.')
          setTimeout(() => setSaveError(null), 5000)
          setEditMode(true)
        })
    }
  }, [model, recordId, triggerOnchange, record, readFields, context])

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const normalized = normalizeValuesForRpc(values, fields)
      return newRecordId
        ? callKw(model, 'write', [[newRecordId], normalized])
        : callKw(model, 'create', [normalized])
    },
    onSuccess: (result) => {
      if (!newRecordId && typeof result === 'number') {
        onRecordCreated?.(result)
        setEditMode(false)
      } else {
        baselineRef.current = { ...formValues }
        const invalidateKey = newRecordId
          ? ['odoo', 'read', model, newRecordId]
          : ['odoo', 'read', model, recordId]
        queryClient.invalidateQueries({ queryKey: invalidateKey })
        setEditMode(false)
      }
      setMissingFields(new Set())
      setFieldErrors(new Map())
      // Clear draft on successful save
      try {
        localStorage.removeItem(`form_draft_${model}_${recordId ?? 'new'}`)
      } catch {
        // ignore
      }
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    },
  })

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      setFormValues((prev) => {
        const next = { ...prev, [name]: value }
        triggerOnchange([name], next)
        return next
      })
      const meta = fields[name]
      setMissingFields((prev) => {
        if (!meta?.required) return prev
        const hadBefore = prev.has(name)
        const shouldHave = isFieldValueEmpty(value, meta.type)
        if (hadBefore === shouldHave) return prev
        const next = new Set(prev)
        if (shouldHave) next.add(name)
        else next.delete(name)
        return next
      })
      setFieldErrors((prev) => {
        const err = validateFieldValue(value, meta)
        const hadBefore = prev.has(name)
        if (!err && !hadBefore) return prev
        const next = new Map(prev)
        if (err) next.set(name, err)
        else next.delete(name)
        return next
      })
    },
    [triggerOnchange, fields],
  )

  const scrollToFirstError = useCallback(() => {
    const first =
      effectiveMissingFields.values().next().value || effectiveFieldErrors.keys().next().value
    if (first) {
      formRef.current
        ?.querySelector(`[data-field-name="${CSS.escape(first as string)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [effectiveMissingFields, effectiveFieldErrors])

  const handleSave = useCallback(async (): Promise<void> => {
    if (effectiveMissingFields.size > 0 || effectiveFieldErrors.size > 0) {
      const parts: string[] = []
      for (const name of effectiveMissingFields) {
        parts.push(`• ${fieldLabelMap[name] || name} is required`)
      }
      for (const [name, msg] of effectiveFieldErrors) {
        parts.push(`• ${fieldLabelMap[name] || name}: ${msg}`)
      }
      setSaveError(parts.join('\n'))
      scrollToFirstError()
      return
    }
    setSaveError(null)
    try {
      await saveMutation.mutateAsync(formValues)
    } catch {
      // onError already handled by useMutation
    }
  }, [
    effectiveMissingFields,
    effectiveFieldErrors,
    formValues,
    saveMutation,
    fieldLabelMap,
    scrollToFirstError,
  ])

  const handleCancel = useCallback(() => {
    setFormValues({ ...baselineRef.current })
    setEditMode(false)
    setMissingFields(new Set())
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
        const c: Record<string, unknown> = {
          active_model: model,
          active_id: newRecordId,
          active_ids: [newRecordId],
        }
        if (btn.context) {
          try {
            const parsed = JSON.parse(btn.context.replace(/'/g, '"'))
            Object.assign(c, parsed)
          } catch {
            /* skip malformed context */
          }
        }
        try {
          const { loadAction } = await import('@odooseek/odoo-client')
          const action = await loadAction(btn.name, c)
          if (!action) return
          if (isWizardModel(action.res_model)) {
            const resModel = action.res_model ?? ''
            const b = wizardBtn(resModel)
            setWizardModel(resModel)
            setWizardSteps([
              {
                title: action.display_name || action.name || 'Wizard',
                fields: [],
                buttons: [{ label: b.label, type: 'object', name: b.name }],
              },
            ])
            return
          }
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
            const mergedContext = { ...context }
            if (btn.context) {
              try {
                const parsed = JSON.parse((btn.context as string).replace(/'/g, '"'))
                Object.assign(mergedContext, parsed)
              } catch {
                /* skip malformed context */
              }
            }
            const result = await callButton<OdooAction | false>(model, btn.name, [[id]], {
              context: mergedContext,
            })
            queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, id] })
            if (btn.name === 'action_set_won_rainbowman' || btn.name === 'action_set_won') {
              setShowRainbowman(true)
            }
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
      const stateField = fields.stage_id ?? fields.state
      if (!stateField) return
      const fieldName = fields.stage_id ? 'stage_id' : 'state'
      const writeVal = stateField.type === 'many2one' ? Number(value) : value
      await callKw(model, 'write', [[recordId], { [fieldName]: writeVal }])
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
  const awaitingRecord = !!recordId && (recordLoading || (!recordError && !record?.[0]))

  const handleEdit = useCallback(() => {
    if (versionReadOnly) return
    const values = record?.[0] ? { ...record[0] } : { ...formValues }
    setFormValues(values)
    setEditMode(true)
    const { missing, errors } = validateAllFields(fields, values)
    setMissingFields(missing)
    setFieldErrors(errors)
    setSaveError(null)
  }, [versionReadOnly, record, formValues, fields])

  const isCreating = !recordId && !newRecordId
  const showExternalEditActions =
    (isCreating || (!!recordId && !awaitingRecord && !recordError && !!record?.[0])) &&
    !versionReadOnly

  useEffect(() => {
    if (!externalEditActions || !onEditActionsChange) return
    if (!showExternalEditActions) {
      onEditActionsChange(null)
      return
    }
    onEditActionsChange({
      editMode: effectiveEditMode,
      isDirty,
      justSaved,
      saveError,
      onEdit: handleEdit,
      onSave: handleSave,
      onCancel: handleCancel,
      isSaving: saveMutation.isPending,
      compact: true,
    })
  }, [
    externalEditActions,
    onEditActionsChange,
    showExternalEditActions,
    effectiveEditMode,
    isDirty,
    justSaved,
    saveError,
    saveMutation.isPending,
    handleEdit,
    handleSave,
    handleCancel,
  ])

  useEffect(() => {
    if (!externalEditActions || !onEditActionsChange) return
    return () => onEditActionsChange(null)
  }, [externalEditActions, onEditActionsChange])

  if (!formLayout)
    return <div className="p-6 text-sm text-text-muted">Failed to parse form XML</div>

  const formBody = (
    <div
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
      data-testid="odoo-form-view"
    >
      <HeaderBar
        headerElement={headerElement}
        stateField={fields.stage_id ?? fields.state}
        currentRecord={currentRecord}
        session={session}
        onAction={handleActionButton}
        onStatusChange={handleStatusChange}
        editMode={effectiveEditMode}
        isDirty={isDirty}
        justSaved={justSaved}
        saveError={saveError}
        hideActionButtons={externalEditActions}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={saveMutation.isPending}
      />

      {saveError && (
        <div className="o_form_sheet_bg mt-1 w-full rounded border border-danger/30 bg-danger/10 px-4 py-2 text-xs text-danger whitespace-pre-line">
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
        <div className={recordId ? 'o_form_main mt-2' : 'o_form_main o_form_main--solo'}>
          <div className="o_form_sheet_bg">
            {recordError ? (
              <div className="rounded border border-danger/30 bg-danger/10 px-4 py-6 text-sm text-danger">
                Failed to load record {recordId}:{' '}
                {recordErrorDetail instanceof Error ? recordErrorDetail.message : 'Unknown error'}
              </div>
            ) : awaitingRecord ? (
              <FormSheetSkeleton />
            ) : recordId && !record?.[0] ? (
              <div className="px-4 py-6 text-sm text-text-muted">
                Record {recordId} was not found or you may not have access.
              </div>
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
                  missingFields={effectiveMissingFields}
                  fieldErrors={effectiveFieldErrors}
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

  return (
    <>
      {formBody}
      {showRainbowman && newRecordId && (
        <Rainbowman
          model={model}
          recordId={newRecordId}
          onDismiss={() => setShowRainbowman(false)}
        />
      )}
      {wizardModel && (
        <WizardDialog
          open={wizardModel !== null}
          model={wizardModel}
          context={{ active_model: model, active_id: newRecordId, active_ids: [newRecordId] }}
          steps={wizardSteps}
          onDone={() => {
            setWizardModel(null)
            setWizardSteps([])
            queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, newRecordId] })
          }}
          onCancel={() => {
            setWizardModel(null)
            setWizardSteps([])
          }}
        />
      )}
    </>
  )
})
