import type { KanbanTemplateNode, OdooFieldMeta } from '@odooseek/odoo-client'
import { describe, expect, test } from 'vitest'
import { collectKanbanFieldNames, formatKanbanField } from '../kanban/KanbanNode'

function meta(overrides: Partial<OdooFieldMeta> = {}): OdooFieldMeta {
  return {
    name: 'f',
    type: 'char',
    string: 'F',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
    ...overrides,
  }
}

describe('formatKanbanField', () => {
  test('null/undefined/false returns empty', () => {
    expect(formatKanbanField(null, meta())).toBe('')
    expect(formatKanbanField(undefined, meta())).toBe('')
    expect(formatKanbanField(false, meta())).toBe('')
  })

  test('boolean true returns checkmark', () => {
    expect(formatKanbanField(true, meta())).toBe('\u2713')
  })

  test('boolean false returns empty', () => {
    expect(formatKanbanField(false, meta())).toBe('')
  })

  test('html type strips tags', () => {
    expect(formatKanbanField('<p>Hello</p>', meta({ type: 'html' }))).toBe('Hello')
  })

  test('selection returns display label', () => {
    const m = meta({
      type: 'selection',
      selection: [
        ['draft', 'Draft'],
        ['done', 'Done'],
      ],
    })
    expect(formatKanbanField('draft', m)).toBe('Draft')
  })

  test('selection returns raw value if not in list', () => {
    const m = meta({ type: 'selection', selection: [['draft', 'Draft']] })
    expect(formatKanbanField('unknown', m)).toBe('unknown')
  })

  test('integer formats with locale', () => {
    expect(formatKanbanField(12345, meta({ type: 'integer' }))).toBe('12,345')
  })

  test('monetary formats with 2 decimal places', () => {
    expect(formatKanbanField(100, meta({ type: 'monetary' }))).toBe('100.00')
  })

  test('float strips trailing .00', () => {
    expect(formatKanbanField(5, meta({ type: 'float' }))).toBe('5')
  })

  test('many2one [id, name] returns name', () => {
    expect(formatKanbanField([42, 'Partner Co'], meta())).toBe('Partner Co')
  })

  test('many2one [id] without name returns records count', () => {
    expect(formatKanbanField([42], meta())).toBe('1 records')
  })

  test('array with records returns count', () => {
    expect(formatKanbanField([1, 2, 3, 4, 5], meta())).toBe('5 records')
  })

  test('plain string returns as-is', () => {
    expect(formatKanbanField('Hello World', meta())).toBe('Hello World')
  })
})

describe('collectKanbanFieldNames', () => {
  test('empty returns empty', () => {
    expect(collectKanbanFieldNames([])).toEqual([])
    expect(collectKanbanFieldNames(undefined)).toEqual([])
  })

  test('collects field node names', () => {
    const nodes: KanbanTemplateNode[] = [
      { type: 'field', name: 'name' },
      { type: 'field', name: 'email' },
    ]
    expect(collectKanbanFieldNames(nodes)).toEqual(['name', 'email'])
  })

  test('recurses into html wrapper', () => {
    const nodes: KanbanTemplateNode[] = [
      { type: 'html', tag: 'div', children: [{ type: 'field', name: 'nested' }] },
    ]
    expect(collectKanbanFieldNames(nodes)).toEqual(['nested'])
  })

  test('recurses into condition', () => {
    const nodes: KanbanTemplateNode[] = [
      { type: 'condition', children: [{ type: 'field', name: 'cond_field' }] },
    ]
    expect(collectKanbanFieldNames(nodes)).toEqual(['cond_field'])
  })

  test('recurses into loop', () => {
    const nodes: KanbanTemplateNode[] = [
      {
        type: 'loop',
        foreach: 'items',
        as: 'item',
        children: [{ type: 'field', name: 'loop_field' }],
      },
    ]
    expect(collectKanbanFieldNames(nodes)).toEqual(['loop_field'])
  })

  test('skips text/output nodes', () => {
    const nodes: KanbanTemplateNode[] = [
      { type: 'text', content: 'hello' },
      { type: 'output', expr: 'record.name' },
      { type: 'field', name: 'real' },
    ]
    expect(collectKanbanFieldNames(nodes)).toEqual(['real'])
  })
})
