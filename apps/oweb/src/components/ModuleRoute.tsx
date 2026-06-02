import type { ViewType } from '@odooseek/odoo-client'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useActWindowDefaults } from '../hooks/useActWindowDefaults'
import { useAutosaveGuard } from '../hooks/useAutosaveGuard'
import type { OdooFormRendererRef } from '../views/OdooFormRenderer'
import { OdooViewLoader } from '../views/OdooViewLoader'

interface ModuleRouteProps {
  model: string
  /** Odoo action database id — loads `view_mode` / `views` for default view type. */
  actionId?: number
  /** Odoo action xml id, e.g. `hr.open_view_employee_list_my`. */
  actionXmlId?: string
  /** Used when no action is configured or while action is loading. */
  fallbackView?: ViewType
  domain?: unknown[]
  recordId?: number
  /** Navigate to this path when opening a record form (deep link). */
  recordPath?: (id: number) => string
  /** Navigate here when leaving form view (optional). */
  listPath?: string
  /** Override view switcher modes (defaults to action `view_mode` / `views`). */
  availableViews?: ViewType[]
}

export function ModuleRoute({
  model,
  actionId,
  actionXmlId,
  fallbackView = 'list',
  domain: domainProp,
  recordId: initialRecordId,
  recordPath,
  listPath,
  availableViews: availableViewsProp,
}: ModuleRouteProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const actionKey = actionXmlId ?? (actionId != null ? String(actionId) : null)
  const {
    availableViews: actionViews,
    defaultViewType,
    domain: actionDomain,
    context: actionContext,
    isLoading: loadingAction,
  } = useActWindowDefaults({
    actionId,
    actionXmlId,
    fallbackViewType: fallbackView,
    enabled: !!(actionId || actionXmlId),
  })

  const availableViews = availableViewsProp ?? (actionId || actionXmlId ? actionViews : undefined)
  const defaultView = actionId || actionXmlId ? defaultViewType : fallbackView
  const domain = domainProp ?? actionDomain

  const [viewType, setViewType] = useState<ViewType>(fallbackView)
  const [recordId, setRecordId] = useState<number | undefined>(initialRecordId)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const formRef = useRef<OdooFormRendererRef>(null)
  const viewInitialized = useRef(false)

  useEffect(() => {
    viewInitialized.current = false
  }, [actionKey])

  useEffect(() => {
    setRecordId(initialRecordId)
    if (initialRecordId) setViewType('form')
  }, [initialRecordId])

  useEffect(() => {
    if (initialRecordId || loadingAction || viewInitialized.current) return
    setViewType(defaultView)
    viewInitialized.current = true
  }, [initialRecordId, loadingAction, defaultView])

  const handleRowClick = useCallback(
    async (id: number) => {
      if (recordPath) {
        const to = recordPath(id)
        await router.preloadRoute({ to })
        navigate({ to })
        return
      }
      setRecordId(id)
      setViewType('form')
    },
    [navigate, recordPath, router],
  )

  const handleSwitchView = useCallback(
    (v: ViewType) => {
      setViewType(v)
      if (v !== 'form') {
        setRecordId(undefined)
        if (listPath && v === defaultView) navigate({ to: listPath })
      }
    },
    [defaultView, listPath, navigate],
  )

  const handleBackToList = useCallback(() => {
    if (listPath) {
      navigate({ to: listPath })
      return
    }
    setViewType(defaultView)
    setRecordId(undefined)
  }, [defaultView, listPath, navigate])

  const handleCreateClick = useCallback(() => {
    setViewType('form')
    setRecordId(undefined)
  }, [])

  const handleRecordCreated = useCallback(
    (newId: number) => {
      if (recordPath) {
        navigate({ to: recordPath(newId) })
        return
      }
      setRecordId(newId)
    },
    [navigate, recordPath],
  )

  useAutosaveGuard({
    isDirty: isFormDirty,
    onSave: async () => {
      await formRef.current?.save()
    },
    enabled: viewType === 'form',
  })

  if ((actionId || actionXmlId) && loadingAction) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <OdooViewLoader
      model={model}
      viewType={viewType}
      domain={domain}
      context={actionContext}
      recordId={recordId}
      onRowClick={handleRowClick}
      onBackToList={handleBackToList}
      onSwitchView={handleSwitchView}
      onCreateClick={handleCreateClick}
      onRecordCreated={handleRecordCreated}
      onDirtyChange={setIsFormDirty}
      formRef={formRef}
      availableViews={availableViews}
    />
  )
}
