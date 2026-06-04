// Auto-generated from sale.order.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** sale.order.line */
export interface SaleOrderLineRecord extends BaseRecord {
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Invoiced Amount */
  amount_invoiced: number | false
  /** Un-invoiced Balance */
  amount_to_invoice: number | false
  /** Amount */
  amount_to_invoice_at_date: number | false
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic lines */
  analytic_line_ids: number[] /* account.analytic.line */
  /** Analytic Precision */
  analytic_precision: number | false
  /** Available Product Documents */
  available_product_document_ids: number[] /* product.document */ | false
  /** Product Category */
  categ_id: [number, string] /* product.category */ | false
  /** Collapse Composition */
  collapse_composition: boolean
  /** Collapse Prices */
  collapse_prices: boolean
  /** Combo Item */
  combo_item_id: [number, string] /* product.combo.item */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  company_price_include: 'tax_included' | 'tax_excluded' | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Lead Time — Number of days between the order confirmation and the shipping of the products to the customer */
  customer_lead: number
  /** Discount (%) */
  discount: number | false
  /** Display Qty Widget */
  display_qty_widget: boolean
  /** Display Type */
  display_type: 'line_section' | 'line_subsection' | 'line_note' | false
  /** Distribution Analytic Account */
  distribution_analytic_account_ids: number[] /* account.analytic.account */ | false
  /** Event — Choose an event and it will automatically create a registration for this event. */
  event_id: [number, string] /* event.event */ | false
  /** Slot — Choose an event slot and it will automatically create a registration for this event slot. */
  event_slot_id: [number, string] /* event.slot */ | false
  /** Ticket Type — Choose an event ticket and it will automatically create a registration for this event ticket. */
  event_ticket_id: [number, string] /* event.event.ticket */ | false
  /** Expenses */
  expense_ids: number[] /* hr.expense */
  /** Extra Tax Data */
  extra_tax_data: unknown | false
  /** Forecast Expected Date */
  forecast_expected_date: string | false
  /** Free Qty Today */
  free_qty_today: number | false
  /** Invoice Lines */
  invoice_lines: number[] /* account.move.line */ | false
  /** Invoice Status */
  invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Is the product configurable? */
  is_configurable_product: boolean
  /** Is a Delivery */
  is_delivery: boolean
  /** Is a down payment — Down payments are made when creating invoices from a sales order. They are not copied when duplicating a sales order. */
  is_downpayment: boolean
  /** Is expense — Is true if the sales order line comes from an expense or a vendor bills */
  is_expense: boolean
  /** Is Mto */
  is_mto: boolean
  /** Is Multi Slots — Allow multiple time slots. The communications, the maximum number of attendees and the maximum number of tickets registrations are defined for each time slot instead of the whole event. */
  is_multi_slots: boolean
  /** Optional Line */
  is_optional: boolean
  /** Is Product Archived */
  is_product_archived: boolean
  /** Is a Service */
  is_service: boolean
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Linked Order Line */
  linked_line_id: [number, string] /* sale.order.line */ | false
  /** Linked Order Lines */
  linked_line_ids: number[] /* sale.order.line */
  /** Linked Virtual */
  linked_virtual_id: string | false
  /** Stock Moves */
  move_ids: number[] /* stock.move */
  /** Description */
  name: string
  /** Name Short */
  name_short: string | false
  /** Order Reference */
  order_id: [number, string] /* sale.order */
  /** Customer */
  order_partner_id: [number, string] /* res.partner */ | false
  /** Parent Section Line */
  parent_id: [number, string] /* sale.order.line */ | false
  /** Price Reduce Tax excl */
  price_reduce_taxexcl: number | false
  /** Price Reduce Tax incl */
  price_reduce_taxinc: number | false
  /** Subtotal */
  price_subtotal: number | false
  /** Total Tax */
  price_tax: number | false
  /** Total */
  price_total: number | false
  /** Unit Price */
  price_unit: number
  /** Pricelist Item */
  pricelist_item_id: [number, string] /* product.pricelist.item */ | false
  /** Custom Values */
  product_custom_attribute_value_ids: number[] /* product.attribute.custom.value */
  /** Product Documents — The product documents for this order line that will be merged in the PDF quote. */
  product_document_ids: number[] /* product.document */ | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Extra Values */
  product_no_variant_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Product Qty */
  product_qty: number | false
  /** Attribute Values */
  product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Product Template */
  product_template_id: [number, string] /* product.template */ | false
  /** Product Type — Goods are tangible materials and merchandise you provide.
A service is a non-material product you provide. */
  product_type: 'consu' | 'service' | 'combo' | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity */
  product_uom_qty: number
  /** Product Uom Readonly */
  product_uom_readonly: boolean
  /** Can Edit Product */
  product_updatable: boolean
  /** Generated Project */
  project_id: [number, string] /* project.project */ | false
  /** Number of generated purchase items */
  purchase_line_count: number | false
  /** Generated Purchase Lines — Purchase line generated by this Sales item on order confirmation, or when the quantity was increased. */
  purchase_line_ids: number[] /* purchase.order.line */
  /** Qty Available Today */
  qty_available_today: number | false
  /** Delivery Quantity */
  qty_delivered: number | false
  /** Delivered */
  qty_delivered_at_date: number | false
  /** Method to update delivered qty — According to product configuration, the delivered quantity can be automatically computed by mechanism:
  - Manual: the quantity is set manually on the line
  - Analytic From expenses: the quantity is the quantity sum from posted expenses
  - Timesheet: the quantity is the sum of hours recorded on tasks linked to this sale line
  - Stock Moves: the quantity comes from confirmed pickings
 */
  qty_delivered_method: 'manual' | 'analytic' | 'stock_move' | 'milestones' | false
  /** Invoiced Quantity */
  qty_invoiced: number | false
  /** Invoiced */
  qty_invoiced_at_date: number | false
  /** Invoiced Quantity (posted) */
  qty_invoiced_posted: number | false
  /** Qty To Deliver */
  qty_to_deliver: number | false
  /** Quantity To Invoice */
  qty_to_invoice: number | false
  /** Reached Milestones */
  reached_milestones_ids: number[] /* project.milestone */
  /** Delivery cost should be recomputed */
  recompute_delivery_price: boolean
  /** Registrations */
  registration_ids: number[] /* event.registration */
  /** Routes */
  route_ids: number[] /* stock.route */ | false
  /** Sale Line Warn Msg */
  sale_line_warn_msg: string | false
  /** Salesperson */
  salesman_id: [number, string] /* res.users */ | false
  /** Scheduled Date */
  scheduled_date: string | false
  /** Selected Combo Items */
  selected_combo_items: string | false
  /** Sequence */
  sequence: number | false
  /** Create on Order */
  service_tracking: 'no' | 'event' | 'task_global_project' | 'task_in_project' | 'project_only' | false
  /** Warning */
  shop_warning: string | false
  /** Order Status */
  state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Generated Task */
  task_id: [number, string] /* project.task */ | false
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Tax Country */
  tax_country_id: [number, string] /* res.country */ | false
  /** Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Technical Price Unit */
  technical_price_unit: number | false
  /** Translated Product Name */
  translated_product_name: string | false
  /** Untaxed Invoiced Amount */
  untaxed_amount_invoiced: number | false
  /** Untaxed Amount To Invoice */
  untaxed_amount_to_invoice: number | false
  /** Virtual Available At Date */
  virtual_available_at_date: number | false
  /** Virtual */
  virtual_id: string | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for sale.order.line */
export type SaleOrderLineFieldName = ModelFieldName<SaleOrderLineRecord>

/** Typed search_read result */
export type SaleOrderLineSearchResult = ModelRecord<SaleOrderLineRecord>
