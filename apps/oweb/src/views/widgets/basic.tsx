import { formatFloatTime, formatPercentage, parseFloatTime } from '@odooseek/odoo-client'
import DOMPurify from 'dompurify'
import { useEffect, useRef } from 'react'
import type { FieldWidgetProps } from './index'
import { FIELD_INPUT_CLASS } from './index'

export function CharWidget({ field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  if (readOnly) {
    const v = value === false || value === null || value === undefined ? '' : String(value)
    if (!v) return <span className="text-sm text-text-primary">—</span>
    if (field.widget === 'password')
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

export function TextWidget({ field, value, onChange, readOnly }: FieldWidgetProps) {
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

export function HtmlWidget({ field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly) {
    const html = (value as string) ?? ''
    if (!html) return <span className="text-sm text-text-muted">—</span>
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
        'div',
        'span',
        'img',
        'blockquote',
        'pre',
        'code',
        'hr',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    })
    return (
      <div
        className="prose prose-sm max-w-none text-sm text-text-primary"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify sanitized HTML from Odoo field
        dangerouslySetInnerHTML={{ __html: sanitized }}
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

export function IntegerWidget({ field: _field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
  return (
    <input
      type="number"
      value={value != null ? Number(value) : ''}
      onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
      className={FIELD_INPUT_CLASS}
    />
  )
}

export function FloatWidget({ field: _field, value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{value != null ? String(value) : ''}</span>
  return (
    <input
      type="number"
      step="0.01"
      value={value != null ? Number(value) : ''}
      onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
      className={FIELD_INPUT_CLASS}
    />
  )
}

export function MonetaryWidget({ field, value, onChange, readOnly, record }: FieldWidgetProps) {
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
        onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
        className={FIELD_INPUT_CLASS}
      />
    </div>
  )
}

export function BooleanWidget({ value, onChange, readOnly }: FieldWidgetProps) {
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

export function BooleanToggleWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  const checked = Boolean(value)

  if (readOnly) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          checked ? 'bg-success/10 text-success' : 'bg-border-default/30 text-text-muted'
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

export function DateWidget({ value, onChange, readOnly }: FieldWidgetProps) {
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

export function DatetimeWidget({ value, onChange, readOnly }: FieldWidgetProps) {
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

export function FloatTimeWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{formatFloatTime(Number(value) || 0)}</span>
  return (
    <input
      type="text"
      value={value != null ? formatFloatTime(Number(value)) : ''}
      onChange={(e) => onChange(parseFloatTime(e.target.value))}
      placeholder="HH:MM"
      className={FIELD_INPUT_CLASS}
    />
  )
}

export function PercentageWidget({ value, onChange, readOnly }: FieldWidgetProps) {
  if (readOnly)
    return <span className="text-sm text-text-primary">{formatPercentage(Number(value) || 0)}</span>
  return (
    <div className="flex items-center">
      <input
        type="number"
        value={value != null ? (Number(value) * 100).toFixed(2) : ''}
        onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) / 100 : null)}
        className={FIELD_INPUT_CLASS}
      />
      <span className="ml-1 text-sm text-text-muted">%</span>
    </div>
  )
}
