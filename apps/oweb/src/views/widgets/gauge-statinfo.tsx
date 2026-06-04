import type { FieldWidgetProps } from './index'

export function GaugeWidget({ value }: FieldWidgetProps) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0))
  const r = 20
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  const color = pct >= 80 ? 'text-success' : pct >= 40 ? 'text-warning' : 'text-danger'

  return (
    <div className="flex items-center gap-2">
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <title>Gauge</title>
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="var(--color-border-default)"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
          transform="rotate(-90 24 24)"
        />
        <text
          x="24"
          y="24"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-text-primary text-[10px] font-bold"
        >
          {pct}%
        </text>
      </svg>
    </div>
  )
}

export function StatInfoWidget({ value, field }: FieldWidgetProps) {
  const num = Number(value ?? 0)
  const opts = (field.options as Record<string, unknown>) ?? {}
  const label = (opts.label as string) ?? field.string ?? ''
  const icon = (opts.icon as string) ?? ''

  const formatted =
    opts.type === 'monetary'
      ? Number(num).toLocaleString(undefined, { minimumFractionDigits: 2 })
      : opts.type === 'percent'
        ? `${(num * 100).toFixed(1)}%`
        : String(num)

  const colorClass = num >= 0 ? 'text-success' : 'text-danger'

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface p-3">
      {icon && (
        <span className="text-xl text-text-muted">
          <i className={`fa ${icon}`} />
        </span>
      )}
      <div className="flex flex-col">
        <span className="text-xs text-text-muted">{label}</span>
        <span className={`text-base font-bold ${colorClass}`}>{formatted}</span>
      </div>
    </div>
  )
}
