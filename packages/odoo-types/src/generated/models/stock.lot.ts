// Auto-generated from stock.lot (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.lot */
export interface StockLotRecord extends BaseRecord {
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
  /** Average Cost */
  avg_cost: number | false
  /** Valuation Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Delivery order count */
  delivery_count: number | false
  /** Transfers */
  delivery_ids: number[] /* stock.picking */ | false
  /** Display Complete */
  display_complete: boolean
  /** Has Message */
  has_message: boolean
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Properties */
  lot_properties: unknown | false
  /** Valuation by Lot/Serial — If checked, the valuation will be specific by Lot/Serial number. */
  lot_valuated: boolean
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
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Lot/Serial Number — Unique Lot/Serial Number */
  name: string
  /** Description */
  note: string | false
  /** Partner */
  partner_ids: number[] /* res.partner */ | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** On Hand Quantity */
  product_qty: number | false
  /** Unit — Default unit of measure used for all stock operations. */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Purchase order count */
  purchase_order_count: number | false
  /** Purchase Orders */
  purchase_order_ids: number[] /* purchase.order */ | false
  /** Quants */
  quant_ids: number[] /* stock.quant */
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Internal Reference — Internal reference number in case it differs from the manufacturer\'s lot/serial number */
  ref: string | false
  /** Sale order count */
  sale_order_count: number | false
  /** Sales Orders */
  sale_order_ids: number[] /* sale.order */ | false
  /** Cost — Value of the lot (automatically computed in AVCO).
        Used to value the product when the purchase cost is not known (e.g. inventory adjustment).
        Used to compute margins on sale orders. */
  standard_price: number | false
  /** Total Value */
  total_value: number | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.lot */
export type StockLotFieldName = ModelFieldName<StockLotRecord>

/** Typed search_read result */
export type StockLotSearchResult = ModelRecord<StockLotRecord>
