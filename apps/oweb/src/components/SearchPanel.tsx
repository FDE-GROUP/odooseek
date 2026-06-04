import type {
  ParsedSearchPanel,
  SearchPanelCategory,
  SearchPanelField,
} from '@odooseek/odoo-client'
import { callKw, searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

interface SearchPanelProps {
  model: string
  searchPanel: ParsedSearchPanel
  domain: unknown[]
  onCategoryChange: (domain: unknown[]) => void
}

export function SearchPanel({ model, searchPanel, domain, onCategoryChange }: SearchPanelProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, number | string | null>>({})

  const panelFields = searchPanel.fields

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto border-r border-border-subtle bg-surface/30">
      {panelFields.map((f) => (
        <SearchPanelSection
          key={f.name}
          model={model}
          field={f}
          domain={domain}
          activeId={activeFilters[f.name] ?? null}
          onSelect={(id) => {
            const next = { ...activeFilters, [f.name]: id || null }
            setActiveFilters(next)
            const extra: unknown[] = []
            for (const [fieldName, val] of Object.entries(next)) {
              if (val != null) {
                extra.push([fieldName, '=', val])
              }
            }
            onCategoryChange(extra)
          }}
        />
      ))}
    </div>
  )
}

function SearchPanelSection({
  model,
  field,
  domain,
  activeId,
  onSelect,
}: {
  model: string
  field: SearchPanelField
  domain: unknown[]
  activeId: number | string | null
  onSelect: (id: number | string | null) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const queryKey = ['odoo', 'searchpanel', model, field.name, JSON.stringify(domain)]
  const { data: categories, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const method =
          field.select === 'multi' ? 'search_panel_select_multi_range' : 'search_panel_select_range'
        const result = await callKw<{
          values: Array<{
            id: number | string
            display_name: string
            __count?: number
            parent_id?: [number, string] | false
          }>
        }>(model, method, [field.name], {
          search_domain: domain,
          enable_counters: field.enableCounters,
          expand: false,
          limit: field.limit,
          group_by: field.groupBy,
        })
        return (result?.values ?? []) as SearchPanelCategory[]
      } catch {
        try {
          const meta = await callKw<Record<string, { type: string; relation?: string }>>(
            model,
            'fields_get',
            [[field.name]],
            { attributes: ['type', 'relation'] },
          )
          const fieldMeta = meta?.[field.name]
          if (fieldMeta?.relation) {
            const records = await searchRead<Array<{ id: number; display_name: string }>>(
              fieldMeta.relation,
              [],
              ['display_name'],
              0,
              field.limit ?? 200,
              'display_name',
            )
            return records.map((r) => ({
              id: r.id,
              displayName: r.display_name,
            })) as SearchPanelCategory[]
          }
        } catch {
          /* no fallback available */
        }
        return [] as SearchPanelCategory[]
      }
    },
    staleTime: 30_000,
  })

  const displayCategories = useMemo(() => {
    if (!categories) return []
    const mapped: SearchPanelCategory[] = (categories as SearchPanelCategory[]).map((c) => ({
      id: c.id as number | string,
      displayName: c.displayName ?? c.display_name ?? String(c.id),
      count: c.__count,
    }))
    if (field.limit && !showAll) {
      return mapped.slice(0, field.limit)
    }
    return mapped
  }, [categories, field.limit, showAll])

  const totalCount = categories?.length ?? 0

  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-hover/50"
      >
        {field.icon && <i className={`fa ${field.icon} w-4 text-center`} />}
        <span className="flex-1 text-left truncate">
          {field.string ||
            field.name
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .replace(/\bId\b/g, '')}
        </span>
        <span className="text-[10px]">{expanded ? '▼' : '►'}</span>
      </button>
      {expanded && (
        <div>
          {activeId != null && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-accent hover:bg-hover/50"
            >
              ✕ Clear filter
            </button>
          )}
          {isLoading ? (
            <div className="px-4 py-4 flex justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : displayCategories.length === 0 ? (
            <div className="px-4 py-2 text-[11px] text-text-muted">No categories</div>
          ) : (
            displayCategories.map((cat: SearchPanelCategory) => (
              <button
                key={String(cat.id)}
                type="button"
                onClick={() => onSelect(activeId === cat.id ? null : cat.id)}
                className={`flex w-full items-center gap-2 px-3 py-1 text-xs hover:bg-hover/50 ${
                  activeId === cat.id
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-text-secondary'
                }`}
              >
                <span className="flex-1 text-left truncate">
                  {cat.displayName || String(cat.id)}
                </span>
                {cat.count != null && (
                  <span className="text-[10px] text-text-muted tabular-nums">{cat.count}</span>
                )}
              </button>
            ))
          )}
          {field.limit && totalCount > field.limit && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="w-full px-3 py-1 text-[11px] text-accent hover:bg-hover/50 text-center"
            >
              {showAll ? `Show less` : `Show all (${totalCount})`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
