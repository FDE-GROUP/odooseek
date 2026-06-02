import type { ViewToolbar, ViewType } from '@odooseek/odoo-client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Filter, Plus } from '@/lib/lucide-icons'
import { OdooViewSwitcher } from '../views/OdooViewSwitcher'
import { AnchoredDropdown } from './AnchoredDropdown'
import { Breadcrumbs } from './Breadcrumbs'
import { cpAccentTintPill, cpNeutralPill, cpPillBtn } from './control-panel-styles'
import { FormEditActions, type FormEditActionsProps } from './FormEditActions'
import { Pagination } from './Pagination'
import { SearchBar, type SearchBarProps } from './SearchBar'

interface BreadcrumbProps {
  model: string
  viewType: string
  viewTitle?: string
  recordName?: string
  onBackToList?: () => void
}

interface PagerProps {
  offset: number
  total: number
  limit: number
  onPageChange: (offset: number) => void
  onLimitChange: (limit: number) => void
}

export interface ControlPanelProps {
  breadcrumbs?: BreadcrumbProps
  searchProps?: SearchBarProps & { visible?: boolean }
  pagerProps?: PagerProps & { visible?: boolean }
  toolbar?: ViewToolbar
  model?: string
  selectedIds?: number[]
  currentView?: ViewType
  availableViews?: ViewType[]
  onSwitchView?: (v: ViewType) => void
  onCreateClick?: () => void
  showCreate?: boolean
  // Record actions for Action menu
  onDuplicate?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete?: () => void
  hasActiveField?: boolean
  // Callbacks for toolbar actions
  onPrintAction?: (actionId: number) => void
  onActionExecuted?: (actionId: number) => void
  onImport?: () => void
  onExport?: () => void
  /** Mobile drawer toggle for left SearchPanel (visible only below md). */
  searchPanelToggle?: { visible: boolean; open: boolean; onToggle: () => void }
  /** Form view: Edit / Save / Cancel (shown before Action menu). */
  formEditActions?: FormEditActionsProps | null
}

export function ControlPanel({
  breadcrumbs,
  searchProps,
  pagerProps,
  toolbar,
  currentView,
  availableViews,
  onSwitchView,
  onCreateClick,
  showCreate = false,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
  hasActiveField,
  onPrintAction,
  onActionExecuted,
  onImport,
  onExport,
  selectedIds,
  searchPanelToggle,
  formEditActions,
}: ControlPanelProps) {
  const [openMenu, setOpenMenu] = useState<'print' | 'action' | null>(null)
  const printBtnRef = useRef<HTMLButtonElement>(null)
  const actionBtnRef = useRef<HTMLButtonElement>(null)
  const menuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearMenuCloseTimer = () => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current)
      menuCloseTimerRef.current = null
    }
  }

  const openMenuOnHover = (menu: 'print' | 'action') => {
    clearMenuCloseTimer()
    setOpenMenu(menu)
  }

  const scheduleMenuClose = () => {
    clearMenuCloseTimer()
    menuCloseTimerRef.current = setTimeout(() => setOpenMenu(null), 200)
  }

  useEffect(() => () => clearMenuCloseTimer(), [])

  const menuHoverHandlers = (menu: 'print' | 'action') => ({
    onMouseEnter: () => openMenuOnHover(menu),
    onMouseLeave: scheduleMenuClose,
  })

  const menuPanelHoverHandlers = {
    onPanelMouseEnter: clearMenuCloseTimer,
    onPanelMouseLeave: scheduleMenuClose,
  }

  const hasPrint = (toolbar?.print?.length ?? 0) > 0
  const hasAction =
    (toolbar?.action?.length ?? 0) > 0 ||
    !!onDuplicate ||
    !!onArchive ||
    !!onUnarchive ||
    !!onDelete
  const showMenus = hasPrint || hasAction
  const showSearch = searchProps?.visible !== false && searchProps
  const showPager = pagerProps?.visible !== false && pagerProps
  const showViewSwitcher = !!onSwitchView && !!availableViews

  const handlePrintAction = (actionId: number) => {
    onPrintAction?.(actionId)
    setOpenMenu(null)
  }

  const handleActionExecuted = (actionId: number) => {
    onActionExecuted?.(actionId)
    setOpenMenu(null)
  }

  const showCreateButton = showCreate && !!onCreateClick && currentView !== 'form'

  const showSecondaryToolbar =
    !!formEditActions ||
    showMenus ||
    (!!onImport && currentView !== 'form') ||
    (!!onExport && currentView !== 'form')

  const createButton = showCreateButton ? (
    <button type="button" onClick={onCreateClick} className={cpAccentTintPill()}>
      <Plus className="h-3.5 w-3.5" aria-hidden />
      Create
    </button>
  ) : null

  const secondaryToolbar = showSecondaryToolbar ? (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {showMenus && (
        <div className="flex items-center gap-1">
          {hasPrint && (
            <div className="relative" {...menuHoverHandlers('print')}>
              <button
                ref={printBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openMenuOnHover('print')
                }}
                className={cpNeutralPill()}
              >
                Print
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnchoredDropdown
                open={openMenu === 'print'}
                onClose={() => setOpenMenu(null)}
                anchorRef={printBtnRef}
                width={176}
                closeOnBackdropClick={false}
                {...menuPanelHoverHandlers}
              >
                {toolbar?.print.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handlePrintAction(a.id)}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-text-primary hover:bg-hover/50"
                  >
                    {a.name}
                  </button>
                ))}
              </AnchoredDropdown>
            </div>
          )}
          {formEditActions && <FormEditActions {...formEditActions} />}
          {hasAction && (
            <div className="relative" {...menuHoverHandlers('action')}>
              <button
                ref={actionBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openMenuOnHover('action')
                }}
                className={cpNeutralPill()}
              >
                Action
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnchoredDropdown
                open={openMenu === 'action'}
                onClose={() => setOpenMenu(null)}
                anchorRef={actionBtnRef}
                width={192}
                closeOnBackdropClick={false}
                {...menuPanelHoverHandlers}
              >
                {toolbar?.action?.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleActionExecuted(a.id)}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-text-primary hover:bg-hover/50"
                  >
                    {a.name}
                  </button>
                ))}
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate()
                      setOpenMenu(null)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-text-primary hover:bg-hover/50"
                  >
                    Duplicate
                  </button>
                )}
                {onArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      onArchive()
                      setOpenMenu(null)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-text-primary hover:bg-hover/50"
                  >
                    Archive
                  </button>
                )}
                {onUnarchive && hasActiveField && (
                  <button
                    type="button"
                    onClick={() => {
                      onUnarchive()
                      setOpenMenu(null)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-text-primary hover:bg-hover/50"
                  >
                    Unarchive
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete()
                      setOpenMenu(null)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-danger hover:bg-danger/10"
                  >
                    Delete
                  </button>
                )}
              </AnchoredDropdown>
            </div>
          )}
        </div>
      )}
      {onImport && currentView !== 'form' && (
        <button
          type="button"
          onClick={onImport}
          className={cpPillBtn(
            'border border-border-default text-text-secondary hover:bg-hover hover:text-text-primary',
          )}
        >
          Import
        </button>
      )}
      {onExport && currentView !== 'form' && (
        <button
          type="button"
          onClick={onExport}
          className={cpPillBtn(
            'border border-border-default text-text-secondary hover:bg-hover hover:text-text-primary',
          )}
        >
          Export
        </button>
      )}
    </div>
  ) : null

  return (
    <div className="flex shrink-0 flex-col">
      {breadcrumbs && (
        <div className="border-b border-border-subtle bg-surface/30 px-4 py-1.5">
          <Breadcrumbs
            model={breadcrumbs.model}
            viewType={breadcrumbs.viewType}
            viewTitle={breadcrumbs.viewTitle}
            recordName={breadcrumbs.recordName}
            onBackToList={breadcrumbs.onBackToList}
          />
        </div>
      )}

      {/* Create → Search → Print/Action/Import/Export | view switcher (right) */}
      {(showSearch || createButton || secondaryToolbar || showViewSwitcher) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-2 md:flex-nowrap md:gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {showSearch && searchPanelToggle?.visible && (
              <button
                type="button"
                onClick={searchPanelToggle.onToggle}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium md:hidden ${
                  searchPanelToggle.open
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-default text-text-secondary hover:bg-hover'
                }`}
                aria-expanded={searchPanelToggle.open}
                aria-label="Toggle category filters"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            )}
            {createButton}
            {showSearch && (
              <div className="min-w-0 w-full flex-1 basis-full md:w-auto md:max-w-xl md:basis-auto">
                <SearchBar
                  compact
                  onSearch={searchProps.onSearch}
                  onGroupByChange={searchProps.onGroupByChange}
                  placeholder={searchProps.placeholder}
                  searchFields={searchProps.searchFields}
                  filters={searchProps.filters}
                  groupByFilters={searchProps.groupByFilters}
                  model={searchProps.model}
                />
              </div>
            )}
            {secondaryToolbar}
          </div>
          {showViewSwitcher && (
            <div className="ml-auto flex shrink-0">
              <OdooViewSwitcher
                currentView={currentView ?? 'list'}
                onSwitch={onSwitchView}
                availableViews={availableViews}
              />
            </div>
          )}
        </div>
      )}

      {/* Row 3: Pager (left) + Selection info (right) */}
      {showPager && (
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
          <Pagination
            offset={pagerProps?.offset}
            total={pagerProps?.total}
            limit={pagerProps?.limit}
            onPageChange={pagerProps?.onPageChange}
            onLimitChange={pagerProps?.onLimitChange}
          />
          {selectedIds && selectedIds.length > 0 && (
            <span className="text-xs text-text-muted">{selectedIds.length} selected</span>
          )}
        </div>
      )}
    </div>
  )
}
