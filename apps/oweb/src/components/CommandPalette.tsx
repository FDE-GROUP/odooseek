import { fetchMenus, flattenMenuItems, type MenusData } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { menuEntryFromOdoo, navigateMenuEntry } from '../lib/menu-navigation'

/** Fuzzy match: returns a score (higher = better) or -1 if no match. */
export function fuzzyMatch(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  // Exact substring gets highest score
  const idx = t.indexOf(q)
  if (idx !== -1) return 1000 - idx
  // Fuzzy: each char must appear in order
  let ti = 0
  let score = 0
  for (let qi = 0; qi < q.length; qi++) {
    const pos = t.indexOf(q[qi], ti)
    if (pos === -1) return -1
    // Consecutive chars bonus
    score += pos === ti ? 10 : 1
    ti = pos + 1
  }
  return score
}

const LISTBOX_ID = 'cmd-palette-listbox'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        setQuery('')
        setHighlightIndex(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Fetch menus for search
  const { data: menus } = useQuery<MenusData>({
    queryKey: ['odoo', 'menus'],
    queryFn: fetchMenus,
    enabled: open && isAuthenticated,
    staleTime: 15 * 60_000,
  })

  const commands = useMemo(() => {
    if (!menus || !query.trim()) return []
    const all = flattenMenuItems(menus, 'root')
    const q = query.trim()
    return all
      .map(({ menu, path }) => {
        const fullPath = path.join(' / ')
        const nameScore = fuzzyMatch(menu.name, q)
        const pathScore = fuzzyMatch(fullPath, q)
        const best = Math.max(nameScore, pathScore)
        return { menu, path, score: best }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ menu, path }) => ({
        id: `menu-${menu.id}`,
        label: menu.name,
        path: path.join(' / '),
        execute: () => {
          navigateMenuEntry(navigate, menuEntryFromOdoo(menu), {
            context: 'command',
            menus,
          })
          setOpen(false)
          setQuery('')
        },
      }))
  }, [menus, query, navigate])

  // Reset highlight when commands change
  useEffect(() => {
    setHighlightIndex(0)
  }, [])

  // Keyboard navigation: Escape, Enter, ArrowUp, ArrowDown
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        setQuery('')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, commands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && commands[highlightIndex]) {
        e.preventDefault()
        commands[highlightIndex].execute()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, commands, highlightIndex])

  if (!open) return null

  const activeDescendant = commands[highlightIndex] ? `cmd-opt-${highlightIndex}` : undefined

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay
    <div
      role="presentation"
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[20vh]"
      onClick={() => {
        setOpen(false)
        setQuery('')
      }}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: dialog container stops propagation */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search menus"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border-subtle px-4 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menus..."
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={commands.length > 0}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeDescendant}
            // biome-ignore lint/a11y/noAutofocus: intentional focus for immediate user interaction
            autoFocus
            className="w-full border-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
        {commands.length > 0 ? (
          <div role="listbox" id={LISTBOX_ID} className="max-h-80 overflow-y-auto py-1">
            {commands.map((cmd, idx) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: option click handled via combobox keyboard nav
              <div
                key={cmd.id}
                id={`cmd-opt-${idx}`}
                role="option"
                aria-selected={idx === highlightIndex}
                tabIndex={0}
                onClick={cmd.execute}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`flex w-full flex-col px-4 py-2 text-left transition-colors ${
                  idx === highlightIndex ? 'bg-accent/10 text-accent' : 'hover:bg-hover'
                }`}
              >
                <span
                  className={`text-sm font-medium ${idx === highlightIndex ? 'text-accent' : 'text-text-primary'}`}
                >
                  {cmd.label}
                </span>
                <span
                  className={`text-xs ${idx === highlightIndex ? 'text-accent/70' : 'text-text-muted'}`}
                >
                  {cmd.path}
                </span>
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">No results</div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            Type to search menus...
          </div>
        )}
      </div>
    </div>
  )
}
