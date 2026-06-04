export const PRODUCT_TEMPLATE_MODEL = 'product.template'
export const PRODUCT_PRODUCT_MODEL = 'product.product'

export const PRODUCT_ACTION_XML_ID = {
  products: 'product.product_template_action_all',
} as const

export function productRecordPath(id: number): string {
  return `/product/product/${id}`
}
