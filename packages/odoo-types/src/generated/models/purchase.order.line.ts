// Auto-generated from purchase.order.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** purchase.order.line */
export interface PurchaseOrderLineRecord extends BaseRecord {
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Amount */
  amount_to_invoice_at_date: number | false
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic Precision */
  analytic_precision: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Confirmation Date */
  date_approve: string | false
  /** Order Date — Depicts the date within which the Quotation should be confirmed and converted into a purchase order. */
  date_order: string | false
  /** Expected Arrival — Delivery date expected from vendor. This date respectively defaults to vendor pricelist lead time then today\'s date. */
  date_planned: string | false
  /** Discount (%) */
  discount: number | false
  /** Display Type — Technical field for UX purpose. */
  display_type: 'line_section' | 'line_subsection' | 'line_note' | false
  /** Distribution Analytic Account */
  distribution_analytic_account_ids: number[] /* account.analytic.account */ | false
  /** Forecasted Issue */
  forecasted_issue: boolean
  /** Bill Lines */
  invoice_lines: number[] /* account.move.line */
  /** Is Downpayment */
  is_downpayment: boolean
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Location from procurement */
  location_final_id: [number, string] /* stock.location */ | false
  /** Downstream moves alt */
  move_dest_ids: number[] /* stock.move */ | false
  /** Reservation */
  move_ids: number[] /* stock.move */
  /** Description */
  name: string
  /** Order Reference */
  order_id: [number, string] /* purchase.order */
  /** Orderpoint */
  orderpoint_id: [number, string] /* stock.warehouse.orderpoint */ | false
  /** Parent Section Line */
  parent_id: [number, string] /* purchase.order.line */ | false
  /** Partner — You can find a vendor by its Name, TIN, Email or Internal Reference. */
  partner_id: [number, string] /* res.partner */ | false
  /** Subtotal */
  price_subtotal: number | false
  /** Tax */
  price_tax: number | false
  /** Total */
  price_total: number | false
  /** Unit Price */
  price_unit: number
  /** Unit Price (Discounted) */
  price_unit_discounted: number | false
  /** Unit Price Product UoM — The Price of one unit of the product\'s Unit of Measure */
  price_unit_product_uom: number | false
  /** Custom Description */
  product_description_variants: string | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Product attribute values that do not create variants */
  product_no_variant_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Quantity */
  product_qty: number
  /** Attribute Values */
  product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Product Type — Goods are tangible materials and merchandise you provide.
A service is a non-material product you provide. */
  product_type: 'consu' | 'service' | 'combo' | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Total Quantity */
  product_uom_qty: number | false
  /** Propagate cancellation */
  propagate_cancel: boolean
  /** Purchase Line Warn Msg */
  purchase_line_warn_msg: string | false
  /** Billed Qty */
  qty_invoiced: number | false
  /** Billed */
  qty_invoiced_at_date: number | false
  /** Received Qty */
  qty_received: number | false
  /** Received */
  qty_received_at_date: number | false
  /** Manual Received Qty */
  qty_received_manual: number | false
  /** Received Qty Method — According to product configuration, the received quantity can be automatically computed by mechanism:
  - Manual: the quantity is set manually on the line
  - Stock Moves: the quantity comes from confirmed pickings
 */
  qty_received_method: 'manual' | 'stock_moves' | false
  /** To Invoice Quantity */
  qty_to_invoice: number | false
  /** Origin Sale Item */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Sale Order */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Selected Seller — Technical field to get the vendor pricelist used to generate this line */
  selected_seller_id: [number, string] /* product.supplierinfo */ | false
  /** Sequence */
  sequence: number | false
  /** Status */
  state: 'draft' | 'sent' | 'to approve' | 'purchase' | 'cancel' | false
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Technical Price Unit — Technical field for price computation */
  technical_price_unit: number | false
  /** Translated Product Name */
  translated_product_name: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for purchase.order.line */
export type PurchaseOrderLineFieldName = ModelFieldName<PurchaseOrderLineRecord>

/** Typed search_read result */
export type PurchaseOrderLineSearchResult = ModelRecord<PurchaseOrderLineRecord>
