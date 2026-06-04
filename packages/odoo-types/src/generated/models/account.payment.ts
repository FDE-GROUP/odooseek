// Auto-generated from account.payment (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.payment */
export interface AccountPaymentRecord extends BaseRecord {
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Is Follower */
  message_is_follower: boolean
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Has Message */
  has_message: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Main Attachment */
  message_main_attachment_id: [number, string] /* ir.attachment */ | false
  /** Number */
  name: string | false
  /** Date */
  date: string
  /** Journal Entry */
  move_id: [number, string] /* account.move */ | false
  /** Journal */
  journal_id: [number, string] /* account.journal */
  /** Company */
  company_id: [number, string] /* res.company */
  /** State */
  state: 'draft' | 'in_process' | 'paid' | 'canceled' | 'rejected'
  /** Is Reconciled */
  is_reconciled: boolean
  /** Is Matched With a Bank Statement */
  is_matched: boolean
  /** Is Sent */
  is_sent: boolean
  /** Available Partner Bank */
  available_partner_bank_ids: number[] /* res.partner.bank */ | false
  /** Recipient Bank Account */
  partner_bank_id: [number, string] /* res.partner.bank */ | false
  /** QR Code URL */
  qr_code: string | false
  /** Paired Internal Transfer Payment — When an internal transfer is posted, a paired payment is created. They are cross referenced through this field */
  paired_internal_transfer_payment_id: [number, string] /* account.payment */ | false
  /** Payment Method — Manual: Pay or Get paid by any method outside of Odoo.
Payment Providers: Each payment provider has its own Payment Method. Request a transaction on/to a card thanks to a payment token saved by the partner when buying or subscribing online.
Check: Pay bills by check and print it from Odoo.
Batch Deposit: Collect several customer checks at once generating and submitting a batch deposit to your bank. Module account_batch_payment is necessary.
SEPA Credit Transfer: Pay in the SEPA zone by submitting a SEPA Credit Transfer file to your bank. Module account_iso20022 is necessary.
SEPA Direct Debit: Get paid in the SEPA zone thanks to a mandate your partner will have granted to you. Module account_iso20022 is necessary.
U.S. ISO20022: Pay in the US by submitting an ISO20022 file to your bank. Module account_iso20022 is necessary.
 */
  payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Available Payment Method Line */
  available_payment_method_line_ids: number[] /* account.payment.method.line */ | false
  /** Method */
  payment_method_id: [number, string] /* account.payment.method */ | false
  /** Available Journal */
  available_journal_ids: number[] /* account.journal */ | false
  /** Amount */
  amount: number | false
  /** Payment Type */
  payment_type: 'outbound' | 'inbound'
  /** Partner Type */
  partner_type: 'customer' | 'supplier'
  /** Memo */
  memo: string | false
  /** Payment Reference — Reference of the document used to issue this payment. Eg. check number, file name, etc. */
  payment_reference: string | false
  /** Currency — The payment\'s currency. */
  currency_id: [number, string] /* res.currency */ | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Customer/Vendor */
  partner_id: [number, string] /* res.partner */ | false
  /** Outstanding Account */
  outstanding_account_id: [number, string] /* account.account */ | false
  /** Destination Account */
  destination_account_id: [number, string] /* account.account */ | false
  /** Invoices */
  invoice_ids: number[] /* account.move */ | false
  /** Reconciled Invoices — Invoices whose journal items have been reconciled with these payments. */
  reconciled_invoice_ids: number[] /* account.move */ | false
  /** # Reconciled Invoices */
  reconciled_invoices_count: number | false
  /** Reconciled Invoices Type */
  reconciled_invoices_type: 'credit_note' | 'invoice' | false
  /** Reconciled Bills — Invoices whose journal items have been reconciled with these payments. */
  reconciled_bill_ids: number[] /* account.move */ | false
  /** # Reconciled Bills */
  reconciled_bills_count: number | false
  /** Reconciled Statement Lines — Statements lines matched to this payment */
  reconciled_statement_line_ids: number[] /* account.bank.statement.line */ | false
  /** # Reconciled Statement Lines */
  reconciled_statement_lines_count: number | false
  /** Code */
  payment_method_code: string | false
  /** Payment Receipt Title */
  payment_receipt_title: string | false
  /** Need Cancel Request */
  need_cancel_request: boolean
  /** Show Partner Bank Account */
  show_partner_bank_account: boolean
  /** Require Partner Bank Account */
  require_partner_bank_account: boolean
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Amount Signed — Negative value of amount field if payment_type is outbound */
  amount_signed: number | false
  /** Amount Company Currency Signed */
  amount_company_currency_signed: number | false
  /** Duplicate Payment */
  duplicate_payment_ids: number[] /* account.payment */ | false
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Payment Transaction */
  payment_transaction_id: [number, string] /* payment.transaction */ | false
  /** Saved Payment Token — Note that only tokens from providers allowing to capture the amount are available. */
  payment_token_id: [number, string] /* payment.token */ | false
  /** Amount Available For Refund */
  amount_available_for_refund: number | false
  /** Suitable Payment Token */
  suitable_payment_token_ids: number[] /* payment.token */ | false
  /** Use Electronic Payment Method */
  use_electronic_payment_method: boolean
  /** Source Payment — The source payment of related refund payments */
  source_payment_id: [number, string] /* account.payment */ | false
  /** Refunds Count */
  refunds_count: number | false
  /** Is Donation */
  is_donation: boolean
  /** Expense */
  expense_ids: number[] /* hr.expense */
}

/** Field names for account.payment */
export type AccountPaymentFieldName = ModelFieldName<AccountPaymentRecord>

/** Typed search_read result */
export type AccountPaymentSearchResult = ModelRecord<AccountPaymentRecord>
