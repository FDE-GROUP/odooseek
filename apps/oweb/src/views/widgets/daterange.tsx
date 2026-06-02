import { memo, useCallback } from 'react'
import type { FieldWidgetProps } from './index'

/**
 * Date range widget — mimics Odoo's `widget="daterange"`.
 *
 * Renders two date inputs (start / end) and produces a tuple `[start, end]`
 * or `false` when both are empty.
 */
export const DaterangeWidget = memo(function DaterangeWidget({
  value,
  onChange,
  readOnly,
}: FieldWidgetProps) {
  const range = normalizeRange(value)

  const handleStart = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!v) {
        onChange(range[1] ? [false, range[1]] : false)
        return
      }
      onChange([v, range[1] || false])
    },
    [onChange, range],
  )

  const handleEnd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!v) {
        onChange(range[0] ? [range[0], false] : false)
        return
      }
      onChange([range[0] || false, v])
    },
    [onChange, range],
  )

  if (readOnly) {
    if (!range[0] && !range[1]) {
      return <span className="text-xs text-text-muted">—</span>
    }
    return (
      <span className="text-xs text-text-primary">
        {fmtDate(range[0])} – {fmtDate(range[1])}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1 py-1">
      <input
        type="date"
        value={range[0] || ''}
        onChange={handleStart}
        className="w-[140px] border-0 border-b border-border-default bg-transparent px-1 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
      />
      <span className="text-xs text-text-muted">–</span>
      <input
        type="date"
        value={range[1] || ''}
        onChange={handleEnd}
        className="w-[140px] border-0 border-b border-border-default bg-transparent px-1 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
      />
    </div>
  )
})

function normalizeRange(value: unknown): [string | false, string | false] {
  if (Array.isArray(value)) {
    const s = typeof value[0] === 'string' ? value[0] : false
    const e = typeof value[1] === 'string' ? value[1] : false
    return [s, e]
  }
  return [false, false]
}

function fmtDate(v: string | false): string {
  if (!v) return '—'
  return v
}
