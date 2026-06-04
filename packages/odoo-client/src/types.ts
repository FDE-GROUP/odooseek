// Odoo 19 CE view type definitions

export type ViewType = 'list' | 'form' | 'kanban' | 'pivot' | 'graph' | 'calendar' | 'activity' | 'hierarchy'

export interface OdooFieldMeta {
  name: string
  type: string // char, text, integer, float, boolean, date, datetime, selection, many2one, many2many, one2many, binary, html, reference, monetary
  string: string // display label
  required: boolean
  readonly: boolean
  relation?: string
  domain?: unknown
  selection?: [string, string][]
  help?: string
  store: boolean
  searchable: boolean
  sortable: boolean
  widget?: string
  onChange?: boolean
}

export interface ViewField {
  name: string
  string?: string
  type?: string
  widget?: string
  options?: Record<string, unknown>
  invisible?: number
  columnInvisible?: string
  optional?: 'show' | 'hide'
  required?: boolean
  readonly?: boolean
  nolabel?: boolean
  placeholder?: string
  sum?: string
  avg?: string
  min?: string
  max?: string
  operator?: string
  filter_domain?: unknown
  class?: string
  decoration_bf?: string
  decoration_it?: string
  decoration_danger?: string
  decoration_warning?: string
  decoration_success?: string
  decoration_info?: string
  decoration_muted?: string
}

export interface ParsedListView {
  type: 'list'
  string: string
  jsClass?: string
  editable?: string
  create?: boolean
  delete?: boolean
  defaultOrder?: string
  noOpen?: boolean
  openFormView?: boolean
  exportXlsx?: boolean
  limit?: number
  countLimit?: number
  groupsLimit?: number
  groupCreate?: boolean
  groupEdit?: boolean
  groupDelete?: boolean
  multiEdit?: boolean
  columns: ListColumn[]
  decorations: Record<string, string>
  controlButtons?: ControlButton[]
  rowClass?: string
}

export interface ControlButton {
  type: 'create' | 'delete'
  string?: string
  invisible?: string
}

export interface ListButtonElement {
  type: 'button'
  name: string
  string?: string
  buttonType?: 'object' | 'action'
  icon?: string
  invisible?: string
  states?: string
  confirm?: string
  class?: string
}

export interface ListButtonGroup {
  type: 'button_group'
  buttons: ListButtonElement[]
}

export type ListColumn = ViewField | ListButtonElement | ListButtonGroup

export interface ParsedFormView {
  type: 'form'
  string: string
  elements: FormElement[]
  jsClass?: string
  title?: string
}

export type FormElement =
  | HeaderElement
  | SheetElement
  | GroupElement
  | NotebookElement
  | FieldElement
  | ButtonElement
  | ButtonBoxElement
  | SeparatorElement
  | NewlineElement
  | LabelElement
  | TitleBlockElement
  | LayoutRowElement
  | LayoutColumnElement

export interface TitleBlockElement {
  type: 'title_block'
  elements: FormElement[]
}

/** Bootstrap row (e.g. HR Work tab `col-lg-7` + `col-lg-5`). */
export interface LayoutRowElement {
  type: 'layout_row'
  id?: string
  class?: string
  columns: LayoutColumnElement[]
}

export interface LayoutColumnElement {
  type: 'layout_column'
  id?: string
  class?: string
  /** Bootstrap 12-grid span from `col-lg-N` / `col-N`. */
  colSpan?: number
  elements: FormElement[]
}

export interface HeaderElement {
  type: 'header'
  buttons: ButtonElement[]
}

export interface ButtonElement {
  type: 'button'
  name: string
  string?: string
  buttonType?: 'object' | 'action' | 'edit'
  class?: string
  icon?: string
  invisible?: string
  groups?: string
  states?: string
  confirm?: string
  special?: 'cancel'
  context?: string
}

export interface ButtonBoxElement {
  type: 'button_box'
  name?: string
  buttons: StatButtonElement[]
}

export interface StatButtonElement {
  type: 'stat_button'
  name: string
  string?: string
  buttonType?: 'object' | 'action'
  icon?: string
  invisible?: string
  confirm?: string
  context?: string
  content?: StatButtonContent
}

export type StatButtonContent =
  | { type: 'field'; fieldName: string; string?: string }
  | { type: 'custom'; valueField?: string; textFallback?: string }

export interface SheetElement {
  type: 'sheet'
  elements: FormElement[]
}

export interface GroupElement {
  type: 'group'
  string?: string
  invisible?: string
  groups?: string
  col?: number
  elements: FormElement[]
}

export interface NotebookElement {
  type: 'notebook'
  pages: { string: string; invisible?: string; elements: FormElement[] }[]
}

export interface FieldElement {
  type: 'field'
  name: string
  widget?: string
  string?: string
  options?: Record<string, unknown>
  groups?: string
  invisible?: string
  required?: string | boolean
  readonly?: string | boolean
  nolabel?: boolean
  colspan?: number
  class?: string
  placeholder?: string
  mode?: string
  subViews?: {
    list?: O2mSubView
    form?: O2mFormSubView
  }
}

export interface O2mSubView {
  columns: ViewField[]
  editable?: string
  decorations: Record<string, string>
  create?: boolean
  delete?: boolean
}

export interface O2mFormSubView {
  elements: FormElement[]
}

export type O2mCommand =
  | [0, number, Record<string, unknown>]
  | [1, number, Record<string, unknown>]
  | [2, number]
  | [4, number]
  | [5, 0]
  | [6, 0, number[]]

export interface SeparatorElement {
  type: 'separator'
  string?: string
}

export interface NewlineElement {
  type: 'newline'
}

export interface LabelElement {
  type: 'label'
  string: string
}

export interface KanbanProgressbar {
  field: string
  colors: Record<string, string>
  sumField?: string
}

export interface ParsedKanbanView {
  type: 'kanban'
  string: string
  jsClass?: string
  fields: string[]
  template: string // raw template HTML
  templateNodes?: KanbanTemplateNode[] // AST (Phase 4)
  defaultGroupBy?: string
  highlightColor?: string // e.g. "color"
  progressbar?: KanbanProgressbar
  quickCreateView?: string
  canOpen?: boolean // when false, clicking cards does nothing (e.g. hr.department)
}

/** Odoo `<activity>` view — matrix of records × mail.activity.type */
export interface ParsedActivityView {
  type: 'activity'
  string: string
  jsClass?: string
  fields: string[]
  boxFields: ViewField[]
}

/** Response shape of `mail.activity.get_activity_data` */
export interface OdooActivityTypeInfo {
  id: number
  name: string
  template_ids: { id: number; name: string }[]
}

export interface OdooActivityGroupCell {
  count_by_state: Record<string, number>
  ids: number[]
  reporting_date: string | false | null
  state: string
  user_assigned_ids: number[]
  summaries?: string[]
  attachments_info?: {
    count: number
    most_recent_id: number
    most_recent_name: string
  }
}

export interface OdooActivityData {
  activity_types: OdooActivityTypeInfo[]
  activity_res_ids: number[]
  grouped_activities: Record<number | string, Record<number | string, OdooActivityGroupCell>>
}

// ── Phase 4: QWeb template AST ───────────────────────────────

export type KanbanTemplateNode =
  | { type: 'field'; name: string; widget?: string; class?: string; options?: Record<string, unknown>; optional?: string }
  | { type: 'condition'; if?: string; elif?: string; else?: string; children: KanbanTemplateNode[] }
  | { type: 'loop'; foreach: string; as: string; children: KanbanTemplateNode[] }
  | { type: 'output'; expr: string; widget?: string }
  | { type: 'html'; tag: string; class?: string; children: KanbanTemplateNode[] }
  | { type: 'text'; content: string }
  | { type: 'footer'; children: KanbanTemplateNode[] }

export interface ParsedSearchView {
  type: 'search'
  fields: ViewField[]
  filters: SearchFilter[]
  groupByFilters: SearchGroupBy[]
  searchPanel?: ParsedSearchPanel
}

export interface ParsedSearchPanel {
  fields: SearchPanelField[]
  class?: string
}

export interface SearchPanelField {
  name: string
  string?: string
  select: 'one' | 'multi'
  icon?: string
  enableCounters: boolean
  limit?: number
  groupBy?: string
  color?: string
}

export interface SearchPanelCategory {
  id: number | string
  displayName: string
  count?: number
  parentId?: number | string | false
  icon?: string
  groupName?: string
  groupCount?: number
  __count?: number
  display_name?: string
  parent_id?: [number, string] | false
}

export interface SearchFilter {
  name: string
  string: string
  domain: unknown[]
  help?: string
  context?: string
}

export interface SearchGroupBy {
  name: string
  string: string
  fieldName: string
  interval?: string
}

export interface ReadGroupResult {
  __domain: unknown[]
  __context: unknown
  [key: string]: unknown // grouped field values + _count suffixed fields
}

export interface ParsedPivotView {
  type: 'pivot'
  string: string
  jsClass?: string
  disableLinking?: boolean
  defaultOrder?: string
  rowFields: PivotField[]
  colFields: PivotField[]
  measures: PivotMeasure[]
}

export interface PivotField {
  name: string
  string?: string
  interval?: string // day, week, month, quarter, year
}

export interface PivotMeasure {
  name: string
  string?: string
  operator?: string // sum, avg, count
}

export interface GraphField {
  name: string
  string?: string
  interval?: string
}

export interface GraphMeasure {
  name: string
  string?: string
  operator?: string
}

export interface ParsedGraphView {
  type: 'graph'
  string: string
  jsClass?: string
  graphType: 'bar' | 'line' | 'pie' | 'area'
  rowFields: GraphField[]
  colFields: GraphField[]
  measures: GraphMeasure[]
  stacked?: boolean
  orderBy?: string
}

export interface ParsedCalendarView {
  type: 'calendar'
  string: string
  jsClass?: string
  dateStart: string
  dateStop?: string
  dateDelay?: string
  allDay?: string
  colorField?: string
  mode: 'day' | 'week' | 'month'
  fields: string[]
  fieldAttrs: Record<string, { invisible?: string; avatarField?: string; options?: Record<string, unknown> }>
  avatarField?: string
  eventLimit?: number
  quickCreate?: boolean
  hideTime?: boolean
  eventOpenPopup?: boolean
  quickCreateViewId?: number
  multiEdit?: boolean
}

export interface ToolbarAction {
  id: number
  name: string
  type?: string
  binding_view_types?: string
  domain?: string
  sequence?: number
}

export interface ParsedHierarchyView {
  type: 'hierarchy'
  string: string
  jsClass?: string
  childField: string
  fields: string[]
  draggable?: boolean
  template?: string
}

export interface ViewToolbar {
  print: ToolbarAction[]
  action: ToolbarAction[]
}

export interface IrFilterRecord {
  id: number
  name: string
  user_id: [number, string] | false
  domain: string
  context: Record<string, unknown>
  sort: string
  is_default: boolean
}
