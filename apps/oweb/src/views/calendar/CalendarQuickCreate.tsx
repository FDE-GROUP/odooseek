import type { OdooAction, OdooFieldMeta } from '@odooseek/odoo-client'
import { callKw } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { Suspense, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { OdooFormRendererRef } from '../OdooFormRenderer'

interface CalendarQuickCreateProps {
  model: string
  viewId: number
  onClose: () => void
  onSaved: () => void
}

export function CalendarQuickCreate({ model, viewId, onClose, onSaved }: CalendarQuickCreateProps) {
  const formRef = useRef<OdooFormRendererRef>(null)

  const { data: viewData, isLoading } = useQuery({
    queryKey: ['odoo', 'calendar-quick-create', model, viewId],
    queryFn: async () => {
      const data = await callKw<{
        views: Record<string, { arch: string; id: number }>
        models: Record<string, { fields: Record<string, OdooFieldMeta> }>
      }>(model, 'get_views', [[viewId, 'form']], { options: { toolbar: false } })
      return data
    },
    staleTime: 15 * 60_000,
  })

  const activeView = viewData?.views?.form
  const fields: Record<string, OdooFieldMeta> = viewData?.models?.[model]?.fields ?? {}

  const handleClose = useCallback(() => {
    onClose()
    onSaved()
  }, [onClose, onSaved])

  const handleAction = useCallback(
    (act: OdooAction) => {
      if (act.type === 'ir.actions.act_window_close') {
        handleClose()
      }
    },
    [handleClose],
  )

  return createPortal(
    <div className="fixed inset-0 z-60">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
      <div role="presentation" className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="flex items-start justify-center min-h-full p-4 pt-20 pointer-events-none">
        <div className="relative w-full max-w-[560px] rounded-xl border border-border-subtle bg-surface shadow-2xl max-h-[80vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-text-primary">New Event</h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary text-lg leading-none shrink-0 ml-2"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : !activeView ? (
              <div className="py-6 text-center text-sm text-text-muted">
                Quick create form not found for view {viewId}
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  </div>
                }
              >
                <QuickCreateFormInner
                  ref={formRef}
                  model={model}
                  arch={activeView.arch}
                  fields={fields}
                  onAction={handleAction}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

import React from 'react'

interface QuickCreateFormInnerProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  onAction: (action: OdooAction) => void
}

const QuickCreateFormInner = React.lazy(() =>
  import('../OdooFormRenderer').then((mod) => {
    const Inner = React.forwardRef(function Inner(
      props: QuickCreateFormInnerProps,
      ref: React.Ref<OdooFormRendererRef>,
    ) {
      return mod.OdooFormRenderer({
        model: props.model,
        arch: props.arch,
        fields: props.fields,
        onAction: props.onAction,
        ref,
      })
    })
    Inner.displayName = 'QuickCreateFormInner'
    return { default: Inner }
  }),
)
