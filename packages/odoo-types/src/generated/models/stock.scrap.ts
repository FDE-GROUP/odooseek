// Auto-generated from stock.scrap (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.scrap */
export interface StockScrapRecord extends BaseRecord {
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Kit */
  bom_id: [number, string] /* mrp.bom */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Date */
  date_done: string | false
  /** Has Message */
  has_message: boolean
  /** Source Location */
  location_id: [number, string] /* stock.location */
  /** Lot/Serial */
  lot_id: [number, string] /* stock.lot */ | false
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
  /** Move */
  move_ids: number[] /* stock.move */
  /** Reference */
  name: string
  /** Source Document */
  origin: string | false
  /** Owner */
  owner_id: [number, string] /* res.partner */ | false
  /** Package */
  package_id: [number, string] /* stock.package */ | false
  /** Picking */
  picking_id: [number, string] /* stock.picking */ | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Is Kits */
  product_is_kit: boolean
  /** Product Template */
  product_template: [number, string] /* product.template */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Manufacturing Order */
  production_id: [number, string] /* mrp.production */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Scrap Location */
  scrap_location_id: [number, string] /* stock.location */
  /** Quantity */
  scrap_qty: number
  /** Scrap Reason */
  scrap_reason_tag_ids: number[] /* stock.scrap.reason.tag */ | false
  /** Replenish Quantities — Trigger replenishment for scrapped products */
  should_replenish: boolean
  /** Status */
  state: 'draft' | 'done' | false
  /** Product Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none' | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Work Order */
  workorder_id: [number, string] /* mrp.workorder */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.scrap */
export type StockScrapFieldName = ModelFieldName<StockScrapRecord>

/** Typed search_read result */
export type StockScrapSearchResult = ModelRecord<StockScrapRecord>
