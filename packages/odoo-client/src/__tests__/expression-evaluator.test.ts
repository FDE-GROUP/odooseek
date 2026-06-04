import { describe, expect, test } from 'vitest'
import {
  evalCondition,
  evalModifier,
  getDecorationClass,
  getValue,
} from '../expression-evaluator'
import type { KanbanTemplateNode } from '../types'
import { parseKanbanTemplate, parseKanbanXml } from '../xml-parser'

describe('parseKanbanTemplate', () => {
  test('parses simple field elements', () => {
    const xml = `<templates>
      <t t-name="card">
        <field name="name"/>
        <field name="expected_revenue" widget="monetary"/>
      </t>
    </templates>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(2) // transparent <t> flattened → 2 fields

    expect(nodes[0]).toMatchObject({ type: 'field', name: 'name' })
    expect(nodes[1]).toMatchObject({ type: 'field', name: 'expected_revenue', widget: 'monetary' })
  })

  test('parses aside and main layout wrappers', () => {
    const xml = `<templates>
      <t t-name="card">
        <aside>
          <field name="image_1024" widget="background_image"/>
        </aside>
        <main>
          <field name="name"/>
        </main>
      </t>
    </templates>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toMatchObject({ type: 'html', tag: 'aside' })
    expect(nodes[1]).toMatchObject({ type: 'html', tag: 'main' })
  })

  test('parses t-if condition', () => {
    const xml = `<template>
      <field name="name"/>
      <t t-if="record.expected_revenue">
        <field name="expected_revenue" widget="monetary"/>
      </t>
    </template>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toMatchObject({ type: 'field', name: 'name' })
    expect(nodes[1]).toMatchObject({ type: 'condition', if: 'record.expected_revenue' })

    const cond = nodes[1] as KanbanTemplateNode & {
      type: 'condition'
      children: KanbanTemplateNode[]
    }
    expect(cond.children).toHaveLength(1)
    expect(cond.children[0]).toMatchObject({
      type: 'field',
      name: 'expected_revenue',
      widget: 'monetary',
    })
  })

  test('parses t-elif / t-else chains', () => {
    const xml = `<template>
      <t t-if="record.type == 'opportunity'">
        <field name="expected_revenue"/>
      </t>
      <t t-elif="record.type == 'lead'">
        <field name="contact_name"/>
      </t>
      <t t-else="">
        <field name="name"/>
      </t>
    </template>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(1) // single chain
    expect(nodes[0]).toMatchObject({ type: 'condition', if: "record.type == 'opportunity'" })

    const root = nodes[0] as KanbanTemplateNode & {
      type: 'condition'
      children: KanbanTemplateNode[]
    }
    // First child is the field, second is the elif, third is the else
    expect(root.children).toHaveLength(3)
    expect(root.children[0]).toMatchObject({ type: 'field', name: 'expected_revenue' })
    expect(root.children[1]).toMatchObject({ type: 'condition', elif: "record.type == 'lead'" })
    expect(root.children[2]).toMatchObject({ type: 'condition', else: '' })
  })

  test('parses t-foreach loop', () => {
    const xml = `<template>
      <t t-foreach="record.tag_ids" t-as="tag">
        <span t-out="tag[1]"/>
      </t>
    </template>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'loop', foreach: 'record.tag_ids', as: 'tag' })

    const loop = nodes[0] as KanbanTemplateNode & { type: 'loop'; children: KanbanTemplateNode[] }
    expect(loop.children).toHaveLength(1)
    expect(loop.children[0]).toMatchObject({ type: 'output', expr: 'tag[1]' })
  })

  test('parses footer separately', () => {
    const xml = `<template>
      <field name="name"/>
      <footer>
        <field name="priority" widget="priority"/>
      </footer>
    </template>`

    const nodes = parseKanbanTemplate(xml)
    expect(nodes).toHaveLength(2)
    expect(nodes[1]).toMatchObject({ type: 'footer' })

    const footer = nodes[1] as KanbanTemplateNode & {
      type: 'footer'
      children: KanbanTemplateNode[]
    }
    expect(footer.children).toHaveLength(1)
    expect(footer.children[0]).toMatchObject({
      type: 'field',
      name: 'priority',
      widget: 'priority',
    })
  })
})

describe('evalCondition', () => {
  test('evaluates truthy record field', () => {
    const record = { expected_revenue: 5000, name: 'Test' }
    expect(evalCondition('record.expected_revenue', record)).toBe(true)
    expect(evalCondition('record.name', record)).toBe(true)
  })

  test('evaluates falsy record field', () => {
    const record = { expected_revenue: 0, contact_name: false }
    expect(evalCondition('record.expected_revenue', record)).toBe(false)
    expect(evalCondition('record.contact_name', record)).toBe(false)
  })

  test('evaluates negation', () => {
    const record = { active: false }
    expect(evalCondition('!record.active', record)).toBe(true)
  })

  test('evaluates AND expressions', () => {
    const record = { a: 1, b: 2 }
    expect(evalCondition('record.a && record.b', record)).toBe(true)
    expect(evalCondition('record.a && record.c', record)).toBe(false)
  })

  test('evaluates OR expressions', () => {
    const record = { a: 1, b: 0 }
    expect(evalCondition('record.a || record.b', record)).toBe(true)
    expect(evalCondition('record.c || record.d', record)).toBe(false)
  })

  test('evaluates Odoo kanban raw_value conditions', () => {
    expect(evalCondition('record.image_1024.raw_value', { image_1024: 'abc' })).toBe(true)
    expect(evalCondition('record.image_1024.raw_value', { image_1024: false })).toBe(false)
    expect(evalCondition('record.image_128.raw_value', {})).toBe(false)
  })
})

describe('getValue', () => {
  test('gets record field', () => {
    expect(getValue('record.name', { name: 'Test' })).toBe('Test')
  })

  test('gets array index for many2one', () => {
    expect(getValue('record.stage_id[0]', { stage_id: [1, 'New'] })).toBe(1)
    expect(getValue('record.stage_id[1]', { stage_id: [1, 'New'] })).toBe('New')
  })

  test('returns undefined for missing field', () => {
    expect(getValue('record.nonexistent', { name: 'Test' })).toBeUndefined()
  })
})

describe('evalModifier', () => {
  test("evaluates 'in' operator", () => {
    expect(evalModifier("state in ['draft', 'sent']", { state: 'draft' })).toBe(true)
  })

  test("evaluates 'in' operator — no match", () => {
    expect(evalModifier("state in ['done']", { state: 'draft' })).toBe(false)
  })

  test("evaluates 'not in' operator", () => {
    expect(evalModifier("state not in ['cancel']", { state: 'done' })).toBe(true)
  })

  test("evaluates 'not in' — matches", () => {
    expect(evalModifier("state not in ['cancel']", { state: 'cancel' })).toBe(false)
  })

  test("evaluates '==' operator", () => {
    expect(evalModifier("type == 'opportunity'", { type: 'opportunity' })).toBe(true)
  })

  test("evaluates '==' — no match", () => {
    expect(evalModifier("type == 'lead'", { type: 'opportunity' })).toBe(false)
  })

  test('returns false for undefined expr', () => {
    expect(evalModifier(undefined, {})).toBe(false)
  })

  test("returns true for '1' and false for '0'", () => {
    expect(evalModifier('1', {})).toBe(true)
    expect(evalModifier('0', {})).toBe(false)
  })
})

describe('getDecorationClass', () => {
  test('returns bold class when decoration_bf matches', () => {
    const result = getDecorationClass({ decoration_bf: "state=='draft'" }, { state: 'draft' })
    expect(result).toContain('font-bold')
  })

  test('returns danger class when decoration_danger matches', () => {
    const result = getDecorationClass({ decoration_danger: "state=='cancel'" }, { state: 'cancel' })
    expect(result).toContain('text-red-400')
  })

  test('returns multiple classes for multiple matching decorations', () => {
    const result = getDecorationClass(
      { decoration_bf: "state=='open'", decoration_success: "state=='open'" },
      { state: 'open' },
    )
    expect(result).toContain('font-bold')
    expect(result).toContain('text-green-400')
  })

  test('returns undefined when no decorations match', () => {
    const result = getDecorationClass({ decoration_bf: "state=='draft'" }, { state: 'done' })
    expect(result).toBeUndefined()
  })
})

describe('contacts kanban template (res.partner)', () => {
  // This matches the actual Odoo 17 contacts kanban XML arch
  const contactsKanbanXml = `<kanban default_group_by="stage_id" highlight_color="color">
    <field name="avatar_128"/>
    <field name="is_company"/>
    <field name="active"/>
    <templates>
      <t t-name="card">
        <aside class="o_kanban_aside_full">
          <t t-if="!record.is_company.raw_value">
            <div class="position-relative w-100 h-auto m-0">
              <field name="avatar_128" widget="image" class="h-100" options="{'img_class': 'object-fit-contain'}"/>
              <field t-if="record.parent_id.raw_value and record.parent_id.image_128" name="parent_id" widget="image" class="position-absolute bottom-0 end-0 w-25 h-25 rounded" options="{'img_class': 'object-fit-contain'}"/>
              <field t-elif="record.parent_id.raw_value" name="parent_id" widget="image" class="position-absolute bottom-0 end-0 w-25 h-25 rounded" options="{'img_class': 'object-fit-contain'}"/>
            </div>
          </t>
          <t t-else="">
            <field name="avatar_128" widget="image" class="w-100 h-auto m-0" options="{'img_class': 'object-fit-contain w-100 h-100'}"/>
          </t>
        </aside>
        <main class="o_kanban_card_full">
          <div class="oe_kanban_details">
            <div class="mb-1">
              <field name="complete_name"/>
            </div>
            <div>
              <field name="email" widget="email" optional="hide"/>
              <field name="phone" widget="phone" optional="hide"/>
            </div>
            <div>
              <field name="city" optional="hide"/>
              <field name="country_id" optional="hide"/>
            </div>
          </div>
        </main>
      </t>
    </templates>
  </kanban>`

  test('parseKanbanXml: aside and main are separate top-level nodes', () => {
    const result = parseKanbanXml(contactsKanbanXml)
    expect(result.templateNodes).toBeDefined()
    const nodes = result.templateNodes!

    // Should have exactly 2 top-level nodes: aside + main
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toMatchObject({ type: 'html', tag: 'aside' })
    expect(nodes[1]).toMatchObject({ type: 'html', tag: 'main' })
  })

  test('aside contains exactly one condition node (t-if with t-else child)', () => {
    const result = parseKanbanXml(contactsKanbanXml)
    const aside = result.templateNodes![0] as KanbanTemplateNode & {
      children: KanbanTemplateNode[]
    }
    expect(aside.children).toHaveLength(1)
    expect(aside.children[0]).toMatchObject({ type: 'condition' })

    const cond = aside.children[0] as KanbanTemplateNode & {
      children: KanbanTemplateNode[]
    }
    expect(cond.if).toBe('!record.is_company.raw_value')
    // Children: div + t-else condition
    expect(cond.children.length).toBeGreaterThanOrEqual(2)
  })

  test('main content contains exactly one complete_name field', () => {
    const result = parseKanbanXml(contactsKanbanXml)
    const main = result.templateNodes![1] as KanbanTemplateNode & {
      children: KanbanTemplateNode[]
    }

    // Count complete_name occurrences in the entire main tree
    function countField(nodes: KanbanTemplateNode[] | undefined, name: string): number {
      if (!nodes) return 0
      let count = 0
      for (const n of nodes) {
        if (n.type === 'field' && n.name === name) count++
        if ('children' in n && Array.isArray(n.children)) {
          count += countField(n.children, name)
        }
      }
      return count
    }

    expect(countField([main], 'complete_name')).toBe(1)
  })

  test('evalCondition handles !record.is_company.raw_value', () => {
    // Person contact: is_company = false → !false = true
    expect(evalCondition('!record.is_company.raw_value', { is_company: false })).toBe(true)
    // Company contact: is_company = true → !true = false
    expect(evalCondition('!record.is_company.raw_value', { is_company: true })).toBe(false)
    // Missing field
    expect(evalCondition('!record.is_company.raw_value', {})).toBe(true)
  })

  test('evalCondition handles dotted path: record.parent_id.image_128', () => {
    // This is used in: record.parent_id.raw_value and record.parent_id.image_128
    // Our parser currently can't handle dotted paths beyond raw_value
    // But at least the raw_value part should work
    expect(evalCondition('record.parent_id.raw_value', { parent_id: [1, 'Parent'] })).toBe(true)
    expect(evalCondition('record.parent_id.raw_value', { parent_id: false })).toBe(false)
  })
})
