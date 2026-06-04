// Auto-generated from stock.route (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.route */
export interface StockRouteRecord extends BaseRecord {
  /** Active — If the active field is set to False, it will allow you to hide the route without removing it. */
  active: boolean
  /** Product Categories */
  categ_ids: number[] /* product.category */ | false
  /** Company — Leave this field empty if this route is shared between all companies */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Route */
  name: string
  /** Applicable on Package Type — When checked, the route will be selectable on package types */
  package_type_selectable: boolean
  /** Applicable on Product Category — When checked, the route will be selectable on the Product Category. */
  product_categ_selectable: boolean
  /** Products */
  product_ids: number[] /* product.template */ | false
  /** Applicable on Product — When checked, the route will be selectable in the Inventory tab of the Product form. */
  product_selectable: boolean
  /** Rules */
  rule_ids: number[] /* stock.rule */
  /** Selectable on Sales Order Line */
  sale_selectable: boolean
  /** Sequence */
  sequence: number | false
  /** Applicable on Shipping Methods */
  shipping_selectable: boolean
  /** Supplied Warehouse */
  supplied_wh_id: [number, string] /* stock.warehouse */ | false
  /** Supplying Warehouse */
  supplier_wh_id: [number, string] /* stock.warehouse */ | false
  /** Warehouse Domain */
  warehouse_domain_ids: number[] /* stock.warehouse */
  /** Warehouses */
  warehouse_ids: number[] /* stock.warehouse */ | false
  /** Applicable on Warehouse — When a warehouse is selected for this route, this route should be seen as the default route when products pass through this warehouse. */
  warehouse_selectable: boolean
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.route */
export type StockRouteFieldName = ModelFieldName<StockRouteRecord>

/** Typed search_read result */
export type StockRouteSearchResult = ModelRecord<StockRouteRecord>
