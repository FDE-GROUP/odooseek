import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('sale routes — menu navigation', () => {
  test('sale.order → /sale/orders', () => {
    expect(resolveMenuRoute({ resModel: 'sale.order' })).toMatchObject({
      kind: 'module',
      to: '/sale/orders',
    })
  })

  test('quotations → /sale/quotations', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'sale.action_quotations_with_onboarding',
        resModel: 'sale.order',
      }),
    ).toMatchObject({ kind: 'module', to: '/sale/quotations' })
  })

  test('to invoice → /sale/to-invoice', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'sale.menu_sale_order_invoice',
        resModel: 'sale.order',
      }),
    ).toMatchObject({ kind: 'module', to: '/sale/to-invoice' })
  })

  test('to upsell → /sale/to-upsell', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'sale.action_orders_upselling',
        resModel: 'sale.order',
      }),
    ).toMatchObject({ kind: 'module', to: '/sale/to-upsell' })
  })

  test('reporting → /sale/reporting', () => {
    expect(resolveMenuRoute({ resModel: 'sale.report' })).toMatchObject({
      kind: 'module',
      to: '/sale/reporting',
    })
  })
})
