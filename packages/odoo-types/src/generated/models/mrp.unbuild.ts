// Auto-generated from mrp.unbuild (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.unbuild */
export interface MrpUnbuildRecord extends BaseRecord {
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
  /** Bill of Material */
  bom_id: [number, string] /* mrp.bom */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Consumed Disassembly Lines */
  consume_line_ids: number[] /* stock.move */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Has Message */
  has_message: boolean
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  has_tracking: 'serial' | 'lot' | 'none' | false
  /** Destination Location — Location where you want to send the components resulting from the unbuild order. */
  location_dest_id: [number, string] /* stock.location */
  /** Source Location — Location where the product you want to unbuild is. */
  location_id: [number, string] /* stock.location */
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
  /** Lot/Serial Numbers */
  lot_producing_ids: number[] /* stock.lot */ | false
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
  /** Bill of Material used on the Production Order — Bills of Materials, also called recipes, are used to autocomplete components and work order instructions. */
  mo_bom_id: [number, string] /* mrp.bom */ | false
  /** Manufacturing Order */
  mo_id: [number, string] /* mrp.production */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Reference */
  name: string | false
  /** Processed Disassembly Lines */
  produce_line_ids: number[] /* stock.move */
  /** Product */
  product_id: [number, string] /* product.product */
  /** Quantity */
  product_qty: number
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Status */
  state: 'draft' | 'done' | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for mrp.unbuild */
export type MrpUnbuildFieldName = ModelFieldName<MrpUnbuildRecord>

/** Typed search_read result */
export type MrpUnbuildSearchResult = ModelRecord<MrpUnbuildRecord>
