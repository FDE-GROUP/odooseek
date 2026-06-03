import type { OdooFieldMeta } from './types'

// ── Odoo 类型映射 — 对标 record.js:421-425 ─────────────────────

/** Types where `false` / `0` are valid non-empty values — never flagged as missing. */
export const ALWAYS_NON_EMPTY_TYPES = new Set(['boolean', 'float', 'integer', 'monetary'])

/**
 * Check whether a field value is considered "empty" for required-field purposes.
 * Aligns with Odoo's `_checkValidity()` behavior:
 * - boolean / float / integer / monetary → never empty (`false` / `0` are valid)
 * - html → empty when length is 0
 * - one2many / many2many → empty when list has no records
 * - everything else → falsy check
 */
export function isFieldValueEmpty(value: unknown, fieldType?: string): boolean {
  if (fieldType && ALWAYS_NON_EMPTY_TYPES.has(fieldType)) return false
  if (fieldType === 'html') return (value as string)?.length === 0
  if (fieldType === 'one2many' || fieldType === 'many2many') {
    const list = value as unknown[] | undefined
    return !list || list.length === 0
  }
  return !value
}

// ── 类型级校验 — 对标 Odoo 服务端 @api.constrains ──────────────

/**
 * Validate a single field value against Odoo type constraints.
 * Returns an error message, or `null` if valid.
 *
 * Checks:
 * - integer / float / monetary → must be number
 * - selection → must be in allowed values
 * - many2one → must be `[number, string]` tuple or `false`
 * - date / datetime → must match YYYY-MM-DD
 *
 * Empty values (undefined, null, false, '') return null —
 * they're handled by `isFieldValueEmpty` in the required layer.
 */
export function validateFieldValue(value: unknown, meta: OdooFieldMeta): string | null {
  if (value === undefined || value === null || value === false || value === '') return null

  switch (meta.type) {
    case 'integer':
    case 'float':
    case 'monetary':
      if (typeof value !== 'number') return `Must be a number`
      break
    case 'selection':
      if (meta.selection?.length) {
        const validValues = meta.selection.map(([v]) => v)
        if (typeof value === 'string' && !validValues.includes(value)) {
          return `Invalid selection: "${value}"`
        }
      }
      break
    case 'many2one':
      if (Array.isArray(value)) {
        if (value.length < 2 || typeof value[0] !== 'number' || typeof value[1] !== 'string') {
          return 'Invalid reference format'
        }
      } else if (value !== false) {
        return 'Invalid reference'
      }
      break
    case 'date':
    case 'datetime':
      if (typeof value === 'string' && value !== '' && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return 'Invalid date format'
      }
      break
  }
  return null
}

// ── 批量校验 — 供 AI 通道 / 批量导入等非表单场景使用 ────────────

/**
 * Result of validating a data object against Odoo field metadata.
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate a complete data object against Odoo field metadata.
 * Checks both required fields and type constraints.
 * `fields` can come directly from `get_views` / `fields_get` — zero extra RPC.
 *
 * @example
 * const viewData = await getViews('crm.lead', ...)
 * const errors = validateModelData(viewData.models['crm.lead'].fields, aiOutput)
 * if (errors.length) throw new Error(errors[0].message)
 */
export function validateModelData(
  fields: Record<string, OdooFieldMeta>,
  data: Record<string, unknown>,
): ValidationError[] {
  const errors: ValidationError[] = []

  // Unknown field check
  for (const name of Object.keys(data)) {
    if (!fields[name]) {
      errors.push({ field: name, message: 'Unknown field' })
    }
  }

  // Required + type checks for known fields
  for (const [name, meta] of Object.entries(fields)) {
    const value = data[name]

    if (meta.required && isFieldValueEmpty(value, meta.type)) {
      errors.push({ field: name, message: `Required: ${meta.string || name}` })
      continue
    }

    const typeErr = validateFieldValue(value, meta)
    if (typeErr) errors.push({ field: name, message: typeErr })
  }

  return errors
}
