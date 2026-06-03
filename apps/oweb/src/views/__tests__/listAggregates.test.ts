import { describe, expect, test } from 'vitest'
import { computeAggregates } from '../list/listAggregates'

const fields = {
  total: {
    name: 'total',
    type: 'monetary',
    string: 'Total',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  qty: {
    name: 'qty',
    type: 'integer',
    string: 'Qty',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  name: {
    name: 'name',
    type: 'char',
    string: 'Name',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
}

const columns = [
  { name: 'name', type: 'field', string: 'Name' },
  { name: 'qty', type: 'field', string: 'Qty', sum: 'Total Qty', avg: 'Avg Qty' },
  { name: 'total', type: 'field', string: 'Total', sum: 'Total', max: 'Max' },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any[]

describe('computeAggregates', () => {
  test('returns empty for empty data', () => {
    expect(computeAggregates([], columns, fields, false)).toEqual({})
  })

  test('returns empty for grouped mode', () => {
    expect(computeAggregates([{ qty: 5 }, { qty: 10 }], columns, fields, true)).toEqual({})
  })

  test('computes sum for integer field', () => {
    const data = [
      { name: 'A', qty: 3 },
      { name: 'B', qty: 7 },
    ]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(result.qty_sum?.value).toBe('10')
    expect(result.qty_sum?.label).toBe('Total Qty')
  })

  test('computes avg for integer field', () => {
    const data = [
      { name: 'A', qty: 3 },
      { name: 'B', qty: 7 },
    ]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(result.qty_avg?.value).toBe('5')
  })

  test('computes sum and max for monetary field', () => {
    const data = [
      { name: 'A', total: 100 },
      { name: 'B', total: 250 },
    ]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(result.total_sum?.value).toBe('350')
    expect(result.total_max?.value).toBe('250')
  })

  test('handles multi-currency monetary aggregates', () => {
    const data = [
      { name: 'A', total: 100, currency_id: [1, 'USD'] },
      { name: 'B', total: 200, currency_id: [2, 'EUR'] },
    ]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(String(result.total_sum?.value)).toContain('USD')
    expect(String(result.total_sum?.value)).toContain('EUR')
  })

  test('skips non-numeric fields', () => {
    const data = [{ name: 'Test' }]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(result.name_sum).toBeUndefined()
  })

  test('skips columns without aggregate operator', () => {
    const cols = [{ name: 'name', type: 'field' }]
    expect(computeAggregates([{ name: 'X' }], cols as any, fields, false)).toEqual({})
  })

  test('handles zero values correctly', () => {
    const data = [
      { name: 'A', qty: 0 },
      { name: 'B', qty: 0 },
    ]
    const result = computeAggregates(data as any, columns, fields, false)
    expect(result.qty_sum?.value).toBe('0')
  })
})
