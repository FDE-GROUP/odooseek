import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useBlocker, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { useAutosaveGuard } from '../hooks/useAutosaveGuard'
import { resolveAction } from '../lib/api'
import type { OdooFormRendererRef } from '../views/OdooFormRenderer'
import { OdooViewLoader } from '../views/OdooViewLoader'

interface WebSearch {
  model?: string
  action?: number
  viewType?: string
}

type ViewType = 'list' | 'form' | 'kanban' | 'pivot' | 'graph' | 'calendar'

function WebPage() {
  const t = useTranslations()
  const search = useSearch({ from: '/web' }) as WebSearch
  const [viewType, setViewType] = useState<ViewType>((search.viewType as ViewType) ?? 'list')
  const [recordId, setRecordId] = useState<number | undefined>()
  const [isFormDirty, setIsFormDirty] = useState(false)
  const formRef = useRef<OdooFormRendererRef>(null)

  const { data: actionData, isLoading: resolvingAction } = useQuery({
    queryKey: ['odoo', 'action', search.action],
    queryFn: () => resolveAction(search.action as number),
    enabled: !!search.action && !search.model,
    staleTime: 15 * 60_000,
  })

  const model = search.model ?? actionData?.model ?? 'res.partner'
  const actionViewModes = actionData?.viewMode
  const actionDomain = actionData?.domain

  const availableViews = useMemo(() => {
    if (!actionViewModes) return undefined
    return actionViewModes
      .split(',')
      .map((v) => v.trim() as ViewType)
      .filter((v) => ['list', 'form', 'kanban', 'pivot', 'graph', 'calendar'].includes(v))
  }, [actionViewModes])

  const defaultView = availableViews?.[0] ?? 'list'
  const effectiveViewType = viewType ?? defaultView

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
    setViewType('list')
    setRecordId(undefined)
  }, [])

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
    <div className="flex flex-1 flex-col overflow-auto">
      <OdooViewLoader
        model={model}
        viewType={effectiveViewType}
        domain={actionDomain}
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
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
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
  validateSearch: (search: Record<string, unknown>) => search,
})
