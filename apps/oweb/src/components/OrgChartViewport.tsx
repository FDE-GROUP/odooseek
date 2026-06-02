import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw } from '@/lib/lucide-icons'
import {
  nextScaleFromButton,
  nextScaleFromWheel,
  ORG_CHART_DEFAULT_TRANSFORM,
  type ViewportTransform,
} from '../lib/org-chart-viewport'

interface OrgChartViewportProps {
  children: ReactNode
  /** Shown in toolbar for performance sanity checks (e.g. 50+ nodes). */
  nodeCount?: number
}

export function OrgChartViewport({ children, nodeCount }: OrgChartViewportProps) {
  const [transform, setTransform] = useState<ViewportTransform>(ORG_CHART_DEFAULT_TRANSFORM)
  const containerRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<{
    active: boolean
    startX: number
    startY: number
    originX: number
    originY: number
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })

  const reset = useCallback(() => setTransform(ORG_CHART_DEFAULT_TRANSFORM), [])

  const zoomBy = useCallback((direction: 'in' | 'out') => {
    setTransform((t) => ({ ...t, scale: nextScaleFromButton(t.scale, direction) }))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setTransform((t) => ({ ...t, scale: nextScaleFromWheel(t.scale, e.deltaY) }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button[data-org-node]')) return
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panRef.current.active) return
    setTransform((t) => ({
      ...t,
      x: panRef.current.originX + (e.clientX - panRef.current.startX),
      y: panRef.current.originY + (e.clientY - panRef.current.startY),
    }))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    panRef.current.active = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <div className="relative min-h-[220px] rounded-lg border border-border-subtle bg-surface/20">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        {nodeCount != null && (
          <span className="mr-1 hidden text-[10px] text-text-muted sm:inline">
            {nodeCount} people
          </span>
        )}
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy('in')}
          className="rounded border border-border-default bg-surface p-1 text-text-secondary hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy('out')}
          className="rounded border border-border-default bg-surface p-1 text-text-secondary hover:bg-hover"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={reset}
          className="rounded border border-border-default bg-surface p-1 text-text-secondary hover:bg-hover"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={containerRef}
        className="h-full min-h-[220px] cursor-grab overflow-hidden active:cursor-grabbing touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="inline-block min-w-full py-6 will-change-transform"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'top center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
