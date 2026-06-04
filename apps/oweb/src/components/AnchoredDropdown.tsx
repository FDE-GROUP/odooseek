import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const VIEWPORT_MARGIN = 8
const GAP = 4

export interface AnchoredDropdownProps {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
  /** Menu width in px (Tailwind w-44 = 176, w-48 = 192). */
  width?: number
  /** Align menu trailing edge to anchor (`end`) or leading edge (`start`). */
  align?: 'end' | 'start'
  className?: string
  /** Click outside to close (disable when opened via hover so the pointer can reach the panel). */
  closeOnBackdropClick?: boolean
  onPanelMouseEnter?: () => void
  onPanelMouseLeave?: () => void
}

function clampHorizontal(left: number, width: number): number {
  const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN
  return Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft))
}

function computePosition(
  anchor: HTMLElement,
  width: number,
  align: 'end' | 'start',
  panelHeight = 240,
): {
  left: number
  top?: number
  bottom?: number
  maxHeight: number
} {
  const rect = anchor.getBoundingClientRect()
  let left = align === 'end' ? rect.right - width : rect.left
  left = clampHorizontal(left, width)

  const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN
  const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN
  const flip = spaceBelow < panelHeight && spaceAbove > spaceBelow

  if (flip) {
    return {
      left,
      bottom: window.innerHeight - rect.top + GAP,
      maxHeight: Math.max(120, spaceAbove),
    }
  }
  return {
    left,
    top: rect.bottom + GAP,
    maxHeight: Math.max(120, spaceBelow),
  }
}

export function AnchoredDropdown({
  open,
  onClose,
  anchorRef,
  children,
  width = 192,
  align = 'end',
  className = '',
  closeOnBackdropClick = true,
  onPanelMouseEnter,
  onPanelMouseLeave,
}: AnchoredDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<{
    left: number
    top?: number
    bottom?: number
    maxHeight: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setStyle(null)
      return
    }

    const updatePosition = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const panelHeight = panelRef.current?.offsetHeight ?? 240
      const next = computePosition(anchor, width, align, panelHeight)
      setStyle((prev) => {
        if (
          prev &&
          prev.left === next.left &&
          prev.top === next.top &&
          prev.bottom === next.bottom &&
          prev.maxHeight === next.maxHeight
        ) {
          return prev
        }
        return next
      })
    }

    updatePosition()
    const raf = requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef, align, width])

  if (!open) return null
  const anchor = anchorRef.current
  if (!anchor) return null
  const position = style ?? computePosition(anchor, width, align)

  return createPortal(
    <>
      {closeOnBackdropClick && (
        <div className="fixed inset-0 z-[100]" aria-hidden onClick={onClose} />
      )}
      <div
        ref={panelRef}
        role="menu"
        className={`fixed z-[110] overflow-y-auto rounded-lg border border-border-subtle bg-surface shadow-lg ${className}`}
        style={{
          width,
          left: position.left,
          maxHeight: position.maxHeight,
          ...(position.top != null ? { top: position.top } : { bottom: position.bottom }),
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseEnter={onPanelMouseEnter}
        onMouseLeave={onPanelMouseLeave}
      >
        {children}
      </div>
    </>,
    document.body,
  )
}
