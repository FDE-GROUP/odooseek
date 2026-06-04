// Auto-generated from stock.warehouse (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.warehouse */
export interface StockWarehouseRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Buy rule */
  buy_pull_id: [number, string] /* stock.rule */ | false
  /** Buy to Resupply — When products are bought, they can be delivered to this warehouse */
  buy_to_resupply: boolean
  /** Short Name — Short name used to identify your warehouse */
  code: string
  /** Company — The company is automatically set from your user preferences. */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Delivery Route */
  delivery_route_id: [number, string] /* stock.route */ | false
  /** Outgoing Shipments — Default outgoing route to follow */
  delivery_steps: 'ship_only' | 'pick_ship' | 'pick_pack_ship'
  /** In Type */
  in_type_id: [number, string] /* stock.picking.type */ | false
  /** Internal Type */
  int_type_id: [number, string] /* stock.picking.type */ | false
  /** Location Stock */
  lot_stock_id: [number, string] /* stock.location */
  /** Manufacturing Operation Type */
  manu_type_id: [number, string] /* stock.picking.type */ | false
  /** Manufacture MTO Rule */
  manufacture_mto_pull_id: [number, string] /* stock.rule */ | false
  /** Manufacture Rule */
  manufacture_pull_id: [number, string] /* stock.rule */ | false
  /** Manufacture — 1 Step: Consume components from stock and produce.
              2 Steps: Pick components from stock and then produce.
              3 Steps: Pick components from stock, produce, and then move final product(s) from production area to stock. */
  manufacture_steps: 'mrp_one_step' | 'pbm' | 'pbm_sam'
  /** Manufacture to Resupply — When products are manufactured, they can be manufactured in this warehouse. */
  manufacture_to_resupply: boolean
  /** MTO rule */
  mto_pull_id: [number, string] /* stock.rule */ | false
  /** Warehouse */
  name: string
  /** Out Type */
  out_type_id: [number, string] /* stock.picking.type */ | false
  /** Pack Type */
  pack_type_id: [number, string] /* stock.picking.type */ | false
  /** Address */
  partner_id: [number, string] /* res.partner */ | false
  /** Picking before Manufacturing Location */
  pbm_loc_id: [number, string] /* stock.location */ | false
  /** Picking Before Manufacturing MTO Rule */
  pbm_mto_pull_id: [number, string] /* stock.rule */ | false
  /** Picking Before Manufacturing Route */
  pbm_route_id: [number, string] /* stock.route */ | false
  /** Picking Before Manufacturing Operation Type */
  pbm_type_id: [number, string] /* stock.picking.type */ | false
  /** Pick Type */
  pick_type_id: [number, string] /* stock.picking.type */ | false
  /** Quality Control Type */
  qc_type_id: [number, string] /* stock.picking.type */ | false
  /** Receipt Route */
  reception_route_id: [number, string] /* stock.route */ | false
  /** Incoming Shipments — Default incoming route to follow */
  reception_steps: 'one_step' | 'two_steps' | 'three_steps'
  /** Resupply Routes — Routes will be created for these resupply warehouses and you can select them on products and product categories */
  resupply_route_ids: number[] /* stock.route */
  /** Resupply From — Routes will be created automatically to resupply this warehouse from the warehouses ticked */
  resupply_wh_ids: number[] /* stock.warehouse */ | false
  /** Routes — Defaults routes through the warehouse */
  route_ids: number[] /* stock.route */ | false
  /** Stock after Manufacturing Location */
  sam_loc_id: [number, string] /* stock.location */ | false
  /** Stock After Manufacturing Rule */
  sam_rule_id: [number, string] /* stock.rule */ | false
  /** Stock After Manufacturing Operation Type */
  sam_type_id: [number, string] /* stock.picking.type */ | false
  /** Sequence — Gives the sequence of this line when displaying the warehouses. */
  sequence: number | false
  /** Storage Type */
  store_type_id: [number, string] /* stock.picking.type */ | false
  /** View Location */
  view_location_id: [number, string] /* stock.location */
  /** Input Location */
  wh_input_stock_loc_id: [number, string] /* stock.location */ | false
  /** Output Location */
  wh_output_stock_loc_id: [number, string] /* stock.location */ | false
  /** Packing Location */
  wh_pack_stock_loc_id: [number, string] /* stock.location */ | false
  /** Quality Control Location */
  wh_qc_stock_loc_id: [number, string] /* stock.location */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Cross Dock Type */
  xdock_type_id: [number, string] /* stock.picking.type */ | false
}

/** Field names for stock.warehouse */
export type StockWarehouseFieldName = ModelFieldName<StockWarehouseRecord>

/** Typed search_read result */
export type StockWarehouseSearchResult = ModelRecord<StockWarehouseRecord>
