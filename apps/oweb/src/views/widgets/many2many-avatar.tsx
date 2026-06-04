import { callKw } from '@odooseek/odoo-client'
import { useCallback, useRef, useState } from 'react'
import { resolveOdooImageSrc } from '../../lib/odoo-image'
import type { FieldWidgetProps } from './index'

export function Many2ManyAvatarUserWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Array<[number, string, string?]>>([])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const tags: Array<[number, string]> = Array.isArray(value)
    ? value
        .filter((v) => Array.isArray(v))
        .map((v) => [(v as [number, string])[0], String((v as [number, string])[1] ?? '')])
    : []

  const doSearch = useCallback(
    (q: string) => {
      if (!meta?.relation || q.length < 1) {
        setResults([])
        return
      }
      clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const rel = meta?.relation
        if (!rel) return
        const res = await callKw<Array<{ id: number; display_name: string }>>(
          rel,
          'web_name_search',
          [],
          { name: q, operator: 'ilike', limit: 8 },
        )
        setResults(res.map((r) => [r.id, r.display_name]))
      }, 200)
    },
    [meta?.relation],
  )

  const addTag = (id: number, name: string) => {
    if (tags.some(([tid]) => tid === id)) return
    onChange([...tags, [id, name]])
    setSearch('')
    setOpen(false)
  }

  const removeTag = (id: number) => {
    const remaining = tags.filter(([tid]) => tid !== id)
    onChange(remaining.length > 0 ? remaining : false)
  }

  const avatarUrl = (id: number) =>
    resolveOdooImageSrc({
      model: meta?.relation,
      recordId: id,
      field: 'avatar_128',
    })

  if (readOnly) {
    if (tags.length === 0) return <span className="text-sm text-text-muted">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
          >
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative avatar */}
            <img
              src={avatarUrl(id)}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
          >
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative avatar */}
            <img
              src={avatarUrl(id)}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {name}
            <button
              type="button"
              onClick={() => removeTag(id)}
              className="ml-0.5 text-accent/60 hover:text-accent"
            >
              ×
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
          onFocus={() => {
            setOpen(true)
            doSearch('')
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search..."
          className="w-full rounded border border-border-default px-2 py-1 text-xs focus:border-accent focus:outline-none"
        />
        {open && results.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border border-border-subtle bg-surface shadow-lg">
            {results.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onMouseDown={() => addTag(id, name)}
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-hover/50"
              >
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative avatar */}
                <img
                  src={avatarUrl(id)}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
