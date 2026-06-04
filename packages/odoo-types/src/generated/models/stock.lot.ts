// Auto-generated from stock.lot (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.lot */
export interface StockLotRecord extends BaseRecord {
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
  /** Lot/Serial Number — Unique Lot/Serial Number */
  name: string
  /** Internal Reference — Internal reference number in case it differs from the manufacturer\'s lot/serial number */
  ref: string | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Unit — Default unit of measure used for all stock operations. */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quants */
  quant_ids: number[] /* stock.quant */
  /** On Hand Quantity */
  product_qty: number | false
  /** Description */
  note: string | false
  /** Display Complete */
  display_complete: boolean
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Transfers */
  delivery_ids: number[] /* stock.picking */ | false
  /** Delivery order count */
  delivery_count: number | false
  /** Partner */
  partner_ids: number[] /* res.partner */ | false
  /** Properties */
  lot_properties: unknown | false
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Valuation by Lot/Serial — If checked, the valuation will be specific by Lot/Serial number. */
  lot_valuated: boolean
  /** Average Cost */
  avg_cost: number | false
  /** Total Value */
  total_value: number | false
  /** Valuation Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Cost — Value of the lot (automatically computed in AVCO).
        Used to value the product when the purchase cost is not known (e.g. inventory adjustment).
        Used to compute margins on sale orders. */
  standard_price: number | false
  /** Purchase Orders */
  purchase_order_ids: number[] /* purchase.order */ | false
  /** Purchase order count */
  purchase_order_count: number | false
  /** Sales Orders */
  sale_order_ids: number[] /* sale.order */ | false
  /** Sale order count */
  sale_order_count: number | false
}

/** Field names for stock.lot */
export type StockLotFieldName = ModelFieldName<StockLotRecord>

/** Typed search_read result */
export type StockLotSearchResult = ModelRecord<StockLotRecord>
