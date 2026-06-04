import { useRef, useState } from 'react'
import type { FieldWidgetProps } from './index'

export function BinaryWidget({
  field,
  value,
  onChange,
  readOnly,
  meta,
  record,
  model,
  recordId,
}: FieldWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isImage =
    field.widget === 'image' ||
    field.widget === 'contact_image' ||
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
        record={record}
        model={model}
        recordId={recordId}
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

export function ImageFieldWidget({
  field,
  value,
  onChange,
  readOnly,
  model,
  recordId,
}: FieldWidgetProps) {
  const [zoomed, setZoomed] = useState(false)
  const opts = (field.options as Record<string, unknown>) ?? {}
  const maxW = Number(opts.max_width) || 1024
  const maxH = Number(opts.max_height) || 1024
  const sizeOpt = opts.size as [number, number] | undefined
  const previewImage = opts.preview_image as string | undefined
  const imgClass = [opts.img_class, field.class].filter(Boolean).join(' ')
  const enableZoom = opts.zoom === true || opts.zoom === 'true'
  const isContact = field.widget === 'contact_image'
  const base64 = value as string | false | null | undefined
  const hasBase64 = base64 != null && base64 !== false && base64 !== ''

  // Size from options, or defaults based on widget type
  const displayW = sizeOpt?.[0] ?? (isContact ? 130 : 128)
  const displayH = sizeOpt?.[1] ?? (isContact ? 130 : 158)

  // Build image src: prefer base64 → Odoo URL for main field → preview_image fallback
  let src = ''
  if (hasBase64) {
    src = `data:image/png;base64,${base64}`
  } else if (previewImage && model && recordId) {
    // When preview_image is set, Odoo uses the thumbnail field as display
    src = `/api/web/image/${model}/${recordId}/${previewImage}`
  } else if (model && recordId) {
    src = `/api/web/image/${model}/${recordId}/${field.name}`
  }

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

  const imgStyle = { width: displayW, height: displayH }
  const rounded = isContact ? 'rounded-full' : 'rounded'
  const baseImgClass = `object-contain border border-border-subtle ${rounded} ${imgClass}`.trim()

  if (readOnly) {
    if (!src) {
      // Show placeholder silhouette
      return (
        <div
          className={`flex items-center justify-center bg-border-default/20 ${rounded} ${imgClass}`}
          style={imgStyle}
        >
          <svg
            width={displayW * 0.5}
            height={displayH * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-muted"
            aria-hidden="true"
          >
            <title>Person</title>
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
      )
    }
    return (
      <>
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: zoomable image uses role=button */}
        <img
          src={src}
          alt={field.string || field.name}
          role={enableZoom ? 'button' : undefined}
          tabIndex={enableZoom ? 0 : undefined}
          onClick={enableZoom ? () => setZoomed(true) : undefined}
          onKeyDown={
            enableZoom
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') setZoomed(true)
                }
              : undefined
          }
          className={`${baseImgClass} ${enableZoom ? 'cursor-zoom-in hover:opacity-90 transition-opacity' : ''}`}
          style={imgStyle}
        />
        {zoomed && (
          // biome-ignore lint/a11y/noStaticElementInteractions: zoomed overlay
          <div
            role="presentation"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
            onClick={() => setZoomed(false)}
          >
            {/* biome-ignore lint/a11y/noStaticElementInteractions: zoomed image */}
            <img
              src={src}
              alt={field.string || field.name}
              role="presentation"
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
      {src ? (
        <img src={src} alt={field.string || field.name} className={baseImgClass} style={imgStyle} />
      ) : (
        <div
          className={`flex items-center justify-center bg-border-default/20 ${rounded}`}
          style={imgStyle}
        >
          <svg
            width={displayW * 0.5}
            height={displayH * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-muted"
            aria-hidden="true"
          >
            <title>Person</title>
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
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
