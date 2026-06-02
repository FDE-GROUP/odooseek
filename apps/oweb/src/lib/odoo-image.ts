/** True when value is Odoo-style base64 (may start with `/9j/` for JPEG). */
function isBase64Payload(raw: string): boolean {
  return raw.length >= 4 && /^[A-Za-z0-9+/=]+$/.test(raw)
}

function mimeFromBase64(b64: string): string {
  if (b64.startsWith('/9j/') || b64.startsWith('9j/')) return 'image/jpeg'
  if (b64.startsWith('R0lGOD')) return 'image/gif'
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png'
  if (b64.startsWith('UklGR')) return 'image/webp'
  return 'image/png'
}

/** Normalize Odoo binary / base64 / URL image field values for <img src>. */
function normalizeRawImage(
  raw: string,
  opts: { model?: string; recordId?: number; field: string },
): string | undefined {
  if (!raw) return undefined
  if (raw.startsWith('data:')) return raw
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/api/') || raw.startsWith('/web/')) return raw

  // "/9j/" is valid base64 for JPEG (do not strip leading "/").
  if (isBase64Payload(raw)) {
    if (opts.model && opts.recordId) {
      return `/api/web/image/${opts.model}/${opts.recordId}/${opts.field}`
    }
    return `data:${mimeFromBase64(raw)};base64,${raw}`
  }
  return undefined
}

export function resolveOdooImageSrc(opts: {
  raw?: string | false | null
  model?: string
  recordId?: number
  /** Field segment in `/api/web/image/{model}/{id}/{field}` (default `image_128`). */
  field?: string
}): string | undefined {
  const field = opts.field ?? 'image_128'
  if (opts.raw === false) return undefined
  if (opts.raw != null && opts.raw !== '') {
    const normalized = normalizeRawImage(String(opts.raw), {
      model: opts.model,
      recordId: opts.recordId,
      field,
    })
    if (normalized) return normalized
  }
  if (opts.model && opts.recordId) {
    return `/api/web/image/${opts.model}/${opts.recordId}/${field}`
  }
  return undefined
}

/** Read image from record fields, then fall back to web/image URL. */
export function resolveOdooImageFromRecord(
  record?: Record<string, unknown>,
  model?: string,
  recordId?: number,
  fieldNames: string[] = ['image_128', 'avatar_128'],
): string | undefined {
  for (const name of fieldNames) {
    const raw = record?.[name] as string | false | undefined
    const src = resolveOdooImageSrc({ raw, model, recordId, field: name })
    if (src) return src
  }
  return resolveOdooImageSrc({ model, recordId })
}
