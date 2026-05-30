import { parseDomainString } from './expression-evaluator'
import type {
  ButtonBoxElement,
  ButtonElement,
  ControlButton,
  FieldElement,
  FormElement,
  GraphField,
  GraphMeasure,
  KanbanTemplateNode,
  ListButtonElement,
  ListButtonGroup,
  ListColumn,
  ParsedCalendarView,
  ParsedFormView,
  ParsedGraphView,
  ParsedKanbanView,
  ParsedListView,
  ParsedPivotView,
  ParsedSearchView,
  PivotField,
  PivotMeasure,
  SearchFilter,
  SearchGroupBy,
  StatButtonContent,
  StatButtonElement,
  ViewField,
} from './odoo-types'

function parseFieldElement(el: Element): FieldElement {
  return {
    type: 'field',
    name: el.getAttribute('name') ?? '',
    widget: el.getAttribute('widget') ?? undefined,
    string: el.getAttribute('string') ?? undefined,
    invisible: el.getAttribute('invisible') ?? undefined,
    required: el.hasAttribute('required') ? el.getAttribute('required') || true : undefined,
    readonly: el.hasAttribute('readonly') ? el.getAttribute('readonly') || true : undefined,
    nolabel: el.hasAttribute('nolabel'),
    placeholder: el.getAttribute('placeholder') ?? undefined,
    options: el.getAttribute('options')
      ? parseOptions(el.getAttribute('options') ?? '')
      : undefined,
    mode: el.getAttribute('mode') ?? undefined,
    colspan: el.hasAttribute('colspan')
      ? parseInt(el.getAttribute('colspan') as string, 10)
      : undefined,
  }
}

function parseOptions(attrs: string): Record<string, unknown> {
  try {
    return JSON.parse(attrs.replace(/'/g, '"'))
  } catch {
    return {}
  }
}

function parseChildren(parent: Element, tag: string): Element[] {
  return Array.from(parent.children).filter((c) => c.tagName === tag)
}

function parseButtonElement(el: Element): ButtonElement {
  return {
    type: 'button',
    name: el.getAttribute('name') ?? '',
    string: el.getAttribute('string') ?? undefined,
    buttonType: (el.getAttribute('type') as 'object' | 'action' | 'edit') ?? undefined,
    class: el.getAttribute('class') ?? undefined,
    icon: el.getAttribute('icon') ?? undefined,
    invisible: el.getAttribute('invisible') ?? undefined,
    states: el.getAttribute('states') ?? undefined,
    confirm: el.getAttribute('confirm') ?? undefined,
  }
}

function parseButtonBox(el: Element): ButtonBoxElement {
  const buttons: StatButtonElement[] = []
  for (const btn of Array.from(el.children)) {
    if (btn.tagName !== 'button') continue
    const base = parseButtonElement(btn)
    let content: StatButtonContent | undefined
    // Pattern 1: <field name="count" widget="statinfo" string="Label"/>
    const statField = Array.from(btn.children).find((c) => c.tagName === 'field')
    if (statField) {
      content = {
        type: 'field',
        fieldName: statField.getAttribute('name') ?? '',
        string: statField.getAttribute('string') ?? undefined,
      }
    }
    // Pattern 2: <div class="o_stat_info"><span class="o_stat_value">...</span><span class="o_stat_text">...</span></div>
    if (!content) {
      const infoDiv = Array.from(btn.children).find((c) =>
        (c.getAttribute('class') ?? '').includes('o_stat_info'),
      )
      if (infoDiv) {
        const textSpan = Array.from(infoDiv.children).find((c) =>
          (c.getAttribute('class') ?? '').includes('o_stat_text'),
        )
        const valueField = infoDiv.getElementsByTagName('field')[0]
        content = {
          type: 'custom',
          valueField: valueField?.getAttribute('name') ?? undefined,
          textFallback: textSpan?.textContent?.trim() ?? undefined,
        }
      }
    }
    buttons.push({
      type: 'stat_button',
      name: base.name,
      string: base.string,
      buttonType: base.buttonType === 'edit' ? undefined : base.buttonType,
      icon: base.icon,
      invisible: base.invisible,
      confirm: base.confirm,
      content,
    })
  }
  return { type: 'button_box', name: el.getAttribute('name') ?? undefined, buttons }
}

function parseFormElements(container: Element): FormElement[] {
  const elements: FormElement[] = []

  for (const child of Array.from(container.children)) {
    const tag = child.tagName

    if (tag === 'header') {
      const buttons = parseChildren(child, 'button').map(parseButtonElement)
      elements.push({ type: 'header', buttons })
    } else if (tag === 'button') {
      elements.push(parseButtonElement(child))
    } else if (tag === 'div' && (child.getAttribute('class') ?? '').includes('oe_button_box')) {
      elements.push(parseButtonBox(child))
    } else if (tag === 'field') {
      const fieldEl = parseFieldElement(child)

      // Parse nested sub-views for o2m/o2m fields
      const treeChild = Array.from(child.children).find(
        (c) => c.tagName === 'tree' || c.tagName === 'list',
      )
      const formChild = Array.from(child.children).find((c) => c.tagName === 'form')

      if (treeChild) {
        fieldEl.subViews = {
          list: {
            columns: Array.from(treeChild.querySelectorAll('field')).map(parseFieldAttrs),
            editable: treeChild.getAttribute('editable') ?? undefined,
            decorations: parseDecorations(treeChild),
            create: treeChild.getAttribute('create') !== 'false',
            delete: treeChild.getAttribute('delete') !== 'false',
          },
        }
        if (formChild) {
          fieldEl.subViews.form = { elements: parseFormElements(formChild) }
        }
      } else if (formChild) {
        fieldEl.subViews = { form: { elements: parseFormElements(formChild) } }
      }

      elements.push(fieldEl)
    } else if (tag === 'sheet') {
      elements.push({
        type: 'sheet',
        elements: parseFormElements(child),
      })
    } else if (tag === 'group') {
      const col = Number(child.getAttribute('col') ?? 2)
      elements.push({
        type: 'group',
        string: child.getAttribute('string') ?? undefined,
        invisible: child.getAttribute('invisible') ?? undefined,
        col,
        elements: parseFormElements(child),
      })
    } else if (tag === 'notebook') {
      const pages = parseChildren(child, 'page').map((page) => ({
        string: page.getAttribute('string') ?? '',
        invisible: page.getAttribute('invisible') ?? undefined,
        elements: parseFormElements(page),
      }))
      elements.push({ type: 'notebook', pages })
    } else if (tag === 'separator') {
      elements.push({
        type: 'separator',
        string: child.getAttribute('string') ?? undefined,
      })
    } else if (tag === 'newline') {
      elements.push({ type: 'newline' })
    } else if (tag === 'label') {
      elements.push({
        type: 'label',
        string: child.getAttribute('string') ?? '',
      })
    }
  }

  return elements
}

const DECO_KEYS = ['bf', 'it', 'danger', 'warning', 'success', 'info', 'muted'] as const

function parseDecorations(el: Element): Record<string, string> {
  const decorations: Record<string, string> = {}
  for (const key of DECO_KEYS) {
    const val = el.getAttribute(`decoration-${key}`)
    if (val) decorations[`decoration_${key}`] = val
  }
  return decorations
}

function parseFieldAttrs(el: Element): ViewField {
  const optVal = el.getAttribute('optional')
  const invAttr = el.getAttribute('invisible')
  const colInvAttr = el.getAttribute('column_invisible')
  return {
    name: el.getAttribute('name') ?? '',
    string: el.getAttribute('string') ?? undefined,
    widget: el.getAttribute('widget') ?? undefined,
    invisible: invAttr ? Number(invAttr) : undefined,
    columnInvisible: colInvAttr ?? undefined,
    optional: optVal === 'show' || optVal === 'hide' ? optVal : undefined,
    sum: el.getAttribute('sum') ?? undefined,
    avg: el.getAttribute('avg') ?? undefined,
    min: el.getAttribute('min') ?? undefined,
    max: el.getAttribute('max') ?? undefined,
    class: el.getAttribute('class') ?? undefined,
    readonly: el.hasAttribute('readonly'),
    required: el.hasAttribute('required'),
    ...parseDecorations(el),
  }
}

function parseListButtonElement(el: Element): ListButtonElement {
  return {
    type: 'button',
    name: el.getAttribute('name') ?? '',
    string: el.getAttribute('string') ?? undefined,
    buttonType: (el.getAttribute('type') as 'object' | 'action') ?? undefined,
    icon: el.getAttribute('icon') ?? undefined,
    invisible: el.getAttribute('invisible') ?? undefined,
    states: el.getAttribute('states') ?? undefined,
    confirm: el.getAttribute('confirm') ?? undefined,
    class: el.getAttribute('class') ?? undefined,
  }
}

/** Parse Odoo <list> XML → ParsedListView */
export function parseListXml(xml: string): ParsedListView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const columns: ListColumn[] = []
  const controlButtons: ControlButton[] = []
  for (const child of Array.from(root.children)) {
    if (child.tagName === 'field') {
      columns.push(parseFieldAttrs(child))
    } else if (child.tagName === 'button') {
      // Group consecutive buttons into a button_group
      const btn = parseListButtonElement(child)
      const last = columns[columns.length - 1]
      if (last && 'buttons' in last && Array.isArray((last as ListButtonGroup).buttons)) {
        ;(last as ListButtonGroup).buttons.push(btn)
      } else {
        columns.push({ type: 'button_group', buttons: [btn] } as ListColumn)
      }
    } else if (child.tagName === 'control') {
      for (const ctrl of Array.from(child.children)) {
        if (ctrl.tagName === 'create') {
          controlButtons.push({
            type: 'create',
            string: ctrl.getAttribute('string') ?? undefined,
            invisible: ctrl.getAttribute('invisible') ?? undefined,
          })
        } else if (ctrl.tagName === 'delete') {
          controlButtons.push({
            type: 'delete',
            string: ctrl.getAttribute('string') ?? undefined,
            invisible: ctrl.getAttribute('invisible') ?? undefined,
          })
        }
      }
    }
  }

  const countLimit = root.getAttribute('count_limit')
  const groupsLimit = root.getAttribute('groups_limit')
  const limitAttr = root.getAttribute('limit')

  return {
    type: 'list',
    string: root.getAttribute('string') ?? '',
    editable: root.getAttribute('editable') ?? undefined,
    create: root.getAttribute('create') !== 'false',
    delete: root.getAttribute('delete') !== 'false',
    defaultOrder: root.getAttribute('default_order') ?? undefined,
    noOpen: root.getAttribute('no_open') === '1',
    openFormView: root.getAttribute('open_form_view') === '1',
    exportXlsx: root.getAttribute('export_xlsx') !== 'false',
    limit: limitAttr ? Number(limitAttr) : undefined,
    countLimit: countLimit ? Number(countLimit) : undefined,
    groupsLimit: groupsLimit ? Number(groupsLimit) : undefined,
    groupCreate: root.getAttribute('group_create') !== 'false',
    groupEdit: root.getAttribute('group_edit') !== 'false',
    groupDelete: root.getAttribute('group_delete') !== 'false',
    multiEdit: root.getAttribute('multi_edit') !== 'false',
    decorations: parseDecorations(root),
    columns,
    controlButtons: controlButtons.length > 0 ? controlButtons : undefined,
    rowClass: root.getAttribute('class') ?? undefined,
  }
}

/** Parse Odoo <form> XML → ParsedFormView */
export function parseFormXml(xml: string): ParsedFormView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  return {
    type: 'form',
    string: root.getAttribute('string') ?? '',
    elements: parseFormElements(root),
  }
}

/** Parse Odoo <kanban> XML → ParsedKanbanView */
export function parseKanbanXml(xml: string): ParsedKanbanView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const fieldEls = root.querySelectorAll('field')
  const fields = [...new Set(Array.from(fieldEls).map((el) => el.getAttribute('name') ?? ''))]

  const defaultGroupBy = root.getAttribute('default_group_by') ?? undefined
  const highlightColor = root.getAttribute('highlight_color') ?? undefined

  // Use XMLSerializer to preserve inner XML (textContent strips tags!)
  const serializer = new XMLSerializer()
  const templateEl = root.querySelector('template')
  const templatesEl = root.querySelector('templates')
  const rawTemplate = templateEl
    ? Array.from(templateEl.children)
        .map((c) => serializer.serializeToString(c))
        .join('')
    : templatesEl
      ? serializer.serializeToString(templatesEl)
      : ''
  const templateText = templateEl?.textContent ?? ''
  const qwebText = templatesEl?.textContent ?? ''

  const templateNodes = rawTemplate ? parseKanbanTemplate(rawTemplate) : undefined

  // Parse <progressbar> element
  const progressbarEl = root.querySelector('progressbar')
  let progressbar: { field: string; colors: Record<string, string> } | undefined
  if (progressbarEl) {
    const field = progressbarEl.getAttribute('field') || ''
    const colorsRaw = progressbarEl.getAttribute('colors') || '{}'
    let colors: Record<string, string> = {}
    try {
      const normalized = colorsRaw.replace(/'/g, '"')
      colors = JSON.parse(normalized)
    } catch {
      /* skip */
    }
    if (field) progressbar = { field, colors }
  }

  return {
    type: 'kanban',
    string: root.getAttribute('string') ?? '',
    fields,
    template: templateText || qwebText,
    templateNodes,
    defaultGroupBy,
    highlightColor,
    progressbar,
  }
}

/** Extract <field> elements from a kanban card template */
export function parseKanbanFields(templateXml: string): ViewField[] {
  const doc = new DOMParser().parseFromString(templateXml, 'text/xml')
  return Array.from(doc.querySelectorAll('field')).map((el) => {
    const invAttr = el.getAttribute('invisible')
    return {
      name: el.getAttribute('name') ?? '',
      string: el.getAttribute('string') ?? undefined,
      widget: el.getAttribute('widget') ?? undefined,
      invisible: invAttr ? Number(invAttr) : undefined,
      readonly: el.hasAttribute('readonly'),
    }
  })
}

// ── Phase 4: QWeb template AST parser ─────────────────────────

/** Parse kanban card template XML → KanbanTemplateNode[] AST */
export function parseKanbanTemplate(templateXml: string): KanbanTemplateNode[] {
  const doc = new DOMParser().parseFromString(templateXml, 'text/xml')
  const root = doc.documentElement
  // HTML <template> element stores children in .content (DocumentFragment)
  // XML <templates> element uses direct childNodes
  const isHtmlTemplate = root.tagName.toLowerCase() === 'template' && 'content' in root
  const container = isHtmlTemplate
    ? (root as unknown as { content: DocumentFragment }).content
    : root
  return mergeConditionChains(parseChildNodes(container))
}

/** Recursively parse child nodes of an element or document fragment */
function parseChildNodes(el: { childNodes: NodeListOf<ChildNode> }): KanbanTemplateNode[] {
  const result: KanbanTemplateNode[] = []
  for (const child of el.childNodes) {
    if (child.nodeName === 't' && !childIsQwebDirective(child as Element)) {
      // Transparent <t> container — flatten children inline
      for (const grandchild of parseChildNodes(child as Element)) {
        result.push(grandchild)
      }
    } else {
      const node = parseNode(child)
      if (node) result.push(node)
    }
  }
  return result
}

function childIsQwebDirective(el: Element): boolean {
  return (
    el.hasAttribute('t-if') ||
    el.hasAttribute('t-elif') ||
    el.hasAttribute('t-else') ||
    el.hasAttribute('t-foreach') ||
    el.hasAttribute('t-out')
  )
}

const HTML_TAGS = new Set([
  'div',
  'span',
  'a',
  'p',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'section',
  'header',
  'table',
  'tr',
  'td',
  'th',
  'br',
  'hr',
  'img',
])

function parseNode(node: ChildNode): KanbanTemplateNode | null {
  if (node.nodeType === 3) {
    // Text node
    const content = node.textContent?.replace(/\s+/g, ' ').trim()
    if (!content) return null
    return { type: 'text', content }
  }
  if (node.nodeType !== 1) return null

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  // <field> elements
  if (tag === 'field') {
    return {
      type: 'field',
      name: el.getAttribute('name') ?? '',
      widget: el.getAttribute('widget') ?? undefined,
      class: el.getAttribute('class') ?? undefined,
    }
  }

  // Skip <widget> for now
  if (tag === 'widget') return null

  // QWeb directives
  const tIf = el.getAttribute('t-if')
  const tElif = el.getAttribute('t-elif')
  const tElse = el.hasAttribute('t-else')
  const tForeach = el.getAttribute('t-foreach')
  const tAs = el.getAttribute('t-as')
  const tOut = el.getAttribute('t-out')

  if (tForeach && tAs) {
    return {
      type: 'loop',
      foreach: tForeach,
      as: tAs,
      children: parseChildNodes(el),
    }
  }

  if (tIf) {
    return {
      type: 'condition',
      if: tIf,
      children: parseChildNodes(el),
    }
  }

  if (tElif) {
    return {
      type: 'condition',
      elif: tElif,
      children: parseChildNodes(el),
    }
  }

  if (tElse) {
    return {
      type: 'condition',
      else: '',
      children: parseChildNodes(el),
    }
  }

  if (tOut) {
    return {
      type: 'output',
      expr: tOut,
      widget: el.getAttribute('t-options-widget') ?? undefined,
    }
  }

  // <footer> special handling
  if (tag === 'footer') {
    return { type: 'footer', children: parseChildNodes(el) }
  }

  // HTML wrapper elements
  if (HTML_TAGS.has(tag)) {
    return {
      type: 'html',
      tag,
      class: el.getAttribute('class') ?? undefined,
      children: parseChildNodes(el),
    }
  }

  // Unknown: recurse into children (skip the wrapper)
  return null
}

/** Merge adjacent condition nodes (t-elif/t-else) into a chain */
function mergeConditionChains(nodes: KanbanTemplateNode[]): KanbanTemplateNode[] {
  const result: KanbanTemplateNode[] = []
  for (const node of nodes) {
    if (
      node.type === 'condition' &&
      (node.elif !== undefined || node.else !== undefined) &&
      result.length > 0
    ) {
      const last = result[result.length - 1]
      if (last?.type === 'condition' && last.if) {
        // Append as elif/else to the previous if-condition
        last.children.push(node)
        continue
      }
    }
    result.push(node)
  }
  return result
}

// ── GroupBy context parser ────────────────────────────────────

function parseGroupByContext(context: string): { fieldName: string; interval?: string } | null {
  const m = context.match(/group_by['"\]]*\s*:\s*['"]([^'"]+)['"]/)
  if (!m) return null
  const raw = m[1]
  const colonIdx = raw.indexOf(':')
  if (colonIdx > 0) {
    return { fieldName: raw.slice(0, colonIdx), interval: raw.slice(colonIdx + 1) }
  }
  return { fieldName: raw }
}

/** Parse Odoo <search> XML → ParsedSearchView */
export function parseSearchXml(xml: string): ParsedSearchView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const searchFields: ViewField[] = Array.from(root.querySelectorAll('field')).map((el) => {
    const filterDomainRaw = el.getAttribute('filter_domain')
    const parsed = parseDomainString(filterDomainRaw)
    return {
      name: el.getAttribute('name') ?? '',
      string: el.getAttribute('string') ?? undefined,
      operator: el.getAttribute('operator') ?? 'ilike',
      filter_domain: parsed ?? undefined,
    }
  })

  const allFilters: SearchFilter[] = []
  const groupByFilters: SearchGroupBy[] = []

  Array.from(root.querySelectorAll('filter, separator')).forEach((el) => {
    const domainRaw = el.getAttribute('domain')
    const contextStr = el.getAttribute('context')
    const domain = parseDomainString(domainRaw)
    const name = el.getAttribute('name') ?? ''
    const string = el.getAttribute('string') ?? ''

    const gb = contextStr ? parseGroupByContext(contextStr) : null

    if (gb) {
      groupByFilters.push({
        name,
        string: string || gb.fieldName,
        fieldName: gb.fieldName,
        interval: gb.interval,
      })
    }

    // skip filters whose domain cannot be parsed client-side (e.g., containing uid/self)
    if (domain === null) return

    if (domain.length > 0) {
      allFilters.push({
        name,
        string,
        domain,
        help: el.getAttribute('help') ?? undefined,
        context: contextStr ?? undefined,
      })
    } else if (!gb) {
      // separator or filter without domain/groupby
      allFilters.push({
        name,
        string,
        domain: [],
        help: el.getAttribute('help') ?? undefined,
        context: contextStr ?? undefined,
      })
    }
  })

  return { type: 'search', fields: searchFields, filters: allFilters, groupByFilters }
}

/** Parse Odoo <pivot> XML → ParsedPivotView */
export function parsePivotXml(xml: string): ParsedPivotView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const rowFields: PivotField[] = []
  const colFields: PivotField[] = []
  const measures: PivotMeasure[] = []

  Array.from(root.querySelectorAll('field')).forEach((el) => {
    const type = el.getAttribute('type') ?? 'measure'
    const name = el.getAttribute('name') ?? ''
    const string = el.getAttribute('string') ?? undefined
    const interval = el.getAttribute('interval') ?? undefined

    if (type === 'row') {
      rowFields.push({ name, string, interval })
    } else if (type === 'col') {
      colFields.push({ name, string, interval })
    } else if (type === 'measure') {
      measures.push({ name, string, operator: el.getAttribute('operator') ?? undefined })
    }
  })

  if (measures.length === 0) {
    measures.push({ name: '__count', string: 'Count' })
  }

  return {
    type: 'pivot',
    string: root.getAttribute('string') ?? 'Pivot',
    disableLinking: root.getAttribute('disable_linking') !== undefined,
    defaultOrder: root.getAttribute('default_order') ?? undefined,
    rowFields,
    colFields,
    measures,
  }
}

/** Parse Odoo <graph> XML → ParsedGraphView */
export function parseGraphXml(xml: string): ParsedGraphView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const rowFields: GraphField[] = []
  const colFields: GraphField[] = []
  const measures: GraphMeasure[] = []

  Array.from(root.querySelectorAll('field')).forEach((el) => {
    const type = el.getAttribute('type') ?? 'measure'
    const name = el.getAttribute('name') ?? ''
    const string = el.getAttribute('string') ?? undefined
    const interval = el.getAttribute('interval') ?? undefined

    if (type === 'row') {
      rowFields.push({ name, string, interval })
    } else if (type === 'col') {
      colFields.push({ name, string, interval })
    } else if (type === 'measure') {
      measures.push({ name, string, operator: el.getAttribute('operator') ?? undefined })
    }
  })

  if (measures.length === 0) {
    measures.push({ name: '__count', string: 'Count' })
  }

  const rawType = root.getAttribute('type') ?? 'bar'
  const graphType = rawType === 'line' || rawType === 'pie' ? rawType : 'bar'

  return {
    type: 'graph',
    string: root.getAttribute('string') ?? '',
    graphType,
    rowFields,
    colFields,
    measures,
    stacked: root.getAttribute('stacked') === 'True' || undefined,
    orderBy: root.getAttribute('order') ?? undefined,
  }
}

/** Parse Odoo <calendar> XML → ParsedCalendarView */
export function parseCalendarXml(xml: string): ParsedCalendarView {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const fields = [
    ...new Set(
      Array.from(root.querySelectorAll('field')).map((el) => el.getAttribute('name') ?? ''),
    ),
  ]

  const avatarEl = Array.from(root.querySelectorAll('field')).find((el) =>
    el.hasAttribute('avatar_field'),
  )

  const rawMode = root.getAttribute('mode') ?? 'month'
  const mode: 'day' | 'week' | 'month' = rawMode === 'day' || rawMode === 'week' ? rawMode : 'month'

  return {
    type: 'calendar',
    string: root.getAttribute('string') ?? '',
    dateStart: root.getAttribute('date_start') ?? '',
    dateStop: root.getAttribute('date_stop') ?? undefined,
    colorField: root.getAttribute('color') ?? undefined,
    mode,
    fields,
    avatarField: avatarEl?.getAttribute('avatar_field') ?? undefined,
    eventLimit: root.getAttribute('event_limit')
      ? Number(root.getAttribute('event_limit'))
      : undefined,
    quickCreate: root.getAttribute('quick_create') !== '0',
    hideTime: root.getAttribute('hide_time') === '1',
  }
}
