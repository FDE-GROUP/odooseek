// Auto-generated from stock.quant (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.quant */
export interface StockQuantRecord extends BaseRecord {
  /** Accounting Date — Date at which the accounting entries will be created in case of automated inventory valuation. If empty, the inventory date will be used. */
  accounting_date: string | false
  /** Available Quantity — On hand quantity which hasn\'t been reserved on a transfer, in the default unit of measure of the product */
  available_quantity: number | false
  /** Company — Let this field empty if this location is shared between companies */
  company_id: [number, string] /* res.company */ | false
  /** Cost Method */
  cost_method: 'standard' | 'fifo' | 'average' | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Inventory Frequency —  When different than 0, inventory count date for products stored at this location will be automatically set at the defined frequency. */
  cyclic_inventory_frequency: number | false
  /** Incoming Date */
  in_date: string
  /** Scheduled — Next date the On Hand Quantity should be counted. */
  inventory_date: string | false
  /** Difference — Indicates the gap between the product\'s theoretical quantity and its counted quantity. */
  inventory_diff_quantity: number | false
  /** Counted — The product\'s counted quantity. */
  inventory_quantity: number | false
  /** Inventoried Quantity */
  inventory_quantity_auto_apply: number | false
  /** Inventory Quantity Set */
  inventory_quantity_set: boolean
  /** Favorite */
  is_favorite: boolean
  /** Quantity has been moved since last count */
  is_outdated: boolean
  /** Last Count Date — Last time the Quantity was Updated */
  last_count_date: string | false
  /** Location */
  location_id: [number, string] /* stock.location */
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
  /** Properties */
  lot_properties: unknown | false
  /** On Hand */
  on_hand: boolean
  /** Owner — This is the owner of the quant */
  owner_id: [number, string] /* res.partner */ | false
  /** Package — The package containing this quant */
  package_id: [number, string] /* stock.package */ | false
  /** Product Category */
  product_categ_id: [number, string] /* product.category */ | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Unit — Default unit of measure used for all stock operations. */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity — Quantity of products in this quant, in the default unit of measure of the product */
  quantity: number | false
  /** Reserved Quantity — Quantity of reserved products in this quant, in the default unit of measure of the product */
  reserved_quantity: number
  /** Duplicated Serial Number — If the same SN is in another Quant */
  sn_duplicated: boolean
  /** Storage Category */
  storage_category_id: [number, string] /* stock.storage.category */ | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  tracking: 'serial' | 'lot' | 'none' | false
  /** Assigned To — User assigned to do product count. */
  user_id: [number, string] /* res.users */ | false
  /** Value */
  value: number | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.quant */
export type StockQuantFieldName = ModelFieldName<StockQuantRecord>

/** Typed search_read result */
export type StockQuantSearchResult = ModelRecord<StockQuantRecord>
