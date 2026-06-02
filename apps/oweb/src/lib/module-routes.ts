/**
 * Canonical dedicated frontend routes per Odoo technical model.
 *
 * Used by menu-navigation after xmlid disambiguation rules.
 * Same model may still map to different list paths via XMLID_ROUTE_RULES (e.g. crm.lead → /crm/leads).
 */

export interface ModuleRouteSpec {
  listPath: string
  recordPrefix: string
}

export const MODEL_MODULE_ROUTES: Readonly<Record<string, ModuleRouteSpec>> = {
  'hr.employee': { listPath: '/hr/employees', recordPrefix: '/hr/employee' },
  'hr.employee.public': { listPath: '/hr/directory', recordPrefix: '/hr/employee' },
  'hr.department': { listPath: '/hr/departments', recordPrefix: '/hr/department' },
  'crm.lead': { listPath: '/crm/pipeline', recordPrefix: '/crm/lead' },
  'crm.team': { listPath: '/crm/teams', recordPrefix: '/crm/team' },
  'sale.order': { listPath: '/sale/orders', recordPrefix: '/sale/order' },
  'stock.picking': { listPath: '/inventory/pickings', recordPrefix: '/inventory/picking' },
  'account.move': { listPath: '/accounting/moves', recordPrefix: '/accounting/move' },
  'purchase.order': { listPath: '/purchase/orders', recordPrefix: '/purchase/order' },
  'project.project': { listPath: '/project/projects', recordPrefix: '/project/project' },
  'project.task': { listPath: '/project/tasks', recordPrefix: '/project/task' },
  'res.partner': { listPath: '/contacts/partners', recordPrefix: '/contacts/partner' },
}

/** Odoo 19 `actionPath` slug per module prefix (when actionPath is not a technical model name). */
export const MODULE_ACTION_PATH_ROUTES: Readonly<Record<string, Readonly<Record<string, string>>>> =
  {
    hr: {
      employees: '/hr/employees',
      departments: '/hr/departments',
    },
    crm: {
      crm: '/crm/pipeline',
    },
    sale: {
      orders: '/sale/orders',
      sales: '/sale/orders',
    },
    stock: {
      inventory: '/inventory/pickings',
    },
    purchase: {
      orders: '/purchase/orders',
      rfqs: '/purchase/rfqs',
    },
    project: {
      projects: '/project/projects',
      tasks: '/project/tasks',
    },
    contacts: {
      contacts: '/contacts/partners',
    },
  }

export function listPathForModel(model: string | undefined | false): string | undefined {
  if (!model || typeof model !== 'string') return undefined
  return MODEL_MODULE_ROUTES[model]?.listPath
}

export const RECORD_PREFIX_BY_LIST_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  Object.values(MODEL_MODULE_ROUTES).map((s) => [s.listPath, s.recordPrefix]),
)

export function recordPrefixForListPath(listPath: string): string | undefined {
  return RECORD_PREFIX_BY_LIST_PATH[listPath]
}

/** `actionPath` values that are technical model names (Odoo 19 menus / tests). */
export function technicalModelFromActionPath(
  actionPath: string | false | undefined,
): string | undefined {
  if (!actionPath || typeof actionPath !== 'string') return undefined
  if (actionPath.includes('.')) return actionPath
  return undefined
}

export function moduleRouteFromModel(model: string): ModuleRouteSpec | undefined {
  return MODEL_MODULE_ROUTES[model]
}

export function modulePrefixFromXmlid(xmlid?: string): string | undefined {
  if (!xmlid) return undefined
  const head = xmlid.split('.')[0]
  return head || undefined
}
