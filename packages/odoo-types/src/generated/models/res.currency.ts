// Auto-generated from res.currency (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** res.currency */
export interface ResCurrencyRecord extends BaseRecord {
  /** Currency — Currency Code (ISO 4217) */
  name: string
  /** Currency numeric code. — Currency Numeric Code (ISO 4217). */
  iso_numeric: number | false
  /** Name */
  full_name: string | false
  /** Symbol — Currency sign, to be used when printing amounts. */
  symbol: string
  /** Current Rate — The rate of the currency to the currency of rate 1. */
  rate: number | false
  /** Inverse Rate — The currency of rate 1 to the rate of the currency. */
  inverse_rate: number | false
  /** Rate String */
  rate_string: string | false
  /** Rates */
  rate_ids: number[] /* res.currency.rate */
  /** Rounding Factor — Amounts in this currency are rounded off to the nearest multiple of the rounding factor. */
  rounding: number | false
  /** Decimal Places — Decimal places taken into account for operations on amounts in this currency. It is determined by the rounding factor. */
  decimal_places: number | false
  /** Active */
  active: boolean
  /** Symbol Position — Determines where the currency symbol should be placed after or before the amount. */
  position: 'after' | 'before' | false
  /** Date */
  date: string | false
  /** Currency Unit */
  currency_unit_label: string | false
  /** Currency Subunit */
  currency_subunit_label: string | false
  /** Is Current Company Currency */
  is_current_company_currency: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Display Rounding Warning — The warning informs a rounding factor change might be dangerous on res.currency\'s form view. */
  display_rounding_warning: boolean
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
}

/** Field names for res.currency */
export type ResCurrencyFieldName = ModelFieldName<ResCurrencyRecord>

/** Typed search_read result */
export type ResCurrencySearchResult = ModelRecord<ResCurrencyRecord>
