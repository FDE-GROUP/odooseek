/** Purchase module constants and route helpers. */

export const PURCHASE_ORDER_MODEL = 'purchase.order'
export const PURCHASE_ORDER_LINE_MODEL = 'purchase.order.line'
export const PURCHASE_BILL_UNION_MODEL = 'purchase.bill.union'

/** Odoo xml ids for purchase menu actions. */
export const PURCHASE_ACTION_XML_ID = {
  rfqs: 'purchase.purchase_rfq',
  orders: 'purchase.purchase_form_action',
} as const

export const PURCHASE_RFQ_STATES = ['draft', 'sent', 'to approve']
export const PURCHASE_RFQ_DOMAIN = [['state', 'in', PURCHASE_RFQ_STATES]]
export const PURCHASE_PO_DOMAIN = [['state', '=', 'purchase']]

export function purchaseOrderRecordPath(id: number): string {
  return `/purchase/order/${id}`
}

export function resolvePurchaseRecordPath(model: string, id: number): string | undefined {
  if (model === PURCHASE_ORDER_MODEL) return purchaseOrderRecordPath(id)
  return undefined
}
