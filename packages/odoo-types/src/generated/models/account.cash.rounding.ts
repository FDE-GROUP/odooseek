// Auto-generated from account.cash.rounding (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.cash.rounding */
export interface AccountCashRoundingRecord extends BaseRecord {
  /** Name */
  name: string
  /** Rounding Precision — Represent the non-zero value smallest coinage (for example, 0.05). */
  rounding: number
  /** Rounding Strategy — Specify which way will be used to round the invoice amount to the rounding precision */
  strategy: 'biggest_tax' | 'add_invoice_line'
  /** Profit Account */
  profit_account_id: [number, string] /* account.account */ | false
  /** Loss Account */
  loss_account_id: [number, string] /* account.account */ | false
  /** Rounding Method — The tie-breaking rule used for float rounding operations */
  rounding_method: 'UP' | 'DOWN' | 'HALF-UP'
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for account.cash.rounding */
export type AccountCashRoundingFieldName = ModelFieldName<AccountCashRoundingRecord>

/** Typed search_read result */
export type AccountCashRoundingSearchResult = ModelRecord<AccountCashRoundingRecord>
