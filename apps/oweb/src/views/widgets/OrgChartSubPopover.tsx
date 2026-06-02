import { useRef } from 'react'
import { AnchoredDropdown } from '../../components/AnchoredDropdown'
import { HR_EMPLOYEE_MODEL } from '../../lib/hr'
import type { OrgChartEmployee, OrgChartSubordinatesType } from '../../lib/hr-org-chart'
import { resolveOdooImageSrc } from '../../lib/odoo-image'

interface OrgChartSubPopoverProps {
  employee: OrgChartEmployee
  open: boolean
  onToggle: () => void
  onClose: () => void
  onOpenEmployee: (id: number) => void
  onOpenTeam: (employeeId: number, type: OrgChartSubordinatesType) => void
}

export function OrgChartSubPopover({
  employee,
  open,
  onToggle,
  onClose,
  onOpenEmployee,
  onOpenTeam,
}: OrgChartSubPopoverProps) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const indirectOnly = Math.max(0, employee.indirect_sub_count - employee.direct_sub_count)
  const src = resolveOdooImageSrc({
    model: HR_EMPLOYEE_MODEL,
    recordId: employee.id,
    field: 'avatar_128',
  })

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${employee.indirect_sub_count} subordinates`}
        className="ms-2 shrink-0 rounded-full border border-border-default bg-surface px-2 py-0.5 text-[10px] text-text-secondary hover:bg-hover hover:text-text-primary"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        {employee.indirect_sub_count}
      </button>
      <AnchoredDropdown open={open} onClose={onClose} anchorRef={anchorRef} width={240} align="end">
        <div className="border-b border-border-subtle px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-accent/10">
              {src ? (
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-primary">{employee.name}</div>
            </div>
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={() => onOpenEmployee(employee.id)}
            >
              Open
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-border-subtle/60">
              <td className="px-3 py-2 text-end font-semibold tabular-nums">
                {employee.direct_sub_count}
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="font-medium text-text-primary hover:text-accent"
                  onClick={() => onOpenTeam(employee.id, 'direct')}
                >
                  Direct subordinates
                </button>
              </td>
            </tr>
            <tr className="border-b border-border-subtle/60">
              <td className="px-3 py-2 text-end font-semibold tabular-nums">{indirectOnly}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="text-text-secondary hover:text-accent"
                  onClick={() => onOpenTeam(employee.id, 'indirect')}
                >
                  Indirect subordinates
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-end font-semibold tabular-nums">
                {employee.indirect_sub_count}
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="text-text-secondary hover:text-accent"
                  onClick={() => onOpenTeam(employee.id, 'total')}
                >
                  Total
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </AnchoredDropdown>
    </>
  )
}
