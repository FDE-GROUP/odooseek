/**
 * Canonical dedicated frontend routes per Odoo technical model.
 *
 * Used by menu-navigation after xmlid disambiguation rules.
 * Same model may still map to different list paths via XMLID_ROUTE_RULES (e.g. crm.lead → /crm/leads).
 */

export interface ModuleRouteSpec {
  listPath: string
  recordPrefix?: string
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
  'event.event': { listPath: '/event/events', recordPrefix: '/event/event' },
  'event.registration': { listPath: '/event/registrations', recordPrefix: '/event/registration' },
  'event.event.ticket': { listPath: '/event/tickets' },
  'event.type': { listPath: '/event/types' },
  'event.stage': { listPath: '/event/stages' },
  'event.question': { listPath: '/event/questions' },
  'calendar.event': { listPath: '/calendar/events', recordPrefix: '/calendar/event' },
  'calendar.event.type': { listPath: '/calendar/types' },
  'calendar.alarm': { listPath: '/calendar/alarms' },
  'calendar.attendee': { listPath: '/calendar/events' },
  'product.template': { listPath: '/product/products', recordPrefix: '/product/product' },
  'product.product': { listPath: '/product/products', recordPrefix: '/product/product' },
  'product.category': { listPath: '/product/categories', recordPrefix: '/product/category' },
  'delivery.carrier': { listPath: '/inventory/carriers', recordPrefix: '/inventory/carrier' },
  'mrp.production': { listPath: '/mrp/productions', recordPrefix: '/mrp/production' },
  'mrp.bom': { listPath: '/mrp/boms', recordPrefix: '/mrp/bom' },
  'mrp.workorder': { listPath: '/mrp/work-orders', recordPrefix: '/mrp/work-order' },
  'mrp.workcenter': { listPath: '/mrp/work-centers', recordPrefix: '/mrp/work-center' },
  'mrp.routing.workcenter': { listPath: '/mrp/routings', recordPrefix: '/mrp/routing' },
  'mrp.unbuild': { listPath: '/mrp/unbuilds', recordPrefix: '/mrp/unbuild' },
  'hr.expense': { listPath: '/expenses/my', recordPrefix: '/expenses/expense' },
  'hr.applicant': { listPath: '/recruitment/applicants', recordPrefix: '/recruitment/applicant' },
  'hr.recruitment.stage': { listPath: '/recruitment/stages' },
  'hr.attendance': { listPath: '/attendance/kiosk', recordPrefix: '/attendance' },
  'stock.lot': { listPath: '/inventory/lots', recordPrefix: '/inventory/lot' },
  'stock.scrap': { listPath: '/inventory/scrap', recordPrefix: '/inventory/scrap' },
  'stock.move': { listPath: '/inventory/moves', recordPrefix: '/inventory/move' },
  'stock.warehouse.orderpoint': {
    listPath: '/inventory/orderpoints',
    recordPrefix: '/inventory/orderpoint',
  },
  'stock.picking.type': {
    listPath: '/inventory/overview',
    recordPrefix: '/inventory/picking-type',
  },
  'stock.quant': {
    listPath: '/inventory/quants',
    recordPrefix: '/inventory/quant',
  },
  'stock.move.line': {
    listPath: '/inventory/move-lines',
    recordPrefix: '/inventory/move-line',
  },
  'stock.warehouse': {
    listPath: '/inventory/warehouse',
    recordPrefix: '/inventory/warehouse',
  },
  'stock.location': {
    listPath: '/inventory/locations',
    recordPrefix: '/inventory/location',
  },
  'stock.package': {
    listPath: '/inventory/packages',
    recordPrefix: '/inventory/package',
  },
  'stock.route': {
    listPath: '/inventory/routes',
  },
  'stock.rule': {
    listPath: '/inventory/rules',
  },
  'account.move.line': {
    listPath: '/accounting/journal-items',
    recordPrefix: '/accounting/journal-item',
  },
  'account.payment': {
    listPath: '/accounting/payments',
    recordPrefix: '/accounting/payment',
  },
  'account.journal': {
    listPath: '/accounting/dashboard',
    recordPrefix: '/accounting/journal',
  },
  'account.account': {
    listPath: '/accounting/chart-of-accounts',
    recordPrefix: '/accounting/account',
  },
  'account.tax': {
    listPath: '/accounting/taxes',
    recordPrefix: '/accounting/tax',
  },
  'account.bank.statement': {
    listPath: '/accounting/bank-statements',
    recordPrefix: '/accounting/bank-statement',
  },
  'account.reconcile.model': {
    listPath: '/accounting/reconciliation-models',
    recordPrefix: '/accounting/reconciliation-model',
  },
  'account.payment.term': {
    listPath: '/accounting/payment-terms',
    recordPrefix: '/accounting/payment-term',
  },
  'account.fiscal.position': {
    listPath: '/accounting/fiscal-positions',
    recordPrefix: '/accounting/fiscal-position',
  },
  'account.cash.rounding': {
    listPath: '/accounting/cash-rounding',
  },
  'account.incoterms': {
    listPath: '/accounting/incoterms',
  },
  'account.analytic.account': {
    listPath: '/accounting/analytic-accounts',
    recordPrefix: '/accounting/analytic-account',
  },
  'account.analytic.line': {
    listPath: '/accounting/analytic-lines',
    recordPrefix: '/accounting/analytic-line',
  },
  'account.analytic.plan': {
    listPath: '/accounting/analytic-plans',
    recordPrefix: '/accounting/analytic-plan',
  },
  'account.tax.group': {
    listPath: '/accounting/tax-groups',
    recordPrefix: '/accounting/tax-group',
  },
  'sale.report': {
    listPath: '/sale/reporting',
    recordPrefix: '/sale/report',
  },
  'crm.stage': {
    listPath: '/crm/stages',
  },
  'crm.lost.reason': {
    listPath: '/crm/lost-reasons',
  },
  'project.project.stage': {
    listPath: '/project/stages',
  },
  'project.task.type': {
    listPath: '/project/task-stages',
  },
  'project.milestone': {
    listPath: '/project/milestones',
    recordPrefix: '/project/milestone',
  },
  'fleet.vehicle': { listPath: '/fleet/vehicles', recordPrefix: '/fleet/vehicle' },
  'maintenance.request': {
    listPath: '/maintenance/requests',
    recordPrefix: '/maintenance/request',
  },
  'maintenance.equipment': {
    listPath: '/maintenance/equipment',
    recordPrefix: '/maintenance/equipment',
  },
  'hr.leave': { listPath: '/holidays/leaves', recordPrefix: '/holidays/leave' },
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
    event: {
      events: '/event/events',
    },
    calendar: {
      calendar: '/calendar/events',
    },
    product: {
      products: '/product/products',
    },
    mrp: {
      productions: '/mrp/productions',
    },
    hr_attendance: {
      attendance: '/attendance/kiosk',
    },
    fleet: {
      vehicles: '/fleet/vehicles',
    },
    maintenance: {
      requests: '/maintenance/requests',
      equipment: '/maintenance/equipment',
    },
    hr_holidays: {
      leaves: '/holidays/leaves',
    },
  }

export function listPathForModel(model: string | undefined | false): string | undefined {
  if (!model || typeof model !== 'string') return undefined
  return MODEL_MODULE_ROUTES[model]?.listPath
}

export const RECORD_PREFIX_BY_LIST_PATH: Readonly<Record<string, string | undefined>> =
  Object.fromEntries(Object.values(MODEL_MODULE_ROUTES).map((s) => [s.listPath, s.recordPrefix]))

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
