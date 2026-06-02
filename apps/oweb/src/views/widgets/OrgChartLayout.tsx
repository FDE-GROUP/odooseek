import { memo, useState } from 'react'
import { HR_EMPLOYEE_MODEL } from '../../lib/hr'
import {
  HR_ORG_CHART_DISPLAY_LIMIT,
  type OrgChartData,
  type OrgChartEmployee,
  type OrgChartSubordinatesType,
} from '../../lib/hr-org-chart'
import { resolveOdooImageSrc } from '../../lib/odoo-image'
import { OrgChartSubPopover } from './OrgChartSubPopover'
import './org-chart-layout.css'

interface OrgChartLayoutProps {
  data: OrgChartData
  viewEmployeeId: number
  onEmployeeClick: (id: number) => void
  onMoreManagers?: () => void
  onSeeAll?: () => void
  onOpenTeam: (employeeId: number, type: OrgChartSubordinatesType) => void
}

function OrgChartEntry({
  employee,
  variant,
  isSelf,
  onClick,
  popoverOpen,
  onPopoverToggle,
  onPopoverClose,
  onOpenTeam,
  onEmployeeClick,
}: {
  employee: OrgChartEmployee
  variant: 'manager' | 'self' | 'sub'
  isSelf: boolean
  onClick?: () => void
  popoverOpen: boolean
  onPopoverToggle: () => void
  onPopoverClose: () => void
  onOpenTeam: (employeeId: number, type: OrgChartSubordinatesType) => void
  onEmployeeClick: (id: number) => void
}) {
  const src = resolveOdooImageSrc({
    model: HR_EMPLOYEE_MODEL,
    recordId: employee.id,
    field: 'avatar_128',
  })

  const showSubPopover = employee.indirect_sub_count > 0 && variant !== 'manager'

  const body = (
    <>
      <div
        className={`org-chart__avatar shrink-0 overflow-hidden rounded-full bg-accent/10 ring-1 ring-border-subtle ${isSelf ? 'org-chart__avatar--self' : ''}`}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
            {employee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 ps-2 leading-tight">
        <div className="truncate text-sm font-semibold text-text-primary">{employee.name}</div>
        {employee.job_name ? (
          <div
            className={`truncate text-xs ${isSelf ? 'font-medium text-text-secondary' : 'text-text-muted'}`}
          >
            {employee.job_name}
          </div>
        ) : null}
      </div>
      {showSubPopover ? (
        <OrgChartSubPopover
          employee={employee}
          open={popoverOpen}
          onToggle={onPopoverToggle}
          onClose={onPopoverClose}
          onOpenEmployee={onEmployeeClick}
          onOpenTeam={onOpenTeam}
        />
      ) : null}
    </>
  )

  const className = `org-chart__entry org-chart__entry--${variant} relative flex items-center overflow-visible py-2 ${variant === 'self' ? 'org-chart__entry--self' : 'org-chart__tree-entry'}`

  if (isSelf || !onClick) {
    return <div className={className}>{body}</div>
  }

  return (
    <button
      type="button"
      data-org-node
      className={`${className} w-full border-0 bg-transparent text-left`}
      onClick={onClick}
    >
      {body}
    </button>
  )
}

const OrgChartEntryMemo = memo(OrgChartEntry)

export function OrgChartLayout({
  data,
  viewEmployeeId,
  onEmployeeClick,
  onMoreManagers,
  onSeeAll,
  onOpenTeam,
}: OrgChartLayoutProps) {
  const [popoverEmployeeId, setPopoverEmployeeId] = useState<number | null>(null)
  const { managers, self, children, managers_more: managersMore } = data
  const hasManagers = managers.length > 0
  const hasChildren = children.length > 0
  const empty = !hasManagers && !hasChildren && !self

  const renderEntry = (
    employee: OrgChartEmployee,
    variant: 'manager' | 'self' | 'sub',
    onClick?: () => void,
  ) => (
    <OrgChartEntryMemo
      key={employee.id}
      employee={employee}
      variant={variant}
      isSelf={employee.id === viewEmployeeId}
      onClick={onClick}
      popoverOpen={popoverEmployeeId === employee.id}
      onPopoverToggle={() =>
        setPopoverEmployeeId((current) => (current === employee.id ? null : employee.id))
      }
      onPopoverClose={() => setPopoverEmployeeId(null)}
      onOpenTeam={(id, type) => {
        setPopoverEmployeeId(null)
        onOpenTeam(id, type)
      }}
      onEmployeeClick={onEmployeeClick}
    />
  )

  if (empty) {
    return (
      <div className="org-chart px-2 py-3">
        <p className="mb-3 text-sm italic text-text-muted">
          Set a manager or reports to show in org chart.
        </p>
      </div>
    )
  }

  const shown = managers.length + (self ? 1 : 0)
  const maxChildren = Math.max(0, HR_ORG_CHART_DISPLAY_LIMIT - shown)
  const visibleChildren = children.slice(0, maxChildren)
  const showSeeAll = children.length + managers.length > HR_ORG_CHART_DISPLAY_LIMIT - 1

  return (
    <div id="o_employee_org_chart" className="org-chart px-1 py-2">
      {hasManagers && (
        <div className="org-chart__group-up relative">
          {managersMore && onMoreManagers && (
            <div className="pe-3">
              <button
                type="button"
                onClick={onMoreManagers}
                className="mb-1 block rounded bg-hover px-2 text-xs text-text-secondary hover:text-text-primary"
              >
                ↑ More managers
              </button>
            </div>
          )}
          {managers.map((employee) =>
            renderEntry(employee, 'manager', () => onEmployeeClick(employee.id)),
          )}
        </div>
      )}

      {self && (
        <div className={`org-chart__self-wrap ${hasManagers ? 'org-chart__has-managers' : ''}`}>
          {renderEntry(self, 'self')}
        </div>
      )}

      {hasChildren && (
        <div
          className={`org-chart__group-down relative ${hasManagers ? 'org-chart__has-managers' : ''}`}
        >
          {visibleChildren.map((employee) =>
            renderEntry(employee, 'sub', () => onEmployeeClick(employee.id)),
          )}
          {showSeeAll && onSeeAll && (
            <div className="org-chart__entry flex overflow-visible py-2">
              <button
                type="button"
                onClick={onSeeAll}
                className="border-0 bg-transparent ps-2 text-xs text-accent hover:underline"
              >
                See All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
