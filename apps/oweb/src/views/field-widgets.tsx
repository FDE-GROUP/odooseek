import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { callKw, fieldsGet } from '../lib/api'
import { parseDomainString } from '../lib/expression-evaluator'
import type { FieldElement, O2mCommand, OdooFieldMeta, ViewField } from '../lib/odoo-types'

export interface FieldWidgetProps {
  field: FieldElement
  value: unknown
  onChange: (value: unknown) => void
  readOnly?: boolean
  meta?: { selection?: [string, string][]; type?: string; relation?: string; domain?: unknown }
  record?: Record<string, unknown>
  model?: string
  recordId?: number
}

// Odoo 19 style: edit mode = bottom border only, read-only = plain text
const FIELD_INPUT_CLASS =
  'w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

function CharWidget({ field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  if (readOnly) {
    const v = (value as string) ?? ''
    if (field.widget === 'password' && v)
      return <span className="text-sm text-text-primary">{'•'.repeat(v.length)}</span>
    return <span className="text-sm text-text-primary">{v}</span>
  }
  const isPassword = field.widget === 'password'
  const maxLength = (meta as Record<string, unknown> & { size?: number })?.size
    ? Number((meta as Record<string, unknown> & { size?: number }).size)
    : undefined
  return (
    <input
      type={isPassword ? 'password' : 'text'}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      maxLength={maxLength}
      className={FIELD_INPUT_CLASS}
    />
  )
}

function TextWidget({ field, value, onChange, readOnly }: FieldWidgetProps) {
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto'
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }, [])

  if (readOnly)
    return (
      <span className="text-sm text-text-primary whitespace-pre-wrap">
        {(value as string) ?? ''}
      </span>
    )
  return (
    <textarea
      ref={textRef}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={1}
      className={`${FIELD_INPUT_CLASS} resize-none overflow-hidden`}
    />
  )
}

function HtmlWidget({ field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly) {
    const html = (value as string) ?? ''
    if (!html) return <span className="text-sm text-text-muted">—</span>
    return (
      <div
        className="prose prose-sm max-w-none text-sm text-text-primary"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from trusted Odoo backend
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return (
    <textarea
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={6}
      className={`${FIELD_INPUT_CLASS} min-h-[100px]`}
    />
  )
}

function IntegerWidget({ field: _field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
  return (
    <input
      type="number"
      value={value != null ? Number(value) : ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={FIELD_INPUT_CLASS}
    />
  )
}

function FloatWidget({ field: _field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
  return (
    <input
      type="number"
      step="0.01"
      value={value != null ? Number(value) : ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={FIELD_INPUT_CLASS}
    />
  )
}

function MonetaryWidget({ field, value, onChange, readOnly, record }: FieldWidgetProps) {
  const opts = (field.options as Record<string, unknown>) ?? {}
  const currencyField = (opts.currency_field as string) ?? 'currency_id'
  const currencyRaw = record?.[currencyField]
  const symbol = Array.isArray(currencyRaw) ? String(currencyRaw[1] ?? '') : ''
  const digits = opts.digits as [number, number] | undefined
  const decimals = digits?.[1] ?? 2

  if (readOnly) {
    const formatted =
      value != null
        ? Number(value).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : ''
    return (
      <span className="text-sm text-text-primary">
        {symbol && <span className="mr-1 text-text-muted">{symbol}</span>}
        {formatted}
      </span>
    )
  }

  return (
    <div className="flex items-center">
      {symbol && <span className="mr-1 text-sm text-text-muted">{symbol}</span>}
      <input
        type="number"
        step={String(10 ** -decimals)}
        value={value != null ? Number(value) : ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className={FIELD_INPUT_CLASS}
      />
    </div>
  )
}

function BooleanWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  return (
    <input
      type="checkbox"
      checked={Boolean(value)}
      onChange={(e) => onChange(e.target.checked)}
      disabled={readOnly}
      className="h-4 w-4 cursor-pointer rounded accent-accent"
    />
  )
}

function BooleanToggleWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  const checked = Boolean(value)

  if (readOnly) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          checked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-border-default/30 text-text-muted'
        }`}
      >
        {checked ? 'Yes' : 'No'}
      </span>
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-border-default'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function DateWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly) {
    return (
      <span className="text-sm text-text-primary">{value ? String(value).slice(0, 10) : ''}</span>
    )
  }
  return (
    <input
      type="date"
      value={value ? String(value).slice(0, 10) : ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
    />
  )
}

function DatetimeWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly) {
    return (
      <span className="text-sm text-text-primary">{value ? String(value).slice(0, 19) : ''}</span>
    )
  }
  const dt = value ? String(value).slice(0, 19) : ''
  // Convert "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM"
  const local = dt ? dt.replace(' ', 'T').slice(0, 16) : ''
  return (
    <input
      type="datetime-local"
      value={local}
      onChange={(e) => onChange(`${e.target.value.replace('T', ' ')}:00`)}
      className="w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
    />
  )
}

function SelectionWidget({ field: _field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  if (readOnly) {
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
  }
  if (!meta?.selection?.length) {
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
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

function Many2OneWidget({ field: _field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Array<{ id: number; display_name: string }>>([])
  const [focusIdx, setFocusIdx] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const listRef = useRef<HTMLDivElement>(null)
  const opts = (_field.options as Record<string, unknown>) ?? {}
  const noCreate = opts.no_create === true || opts.no_create === '1'
  const noOpen = opts.no_open === true || opts.no_open === '1'

  const display =
    Array.isArray(value) && value.length === 2 ? `${value[1] ?? ''}` : value ? `#${value}` : ''

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
        const domain = parseDomainString(typeof meta.domain === 'string' ? meta.domain : null)
        const baseDomain = domain && domain.length > 0 ? domain : []
        const res = await callKw<{ records: Array<{ id: number; display_name: string }> }>(
          relation,
          'web_search_read',
          [],
          {
            domain: [...baseDomain, ['display_name', 'ilike', q]],
            specification: { display_name: {} },
            limit: 8,
          },
        )
        setResults(res?.records ?? [])
        setFocusIdx(-1)
      }, 200)
    },
    [meta?.relation, meta?.domain],
  )

  if (readOnly) {
    if (display && !noOpen) {
      return <span className="text-sm text-accent cursor-pointer">{display}</span>
    }
    return <span className="text-sm text-text-primary">{display || '—'}</span>
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && focusIdx >= 0 && focusIdx < results.length) {
      e.preventDefault()
      const r = results[focusIdx]
      onChange([r.id, r.display_name])
      setOpen(false)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const canCreate =
    !noCreate &&
    search.trim() &&
    !results.some((r) => r.display_name.toLowerCase() === search.trim().toLowerCase())

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? search : display}
        onChange={(e) => {
          setSearch(e.target.value)
          doSearch(e.target.value)
        }}
        onFocus={() => {
          setOpen(true)
          setSearch('')
          doSearch('')
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={_field.placeholder || 'Search...'}
        className="w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder:text-text-muted"
      />
      {open && (results.length > 0 || canCreate) && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 w-full rounded-lg border border-border-subtle bg-surface shadow-lg"
        >
          {results.map((r, ri) => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => {
                onChange([r.id, r.display_name])
                setOpen(false)
              }}
              className={`w-full px-3 py-1.5 text-left text-sm text-text-primary hover:bg-hover/50 ${
                ri === focusIdx ? 'bg-hover/50' : ''
              }`}
            >
              {r.display_name}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={async () => {
                if (!meta?.relation) return
                const newId = await callKw<number>(meta.relation, 'create', [
                  { name: search.trim() },
                ])
                onChange([newId, search.trim()])
                setOpen(false)
              }}
              className="w-full border-t border-border-subtle px-3 py-1.5 text-left text-sm text-accent hover:bg-accent/10"
            >
              Create "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function BinaryWidget({ field, value, onChange, readOnly, meta, record }: FieldWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isImage =
    field.widget === 'image' ||
    (meta?.type === 'binary' &&
      (field.name?.includes('image') ||
        field.name?.includes('photo') ||
        field.name?.includes('avatar')))

  if (isImage) {
    return (
      <ImageFieldWidget
        field={field}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        meta={meta}
      />
    )
  }

  const opts = (field.options as Record<string, unknown>) ?? {}
  const filenameField = opts.filename as string | undefined
  const acceptFilter = opts.accept as string | undefined
  const base64 = value as string | false | null | undefined
  const hasValue = base64 != null && base64 !== false && base64 !== ''
  const fileName = filenameField ? String(record?.[filenameField] ?? '') : ''
  const fileSize = hasValue && typeof base64 === 'string' ? Math.round((base64.length * 3) / 4) : 0
  const sizeLabel =
    fileSize > 1048576
      ? `${(fileSize / 1048576).toFixed(1)} MB`
      : fileSize > 1024
        ? `${Math.round(fileSize / 1024)} KB`
        : fileSize > 0
          ? `${fileSize} B`
          : ''

  if (readOnly) {
    if (hasValue) {
      return (
        <span className="text-sm text-text-primary">
          📎 {fileName || 'File attached'}
          {sizeLabel && <span className="ml-1 text-text-muted">({sizeLabel})</span>}
        </span>
      )
    }
    return <span className="text-sm text-text-muted">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={acceptFilter}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            onChange(dataUrl.split(',')[1])
          }
          reader.readAsDataURL(file)
        }}
        className="text-sm text-text-secondary file:mr-2 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/20"
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange(false)}
          className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary hover:bg-hover"
        >
          Clear
        </button>
      )}
    </div>
  )
}

function ImageFieldWidget({ field, value, onChange, readOnly, model, recordId }: FieldWidgetProps) {
  const [zoomed, setZoomed] = useState(false)
  const opts = (field.options as Record<string, unknown>) ?? {}
  const maxW = Number(opts.max_width) || 1024
  const maxH = Number(opts.max_height) || 1024
  const base64 = value as string | false | null | undefined
  const hasBase64 = base64 != null && base64 !== false && base64 !== ''

  // Prefer base64 data; fallback to Odoo /web/image URL when record exists
  const src = hasBase64
    ? `data:image/png;base64,${base64}`
    : model && recordId
      ? `/api/web/image/${model}/${recordId}/${field.name}`
      : ''

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxW) {
        height *= maxW / width
        width = maxW
      }
      if (height > maxH) {
        width *= maxH / height
        height = maxH
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
      const b64 = canvas.toDataURL('image/png').split(',')[1]
      onChange(b64)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  if (readOnly) {
    if (!src) return <span className="text-sm text-text-muted">—</span>
    return (
      <>
        <img
          src={src}
          alt={field.string || field.name}
          onClick={() => setZoomed(true)}
          className="max-h-32 max-w-32 cursor-zoom-in rounded border border-border-subtle object-contain hover:opacity-90 transition-opacity"
        />
        {zoomed && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
            onClick={() => setZoomed(false)}
          >
            <img
              src={src}
              alt={field.string || field.name}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {src && (
        <img
          src={src}
          alt={field.string || field.name}
          className="max-h-32 max-w-32 rounded border border-border-subtle object-contain"
        />
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="text-sm text-text-secondary file:mr-2 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/20"
        />
        {hasBase64 && (
          <button
            type="button"
            onClick={() => onChange(false)}
            className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary hover:bg-hover"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function Many2ManyWidget({ field: _field, value, onChange, readOnly, meta }: FieldWidgetProps) {
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
        const res = await callKw<Array<{ id: number; display_name: string }>>(
          relation,
          'web_name_search',
          [],
          { name: q, operator: 'ilike', limit: 8, specification: { display_name: {} } },
        )
        setResults((res ?? []).map((r) => [r.id, r.display_name] as [number, string]))
      }, 200)
    },
    [meta?.relation],
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

function normalizeM2mValue(value: unknown): [number, string][] {
  if (!value) return []
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    if (Array.isArray(value[0])) return value as [number, string][]
    const pairs: [number, string][] = []
    for (let i = 0; i < value.length - 1; i += 2) {
      if (typeof value[i] === 'number') {
        pairs.push([value[i] as number, String(value[i + 1] ?? '')])
      }
    }
    return pairs
  }
  return []
}

function encodeM2mValue(tags: [number, string][]): unknown {
  return [[6, 0, tags.map(([id]) => id)]]
}

export function PriorityWidget({ value, readOnly, onChange, meta }: FieldWidgetProps) {
  const selection = meta?.selection ?? []
  const max = selection.length || 3
  const stars = Number(value) || 0
  if (readOnly) {
    return (
      <span className="inline-flex gap-0.5 text-sm">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < stars ? 'text-amber-500' : 'text-border-default'}>
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
          onClick={() => onChange(i + 1)}
          title={selection[i]?.[1] ?? `Level ${i + 1}`}
          className={`text-sm ${i < stars ? 'text-amber-500' : 'text-border-default hover:text-amber-400'}`}
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

function StateBadgeWidget({ value, meta }: FieldWidgetProps) {
  const val = String(value ?? '')
  if (!val) return <span className="text-sm text-text-muted">—</span>
  const selection = meta?.selection ?? []
  const pair = selection.find(([k]) => k === val)
  const label = pair?.[1] ?? val
  const colors: Record<string, string> = {
    draft: 'bg-border-default text-text-secondary',
    done: 'bg-emerald-500/10 text-emerald-500',
    cancel: 'bg-red-500/10 text-red-500',
    posted: 'bg-blue-500/10 text-blue-500',
    confirmed: 'bg-blue-500/10 text-blue-500',
    new: 'bg-border-default text-text-secondary',
    assigned: 'bg-amber-500/10 text-amber-500',
    won: 'bg-emerald-500/10 text-emerald-500',
    lost: 'bg-red-500/10 text-red-500',
  }
  const color =
    colors[val.toLowerCase()] ?? 'bg-surface text-text-primary border border-border-default'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

// ── One2ManyWidget ──────────────────────────────────────────────────

function One2ManyWidget({ field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  const relation = meta?.relation
  const subViewList = field.subViews?.list
  const columnDefs = subViewList?.columns

  // Auto-discover fields when no sub-view is defined
  const { data: autoFields } = useQuery({
    queryKey: ['odoo', 'fields_get', relation],
    queryFn: () =>
      fieldsGet<Record<string, OdooFieldMeta>>(
        relation as string,
        [],
        ['string', 'type', 'relation', 'selection'],
      ),
    enabled: !!relation && !columnDefs,
  })

  const columns = useMemo<ViewField[]>(() => {
    if (columnDefs) return columnDefs
    if (!autoFields) return []
    return Object.entries(autoFields)
      .filter(([name]) => !['id', 'display_name', 'create_date', 'write_date'].includes(name))
      .slice(0, 6)
      .map(([name, f]) => ({ name, string: f.string, widget: f.widget }))
  }, [columnDefs, autoFields])

  const fieldNames = useMemo(() => columns.map((c) => c.name), [columns])

  // Resolve record IDs to full data
  const ids = normalizeO2mValue(value)
  const { data: records, isLoading } = useQuery({
    queryKey: ['odoo', 'read', relation, ids, fieldNames],
    queryFn: () =>
      callKw<Array<Record<string, unknown>>>(relation as string, 'read', [ids, fieldNames]),
    enabled: !!relation && ids.length > 0 && fieldNames.length > 0,
  })

  // Local ORM commands for pending changes
  const [pendingCommands, setPendingCommands] = useState<O2mCommand[]>([])

  const emitChange = useCallback(
    (commands: O2mCommand[]) => {
      setPendingCommands(commands)
      if (commands.length > 0) {
        onChange(commands)
      } else {
        onChange(ids.length > 0 ? [[6, 0, ids]] : false)
      }
    },
    [onChange, ids],
  )

  const handleDelete = useCallback(
    (recordId: number) => {
      const cmds = [...pendingCommands, [2, recordId] as O2mCommand]
      emitChange(cmds)
    },
    [pendingCommands, emitChange],
  )

  const handleAddRow = useCallback(async () => {
    if (!relation) return
    const defaults = await callKw<Record<string, unknown>>(relation, 'default_get', [fieldNames])
    const cmds = [...pendingCommands, [0, 0, defaults] as O2mCommand]
    emitChange(cmds)
  }, [relation, fieldNames, pendingCommands, emitChange])

  // Merge server records with pending commands
  const displayRecords = useMemo(() => {
    const base = (records ?? []).map((r) => ({ ...r }))
    for (const cmd of pendingCommands) {
      if (cmd[0] === 0 && cmd[2]) {
        base.push({ id: `new_${Date.now()}_${Math.random()}`, ...cmd[2] } as Record<
          string,
          unknown
        >)
      } else if (cmd[0] === 2) {
        const delIdx = base.findIndex((r) => r.id === cmd[1])
        if (delIdx >= 0) base.splice(delIdx, 1)
      } else if (cmd[0] === 1 && cmd[2]) {
        const upd = base.find((r) => r.id === cmd[1])
        if (upd) Object.assign(upd, cmd[2])
      }
    }
    return base
  }, [records, pendingCommands])

  if (!relation) return <span className="text-sm text-text-muted">—</span>

  return (
    <div className="rounded-lg border border-border-subtle">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!isLoading && displayRecords.length === 0 && (
        <div className="px-4 py-6 text-center text-sm text-text-muted">No records</div>
      )}

      {!isLoading && displayRecords.length > 0 && columns.length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-surface/50">
              {columns.map((col, i) => {
                const colMeta = autoFields?.[col.name]
                return (
                  <th
                    key={`o2m-h-${col.name}-${i}`}
                    className="whitespace-nowrap px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  >
                    {col.string || colMeta?.string || col.name}
                  </th>
                )
              })}
              {!readOnly && subViewList?.delete !== false && <th className="w-8 px-1 py-1.5" />}
            </tr>
          </thead>
          <tbody>
            {displayRecords.map((record) => (
              <tr key={String(record.id)} className="border-b border-border-subtle last:border-b-0">
                {columns.map((col, i) => (
                  <td
                    key={`o2m-d-${col.name}-${i}`}
                    className="whitespace-nowrap px-3 py-1.5 text-sm text-text-primary"
                  >
                    {renderO2mCell(record[col.name], autoFields?.[col.name])}
                  </td>
                ))}
                {!readOnly && subViewList?.delete !== false && (
                  <td className="px-1 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const rid = record.id as number
                        if (typeof rid === 'number') handleDelete(rid)
                      }}
                      className="text-xs text-text-muted hover:text-red-500"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!readOnly && subViewList?.create !== false && (
        <div className="border-t border-border-subtle px-3 py-1.5">
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs font-medium text-accent hover:text-accent/80"
          >
            Add a row
          </button>
        </div>
      )}
    </div>
  )
}

function normalizeO2mValue(value: unknown): number[] {
  if (!value) return []
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    if (typeof value[0] === 'number') return value as number[]
  }
  return []
}

function renderO2mCell(value: unknown, meta?: OdooFieldMeta): string {
  if (value === null || value === undefined || value === false) return ''
  if (typeof value === 'boolean') return value ? '✓' : ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') {
    if (meta?.type === 'monetary') return value.toFixed(2)
    return String(value)
  }
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number') {
    return value[1] ? String(value[1]) : `#${value[0]}`
  }
  return JSON.stringify(value)
}

// ── Many2OneAvatarWidget ─────────────────────────────────────────────

function Many2OneAvatarWidget({
  value,
  readOnly,
  onChange,
  meta,
  field,
  ...props
}: FieldWidgetProps) {
  const arrValue = Array.isArray(value) ? value : value ? [value, String(value)] : [null, '']
  const [id, name] = arrValue as [number | null, string]
  const relation = meta?.relation

  const { data: avatarData } = useQuery({
    queryKey: ['odoo', 'avatar', relation, id],
    queryFn: () =>
      callKw<Array<{ avatar_128: string }>>(relation as string, 'read', [[id], ['avatar_128']]),
    enabled: readOnly && !!relation && !!id,
    staleTime: 60_000,
  })

  if (readOnly) {
    const avatar = avatarData?.[0]?.avatar_128
    return (
      <div className="flex items-center gap-2">
        {avatar ? (
          <img
            src={`data:image/png;base64,${avatar}`}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-sm text-text-primary">{name || (id ? `#${id}` : '')}</span>
      </div>
    )
  }

  return (
    <Many2OneWidget
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      meta={meta}
      field={field}
      {...props}
    />
  )
}

function EmailWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
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

function PhoneWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
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

function UrlWidget({ value, readOnly, onChange, field }: FieldWidgetProps) {
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

function Many2ManyTagsWidget({ value, onChange, readOnly, meta }: FieldWidgetProps) {
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
      const results = await callKw<Array<{ id: number; display_name: string }>>(
        meta.relation,
        'search_read',
        [[['display_name', 'ilike', q]], ['id', 'display_name']],
        { limit: 10 },
      )
      setSearchResults(results.map((r) => [r.id, r.display_name]))
    },
    [meta?.relation],
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

function HandleWidget({ readOnly }: FieldWidgetProps) {
  if (!readOnly) return null
  return (
    <span className="cursor-grab select-none text-text-muted" title="Drag to reorder">
      ⋮⋮
    </span>
  )
}

// ── Attachment Image Widget ────────────────────────────────────────

function AttachmentImageWidget({ value, readOnly, meta }: FieldWidgetProps) {
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
      onChange={() => {}}
      readOnly={false}
      field={{ type: 'field', name: 'attachment_id' }}
      meta={meta}
    />
  )
}

// ── Color Picker Widget ─────────────────────────────────────────────

function ColorPickerWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  const color = (value as string) ?? ''
  if (readOnly) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="h-4 w-4 rounded border border-border-default"
          style={{ backgroundColor: color || '#000' }}
        />
        <span className="text-xs text-text-secondary">{color || 'No color'}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-border-default"
      />
      {color && (
        <button
          type="button"
          onClick={() => onChange(false)}
          className="text-xs text-text-muted hover:text-text-primary"
        >
          Clear
        </button>
      )}
    </div>
  )
}

// ── Progressbar Widget (form) ───────────────────────────────────────

function ProgressbarWidget({ value, onChange, readOnly }: FieldWidgetProps) {
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
          className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-text-muted w-8 text-right">{pct}%</span>
    </div>
  )
}

// ── Widget Registry ─────────────────────────────────────────────────

export const TYPE_WIDGETS: Record<string, React.ComponentType<FieldWidgetProps>> = {
  char: CharWidget,
  text: TextWidget,
  integer: IntegerWidget,
  float: FloatWidget,
  monetary: MonetaryWidget,
  boolean: BooleanWidget,
  date: DateWidget,
  datetime: DatetimeWidget,
  selection: SelectionWidget,
  priority: PriorityWidget,
  state: StateBadgeWidget,
  many2one: Many2OneWidget,
  many2many: Many2ManyWidget,
  one2many: One2ManyWidget,
  binary: BinaryWidget,
  image: BinaryWidget,
  html: HtmlWidget,
  reference: Many2OneWidget,
}

export function getFieldWidget(
  field: FieldElement,
  type: string,
): React.ComponentType<FieldWidgetProps> {
  // widget attribute from XML arch overrides type-based selection
  if (field.widget && WIDGET_OVERRIDES[field.widget]) {
    return WIDGET_OVERRIDES[field.widget]
  }
  if (field.widget && TYPE_WIDGETS[field.widget]) {
    return TYPE_WIDGETS[field.widget]
  }
  return TYPE_WIDGETS[type] ?? CharWidget
}

const WIDGET_OVERRIDES: Record<string, React.ComponentType<FieldWidgetProps>> = {
  priority: PriorityWidget,
  state: StateBadgeWidget,
  statusbar: StateBadgeWidget,
  boolean_toggle: BooleanToggleWidget,
  many2one_avatar: Many2OneAvatarWidget,
  email: EmailWidget,
  phone: PhoneWidget,
  url: UrlWidget,
  many2many_tags: Many2ManyTagsWidget,
  many2many: Many2ManyTagsWidget,
  handle: HandleWidget,
  color_picker: ColorPickerWidget,
  progressbar: ProgressbarWidget,
  attachment_image: AttachmentImageWidget,
}
