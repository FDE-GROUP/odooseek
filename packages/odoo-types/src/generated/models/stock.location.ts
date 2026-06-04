// Auto-generated from stock.location (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.location */
export interface StockLocationRecord extends BaseRecord {
  /** Active — By unchecking the active field, you may hide a location without deleting it. */
  active: boolean
  /** Barcode */
  barcode: string | false
  /** Contains */
  child_ids: number[] /* stock.location */
  /** Internal locations among descendants — This location (if it\'s internal) and all its descendants filtered by type=Internal. */
  child_internal_location_ids: number[] /* stock.location */ | false
  /** Company — Let this field empty if this location is shared between companies */
  company_id: [number, string] /* res.company */ | false
  /** Full Location Name */
  complete_name: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Inventory Frequency —  When different than 0, inventory count date for products stored at this location will be automatically set at the defined frequency. */
  cyclic_inventory_frequency: number | false
  /** Forecasted Weight */
  forecast_weight: number | false
  /** Incoming Move Line */
  incoming_move_line_ids: number[] /* stock.move.line */
  /** Is Empty */
  is_empty: boolean
  /** Is valued outside the company */
  is_valued_external: boolean
  /** Is valued inside the company */
  is_valued_internal: boolean
  /** Last Inventory — Date of the last inventory at this location. */
  last_inventory_date: string | false
  /** Parent Location — The parent location that includes this location. Example : The \'Dispatch Zone\' is the \'Gate 1\' parent location. */
  location_id: [number, string] /* stock.location */ | false
  /** Location Name */
  name: string
  /** Net Weight */
  net_weight: number | false
  /** Next Expected — Date for next planned inventory based on cyclic schedule. */
  next_inventory_date: string | false
  /** Outgoing Move Line */
  outgoing_move_line_ids: number[] /* stock.move.line */
  /** Parent Path */
  parent_path: string | false
  /** Putaway Rules */
  putaway_rule_ids: number[] /* stock.putaway.rule */
  /** Quant */
  quant_ids: number[] /* stock.quant */
  /** Removal Strategy — Defines the default method used for suggesting the exact location (shelf) where to take the products from, which lot etc. for this location. This method can be enforced at the product category level, and a fallback is made on the parent locations if none is set here.

FIFO: products/lots that were stocked first will be moved out first.
LIFO: products/lots that were stocked last will be moved out first.
Closest Location: products/lots closest to the target location will be moved out first.
Least Packages: products/lots that were stocked in package with least amount of qty will be moved out first.
FEFO: products/lots with the closest removal date will be moved out first (the availability of this method depends on the "Expiration Dates" setting). */
  removal_strategy_id: [number, string] /* product.removal */ | false
  /** Replenishments — Trigger replenishment suggestions for this location when required */
  replenish_location: boolean
  /** Storage Category */
  storage_category_id: [number, string] /* stock.storage.category */ | false
  /** Location Type — * Vendor: Virtual location representing the source location for products coming from your vendors
* Virtual: Virtual location used to create a hierarchical structure for your warehouse by aggregating its child locations. Can\'t directly contain products
* Internal: Physical locations inside your warehouses,
* Customer: Virtual location representing the destination location for products sent to your customers
* Inventory Loss: Virtual location serving as the counterpart for inventory operations done to correct stock levels (Physical inventories)
* Production: Virtual counterpart location for production operations. I.e. This location consumes components and produces finished products
* Transit: Counterpart location that should be used for inter-company or inter-warehouses operations */
  usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit'
  /** Stock Valuation Account — Expense account used to re-qualify products removed from stock and sent to this location */
  valuation_account_id: [number, string] /* account.account */ | false
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Warehouse View */
  warehouse_view_ids: number[] /* stock.warehouse */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.location */
export type StockLocationFieldName = ModelFieldName<StockLocationRecord>

/** Typed search_read result */
export type StockLocationSearchResult = ModelRecord<StockLocationRecord>
