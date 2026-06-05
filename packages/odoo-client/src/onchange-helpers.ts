import type { OdooFieldMeta } from './types'
import { isFieldValueEmpty, validateFieldValue } from './validation'

export function normalizeOnchangeValue(v: unknown, fieldType?: string): unknown {
  if (fieldType === 'many2one') {
    if (v === false || v === null) return null
    if (Array.isArray(v)) return v[0] // [id, display_name] → id
    return v
  }
  if (fieldType === 'many2many' || fieldType === 'one2many') {
    if (Array.isArray(v) && v.length > 0 && Array.isArray(v[0])) {
      return v.map((item) => (Array.isArray(item) ? item[0] : item))
    }
    return v
  }
  return v
}

export function normalizeValuesForRpc(
  values: Record<string, unknown>,
  fields: Record<string, OdooFieldMeta>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(values)) {
    normalized[k] = normalizeOnchangeValue(v, fields[k]?.type)
  }
  return normalized
}

export function validateAllFields(
  fields: Record<string, OdooFieldMeta>,
  values: Record<string, unknown>,
): { missing: Set<string>; errors: Map<string, string> } {
  const missing = new Set<string>()
  const errors = new Map<string, string>()
  for (const [name, meta] of Object.entries(fields)) {
    const val = normalizeOnchangeValue(values[name], meta.type)
    if (meta.required && isFieldValueEmpty(val, meta.type)) missing.add(name)
    const typeErr = validateFieldValue(val, meta)
    if (typeErr) errors.set(name, typeErr)
  }
  return { missing, errors }
}
