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
  // CRM
  {
    fragment: 'crm_team_action_pipeline',
    to: '/crm/teams',
    recordPrefix: '/crm/team',
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
  // Accounting
  {
    fragment: 'menu_action_move_out_invoice_type',
    to: '/accounting/moves',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'menu_action_move_in_invoice_type',
    to: '/accounting/moves',
    recordPrefix: '/accounting/move',
  },
  {
    fragment: 'menu_action_account_moves',
    to: '/accounting/moves',
    recordPrefix: '/accounting/move',
  },
  // Contacts
  {
    fragment: 'res_partner_menu_contacts',
    to: '/contacts/partners',
    recordPrefix: '/contacts/partner',
  },
  // Purchase
  {
    fragment: 'menu_purchase_rfq',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'menu_purchase_form_action',
    to: '/purchase/orders',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'menu_procurement_management',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  {
    fragment: 'menu_purchase_root',
    to: '/purchase/rfqs',
    recordPrefix: '/purchase/order',
  },
  // Project
  {
    fragment: 'open_view_project_all',
    to: '/project/projects',
    recordPrefix: '/project/project',
  },
  {
    fragment: 'action_view_all_task',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'action_view_my_task',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'project_task_action_sub_task',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'menu_project_management_all_tasks',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'menu_project_management_my_tasks',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'menu_project_management',
    to: '/project/tasks',
    recordPrefix: '/project/task',
  },
  {
    fragment: 'menu_main_pm',
    to: '/project/tasks',
    recordPrefix: '/project/task',
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
