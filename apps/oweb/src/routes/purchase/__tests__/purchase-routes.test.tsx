import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'
import { purchaseOrderRecordPath, resolvePurchaseRecordPath } from '../../../lib/purchase'

describe('purchase routes', () => {
  test('Purchase Orders menu xmlid → /purchase/orders', () => {
    const target = resolveMenuRoute({
      xmlid: 'purchase.menu_purchase_form_action',
      actionID: 200,
      resModel: 'purchase.order',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/purchase/orders' })
  })

  test('RFQ menu xmlid → /purchase/rfqs', () => {
    const target = resolveMenuRoute({
      xmlid: 'purchase.menu_purchase_rfq',
      actionID: 199,
      resModel: 'purchase.order',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/purchase/rfqs' })
  })

  test('Purchase root menu maps to /purchase/rfqs', () => {
    const target = resolveMenuRoute({
      xmlid: 'purchase.menu_purchase_root',
      actionID: 0,
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/purchase/rfqs' })
  })

  test('Purchase by resModel → /purchase/orders', () => {
    const target = resolveMenuRoute({
      resModel: 'purchase.order',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/purchase/orders' })
  })

  test('Purchase by actionPath slug → /purchase/orders', () => {
    const target = resolveMenuRoute({
      xmlid: 'purchase.menu_purchase_form_action',
      actionPath: 'orders',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/purchase/orders' })
  })
})

describe('purchase helpers', () => {
  test('purchaseOrderRecordPath returns correct path', () => {
    expect(purchaseOrderRecordPath(42)).toBe('/purchase/order/42')
  })

  test('resolvePurchaseRecordPath returns path for purchase.order', () => {
    expect(resolvePurchaseRecordPath('purchase.order', 99)).toBe('/purchase/order/99')
  })

  test('resolvePurchaseRecordPath returns undefined for unknown model', () => {
    expect(resolvePurchaseRecordPath('sale.order', 1)).toBeUndefined()
  })
})
