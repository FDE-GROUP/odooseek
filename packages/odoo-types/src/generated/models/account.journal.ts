// Auto-generated from account.journal (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.journal */
export interface AccountJournalRecord extends BaseRecord {
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
  /** Alias */
  alias_id: [number, string] /* mail.alias */ | false
  /** Alias Name — Send one separate email for each invoice.
Any file extension will be accepted.
Only PDF and XML files will be interpreted by Odoo */
  alias_name: string | false
  /** Alias Domain */
  alias_domain_id: [number, string] /* mail.alias.domain */ | false
  /** Alias Domain Name — Email domain e.g. \'example.com\' in \'odoo@example.com\' */
  alias_domain: string | false
  /** Default Values — A Python dictionary that will be evaluated to provide default values when creating new records for this alias. */
  alias_defaults: string | false
  /** Email Alias */
  alias_email: string | false
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Security Token */
  access_token: string | false
  /** Access warning */
  access_warning: string | false
  /** Journal Name */
  name: string
  /** Name Placeholder */
  name_placeholder: string | false
  /** Sequence Prefix — Shorter name used for display. The journal entries of this journal will also be named using this prefix by default. */
  code: string
  /** Active — Set active to false to hide the Journal without removing it. */
  active: boolean
  /** Type — 
        Select \'Sale\' for customer invoices journals.
        Select \'Purchase\' for vendor bills journals.
        Select \'Cash\', \'Bank\' or \'Credit Card\' for journals that are used in customer or vendor payments.
        Select \'General\' for miscellaneous operations journals.
         */
  _type: 'sale' | 'purchase' | 'cash' | 'bank' | 'credit' | 'general'
  /** Self Billing — This journal is for self-billing invoices. Invoices will be created using a different sequence per partner. */
  is_self_billing: boolean
  /** Default Account Type */
  default_account_type: string | false
  /** Default Account */
  default_account_id: [number, string] /* account.account */ | false
  /** Suspense Account — Bank statements transactions will be posted on the suspense account until the final reconciliation allowing finding the right account. */
  suspense_account_id: [number, string] /* account.account */ | false
  /** Private Share Account — Account used to register the private part of mixed expenses. */
  non_deductible_account_id: [number, string] /* account.account */ | false
  /** Secure Posted Entries with Hash — If ticked, when an entry is posted, we retroactively hash all moves in the sequence from the entry back to the last hashed entry. The hash can also be performed on demand by the Secure Entries wizard. */
  restrict_mode_hash_table: boolean
  /** Sequence — Used to order Journals in the dashboard view */
  sequence: number | false
  /** Communication Type — You can set here the default communication that will appear on customer invoices, once validated, to help the customer to refer to that particular invoice when making the payment. */
  invoice_reference_type: 'partner' | 'invoice'
  /** Communication Standard — You can choose different models for each type of reference. The default one is the Odoo reference. */
  invoice_reference_model: 'odoo' | 'euro' | 'number'
  /** Currency — The currency used to enter statement */
  currency_id: [number, string] /* res.currency */ | false
  /** Company — Company related to this journal */
  company_id: [number, string] /* res.company */
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Account Fiscal Country Group Codes */
  account_fiscal_country_group_codes: unknown | false
  /** Dedicated Credit Note Sequence — Check this box if you don\'t want to share the same sequence for invoices and credit notes made from this journal */
  refund_sequence: boolean
  /** Dedicated Payment Sequence — Check this box if you don\'t want to share the same sequence on payments and bank transactions posted on this journal */
  payment_sequence: boolean
  /** Invoice report */
  invoice_template_pdf_report_id: [number, string] /* ir.actions.report */ | false
  /** Available Invoice Template Pdf Report */
  available_invoice_template_pdf_report_ids: number[] /* ir.actions.report */
  /** Display Invoice Template Pdf Report */
  display_invoice_template_pdf_report_id: boolean
  /** Sequence Override Regex — Technical field used to enforce complex sequence composition that the system would normally misunderstand.
This is a regex that can include all the following capture groups: prefix1, year, prefix2, month, prefix3, seq, suffix.
The prefix* groups are the separators between the year, month and the actual increasing sequence number (seq).
e.g: ^(?P<prefix1>.*?)(?P<year>\\d{4})(?P<prefix2>\\D*?)(?P<month>\\d{2})(?P<prefix3>\\D+?)(?P<seq>\\d+)(?P<suffix>\\D*?)$ */
  sequence_override_regex: string | false
  /** Inbound Payment Methods — Manual: Get paid by any method outside of Odoo.
Payment Providers: Each payment provider has its own Payment Method. Request a transaction on/to a card thanks to a payment token saved by the partner when buying or subscribing online.
Batch Deposit: Collect several customer checks at once generating and submitting a batch deposit to your bank. Module account_batch_payment is necessary.
SEPA Direct Debit: Get paid in the SEPA zone thanks to a mandate your partner will have granted to you. Module account_sepa is necessary.
 */
  inbound_payment_method_line_ids: number[] /* account.payment.method.line */
  /** Outbound Payment Methods — Manual: Pay by any method outside of Odoo.
Check: Pay bills by check and print it from Odoo.
SEPA Credit Transfer: Pay in the SEPA zone by submitting a SEPA Credit Transfer file to your bank. Module account_sepa is necessary.
 */
  outbound_payment_method_line_ids: number[] /* account.payment.method.line */
  /** Profit Account — Used to register a profit when the ending balance of a cash register differs from what the system computes */
  profit_account_id: [number, string] /* account.account */ | false
  /** Loss Account — Used to register a loss when the ending balance of a cash register differs from what the system computes */
  loss_account_id: [number, string] /* account.account */ | false
  /** Account Holder */
  company_partner_id: [number, string] /* res.partner */ | false
  /** Bank Account */
  bank_account_id: [number, string] /* res.partner.bank */ | false
  /** Bank Feeds — Defines how the bank statements will be registered */
  bank_statements_source: 'undefined' | false
  /** Account Number */
  bank_acc_number: string | false
  /** Bank */
  bank_id: [number, string] /* res.bank */ | false
  /** Ledger Group */
  journal_group_ids: number[] /* account.journal.group */ | false
  /** Available Payment Method */
  available_payment_method_ids: number[] /* account.payment.method */ | false
  /** Selected Payment Method Codes */
  selected_payment_method_codes: string | false
  /** Accounting Date */
  accounting_date: string | false
  /** Display Alias Fields */
  display_alias_fields: boolean
  /** Has Invalid Statements */
  has_invalid_statements: boolean
  /** Show E-Invoice Buttons */
  show_fetch_in_einvoices_button: boolean
  /** Show E-Invoice Status Buttons */
  show_refresh_out_einvoices_status_button: boolean
  /** Send Copy To — Email addresses that will receive copy for sent and received invoices. Separate entries with \';\'. */
  incoming_einvoice_notification_email: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Kanban Dashboard */
  kanban_dashboard: string | false
  /** Kanban Dashboard Graph */
  kanban_dashboard_graph: string | false
  /** Json Activity Data */
  json_activity_data: string | false
  /** Show journal on dashboard — Whether this journal should be displayed on the dashboard or not */
  show_on_dashboard: boolean
  /** Color Index */
  color: number | false
  /** Current Statement Balance */
  current_statement_balance: number | false
  /** Has Statement Lines */
  has_statement_lines: boolean
  /** Entries Count */
  entries_count: number | false
  /** Has Posted Entries */
  has_posted_entries: boolean
  /** Has Entries */
  has_entries: boolean
  /** Has Sequence Holes */
  has_sequence_holes: boolean
  /** Unhashed Entries */
  has_unhashed_entries: boolean
  /** Last Statement */
  last_statement_id: [number, string] /* account.bank.statement */ | false
}

/** Field names for account.journal */
export type AccountJournalFieldName = ModelFieldName<AccountJournalRecord>

/** Typed search_read result */
export type AccountJournalSearchResult = ModelRecord<AccountJournalRecord>
