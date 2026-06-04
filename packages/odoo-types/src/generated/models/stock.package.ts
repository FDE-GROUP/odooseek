// Auto-generated from stock.package (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.package */
export interface StockPackageRecord extends BaseRecord {
  /** All Children Package */
  all_children_package_ids: number[] /* stock.package */
  /** Assigned Contained Packages */
  child_package_dest_ids: number[] /* stock.package */
  /** Contained Packages */
  child_package_ids: number[] /* stock.package */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Full Package Name */
  complete_name: string | false
  /** Contained Quant */
  contained_quant_ids: number[] /* stock.quant */
  /** Contents */
  content_description: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Package Name At Destination */
  dest_complete_name: string | false
  /** JSON data for popover widget */
  json_popover: string | false
  /** Destination location */
  location_dest_id: [number, string] /* stock.location */ | false
  /** Location */
  location_id: [number, string] /* stock.location */ | false
  /** Move Line */
  move_line_ids: number[] /* stock.move.line */
  /** Package Reference */
  name: string
  /** Outermost Destination Container */
  outermost_package_id: [number, string] /* stock.package */ | false
  /** Owner */
  owner_id: [number, string] /* res.partner */ | false
  /** Pack Date */
  pack_date: string | false
  /** Carrier */
  package_carrier_type: 'none' | false
  /** Destination Container */
  package_dest_id: [number, string] /* stock.package */ | false
  /** Package Type */
  package_type_id: [number, string] /* stock.package.type */ | false
  /** Container */
  parent_package_id: [number, string] /* stock.package */ | false
  /** Parent Path */
  parent_path: string | false
  /** Transfers — Transfers in which the Package is set as Destination Package */
  picking_ids: number[] /* stock.picking */ | false
  /** Bulk Content */
  quant_ids: number[] /* stock.quant */
  /** Shipping Weight — Total weight of the package. */
  shipping_weight: number | false
  /** Package name is valid SSCC */
  valid_sscc: boolean
  /** Weight — Total weight of all the products contained in the package. */
  weight: number | false
  /** Technical field indicating whether weight uom is kg or not (i.e. lb) */
  weight_is_kg: boolean
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Technical field indicating weight\'s number of decimal places */
  weight_uom_rounding: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.package */
export type StockPackageFieldName = ModelFieldName<StockPackageRecord>

/** Typed search_read result */
export type StockPackageSearchResult = ModelRecord<StockPackageRecord>
