// Auto-generated from purchase.order (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** purchase.order */
export interface PurchaseOrderRecord extends BaseRecord {
  /** Security Token */
  access_token: string | false
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Access warning */
  access_warning: string | false
  /** Acknowledged — It indicates that the vendor has acknowledged the receipt of the purchase order. */
  acknowledged: boolean
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Taxes */
  amount_tax: number | false
  /** Total */
  amount_total: number | false
  /** Total in currency */
  amount_total_cc: number | false
  /** Untaxed Amount */
  amount_untaxed: number | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  company_price_include: 'tax_included' | 'tax_excluded' | false
  /** Country code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */
  /** Currency Rate */
  currency_rate: number | false
  /** Confirmation Date */
  date_approve: string | false
  /** Date Calendar Start */
  date_calendar_start: string | false
  /** Order Deadline — Depicts the date within which the Quotation should be confirmed and converted into a purchase order. */
  date_order: string
  /** Expected Arrival — Delivery date promised by vendor. This date is used to determine expected arrival of products. */
  date_planned: string | false
  /** Destination Location Type — Technical field used to display the Drop Ship Address */
  default_location_dest_id_usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit' | false
  /** Dropship Address — Put an address if you want to deliver directly from the vendor to the customer. Otherwise, keep empty to deliver to your own company. */
  dest_address_id: [number, string] /* res.partner */ | false
  /** Duplicated Order */
  duplicated_order_ids: number[] /* purchase.order */ | false
  /** Arrival — Completion date of the first receipt order. */
  effective_date: string | false
  /** Fiscal Position */
  fiscal_position_id: [number, string] /* account.fiscal.position */ | false
  /** Has Message */
  has_message: boolean
  /** Technical field for whether the purchase order has associated sale orders */
  has_sale_order: boolean
  /** Incoming Shipment count */
  incoming_picking_count: number | false
  /** Incoterm — International Commercial Terms are a series of predefined commercial terms used in international transactions. */
  incoterm_id: [number, string] /* account.incoterms */ | false
  /** Incoterm Location */
  incoterm_location: string | false
  /** Bill Count */
  invoice_count: number | false
  /** Bills */
  invoice_ids: number[] /* account.move */ | false
  /** Billing Status */
  invoice_status: 'no' | 'to invoice' | 'invoiced' | false
  /** Is Late */
  is_late: boolean
  /** Is Shipped */
  is_shipped: boolean
  /** Purchase Order Modification — Purchase Order Modification used when you want to purchase order editable after confirm */
  lock_confirmed_po: 'edit' | 'lock' | false
  /** Locked — Locked Purchase Orders cannot be modified. */
  locked: boolean
  /** Attachment Count */
  message_attachment_count: number | false
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Is Follower */
  message_is_follower: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Count of MO Source */
  mrp_production_count: number | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Order Reference */
  name: string
  /** Terms and Conditions */
  note: string | false
  /** On-Time Delivery Rate — Over the past x days; the number of products received on time divided by the number of ordered products.x is either the System Parameter purchase_stock.on_time_delivery_days or the default 365 */
  on_time_rate: number | false
  /** Order Lines */
  order_line: number[] /* purchase.order.line */
  /** Source — Reference of the document that generated this purchase order request (e.g. a sales order) */
  origin: string | false
  /** # Vendor Bills */
  partner_bill_count: number | false
  /** Vendor — You can find a vendor by its Name, TIN, Email or Internal Reference. */
  partner_id: [number, string] /* res.partner */
  /** Vendor Reference — Reference of the sales order or bid sent by the vendor. It\'s used to do the matching when you receive the products as this reference is usually written on the delivery order sent by your vendor. */
  partner_ref: string | false
  /** Payment Terms */
  payment_term_id: [number, string] /* account.payment.term */ | false
  /** Receptions */
  picking_ids: number[] /* stock.picking */ | false
  /** Deliver To — This will determine operation type of incoming shipment */
  picking_type_id: [number, string] /* stock.picking.type */
  /** Priority */
  priority: '0' | '1' | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Purchase Warning — Internal warning for the partner or the products as set by the user. */
  purchase_warning_text: string | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Receipt Reminder Email */
  receipt_reminder_email: boolean
  /** Receipt Status — Red: Late
            Orange: To process today
            Green: On time */
  receipt_status: 'pending' | 'partial' | 'full' | false
  /** References */
  reference_ids: number[] /* stock.reference */ | false
  /** Days Before Receipt */
  reminder_date_before_receipt: number | false
  /** Number of Source Sale */
  sale_order_count: number | false
  /** Show Comparison */
  show_comparison: boolean
  /** Status */
  state: 'draft' | 'sent' | 'to approve' | 'purchase' | 'cancel' | false
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Tax Country — Technical field to filter the available taxes depending on the fiscal country and fiscal position. */
  tax_country_id: [number, string] /* res.country */ | false
  /** Tax Totals */
  tax_totals: string | false
  /** Buyer */
  user_id: [number, string] /* res.users */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for purchase.order */
export type PurchaseOrderFieldName = ModelFieldName<PurchaseOrderRecord>

/** Typed search_read result */
export type PurchaseOrderSearchResult = ModelRecord<PurchaseOrderRecord>
