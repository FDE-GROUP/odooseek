import { callKw, parseDomainString } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { FieldWidgetProps } from '../index'
import { NOOP } from '../index'
import { Many2OneWidget } from './many2one'
import { encodeM2mValue, normalizeM2mValue } from './shared.tsx'

export function Many2ManyWidget({
  field: _field,
  value,
  onChange,
  readOnly,
  meta,
}: FieldWidgetProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Array<[number, string]>>([])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const tags = normalizeM2mValue(value)

  const doSearch = useCallback(
    (q: string) => {
      if (!meta?.relation || q.length < 1) {
        setResults([])
        return
      }
      clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const relation = meta?.relation
        if (!relation) return
        const domainRestriction =
          parseDomainString(typeof meta?.domain === 'string' ? meta.domain : null) ?? []
        const res = await callKw<Array<{ id: number; display_name: string }>>(
          relation,
          'web_name_search',
          [],
          {
            name: q,
            operator: 'ilike',
            limit: 8,
            specification: { display_name: {} },
            domain: domainRestriction.length > 0 ? domainRestriction : undefined,
          },
        )
        setResults((res ?? []).map((r) => [r.id, r.display_name] as [number, string]))
      }, 200)
    },
    [meta?.relation, meta?.domain],
  )

  if (readOnly) {
    if (tags.length === 0) return <span className="text-sm text-text-muted">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
          >
            {name || `#${id}`}
          </span>
        ))}
      </div>
    )
  }

  const addTag = (id: number, name: string) => {
    if (tags.some(([tid]) => tid === id)) return
    const newTags = [...tags, [id, name] as [number, string]]
    onChange(encodeM2mValue(newTags))
    setSearch('')
    setOpen(false)
  }

  const removeTag = (id: number) => {
    const newTags = tags.filter(([tid]) => tid !== id)
    onChange(encodeM2mValue(newTags))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
          >
            {name || `#${id}`}
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
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Add a tag..."
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        />
        {open && results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border-subtle bg-surface shadow-lg">
            {results.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onMouseDown={() => addTag(id, name)}
                className="w-full px-3 py-1.5 text-left text-sm text-text-primary hover:bg-hover/50"
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
export function AttachmentImageWidget({ value, readOnly, meta }: FieldWidgetProps) {
  if (readOnly) {
    if (!value) return <span className="text-sm text-text-muted">—</span>
    if (Array.isArray(value) && value.length >= 1) {
      const name = value.length >= 2 ? String(value[1]) : ''
      return (
        <img
          src={`/api/web/image/${value[0]}`}
          alt={name}
          className="max-h-32 max-w-32 rounded border border-border-subtle object-contain"
        />
      )
    }
    return <span className="text-sm text-text-primary">{String(value)}</span>
  }
  return (
    <Many2OneWidget
      value={value}
      onChange={NOOP}
      readOnly={false}
      field={{ type: 'field', name: 'attachment_id' }}
      meta={meta}
    />
  )
}

// ── Many2Many Checkboxes Widget (Phase 24) ──────────────────────────

export function Many2ManyCheckboxesWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const relation = meta?.relation
  const tags = normalizeM2mValue(value)
  const selectedIds = useMemo(() => new Set(tags.map(([id]) => id)), [tags])

  const { data: options } = useQuery({
    queryKey: ['odoo', 'name_search', relation],
    queryFn: async () => {
      const domainRestriction =
        parseDomainString(typeof meta?.domain === 'string' ? meta.domain : null) ?? []
      const res = await callKw<Array<{ id: number; display_name: string }>>(
        relation as string,
        'web_name_search',
        [],
        {
          name: '',
          limit: 100,
          specification: { display_name: {} },
          domain: domainRestriction.length > 0 ? domainRestriction : undefined,
        },
      )
      return Array.isArray(res) ? res : []
    },
    enabled: !!relation,
  })

  const toggle = (id: number, name: string) => {
    const newTags = selectedIds.has(id)
      ? tags.filter(([tid]) => tid !== id)
      : [...tags, [id, name] as [number, string]]
    onChange(encodeM2mValue(newTags))
  }

  return (
    <div className="flex flex-col gap-1">
      {options?.map?.((opt: { id: number; display_name: string }) => (
        <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.has(opt.id)}
            onChange={() => toggle(opt.id, opt.display_name)}
            disabled={readOnly}
            className="accent-accent"
          />
          {opt.display_name}
        </label>
      ))}
    </div>
  )
}

// ── Many2Many Tags Avatar Widget (Phase 24) ────────────────────────

export function Many2ManyTagsAvatarWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
  const relation = meta?.relation
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Array<[number, string]>>([])
  const tags = normalizeM2mValue(value)

  const doSearch = useCallback(
    async (q: string) => {
      if (!relation || !q.trim()) {
        setSearchResults([])
        return
      }
      const domainRestriction =
        parseDomainString(typeof meta?.domain === 'string' ? meta.domain : null) ?? []
      const res = await callKw<Array<{ id: number; display_name: string }>>(
        relation,
        'web_name_search',
        [],
        {
          name: q,
          operator: 'ilike',
          limit: 10,
          specification: { display_name: {} },
          domain: domainRestriction.length > 0 ? domainRestriction : undefined,
        },
      )
      const records = Array.isArray(res) ? res : []
      setSearchResults(
        records.map(
          (r: { id: number; display_name: string }) => [r.id, r.display_name] as [number, string],
        ),
      )
    },
    [relation],
  )

  const removeTag = (id: number) => {
    const newTags = tags.filter(([tid]) => tid !== id)
    onChange(encodeM2mValue(newTags))
  }

  const addTag = (id: number, name: string) => {
    if (tags.some(([tid]) => tid === id)) return
    const newTags = [...tags, [id, name] as [number, string]]
    onChange(encodeM2mValue(newTags))
    setSearch('')
    setSearchResults([])
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {tags.map(([id, name]) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full bg-accent/10 pl-0.5 pr-2 py-0.5 text-xs"
          >
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative avatar */}
            <img
              src={`/api/web/image/${relation}/${id}/avatar_128`}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-accent">{name || `#${id}`}</span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeTag(id)}
                className="ml-0.5 text-accent/60 hover:text-accent"
              >
                x
              </button>
            )}
          </span>
        ))}
      </div>
      {!readOnly && (
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
                  onClick={() => addTag(id, name)}
                  className="block w-full px-2 py-1 text-left text-xs text-text-primary hover:bg-hover"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
