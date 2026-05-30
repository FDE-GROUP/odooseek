import type { OdooFieldMeta } from './odoo-types'

export const FIELD_TYPE_WIDTHS: Record<string, number> = {
  boolean: 50,
  integer: 80,
  float: 90,
  monetary: 110,
  date: 110,
  datetime: 160,
  selection: 120,
  many2one: 160,
  many2many: 140,
  one2many: 140,
  handle: 40,
}
export const DEFAULT_COL_WIDTH = 160

export function renderCell(value: unknown, meta?: OdooFieldMeta): string {
  if (value === null || value === undefined || value === false) return ''
  if (typeof value === 'boolean') return value ? '✓' : ''
  if (typeof value === 'string') {
    if (meta?.type === 'html') return stripHtml(value)
    if (meta?.type === 'binary' || (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value))) {
      return '📎 File'
    }
    if (meta?.selection) {
      const pair = meta.selection.find(([k]) => k === value)
      if (pair) return pair[1]
    }
    return value
  }
  if (typeof value === 'number') {
    if (meta?.type === 'monetary') return formatMonetary(value)
    if (meta?.type === 'float') return formatFloat(value, meta)
    if (meta?.type === 'integer') return value.toLocaleString()
    return String(value)
  }
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number') {
    return value[1] ? String(value[1]) : `#${value[0]}`
  }
  if (Array.isArray(value) && value.length > 2) {
    const count = Math.floor(value.length / 2)
    return `${count} record${count !== 1 ? 's' : ''}`
  }
  return JSON.stringify(value)
}

function formatMonetary(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFloat(value: number, _meta?: OdooFieldMeta): string {
  const str = value.toFixed(2)
  return str.endsWith('.00') ? str.slice(0, -3) : str
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').slice(0, 100)
}
