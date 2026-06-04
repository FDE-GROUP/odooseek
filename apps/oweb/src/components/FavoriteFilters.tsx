import type { IrFilterRecord } from '@odooseek/odoo-client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFavoriteFilters } from '../hooks/useFavoriteFilters'

interface FavoriteFiltersProps {
  model: string | undefined
  currentDomain: unknown[]
  currentGroupBys: string[]
  onApplyFilter: (domain: unknown[], groupBys: string[]) => void
}

export function FavoriteFilters({
  model,
  currentDomain,
  currentGroupBys,
  onApplyFilter,
}: FavoriteFiltersProps) {
  const { filters, saveFilter, deleteFilter, isSaving } = useFavoriteFilters(model)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveName, setSaveName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setShowSaveForm(false)
        setSaveName('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const handleApply = useCallback(
    (filter: IrFilterRecord) => {
      let domain: unknown[]
      try {
        domain = typeof filter.domain === 'string' ? JSON.parse(filter.domain) : filter.domain
      } catch {
        domain = []
      }
      const ctx = filter.context || {}
      const groupBys: string[] = ctx.group_by
        ? Array.isArray(ctx.group_by)
          ? ctx.group_by
          : [ctx.group_by as string]
        : []
      onApplyFilter(domain, groupBys)
      setShowDropdown(false)
    },
    [onApplyFilter],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent, filterId: number) => {
      e.stopPropagation()
      deleteFilter(filterId)
    },
    [deleteFilter],
  )

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = saveName.trim()
      if (!trimmed || !model) return
      const context: Record<string, unknown> = {}
      if (currentGroupBys.length > 0) {
        context.group_by = currentGroupBys
      }
      saveFilter({
        name: trimmed,
        model_id: model,
        domain: currentDomain,
        context,
      })
      setSaveName('')
      setShowSaveForm(false)
      setShowDropdown(false)
    },
    [saveName, model, currentDomain, currentGroupBys, saveFilter],
  )

  const hasActiveFilters = currentDomain.length > 0 || currentGroupBys.length > 0

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((v) => !v)}
        className="flex h-full items-center gap-1 border-0 border-l border-border-default px-2 text-xs text-text-secondary transition-colors hover:bg-hover"
        title="Favorite filters"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <title>Favorites</title>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <title>Favorites</title>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Favorites
          </div>

          {filters.length === 0 && !showSaveForm && (
            <div className="py-2 text-center text-xs text-text-muted">No saved filters</div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className="group flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-hover text-left w-full"
                onClick={() => handleApply(filter)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.currentTarget.click()
                  }
                }}
              >
                <span className="truncate">{filter.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, filter.id)}
                  className="ml-1 hidden shrink-0 text-text-muted hover:text-text-primary group-hover:block"
                  title="Delete filter"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <title>Remove</title>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </button>
            ))}
          </div>

          <div className="mt-2 border-t border-border-subtle pt-2">
            {!showSaveForm ? (
              <button
                type="button"
                onClick={() => setShowSaveForm(true)}
                disabled={!hasActiveFilters}
                className="w-full rounded px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save current filter
              </button>
            ) : (
              <form onSubmit={handleSave} className="space-y-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Filter name"
                  className="w-full rounded border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  // biome-ignore lint/a11y/noAutofocus: intentional focus for immediate user interaction
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    disabled={isSaving || !saveName.trim()}
                    className="flex-1 rounded bg-accent px-2 py-1 text-xs font-medium text-on-accent transition-colors hover:brightness-110 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveForm(false)
                      setSaveName('')
                    }}
                    className="rounded border border-border-default px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-hover"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
