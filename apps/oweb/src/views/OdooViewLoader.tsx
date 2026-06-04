import type { OdooFieldMeta, ViewToolbar, ViewType } from '@odooseek/odoo-client'
import {
  cacheKey,
  callKw,
  generateReport,
  getCachedViews,
  type OdooAction,
  orderedViewTypesFromActWindow,
  parseSearchXml,
  setCachedViews,
} from '@odooseek/odoo-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ControlPanel } from '../components/ControlPanel'
import { DataExportDialog } from '../components/DataExportDialog'
import { type FormDialogItem, FormDialogOverlay } from '../components/FormDialog'
import type { FormEditActionsProps } from '../components/FormEditActions'
import { ImportDialog } from '../components/ImportDialog'
import { SearchPanel } from '../components/SearchPanel'
import {
  CalendarSkeleton,
  FormSkeleton,
  GraphSkeleton,
  KanbanSkeleton,
  ListSkeleton,
  PivotSkeleton,
} from '../components/Skeleton'
import { WizardDialog } from '../components/WizardDialog'
import { HrVersionProvider } from '../hooks/HrVersionProvider'
import { useRecordActions } from '../hooks/useRecordActions'
import { useToast } from '../hooks/useToast'
import { HR_EMPLOYEE_MODEL } from '../lib/hr'
import { HR_WIZARD_STEPS } from '../lib/hr-wizards'
import { hasJscClassHandler, JS_CLASS_COMPONENTS } from '../lib/js-class-map'

// Lazy-loaded views — only fetched when the user switches to that view type
const OdooListRenderer = lazy(() =>
  import('./OdooListRenderer').then((m) => ({ default: m.OdooListRenderer })),
)
const OdooFormRenderer = lazy(() =>
  import('./OdooFormRenderer').then((m) => ({ default: m.OdooFormRenderer })),
)
const OdooKanbanRenderer = lazy(() =>
  import('./OdooKanbanRenderer').then((m) => ({ default: m.OdooKanbanRenderer })),
)
const OdooPivotRenderer = lazy(() =>
  import('./OdooPivotRenderer').then((m) => ({ default: m.OdooPivotRenderer })),
)
const OdooGraphRenderer = lazy(() =>
  import('./OdooGraphRenderer').then((m) => ({ default: m.OdooGraphRenderer })),
)
const OdooCalendarRenderer = lazy(() =>
  import('./calendar/OdooCalendarRenderer').then((m) => ({ default: m.OdooCalendarRenderer })),
)
const OdooActivityRenderer = lazy(() =>
  import('./OdooActivityRenderer').then((m) => ({ default: m.OdooActivityRenderer })),
)
const OdooHierarchyRenderer = lazy(() =>
  import('./OdooHierarchyRenderer').then((m) => ({ default: m.OdooHierarchyRenderer })),
)

type OdooFormRendererRef = React.ComponentRef<typeof OdooFormRenderer>

// Prefetch map: preload view chunks on hover so switching is instant
const viewPrefetchers: Record<string, () => Promise<unknown>> = {
  form: () => import('./OdooFormRenderer'),
  kanban: () => import('./OdooKanbanRenderer'),
  pivot: () => import('./OdooPivotRenderer'),
  graph: () => import('./OdooGraphRenderer'),
  calendar: () => import('./calendar/OdooCalendarRenderer'),
  activity: () => import('./OdooActivityRenderer'),
  hierarchy: () => import('./OdooHierarchyRenderer'),
}

export function prefetchView(type: string) {
  viewPrefetchers[type]?.()
}

interface ViewLoaderProps {
  model: string
  viewType: ViewType
  viewId?: number
  domain?: unknown[]
  context?: Record<string, unknown>
  recordId?: number
  availableViews?: ViewType[]
  onRowClick?: (recordId: number) => void
  onBackToList?: () => void
  onSwitchView?: (v: ViewType) => void
  onCreateClick?: () => void
  onRecordCreated?: (newId: number) => void
  onDirtyChange?: (dirty: boolean) => void
  formRef?: React.Ref<OdooFormRendererRef>
}

export function OdooViewLoader({
  model,
  viewType,
  viewId,
  domain: initialDomain = [],
  context = {},
  recordId: _recordId,
  availableViews,
  onRowClick,
  onBackToList,
  onSwitchView,
  onCreateClick,
  onRecordCreated,
  onDirtyChange,
  formRef,
}: ViewLoaderProps) {
  const viewsToLoad = useMemo<[number | false, string][]>(
    () => [
      [viewId ?? false, viewType],
      [false, 'search'],
    ],
    [viewId, viewType],
  )
  const ck = useMemo(() => cacheKey(model, viewsToLoad), [model, viewsToLoad])
  const [domain, setDomain] = useState<unknown[]>(initialDomain)
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [internalViewType, setInternalViewType] = useState(viewType)
  const [_internalRecordId, setInternalRecordId] = useState<number | undefined>(_recordId)
  const toast = useToast()
  const [formEditActions, setFormEditActions] = useState<FormEditActionsProps | null>(null)
  const handleFormEditActionsChange = useCallback((actions: FormEditActionsProps | null) => {
    setFormEditActions((prev) => {
      if (prev === actions) return prev
      if (!prev && !actions) return prev
      if (
        prev &&
        actions &&
        prev.editMode === actions.editMode &&
        prev.isDirty === actions.isDirty &&
        prev.justSaved === actions.justSaved &&
        prev.saveError === actions.saveError &&
        prev.isSaving === actions.isSaving &&
        prev.compact === actions.compact
      ) {
        return prev
      }
      return actions
    })
  }, [])

  // Sync external props when they change
  useEffect(() => {
    setInternalViewType(viewType)
  }, [viewType])
  useEffect(() => {
    setInternalRecordId(_recordId)
  }, [_recordId])

  // Default create handler: switch to form view with no record
  const handleCreate = useCallback(() => {
    setInternalViewType('form')
    setInternalRecordId(undefined)
  }, [])
  const [recordId, setRecordId] = useState<number | undefined>(_recordId)
  const [formDialogs, setFormDialogs] = useState<FormDialogItem[]>([])
  const formDialogIdRef = useRef(0)
  const [wizardDialog, setWizardDialog] = useState<{
    model: string
    context: Record<string, unknown>
  } | null>(null)
  const queryClient = useQueryClient()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [searchPanelDomain, setSearchPanelDomain] = useState<unknown[]>([])
  const [mobileSearchPanelOpen, setMobileSearchPanelOpen] = useState(false)
  const [searchPanelOpen, setSearchPanelOpen] = useState(true) // desktop toggle
  useEffect(() => {
    setRecordId(_recordId)
    setInternalRecordId(_recordId)
  }, [_recordId])

  useEffect(() => {
    setRecordId(undefined)
    setInternalRecordId(undefined)
  }, [model])

  const effectiveDomain = useMemo<unknown[]>(
    () => [...initialDomain, ...domain, ...searchPanelDomain],
    [initialDomain, domain, searchPanelDomain],
  )

  /** Domain passed to SearchPanel: base domain WITHOUT searchpanel filters,
   *  so each section's counts are computed independently of other sections. */
  const searchPanelBaseDomain = useMemo<unknown[]>(
    () => [...initialDomain, ...domain],
    [initialDomain, domain],
  )

  const { duplicate, archive, unarchive, remove } = useRecordActions(model)

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
            orderedViewTypesFromActWindow(action.view_mode, action.views)[0] ?? 'list'
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
    [
      model,
      viewType,
      recordId,
      onRowClick,
      onSwitchView,
      onBackToList,
      toast,
      openFormDialog,
      queryClient,
    ],
  )

  type ViewData = {
    views: Record<string, { arch: string; id: number; toolbar?: ViewToolbar }>
    models: Record<string, { fields: Record<string, OdooFieldMeta> }>
  }

  const {
    data: viewData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['odoo', 'get_views', model, viewsToLoad],
    queryFn: () =>
      callKw<ViewData>(model, 'get_views', [viewsToLoad], { options: { toolbar: true } }),
    staleTime: 15 * 60_000,
    initialData: (): ViewData | undefined => (getCachedViews(ck) as ViewData | null) ?? undefined,
  })

  useEffect(() => {
    if (viewData) setCachedViews(ck, viewData)
  }, [viewData, ck])

  const { data: recordNameData } = useQuery({
    queryKey: ['odoo', 'read', model, recordId, 'display_name'],
    queryFn: () =>
      callKw<Array<Record<string, unknown>>>(model, 'read', [[recordId], ['display_name']]),
    enabled: viewType === 'form' && !!recordId,
    staleTime: 30_000,
  })

  const handlePrintAction = useCallback(
    async (actionId: number) => {
      try {
        const ids = recordId ? [recordId] : []
        await generateReport(actionId, ids.length > 0 ? ids : [0])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to generate report')
      }
    },
    [recordId, toast],
  )

  const handleActionExecuted = useCallback(
    async (actionId: number) => {
      try {
        const context: Record<string, unknown> = {
          active_model: model,
          active_id: recordId ?? false,
          active_ids: recordId ? [recordId] : [],
        }
        await callKw('ir.actions.server', 'run', [[actionId]], { context })
        toast.info('Action executed')
        queryClient.invalidateQueries({ queryKey: ['odoo', 'get_views', model] })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Action failed')
      }
    },
    [model, recordId, toast, queryClient],
  )

  const handleDuplicate = useCallback(() => {
    if (!recordId) return
    duplicate.mutate(recordId, {
      onSuccess: (newId) => {
        toast.success('Record duplicated')
        onRecordCreated?.(newId)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to duplicate record')
      },
    })
  }, [recordId, duplicate, toast, onRecordCreated])

  const handleArchive = useCallback(() => {
    if (!recordId) return
    archive.mutate([recordId], {
      onSuccess: () => {
        toast.success('Record archived')
        onBackToList?.()
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to archive record')
      },
    })
  }, [recordId, archive, toast, onBackToList])

  const handleUnarchive = useCallback(() => {
    if (!recordId) return
    unarchive.mutate([recordId], {
      onSuccess: () => {
        toast.success('Record unarchived')
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to unarchive record')
      },
    })
  }, [recordId, unarchive, toast])

  const handleDelete = useCallback(() => {
    if (!recordId) return
    remove.mutate([recordId], {
      onSuccess: () => {
        toast.success('Record deleted')
        onBackToList?.()
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to delete record')
      },
    })
  }, [recordId, remove, toast, onBackToList])

  const handleSearch = useCallback((newDomain: unknown[]) => {
    setDomain(newDomain)
  }, [])

  const handleGroupByChange = useCallback((groupBys: string[]) => {
    setGroupBy(groupBys)
  }, [])

  const activeView = viewData?.views?.[internalViewType]
  const searchView = viewData?.views?.search
  const modelData = viewData?.models?.[model]
  const fields: Record<string, OdooFieldMeta> = modelData?.fields ?? {}
  const searchData = searchView ? parseSearchXml(searchView.arch) : null

  const dateFilters = useMemo(() => {
    const dateFields = (searchData?.fields ?? []).filter(
      (f) => f.name.endsWith('_date') || f.name === 'create_date' || f.name === 'write_date',
    )
    if (dateFields.length === 0) return []
    const result: Array<{ name: string; string: string; domain: unknown[] }> = []
    const presets = [
      {
        key: 'today',
        label: 'Today',
        start: () => {
          const d = new Date()
          d.setHours(0, 0, 0, 0)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'last7',
        label: 'Last 7 Days',
        start: () => {
          const d = new Date()
          d.setDate(d.getDate() - 6)
          d.setHours(0, 0, 0, 0)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'last30',
        label: 'Last 30 Days',
        start: () => {
          const d = new Date()
          d.setDate(d.getDate() - 29)
          d.setHours(0, 0, 0, 0)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'mtd',
        label: 'Month to Date',
        start: () => {
          const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'lastMonth',
        label: 'Last Month',
        start: () => {
          const d = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
          return d
        },
        end: () => {
          const d = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'ytd',
        label: 'Year to Date',
        start: () => {
          const d = new Date(new Date().getFullYear(), 0, 1)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
      {
        key: 'last12m',
        label: 'Last 12 Months',
        start: () => {
          const d = new Date()
          d.setFullYear(d.getFullYear() - 1)
          d.setDate(d.getDate() + 1)
          d.setHours(0, 0, 0, 0)
          return d
        },
        end: () => {
          const d = new Date()
          d.setHours(23, 59, 59, 999)
          return d
        },
      },
    ]
    const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')
    for (const f of dateFields) {
      for (const p of presets) {
        result.push({
          name: `date_${f.name}_${p.key}`,
          string: `${f.string || f.name}: ${p.label}`,
          domain: [
            [f.name, '>=', fmt(p.start())],
            [f.name, '<=', fmt(p.end())],
          ],
        })
      }
    }
    return result
  }, [searchData])

  const allFilters = useMemo(
    () => [...(searchData?.filters ?? []), ...dateFilters],
    [searchData?.filters, dateFilters],
  )

  if (isLoading) {
    if (internalViewType === 'kanban') return <KanbanSkeleton />
    if (internalViewType === 'form') return <FormSkeleton />
    if (internalViewType === 'pivot') return <PivotSkeleton />
    if (internalViewType === 'graph') return <GraphSkeleton />
    if (internalViewType === 'calendar') return <CalendarSkeleton />
    if (internalViewType === 'activity') return <ListSkeleton />
    return <ListSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        Failed to load view: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  if (!activeView) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface/50 py-12 text-center text-sm text-text-muted">
        View not found: {model}.{viewType}
      </div>
    )
  }

  const arch = activeView?.arch ?? ''
  const jsClassMatch = arch.match(/js_class\s*=\s*"([^"]+)"/)
  const jsClass = jsClassMatch?.[1]
  const hasCustomJsHandler = !!jsClass && hasJscClassHandler(jsClass)
  const viewTitle = arch.match(/<[^ ]+\s+[^>]*string\s*=\s*"([^"]+)"/i)?.[1] || undefined
  const recordName = (recordNameData?.[0]?.display_name as string) || undefined
  const toolbar = activeView?.toolbar
  const hasActiveField = 'active' in fields
  const searchPanel = searchData?.searchPanel

  const showSearch =
    internalViewType === 'list' ||
    internalViewType === 'kanban' ||
    internalViewType === 'pivot' ||
    internalViewType === 'graph' ||
    internalViewType === 'calendar' ||
    internalViewType === 'activity' ||
    internalViewType === 'hierarchy'

  const renderContent = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ControlPanel
        breadcrumbs={{ model, viewType: internalViewType, viewTitle, recordName, onBackToList }}
        searchProps={
          showSearch
            ? {
                visible: true,
                model,
                onSearch: handleSearch,
                onGroupByChange: handleGroupByChange,
                placeholder: `Search ${model}...`,
                searchFields: searchData?.fields,
                filters: allFilters,
                groupByFilters: searchData?.groupByFilters,
              }
            : { visible: false, onSearch: () => {} }
        }
        toolbar={toolbar}
        currentView={internalViewType}
        availableViews={availableViews}
        onSwitchView={onSwitchView}
        onCreateClick={onCreateClick ?? handleCreate}
        showCreate={viewType !== 'form'}
        onImport={viewType !== 'form' ? () => setShowImport(true) : undefined}
        onExport={viewType !== 'form' ? () => setShowExport(true) : undefined}
        onPrintAction={handlePrintAction}
        onActionExecuted={handleActionExecuted}
        model={model}
        selectedIds={recordId ? [recordId] : []}
        onDuplicate={viewType === 'form' && recordId ? handleDuplicate : undefined}
        onArchive={viewType === 'form' && recordId ? handleArchive : undefined}
        onUnarchive={viewType === 'form' && recordId ? handleUnarchive : undefined}
        onDelete={viewType === 'form' && recordId ? handleDelete : undefined}
        hasActiveField={hasActiveField}
        formEditActions={viewType === 'form' ? formEditActions : null}
        searchPanelToggle={
          searchPanel
            ? {
                visible: true,
                open: searchPanelOpen,
                onToggle: () => setSearchPanelOpen((open) => !open),
              }
            : undefined
        }
      />
      {hasCustomJsHandler && jsClass
        ? (() => {
            const CustomView = JS_CLASS_COMPONENTS[jsClass]
            if (!CustomView) return null
            return (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Suspense fallback={<ListSkeleton />}>
                  <CustomView
                    model={model}
                    arch={arch}
                    fields={fields}
                    domain={effectiveDomain}
                    groupBy={groupBy}
                    recordId={recordId}
                    context={context}
                  />
                </Suspense>
              </div>
            )
          })()
        : null}
      {!hasCustomJsHandler && viewType === 'list' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={<ListSkeleton />}>
            <OdooListRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
              groupBy={groupBy}
              onRowClick={onRowClick}
            />
          </Suspense>
        </div>
      )}
      {!hasCustomJsHandler && viewType === 'form' && (
        <Suspense fallback={<FormSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            {model === HR_EMPLOYEE_MODEL && recordId ? (
              <HrVersionProvider employeeId={recordId}>
                <OdooFormRenderer
                  ref={formRef}
                  model={model}
                  arch={activeView.arch}
                  fields={fields}
                  recordId={recordId}
                  context={context}
                  onRecordCreated={onRecordCreated}
                  onDirtyChange={onDirtyChange}
                  onAction={handleFormAction}
                  externalEditActions
                  onEditActionsChange={handleFormEditActionsChange}
                />
              </HrVersionProvider>
            ) : (
              <OdooFormRenderer
                ref={formRef}
                model={model}
                arch={activeView.arch}
                fields={fields}
                recordId={recordId}
                context={context}
                onRecordCreated={onRecordCreated}
                onDirtyChange={onDirtyChange}
                onAction={handleFormAction}
                externalEditActions
                onEditActionsChange={handleFormEditActionsChange}
              />
            )}
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && viewType === 'kanban' && (
        <Suspense fallback={<KanbanSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooKanbanRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
              groupBy={groupBy}
              onRecordClick={onRowClick}
            />
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && viewType === 'pivot' && (
        <Suspense fallback={<PivotSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooPivotRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
            />
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && viewType === 'graph' && (
        <Suspense fallback={<GraphSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooGraphRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
            />
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && internalViewType === 'calendar' && (
        <Suspense fallback={<CalendarSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooCalendarRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
              onRecordClick={onRowClick}
            />
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && internalViewType === 'activity' && (
        <Suspense fallback={<ListSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooActivityRenderer
              model={model}
              arch={activeView.arch}
              fields={fields}
              domain={effectiveDomain}
              context={context}
              onRecordClick={onRowClick}
              onOpenFormDialog={openFormDialog}
            />
          </div>
        </Suspense>
      )}
      {!hasCustomJsHandler && internalViewType === 'hierarchy' && (
        <Suspense fallback={<ListSkeleton />}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <OdooHierarchyRenderer model={model} arch={activeView.arch} />
          </div>
        </Suspense>
      )}
    </div>
  )

  return (
    <>
      {searchPanel && showSearch ? (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {mobileSearchPanelOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Close filters"
              onClick={() => setMobileSearchPanelOpen(false)}
            />
          )}
          <div
            className={`flex flex-col bg-surface transition-all duration-200 border-r border-border-subtle ${
              mobileSearchPanelOpen
                ? 'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] shadow-lg'
                : '-translate-x-full'
            } md:relative md:z-auto md:max-w-none md:translate-x-0 md:shadow-none ${
              searchPanelOpen ? 'md:w-52' : 'md:w-9'
            }`}
          >
            {searchPanelOpen ? (
              <>
                <div className="flex items-center justify-between border-b border-border-subtle px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                    Filters
                  </span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-text-muted hover:bg-hover hover:text-text-primary"
                    onClick={() => setSearchPanelOpen(false)}
                    title="Collapse filters"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <title>Collapse</title>
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                </div>
                <SearchPanel
                  model={model}
                  searchPanel={searchPanel}
                  domain={searchPanelBaseDomain}
                  onCategoryChange={(searchPanelFilterDomain) => {
                    setSearchPanelDomain(searchPanelFilterDomain)
                    setMobileSearchPanelOpen(false)
                  }}
                />
              </>
            ) : (
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-1 py-3 text-text-muted hover:bg-hover hover:text-text-primary"
                onClick={() => setSearchPanelOpen(true)}
                title="Expand filters"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <title>Expand</title>
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <span className="text-[9px] font-medium uppercase writing-vertical">Filters</span>
              </button>
            )}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {renderContent()}
          </div>
        </div>
      ) : (
        renderContent()
      )}
      {showImport && <ImportDialog model={model} onClose={() => setShowImport(false)} />}
      {showExport && <DataExportDialog model={model} onClose={() => setShowExport(false)} />}
      <FormDialogOverlay dialogs={formDialogs} onClose={closeFormDialog} parentModel={model} />
      {wizardDialog && HR_WIZARD_STEPS[wizardDialog.model] && (
        <WizardDialog
          open
          model={wizardDialog.model}
          context={wizardDialog.context}
          steps={HR_WIZARD_STEPS[wizardDialog.model]}
          onDone={() => {
            setWizardDialog(null)
            queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model] })
          }}
          onCancel={() => setWizardDialog(null)}
        />
      )}
    </>
  )
}
