// Auto-generated from purchase.order.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** purchase.order.line */
export interface PurchaseOrderLineRecord extends BaseRecord {
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic Precision */
  analytic_precision: number | false
  /** Distribution Analytic Account */
  distribution_analytic_account_ids: number[] /* account.analytic.account */ | false
  /** Description */
  name: string
  /** Translated Product Name */
  translated_product_name: string | false
  /** Sequence */
  sequence: number | false
  /** Quantity */
  product_qty: number
  /** Total Quantity */
  product_uom_qty: number | false
  /** Expected Arrival — Delivery date expected from vendor. This date respectively defaults to vendor pricelist lead time then today\'s date. */
  date_planned: string | false
  /** Discount (%) */
  discount: number | false
  /** Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Product Type — Goods are tangible materials and merchandise you provide.
A service is a non-material product you provide. */
  product_type: 'consu' | 'service' | 'combo' | false
  /** Unit Price */
  price_unit: number
  /** Unit Price Product UoM — The Price of one unit of the product\'s Unit of Measure */
  price_unit_product_uom: number | false
  /** Unit Price (Discounted) */
  price_unit_discounted: number | false
  /** Subtotal */
  price_subtotal: number | false
  /** Total */
  price_total: number | false
  /** Tax */
  price_tax: number | false
  /** Order Reference */
  order_id: [number, string] /* purchase.order */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Status */
  state: 'draft' | 'sent' | 'to approve' | 'purchase' | 'cancel' | false
  /** Bill Lines */
  invoice_lines: number[] /* account.move.line */
  /** Billed Qty */
  qty_invoiced: number | false
  /** Received Qty Method — According to product configuration, the received quantity can be automatically computed by mechanism:
  - Manual: the quantity is set manually on the line
  - Stock Moves: the quantity comes from confirmed pickings
 */
  qty_received_method: 'manual' | 'stock_moves' | false
  /** Received Qty */
  qty_received: number | false
  /** Manual Received Qty */
  qty_received_manual: number | false
  /** To Invoice Quantity */
  qty_to_invoice: number | false
  /** Received */
  qty_received_at_date: number | false
  /** Billed */
  qty_invoiced_at_date: number | false
  /** Amount */
  amount_to_invoice_at_date: number | false
  /** Partner — You can find a vendor by its Name, TIN, Email or Internal Reference. */
  partner_id: [number, string] /* res.partner */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Order Date — Depicts the date within which the Quotation should be confirmed and converted into a purchase order. */
  date_order: string | false
  /** Confirmation Date */
  date_approve: string | false
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Display Type — Technical field for UX purpose. */
  display_type: 'line_section' | 'line_subsection' | 'line_note' | false
  /** Is Downpayment */
  is_downpayment: boolean
  /** Selected Seller — Technical field to get the vendor pricelist used to generate this line */
  selected_seller_id: [number, string] /* product.supplierinfo */ | false
  /** Attribute Values */
  product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Product attribute values that do not create variants */
  product_no_variant_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Purchase Line Warn Msg */
  purchase_line_warn_msg: string | false
  /** Parent Section Line */
  parent_id: [number, string] /* purchase.order.line */ | false
  /** Technical Price Unit — Technical field for price computation */
  technical_price_unit: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Reservation */
  move_ids: number[] /* stock.move */
  /** Orderpoint */
  orderpoint_id: [number, string] /* stock.warehouse.orderpoint */ | false
  /** Downstream moves alt */
  move_dest_ids: number[] /* stock.move */ | false
  /** Custom Description */
  product_description_variants: string | false
  /** Propagate cancellation */
  propagate_cancel: boolean
  /** Forecasted Issue */
  forecasted_issue: boolean
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Location from procurement */
  location_final_id: [number, string] /* stock.location */ | false
  /** Sale Order */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Origin Sale Item */
  sale_line_id: [number, string] /* sale.order.line */ | false
}

/** Field names for purchase.order.line */
export type PurchaseOrderLineFieldName = ModelFieldName<PurchaseOrderLineRecord>

/** Typed search_read result */
export type PurchaseOrderLineSearchResult = ModelRecord<PurchaseOrderLineRecord>
