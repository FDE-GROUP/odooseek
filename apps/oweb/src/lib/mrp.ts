export const MRP_PRODUCTION_MODEL = 'mrp.production'

export const MRP_ACTION_XML_ID = {
  productions: 'mrp.mrp_production_action',
  boms: 'mrp.mrp_bom_form_action',
  workOrders: 'mrp.mrp_workorder_todo',
  workCenters: 'mrp.mrp_workcenter_action',
  routings: 'mrp.mrp_routing_action',
  unbuilds: 'mrp.mrp_unbuild',
} as const

export function mrpProductionRecordPath(id: number): string {
  return `/mrp/production/${id}`
}
