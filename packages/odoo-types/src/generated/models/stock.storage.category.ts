// Auto-generated from stock.storage.category (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.storage.category */
export interface StockStorageCategoryRecord extends BaseRecord {
  /** Storage Category */
  name: string
  /** Max Weight */
  max_weight: number | false
  /** Capacity */
  capacity_ids: number[] /* stock.storage.category.capacity */
  /** Product Capacity */
  product_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Package Capacity */
  package_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Allow New Product */
  allow_new_product: 'empty' | 'same' | 'mixed'
  /** Location */
  location_ids: number[] /* stock.location */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Weight unit */
  weight_uom_name: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for stock.storage.category */
export type StockStorageCategoryFieldName = ModelFieldName<StockStorageCategoryRecord>

/** Typed search_read result */
export type StockStorageCategorySearchResult = ModelRecord<StockStorageCategoryRecord>
