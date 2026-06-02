import { Save } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { FieldWidgetProps } from './index'

/**
 * Signature pad widget — mimics Odoo's `widget="signature"`.
 *
 * Renders an HTML5 canvas for freehand drawing, with Save/Clear actions.
 * Stores the result as a Data URL string in the field.
 */
export const SignatureWidget = memo(function SignatureWidget({
  onChange,
  readOnly,
  value,
}: FieldWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Restore existing signature from value (data URL)
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (typeof value === 'string' && value.startsWith('data:image')) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasContent(true)
      }
      img.src = value
      restored.current = true
    }
  }, [value])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      if (!touch) return { x: 0, y: 0 }
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }, [])

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (readOnly) return
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      lastPos.current = pos
      setDrawing(true)
    },
    [readOnly, getPos],
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing || readOnly) return
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const pos = getPos(e)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#1f2937'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      lastPos.current = pos
      setHasContent(true)
    },
    [drawing, readOnly, getPos],
  )

  const stopDraw = useCallback(() => {
    if (drawing) {
      setDrawing(false)
      lastPos.current = null
    }
  }, [drawing])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    onChange(dataUrl)
  }, [onChange])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
    restored.current = false
    onChange(false)
  }, [onChange])

  if (readOnly && hasContent) {
    return (
      <div className="py-1">
        <img
          src={canvasRef.current?.toDataURL() ?? (value as string)}
          alt="Signature"
          className="max-h-24 rounded border border-border-default"
        />
      </div>
    )
  }

  if (readOnly && !hasContent) {
    return <div className="py-1 text-xs text-text-muted italic">No signature</div>
  }

  return (
    <div className="py-1">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full max-w-[400px] cursor-crosshair rounded border border-border-default bg-white"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasContent}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary disabled:opacity-40"
        >
          <Save className="h-3 w-3" />
          Save
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasContent}
          className="rounded px-2 py-1 text-xs text-text-muted hover:bg-hover hover:text-text-primary disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  )
})
