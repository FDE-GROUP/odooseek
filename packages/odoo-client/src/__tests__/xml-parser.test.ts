import { describe, expect, test } from 'vitest'
import type { FormElement, ViewField } from '../types'
import {
  parseBootstrapColSpan,
  parseCalendarXml,
  parseFormXml,
  parseGraphXml,
  parseActivityXml,
  parseHierarchyXml,
  parseKanbanXml,
  parseListXml,
  parsePivotXml,
  parseSearchXml,
} from '../xml-parser'

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

describe('parseBootstrapColSpan', () => {
  test('reads col-lg-7 and col-lg-5', () => {
    expect(parseBootstrapColSpan('o_hr_column col-lg-7 d-flex')).toBe(7)
    expect(parseBootstrapColSpan('col-lg-5')).toBe(5)
  })
})

describe('parseFormXml', () => {
  test('parses HR work tab row with org chart column', () => {
    const xml = `<form string="Employee">
      <sheet>
        <notebook>
          <page string="Work">
            <div class="row" id="o_hr_work_information_container">
              <div id="o_work_information" class="o_hr_column col-lg-7 d-flex flex-column">
                <group string="work">
                  <field name="department_id"/>
                </group>
              </div>
              <div id="o_employee_org_chart" class="o_hr_column col-lg-5">
                <field name="child_ids" widget="hr_org_chart" nolabel="1"/>
              </div>
            </div>
          </page>
        </notebook>
      </sheet>
    </form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as { type: 'sheet'; elements: FormElement[] }
    const notebook = sheet.elements[0] as {
      type: 'notebook'
      pages: { elements: FormElement[] }[]
    }
    const row = notebook.pages[0].elements[0] as {
      type: 'layout_row'
      id?: string
      columns: { type: string; colSpan?: number; elements: FormElement[] }[]
    }
    expect(row.type).toBe('layout_row')
    expect(row.id).toBe('o_hr_work_information_container')
    expect(row.columns).toHaveLength(2)
    expect(row.columns[0].colSpan).toBe(7)
    expect(row.columns[1].colSpan).toBe(5)
    const orgField = row.columns[1].elements.find(
      (e) => e.type === 'field' && e.name === 'child_ids',
    )
    expect(orgField).toMatchObject({ widget: 'hr_org_chart' })
  })

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

  test('parses fields inside layout div wrappers (hr org chart)', () => {
    const xml = `<form string="Employee">
      <sheet>
        <div id="o_employee_right">
          <h4 class="o_org_chart_title">Organization Chart</h4>
          <field name="child_ids" widget="hr_org_chart" nolabel="1"/>
        </div>
      </sheet>
    </form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: string; name?: string; widget?: string }[]
    }
    const orgField = sheet.elements.find((e) => e.type === 'field' && e.name === 'child_ids')
    expect(orgField).toMatchObject({ type: 'field', name: 'child_ids', widget: 'hr_org_chart' })
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
      elements: { type: 'field'; name: string; readonly: boolean | undefined; invisible: string }[]
    }
    const field = sheet.elements[0]
    expect(field.type).toBe('field')
    expect(field.name).toBe('state')
    expect(field.readonly).toBe(true)
    expect(field.invisible).toBe('0')
  })

  test('parses readonly="False" and required="0" as false', () => {
    const xml = `<form><sheet><field name="x" readonly="False" required="0"/></sheet></form>`

    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: 'field'; name: string; readonly: boolean | undefined; required: boolean | undefined }[]
    }
    const field = sheet.elements[0]
    expect(field.readonly).toBe(false)
    expect(field.required).toBe(false)
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

  test('parses groups attribute on field, button, and group', () => {
    const xml = `<form>
      <header>
        <button name="hr_only" type="object" string="HR" groups="hr.group_hr_user"/>
      </header>
      <group groups="base.group_system">
        <field name="salary" groups="hr.group_hr_manager,hr.group_hr_user"/>
      </group>
    </form>`

    const result = parseFormXml(xml)
    const header = result.elements[0] as {
      type: 'header'
      buttons: { groups?: string }[]
    }
    expect(header.buttons[0].groups).toBe('hr.group_hr_user')

    const group = result.elements[1] as {
      type: 'group'
      groups?: string
      elements: { type: 'field'; groups?: string }[]
    }
    expect(group.groups).toBe('base.group_system')
    expect(group.elements[0].groups).toBe('hr.group_hr_manager,hr.group_hr_user')
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

  test('parses oe_title div as title_block', () => {
    const xml = `<form><sheet>
      <div class="oe_title">
        <h1><field name="name" nolabel="1" class="oe_inline"/></h1>
      </div>
    </sheet></form>`
    const result = parseFormXml(xml)
    const sheet = result.elements[0] as {
      type: 'sheet'
      elements: { type: 'title_block'; elements: { type: 'field'; name: string }[] }[]
    }
    expect(sheet.elements[0].type).toBe('title_block')
    expect(sheet.elements[0].elements[0].name).toBe('name')
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

  test('parses js_class attribute from form', () => {
    const xml = `<form string="Meetings" js_class="calendar_form">
      <sheet><field name="name"/></sheet>
    </form>`
    const result = parseFormXml(xml)
    expect(result.jsClass).toBe('calendar_form')
  })

  test('js_class defaults to undefined when not present', () => {
    const xml = `<form string="Test"><sheet><field name="name"/></sheet></form>`
    const result = parseFormXml(xml)
    expect(result.jsClass).toBeUndefined()
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

  test('parses can_open=0 (hr.department)', () => {
    const xml = `<kanban can_open="0" default_group_by="name">
      <field name="name"/>
    </kanban>`
    const result = parseKanbanXml(xml)
    expect(result.canOpen).toBe(false)
  })

  test('can_open defaults to true when not present', () => {
    const xml = `<kanban string="Test"><field name="name"/></kanban>`
    const result = parseKanbanXml(xml)
    expect(result.canOpen).toBe(true)
  })
})

describe('parseActivityXml', () => {
  test('parses HR employee activity view', () => {
    const xml = `<activity string="Employees">
      <field name="id"/>
      <templates>
        <div t-name="activity-box">
          <field name="name" class="o_text_block"/>
          <field name="job_id" class="o_text_block"/>
        </div>
      </templates>
    </activity>`

    const result = parseActivityXml(xml)
    expect(result.type).toBe('activity')
    expect(result.string).toBe('Employees')
    expect(result.fields).toEqual(['id'])
    expect(result.boxFields.map((f) => f.name)).toEqual(['name', 'job_id'])
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

  test('parses all_day attribute', () => {
    const xml = `<calendar date_start="start" all_day="allday">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.allDay).toBe('allday')
  })

  test('parses date_delay attribute', () => {
    const xml = `<calendar date_start="start" date_delay="duration">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.dateDelay).toBe('duration')
  })

  test('parses event_open_popup attribute', () => {
    const xml = `<calendar date_start="start" event_open_popup="1">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.eventOpenPopup).toBe(true)
  })

  test('event_open_popup=0 is false', () => {
    const xml = `<calendar date_start="start" event_open_popup="0">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.eventOpenPopup).toBe(false)
  })

  test('parses quick_create_view_id attribute', () => {
    const xml = `<calendar date_start="start" quick_create_view_id="42">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.quickCreateViewId).toBe(42)
  })

  test('parses multi_create_view attribute', () => {
    const xml = `<calendar date_start="start" multi_create_view="1">
      <field name="name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.multiEdit).toBe(true)
  })

  test('parses multi_create attribute (event slot calendar)', () => {
    const xml = `<calendar date_start="start_datetime" date_stop="end_datetime"
      color="color" multi_create="true" quick_create="0" all_day="0">
      <field name="display_name"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.multiEdit).toBe(true)
    expect(result.quickCreate).toBe(false)
    expect(result.allDay).toBe('0')
  })

  test('full Odoo calendar arch with all attributes', () => {
    const xml = `<calendar date_start="start" date_stop="stop" date_delay="duration"
      all_day="allday" color="partner_id" mode="week" event_limit="5"
      quick_create="1" hide_time="0" event_open_popup="1"
      quick_create_view_id="100" multi_create_view="1">
      <field name="name"/>
      <field name="partner_id" avatar_field="avatar_128"/>
    </calendar>`
    const result = parseCalendarXml(xml)
    expect(result.dateStart).toBe('start')
    expect(result.dateStop).toBe('stop')
    expect(result.dateDelay).toBe('duration')
    expect(result.allDay).toBe('allday')
    expect(result.colorField).toBe('partner_id')
    expect(result.mode).toBe('week')
    expect(result.eventLimit).toBe(5)
    expect(result.quickCreate).toBe(true)
    expect(result.hideTime).toBe(false)
    expect(result.eventOpenPopup).toBe(true)
    expect(result.quickCreateViewId).toBe(100)
    expect(result.multiEdit).toBe(true)
    expect(result.avatarField).toBe('avatar_128')
    expect(result.fields).toEqual(expect.arrayContaining(['name', 'partner_id']))
  })
})

// ── Robustness edge cases ───────────────────────────────────────────

describe('xml-parser robustness', () => {
  test('handles empty string gracefully', () => {
    const list = parseListXml('')
    expect(list.columns).toEqual([])

    const form = parseFormXml('')
    expect(form.elements).toEqual([])

    const kanban = parseKanbanXml('')
    expect(kanban.fields).toEqual([])
  })

  test('handles empty arch element', () => {
    const form = parseFormXml('<form></form>')
    expect(form.elements).toEqual([])

    const list = parseListXml('<tree></tree>')
    expect(list.columns).toEqual([])
  })

  test('handles deeply nested field inside groups', () => {
    const form = parseFormXml(`<form>
      <sheet>
        <group>
          <group>
            <field name="deep_field" widget="url"/>
          </group>
        </group>
      </sheet>
    </form>`)
    expect(form.elements.length).toBeGreaterThan(0)
    // Should have at least a sheet element
    expect(form.elements.some((e) => e.type === 'sheet')).toBe(true)
  })

  test('handles form with header and sheet', () => {
    const form = parseFormXml(`<form>
      <header>
        <button name="confirm" type="object" string="Confirm"/>
        <field name="state" widget="statusbar"/>
      </header>
      <sheet>
        <field name="name"/>
      </sheet>
    </form>`)
    // Form should have header and sheet elements
    expect(form.elements.some((e) => e.type === 'header')).toBe(true)
    expect(form.elements.some((e) => e.type === 'sheet')).toBe(true)
  })

  test('handles unknown tags gracefully', () => {
    const form = parseFormXml(`<form>
      <unknown_tag>
        <field name="name"/>
      </unknown_tag>
      <field name="email"/>
    </form>`)
    // Should at least parse the direct field element
    expect(form.elements.length).toBeGreaterThan(0)
  })
})

describe('parseHierarchyXml', () => {
  test('parses basic hierarchy with child_field', () => {
    const xml = `<hierarchy child_field="child_ids">
      <field name="name"/>
      <field name="total_employee"/>
    </hierarchy>`
    const result = parseHierarchyXml(xml)
    expect(result.type).toBe('hierarchy')
    expect(result.childField).toBe('child_ids')
    expect(result.fields).toEqual(['name', 'total_employee'])
  })

  test('parses draggable attribute', () => {
    const xml = `<hierarchy child_field="child_ids" draggable="1">
      <field name="name"/>
    </hierarchy>`
    const result = parseHierarchyXml(xml)
    expect(result.draggable).toBe(true)
  })

  test('defaults child_field to child_ids', () => {
    const xml = `<hierarchy><field name="name"/></hierarchy>`
    const result = parseHierarchyXml(xml)
    expect(result.childField).toBe('child_ids')
  })

  test('deduplicates fields', () => {
    const xml = `<hierarchy child_field="child_ids">
      <field name="name"/>
      <field name="name"/>
    </hierarchy>`
    const result = parseHierarchyXml(xml)
    expect(result.fields).toEqual(['name'])
  })
})
