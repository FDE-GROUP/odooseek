// Auto-generated from stock.warehouse.orderpoint (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.warehouse.orderpoint */
export interface StockWarehouseOrderpointRecord extends BaseRecord {
  /** Active — If the active field is set to False, it will allow you to hide the orderpoint without removing it. */
  active: boolean
  /** Allowed Location */
  allowed_location_ids: number[] /* stock.location */
  /** Allowed Replenishment Uom */
  allowed_replenishment_uom_ids: number[] /* uom.uom */ | false
  /** Available Vendor — Any vendor on the product\'s pricelist */
  available_vendor: [number, string] /* res.partner */ | false
  /** Bill of Materials */
  bom_id: [number, string] /* mrp.bom */ | false
  /** Bom Id Placeholder */
  bom_id_placeholder: string | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Days To Order — Numbers of days  in advance that replenishments demands are created. */
  days_to_order: number | false
  /** Deadline — Date before which you should order to avoid falling below the minimum. If you have nothing to order while a deadline is found, it may be because a future arrival is expected after the minimum quantity is reached (potential stockout). Check the Forecast Report. */
  deadline_date: string | false
  /** Effective Bill of Materials — Either the Bill of Materials set directly or the one computed to be used by this replenishment */
  effective_bom_id: [number, string] /* mrp.bom */ | false
  /** Effective Route — Either the route set directly or the one computed to be used by this replenishment */
  effective_route_id: [number, string] /* stock.route */ | false
  /** Effective Vendor — Either the vendor set directly or the one computed to be used by this replenishment */
  effective_vendor_id: [number, string] /* res.partner */ | false
  /** Lead Days */
  lead_days: number | false
  /** Lead Horizon Date */
  lead_horizon_date: string | false
  /** Location */
  location_id: [number, string] /* stock.location */
  /** Name */
  name: string
  /** Product Category */
  product_category_id: [number, string] /* product.category */ | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Max Quantity — Stock level to reach when replenishing. */
  product_max_qty: number
  /** Min Quantity — The minimum Stock level that will trigger a replenishment. */
  product_min_qty: number
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Unit — Default unit of measure used for all stock operations. */
  product_uom: [number, string] /* uom.uom */ | false
  /** Product unit of measure label */
  product_uom_name: string | false
  /** Forecast */
  qty_forecast: number | false
  /** On Hand */
  qty_on_hand: number | false
  /** To Order */
  qty_to_order: number | false
  /** To Order Computed */
  qty_to_order_computed: number | false
  /** To Order Manual */
  qty_to_order_manual: number | false
  /** Multiple — The procurement quantity will be rounded up to a multiple of this unit/packaging. If it is not set, it is not rounded. */
  replenishment_uom_id: [number, string] /* uom.uom */ | false
  /** Replenishment Uom Id Placeholder */
  replenishment_uom_id_placeholder: string | false
  /** Route */
  route_id: [number, string] /* stock.route */ | false
  /** Route Id Placeholder */
  route_id_placeholder: string | false
  /** Rules used */
  rule_ids: number[] /* stock.rule */ | false
  /** Show BoM column */
  show_bom: boolean
  /** Show supplier column */
  show_supplier: boolean
  /** Show Supply Warning */
  show_supply_warning: boolean
  /** Snoozed — Hidden until next scheduler. */
  snoozed_until: string | false
  /** Vendor Pricelist */
  supplier_id: [number, string] /* product.supplierinfo */ | false
  /** Supplier Id Placeholder */
  supplier_id_placeholder: string | false
  /** Trigger */
  trigger: 'auto' | 'manual'
  /** Unwanted Replenish */
  unwanted_replenish: boolean
  /** Vendors */
  vendor_ids: number[] /* product.supplierinfo */
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.warehouse.orderpoint */
export type StockWarehouseOrderpointFieldName = ModelFieldName<StockWarehouseOrderpointRecord>

/** Typed search_read result */
export type StockWarehouseOrderpointSearchResult = ModelRecord<StockWarehouseOrderpointRecord>
