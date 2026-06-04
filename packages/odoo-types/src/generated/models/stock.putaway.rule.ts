// Auto-generated from stock.putaway.rule (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.putaway.rule */
export interface StockPutawayRuleRecord extends BaseRecord {
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Product Category */
  category_id: [number, string] /* product.category */ | false
  /** When product arrives in */
  location_in_id: [number, string] /* stock.location */
  /** Store to sublocation */
  location_out_id: [number, string] /* stock.location */
  /** Priority — Give to the more specialized category, a higher priority to have them in top of the list. */
  sequence: number | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Package Type */
  package_type_ids: number[] /* stock.package.type */ | false
  /** Storage Category */
  storage_category_id: [number, string] /* stock.storage.category */ | false
  /** Active */
  active: boolean
  /** Sublocation */
  sublocation: 'no' | 'last_used' | 'closest_location' | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for stock.putaway.rule */
export type StockPutawayRuleFieldName = ModelFieldName<StockPutawayRuleRecord>

/** Typed search_read result */
export type StockPutawayRuleSearchResult = ModelRecord<StockPutawayRuleRecord>
