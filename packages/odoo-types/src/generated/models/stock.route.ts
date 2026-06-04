// Auto-generated from stock.route (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.route */
export interface StockRouteRecord extends BaseRecord {
  /** Route */
  name: string
  /** Active — If the active field is set to False, it will allow you to hide the route without removing it. */
  active: boolean
  /** Sequence */
  sequence: number | false
  /** Rules */
  rule_ids: number[] /* stock.rule */
  /** Applicable on Product — When checked, the route will be selectable in the Inventory tab of the Product form. */
  product_selectable: boolean
  /** Applicable on Product Category — When checked, the route will be selectable on the Product Category. */
  product_categ_selectable: boolean
  /** Applicable on Warehouse — When a warehouse is selected for this route, this route should be seen as the default route when products pass through this warehouse. */
  warehouse_selectable: boolean
  /** Applicable on Package Type — When checked, the route will be selectable on package types */
  package_type_selectable: boolean
  /** Supplied Warehouse */
  supplied_wh_id: [number, string] /* stock.warehouse */ | false
  /** Supplying Warehouse */
  supplier_wh_id: [number, string] /* stock.warehouse */ | false
  /** Company — Leave this field empty if this route is shared between all companies */
  company_id: [number, string] /* res.company */ | false
  /** Products */
  product_ids: number[] /* product.template */ | false
  /** Product Categories */
  categ_ids: number[] /* product.category */ | false
  /** Warehouse Domain */
  warehouse_domain_ids: number[] /* stock.warehouse */
  /** Warehouses */
  warehouse_ids: number[] /* stock.warehouse */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Selectable on Sales Order Line */
  sale_selectable: boolean
  /** Applicable on Shipping Methods */
  shipping_selectable: boolean
}

/** Field names for stock.route */
export type StockRouteFieldName = ModelFieldName<StockRouteRecord>

/** Typed search_read result */
export type StockRouteSearchResult = ModelRecord<StockRouteRecord>
