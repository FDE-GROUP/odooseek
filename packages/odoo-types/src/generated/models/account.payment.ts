// Auto-generated from account.payment (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.payment */
export interface AccountPaymentRecord extends BaseRecord {
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
  /** Amount */
  amount: number | false
  /** Amount Available For Refund */
  amount_available_for_refund: number | false
  /** Amount Company Currency Signed */
  amount_company_currency_signed: number | false
  /** Amount Signed — Negative value of amount field if payment_type is outbound */
  amount_signed: number | false
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */
  /** Available Journal */
  available_journal_ids: number[] /* account.journal */ | false
  /** Available Partner Bank */
  available_partner_bank_ids: number[] /* res.partner.bank */ | false
  /** Available Payment Method Line */
  available_payment_method_line_ids: number[] /* account.payment.method.line */ | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency — The payment\'s currency. */
  currency_id: [number, string] /* res.currency */ | false
  /** Date */
  date: string
  /** Destination Account */
  destination_account_id: [number, string] /* account.account */ | false
  /** Duplicate Payment */
  duplicate_payment_ids: number[] /* account.payment */ | false
  /** Expense */
  expense_ids: number[] /* hr.expense */
  /** Has Message */
  has_message: boolean
  /** Invoices */
  invoice_ids: number[] /* account.move */ | false
  /** Is Donation */
  is_donation: boolean
  /** Is Matched With a Bank Statement */
  is_matched: boolean
  /** Is Reconciled */
  is_reconciled: boolean
  /** Is Sent */
  is_sent: boolean
  /** Journal */
  journal_id: [number, string] /* account.journal */
  /** Memo */
  memo: string | false
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
  /** Main Attachment */
  message_main_attachment_id: [number, string] /* ir.attachment */ | false
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Journal Entry */
  move_id: [number, string] /* account.move */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Number */
  name: string | false
  /** Need Cancel Request */
  need_cancel_request: boolean
  /** Outstanding Account */
  outstanding_account_id: [number, string] /* account.account */ | false
  /** Paired Internal Transfer Payment — When an internal transfer is posted, a paired payment is created. They are cross referenced through this field */
  paired_internal_transfer_payment_id: [number, string] /* account.payment */ | false
  /** Recipient Bank Account */
  partner_bank_id: [number, string] /* res.partner.bank */ | false
  /** Customer/Vendor */
  partner_id: [number, string] /* res.partner */ | false
  /** Partner Type */
  partner_type: 'customer' | 'supplier'
  /** Code */
  payment_method_code: string | false
  /** Method */
  payment_method_id: [number, string] /* account.payment.method */ | false
  /** Payment Method — Manual: Pay or Get paid by any method outside of Odoo.
Payment Providers: Each payment provider has its own Payment Method. Request a transaction on/to a card thanks to a payment token saved by the partner when buying or subscribing online.
Check: Pay bills by check and print it from Odoo.
Batch Deposit: Collect several customer checks at once generating and submitting a batch deposit to your bank. Module account_batch_payment is necessary.
SEPA Credit Transfer: Pay in the SEPA zone by submitting a SEPA Credit Transfer file to your bank. Module account_iso20022 is necessary.
SEPA Direct Debit: Get paid in the SEPA zone thanks to a mandate your partner will have granted to you. Module account_iso20022 is necessary.
U.S. ISO20022: Pay in the US by submitting an ISO20022 file to your bank. Module account_iso20022 is necessary.
 */
  payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Payment Receipt Title */
  payment_receipt_title: string | false
  /** Payment Reference — Reference of the document used to issue this payment. Eg. check number, file name, etc. */
  payment_reference: string | false
  /** Saved Payment Token — Note that only tokens from providers allowing to capture the amount are available. */
  payment_token_id: [number, string] /* payment.token */ | false
  /** Payment Transaction */
  payment_transaction_id: [number, string] /* payment.transaction */ | false
  /** Payment Type */
  payment_type: 'outbound' | 'inbound'
  /** QR Code URL */
  qr_code: string | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Reconciled Bills — Invoices whose journal items have been reconciled with these payments. */
  reconciled_bill_ids: number[] /* account.move */ | false
  /** # Reconciled Bills */
  reconciled_bills_count: number | false
  /** Reconciled Invoices — Invoices whose journal items have been reconciled with these payments. */
  reconciled_invoice_ids: number[] /* account.move */ | false
  /** # Reconciled Invoices */
  reconciled_invoices_count: number | false
  /** Reconciled Invoices Type */
  reconciled_invoices_type: 'credit_note' | 'invoice' | false
  /** Reconciled Statement Lines — Statements lines matched to this payment */
  reconciled_statement_line_ids: number[] /* account.bank.statement.line */ | false
  /** # Reconciled Statement Lines */
  reconciled_statement_lines_count: number | false
  /** Refunds Count */
  refunds_count: number | false
  /** Require Partner Bank Account */
  require_partner_bank_account: boolean
  /** Show Partner Bank Account */
  show_partner_bank_account: boolean
  /** Source Payment — The source payment of related refund payments */
  source_payment_id: [number, string] /* account.payment */ | false
  /** State */
  state: 'draft' | 'in_process' | 'paid' | 'canceled' | 'rejected'
  /** Suitable Payment Token */
  suitable_payment_token_ids: number[] /* payment.token */ | false
  /** Use Electronic Payment Method */
  use_electronic_payment_method: boolean
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.payment */
export type AccountPaymentFieldName = ModelFieldName<AccountPaymentRecord>

/** Typed search_read result */
export type AccountPaymentSearchResult = ModelRecord<AccountPaymentRecord>
