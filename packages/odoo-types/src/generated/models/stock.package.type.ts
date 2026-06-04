// Auto-generated from stock.package.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.package.type */
export interface StockPackageTypeRecord extends BaseRecord {
  /** Barcode */
  barcode: string | false
  /** Weight — Weight of the package type */
  base_weight: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Has Contents */
  has_quants: boolean
  /** Height — Packaging Height */
  height: number | false
  /** Length unit of measure label */
  length_uom_name: string | false
  /** Max Weight — Maximum weight shippable in this packaging */
  max_weight: number | false
  /** Package Type */
  name: string
  /** Carrier */
  package_carrier_type: 'none' | false
  /** Package Use — Reusable boxes are used for batch picking and emptied afterwards to be reused. In the barcode application, scanning a reusable box will add the products in this box.
        Disposable boxes aren\'t reused, when scanning a disposable box in the barcode application, the contained products are added to the transfer. */
  package_use: 'disposable' | 'reusable'
  /** Length — Packaging Length */
  packaging_length: number | false
  /** Routes */
  route_ids: number[] /* stock.route */ | false
  /** Sequence — The first in the sequence is the default one. */
  sequence: number | false
  /** Sequence Prefix */
  sequence_code: string | false
  /** Reference Sequence */
  sequence_id: [number, string] /* ir.sequence */ | false
  /** Carrier Code */
  shipper_package_code: string | false
  /** Storage Category Capacity */
  storage_category_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Width — Packaging Width */
  width: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.package.type */
export type StockPackageTypeFieldName = ModelFieldName<StockPackageTypeRecord>

/** Typed search_read result */
export type StockPackageTypeSearchResult = ModelRecord<StockPackageTypeRecord>
