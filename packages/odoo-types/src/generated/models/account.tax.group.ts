// Auto-generated from account.tax.group (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.tax.group */
export interface AccountTaxGroupRecord extends BaseRecord {
  /** Tax Advance Account — Downpayments posted on this account will be considered by the Tax Closing Entry. */
  advance_tax_payment_account_id: [number, string] /* account.account */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Country — The country for which this tax group is applicable. */
  country_id: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Name */
  name: string
  /** PoS receipt label */
  pos_receipt_label: string | false
  /** Preceding Subtotal — If set, this value will be used on documents as the label of a subtotal excluding this tax group before displaying it. If not set, the tax group will be displayed after the \'Untaxed amount\' subtotal. */
  preceding_subtotal: string | false
  /** Sequence */
  sequence: number | false
  /** Tax Payable Account — Tax current account used as a counterpart to the Tax Closing Entry when in favor of the authorities. */
  tax_payable_account_id: [number, string] /* account.account */ | false
  /** Tax Receivable Account — Tax current account used as a counterpart to the Tax Closing Entry when in favor of the company. */
  tax_receivable_account_id: [number, string] /* account.account */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.tax.group */
export type AccountTaxGroupFieldName = ModelFieldName<AccountTaxGroupRecord>

/** Typed search_read result */
export type AccountTaxGroupSearchResult = ModelRecord<AccountTaxGroupRecord>
