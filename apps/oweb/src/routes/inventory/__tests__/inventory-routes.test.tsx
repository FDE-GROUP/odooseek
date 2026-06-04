import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('inventory routes — menu navigation', () => {
  test('stock_root → /inventory/pickings', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.menu_stock_root',
      resModel: 'stock.picking',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/pickings' })
  })

  test('stock.picking → /inventory/pickings', () => {
    const target = resolveMenuRoute({ resModel: 'stock.picking' })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/pickings' })
  })

  test('receipts → /inventory/receipts', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.in_picking',
      resModel: 'stock.picking',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/receipts' })
  })

  test('deliveries → /inventory/deliveries', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.out_picking',
      resModel: 'stock.picking',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/deliveries' })
  })

  test('internal → /inventory/internal', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.int_picking',
      resModel: 'stock.picking',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/internal' })
  })

  test('lots → /inventory/lots', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.menu_action_production_lot_form',
      resModel: 'stock.lot',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/lots' })
  })

  test('scrap → /inventory/scrap', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.menu_stock_scrap',
      resModel: 'stock.scrap',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/scrap' })
  })

  test('moves → /inventory/moves', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.stock_move_menu',
      resModel: 'stock.move',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/moves' })
  })

  test('orderpoints → /inventory/orderpoints', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.menu_reordering_rules_replenish',
      resModel: 'stock.warehouse.orderpoint',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/orderpoints' })
  })

  test('overview → /inventory/overview', () => {
    const target = resolveMenuRoute({
      xmlid: 'stock.stock_picking_type_menu',
      resModel: 'stock.picking.type',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/overview' })
  })

  test('stock.picking.type by resModel → /inventory/overview', () => {
    const target = resolveMenuRoute({ resModel: 'stock.picking.type' })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/overview' })
  })

  test('stock.lot by resModel → /inventory/lots', () => {
    const target = resolveMenuRoute({ resModel: 'stock.lot' })
    expect(target).toMatchObject({ kind: 'module', to: '/inventory/lots' })
  })
})
