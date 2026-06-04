/**
 * Unified menu → route resolution for all OdooSeek modules.
 *
 * Priority (menu display name is never used):
 * 1. xmlid fragment rules (disambiguation when one model → multiple routes)
 * 2. BFF `resModel` or actionPath as technical model name → MODEL_MODULE_ROUTES
 * 3. Odoo 19 `actionPath` slug + module prefix from xmlid
 * 4. actionID index from full menu tree when `menus` is passed
 * 5. Fallback: `/web?action=<actionID>`
 */

import type { MenusData, OdooMenuEntry } from '@odooseek/odoo-client'
import {
  MODEL_MODULE_ROUTES,
  MODULE_ACTION_PATH_ROUTES,
  modulePrefixFromXmlid,
  moduleRouteFromModel,
  RECORD_PREFIX_BY_LIST_PATH,
  technicalModelFromActionPath,
} from './module-routes'

function flattenMenusWithActions(menus: MenusData): OdooMenuEntry[] {
  const result: OdooMenuEntry[] = []
  const visit = (id: number | 'root') => {
    const entry = menus[String(id)]
    if (!entry) return
    if (entry.actionID && entry.id !== 'root') result.push(entry)
    for (const cid of entry.children) visit(cid)
  }
  visit('root')
  return result
}

export interface MenuNavigateEntry {
  name?: string
  xmlid?: string
  actionID?: number | false
  actionPath?: string | false
  /** Enriched by BFF `/api/menus` from `ir.actions.act_window.res_model`. */
  resModel?: string | false
  /** Set when resolving app tiles from HomeMenu. */
  childCount?: number
}

export type MenuRouteTarget =
  | { kind: 'module'; to: string; recordPrefix?: string }
  | { kind: 'web'; action: number }

export type MenuNavigateContext = 'menu-leaf' | 'app-root' | 'command'

/** xmlid fragment → dedicated route (order: longer / more specific fragments first). */
const XMLID_ROUTE_RULES: ReadonlyArray<{ fragment: string; to: string; recordPrefix?: string }> = [
  // HR
  { fragment: 'menu_hr_employee_payroll', to: '/hr/employees', recordPrefix: '/hr/employee' },
  { fragment: 'menu_hr_department_kanban', to: '/hr/departments', recordPrefix: '/hr/department' },
  { fragment: 'menu_hr_department', to: '/hr/departments', recordPrefix: '/hr/department' },
  { fragment: 'menu_hr_employee', to: '/hr/directory', recordPrefix: '/hr/employee' },
  { fragment: 'menu_hr_root', to: '/hr/employees', recordPrefix: '/hr/employee' },
  { fragment: 'menu_hr_main', to: '/hr/employees', recordPrefix: '/hr/employee' },
  { fragment: 'menu_view_hr_job', to: '/hr/jobs' },
  { fragment: 'menu_hr_work_location_tree', to: '/hr/work-locations' },
  { fragment: 'menu_config_plan_plan', to: '/hr/plans' },
  { fragment: 'mail_activity_plan_action', to: '/hr/plans' },
  // Event
  { fragment: 'menu_event_registration_desk', to: '/event/registration-desk' },
  { fragment: 'menu_event_event', to: '/event/events', recordPrefix: '/event/event' },
  { fragment: 'event_main_menu', to: '/event/events', recordPrefix: '/event/event' },
  {
    fragment: 'menu_action_registration',
    to: '/event/registrations',
    recordPrefix: '/event/registration',
  },
  // Calendar
  { fragment: 'mail_menu_calendar', to: '/calendar/events', recordPrefix: '/calendar/event' },
  { fragment: 'menu_calendar_event_type', to: '/calendar/types' },
  { fragment: 'action_calendar_event_type', to: '/calendar/types' },
  { fragment: 'menu_calendar_alarm', to: '/calendar/alarms' },
  { fragment: 'action_calendar_alarm', to: '/calendar/alarms' },
  // Product
  {
    fragment: 'product_template_action',
    to: '/product/products',
    recordPrefix: '/product/product',
  },
  {
    fragment: 'product_normal_action',
    to: '/product/products',
    recordPrefix: '/product/product',
  },
  {
    fragment: 'product_combo_action',
    to: '/product/products',
    recordPrefix: '/product/product',
  },
  {
    fragment: 'product_category_action_form',
    to: '/product/categories',
    recordPrefix: '/product/category',
  },
  {
    fragment: 'attribute_action',
    to: '/product/attributes',
  },
  {
    fragment: 'calendar_settings_action',
    to: '/settings',
  },
  // Sale sub-routes
  {
    fragment: 'menu_purchase_root',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'menu_purchase_rfq',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'res_partner_action_supplier',
    to: '/purchase/vendors',
    recordPrefix: '/contacts/partner',
  },
  {
    fragment: 'purchase_form_action',
    to: '/purchase/orders',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'purchase_rfq',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'purchase_vendors',
    to: '/purchase/vendors',
    recordPrefix: '/contacts/partner',
  },
  {
    fragment: 'purchase_products',
    to: '/purchase/products',
    recordPrefix: '/product/product',
  },
  {
    fragment: 'act_res_partner_2_purchase_order',
    to: '/purchase/orders',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'action_purchase_configuration',
    to: '/purchase/orders',
  },
  {
    fragment: 'action_quotations_with_onboarding',
    to: '/sale/quotations',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'menu_sale_order_invoice',
    to: '/sale/to-invoice',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'action_orders_to_invoice',
    to: '/sale/to-invoice',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'action_orders_upselling',
    to: '/sale/to-upsell',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'menu_sale_order_upselling',
    to: '/sale/to-upsell',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'action_order_report_all',
    to: '/sale/reporting',
  },
  {
    fragment: 'act_res_partner_2_sale_order',
    to: '/sale/orders',
    recordPrefix: '/sale/order',
  },
  {
    fragment: 'action_invoice_salesteams',
    to: '/sale/reporting',
  },
  {
    fragment: 'action_orders_salesteams',
    to: '/sale/orders',
    recordPrefix: '/sale/order',
  },
  // CRM
  {
    fragment: 'crm_team_action_pipeline',
    to: '/crm/teams',
    recordPrefix: '/crm/team',
  },
  {
    fragment: 'crm_lead_action_my_activities',
    to: '/crm/activities',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'crm_lead_action_forecast',
    to: '/crm/forecast',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'crm_stage_action',
    to: '/crm/stages',
  },
  {
    fragment: 'crm_lost_reason_action',
    to: '/crm/lost-reasons',
  },
  {
    fragment: 'action_opportunity_form',
    to: '/crm/leads',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'action_lead_mail_compose',
    to: '/crm/leads',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'action_lead_mass_mail',
    to: '/crm/leads',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'act_crm_opportunity_calendar_event_new',
    to: '/calendar/events',
    recordPrefix: '/calendar/event',
  },
  {
    fragment: 'action_report_crm_lead_salesteam',
    to: '/crm/teams',
  },
  {
    fragment: 'sales_team_crm_team_action_config',
    to: '/crm/teams',
    recordPrefix: '/crm/team',
  },
  {
    fragment: 'menu_crm_opportunities',
    to: '/crm/pipeline',
    recordPrefix: '/crm/lead',
  },
  {
    fragment: 'menu_action_picking_tree',
    to: '/inventory/pickings',
    recordPrefix: '/inventory/picking',
  },
  {
    fragment: 'in_picking',
    to: '/inventory/receipts',
    recordPrefix: '/inventory/picking',
  },
  {
    fragment: 'out_picking',
    to: '/inventory/deliveries',
    recordPrefix: '/inventory/picking',
  },
  {
    fragment: 'int_picking',
    to: '/inventory/internal',
    recordPrefix: '/inventory/picking',
  },
  // Accounting
  {
    fragment: 'menu_action_move_out_invoice_type',
    to: '/accounting/invoices',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'menu_action_move_in_invoice_type',
    to: '/accounting/bills',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'menu_action_account_moves',
    to: '/accounting/moves',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'open_account_journal_dashboard',
    to: '/accounting/dashboard',
  },
  {
    fragment: 'account.menu_board_journal',
    to: '/accounting/dashboard',
  },
  {
    fragment: 'action_account_moves_all',
    to: '/accounting/journal-items',
    recordPrefix: '/accounting/journal-item',
  },
  {
    fragment: 'menu_action_account_payments',
    to: '/accounting/payments',
    recordPrefix: '/accounting/payment',
  },
  {
    fragment: 'action_account_payments',
    to: '/accounting/payments',
    recordPrefix: '/accounting/payment',
  },
  {
    fragment: 'action_move_out_refund_type',
    to: '/accounting/credit-notes',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'action_move_in_refund_type',
    to: '/accounting/vendor-refunds',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'menu_action_account_form',
    to: '/accounting/chart-of-accounts',
    recordPrefix: '/accounting/account',
  },
  {
    fragment: 'action_account_form',
    to: '/accounting/chart-of-accounts',
    recordPrefix: '/accounting/account',
  },
  {
    fragment: 'action_tax_form',
    to: '/accounting/taxes',
    recordPrefix: '/accounting/tax',
  },
  {
    fragment: 'action_bank_statement_tree',
    to: '/accounting/bank-statements',
    recordPrefix: '/accounting/bank-statement',
  },
  {
    fragment: 'action_account_reconcile_model',
    to: '/accounting/reconciliation-models',
  },
  {
    fragment: 'action_payment_term_form',
    to: '/accounting/payment-terms',
  },
  {
    fragment: 'action_account_fiscal_position_form',
    to: '/accounting/fiscal-positions',
  },
  {
    fragment: 'action_account_all_payments',
    to: '/accounting/payments',
    recordPrefix: '/accounting/payment',
  },
  {
    fragment: 'action_account_config',
    to: '/accounting/dashboard',
  },
  {
    fragment: 'action_account_cash_rounding',
    to: '/accounting/cash-rounding',
  },
  {
    fragment: 'action_account_incoterms',
    to: '/accounting/incoterms',
  },
  {
    fragment: 'action_account_analytic_account_form',
    to: '/accounting/analytic-accounts',
    recordPrefix: '/accounting/analytic-account',
  },
  {
    fragment: 'menu_main_pm',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'action_view_my_task',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'act_project_project_2_project_task_all',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'project_project_stage_action',
    to: '/project/stages',
  },
  {
    fragment: 'open_task_type_form',
    to: '/project/task-stages',
  },
  {
    fragment: 'action_view_project_milestone',
    to: '/project/milestones',
    recordPrefix: '/project/milestone',
  },
  {
    fragment: 'open_view_project_all',
    to: '/project/projects',
    recordPrefix: '/project/project',
  },
  // MRP
  {
    fragment: 'mrp.menu_mrp_root',
    to: '/mrp/productions',
    recordPrefix: '/mrp/production',
  },
  {
    fragment: 'mrp_bom_form_action',
    to: '/mrp/boms',
    recordPrefix: '/mrp/bom',
  },
  {
    fragment: 'mrp_workorder_todo',
    to: '/mrp/work-orders',
    recordPrefix: '/mrp/work-order',
  },
  {
    fragment: 'mrp_workcenter_action',
    to: '/mrp/work-centers',
    recordPrefix: '/mrp/work-center',
  },
  {
    fragment: 'mrp_routing_action',
    to: '/mrp/routings',
    recordPrefix: '/mrp/routing',
  },
  {
    fragment: 'mrp_unbuild',
    to: '/mrp/unbuilds',
    recordPrefix: '/mrp/unbuild',
  },
  {
    fragment: 'mrp_production_action',
    to: '/mrp/productions',
    recordPrefix: '/mrp/production',
  },
  {
    fragment: 'action_mrp_production_form',
    to: '/mrp/productions',
    recordPrefix: '/mrp/production',
  },
  {
    fragment: 'action_mrp_workorder',
    to: '/mrp/work-orders',
    recordPrefix: '/mrp/work-order',
  },
  {
    fragment: 'action_mrp_workcenter',
    to: '/mrp/work-centers',
    recordPrefix: '/mrp/work-center',
  },
  {
    fragment: 'action_mrp_routing_form',
    to: '/mrp/routings',
    recordPrefix: '/mrp/routing',
  },
  {
    fragment: 'action_mrp_unbuild',
    to: '/mrp/unbuilds',
    recordPrefix: '/mrp/unbuild',
  },
  {
    fragment: 'mrp_bom_action',
    to: '/mrp/boms',
    recordPrefix: '/mrp/bom',
  },
  {
    fragment: 'action_mrp_configuration',
    to: '/mrp/boms',
  },
  // Expenses
  {
    fragment: 'menu_hr_expense_root',
    to: '/expenses/my',
    recordPrefix: '/expenses/expense',
  },
  {
    fragment: 'action_hr_expense_my_expenses_all',
    to: '/expenses/my',
    recordPrefix: '/expenses/expense',
  },
  {
    fragment: 'action_hr_expense_sheet_all',
    to: '/expenses/sheets',
    recordPrefix: '/expenses/sheet',
  },
  {
    fragment: 'hr_expense_actions_all',
    to: '/expenses/my',
    recordPrefix: '/expenses/expense',
  },
  {
    fragment: 'action_hr_expense_department_filtered',
    to: '/expenses/my',
    recordPrefix: '/expenses/expense',
  },
  {
    fragment: 'action_hr_expense_department_to_approve',
    to: '/expenses/my',
    recordPrefix: '/expenses/expense',
  },
  {
    fragment: 'action_hr_expense_account',
    to: '/accounting/dashboard',
  },
  {
    fragment: 'action_hr_expense_configuration',
    to: '/expenses/configuration',
  },
  // Recruitment
  {
    fragment: 'menu_hr_recruitment_root',
    to: '/recruitment/applicants',
    recordPrefix: '/recruitment/applicant',
  },
  {
    fragment: 'action_hr_job_applications',
    to: '/recruitment/applicants',
    recordPrefix: '/recruitment/applicant',
  },
  {
    fragment: 'action_hr_recruitment_stage',
    to: '/recruitment/stages',
  },
  {
    fragment: 'action_hr_department',
    to: '/hr/departments',
    recordPrefix: '/hr/department',
  },
  {
    fragment: 'action_hr_recruitment_configuration',
    to: '/recruitment/applicants',
  },
  {
    fragment: 'action_hr_talent_pool',
    to: '/recruitment/applicants',
    recordPrefix: '/recruitment/applicant',
  },
  // Attendance
  {
    fragment: 'hr_attendance.menu_hr_attendance_root',
    to: '/attendance/kiosk',
  },
  {
    fragment: 'hr_attendance_management_action',
    to: '/attendance/kiosk',
  },
  {
    fragment: 'hr_attendance_action',
    to: '/attendance/kiosk',
  },
  {
    fragment: 'project_project_stage_action',
    to: '/project/stages',
  },
  {
    fragment: 'open_task_type_form',
    to: '/project/task-stages',
  },
  {
    fragment: 'action_view_project_milestone',
    to: '/project/milestones',
    recordPrefix: '/project/milestone',
  },
]

export { modulePrefixFromXmlid } from './module-routes'

function moduleTarget(listPath: string): MenuRouteTarget {
  return {
    kind: 'module',
    to: listPath,
    recordPrefix: RECORD_PREFIX_BY_LIST_PATH[listPath],
  }
}

export function effectiveResModel(
  entry: Pick<MenuNavigateEntry, 'resModel' | 'actionPath'>,
): string | undefined {
  if (entry.resModel && typeof entry.resModel === 'string') return entry.resModel
  return technicalModelFromActionPath(entry.actionPath)
}

export function resolveByXmlid(xmlid?: string): MenuRouteTarget | undefined {
  if (!xmlid) return undefined
  for (const rule of XMLID_ROUTE_RULES) {
    if (xmlid.includes(rule.fragment)) {
      return { kind: 'module', to: rule.to, recordPrefix: rule.recordPrefix }
    }
  }
  return undefined
}

export function resolveByResModel(resModel?: string | false): MenuRouteTarget | undefined {
  if (!resModel || typeof resModel !== 'string') return undefined
  const spec = moduleRouteFromModel(resModel)
  if (!spec) return undefined
  return { kind: 'module', to: spec.listPath, recordPrefix: spec.recordPrefix }
}

export function resolveByActionPath(
  xmlid?: string,
  actionPath?: string | false,
): MenuRouteTarget | undefined {
  if (!actionPath || typeof actionPath !== 'string') return undefined
  const asModel = technicalModelFromActionPath(actionPath)
  if (asModel) {
    const spec = MODEL_MODULE_ROUTES[asModel]
    if (spec) return moduleTarget(spec.listPath)
    return undefined
  }
  const mod = modulePrefixFromXmlid(xmlid)
  if (!mod) return undefined
  const routes = MODULE_ACTION_PATH_ROUTES[mod]
  const list = routes?.[actionPath]
  if (list) return moduleTarget(list)
  return undefined
}

let cachedActionIndex: Map<number, MenuRouteTarget> | null = null
let cachedActionIndexMenus: MenusData | null = null

function resolveMenuEntryTarget(entry: MenuNavigateEntry): MenuRouteTarget | undefined {
  const byXml = resolveByXmlid(entry.xmlid)
  if (byXml) return byXml

  const model = effectiveResModel(entry)
  const byModel = resolveByResModel(model)
  if (byModel) return byModel

  const byPath = resolveByActionPath(entry.xmlid, entry.actionPath)
  if (byPath) return byPath

  return undefined
}

/** Index actionID → route from full menu tree (never menu title). */
export function buildActionRouteIndex(menus: MenusData): Map<number, MenuRouteTarget> {
  if (cachedActionIndex && cachedActionIndexMenus === menus) {
    return cachedActionIndex
  }
  const index = new Map<number, MenuRouteTarget>()
  for (const menu of flattenMenusWithActions(menus)) {
    if (!menu.actionID) continue
    const id = Number(menu.actionID)
    if (!Number.isFinite(id)) continue
    const entry = menuEntryFromOdoo(menu)
    const target = resolveMenuEntryTarget(entry) ?? ({ kind: 'web', action: id } as const)
    index.set(id, target)
  }
  cachedActionIndex = index
  cachedActionIndexMenus = menus
  return index
}

/** Clear index when menus refetch (call from query onSuccess if needed). */
export function resetActionRouteIndex(): void {
  cachedActionIndex = null
  cachedActionIndexMenus = null
}

export function resolveMenuRoute(
  entry: MenuNavigateEntry,
  menus?: MenusData,
): MenuRouteTarget | undefined {
  const direct = resolveMenuEntryTarget(entry)
  if (direct) return direct

  if (menus && entry.actionID) {
    const idx = buildActionRouteIndex(menus)
    const hit = idx.get(Number(entry.actionID))
    if (hit) return hit
  }

  if (entry.actionID) {
    return { kind: 'web', action: Number(entry.actionID) }
  }

  return undefined
}

export function isMenuEntryActive(
  entry: MenuNavigateEntry,
  pathname: string,
  search: { action?: number },
  menus?: MenusData,
): boolean {
  const target = resolveMenuRoute(entry, menus)
  if (!target) return false
  if (target.kind === 'module') {
    if (pathname === target.to) return true
    if (target.recordPrefix && pathname.startsWith(`${target.recordPrefix}/`)) return true
    // Dual URL: dedicated route and `/web?action=` for the same menu remain equivalent for highlight.
    if (pathname === '/web' && entry.actionID && search.action === Number(entry.actionID)) {
      return true
    }
    return false
  }
  return pathname === '/web' && search.action === target.action
}

type NavigateFn = (opts: { to: string; search?: Record<string, unknown> }) => void

/**
 * Navigate from a menu entry. Returns true if navigation was performed.
 *
 * - `app-root`: apps with child menus use `/web?action=` (Odoo default), not label shortcuts.
 * - `menu-leaf` / `command`: prefer dedicated module routes, else web.
 */
export function navigateMenuEntry(
  navigate: NavigateFn,
  entry: MenuNavigateEntry,
  options?: { context?: MenuNavigateContext; menus?: MenusData },
): boolean {
  const context = options?.context ?? 'menu-leaf'
  const hasChildren = (entry.childCount ?? 0) > 0

  if (context === 'app-root' && hasChildren) {
    if (entry.actionID) {
      navigate({ to: '/web', search: { action: Number(entry.actionID) } })
      return true
    }
    return false
  }

  const target = resolveMenuRoute(entry, options?.menus)
  if (!target) return false

  if (target.kind === 'module') {
    navigate({ to: target.to })
    return true
  }

  navigate({ to: '/web', search: { action: target.action } })
  return true
}

/** @deprecated Use navigateMenuEntry — kept for incremental migration. */
export function navigateHrOrAction(
  navigate: NavigateFn,
  entry: { name?: string; xmlid?: string; actionID?: number | false; actionPath?: string | false },
  menus?: MenusData,
): boolean {
  return navigateMenuEntry(
    navigate,
    {
      xmlid: entry.xmlid,
      actionID: entry.actionID,
      actionPath: entry.actionPath,
      name: entry.name,
    },
    { context: 'menu-leaf', menus },
  )
}

export function menuEntryFromOdoo(
  menu: Pick<OdooMenuEntry, 'name' | 'xmlid' | 'actionID' | 'actionPath' | 'resModel'> & {
    children?: unknown[]
  },
  childCount?: number,
): MenuNavigateEntry {
  return {
    name: menu.name,
    xmlid: menu.xmlid,
    actionID: menu.actionID,
    actionPath: menu.actionPath,
    resModel: menu.resModel,
    childCount: childCount ?? menu.children?.length ?? 0,
  }
}
