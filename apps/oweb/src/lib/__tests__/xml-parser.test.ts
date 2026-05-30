import { describe, expect, test } from 'vitest'
import type { ViewField } from '../../lib/odoo-types'
import {
  parseCalendarXml,
  parseFormXml,
  parseGraphXml,
  parseKanbanXml,
  parseListXml,
  parsePivotXml,
  parseSearchXml,
} from '../../lib/xml-parser'

describe('parseListXml', () => {
  test('parses basic list fields', () => {
    const xml = `<list string="Partners">
      <field name="name"/>
      <field name="email"/>
    </list>`

    const result = parseListXml(xml)
    expect(result.type).toBe('list')
    expect(result.string).toBe('Partners')
    expect(result.columns).toHaveLength(2)
    expect('name' in result.columns[0]).toBe(true)
    expect((result.columns[0] as ViewField).name).toBe('name')
    expect((result.columns[1] as ViewField).name).toBe('email')
  })

  test('parses editable attribute', () => {
    const xml = `<list string="Items" editable="bottom">
      <field name="name"/>
    </list>`

    const result = parseListXml(xml)
    expect(result.editable).toBe('bottom')
    expect(result.create).toBe(true)
    expect(result.delete).toBe(true)
  })

  test('handles empty list', () => {
    const xml = `<list/>`

    const result = parseListXml(xml)
    expect(result.type).toBe('list')
    expect(result.string).toBe('')
    expect(result.columns).toHaveLength(0)
  })

  test('parses decoration attributes', () => {
    const xml = `<list decoration-bf="state=='draft'" decoration-danger="state=='cancel'">
      <field name="name"/>
    </list>`

    const result = parseListXml(xml)
    expect(result.decorations).toHaveProperty('decoration_bf', "state=='draft'")
    expect(result.decorations).toHaveProperty('decoration_danger', "state=='cancel'")
  })
})

describe('parseFormXml', () => {
  test('parses basic form with sheet', () => {
    const xml = `<form string="Partner">
      <sheet>
        <field name="name"/>
        <field name="email"/>
      </sheet>
    </form>`

    const result = parseFormXml(xml)
    expect(result.type).toBe('form')
    expect(result.string).toBe('Partner')
    expect(result.elements).toHaveLength(1)
    expect(result.elements[0].type).toBe('sheet')

    const sheet = result.elements[0] as { type: 'sheet'; elements: unknown[] }
    expect(sheet.elements).toHaveLength(2)
  })

  test('parses notebook with pages', () => {
    const xml = `<form string="Partner">
      <sheet>
        <notebook>
          <page string="Details">
            <field name="name"/>
          </page>
          <page string="Extra">
            <field name="email"/>
          </page>
        </notebook>
      </sheet>
    </form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: 'notebook'; pages: { string: string }[] }[]
    }
    const notebook = sheet.elements[0]
    expect(notebook.type).toBe('notebook')
    expect(notebook.pages).toHaveLength(2)
    expect(notebook.pages[0].string).toBe('Details')
    expect(notebook.pages[1].string).toBe('Extra')
  })

  test('parses field readonly and invisible attributes', () => {
    const xml = `<form><sheet><field name="state" readonly="1" invisible="0"/></sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: 'field'; name: string; readonly: string | boolean; invisible: string }[]
    }
    const field = sheet.elements[0]
    expect(field.type).toBe('field')
    expect(field.name).toBe('state')
    expect(field.readonly).toBe('1')
    expect(field.invisible).toBe('0')
  })

  test('parses group with col attribute', () => {
    const xml = `<form><group col="4"><field name="a"/></group></form>`

    const result = parseFormXml(xml)
    const group = result.elements[0] as {
      type: 'group'
      col: number
      elements: unknown[]
    }
    expect(group.type).toBe('group')
    expect(group.col).toBe(4)
    expect(group.elements).toHaveLength(1)
  })

  test('parses header with buttons', () => {
    const xml = `<form string="Lead">
      <header>
        <button name="action_set_won" type="object" string="Mark as Won" class="btn-primary"/>
        <button name="action_set_lost" type="object" string="Mark as Lost"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    const result = parseFormXml(xml)
    expect(result.elements).toHaveLength(2)
    const header = result.elements[0] as {
      type: 'header'
      buttons: {
        type: 'button'
        name: string
        string?: string
        buttonType?: string
        class?: string
      }[]
    }
    expect(header.type).toBe('header')
    expect(header.buttons).toHaveLength(2)
    expect(header.buttons[0].name).toBe('action_set_won')
    expect(header.buttons[0].buttonType).toBe('object')
    expect(header.buttons[0].string).toBe('Mark as Won')
    expect(header.buttons[0].class).toBe('btn-primary')
    expect(header.buttons[1].name).toBe('action_set_lost')
  })

  test('parses button with states and confirm attributes', () => {
    const xml = `<form>
      <header>
        <button name="action_confirm" type="object" string="Confirm" states="draft,sent" confirm="Are you sure?"/>
      </header>
    </form>`

    const result = parseFormXml(xml)
    const header = result.elements[0] as {
      type: 'header'
      buttons: { type: 'button'; states?: string; confirm?: string }[]
    }
    expect(header.buttons[0].states).toBe('draft,sent')
    expect(header.buttons[0].confirm).toBe('Are you sure?')
  })

  test('parses button with action type', () => {
    const xml = `<form>
      <header>
        <button name="42" type="action" string="View Report"/>
      </header>
    </form>`

    const result = parseFormXml(xml)
    const header = result.elements[0] as {
      type: 'header'
      buttons: { type: 'button'; name: string; buttonType?: string }[]
    }
    expect(header.buttons[0].buttonType).toBe('action')
    expect(header.buttons[0].name).toBe('42')
  })

  test('parses standalone button inside sheet', () => {
    const xml = `<form>
      <sheet>
        <button name="btn_method" type="object" string="Click Me"/>
      </sheet>
    </form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: string; name: string }[]
    }
    expect(sheet.elements[0].type).toBe('button')
    expect(sheet.elements[0].name).toBe('btn_method')
  })

  test('parses field with nested tree sub-view (o2m)', () => {
    const xml = `<form><sheet>
      <field name="order_line">
        <tree editable="bottom">
          <field name="product_id"/>
          <field name="quantity"/>
          <field name="price_unit"/>
        </tree>
      </field>
    </sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: {
        type: 'field'
        name: string
        subViews?: { list?: { columns: { name: string }[]; editable?: string } }
      }[]
    }
    const field = sheet.elements[0]
    expect(field.type).toBe('field')
    expect(field.name).toBe('order_line')
    expect(field.subViews?.list).toBeDefined()
    expect(field.subViews?.list?.columns).toHaveLength(3)
    expect(field.subViews?.list?.columns[0].name).toBe('product_id')
    expect(field.subViews?.list?.editable).toBe('bottom')
  })

  test('parses field with nested tree and form sub-views', () => {
    const xml = `<form><sheet>
      <field name="order_line" mode="list">
        <tree>
          <field name="product_id"/>
        </tree>
        <form>
          <group>
            <field name="product_id"/>
            <field name="quantity"/>
          </group>
        </form>
      </field>
    </sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: {
        type: 'field'
        name: string
        mode?: string
        subViews?: {
          list?: { columns: { name: string }[] }
          form?: { elements: { type: string; name?: string }[] }
        }
      }[]
    }
    const field = sheet.elements[0]
    expect(field.mode).toBe('list')
    expect(field.subViews?.list?.columns).toHaveLength(1)
    expect(field.subViews?.form).toBeDefined()
    expect(field.subViews?.form?.elements).toHaveLength(1) // group
  })

  test('parses field with mode attribute', () => {
    const xml = `<form><sheet><field name="lines" mode="kanban"/></sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: 'field'; mode?: string }[]
    }
    expect(sheet.elements[0].mode).toBe('kanban')
  })

  test('parses button_box with stat buttons', () => {
    const xml = `<form><sheet>
      <div class="oe_button_box" name="button_box">
        <button name="action_open" type="object" class="oe_stat_button" icon="fa-pencil">
          <field name="count" widget="statinfo" string="Records"/>
        </button>
        <button name="action_view" type="object" class="oe_stat_button" icon="fa-eye" invisible="count == 0">
          <div class="o_field_widget o_stat_info">
            <span class="o_stat_value"><field name="total"/></span>
            <span class="o_stat_text">Total</span>
          </div>
        </button>
      </div>
    </sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: {
        type: 'button_box'
        name?: string
        buttons: {
          type: 'stat_button'
          name: string
          icon?: string
          invisible?: string
          content?: { type: string; fieldName?: string; string?: string; textFallback?: string }
        }[]
      }[]
    }
    const box = sheet.elements[0]
    expect(box.type).toBe('button_box')
    expect(box.name).toBe('button_box')
    expect(box.buttons).toHaveLength(2)

    expect(box.buttons[0].name).toBe('action_open')
    expect(box.buttons[0].icon).toBe('fa-pencil')
    expect(box.buttons[0].content?.type).toBe('field')
    expect(box.buttons[0].content?.fieldName).toBe('count')
    expect(box.buttons[0].content?.string).toBe('Records')

    expect(box.buttons[1].name).toBe('action_view')
    expect(box.buttons[1].invisible).toBe('count == 0')
    expect(box.buttons[1].content?.type).toBe('custom')
    expect((box.buttons[1].content as { type: 'custom'; valueField?: string }).valueField).toBe(
      'total',
    )
    expect(box.buttons[1].content?.textFallback).toBe('Total')
  })

  test('parses field with colspan attribute', () => {
    const xml = `<form><group col="4"><field name="description" colspan="4"/></group></form>`

    const result = parseFormXml(xml)
    const group = result.elements[0] as {
      type: 'group'
      elements: { type: 'field'; colspan?: number }[]
    }
    expect(group.elements[0].colspan).toBe(4)
  })
})

describe('parseSearchXml', () => {
  test('parses search fields with name and operator', () => {
    const xml = `<search>
      <field name="name" string="Name"/>
      <field name="email" operator="ilike"/>
    </search>`

    const result = parseSearchXml(xml)
    expect(result.type).toBe('search')
    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].name).toBe('name')
    expect(result.fields[0].string).toBe('Name')
    expect(result.fields[1].name).toBe('email')
    expect(result.fields[1].operator).toBe('ilike')
  })

  test('parses filters with domain', () => {
    const xml = `<search>
      <filter name="draft" string="Draft" domain="[('state','=','draft')]"/>
    </search>`

    const result = parseSearchXml(xml)
    expect(result.filters).toHaveLength(1)
    expect(result.filters[0].name).toBe('draft')
    expect(result.filters[0].domain).toEqual([['state', '=', 'draft']])
  })

  test('parses groupBy filters from context', () => {
    const xml = `<search>
      <filter name="group_stage" string="Stage" context="{'group_by': 'stage_id'}"/>
    </search>`

    const result = parseSearchXml(xml)
    expect(result.groupByFilters).toHaveLength(1)
    expect(result.groupByFilters[0].fieldName).toBe('stage_id')
    expect(result.groupByFilters[0].name).toBe('group_stage')
  })

  test('parses groupBy with interval', () => {
    const xml = `<search>
      <filter name="group_month" string="Month" context="{'group_by': 'create_date:month'}"/>
    </search>`

    const result = parseSearchXml(xml)
    expect(result.groupByFilters).toHaveLength(1)
    expect(result.groupByFilters[0].fieldName).toBe('create_date')
    expect(result.groupByFilters[0].interval).toBe('month')
  })

  test('skips filters with unparseable domain', () => {
    const xml = `<search>
      <filter name="my_filter" string="My" domain="[('user_id','=',uid)]"/>
    </search>`

    const result = parseSearchXml(xml)
    expect(result.filters).toHaveLength(0)
  })

  test('handles empty search', () => {
    const xml = `<search/>`

    const result = parseSearchXml(xml)
    expect(result.fields).toEqual([])
    expect(result.filters).toEqual([])
    expect(result.groupByFilters).toEqual([])
  })
})

describe('parseKanbanXml', () => {
  test('parses kanban fields and default_group_by', () => {
    const xml = `<kanban default_group_by="stage_id" highlight_color="color">
      <field name="name"/>
      <templates><t t-name="card"><field name="name"/></t></templates>
    </kanban>`

    const result = parseKanbanXml(xml)
    expect(result.type).toBe('kanban')
    expect(result.fields).toContain('name')
    expect(result.defaultGroupBy).toBe('stage_id')
    expect(result.highlightColor).toBe('color')
  })

  test('handles kanban without templates', () => {
    const xml = `<kanban string="Items"><field name="name"/></kanban>`

    const result = parseKanbanXml(xml)
    expect(result.template).toBe('')
    expect(result.templateNodes).toBeUndefined()
  })

  test('extracts multiple fields', () => {
    const xml = `<kanban>
      <field name="name"/>
      <field name="email"/>
      <field name="phone"/>
    </kanban>`

    const result = parseKanbanXml(xml)
    expect(result.fields).toHaveLength(3)
    expect(result.fields).toEqual(expect.arrayContaining(['name', 'email', 'phone']))
  })

  test('parses kanban without default_group_by', () => {
    const xml = `<kanban string="Simple"><field name="name"/></kanban>`

    const result = parseKanbanXml(xml)
    expect(result.defaultGroupBy).toBeUndefined()
  })

  test('parses progressbar field and colors', () => {
    const xml = `<kanban default_group_by="stage_id">
      <field name="name"/>
      <progressbar field="activity_state" colors='{"planned": "success", "today": "warning", "overdue": "danger"}'/>
      <templates><t t-name="card"><field name="name"/></t></templates>
    </kanban>`

    const result = parseKanbanXml(xml)
    expect(result.progressbar).toBeDefined()
    expect(result.progressbar?.field).toBe('activity_state')
    expect(result.progressbar?.colors).toEqual({
      planned: 'success',
      today: 'warning',
      overdue: 'danger',
    })
  })

  test('returns undefined progressbar when not present', () => {
    const xml = `<kanban default_group_by="stage_id">
      <field name="name"/>
    </kanban>`

    const result = parseKanbanXml(xml)
    expect(result.progressbar).toBeUndefined()
  })
})

describe('parsePivotXml', () => {
  test('parses row, col, and measure fields', () => {
    const xml = `<pivot>
      <field name="stage_id" type="row"/>
      <field name="create_date" type="col" interval="month"/>
      <field name="amount" type="measure" operator="sum"/>
    </pivot>`

    const result = parsePivotXml(xml)
    expect(result.type).toBe('pivot')
    expect(result.rowFields).toHaveLength(1)
    expect(result.rowFields[0].name).toBe('stage_id')
    expect(result.colFields).toHaveLength(1)
    expect(result.colFields[0].interval).toBe('month')
    expect(result.measures).toHaveLength(1)
    expect(result.measures[0].operator).toBe('sum')
  })

  test('adds default __count measure when no measures defined', () => {
    const xml = `<pivot><field name="stage_id" type="row"/></pivot>`

    const result = parsePivotXml(xml)
    expect(result.measures).toEqual([{ name: '__count', string: 'Count' }])
  })

  test('handles empty pivot', () => {
    const xml = `<pivot string="Empty"/>`

    const result = parsePivotXml(xml)
    expect(result.rowFields).toEqual([])
    expect(result.colFields).toEqual([])
    expect(result.measures).toEqual([{ name: '__count', string: 'Count' }])
  })

  test('parses pivot string and disable_linking', () => {
    const xml = `<pivot string="Analysis" disable_linking="1"><field name="x" type="row"/></pivot>`

    const result = parsePivotXml(xml)
    expect(result.string).toBe('Analysis')
    expect(result.disableLinking).toBe(true)
  })

  test('parses multiple row fields', () => {
    const xml = `<pivot>
      <field name="a" type="row"/>
      <field name="b" type="row"/>
    </pivot>`

    const result = parsePivotXml(xml)
    expect(result.rowFields).toHaveLength(2)
    expect(result.rowFields[0].name).toBe('a')
    expect(result.rowFields[1].name).toBe('b')
  })
})

describe('parseGraphXml', () => {
  test('parses basic bar graph', () => {
    const xml = `<graph string="Sales Analysis">
      <field name="stage_id" type="row"/>
      <field name="amount" type="measure" operator="sum"/>
    </graph>`

    const result = parseGraphXml(xml)
    expect(result.type).toBe('graph')
    expect(result.string).toBe('Sales Analysis')
    expect(result.graphType).toBe('bar')
    expect(result.rowFields).toHaveLength(1)
    expect(result.rowFields[0].name).toBe('stage_id')
    expect(result.measures).toHaveLength(1)
    expect(result.measures[0].operator).toBe('sum')
  })

  test('parses pie graph', () => {
    const xml = `<graph string="Pipeline" type="pie">
      <field name="stage_id" type="row"/>
    </graph>`

    const result = parseGraphXml(xml)
    expect(result.graphType).toBe('pie')
  })

  test('defaults to bar when type not specified', () => {
    const xml = `<graph><field name="x" type="row"/></graph>`
    const result = parseGraphXml(xml)
    expect(result.graphType).toBe('bar')
  })

  test('parses line graph with stacked and order', () => {
    const xml = `<graph type="line" stacked="True" order="amount desc">
      <field name="stage_id" type="row"/>
      <field name="amount" type="measure"/>
    </graph>`

    const result = parseGraphXml(xml)
    expect(result.graphType).toBe('line')
    expect(result.stacked).toBe(true)
    expect(result.orderBy).toBe('amount desc')
  })

  test('adds default __count measure when none defined', () => {
    const xml = `<graph><field name="stage_id" type="row"/></graph>`
    const result = parseGraphXml(xml)
    expect(result.measures).toEqual([{ name: '__count', string: 'Count' }])
  })

  test('parses multiple measures', () => {
    const xml = `<graph>
      <field name="stage_id" type="row"/>
      <field name="amount" type="measure" operator="sum"/>
      <field name="quantity" type="measure" operator="sum"/>
    </graph>`

    const result = parseGraphXml(xml)
    expect(result.measures).toHaveLength(2)
    expect(result.measures[0].name).toBe('amount')
    expect(result.measures[1].name).toBe('quantity')
  })
})

describe('parseCalendarXml', () => {
  test('parses basic calendar attributes', () => {
    const xml = `<calendar string="Meetings" date_start="start" date_stop="stop" color="partner_id" mode="week">
      <field name="name"/>
      <field name="partner_id"/>
    </calendar>`

    const result = parseCalendarXml(xml)
    expect(result.type).toBe('calendar')
    expect(result.string).toBe('Meetings')
    expect(result.dateStart).toBe('start')
    expect(result.dateStop).toBe('stop')
    expect(result.colorField).toBe('partner_id')
    expect(result.mode).toBe('week')
    expect(result.fields).toEqual(expect.arrayContaining(['name', 'partner_id']))
  })

  test('defaults to month mode', () => {
    const xml = `<calendar date_start="start"><field name="name"/></calendar>`
    const result = parseCalendarXml(xml)
    expect(result.mode).toBe('month')
  })

  test('parses avatar_field attribute', () => {
    const xml = `<calendar date_start="start">
      <field name="partner_id" avatar_field="avatar_128"/>
    </calendar>`

    const result = parseCalendarXml(xml)
    expect(result.avatarField).toBe('avatar_128')
  })

  test('handles empty calendar', () => {
    const xml = `<calendar date_start="start_date"/>`
    const result = parseCalendarXml(xml)
    expect(result.fields).toEqual([])
    expect(result.dateStart).toBe('start_date')
    expect(result.quickCreate).toBe(true)
    expect(result.hideTime).toBe(false)
  })

  test('parses event_limit and hide_time', () => {
    const xml = `<calendar date_start="start" event_limit="3" hide_time="1" quick_create="0"/>`
    const result = parseCalendarXml(xml)
    expect(result.eventLimit).toBe(3)
    expect(result.hideTime).toBe(true)
    expect(result.quickCreate).toBe(false)
  })
})
