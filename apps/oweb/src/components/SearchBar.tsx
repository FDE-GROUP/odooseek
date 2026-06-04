import type { SearchFilter, SearchGroupBy, ViewField } from '@odooseek/odoo-client'
import { nameSearch } from '@odooseek/odoo-client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FavoriteFilters } from './FavoriteFilters'

function _buildDateDomains(fieldName: string): { key: string; label: string; domain: unknown[] }[] {
  const now = new Date()
  const _fmt = (d: Date) => d.toISOString().slice(0, 10)
  const startOfDay = (d: Date) => {
    const s = new Date(d)
    s.setHours(0, 0, 0, 0)
    return s.toISOString().slice(0, 19).replace('T', ' ')
  }
  const endOfDay = (d: Date) => {
    const e = new Date(d)
    e.setHours(23, 59, 59, 999)
    return e.toISOString().slice(0, 19).replace('T', ' ')
  }
  const presets: { key: string; label: string; domain: unknown[] }[] = [
    {
      key: 'today',
      label: 'Today',
      domain: [
        [fieldName, '>=', startOfDay(now)],
        [fieldName, '<=', endOfDay(now)],
      ],
    },
  ]
  {
    const s = new Date(now)
    s.setDate(s.getDate() - 6)
    presets.push({
      key: 'last7',
      label: 'Last 7 Days',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(now)],
      ],
    })
  }
  {
    const s = new Date(now)
    s.setDate(s.getDate() - 29)
    presets.push({
      key: 'last30',
      label: 'Last 30 Days',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(now)],
      ],
    })
  }
  {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    presets.push({
      key: 'mtd',
      label: 'Month to Date',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(now)],
      ],
    })
  }
  {
    const e = new Date(now.getFullYear(), now.getMonth(), 0)
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    presets.push({
      key: 'lastMonth',
      label: 'Last Month',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(e)],
      ],
    })
  }
  {
    const s = new Date(now.getFullYear(), 0, 1)
    presets.push({
      key: 'ytd',
      label: 'Year to Date',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(now)],
      ],
    })
  }
  {
    const s = new Date(now)
    s.setFullYear(s.getFullYear() - 1)
    s.setDate(s.getDate() + 1)
    presets.push({
      key: 'last12m',
      label: 'Last 12 Months',
      domain: [
        [fieldName, '>=', startOfDay(s)],
        [fieldName, '<=', endOfDay(now)],
      ],
    })
  }
  return presets
}

export interface SearchBarProps {
  onSearch: (domain: unknown[]) => void
  onGroupByChange?: (groupBys: string[]) => void
  placeholder?: string
  searchFields?: ViewField[]
  filters?: SearchFilter[]
  groupByFilters?: SearchGroupBy[]
  model?: string
  /** Match control panel toolbar height (h-7) when embedded in ControlPanel. */
  compact?: boolean
}

function combineDomains(domainGroups: unknown[][]): unknown[] {
  const nonEmpty = domainGroups.filter((g) => g.length > 0)
  if (nonEmpty.length === 0) return []
  if (nonEmpty.length === 1) return nonEmpty[0]

  const result: unknown[] = []
  for (let i = 0; i < nonEmpty.length - 1; i++) {
    result.push('&')
  }
  for (const g of nonEmpty) {
    for (const item of g) result.push(item)
  }
  return result
}

interface AcFieldItem {
  type: 'field'
  fieldName: string
  fieldLabel: string
  operator: string
  value: string
  domain: unknown[]
}

interface AcRecordItem {
  type: 'record'
  id: number
  displayName: string
}

type AcItem = AcFieldItem | AcRecordItem

export function SearchBar({
  onSearch,
  onGroupByChange,
  placeholder = 'Search...',
  searchFields,
  filters = [],
  groupByFilters = [],
  model,
  compact = false,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState('')
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [activeGroupBys, setActiveGroupBys] = useState<string[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showGroupByMenu, setShowGroupByMenu] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const groupByMenuRef = useRef<HTMLDivElement>(null)

  // Autocomplete state
  const [acItems, setAcItems] = useState<AcItem[]>([])
  const [showAc, setShowAc] = useState(false)
  const [acHighlight, setAcHighlight] = useState(-1)
  const acRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advancedFields = searchFields?.length
    ? searchFields.map((f) => ({ name: f.name, label: f.string || f.name }))
    : [
        { name: 'name', label: 'Name' },
        { name: 'id', label: 'ID' },
        { name: 'create_date', label: 'Created' },
        { name: 'write_date', label: 'Updated' },
      ]

  const [field, setField] = useState(advancedFields[0]?.name ?? 'name')
  const [operator, setOperator] = useState('ilike')
  const [value, setValue] = useState('')
  const [keywordDomain, setKeywordDomain] = useState<unknown[]>([])

  const fieldMetaMap = useMemo(() => {
    const map: Record<string, { type?: string; selection?: Array<[string, string]> }> = {}
    if (searchFields) {
      for (const f of searchFields) {
        map[f.name] = {
          type: f.type,
          selection: (f as unknown as { selection?: Array<[string, string]> }).selection,
        }
      }
    }
    return map
  }, [searchFields])

  const operatorsForField = useMemo(() => {
    const meta = fieldMetaMap[field]
    const type = meta?.type
    if (type === 'boolean')
      return [
        ['=', 'is'],
        ['!=', 'is not'],
      ]
    if (type === 'integer' || type === 'float' || type === 'monetary') {
      return [
        ['=', 'equals'],
        ['!=', 'not equal'],
        ['>', 'greater than'],
        ['<', 'less than'],
        ['>=', '>='],
        ['<=', '<='],
      ]
    }
    if (type === 'date' || type === 'datetime') {
      return [
        ['=', 'equals'],
        ['!=', 'not equal'],
        ['>', 'after'],
        ['<', 'before'],
        ['>=', 'on or after'],
        ['<=', 'on or before'],
      ]
    }
    if (type === 'selection')
      return [
        ['=', 'is'],
        ['!=', 'is not'],
      ]
    if (type === 'many2one')
      return [
        ['=', 'equals'],
        ['!=', 'not equal'],
      ]
    return [
      ['ilike', 'contains'],
      ['not ilike', 'not contains'],
      ['=', 'equals'],
      ['!=', 'not equal'],
      ['=ilike', 'starts with'],
    ]
  }, [field, fieldMetaMap])

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false)
      }
      if (groupByMenuRef.current && !groupByMenuRef.current.contains(e.target as Node)) {
        setShowGroupByMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close autocomplete dropdown on click outside
  useEffect(() => {
    if (!showAc) return
    const handleClick = (e: MouseEvent) => {
      if (acRef.current && !acRef.current.contains(e.target as Node)) {
        setShowAc(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showAc])

  // Debounced autocomplete: field suggestions + name_search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = keyword.trim()
    if (trimmed.length < 2) {
      setAcItems([])
      setShowAc(false)
      setAcHighlight(-1)
      return
    }

    // Build field suggestions immediately
    const fieldSuggestions: AcItem[] = []
    if (searchFields && searchFields.length > 0) {
      for (const sf of searchFields) {
        const label = sf.string || sf.name
        const op = sf.operator || 'ilike'
        fieldSuggestions.push({
          type: 'field',
          fieldName: sf.name,
          fieldLabel: label,
          operator: op,
          value: trimmed,
          domain: sf.filter_domain
            ? replaceFilterDomainValue(sf.filter_domain, trimmed)
            : [[sf.name, op, trimmed]],
        })
      }
    } else {
      fieldSuggestions.push({
        type: 'field',
        fieldName: 'name',
        fieldLabel: 'Name',
        operator: 'ilike',
        value: trimmed,
        domain: [['name', 'ilike', trimmed]],
      })
    }

    // If no model, show field suggestions only
    if (!model) {
      setAcItems(fieldSuggestions)
      setShowAc(true)
      setAcHighlight(-1)
      return
    }

    // Debounce name_search for record items
    debounceRef.current = setTimeout(async () => {
      try {
        const records = await nameSearch(model, trimmed)
        const recordItems: AcItem[] = records.map(([id, displayName]) => ({
          type: 'record',
          id,
          displayName,
        }))
        setAcItems([...fieldSuggestions, ...recordItems])
        setShowAc(fieldSuggestions.length > 0 || recordItems.length > 0)
        setAcHighlight(-1)
      } catch {
        setAcItems(fieldSuggestions)
        setShowAc(fieldSuggestions.length > 0)
        setAcHighlight(-1)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [keyword, model, searchFields])

  const activeFilterDomains = useMemo(() => {
    return filters
      .filter((f) => f.domain.length > 0 && activeFilters.has(f.name || f.string))
      .map((f) => f.domain)
  }, [filters, activeFilters])

  const domainFilters = filters.filter((f) => f.domain.length > 0)

  const toggleFilter = useCallback(
    (filter: SearchFilter) => {
      const key = filter.name || filter.string
      const next = new Set(activeFilters)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      setActiveFilters(next)

      const newFilterDomains = filters
        .filter((f) => f.domain.length > 0 && next.has(f.name || f.string))
        .map((f) => f.domain)
      const domain = combineDomains([...newFilterDomains, keywordDomain])
      onSearch(domain)
    },
    [activeFilters, filters, keywordDomain, onSearch],
  )

  const toggleGroupBy = useCallback(
    (gb: SearchGroupBy) => {
      const fieldRef = gb.interval ? `${gb.fieldName}:${gb.interval}` : gb.fieldName
      setActiveGroupBys((prev) => {
        const next = prev.includes(fieldRef) ? prev.filter((f) => f !== fieldRef) : [fieldRef]
        onGroupByChange?.(next)
        return next
      })
    },
    [onGroupByChange],
  )

  const doSearch = useCallback(
    (domain: unknown[]) => {
      setKeyword('')
      setKeywordDomain(domain)
      const combined = combineDomains([...activeFilterDomains, domain])
      onSearch(combined)
    },
    [activeFilterDomains, onSearch],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      const cursorAtStart = input.selectionStart === 0 && input.selectionEnd === 0

      if (e.key === 'Backspace' && cursorAtStart) {
        // Remove last facet — Odoo behavior
        e.preventDefault()
        if (keywordDomain.length > 0) {
          setKeyword('')
          setKeywordDomain([])
          const domain = combineDomains(activeFilterDomains)
          onSearch(domain)
        } else if (activeGroupBys.length > 0) {
          const next = activeGroupBys.slice(0, -1)
          setActiveGroupBys(next)
          onGroupByChange?.(next)
        } else if (activeFilters.size > 0) {
          const keys = [...activeFilters]
          const next = new Set(activeFilters)
          next.delete(keys[keys.length - 1])
          setActiveFilters(next)
          const newFilterDomains = filters
            .filter((f) => f.domain.length > 0 && next.has(f.name || f.string))
            .map((f) => f.domain)
          const domain = combineDomains([...newFilterDomains, keywordDomain])
          onSearch(domain)
        }
        return
      }

      // Arrow key navigation in autocomplete
      if (showAc && acItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setAcHighlight((prev) => (prev < acItems.length - 1 ? prev + 1 : 0))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setAcHighlight((prev) => (prev > 0 ? prev - 1 : acItems.length - 1))
          return
        }
        if (e.key === 'Enter' && acHighlight >= 0) {
          e.preventDefault()
          const item = acItems[acHighlight]
          if (item.type === 'field') {
            doSearch(item.domain)
          } else {
            doSearch([['id', '=', item.id]])
          }
          setShowAc(false)
          setAcHighlight(-1)
          return
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const trimmed = keyword.trim()
        if (!trimmed) {
          const domain = combineDomains(activeFilterDomains)
          setKeywordDomain([])
          onSearch(domain)
          return
        }
        const kwDomain = [[field, operator, trimmed]]
        setKeywordDomain(kwDomain)
        const domain = combineDomains([...activeFilterDomains, kwDomain])
        onSearch(domain)
        setShowAc(false)
      } else if (e.key === 'Escape') {
        if (showAc) {
          setShowAc(false)
          setAcHighlight(-1)
          return
        }
        setKeyword('')
        setValue('')
        setKeywordDomain([])
        setActiveFilters(new Set())
        setActiveGroupBys([])
        onSearch([])
        onGroupByChange?.([])
      }
    },
    [
      keyword,
      field,
      operator,
      activeFilterDomains,
      activeFilters,
      activeGroupBys,
      keywordDomain,
      filters,
      onSearch,
      onGroupByChange,
      showAc,
      acItems,
      acHighlight,
      doSearch,
    ],
  )

  const handleAcSelect = useCallback(
    (item: AcItem) => {
      setShowAc(false)
      setAcHighlight(-1)
      if (item.type === 'field') {
        doSearch(item.domain)
      } else {
        doSearch([['id', '=', item.id]])
      }
    },
    [doSearch],
  )

  const handleApplyFavoriteFilter = useCallback(
    (domain: unknown[], groupBys: string[]) => {
      setKeywordDomain(domain)
      setActiveGroupBys(groupBys)
      const combined = combineDomains([...activeFilterDomains, domain])
      onSearch(combined)
      onGroupByChange?.(groupBys)
    },
    [activeFilterDomains, onSearch, onGroupByChange],
  )

  const handleAdvancedSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (!trimmed) return
      const kwDomain = [[field, operator, trimmed]]
      setKeywordDomain(kwDomain)
      const domain = combineDomains([...activeFilterDomains, kwDomain])
      onSearch(domain)
      setShowAdvanced(false)
      setShowFilterMenu(false)
    },
    [field, operator, value, activeFilterDomains, onSearch],
  )

  const removeFilterFacet = useCallback(
    (filter: SearchFilter) => {
      const key = filter.name || filter.string
      const next = new Set(activeFilters)
      next.delete(key)
      setActiveFilters(next)

      const newFilterDomains = filters
        .filter((f) => f.domain.length > 0 && next.has(f.name || f.string))
        .map((f) => f.domain)
      const domain = combineDomains([...newFilterDomains, keywordDomain])
      onSearch(domain)
    },
    [activeFilters, filters, keywordDomain, onSearch],
  )

  const removeGroupByFacet = useCallback(
    (gb: SearchGroupBy) => {
      const ref = gb.interval ? `${gb.fieldName}:${gb.interval}` : gb.fieldName
      const next = activeGroupBys.filter((f) => f !== ref)
      setActiveGroupBys(next)
      onGroupByChange?.(next)
    },
    [activeGroupBys, onGroupByChange],
  )

  const clearAll = useCallback(() => {
    setKeyword('')
    setValue('')
    setKeywordDomain([])
    setActiveFilters(new Set())
    setActiveGroupBys([])
    onSearch([])
    onGroupByChange?.([])
  }, [onSearch, onGroupByChange])

  const activeFilterFacets = domainFilters.filter((f) => activeFilters.has(f.name || f.string))
  const activeGroupByFacets = groupByFilters.filter((gb) => {
    const ref = gb.interval ? `${gb.fieldName}:${gb.interval}` : gb.fieldName
    return activeGroupBys.includes(ref)
  })

  const hasAny = activeFilterFacets.length > 0 || activeGroupByFacets.length > 0 || !!keyword

  return (
    <div className={compact ? 'relative' : 'relative space-y-2'}>
      <div
        className={`relative flex min-w-0 flex-1 items-center rounded-lg border border-border-default bg-surface transition-colors focus-within:border-accent ${compact ? 'h-7' : ''}`}
      >
        {/* Search icon */}
        <span className="shrink-0 pl-3 text-text-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>

        {/* Facets + Input area */}
        <div
          className={`flex min-w-0 flex-1 flex-wrap items-center gap-1 px-2 ${compact ? 'py-0' : 'py-1'}`}
        >
          {activeFilterFacets.map((f, i) => (
            <FacetChip
              key={`facet-f-${i}`}
              label={f.string}
              color="blue"
              onRemove={() => removeFilterFacet(f)}
            />
          ))}
          {activeGroupByFacets.map((gb, i) => {
            const _ref = gb.interval ? `${gb.fieldName}:${gb.interval}` : gb.fieldName
            return (
              <FacetChip
                key={`facet-gb-${i}`}
                label={gb.string}
                color="green"
                onRemove={() => removeGroupByFacet(gb)}
              />
            )
          })}
          {keywordDomain.length > 0 && keyword && (
            <FacetChip
              label={`${advancedFields.find((f) => f.name === field)?.label || field} ${operator === 'ilike' ? '∋' : operator} ${keyword}`}
              color="blue"
              onRemove={() => {
                setKeyword('')
                setKeywordDomain([])
                const domain = combineDomains(activeFilterDomains)
                onSearch(domain)
              }}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasAny ? '' : placeholder}
            className={`min-w-[80px] flex-1 border-0 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none ${compact ? 'py-0' : 'py-1'}`}
          />
        </div>

        {/* Right side buttons */}
        <div className="flex shrink-0 items-center self-stretch">
          <FavoriteFilters
            model={model}
            currentDomain={keywordDomain}
            currentGroupBys={activeGroupBys}
            onApplyFilter={handleApplyFavoriteFilter}
          />
          {domainFilters.length > 0 && (
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowFilterMenu((v) => !v)
                  setShowGroupByMenu(false)
                }}
                className="flex h-full items-center gap-1 border-0 border-l border-border-default px-2 text-xs text-text-secondary transition-colors hover:bg-hover"
                title="Filters"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface p-3 shadow-lg">
                  {domainFilters.length > 0 && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                      Filters
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-2">
                    {domainFilters.map((f, i) => {
                      const key = f.name || f.string
                      return (
                        <label
                          key={`menu-f-${i}`}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-text-primary transition-colors hover:bg-hover"
                        >
                          <input
                            type="checkbox"
                            checked={activeFilters.has(key)}
                            onChange={() => toggleFilter(f)}
                            className="h-3 w-3 rounded accent-accent"
                          />
                          <span className="truncate">{f.string}</span>
                        </label>
                      )
                    })}
                  </div>
                  {hasAny && (
                    <>
                      <div className="my-2 border-t border-border-subtle" />
                      <button
                        type="button"
                        onClick={clearAll}
                        className="w-full rounded px-2 py-1 text-left text-xs text-text-secondary transition-colors hover:bg-hover"
                      >
                        Clear all filters
                      </button>
                    </>
                  )}
                  <div className="my-2 border-t border-border-subtle" />
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="w-full rounded px-2 py-1 text-left text-xs text-accent transition-colors hover:bg-accent/5"
                  >
                    Add Custom Filter
                  </button>
                </div>
              )}
            </div>
          )}
          {groupByFilters.length > 0 && (
            <div className="relative" ref={groupByMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowGroupByMenu((v) => !v)
                  setShowFilterMenu(false)
                }}
                className="flex h-full items-center gap-1 rounded-r-lg border-0 border-l border-border-default px-2 text-xs text-text-secondary transition-colors hover:bg-hover"
                title="Group By"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9v12" />
                </svg>
              </button>
              {showGroupByMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface p-3 shadow-lg">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9v12" />
                    </svg>
                    Group By
                  </div>
                  <div className="grid grid-cols-2 gap-x-2">
                    {groupByFilters.map((gb, i) => {
                      const ref = gb.interval ? `${gb.fieldName}:${gb.interval}` : gb.fieldName
                      return (
                        <label
                          key={`menu-gb-${i}`}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-text-primary transition-colors hover:bg-hover"
                        >
                          <input
                            type="checkbox"
                            checked={activeGroupBys.includes(ref)}
                            onChange={() => toggleGroupBy(gb)}
                            className="h-3 w-3 rounded accent-accent"
                          />
                          <span className="truncate">{gb.string}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showAc && acItems.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border-subtle bg-surface py-1 shadow-lg">
            {acItems.map((item, idx) => (
              <button
                key={item.type === 'field' ? `f-${item.fieldName}` : `r-${item.id}`}
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-hover ${
                  idx === acHighlight ? 'bg-hover' : ''
                }`}
                onClick={() => handleAcSelect(item)}
                onMouseEnter={() => setAcHighlight(idx)}
              >
                {item.type === 'field' ? (
                  <>
                    <span className="text-text-muted">Search</span>
                    <span className="font-medium text-text-primary">{item.fieldLabel}</span>
                    <span className="text-text-muted">for:</span>
                    <span className="italic text-accent">{item.value}</span>
                  </>
                ) : (
                  <span className="max-w-full truncate text-text-primary">{item.displayName}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced / Custom Filter form */}
      {showAdvanced && (
        <form onSubmit={handleAdvancedSubmit} className="flex gap-2">
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value)
              setOperator(operatorsForField[0]?.[0] ?? 'ilike')
            }}
            className="rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
          >
            {advancedFields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
          >
            {operatorsForField.map(([op, label]) => (
              <option key={op} value={op}>
                {label}
              </option>
            ))}
          </select>
          {fieldMetaMap[field]?.selection ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">-- Select --</option>
              {fieldMetaMap[field].selection?.map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={
                fieldMetaMap[field]?.type === 'date'
                  ? 'date'
                  : fieldMetaMap[field]?.type === 'datetime'
                    ? 'datetime-local'
                    : 'text'
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="value"
              className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          )}
          <button
            type="submit"
            className="rounded bg-accent px-3 py-1 text-xs font-medium text-on-accent transition-colors hover:brightness-110"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced(false)}
            className="rounded border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:bg-hover"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

/** Replace {{value}} placeholder in filter_domain with actual value */
function replaceFilterDomainValue(domain: unknown, value: string): unknown[] {
  const json = JSON.stringify(domain)
  const replaced = json.replace(/\{\{value\}\}/g, value).replace(/"/g, "'")
  try {
    return JSON.parse(replaced.replace(/'/g, '"'))
  } catch {
    return domain as unknown[]
  }
}

/** Two-part facet chip with Odoo-style fade-in animation */
function FacetChip({
  label,
  color,
  onRemove,
}: {
  label: string
  color: 'blue' | 'green'
  onRemove: () => void
}) {
  const labelClass = color === 'green' ? 'bg-success text-on-accent' : 'bg-accent text-on-accent'
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded text-nowrap animate-fade-slide-in">
      <span
        className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium ${labelClass}`}
      >
        <span className="max-w-[6rem] truncate">{label}</span>
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className={`flex items-center px-1 text-[10px] ${
          color === 'green'
            ? 'bg-success/10 text-success hover:bg-success/20'
            : 'bg-accent/10 text-accent hover:bg-accent/20'
        }`}
      >
        ×
      </button>
    </span>
  )
}
