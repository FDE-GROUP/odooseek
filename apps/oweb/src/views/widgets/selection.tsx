import { searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import type { FieldWidgetProps } from './index'

export function SelectionWidget({
  field: _field,
  value,
  onChange,
  readOnly,
  meta,
}: FieldWidgetProps) {
  if (readOnly) {
    if (value === false || value === null || value === undefined)
      return <span className="text-sm text-text-primary">—</span>
    const pair = meta?.selection?.find(([k]) => k === value)
    return <span className="text-sm text-text-primary">{pair ? pair[1] : String(value)}</span>
  }
  if (!meta?.selection?.length) {
    if (value === false || value === null || value === undefined)
      return <span className="text-sm text-text-primary">—</span>
    return <span className="text-sm text-text-primary">{String(value)}</span>
  }
  return (
    <select
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
    >
      <option value="">--</option>
      {meta.selection.map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  )
}

export function PriorityWidget({ value, readOnly, onChange, meta }: FieldWidgetProps) {
  const selection = meta?.selection ?? []
  const max = selection.length || 3
  const currentKey = String(value ?? '0')
  const currentIdx = selection.findIndex(([k]) => k === currentKey)
  const stars = currentIdx >= 0 ? currentIdx + 1 : Number(value) || 0
  if (readOnly) {
    return (
      <span className="inline-flex gap-0.5 text-sm">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < stars ? 'text-warning' : 'text-border-default'}>
            ★
          </span>
        ))}
      </span>
    )
  }
  return (
    <div className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(selection[i]?.[0] ?? String(i))}
          title={selection[i]?.[1] ?? `Level ${i + 1}`}
          className={`text-sm ${i < stars ? 'text-warning' : 'text-border-default hover:text-warning/80'}`}
        >
          {i < stars ? '★' : '☆'}
        </button>
      ))}
      {stars > 0 && (
        <button type="button" onClick={() => onChange(0)} className="ml-1 text-xs text-text-muted">
          ✕
        </button>
      )}
    </div>
  )
}

export function StateBadgeWidget({ value, meta }: FieldWidgetProps) {
  const val = String(value ?? '')
  if (!val) return <span className="text-sm text-text-muted">—</span>
  const selection = meta?.selection ?? []
  const pair = selection.find(([k]) => k === val)
  const label = pair?.[1] ?? val
  const colors: Record<string, string> = {
    draft: 'bg-elevated text-text-secondary',
    done: 'bg-success/10 text-success',
    cancel: 'bg-danger/10 text-danger',
    posted: 'bg-info/10 text-info',
    confirmed: 'bg-info/10 text-info',
    new: 'bg-elevated text-text-secondary',
    assigned: 'bg-warning/10 text-warning',
    won: 'bg-success/10 text-success',
    lost: 'bg-danger/10 text-danger',
  }
  const color =
    colors[val.toLowerCase()] ?? 'bg-surface text-text-primary border border-border-default'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

// ── Statusbar Widget (Phase 24) ────────────────────────────────────

interface StageInfo {
  id: number
  name: string
  sequence: number
  fold?: boolean
}

function useStages(relation: string | undefined): StageInfo[] {
  const { data } = useQuery({
    queryKey: ['odoo', 'stages', relation],
    queryFn: () => {
      if (!relation) return []
      return searchRead<StageInfo[]>(relation, [], ['name', 'sequence', 'fold'], 0, 100, 'sequence')
    },
    enabled: !!relation,
    staleTime: 5 * 60_000,
  })
  return data ?? []
}

export function StatusbarWidget({ value, onChange, readOnly, field, meta }: FieldWidgetProps) {
  // Many2one stage field — always call hook (enabled guards internally)
  const stageRelation = meta?.relation
  const stages = useStages(stageRelation)
  const stageId = Array.isArray(value) ? (value as [number, string])[0] : null

  // Selection field (simple state list)
  const selection = meta?.selection ?? []

  if (stages.length > 0) {
    const currentIdx = stages.findIndex((s) => s.id === stageId)

    return (
      <div className="flex items-center gap-0.5">
        {stages.map((stage, i) => {
          const isCurrent = stage.id === stageId
          const isPast = currentIdx >= 0 && i < currentIdx
          return (
            <button
              key={stage.id}
              type="button"
              disabled={readOnly || isCurrent}
              title={stage.name}
              onClick={() => onChange([stage.id, stage.name])}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                isCurrent
                  ? 'bg-accent text-on-accent'
                  : isPast
                    ? 'bg-success/15 text-success hover:bg-success/25'
                    : 'bg-elevated text-text-muted hover:bg-hover'
              }`}
            >
              {stage.name}
            </button>
          )
        })}
      </div>
    )
  }

  // Fallback: selection-based statusbar
  const currentVal = String(value ?? '')
  const currentIdx = selection.findIndex(([k]) => k === currentVal)

  return (
    <div className="flex items-center gap-0.5">
      {selection.map(([key, label], i) => {
        const isCurrent = key === currentVal
        const isPast = currentIdx >= 0 && i < currentIdx
        return (
          <button
            key={key}
            type="button"
            disabled={readOnly || isCurrent}
            onClick={() => onChange(key)}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              isCurrent
                ? 'bg-accent text-on-accent'
                : isPast
                  ? 'bg-success/15 text-success hover:bg-success/25'
                  : 'bg-elevated text-text-muted hover:bg-hover'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Radio Widget (Phase 24) ────────────────────────────────────────

export function RadioWidget({ field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  const selection = meta?.selection ?? []
  const orientation =
    ((field.options as Record<string, unknown>)?.orientation as string) ?? 'vertical'
  const currentVal = String(value ?? '')

  if (readOnly) {
    const pair = selection.find(([k]) => k === currentVal)
    return <span className="text-sm text-text-primary">{pair?.[1] ?? currentVal}</span>
  }

  return (
    <div className={`flex ${orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-1'}`}>
      {selection.map(([key, label]) => (
        <label
          key={key}
          className="flex items-center gap-2 text-sm text-text-primary cursor-pointer"
        >
          <input
            type="radio"
            name={field.name}
            value={key}
            checked={currentVal === key}
            onChange={() => onChange(key)}
            className="accent-accent"
          />
          {label}
        </label>
      ))}
    </div>
  )
}

// ── Badge Selection Widget (Phase 25) ──────────────────────────────

export function BadgeSelectionWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const selection = meta?.selection ?? []
  const currentVal = String(value ?? '')

  return (
    <div className="flex flex-wrap gap-1.5">
      {selection.map(([key, label]) => {
        const isSelected = key === currentVal
        return (
          <button
            key={key}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-accent text-on-accent'
                : 'bg-elevated text-text-secondary hover:bg-hover'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Label Selection Widget (Phase 25) ──────────────────────────────

export function LabelSelectionWidget({ value, meta }: FieldWidgetProps) {
  const val = String(value ?? '')
  const selection = meta?.selection ?? []
  const pair = selection.find(([k]) => k === val)
  const label = pair?.[1] ?? val

  const classes: Record<string, string> = {
    draft: 'bg-elevated text-text-secondary',
    confirmed: 'bg-info/15 text-info',
    done: 'bg-success/15 text-success',
    cancel: 'bg-danger/15 text-danger',
  }
  const cls = classes[val] ?? 'bg-hover text-text-secondary'

  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  )
}

// ── State Selection Widget (Phase 25) ──────────────────────────────

export function StateSelectionWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const selection = meta?.selection ?? []
  const currentVal = String(value ?? '')
  const colors: Record<string, string> = {
    normal: 'text-text-secondary',
    done: 'text-success',
    blocked: 'text-danger',
  }

  if (readOnly) {
    const color = colors[currentVal] ?? 'text-warning'
    return <span className={`text-lg ${color}`}>★</span>
  }

  return (
    <select
      value={currentVal}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-border-default px-2 py-1 text-sm"
    >
      {selection.map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}
