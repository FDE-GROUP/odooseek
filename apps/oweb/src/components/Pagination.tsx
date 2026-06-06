import { useCallback, useEffect, useRef, useState } from 'react'

interface PagerProps {
  offset: number
  total: number
  limit: number
  onPageChange: (offset: number) => void
  onLimitChange: (limit: number) => void
}

const PAGE_SIZES = [40, 80, 200, 500] as const

export function Pagination({ offset, total, limit, onPageChange, onLimitChange }: PagerProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const start = total === 0 ? 0 : offset + 1
  const end = Math.min(offset + limit, total)
  const maxOffset = Math.max(0, total - limit)

  const handleRangeClick = useCallback(() => {
    if (total === 0) return
    setEditValue(String(start))
    setEditing(true)
  }, [start, total])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleConfirm = useCallback(() => {
    const entered = Number.parseInt(editValue, 10)
    if (!Number.isNaN(entered)) {
      // Align to page boundary first, then clamp to valid range
      const alignedOffset = Math.floor((entered - 1) / limit) * limit
      const clampedOffset = Math.max(0, Math.min(alignedOffset, maxOffset))
      onPageChange(clampedOffset)
    }
    setEditing(false)
  }, [editValue, maxOffset, limit, onPageChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setEditing(false)
      }
    },
    [handleConfirm],
  )

  if (total === 0) {
    return (
      <nav aria-label="Pagination" className="flex items-center justify-between px-1">
        <select
          aria-label="Items per page"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-secondary"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-text-muted">0 records</span>
      </nav>
    )
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between px-1">
      <select
        aria-label="Items per page"
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-secondary"
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={offset === 0}
          aria-label="First page"
          className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          «
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          aria-label="Previous page"
          className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            aria-label="Go to page"
            onKeyDown={handleKeyDown}
            onBlur={handleConfirm}
            min={1}
            max={total}
            className="w-16 rounded border border-accent bg-surface px-1.5 py-0.5 text-center text-xs text-text-primary outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={handleRangeClick}
            aria-label={`Page ${start}-${end} of ${total}`}
            className="cursor-pointer rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover"
          >
            {start}-{end}
          </button>
        )}
        <span className="text-xs text-text-muted">/</span>
        <span className="text-xs text-text-muted">{total}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(maxOffset, offset + limit))}
          disabled={offset >= maxOffset}
          aria-label="Next page"
          className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => onPageChange(maxOffset)}
          disabled={offset >= maxOffset}
          aria-label="Last page"
          className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          »
        </button>
      </div>
    </nav>
  )
}
