import type { OdooAction, OdooFieldMeta } from '@odooseek/odoo-client'
import { callKw } from '@odooseek/odoo-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '../hooks/useToast'
import { ACTIVITY_DIALOG_WIZARD_MODELS, parseActionContext } from '../lib/activity-actions'
import type { OdooFormRendererRef } from '../views/OdooFormRenderer'

const LazyFormDialogInner = lazy(() =>
  import('./FormDialogInner').then((m) => ({ default: m.FormDialogInner })),
)

interface FormDialogItem {
  id: number
  action: OdooAction
}

interface FormDialogOverlayProps {
  dialogs: FormDialogItem[]
  onClose: (id: number) => void
  parentModel: string
}

export type { FormDialogItem }

export function FormDialogOverlay({ dialogs, onClose, parentModel }: FormDialogOverlayProps) {
  if (dialogs.length === 0) return null
  return (
    <>
      {dialogs.map((item, idx) => (
        <FormDialogBody
          key={item.id}
          item={item}
          onClose={onClose}
          parentModel={parentModel}
          zIndex={60 + idx * 10}
        />
      ))}
    </>
  )
}

function FormDialogBody({
  item,
  onClose,
  parentModel,
  zIndex,
}: {
  item: FormDialogItem
  onClose: (id: number) => void
  parentModel: string
  zIndex: number
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const formRef = useRef<OdooFormRendererRef>(null)
  const failureNotifiedRef = useRef(false)
  const [dismissed, setDismissed] = useState(false)
  const action = item.action
  const model = action.res_model ?? parentModel
  const actionContext = useMemo(() => parseActionContext(action.context), [action.context])
  const viewId =
    action.views && action.views.length > 0 && action.views[0][0] ? action.views[0][0] : undefined
  const needsWizardCreate = ACTIVITY_DIALOG_WIZARD_MODELS.has(model)

  const {
    data: wizardRecordId,
    isLoading: isCreatingWizard,
    isError: wizardCreateFailed,
    error: wizardCreateError,
  } = useQuery({
    queryKey: ['odoo', 'dialog', 'wizard-create', model, item.id, actionContext],
    queryFn: () => callKw<number>(model, 'create', [{}], { context: actionContext }),
    enabled: needsWizardCreate && !action.res_id,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })

  const dialogRecordId = action.res_id ?? wizardRecordId

  const canLoadForm = !needsWizardCreate || dialogRecordId != null

  const {
    data: viewData,
    isLoading: isLoadingViews,
    isError: viewsLoadFailed,
    error: viewsLoadError,
  } = useQuery({
    queryKey: ['odoo', 'dialog', 'get_views', model, item.id, dialogRecordId],
    queryFn: async () => {
      const data = await callKw<{
        views: Record<string, { arch: string; id: number }>
        models: Record<string, { fields: Record<string, OdooFieldMeta> }>
      }>(model, 'get_views', [[viewId ?? false, 'form']], { options: { toolbar: false } })
      return data
    },
    enabled: canLoadForm,
    staleTime: 5 * 60_000,
    retry: false,
  })

  const handleClose = useCallback(() => {
    onClose(item.id)
    queryClient.invalidateQueries({ queryKey: ['odoo', 'data', parentModel] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'search_read', parentModel] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'activity-data', parentModel] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'activity-records', parentModel] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'activities', parentModel] })
  }, [item.id, onClose, queryClient, parentModel])

  const activeView = viewData?.views?.form
  const fields: Record<string, OdooFieldMeta> = viewData?.models?.[model]?.fields ?? {}

  const notifyFailure = useCallback(
    (message: string) => {
      if (failureNotifiedRef.current) return
      failureNotifiedRef.current = true
      setDismissed(true)
      toast.error(message)
      handleClose()
    },
    [toast, handleClose],
  )

  useEffect(() => {
    failureNotifiedRef.current = false
    setDismissed(false)
  }, [item.id])

  useEffect(() => {
    if (wizardCreateFailed) {
      const msg =
        wizardCreateError instanceof Error ? wizardCreateError.message : 'Failed to open dialog'
      notifyFailure(msg)
    }
  }, [wizardCreateFailed, wizardCreateError, notifyFailure])

  useEffect(() => {
    if (!canLoadForm || isCreatingWizard || isLoadingViews) return
    if (viewsLoadFailed) {
      const msg =
        viewsLoadError instanceof Error ? viewsLoadError.message : `View not found for ${model}`
      notifyFailure(msg)
      return
    }
    if (!activeView) {
      notifyFailure(`View not found for ${model}`)
    }
  }, [
    canLoadForm,
    isCreatingWizard,
    isLoadingViews,
    viewsLoadFailed,
    viewsLoadError,
    activeView,
    model,
    notifyFailure,
  ])

  const title = action.name ?? action.display_name ?? model
  const showForm = Boolean(activeView) && !dismissed

  if (dismissed) return null

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex }}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
      <div role="presentation" className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="flex items-start justify-center min-h-full p-4 pt-12 pointer-events-none">
        <div className="relative w-full max-w-[800px] rounded-xl border border-border-subtle bg-surface shadow-2xl max-h-[85vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">{title}</h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary text-lg leading-none shrink-0 ml-2"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {!showForm ||
            isLoadingViews ||
            (needsWizardCreate && !dialogRecordId && isCreatingWizard) ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : activeView ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  </div>
                }
              >
                <LazyFormDialogInner
                  ref={formRef}
                  model={model}
                  arch={activeView.arch}
                  fields={fields}
                  recordId={dialogRecordId}
                  context={actionContext}
                  onClose={handleClose}
                />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
