import { useCallback, useRef, useState } from 'react'
import type { OdooAction, ViewType } from '@odooseek/odoo-client'
import { orderedViewTypesFromActWindow, generateReport } from '@odooseek/odoo-client'
import type { FormDialogItem } from '../components/FormDialog'
import { useToast } from '../hooks/useToast'
import { HR_WIZARD_STEPS } from '../lib/hr-wizards'

export function useDialogState(
  model: string,
  viewType: ViewType,
  recordId: number | undefined,
  onRowClick?: (recordId: number) => void,
  onSwitchView?: (v: ViewType) => void,
  onBackToList?: () => void,
  queryClient?: { invalidateQueries: (opts: { queryKey: unknown[] }) => void },
) {
  const [formDialogs, setFormDialogs] = useState<FormDialogItem[]>([])
  const formDialogIdRef = useRef(0)
  const [wizardDialog, setWizardDialog] = useState<{
    model: string
    context: Record<string, unknown>
  } | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const toast = useToast()

  const openFormDialog = useCallback((action: OdooAction) => {
    const id = ++formDialogIdRef.current
    setFormDialogs((prev) => [...prev, { id, action }])
  }, [])

  const closeFormDialog = useCallback((id: number) => {
    setFormDialogs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const handleFormAction = useCallback(
    (action: OdooAction) => {
      if (action.type === 'ir.actions.act_window') {
        if (action.target === 'new') {
          const resModel = action.res_model as string | undefined
          if (resModel && HR_WIZARD_STEPS[resModel]) {
            setWizardDialog({
              model: resModel,
              context: {
                ...(typeof action.context === 'object' && action.context ? action.context : {}),
                active_model: model,
                active_id: recordId,
                active_ids: recordId ? [recordId] : [],
              },
            })
            return
          }
          openFormDialog(action)
          return
        }
        if (action.res_model) {
          const newViewType =
            orderedViewTypesFromActWindow(action.view_mode, action.views)[0] ?? ('list' as ViewType)
          if (action.res_id) {
            onRowClick?.(action.res_id)
          } else if (action.res_model !== model || newViewType !== viewType) {
            onSwitchView?.(newViewType)
          } else {
            onBackToList?.()
          }
        }
      } else if (action.type === 'ir.actions.act_url') {
        const url = (action as Record<string, unknown>).url as string | undefined
        if (url) window.open(url, '_blank')
      } else if (action.type === 'ir.actions.report') {
        const rawAction = action as Record<string, unknown>
        const actionId = rawAction.id ?? rawAction.report_name
        generateReport(Number(actionId || 0), recordId ? [recordId] : [])
      } else if (action.type === 'ir.actions.server') {
        toast.info('Action executed')
      } else if (action.type === 'ir.actions.act_window_close') {
        onBackToList?.()
      } else if (action.type === 'ir.actions.client') {
        const tag = (action as Record<string, unknown>).tag as string | undefined
        if (tag === 'event.event_barcode_scan_view') {
          const ctx = (action as Record<string, unknown>).context as
            | Record<string, unknown>
            | undefined
          const eventId = ctx?.default_event_id ?? recordId
          window.open(`/event/registration-desk?event_id=${eventId}`, '_self')
        }
      }
    },
    [model, viewType, recordId, onRowClick, onSwitchView, onBackToList, toast, openFormDialog],
  )

  const dismissWizard = useCallback(() => {
    setWizardDialog(null)
    queryClient?.invalidateQueries({ queryKey: ['odoo', 'read', model] })
  }, [queryClient, model])

  return {
    formDialogs,
    wizardDialog,
    showImport,
    showExport,
    openFormDialog,
    closeFormDialog,
    handleFormAction,
    setShowImport,
    setShowExport,
    setWizardDialog,
    dismissWizard,
  }
}
