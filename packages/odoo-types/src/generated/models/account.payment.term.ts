// Auto-generated from account.payment.term (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.payment.term */
export interface AccountPaymentTermRecord extends BaseRecord {
  /** Active — If the active field is set to False, it will allow you to hide the payment terms without removing it. */
  active: boolean
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Discount Days — Number of days before the early payment proposition expires */
  discount_days: number | false
  /** Discount % — Early Payment Discount granted for this payment term */
  discount_percentage: number | false
  /** Show installment dates */
  display_on_invoice: boolean
  /** Early Discount */
  early_discount: boolean
  /** Cash Discount Tax Reduction */
  early_pay_discount_computation: 'included' | 'excluded' | 'mixed' | false
  /** Example Amount */
  example_amount: number | false
  /** Date example */
  example_date: string | false
  /** Example Invalid */
  example_invalid: boolean
  /** Example Preview */
  example_preview: string | false
  /** Example Preview Discount */
  example_preview_discount: string | false
  /** Fiscal Country Codes */
  fiscal_country_codes: string | false
  /** Terms */
  line_ids: number[] /* account.payment.term.line */
  /** Payment Terms */
  name: string
  /** Description on the Invoice */
  note: string | false
  /** Sequence */
  sequence: number
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.payment.term */
export type AccountPaymentTermFieldName = ModelFieldName<AccountPaymentTermRecord>

/** Typed search_read result */
export type AccountPaymentTermSearchResult = ModelRecord<AccountPaymentTermRecord>
