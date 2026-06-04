// Auto-generated from res.currency (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** res.currency */
export interface ResCurrencyRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency Subunit */
  currency_subunit_label: string | false
  /** Currency Unit */
  currency_unit_label: string | false
  /** Date */
  date: string | false
  /** Decimal Places — Decimal places taken into account for operations on amounts in this currency. It is determined by the rounding factor. */
  decimal_places: number | false
  /** Display Rounding Warning — The warning informs a rounding factor change might be dangerous on res.currency\'s form view. */
  display_rounding_warning: boolean
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Name */
  full_name: string | false
  /** Inverse Rate — The currency of rate 1 to the rate of the currency. */
  inverse_rate: number | false
  /** Is Current Company Currency */
  is_current_company_currency: boolean
  /** Currency numeric code. — Currency Numeric Code (ISO 4217). */
  iso_numeric: number | false
  /** Currency — Currency Code (ISO 4217) */
  name: string
  /** Symbol Position — Determines where the currency symbol should be placed after or before the amount. */
  position: 'after' | 'before' | false
  /** Current Rate — The rate of the currency to the currency of rate 1. */
  rate: number | false
  /** Rates */
  rate_ids: number[] /* res.currency.rate */
  /** Rate String */
  rate_string: string | false
  /** Rounding Factor — Amounts in this currency are rounded off to the nearest multiple of the rounding factor. */
  rounding: number | false
  /** Symbol — Currency sign, to be used when printing amounts. */
  symbol: string
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for res.currency */
export type ResCurrencyFieldName = ModelFieldName<ResCurrencyRecord>

/** Typed search_read result */
export type ResCurrencySearchResult = ModelRecord<ResCurrencyRecord>
