// Auto-generated from stock.package (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.package */
export interface StockPackageRecord extends BaseRecord {
  /** Package Reference */
  name: string
  /** Full Package Name */
  complete_name: string | false
  /** Package Name At Destination */
  dest_complete_name: string | false
  /** Bulk Content */
  quant_ids: number[] /* stock.quant */
  /** Contained Quant */
  contained_quant_ids: number[] /* stock.quant */
  /** Contents */
  content_description: string | false
  /** Package Type */
  package_type_id: [number, string] /* stock.package.type */ | false
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Destination location */
  location_dest_id: [number, string] /* stock.location */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Owner */
  owner_id: [number, string] /* res.partner */ | false
  /** Container */
  parent_package_id: [number, string] /* stock.package */ | false
  /** Contained Packages */
  child_package_ids: number[] /* stock.package */
  /** All Children Package */
  all_children_package_ids: number[] /* stock.package */
  /** Destination Container */
  package_dest_id: [number, string] /* stock.package */ | false
  /** Outermost Destination Container */
  outermost_package_id: [number, string] /* stock.package */ | false
  /** Assigned Contained Packages */
  child_package_dest_ids: number[] /* stock.package */
  /** Move Line */
  move_line_ids: number[] /* stock.move.line */
  /** Transfers — Transfers in which the Package is set as Destination Package */
  picking_ids: number[] /* stock.picking */ | false
  /** Shipping Weight — Total weight of the package. */
  shipping_weight: number | false
  /** Package name is valid SSCC */
  valid_sscc: boolean
  /** Pack Date */
  pack_date: string | false
  /** Parent Path */
  parent_path: string | false
  /** JSON data for popover widget */
  json_popover: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Weight — Total weight of all the products contained in the package. */
  weight: number | false
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Technical field indicating whether weight uom is kg or not (i.e. lb) */
  weight_is_kg: boolean
  /** Technical field indicating weight\'s number of decimal places */
  weight_uom_rounding: number | false
  /** Carrier */
  package_carrier_type: 'none' | false
}

/** Field names for stock.package */
export type StockPackageFieldName = ModelFieldName<StockPackageRecord>

/** Typed search_read result */
export type StockPackageSearchResult = ModelRecord<StockPackageRecord>
