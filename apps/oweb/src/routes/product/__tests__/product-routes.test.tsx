import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'
import { PRODUCT_ACTION_XML_ID, productRecordPath } from '../../../lib/product'

describe('product routes — menu navigation', () => {
  test('product.template by resModel → /product/products', () => {
    const target = resolveMenuRoute({
      resModel: 'product.template',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/product/products' })
  })

  test('product.product by resModel → /product/products', () => {
    const target = resolveMenuRoute({
      resModel: 'product.product',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/product/products' })
  })
})

describe('product helpers', () => {
  test('productRecordPath returns correct path', () => {
    expect(productRecordPath(42)).toBe('/product/product/42')
  })
})

describe('product action xml ids', () => {
  test('products action', () => {
    expect(PRODUCT_ACTION_XML_ID.products).toBe('product.product_template_action_all')
  })
})
