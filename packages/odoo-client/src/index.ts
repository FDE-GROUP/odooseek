// @odooseek/odoo-client — Framework-agnostic Odoo 19 CE JSON-RPC client

export { callKw, searchRead, read, getViews, readGroup, nameSearch, fieldsGet, callButton, loadAction, resolveAction } from './api'
export type { OdooAction } from './api'

export {
  parseListXml,
  parseFormXml,
  parseKanbanXml,
  parseKanbanFields,
  parseKanbanTemplate,
  parseActivityXml,
  parseSearchXml,
  parsePivotXml,
  parseGraphXml,
  parseCalendarXml,
  parseSearchPanel,
} from './xml-parser'

export { evalCondition, getValue, evalModifier, getDecorationClass, parseDomainString } from './expression-evaluator'

export { fetchMenus, getApps, getMenu, getMenuAsTree, getAppSections, flattenMenuItems, searchMenus } from './menu-service'
export type { OdooMenuEntry, MenusData, MenuTreeNode } from './menu-service'

export { formatFloatTime, parseFloatTime, formatPercentage, parsePercentage, formatRemainingDays } from './field-formatters'

export { cacheKey, getCachedViews, setCachedViews, getColumnPrefs, setColumnPrefs } from './view-cache'

export {
  normalizeViewMode,
  parseActionViewModes,
  orderedViewTypesFromActWindow,
  defaultViewTypeFromActWindow,
} from './view-mode'

export {
  renderCell,
  isListCellImage,
  FIELD_TYPE_WIDTHS,
  DEFAULT_COL_WIDTH,
  type ListCellImage,
  type ListCellDisplay,
} from './list-formatters'

export { readModel, searchReadModel, readSingleModel, writeModel, createModel, unlinkModel, defaultGetModel } from './typed-api'
export type { RpcContext } from './typed-api'

export { isFieldValueEmpty, validateFieldValue, validateModelData, ALWAYS_NON_EMPTY_TYPES } from './validation'
export type { ValidationError } from './validation'

export { generateReport, generateReportByXmlId } from './report'

export type {
  ViewType, OdooFieldMeta, ViewField,
  ParsedListView, ParsedFormView, ParsedKanbanView, ParsedActivityView, ParsedSearchView, ParsedPivotView, ParsedGraphView, ParsedCalendarView,
  OdooActivityData, OdooActivityTypeInfo, OdooActivityGroupCell,
  FormElement, FieldElement, ButtonElement, HeaderElement, GroupElement, NotebookElement,
  KanbanTemplateNode, SearchFilter, SearchGroupBy, PivotField, PivotMeasure, GraphField, GraphMeasure, ListColumn,
  ToolbarAction, ViewToolbar, IrFilterRecord, SearchPanelField, SearchPanelCategory, ParsedSearchPanel,
  ReadGroupResult, O2mCommand, O2mSubView, O2mFormSubView, KanbanProgressbar,
  ControlButton, ButtonBoxElement, StatButtonElement, StatButtonContent,
  SeparatorElement, NewlineElement, LabelElement, SheetElement, TitleBlockElement,
  LayoutRowElement, LayoutColumnElement,
  ListButtonElement, ListButtonGroup,
} from './types'
