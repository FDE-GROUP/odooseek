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
  type OdooAction,
  parseFormXml,
  RecordModel,
} from '@odooseek/odoo-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useRecordModel } from '../hooks/useRecordModel'
import { mergeVersionPreviewIntoRecord, useHrVersion } from '../hooks/HrVersionProvider'
import { useAuth } from '../lib/auth'
import { readRecordWithFieldFallback, resolveFormReadFields } from '../lib/form-read-fields'
import { HeaderBar } from './form/FormHeaderBar'
import { FormLayoutNode } from './form/FormLayoutNode'
import { FormTimestamps } from './form/FormTimestamps'
import { isWizardModel, wizardBtn } from './form/formUtils'
import { useFormLifecycle } from './form/useFormLifecycle'
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
  const formRef = useRef<HTMLDivElement>(null)
  const newRecordId = !recordId ? 0 : recordId

  // UI state not managed by RecordModel
  const [showRainbowman, setShowRainbowman] = useState(false)
  const [wizardModel, setWizardModel] = useState<string | null>(null)
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([])

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

  const readFields = useMemo(
    () => resolveFormReadFields(formLayout.elements, fields, session ?? undefined),
    [formLayout.elements, fields, session],
  )

  // ── RecordModel ─────────────────────────────────────────
  const recordModel = useMemo(
    () => new RecordModel({ model, fields, recordId, context, readFields }),
    [model, fields, recordId, readFields],
  )
  const snap = useRecordModel(recordModel)

  // Filter invisible fields from validation errors
  const effectiveMissingFields = useMemo(() => {
    if (snap.missingFields.size === 0) return snap.missingFields
    const filtered = new Set<string>()
    for (const name of snap.missingFields) {
      const invisibleExpr = invisibleFieldMap.get(name)
      if (invisibleExpr && evalModifier(invisibleExpr, snap.data)) continue
      filtered.add(name)
    }
    return filtered
  }, [snap.missingFields, invisibleFieldMap, snap.data])

  const effectiveFieldErrors = useMemo(() => {
    if (snap.fieldErrors.size === 0) return snap.fieldErrors
    const filtered = new Map(snap.fieldErrors)
    for (const name of snap.fieldErrors.keys()) {
      const invisibleExpr = invisibleFieldMap.get(name)
      if (invisibleExpr && evalModifier(invisibleExpr, snap.data)) filtered.delete(name)
    }
    return filtered
  }, [snap.fieldErrors, invisibleFieldMap, snap.data])

  const scrollToFirstError = useCallback(() => {
    const first =
      effectiveMissingFields.values().next().value || effectiveFieldErrors.keys().next().value
    if (first) {
      formRef.current
        ?.querySelector(`[data-field-name="${CSS.escape(first as string)}"]`)
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
  }, [effectiveMissingFields, effectiveFieldErrors])

  // ── Server data (React Query) ────────────────────────────
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

  // Load server data into model
  useEffect(() => {
    if (record?.[0]) recordModel.loadFromServer(record[0])
  }, [record, recordModel])

  // New record: load defaults
  useEffect(() => {
    if (!recordId && !record) {
      recordModel.loadDefaults().catch(() => {
        // Model sets saveError internally
      })
    }
  }, [model, recordId, record, recordModel])

  // ── Dirty change callback ────────────────────────────────
  useEffect(() => {
    onDirtyChange?.(snap.dirty)
  }, [snap.dirty, onDirtyChange])

  // ── Save / Cancel ────────────────────────────────────────
  const handleSave = useCallback(async (): Promise<void> => {
    const result = await recordModel.save()
    if (!result.success) {
      scrollToFirstError()
      return
    }
    if (result.newId) onRecordCreated?.(result.newId)
    queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model] })
    try {
      localStorage.removeItem(`form_draft_${model}_${recordId ?? 'new'}`)
    } catch {
      // ignore
    }
  }, [
    scrollToFirstError,
    recordModel,
    onRecordCreated,
    queryClient,
    model,
    recordId,
  ])

  const handleCancel = useCallback(() => {
    recordModel.discard()
  }, [recordModel])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  useFormLifecycle({
    model,
    recordId,
    editMode: snap.editMode,
    isDirty: snap.dirty,
    formValues: snap.data,
    handleSave,
    handleCancel,
    savePending: snap.saving,
    formRef,
    setFormValues: (values) => {
      for (const [k, v] of Object.entries(values)) recordModel.update(k, v)
    },
  })

  // ── Action buttons ───────────────────────────────────────
  const handleActionButton = useCallback(
    async (btn: ButtonElement) => {
      if (btn.special === 'cancel') {
        onAction?.({ type: 'ir.actions.act_window_close' } as OdooAction)
        return
      }

      if (btn.buttonType === 'edit') {
        if (record?.[0]) {
          recordModel.enterEdit(record[0])
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
        } catch {
          // action load failed
        }
        return
      }

      if (!recordId && !newRecordId) return

      const executeAction = async () => {
        const actionContext: Record<string, unknown> = {
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
            const mergedContext = { ...actionContext }
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
        } catch {
          // button action failed
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
    [model, newRecordId, record, recordId, queryClient, confirmDialog, onAction, recordModel],
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
    [model, recordId, fields, queryClient],
  )

  // ── Derived rendering state ──────────────────────────────
  const hrVersion = useHrVersion()
  const baseRecord = snap.editMode ? snap.data : record?.[0]
  const currentRecord = useMemo(() => {
    if (!baseRecord || !hrVersion?.isReadonlyPreview || !hrVersion.previewRecord) return baseRecord
    return mergeVersionPreviewIntoRecord(baseRecord, hrVersion.previewRecord)
  }, [baseRecord, hrVersion])
  const versionReadOnly = hrVersion?.isReadonlyPreview ?? false
  const effectiveEditMode = snap.editMode && !versionReadOnly
  const awaitingRecord = !!recordId && (recordLoading || (!recordError && !record?.[0]))

  const handleEdit = useCallback(() => {
    if (versionReadOnly) return
    recordModel.enterEdit(record?.[0] ?? snap.data)
  }, [versionReadOnly, record, snap.data, recordModel])

  const isCreating = !recordId && !newRecordId
  const showExternalEditActions =
    (isCreating || (!!recordId && !awaitingRecord && !recordError && !!record?.[0])) &&
    !versionReadOnly

  // ── External edit actions sync ───────────────────────────
  useEffect(() => {
    if (!externalEditActions || !onEditActionsChange) return
    if (!showExternalEditActions) {
      onEditActionsChange(null)
      return
    }
    onEditActionsChange({
      editMode: effectiveEditMode,
      isDirty: snap.dirty,
      justSaved: snap.justSaved,
      saveError: snap.saveError,
      onEdit: handleEdit,
      onSave: handleSave,
      onCancel: handleCancel,
      isSaving: snap.saving,
      compact: true,
    })
  }, [
    externalEditActions,
    onEditActionsChange,
    showExternalEditActions,
    effectiveEditMode,
    snap.dirty,
    snap.justSaved,
    snap.saveError,
    snap.saving,
    handleEdit,
    handleSave,
    handleCancel,
  ])

  useEffect(() => {
    if (!externalEditActions || !onEditActionsChange) return
    return () => onEditActionsChange(null)
  }, [externalEditActions, onEditActionsChange])

  // ── Render ───────────────────────────────────────────────
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
        isDirty={snap.dirty}
        justSaved={snap.justSaved}
        saveError={snap.saveError}
        hideActionButtons={externalEditActions}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={snap.saving}
      />

      {snap.saveError && (
        <div className="o_form_sheet_bg mt-1 w-full rounded border border-danger/30 bg-danger/10 px-4 py-2 text-xs text-danger whitespace-pre-line">
          {snap.saveError}
        </div>
      )}
      {snap.warning && (
        <div className="o_form_sheet_bg mt-1 w-full rounded border border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
          <span className="font-medium">{snap.warning.title}</span>: {snap.warning.message}
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
                  onChange={(name, value) => recordModel.update(name, value)}
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
              <div className="o_form_sheet-bg">
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
