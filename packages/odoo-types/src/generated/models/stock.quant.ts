// Auto-generated from stock.quant (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.quant */
export interface StockQuantRecord extends BaseRecord {
  /** Product */
  product_id: [number, string] /* product.product */
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Unit — Default unit of measure used for all stock operations. */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Favorite */
  is_favorite: boolean
  /** Company — Let this field empty if this location is shared between companies */
  company_id: [number, string] /* res.company */ | false
  /** Location */
  location_id: [number, string] /* stock.location */
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Storage Category */
  storage_category_id: [number, string] /* stock.storage.category */ | false
  /** Inventory Frequency —  When different than 0, inventory count date for products stored at this location will be automatically set at the defined frequency. */
  cyclic_inventory_frequency: number | false
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
  /** Properties */
  lot_properties: unknown | false
  /** Duplicated Serial Number — If the same SN is in another Quant */
  sn_duplicated: boolean
  /** Package — The package containing this quant */
  package_id: [number, string] /* stock.package */ | false
  /** Owner — This is the owner of the quant */
  owner_id: [number, string] /* res.partner */ | false
  /** Quantity — Quantity of products in this quant, in the default unit of measure of the product */
  quantity: number | false
  /** Reserved Quantity — Quantity of reserved products in this quant, in the default unit of measure of the product */
  reserved_quantity: number
  /** Available Quantity — On hand quantity which hasn\'t been reserved on a transfer, in the default unit of measure of the product */
  available_quantity: number | false
  /** Incoming Date */
  in_date: string
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none' | false
  /** On Hand */
  on_hand: boolean
  /** Product Category */
  product_categ_id: [number, string] /* product.category */ | false
  /** Counted — The product\'s counted quantity. */
  inventory_quantity: number | false
  /** Inventoried Quantity */
  inventory_quantity_auto_apply: number | false
  /** Difference — Indicates the gap between the product\'s theoretical quantity and its counted quantity. */
  inventory_diff_quantity: number | false
  /** Scheduled — Next date the On Hand Quantity should be counted. */
  inventory_date: string | false
  /** Last Count Date — Last time the Quantity was Updated */
  last_count_date: string | false
  /** Inventory Quantity Set */
  inventory_quantity_set: boolean
  /** Quantity has been moved since last count */
  is_outdated: boolean
  /** Assigned To — User assigned to do product count. */
  user_id: [number, string] /* res.users */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Value */
  value: number | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Accounting Date — Date at which the accounting entries will be created in case of automated inventory valuation. If empty, the inventory date will be used. */
  accounting_date: string | false
  /** Cost Method */
  cost_method: 'standard' | 'fifo' | 'average' | false
}

/** Field names for stock.quant */
export type StockQuantFieldName = ModelFieldName<StockQuantRecord>

/** Typed search_read result */
export type StockQuantSearchResult = ModelRecord<StockQuantRecord>
