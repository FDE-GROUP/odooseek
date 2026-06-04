import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'
import { MRP_ACTION_XML_ID, mrpProductionRecordPath } from '../../../lib/mrp'

describe('mrp routes — menu navigation', () => {
  test('MRP main menu → /mrp/productions', () => {
    const target = resolveMenuRoute({
      xmlid: 'mrp.menu_mrp_root',
      resModel: 'mrp.production',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/mrp/productions' })
  })

  test('mrp.production by resModel → /mrp/productions', () => {
    const target = resolveMenuRoute({ resModel: 'mrp.production' })
    expect(target).toMatchObject({ kind: 'module', to: '/mrp/productions' })
  })

  test('mrp.bom by resModel → /mrp/boms', () => {
    expect(resolveMenuRoute({ resModel: 'mrp.bom' })).toMatchObject({
      kind: 'module',
      to: '/mrp/boms',
    })
  })

  test('mrp.workorder by resModel → /mrp/work-orders', () => {
    expect(resolveMenuRoute({ resModel: 'mrp.workorder' })).toMatchObject({
      kind: 'module',
      to: '/mrp/work-orders',
    })
  })

  test('mrp.workcenter by resModel → /mrp/work-centers', () => {
    expect(resolveMenuRoute({ resModel: 'mrp.workcenter' })).toMatchObject({
      kind: 'module',
      to: '/mrp/work-centers',
    })
  })

  test('mrp.routing.workcenter by resModel → /mrp/routings', () => {
    expect(resolveMenuRoute({ resModel: 'mrp.routing.workcenter' })).toMatchObject({
      kind: 'module',
      to: '/mrp/routings',
    })
  })

  test('mrp.unbuild by resModel → /mrp/unbuilds', () => {
    expect(resolveMenuRoute({ resModel: 'mrp.unbuild' })).toMatchObject({
      kind: 'module',
      to: '/mrp/unbuilds',
    })
  })
})

describe('mrp helpers', () => {
  test('mrpProductionRecordPath returns correct path', () => {
    expect(mrpProductionRecordPath(42)).toBe('/mrp/production/42')
  })
})

describe('mrp action xml ids', () => {
  test('productions action', () => {
    expect(MRP_ACTION_XML_ID.productions).toBe('mrp.mrp_production_action')
  })

  test('boms action', () => {
    expect(MRP_ACTION_XML_ID.boms).toBe('mrp.mrp_bom_form_action')
  })

  test('work orders action', () => {
    expect(MRP_ACTION_XML_ID.workOrders).toBe('mrp.mrp_workorder_todo')
  })

  test('work centers action', () => {
    expect(MRP_ACTION_XML_ID.workCenters).toBe('mrp.mrp_workcenter_action')
  })

  test('routings action', () => {
    expect(MRP_ACTION_XML_ID.routings).toBe('mrp.mrp_routing_action')
  })

  test('unbuilds action', () => {
    expect(MRP_ACTION_XML_ID.unbuilds).toBe('mrp.mrp_unbuild')
  })
})
