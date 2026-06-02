import { memo } from 'react'
import { HR_EMPLOYEE_MODEL } from '../../lib/hr'
import {
  HR_ORG_CHART_DISPLAY_LIMIT,
  type OrgChartData,
  type OrgChartEmployee,
} from '../../lib/hr-org-chart'
import { resolveOdooImageSrc } from '../../lib/odoo-image'
import './org-chart-layout.css'

interface OrgChartLayoutProps {
  data: OrgChartData
  viewEmployeeId: number
  onEmployeeClick: (id: number) => void
  onMoreManagers?: () => void
  onSeeAll?: () => void
}

function OrgChartEntry({
  employee,
  variant,
  isSelf,
  onClick,
}: {
  employee: OrgChartEmployee
  variant: 'manager' | 'self' | 'sub'
  isSelf: boolean
  onClick?: () => void
}) {
  const src = resolveOdooImageSrc({
    model: HR_EMPLOYEE_MODEL,
    recordId: employee.id,
    field: 'avatar_128',
  })

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
      {employee.indirect_sub_count > 0 && variant !== 'manager' ? (
        <span className="ms-2 shrink-0 rounded-full border border-border-default bg-surface px-2 py-0.5 text-[10px] text-text-secondary">
          {employee.indirect_sub_count}
        </span>
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
}: OrgChartLayoutProps) {
  const { managers, self, children, managers_more: managersMore } = data
  const hasManagers = managers.length > 0
  const hasChildren = children.length > 0
  const empty = !hasManagers && !hasChildren && !self

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
          {managers.map((employee) => (
            <OrgChartEntryMemo
              key={employee.id}
              employee={employee}
              variant="manager"
              isSelf={employee.id === viewEmployeeId}
              onClick={() => onEmployeeClick(employee.id)}
            />
          ))}
        </div>
      )}

      {self && (
        <div className={`org-chart__self-wrap ${hasManagers ? 'org-chart__has-managers' : ''}`}>
          <OrgChartEntryMemo employee={self} variant="self" isSelf={self.id === viewEmployeeId} />
        </div>
      )}

      {hasChildren && (
        <div
          className={`org-chart__group-down relative ${hasManagers ? 'org-chart__has-managers' : ''}`}
        >
          {visibleChildren.map((employee) => (
            <OrgChartEntryMemo
              key={employee.id}
              employee={employee}
              variant="sub"
              isSelf={employee.id === viewEmployeeId}
              onClick={() => onEmployeeClick(employee.id)}
            />
          ))}
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
