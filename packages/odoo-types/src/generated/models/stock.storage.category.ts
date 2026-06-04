// Auto-generated from stock.storage.category (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.storage.category */
export interface StockStorageCategoryRecord extends BaseRecord {
  /** Allow New Product */
  allow_new_product: 'empty' | 'same' | 'mixed'
  /** Capacity */
  capacity_ids: number[] /* stock.storage.category.capacity */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Location */
  location_ids: number[] /* stock.location */
  /** Max Weight */
  max_weight: number | false
  /** Storage Category */
  name: string
  /** Package Capacity */
  package_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Product Capacity */
  product_capacity_ids: number[] /* stock.storage.category.capacity */
  /** Weight unit */
  weight_uom_name: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.storage.category */
export type StockStorageCategoryFieldName = ModelFieldName<StockStorageCategoryRecord>

/** Typed search_read result */
export type StockStorageCategorySearchResult = ModelRecord<StockStorageCategoryRecord>
