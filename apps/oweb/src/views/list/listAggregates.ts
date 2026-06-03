import type { ListColumn, OdooFieldMeta, ViewField } from '@odooseek/odoo-client'

export interface AggregateResult {
  label: string
  value: number | string
}

const numericTypes = ['integer', 'float', 'monetary']

function computeAgg(vals: number[], op: string): number {
  if (op === 'sum') return vals.reduce((a, b) => a + b, 0)
  if (op === 'avg') return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  if (op === 'min') return Math.min(...vals)
  if (op === 'max') return Math.max(...vals)
  return 0
}

function fmtVal(v: number, isInt: boolean): string {
  return isInt ? String(Math.round(v)) : v.toFixed(2).replace(/\.00$/, '')
}

export function computeAggregates(
  data: Array<Record<string, unknown>>,
  columns: ListColumn[],
  fields: Record<string, OdooFieldMeta>,
  isGrouped: boolean,
): Record<string, AggregateResult> {
  const result: Record<string, AggregateResult> = {}
  if (!data.length || isGrouped) return result

  for (const col of columns) {
    if (col.type === 'button' || col.type === 'button_group') continue
    const vf = col as ViewField
    const meta = fields[vf.name]
    if (!meta || !numericTypes.includes(meta.type)) continue
    const isInt = meta.type === 'integer'

    const ops: Array<{ key: 'sum' | 'avg' | 'min' | 'max'; label: string }> = []
    if (vf.sum) ops.push({ key: 'sum', label: vf.sum })
    if (vf.avg) ops.push({ key: 'avg', label: vf.avg })
    if (vf.min) ops.push({ key: 'min', label: vf.min })
    if (vf.max) ops.push({ key: 'max', label: vf.max })
    if (!ops.length) continue

    if (meta.type === 'monetary') {
      const byCurrency = new Map<string, number[]>()
      for (const r of data) {
        const curId = (r.currency_id as [number, string] | undefined)?.[1]
        const curKey = curId ?? 'default'
        const arr = byCurrency.get(curKey) ?? []
        arr.push(Number(r[vf.name]) || 0)
        byCurrency.set(curKey, arr)
      }
      for (const op of ops) {
        if (byCurrency.size <= 1) {
          const vals = [...byCurrency.values()][0] ?? []
          result[`${vf.name}_${op.key}`] = {
            label: op.label,
            value: fmtVal(computeAgg(vals, op.key), false),
          }
        } else {
          const parts = [...byCurrency.entries()].map(
            ([cur, vals]) => `${fmtVal(computeAgg(vals, op.key), false)} ${cur}`,
          )
          result[`${vf.name}_${op.key}`] = { label: op.label, value: parts.join(' / ') }
        }
      }
    } else {
      const vals = data.map((r) => Number(r[vf.name]) || 0)
      for (const op of ops) {
        result[`${vf.name}_${op.key}`] = {
          label: op.label,
          value: fmtVal(computeAgg(vals, op.key), isInt),
        }
      }
    }
  }
  return result
}
