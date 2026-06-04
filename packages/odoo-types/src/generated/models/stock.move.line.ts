// Auto-generated from stock.move.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.move.line */
export interface StockMoveLineRecord extends BaseRecord {
  /** Transfer — The stock operation where the packing has been made */
  picking_id: [number, string] /* stock.picking */ | false
  /** Stock Operation */
  move_id: [number, string] /* stock.move */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Product Category */
  product_category_name: string | false
  /** Quantity */
  quantity: number | false
  /** Quantity in Product UoM */
  quantity_product_uom: number | false
  /** Picked */
  picked: boolean
  /** Source Package */
  package_id: [number, string] /* stock.package */ | false
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
  /** Lot/Serial Number Name */
  lot_name: string | false
  /** Destination Package — If set, the operations are packed into this package */
  result_package_id: [number, string] /* stock.package */ | false
  /** Destination Package Name */
  result_package_dest_name: string | false
  /** Package History */
  package_history_id: [number, string] /* stock.package.history */ | false
  /** Is added through entire package */
  is_entire_pack: boolean
  /** Date — Creation date of this move line until updated due to: quantity being increased, \'picked\' status has updated, or move line is done. */
  date: string
  /** Scheduled Date — Scheduled date until move is done, then date of actual move processing */
  scheduled_date: string | false
  /** From Owner — When validating the transfer, the products will be taken from this owner. */
  owner_id: [number, string] /* res.partner */ | false
  /** From */
  location_id: [number, string] /* stock.location */
  /** To */
  location_dest_id: [number, string] /* stock.location */
  /** Source Location Type — * Vendor: Virtual location representing the source location for products coming from your vendors
* Virtual: Virtual location used to create a hierarchical structure for your warehouse by aggregating its child locations. Can\'t directly contain products
* Internal: Physical locations inside your warehouses,
* Customer: Virtual location representing the destination location for products sent to your customers
* Inventory Loss: Virtual location serving as the counterpart for inventory operations done to correct stock levels (Physical inventories)
* Production: Virtual counterpart location for production operations. I.e. This location consumes components and produces finished products
* Transit: Counterpart location that should be used for inter-company or inter-warehouses operations */
  location_usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit' | false
  /** Destination Location Type — * Vendor: Virtual location representing the source location for products coming from your vendors
* Virtual: Virtual location used to create a hierarchical structure for your warehouse by aggregating its child locations. Can\'t directly contain products
* Internal: Physical locations inside your warehouses,
* Customer: Virtual location representing the destination location for products sent to your customers
* Inventory Loss: Virtual location serving as the counterpart for inventory operations done to correct stock levels (Physical inventories)
* Production: Virtual counterpart location for production operations. I.e. This location consumes components and produces finished products
* Transit: Counterpart location that should be used for inter-company or inter-warehouses operations */
  location_dest_usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit' | false
  /** Lots Visible */
  lots_visible: boolean
  /** Contact */
  picking_partner_id: [number, string] /* res.partner */ | false
  /** Destination Address  — Optional address where goods are to be delivered, specifically used for allotment */
  move_partner_id: [number, string] /* res.partner */ | false
  /** Type of Operation */
  picking_code: 'incoming' | 'outgoing' | 'internal' | 'mrp_operation' | false
  /** Operation type */
  picking_type_id: [number, string] /* stock.picking.type */ | false
  /** Create New Lots/Serial Numbers — If this is checked only, it will suppose you want to create new Lots/Serial Numbers, so you can provide them in a text field.  */
  picking_type_use_create_lots: boolean
  /** Use Existing Lots/Serial Numbers — If this is checked, you will be able to choose the Lots/Serial Numbers. You can also decide to not put lots in this operation type.  This means it will create stock with no lot or not put a restriction on the lot taken.  */
  picking_type_use_existing_lots: boolean
  /** Status — * New: The stock move is created but not confirmed.
* Waiting Another Move: A linked stock move should be done before this one.
* Waiting: The stock move is confirmed but the product can\'t be reserved.
* Available: The product of the stock move is reserved.
* Done: The product has been transferred and the transfer has been confirmed. */
  state: 'draft' | 'waiting' | 'confirmed' | 'partially_available' | 'assigned' | 'done' | 'cancel' | false
  /** Scrap operation */
  scrap_id: [number, string] /* stock.scrap */ | false
  /** Inventory */
  is_inventory: boolean
  /** Is Locked */
  is_locked: boolean
  /** Consume Line */
  consume_line_ids: number[] /* stock.move.line */ | false
  /** Produce Line */
  produce_line_ids: number[] /* stock.move.line */ | false
  /** Reference */
  reference: string | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none' | false
  /** Source */
  origin: string | false
  /** Description Of Picking */
  description_picking: string | false
  /** Pick From */
  quant_id: [number, string] /* stock.quant */ | false
  /** Source Location */
  picking_location_id: [number, string] /* stock.location */ | false
  /** Destination Location */
  picking_location_dest_id: [number, string] /* stock.location */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Work Order */
  workorder_id: [number, string] /* mrp.workorder */ | false
  /** Production Order */
  production_id: [number, string] /* mrp.production */ | false
  /** Sale Price */
  sale_price: number | false
  /** Destination Country — The ISO country code in two chars. 
You can use this field for quick search. */
  destination_country_code: string | false
  /** Carrier */
  carrier_id: [number, string] /* delivery.carrier */ | false
}

/** Field names for stock.move.line */
export type StockMoveLineFieldName = ModelFieldName<StockMoveLineRecord>

/** Typed search_read result */
export type StockMoveLineSearchResult = ModelRecord<StockMoveLineRecord>
