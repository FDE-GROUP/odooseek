// Auto-generated from mrp.unbuild (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.unbuild */
export interface MrpUnbuildRecord extends BaseRecord {
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
  /** Reference */
  name: string | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Company */
  company_id: [number, string] /* res.company */
  /** Quantity */
  product_qty: number
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Bill of Material */
  bom_id: [number, string] /* mrp.bom */ | false
  /** Manufacturing Order */
  mo_id: [number, string] /* mrp.production */ | false
  /** Bill of Material used on the Production Order — Bills of Materials, also called recipes, are used to autocomplete components and work order instructions. */
  mo_bom_id: [number, string] /* mrp.bom */ | false
  /** Lot/Serial Numbers */
  lot_producing_ids: number[] /* stock.lot */ | false
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  has_tracking: 'serial' | 'lot' | 'none' | false
  /** Source Location — Location where the product you want to unbuild is. */
  location_id: [number, string] /* stock.location */
  /** Destination Location — Location where you want to send the components resulting from the unbuild order. */
  location_dest_id: [number, string] /* stock.location */
  /** Consumed Disassembly Lines */
  consume_line_ids: number[] /* stock.move */
  /** Processed Disassembly Lines */
  produce_line_ids: number[] /* stock.move */
  /** Status */
  state: 'draft' | 'done' | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for mrp.unbuild */
export type MrpUnbuildFieldName = ModelFieldName<MrpUnbuildRecord>

/** Typed search_read result */
export type MrpUnbuildSearchResult = ModelRecord<MrpUnbuildRecord>
