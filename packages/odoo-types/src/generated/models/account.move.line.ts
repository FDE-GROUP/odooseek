// Auto-generated from account.move.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.move.line */
export interface AccountMoveLineRecord extends BaseRecord {
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic Precision */
  analytic_precision: number | false
  /** Distribution Analytic Account */
  distribution_analytic_account_ids: number[] /* account.analytic.account */ | false
  /** Journal Entry */
  move_id: [number, string] /* account.move */
  /** Journal */
  journal_id: [number, string] /* account.journal */ | false
  /** Ledger */
  journal_group_id: [number, string] /* account.journal.group */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Number */
  move_name: string | false
  /** Status */
  parent_state: 'draft' | 'posted' | 'cancel' | false
  /** Date */
  date: string | false
  /** Invoice/Bill Date */
  invoice_date: string | false
  /** Reference */
  ref: string | false
  /** Company Storno Accounting — Utility field to express whether the journal item is subject to storno accounting */
  is_storno: boolean
  /** Sequence */
  sequence: number | false
  /** Type */
  move_type: 'entry' | 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund' | 'out_receipt' | 'in_receipt' | false
  /** Account */
  account_id: [number, string] /* account.account */ | false
  /** Account Name */
  account_name: string | false
  /** Code */
  account_code: string | false
  /** Search Account */
  search_account_id: [number, string] /* account.account */ | false
  /** Label */
  name: string | false
  /** Translated Product Name */
  translated_product_name: string | false
  /** Debit */
  debit: number | false
  /** Credit */
  credit: number | false
  /** Balance */
  balance: number | false
  /** Cumulated Balance — Cumulated balance depending on the domain and the order chosen in the view. */
  cumulated_balance: number | false
  /** Currency Rate — Currency rate from company currency to document currency. */
  currency_rate: number | false
  /** Amount in Currency — The amount expressed in an optional other currency if it is a multi-currency entry. */
  amount_currency: number | false
  /** Currency */
  currency_id: [number, string] /* res.currency */
  /** Is Same Currency */
  is_same_currency: boolean
  /** Partner */
  partner_id: [number, string] /* res.partner */ | false
  /** Is Imported */
  is_imported: boolean
  /** Reconciliation Model */
  reconcile_model_id: [number, string] /* account.reconcile.model */ | false
  /** Originator Payment — The payment that created this entry */
  payment_id: [number, string] /* account.payment */ | false
  /** Originator Statement Line — The statement line that created this entry */
  statement_line_id: [number, string] /* account.bank.statement.line */ | false
  /** Statement — The bank statement used for bank reconciliation */
  statement_id: [number, string] /* account.bank.statement */ | false
  /** Commercial Partner Country */
  commercial_partner_country: [number, string] /* res.country */ | false
  /** Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Originator Group of Taxes */
  group_tax_id: [number, string] /* account.tax */ | false
  /** Originator Tax — Indicates that this journal item is a tax line */
  tax_line_id: [number, string] /* account.tax */ | false
  /** Originator tax group */
  tax_group_id: [number, string] /* account.tax.group */ | false
  /** Base Amount */
  tax_base_amount: number | false
  /** Originator Tax Distribution Line — Tax distribution line that caused the creation of this move line, if any */
  tax_repartition_line_id: [number, string] /* account.tax.repartition.line */ | false
  /** Tags — Tags assigned to this line by the tax creating it, if any. It determines its impact on financial reports. */
  tax_tag_ids: number[] /* account.account.tag */ | false
  /** Extra Tax Data */
  extra_tax_data: unknown | false
  /** Residual Amount — The residual amount on a journal item expressed in the company currency. */
  amount_residual: number | false
  /** Residual Amount in Currency — The residual amount on a journal item expressed in its currency (possibly not the company currency). */
  amount_residual_currency: number | false
  /** Reconciled */
  reconciled: boolean
  /** Matching */
  full_reconcile_id: [number, string] /* account.full.reconcile */ | false
  /** Matched Debits — Debit journal items that are matched with this journal item. */
  matched_debit_ids: number[] /* account.partial.reconcile */
  /** Matched Credits — Credit journal items that are matched with this journal item. */
  matched_credit_ids: number[] /* account.partial.reconcile */
  /** Reconciled Lines */
  reconciled_lines_ids: number[] /* account.move.line */ | false
  /** Reconciled Lines Excluding Exchange Diff */
  reconciled_lines_excluding_exchange_diff_ids: number[] /* account.move.line */ | false
  /** Matching # — Matching number for this line, \'P\' if it is only partially reconcile, or the name of the full reconcile if it exists. */
  matching_number: string | false
  /** Account Reconcile — Check this box if this account allows invoices & payments matching of journal items. */
  is_account_reconcile: boolean
  /** Internal Type — Account Type is used for information purpose, to generate country-specific legal reports, and set the rules to close a fiscal year and generate opening entries. */
  account_type: 'asset_receivable' | 'asset_cash' | 'asset_current' | 'asset_non_current' | 'asset_prepayments' | 'asset_fixed' | 'liability_payable' | 'liability_credit_card' | 'liability_current' | 'liability_non_current' | 'equity' | 'equity_unaffected' | 'income' | 'income_other' | 'expense' | 'expense_other' | 'expense_depreciation' | 'expense_direct_cost' | 'off_balance' | false
  /** Internal Group */
  account_internal_group: 'equity' | 'asset' | 'liability' | 'income' | 'expense' | 'off' | false
  /** Account Root */
  account_root_id: [number, string] /* account.root */ | false
  /** Product Category */
  product_category_id: [number, string] /* product.category */ | false
  /** Display Type */
  display_type: 'product' | 'cogs' | 'tax' | 'discount' | 'rounding' | 'payment_term' | 'line_section' | 'line_subsection' | 'line_note' | 'epd' | 'non_deductible_product_total' | 'non_deductible_product' | 'non_deductible_tax'
  /** Hide Composition — If checked, the lines below this section will not be displayed in reports and portal. */
  collapse_composition: boolean
  /** Hide Prices — If checked, the prices of the lines below this section will not be displayed in reports and portal. */
  collapse_prices: boolean
  /** Parent Section Line */
  parent_id: [number, string] /* account.move.line */ | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity — The optional quantity expressed by this line, eg: number of product sold. The quantity is not a legal requirement but is very useful for some reports. */
  quantity: number | false
  /** Due Date — This field is used for payable and receivable journal entries. You can put the limit date for the payment of this line. */
  date_maturity: string | false
  /** Unit Price */
  price_unit: number | false
  /** Subtotal */
  price_subtotal: number | false
  /** Total */
  price_total: number | false
  /** Discount (%) */
  discount: number | false
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Deductibility */
  deductible_amount: number | false
  /** Term Key */
  term_key: string | false
  /** Epd Key */
  epd_key: string | false
  /** Epd Needed */
  epd_needed: string | false
  /** Epd Dirty */
  epd_dirty: boolean
  /** Discount Allocation Key */
  discount_allocation_key: string | false
  /** Discount Allocation Needed */
  discount_allocation_needed: string | false
  /** Discount Allocation Dirty */
  discount_allocation_dirty: boolean
  /** Analytic lines */
  analytic_line_ids: number[] /* account.analytic.line */
  /** Has Invalid Analytics */
  has_invalid_analytics: boolean
  /** Discount Date — Last date at which the discounted amount must be paid in order for the Early Payment Discount to be granted */
  discount_date: string | false
  /** Discount amount in Currency */
  discount_amount_currency: number | false
  /** Discount Balance */
  discount_balance: number | false
  /** Next Payment Date */
  payment_date: string | false
  /** Is Refund */
  is_refund: boolean
  /** No Follow-Up — Exclude this journal item from follow-up reports. */
  no_followup: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Is Downpayment */
  is_downpayment: boolean
  /** Purchase Order Line */
  purchase_line_id: [number, string] /* purchase.order.line */ | false
  /** Purchase Order */
  purchase_order_id: [number, string] /* purchase.order */ | false
  /** Purchase Line Warn Msg */
  purchase_line_warn_msg: string | false
  /** Cogs Origin */
  cogs_origin_id: [number, string] /* account.move.line */ | false
  /** Sales Order Lines */
  sale_line_ids: number[] /* sale.order.line */ | false
  /** Sale Line Warn Msg */
  sale_line_warn_msg: string | false
  /** Expense */
  expense_id: [number, string] /* hr.expense */ | false
}

/** Field names for account.move.line */
export type AccountMoveLineFieldName = ModelFieldName<AccountMoveLineRecord>

/** Typed search_read result */
export type AccountMoveLineSearchResult = ModelRecord<AccountMoveLineRecord>
