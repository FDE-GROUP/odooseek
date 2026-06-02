import type { ViewType } from '@odooseek/odoo-client'
import { resolveAction } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useBlocker, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { useAutosaveGuard } from '../hooks/useAutosaveGuard'
import { parseWebSearch, type WebSearch } from '../lib/web-search'
import type { OdooFormRendererRef } from '../views/OdooFormRenderer'
import { OdooViewLoader } from '../views/OdooViewLoader'

function WebPage() {
  const t = useTranslations()
  const search = useSearch({ from: '/web' }) as WebSearch
  const searchViewType = search.viewType as ViewType | undefined
  const [viewType, setViewType] = useState<ViewType>(searchViewType ?? 'list')
  const [recordId, setRecordId] = useState<number | undefined>()
  const [isFormDirty, setIsFormDirty] = useState(false)
  const formRef = useRef<OdooFormRendererRef>(null)
  const viewInitialized = useRef(false)

  const { data: actionData, isLoading: resolvingAction } = useQuery({
    queryKey: ['odoo', 'action', search.action],
    queryFn: () => resolveAction(search.action as number),
    enabled: search.action != null && !search.model,
    staleTime: 15 * 60_000,
  })

  const model = search.model ?? actionData?.model ?? 'res.partner'
  const actionDomain = actionData?.domain
  const actionContext = (actionData?.context ?? {}) as Record<string, unknown>
  const availableViews = actionData?.viewTypes
  const defaultView = actionData?.defaultViewType ?? 'list'

  useEffect(() => {
    viewInitialized.current = false
    setRecordId(undefined)
  }, [search.action, search.model])

  useEffect(() => {
    if (searchViewType) {
      setViewType(searchViewType)
      viewInitialized.current = true
      return
    }
    if (resolvingAction || viewInitialized.current) return
    setViewType(defaultView)
    viewInitialized.current = true
    if (actionData?.resId && defaultView === 'form') {
      setRecordId(actionData.resId)
    }
  }, [searchViewType, resolvingAction, defaultView, actionData?.resId])

  const effectiveViewType = searchViewType ?? viewType

  const blocker = useBlocker({
    shouldBlockFn: () => isFormDirty,
    enableBeforeUnload: isFormDirty,
    withResolver: true,
  })

  useAutosaveGuard({
    isDirty: isFormDirty,
    onSave: async () => {
      await formRef.current?.save()
    },
    enabled: effectiveViewType === 'form',
  })

  const handleRowClick = useCallback((id: number) => {
    setRecordId(id)
    setViewType('form')
  }, [])

  const handleSwitchView = useCallback((v: ViewType) => {
    setViewType(v)
    if (v !== 'form') setRecordId(undefined)
  }, [])

  const handleBackToList = useCallback(() => {
    setViewType(defaultView)
    setRecordId(undefined)
  }, [defaultView])

  const handleCreateClick = useCallback(() => {
    setViewType('form')
    setRecordId(undefined)
  }, [])

  const handleRecordCreated = useCallback((newId: number) => {
    setRecordId(newId)
  }, [])

  if (resolvingAction) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <OdooViewLoader
        model={model}
        viewType={effectiveViewType}
        domain={actionDomain}
        context={actionContext}
        recordId={recordId}
        availableViews={availableViews}
        onRowClick={handleRowClick}
        onBackToList={handleBackToList}
        onSwitchView={handleSwitchView}
        onCreateClick={handleCreateClick}
        onRecordCreated={handleRecordCreated}
        onDirtyChange={setIsFormDirty}
        formRef={formRef}
      />

      {blocker.status === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-96 rounded-lg border border-border-subtle bg-surface p-6 shadow-xl">
            <h4 className="text-sm font-semibold text-text-primary">
              {t('common.unsavedChanges')}
            </h4>
            <p className="mt-2 text-sm text-text-secondary">{t('common.unsavedChangesDesc')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={blocker.reset}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-hover"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => blocker.proceed?.()}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-hover"
              >
                {t('common.discard')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await formRef.current?.save()
                  blocker.proceed?.()
                }}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:brightness-110"
              >
                {t('common.saveLeave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/web')({
  component: WebPage,
  validateSearch: parseWebSearch,
})
