import { resolveOdooImageFromRecord, resolveOdooImageSrc } from '../../lib/odoo-image'
import type { FieldWidgetProps } from './index'

/** HR kanban aside: full-height cover image (Odoo `background_image` field widget). */
export function BackgroundImageWidget({ field, value, record, model, recordId }: FieldWidgetProps) {
  const opts = (field.options as Record<string, unknown> | undefined) ?? {}
  const previewField = (opts.preview_image as string) ?? field.name
  const fieldName = field.name ?? 'image_128'
  const src =
    resolveOdooImageSrc({
      raw: value as string | false | undefined,
      model,
      recordId,
      field: fieldName,
    }) ??
    resolveOdooImageFromRecord(record, model, recordId, [
      fieldName,
      previewField,
      'image_128',
      'avatar_128',
    ])

  if (!src) {
    return (
      <div className="flex h-24 w-20 items-center justify-center rounded bg-surface/80 text-text-muted">
        <svg
          className="h-10 w-10 opacity-50"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Employee</title>
          <g fill="currentColor">
            <path d="M 10 11 C 4.08 11 2 14 2 16 L 2 19 L 18 19 L 18 16 C 18 14 15.92 11 10 11 Z" />
            <circle cx="10" cy="5.5" r="4.5" />
          </g>
        </svg>
      </div>
    )
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative image with error fallback
    <img
      src={src}
      alt=""
      loading="lazy"
      className="h-24 w-20 shrink-0 rounded object-cover"
      onError={(e) => {
        ;(e.target as HTMLElement).style.display = 'none'
      }}
    />
  )
}
