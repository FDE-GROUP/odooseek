// Auto-generated from stock.scrap (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.scrap */
export interface StockScrapRecord extends BaseRecord {
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
  name: string
  /** Company */
  company_id: [number, string] /* res.company */
  /** Source Document */
  origin: string | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Product Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none' | false
  /** Lot/Serial */
  lot_id: [number, string] /* stock.lot */ | false
  /** Package */
  package_id: [number, string] /* stock.package */ | false
  /** Owner */
  owner_id: [number, string] /* res.partner */ | false
  /** Move */
  move_ids: number[] /* stock.move */
  /** Picking */
  picking_id: [number, string] /* stock.picking */ | false
  /** Source Location */
  location_id: [number, string] /* stock.location */
  /** Scrap Location */
  scrap_location_id: [number, string] /* stock.location */
  /** Quantity */
  scrap_qty: number
  /** Status */
  state: 'draft' | 'done' | false
  /** Date */
  date_done: string | false
  /** Replenish Quantities — Trigger replenishment for scrapped products */
  should_replenish: boolean
  /** Scrap Reason */
  scrap_reason_tag_ids: number[] /* stock.scrap.reason.tag */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Manufacturing Order */
  production_id: [number, string] /* mrp.production */ | false
  /** Work Order */
  workorder_id: [number, string] /* mrp.workorder */ | false
  /** Is Kits */
  product_is_kit: boolean
  /** Product Template */
  product_template: [number, string] /* product.template */ | false
  /** Kit */
  bom_id: [number, string] /* mrp.bom */ | false
}

/** Field names for stock.scrap */
export type StockScrapFieldName = ModelFieldName<StockScrapRecord>

/** Typed search_read result */
export type StockScrapSearchResult = ModelRecord<StockScrapRecord>
