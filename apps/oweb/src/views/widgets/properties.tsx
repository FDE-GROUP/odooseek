import { memo, useCallback } from 'react'
import type { FieldWidgetProps } from './index'
import { FIELD_INPUT_CLASS } from './index'

interface PropertyItem {
  name?: string
  type?: string
  value?: unknown
  values?: string[]
  string?: string
}

function normalizeProperties(value: unknown): PropertyItem[] {
  if (Array.isArray(value)) return value as PropertyItem[]
  return []
}

export const PropertiesWidget = memo(function PropertiesWidget({
  value,
  onChange,
  readOnly,
}: FieldWidgetProps) {
  const items = normalizeProperties(value)

  const handleChange = useCallback(
    (index: number, newValue: unknown) => {
      const next = items.map((item, i) => (i === index ? { ...item, value: newValue } : item))
      onChange(next)
    },
    [items, onChange],
  )

  if (items.length === 0) {
    return readOnly ? null : <div className="py-1 text-xs text-text-muted">No properties</div>
  }

  if (readOnly) {
    return (
      <div className="space-y-1 py-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 text-xs">
            <span className="font-medium text-text-secondary shrink-0">
              {item.name || item.string}:
            </span>
            <span className="text-text-primary">{formatPropertyValue(item)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1.5 py-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="text-xs font-medium text-text-secondary shrink-0 w-24 truncate"
            title={item.name}
          >
            {item.name || item.string}
          </span>
          <PropertyInput item={item} onChange={(v) => handleChange(i, v)} />
        </div>
      ))}
    </div>
  )
})

function formatPropertyValue(item: PropertyItem): string {
  const v = item.value
  if (v == null || v === false) return '—'
  if (item.type === 'boolean') return v ? 'Yes' : 'No'
  if (item.type === 'float' || item.type === 'integer') return String(v)
  return String(v)
}

function PropertyInput({ item, onChange }: { item: PropertyItem; onChange: (v: unknown) => void }) {
  const type = item.type || 'char'

  if (type === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={Boolean(item.value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
    )
  }

  if ((type === 'selection' || type === 'many2one') && item.values?.length) {
    return (
      <select
        value={String(item.value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-border-default bg-root px-1.5 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
      >
        <option value="" />
        {item.values.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'float' || type === 'integer') {
    return (
      <input
        type="number"
        value={item.value != null ? String(item.value) : ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-24 rounded border border-border-default bg-root px-1.5 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
      />
    )
  }

  return (
    <input
      type="text"
      value={String(item.value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      className={`flex-1 ${FIELD_INPUT_CLASS} text-xs`}
    />
  )
}
