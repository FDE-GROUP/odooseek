// Auto-generated from uom.uom (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** uom.uom */
export interface UomUomRecord extends BaseRecord {
  /** Unit Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Contains — How much bigger or smaller this unit is compared to the reference UoM for this unit */
  relative_factor: number
  /** Rounding Precision */
  rounding: number | false
  /** Active — Uncheck the active field to disable a unit of measure without deleting it. */
  active: boolean
  /** Reference Unit */
  relative_uom_id: [number, string] /* uom.uom */ | false
  /** Related UoMs */
  related_uom_ids: number[] /* uom.uom */
  /** Absolute Quantity */
  factor: number | false
  /** Parent Path */
  parent_path: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Barcodes */
  product_uom_ids: number[] /* product.uom */
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Package Type */
  package_type_id: [number, string] /* stock.package.type */ | false
  /** Routes — Routes propagated from the package type */
  route_ids: number[] /* stock.route */ | false
}

/** Field names for uom.uom */
export type UomUomFieldName = ModelFieldName<UomUomRecord>

/** Typed search_read result */
export type UomUomSearchResult = ModelRecord<UomUomRecord>
