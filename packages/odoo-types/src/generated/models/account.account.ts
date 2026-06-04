// Auto-generated from account.account (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.account */
export interface AccountAccountRecord extends BaseRecord {
  /** Expense Account — Counterpart used at closing for accounting adjustments to inventory valuation. */
  account_stock_expense_id: [number, string] /* account.account */ | false
  /** Variation Account — At closing, register the inventory variation of the period into a specific account */
  account_stock_variation_id: [number, string] /* account.account */ | false
  /** Type — Account Type is used for information purpose, to generate country-specific legal reports, and set the rules to close a fiscal year and generate opening entries. */
  account_type: 'asset_receivable' | 'asset_cash' | 'asset_current' | 'asset_non_current' | 'asset_prepayments' | 'asset_fixed' | 'liability_payable' | 'liability_credit_card' | 'liability_current' | 'liability_non_current' | 'equity' | 'equity_unaffected' | 'income' | 'income_other' | 'expense' | 'expense_other' | 'expense_depreciation' | 'expense_direct_cost' | 'off_balance'
  /** Active */
  active: boolean
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Code */
  code: string | false
  /** Code Mapping */
  code_mapping_ids: number[] /* account.code.mapping */
  /** Code Store */
  code_store: string | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Company Fiscal Country Code */
  company_fiscal_country_code: string | false
  /** Companies */
  company_ids: number[] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Account Currency — Forces all journal items in this account to have a specific currency (i.e. bank journals). If no currency is set, entries can use any currency. */
  currency_id: [number, string] /* res.currency */ | false
  /** Current Balance */
  current_balance: number | false
  /** Description */
  description: string | false
  /** Display Mapping Tab */
  display_mapping_tab: boolean
  /** Group — Account prefixes can determine account groups. */
  group_id: [number, string] /* account.group */ | false
  /** Has Message */
  has_message: boolean
  /** Bring Accounts Balance Forward — Used in reports to know if we should consider journal items from the beginning of time instead of from the fiscal year only. Account types that should be reset to zero at each new fiscal year (like expenses, revenue..) should not have this option set. */
  include_initial_balance: boolean
  /** Internal Group */
  internal_group: 'equity' | 'asset' | 'liability' | 'income' | 'expense' | 'off' | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Is Follower */
  message_is_follower: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Account Name */
  name: string
  /** Non Trade — If set, this account will belong to Non Trade Receivable/Payable in reports and filters.
If not, this account will belong to Trade Receivable/Payable in reports and filters. */
  non_trade: boolean
  /** Internal Notes */
  note: string | false
  /** Opening Balance */
  opening_balance: number | false
  /** Opening Credit */
  opening_credit: number | false
  /** Opening Debit */
  opening_debit: number | false
  /** Display code */
  placeholder_code: string | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Allow Reconciliation — Check this box if this account allows invoices & payments matching of journal items. */
  reconcile: boolean
  /** Related Taxes Amount */
  related_taxes_amount: number | false
  /** Root */
  root_id: [number, string] /* account.root */ | false
  /** Tags — Optional tags you may want to assign for custom reporting */
  tag_ids: number[] /* account.account.tag */ | false
  /** Default Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Used */
  used: boolean
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.account */
export type AccountAccountFieldName = ModelFieldName<AccountAccountRecord>

/** Typed search_read result */
export type AccountAccountSearchResult = ModelRecord<AccountAccountRecord>
