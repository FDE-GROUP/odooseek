import { parseKanbanFields, parseKanbanXml, searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { JsClassHandlerProps } from '../../lib/js-class-map'

const BADGE_COLORS = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  secondary: 'bg-slate-100 text-slate-600 border-slate-200',
} as const

export default function StockDashboardKanban({ model, arch, domain }: JsClassHandlerProps) {
  const kanbanView = useMemo(() => parseKanbanXml(arch), [arch])
  const templateFields = useMemo(
    () => parseKanbanFields(kanbanView.template),
    [kanbanView.template],
  )

  const allFields =
    kanbanView.fields.length > 0 ? kanbanView.fields : templateFields.map((f) => f.name)

  const { data } = useQuery({
    queryKey: ['odoo', 'search_read', model, allFields, domain],
    queryFn: () => searchRead<Array<Record<string, unknown>>>(model, domain, allFields, 0, 100),
  })

  const records: Array<Record<string, unknown>> = data ?? []

  if (!records.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-text-muted">
        <div className="text-center">
          <p className="text-lg">No picking types configured</p>
          <p className="text-sm mt-1">Create picking types in the Configuration menu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {records.map((record, idx) => {
          const recordId = record.id as number
          const name = (record.name ?? record.display_name) as string
          const colorClass = record.color != null ? `o_kanban_color_${record.color}` : ''
          const warehouseName = (record.warehouse_id as [number, string] | undefined)?.[1]

          const badgeFields = [
            { label: 'Ready', field: 'count_picking_ready', color: 'success' as const },
            { label: 'Waiting', field: 'count_picking_waiting', color: 'warning' as const },
            { label: 'Late', field: 'count_picking_late', color: 'danger' as const },
            {
              label: 'Back Orders',
              field: 'count_picking_backorders',
              color: 'secondary' as const,
            },
          ]

          const showBadges = badgeFields.some(
            ({ field }) => typeof record[field] === 'number' && (record[field] as number) > 0,
          )

          return (
            <div
              key={recordId ?? idx}
              className={`rounded-lg border border-border-subtle bg-surface p-4 shadow-sm transition-shadow hover:shadow-md ${colorClass}`}
            >
              <div className="mb-2">
                <h3 className="text-base font-semibold text-text-primary">{name}</h3>
                {warehouseName && <span className="text-sm text-text-muted">{warehouseName}</span>}
              </div>

              {showBadges && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {badgeFields.map(({ label, field, color }) => {
                    const count = record[field] as number | undefined
                    if (!count || count <= 0) return null
                    return (
                      <span
                        key={field}
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[color]}`}
                      >
                        {count} {label}
                      </span>
                    )
                  })}
                </div>
              )}

              <button
                type="button"
                className="w-full rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-emphasis"
              >
                Open
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
