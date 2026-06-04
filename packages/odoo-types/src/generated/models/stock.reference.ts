// Auto-generated from stock.reference (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.reference */
export interface StockReferenceRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Stock Moves */
  move_ids: number[] /* stock.move */ | false
  /** Reference */
  name: string
  /** Transfers */
  picking_ids: number[] /* stock.picking */ | false
  /** Productions */
  production_ids: number[] /* mrp.production */ | false
  /** Purchases */
  purchase_ids: number[] /* purchase.order */ | false
  /** Sales */
  sale_ids: number[] /* sale.order */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.reference */
export type StockReferenceFieldName = ModelFieldName<StockReferenceRecord>

/** Typed search_read result */
export type StockReferenceSearchResult = ModelRecord<StockReferenceRecord>
