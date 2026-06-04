// Auto-generated from sale.order (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** sale.order */
export interface SaleOrderRecord extends BaseRecord {
  /** Campaign — This is a name that helps you keep track of your different campaign efforts, e.g. Fall_Drive, Christmas_Special */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** Source — This is the source of the link, e.g. Search Engine, another domain, or name of email list */
  source_id: [number, string] /* utm.source */ | false
  /** Medium — This is the method of delivery, e.g. Postcard, Email, or Banner Ad */
  medium_id: [number, string] /* utm.medium */ | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Is Follower */
  message_is_follower: boolean
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Has Message */
  has_message: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Security Token */
  access_token: string | false
  /** Access warning */
  access_warning: string | false
  /** Order Reference */
  name: string
  /** Company */
  company_id: [number, string] /* res.company */
  /** Customer */
  partner_id: [number, string] /* res.partner */
  /** Status */
  state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Locked — Locked orders cannot be modified. */
  locked: boolean
  /** Has Archived Products */
  has_archived_products: boolean
  /** Customer Reference */
  client_order_ref: string | false
  /** Creation Date */
  create_date: string | false
  /** Delivery Date — This is the delivery date promised to the customer. If set, the delivery order will be scheduled based on this date rather than product lead times. */
  commitment_date: string | false
  /** Order Date — Creation date of draft/sent orders,
Confirmation date of confirmed orders. */
  date_order: string
  /** Source Document — Reference of the document that generated this sales order request */
  origin: string | false
  /** Payment Ref. — The payment communication of this sale order. */
  reference: string | false
  /** Pending Email Template */
  pending_email_template_id: [number, string] /* mail.template */ | false
  /** Online signature — Request a online signature from the customer to confirm the order. */
  require_signature: boolean
  /** Online payment — Request a online payment from the customer to confirm the order. */
  require_payment: boolean
  /** Prepayment percentage — The percentage of the amount needed that must be paid by the customer to confirm the order. */
  prepayment_percent: number | false
  /** Signature */
  signature: string | false
  /** Signed By */
  signed_by: string | false
  /** Signed On */
  signed_on: string | false
  /** Expiration — Validity of the order, after that you will not able to sign & pay the quotation. */
  validity_date: string | false
  /** Invoicing Journal — If set, the SO will invoice in this journal; otherwise the sales journal with the lowest sequence is used. */
  journal_id: [number, string] /* account.journal */ | false
  /** Terms and conditions */
  note: string | false
  /** Invoice Address */
  partner_invoice_id: [number, string] /* res.partner */
  /** Delivery Address */
  partner_shipping_id: [number, string] /* res.partner */
  /** Fiscal Position — Fiscal positions are used to adapt taxes and accounts for particular customers or sales orders/invoices.The default value comes from the customer. */
  fiscal_position_id: [number, string] /* account.fiscal.position */ | false
  /** Payment Terms */
  payment_term_id: [number, string] /* account.payment.term */ | false
  /** Payment Method */
  preferred_payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Pricelist — If you change the pricelist, only newly added lines will be affected. */
  pricelist_id: [number, string] /* product.pricelist */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Currency Rate */
  currency_rate: number | false
  /** Salesperson */
  user_id: [number, string] /* res.users */ | false
  /** Sales Team */
  team_id: [number, string] /* crm.team */ | false
  /** Order Lines */
  order_line: number[] /* sale.order.line */
  /** Untaxed Amount */
  amount_untaxed: number | false
  /** Taxes */
  amount_tax: number | false
  /** Total */
  amount_total: number | false
  /** Un-invoiced Balance */
  amount_to_invoice: number | false
  /** Already invoiced */
  amount_invoiced: number | false
  /** Invoice Count */
  invoice_count: number | false
  /** Invoices */
  invoice_ids: number[] /* account.move */ | false
  /** Invoice Status */
  invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no' | false
  /** Sale Warning — Internal warning for the partner or the products as set by the user. */
  sale_warning_text: string | false
  /** Transactions */
  transaction_ids: number[] /* payment.transaction */ | false
  /** Authorized Transactions */
  authorized_transaction_ids: number[] /* payment.transaction */ | false
  /** Has Authorized Transactions */
  has_authorized_transaction_ids: boolean
  /** Payment Transactions Amount — Sum of transactions made in through the online payment form that are in the state \'done\' or \'authorized\' and linked to this order. */
  amount_paid: number | false
  /** Tags */
  tag_ids: number[] /* crm.tag */ | false
  /** Amount Before Discount */
  amount_undiscounted: number | false
  /** Country code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  company_price_include: 'tax_included' | 'tax_excluded' | false
  /** Duplicated Order */
  duplicated_order_ids: number[] /* sale.order */ | false
  /** Expected Date — Delivery date you can promise to the customer, computed from the minimum lead time of the order lines in case of Service products. In case of shipping, the shipping policy of the order will be taken into account to either use the minimum or maximum lead time of the order lines. */
  expected_date: string | false
  /** Is Expired */
  is_expired: boolean
  /** Partner Credit Warning */
  partner_credit_warning: string | false
  /** Tax Calculation Rounding Method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Tax Country */
  tax_country_id: [number, string] /* res.country */ | false
  /** Tax Totals */
  tax_totals: string | false
  /** Terms & Conditions format */
  terms_type: 'plain' | 'html' | false
  /** Type Name */
  type_name: string | false
  /** Has Fiscal Position Changed */
  show_update_fpos: boolean
  /** Has Active Pricelist */
  has_active_pricelist: boolean
  /** Has Pricelist Changed */
  show_update_pricelist: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Pickup Location Data */
  pickup_location_data: unknown | false
  /** Delivery Method — Fill this field if you plan to invoice the shipping based on picking. */
  carrier_id: [number, string] /* delivery.carrier */ | false
  /** Delivery Message */
  delivery_message: string | false
  /** Delivery Set */
  delivery_set: boolean
  /** Delivery cost should be recomputed */
  recompute_delivery_price: boolean
  /** Service Product */
  is_all_service: boolean
  /** Shipping Weight */
  shipping_weight: number | false
  /** Opportunity */
  opportunity_id: [number, string] /* crm.lead */ | false
  /** Quotation Template */
  sale_order_template_id: [number, string] /* sale.order.template */ | false
  /** Number of Purchase Order Generated */
  purchase_order_count: number | false
  /** Incoterm — International Commercial Terms are a series of predefined commercial terms used in international transactions. */
  incoterm: [number, string] /* account.incoterms */ | false
  /** Incoterm Location */
  incoterm_location: string | false
  /** Shipping Policy — If you deliver all products at once, the delivery order will be scheduled based on the greatest product lead time. Otherwise, it will be based on the shortest. */
  picking_policy: 'direct' | 'one'
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Transfers */
  picking_ids: number[] /* stock.picking */
  /** Delivery Orders */
  delivery_count: number | false
  /** Delivery Status — Blue: Not Delivered/Started
            Orange: Partially Delivered
            Green: Fully Delivered */
  delivery_status: 'pending' | 'started' | 'partial' | 'full' | false
  /** Late Availability — True if any related picking has late availability */
  late_availability: boolean
  /** References */
  stock_reference_ids: number[] /* stock.reference */ | false
  /** Effective Date — Completion date of the first delivery order. */
  effective_date: string | false
  /** JSON data for the popover widget */
  json_popover: string | false
  /** Has late picking */
  show_json_popover: boolean
  /** Attendee Count */
  attendee_count: number | false
  /** Count of MO generated */
  mrp_production_count: number | false
  /** Manufacturing orders associated with this sales order. */
  mrp_production_ids: number[] /* mrp.production */ | false
  /** Available Quotation Documents */
  available_quotation_document_ids: number[] /* quotation.document */ | false
  /** Is Pdf Quote Builder Available */
  is_pdf_quote_builder_available: boolean
  /** Headers/Footers */
  quotation_document_ids: number[] /* quotation.document */ | false
  /** Customizable PDF Form Fields */
  customizable_pdf_form_fields: unknown | false
  /** Website — Website through which this order was placed for eCommerce orders. */
  website_id: [number, string] /* website */ | false
  /** Cart recovery email already sent */
  cart_recovery_email_sent: boolean
  /** Warning */
  shop_warning: string | false
  /** Order Lines displayed on Website */
  website_order_line: number[] /* sale.order.line */
  /** Delivery Amount — Tax included or excluded depending on the website configuration. */
  amount_delivery: number | false
  /** Cart Quantity */
  cart_quantity: number | false
  /** Only Services */
  only_services: boolean
  /** Abandoned Cart */
  is_abandoned_cart: boolean
  /** Tasks associated with this sale */
  tasks_ids: number[] /* project.task */ | false
  /** Tasks */
  tasks_count: number | false
  /** Display project */
  visible_project: boolean
  /** Projects */
  project_ids: number[] /* project.project */ | false
  /** Number of Projects */
  project_count: number | false
  /** Milestone Count */
  milestone_count: number | false
  /** Is Product Milestone */
  is_product_milestone: boolean
  /** Show Create Project Button */
  show_create_project_button: boolean
  /** Show Project Button */
  show_project_button: boolean
  /** Closed Task Count */
  closed_task_count: number | false
  /** Completed Task Percentage */
  completed_task_percentage: number | false
  /** Project — A task will be created for the project upon sales order confirmation. The analytic distribution of this project will also serve as a reference for newly created sales order items. */
  project_id: [number, string] /* project.project */ | false
  /** Project Account */
  project_account_id: [number, string] /* account.analytic.account */ | false
  /** Expenses */
  expense_ids: number[] /* hr.expense */
  /** # of Expenses */
  expense_count: number | false
}

/** Field names for sale.order */
export type SaleOrderFieldName = ModelFieldName<SaleOrderRecord>

/** Typed search_read result */
export type SaleOrderSearchResult = ModelRecord<SaleOrderRecord>
