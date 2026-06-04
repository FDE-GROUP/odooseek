// Auto-generated from account.cash.rounding (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.cash.rounding */
export interface AccountCashRoundingRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Loss Account */
  loss_account_id: [number, string] /* account.account */ | false
  /** Name */
  name: string
  /** Profit Account */
  profit_account_id: [number, string] /* account.account */ | false
  /** Rounding Precision — Represent the non-zero value smallest coinage (for example, 0.05). */
  rounding: number
  /** Rounding Method — The tie-breaking rule used for float rounding operations */
  rounding_method: 'UP' | 'DOWN' | 'HALF-UP'
  /** Rounding Strategy — Specify which way will be used to round the invoice amount to the rounding precision */
  strategy: 'biggest_tax' | 'add_invoice_line'
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.cash.rounding */
export type AccountCashRoundingFieldName = ModelFieldName<AccountCashRoundingRecord>

/** Typed search_read result */
export type AccountCashRoundingSearchResult = ModelRecord<AccountCashRoundingRecord>
