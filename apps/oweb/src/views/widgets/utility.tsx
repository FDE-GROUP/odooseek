import {
  callKw,
  evalCondition,
  formatRemainingDays,
  parseDomainString,
} from '@odooseek/odoo-client'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { ODOO_INDEXED_COLORS } from '../../lib/odoo-colors'
import { CharWidget } from './basic'
import type { FieldWidgetProps } from './index'

export function EmailWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
  const v = (value as string) ?? ''
  if (readOnly && v) {
    return (
      <a href={`mailto:${v}`} className="text-sm text-accent hover:underline">
        {v}
      </a>
    )
  }
  return <CharWidget value={value} onChange={onChange} readOnly={readOnly} field={field} />
}

export function PhoneWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
  const v = (value as string) ?? ''
  if (readOnly && v) {
    return (
      <a href={`tel:${v}`} className="text-sm text-accent hover:underline">
        {v}
      </a>
    )
  }
  return <CharWidget value={value} onChange={onChange} readOnly={readOnly} field={field} />
}

export function UrlWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
  const v = (value as string) ?? ''
  if (readOnly && v) {
    return (
      <a
        href={v}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent hover:underline"
      >
        {v}
      </a>
    )
  }
  return <CharWidget value={value} onChange={onChange} readOnly={readOnly} field={field} />
}

// ── Many2Many Tags Widget ────────────────────────────────────────────

export function Many2ManyTagsWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const tags: Array<[number, string]> = Array.isArray(value)
    ? value.map((v: unknown) => (Array.isArray(v) ? v : [v, String(v)]) as [number, string])
    : []
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Array<[number, string]>>([])

  const doSearch = useCallback(
    async (q: string) => {
      if (!meta?.relation || !q.trim()) {
        setSearchResults([])
        return
      }
      const domainRestriction =
        parseDomainString(typeof meta?.domain === 'string' ? meta.domain : null) ?? []
      const domain: unknown[] = [['display_name', 'ilike', q]]
      if (domainRestriction.length > 0) domain.push(...domainRestriction)
      const results = await callKw<Array<{ id: number; display_name: string }>>(
        meta.relation,
        'search_read',
        [[domain], ['id', 'display_name']],
        { limit: 10 },
      )
      setSearchResults(results.map((r) => [r.id, r.display_name]))
    },
    [meta?.relation, meta?.domain],
  )

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span key={id} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
            {name}
          </span>
        ))}
      </div>
    )
  }

  const handleSelect = (item: [number, string]) => {
    const currentIds = tags.map(([id]) => id)
    if (!currentIds.includes(item[0])) {
      onChange([[6, 0, [...currentIds, item[0]]]])
    }
    setSearch('')
    setSearchResults([])
  }

  const handleRemove = (id: number) => {
    const remaining = tags.map(([tid]) => tid).filter((tid) => tid !== id)
    onChange([[6, 0, remaining]])
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
          >
            {name}
            <button
              type="button"
              onClick={() => handleRemove(id)}
              className="ml-0.5 text-accent/60 hover:text-accent"
            >
              x
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            doSearch(e.target.value)
          }}
          placeholder="Search..."
          className="w-full rounded border border-border-default bg-root px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
        />
        {searchResults.length > 0 && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full rounded border border-border-subtle bg-surface shadow-lg">
            {searchResults.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect([id, name])}
                className="block w-full px-2 py-1 text-left text-xs text-text-primary hover:bg-hover"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Handle Widget (drag reorder) ────────────────────────────────────

export function HandleWidget({ readOnly }: FieldWidgetProps) {
  if (!readOnly) return null
  return (
    <span className="cursor-grab select-none text-text-muted" title="Drag to reorder">
      ⋮⋮
    </span>
  )
}

// ── Color Picker Widget ─────────────────────────────────────────────

export function ColorPickerWidget({ value, onChange, readOnly, record, model }: FieldWidgetProps) {
  const colorIdx = typeof value === 'number' ? value : Number(value) || 0
  const color =
    colorIdx > 0 && colorIdx < ODOO_INDEXED_COLORS.length ? ODOO_INDEXED_COLORS[colorIdx] : null
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const toast = useToast()

  const pickColor = useCallback(
    async (idx: number) => {
      onChange(idx)
      if (model && record?.id) {
        // Optimistic update: immediately show the new color
        const rid = record.id as number
        queryClient.setQueriesData<Record<string, unknown>[]>(
          { queryKey: ['odoo', 'kanban', model], exact: false },
          (old) => {
            if (!old) return old
            return old.map((r) => (r.id === rid ? { ...r, color: idx } : r))
          },
        )
        try {
          await callKw(model, 'write', [[rid], { color: idx }])
        } catch (err) {
          // Rollback on failure
          queryClient.invalidateQueries({ queryKey: ['odoo', 'kanban', model] })
          toast.error(err instanceof Error ? err.message : 'Failed to update color')
        }
      }
      setOpen(false)
    },
    [onChange, model, record, queryClient, toast],
  )

  // In-place palette for kanban cards (readOnly + model context means inline editing)
  if (readOnly && model && record) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-hover/50"
          title={color ? `Color #${colorIdx}` : 'No color'}
        >
          <span
            className="h-3.5 w-3.5 rounded border border-border-default"
            style={{ backgroundColor: color ?? 'transparent' }}
          />
        </button>
        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-1 flex flex-wrap gap-0.5 rounded-lg border border-border-default bg-surface p-1.5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => pickColor(0)}
              className={`flex h-5 w-5 items-center justify-center rounded border text-[9px] ${colorIdx === 0 ? 'border-accent' : 'border-border-default'}`}
            >
              ×
            </button>
            {ODOO_INDEXED_COLORS.slice(1).map((c, i) => {
              const idx = i + 1
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pickColor(idx)}
                  className={`h-5 w-5 rounded border ${colorIdx === idx ? 'border-accent ring-1 ring-accent' : 'border-border-default'}`}
                  style={{ backgroundColor: c }}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Read-only mode without model context (plain display)
  if (readOnly) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="h-4 w-4 rounded border border-border-default"
          style={{ backgroundColor: color ?? 'transparent' }}
        />
        <span className="text-xs text-text-secondary">
          {color ? `Color #${colorIdx}` : 'No color'}
        </span>
      </div>
    )
  }

  // Edit mode (form view)
  return (
    <div className="flex flex-wrap items-center gap-1 py-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => pickColor(0)}
        className={`flex h-6 w-6 items-center justify-center rounded border text-[10px] transition-colors ${colorIdx === 0 ? 'border-accent ring-1 ring-accent' : 'border-border-default hover:border-border-strong'}`}
        title="No color"
      >
        <span className="text-text-muted">×</span>
      </button>
      {ODOO_INDEXED_COLORS.slice(1).map((c, i) => {
        const idx = i + 1
        return (
          <button
            key={idx}
            type="button"
            onClick={() => pickColor(idx)}
            className={`h-6 w-6 rounded border transition-colors ${colorIdx === idx ? 'border-accent ring-1 ring-accent' : 'border-border-default hover:border-border-strong'}`}
            style={{ backgroundColor: c }}
            title={`Color #${idx}`}
          />
        )
      })}
    </div>
  )
}

// ── Progressbar Widget (form) ───────────────────────────────────────

export function ProgressbarWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  const pct = Math.min(100, Math.max(0, Number(value) ?? 0))
  const barRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newPct = Math.round((x / rect.width) * 100)
    onChange(Math.min(100, Math.max(0, newPct)))
  }

  return (
    <div className="flex items-center gap-2">
      <div
        ref={barRef}
        className={`h-3 flex-1 rounded-full bg-border-default/30 ${readOnly ? '' : 'cursor-pointer'}`}
        onClick={handleClick}
      >
        <div
          className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-success' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-text-muted w-8 text-right">{pct}%</span>
    </div>
  )
}

// ── Boolean Favorite Widget (Phase 26) ─────────────────────────────

export function BooleanFavoriteWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  const active = Boolean(value)
  return (
    <button
      type="button"
      onClick={() => !readOnly && onChange(!active)}
      className={`text-lg ${active ? 'text-warning' : 'text-border-default hover:text-warning/80'}`}
      disabled={readOnly}
    >
      {active ? '★' : '☆'}
    </button>
  )
}

// ── Boolean Icon Widget (Phase 26) ─────────────────────────────────

export function BooleanIconWidget({ value, onChange, field }: FieldWidgetProps) {
  const active = Boolean(value)
  const icon = ((field.options as Record<string, unknown>)?.icon as string) ?? 'fa-check-square-o'
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`text-lg ${active ? 'text-accent' : 'text-border-default hover:text-accent/60'}`}
    >
      <i className={`fa ${icon}`} />
    </button>
  )
}

// ── Copy Clipboard Widget (Phase 26) ──────────────────────────────

export function CopyClipboardWidget({ value }: FieldWidgetProps) {
  const [copied, setCopied] = useState(false)
  const text = String(value ?? '')

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-primary">{text}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-xs text-text-muted hover:text-accent"
        title="Copy"
      >
        {copied ? '✓' : '📋'}
      </button>
    </div>
  )
}

// ── Remaining Days Widget (Phase 26) ───────────────────────────────

export function RemainingDaysWidget({ value }: FieldWidgetProps) {
  const { text, color } = formatRemainingDays(value)
  if (!text) return <span className="text-sm text-text-muted">—</span>
  return <span className={`text-sm font-medium ${color}`}>{text}</span>
}

// ── Image URL Widget (Phase 26) ────────────────────────────────────

export function ImageUrlWidget({ field, value }: FieldWidgetProps) {
  const url = String(value ?? '')
  const opts = (field.options as Record<string, unknown>) ?? {}
  const w = opts.width ? Number(opts.width) : undefined
  const h = opts.height ? Number(opts.height) : undefined

  if (!url) return <span className="text-sm text-text-muted">—</span>
  return (
    <img
      src={url}
      alt={field.string || ''}
      className="max-h-32 rounded border border-border-subtle object-contain"
      style={w || h ? { maxWidth: w, maxHeight: h } : undefined}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src = ''
      }}
    />
  )
}

// ── Percent Pie Widget (Phase 26) ──────────────────────────────────

export function PercentPieWidget({ value }: FieldWidgetProps) {
  const pct = Math.min(100, Math.max(0, Number(value) * 100))
  const r = 16
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--color-border-default)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-accent"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="text-xs text-text-muted">{pct.toFixed(1)}%</span>
    </div>
  )
}

// ── Web Ribbon Widget ────────────────────────────────────────────────

export function WebRibbonWidget({ field, record }: FieldWidgetProps) {
  const opts = (field.options as Record<string, unknown>) ?? {}
  const title = (opts.title as string) ?? ''
  const bgColor = (opts.bg_color as string) ?? 'text-bg-danger'

  if (!title) return null
  if (field.invisible && record && evalCondition(field.invisible, record)) return null

  const colorMap: Record<string, string> = {
    'text-bg-danger': 'bg-danger',
    'text-bg-warning': 'bg-warning',
    'text-bg-success': 'bg-success',
    'text-bg-info': 'bg-info',
  }
  const bg = colorMap[bgColor] ?? 'bg-danger'

  return (
    <div
      className={`pointer-events-none absolute -right-2 -top-2 z-10 rounded px-2 py-0.5 text-[10px] font-bold text-on-accent shadow ${bg}`}
      style={{ transform: 'rotate(3deg)' }}
    >
      {title}
    </div>
  )
}

// ── Kanban Activity Widget ──────────────────────────────────────────

export function KanbanActivityWidget({ value }: FieldWidgetProps) {
  const state = String(value ?? '')
  const config: Record<string, { color: string; label: string }> = {
    planned: { color: 'bg-success', label: 'Planned' },
    today: { color: 'bg-warning', label: 'Today' },
    overdue: { color: 'bg-danger', label: 'Overdue' },
  }
  const info = config[state]
  if (!info) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${info.color}`} />
      <span className="text-text-muted">{info.label}</span>
    </span>
  )
}

// ── Rotting Widget (CRM stage duration) ─────────────────────────────

export function RottingWidget({ value }: FieldWidgetProps) {
  const days = Number(value)
  if (Number.isNaN(days) || days <= 0) return null

  const isOverdue = days > 14
  return (
    <span className={`text-xs ${isOverdue ? 'text-danger font-medium' : 'text-text-muted'}`}>
      {days}d
    </span>
  )
}
