// Auto-generated from account.move (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.move */
export interface AccountMoveRecord extends BaseRecord {
  /** Campaign — This is a name that helps you keep track of your different campaign efforts, e.g. Fall_Drive, Christmas_Special */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** Source — This is the source of the link, e.g. Search Engine, another domain, or name of email list */
  source_id: [number, string] /* utm.source */ | false
  /** Medium — This is the method of delivery, e.g. Postcard, Email, or Banner Ad */
  medium_id: [number, string] /* utm.medium */ | false
  /** Sequence Prefix */
  sequence_prefix: string | false
  /** Sequence Number */
  sequence_number: number | false
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
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Security Token */
  access_token: string | false
  /** Access warning */
  access_warning: string | false
  /** Number */
  name: string | false
  /** Name Placeholder */
  name_placeholder: string | false
  /** Reference */
  ref: string | false
  /** Date */
  date: string
  /** Status */
  state: 'draft' | 'posted' | 'cancel'
  /** Type */
  move_type: 'entry' | 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund' | 'out_receipt' | 'in_receipt'
  /** Is Storno */
  is_storno: boolean
  /** Journal */
  journal_id: [number, string] /* account.journal */
  /** Ledger */
  journal_group_id: [number, string] /* account.journal.group */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Journal Items */
  line_ids: number[] /* account.move.line */
  /** Journal Items (DEPRECATED) */
  journal_line_ids: number[] /* account.move.line */
  /** Related reconciliation */
  exchange_diff_partial_ids: number[] /* account.partial.reconcile */
  /** Payment */
  origin_payment_id: [number, string] /* account.payment */ | false
  /** Matched Payments */
  matched_payment_ids: number[] /* account.payment */ | false
  /** Reconciled Payments — Payments that have been reconciled with this invoice. */
  reconciled_payment_ids: number[] /* account.payment */ | false
  /** Payment Count */
  payment_count: number | false
  /** Statement Line */
  statement_line_id: [number, string] /* account.bank.statement.line */ | false
  /** Statement */
  statement_id: [number, string] /* account.bank.statement */ | false
  /** Adjusting Entry Origin Moves */
  adjusting_entry_origin_move_ids: number[] /* account.move */ | false
  /** Adjusting Entry Origin Label */
  adjusting_entry_origin_label: string | false
  /** Adjusting Entry Origin Moves Count */
  adjusting_entry_origin_moves_count: number | false
  /** Created Adjusting Entries */
  adjusting_entries_move_ids: number[] /* account.move */ | false
  /** Adjusting Entries Count */
  adjusting_entries_count: number | false
  /** Tax Cash Basis Entry of */
  tax_cash_basis_rec_id: [number, string] /* account.partial.reconcile */ | false
  /** Cash Basis Origin — The journal entry from which this tax cash basis journal entry has been created. */
  tax_cash_basis_origin_move_id: [number, string] /* account.move */ | false
  /** Cash Basis Entries — The cash basis entries created from the taxes on this entry, when reconciling its lines. */
  tax_cash_basis_created_move_ids: number[] /* account.move */
  /** Always Tax Exigible */
  always_tax_exigible: boolean
  /** Auto-post — Specify whether this entry is posted automatically on its accounting date, and any similar recurring invoices. */
  auto_post: 'no' | 'at_date' | 'monthly' | 'quarterly' | 'yearly'
  /** Auto-post until — This recurring move will be posted up to and including this date. */
  auto_post_until: string | false
  /** First recurring entry */
  auto_post_origin_id: [number, string] /* account.move */ | false
  /** Hide Post Button */
  hide_post_button: boolean
  /** Reviewed */
  checked: boolean
  /** Posted Before */
  posted_before: boolean
  /** Suitable Journal */
  suitable_journal_ids: number[] /* account.journal */ | false
  /** Highest Name */
  highest_name: string | false
  /** Made Sequence Gap */
  made_sequence_gap: boolean
  /** Show Name Warning */
  show_name_warning: boolean
  /** Type Name */
  type_name: string | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Account Fiscal Country Group Codes */
  account_fiscal_country_group_codes: unknown | false
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  company_price_include: 'tax_included' | 'tax_excluded' | false
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */
  /** Audit Trail Messages */
  audit_trail_message_ids: number[] /* mail.message */
  /** No Follow-Up — Exclude this journal entry from follow-up reports. */
  no_followup: boolean
  /** Secure Posted Entries with Hash — If ticked, when an entry is posted, we retroactively hash all moves in the sequence from the entry back to the last hashed entry. The hash can also be performed on demand by the Secure Entries wizard. */
  restrict_mode_hash_table: boolean
  /** Inalterability No Gap Sequence # */
  secure_sequence_number: number | false
  /** Inalterability Hash */
  inalterable_hash: string | false
  /** Secured — The entry is secured with an inalterable hash. */
  secured: boolean
  /** Invoice lines */
  invoice_line_ids: number[] /* account.move.line */
  /** Invoice/Bill Date */
  invoice_date: string | false
  /** Due Date */
  invoice_date_due: string | false
  /** Delivery Date */
  delivery_date: string | false
  /** Show Delivery Date */
  show_delivery_date: boolean
  /** Taxable Supply Date */
  taxable_supply_date: string | false
  /** Show Taxable Supply Date */
  show_taxable_supply_date: boolean
  /** Taxable Supply Date Placeholder */
  taxable_supply_date_placeholder: string | false
  /** Payment Terms */
  invoice_payment_term_id: [number, string] /* account.payment.term */ | false
  /** Needed Terms */
  needed_terms: string | false
  /** Needed Terms Dirty */
  needed_terms_dirty: boolean
  /** Tax calculation rounding method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Show Journal */
  show_journal: boolean
  /** Partner */
  partner_id: [number, string] /* res.partner */ | false
  /** Commercial Entity */
  commercial_partner_id: [number, string] /* res.partner */ | false
  /** Delivery Address — The delivery address will be used in the computation of the fiscal position. */
  partner_shipping_id: [number, string] /* res.partner */ | false
  /** Recipient Bank — Bank Account Number to which the invoice will be paid. A Company bank account if this is a Customer Invoice or Vendor Credit Note, otherwise a Partner bank account number. */
  partner_bank_id: [number, string] /* res.partner.bank */ | false
  /** Fiscal Position — Fiscal positions are used to adapt taxes and accounts for particular customers or sales orders/invoices. The default value comes from the customer. */
  fiscal_position_id: [number, string] /* account.fiscal.position */ | false
  /** Payment Reference — The payment reference to set on journal items. */
  payment_reference: string | false
  /** Display QR-code */
  display_qr_code: boolean
  /** Display Link QR-code */
  display_link_qr_code: boolean
  /** Payment QR-code — Type of QR-code to be generated for the payment of this invoice, when printing it. If left blank, the first available and usable method will be used. */
  qr_code_method: string | false
  /** Invoice Outstanding Credits Debits Widget */
  invoice_outstanding_credits_debits_widget: string | false
  /** Invoice Has Outstanding */
  invoice_has_outstanding: boolean
  /** Invoice Payments Widget */
  invoice_payments_widget: string | false
  /** Preferred Payment Method Line */
  preferred_payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */
  /** Expected Currency Rate */
  expected_currency_rate: number | false
  /** Currency Rate — Currency rate from company currency to document currency. */
  invoice_currency_rate: number | false
  /** Direction Sign — Multiplicator depending on the document type, to convert a price into a balance */
  direction_sign: number | false
  /** Untaxed Amount */
  amount_untaxed: number | false
  /** Tax */
  amount_tax: number | false
  /** Total */
  amount_total: number | false
  /** Amount Due */
  amount_residual: number | false
  /** Untaxed Amount Signed */
  amount_untaxed_signed: number | false
  /** Untaxed Amount Signed Currency */
  amount_untaxed_in_currency_signed: number | false
  /** Tax Signed */
  amount_tax_signed: number | false
  /** Total Signed */
  amount_total_signed: number | false
  /** Total in Currency Signed */
  amount_total_in_currency_signed: number | false
  /** Amount Due Signed */
  amount_residual_signed: number | false
  /** Invoice Totals — Edit Tax amounts if you encounter rounding issues. */
  tax_totals: string | false
  /** Payment Status */
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed' | 'blocked' | 'invoicing_legacy' | false
  /** Status In Payment */
  status_in_payment: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed' | 'blocked' | 'invoicing_legacy' | 'draft' | 'posted' | 'sent' | 'cancel' | false
  /** Amount total in words */
  amount_total_words: string | false
  /** Reversal of */
  reversed_entry_id: [number, string] /* account.move */ | false
  /** Reversal Move */
  reversal_move_ids: number[] /* account.move */
  /** Vendor Bill — Auto-complete from a previous bill or refund. */
  invoice_vendor_bill_id: [number, string] /* account.move */ | false
  /** Source Email */
  invoice_source_email: string | false
  /** Invoice Partner Display Name */
  invoice_partner_display_name: string | false
  /** Is Manually Modified */
  is_manually_modified: boolean
  /** Quick Edit Mode */
  quick_edit_mode: boolean
  /** Total (Tax inc.) — Use this field to encode the total amount of the invoice.
Odoo will automatically create one invoice line with default values to match it. */
  quick_edit_total_amount: number | false
  /** Quick Encoding Vals */
  quick_encoding_vals: unknown | false
  /** Terms and Conditions */
  narration: string | false
  /** Is Move Sent — It indicates that the invoice/payment has been sent or the PDF has been generated. */
  is_move_sent: boolean
  /** Is Being Sent — Is the move being sent asynchronously */
  is_being_sent: boolean
  /** Sent */
  move_sent_values: 'sent' | 'not_sent' | false
  /** Salesperson */
  invoice_user_id: [number, string] /* res.users */ | false
  /** User */
  user_id: [number, string] /* res.users */ | false
  /** Origin — The document(s) that generated the invoice. */
  invoice_origin: string | false
  /** Incoterm — International Commercial Terms are a series of predefined commercial terms used in international transactions. */
  invoice_incoterm_id: [number, string] /* account.incoterms */ | false
  /** Incoterm Location */
  incoterm_location: string | false
  /** Cash Rounding Method — Defines the smallest coinage of the currency that can be used to pay by cash. */
  invoice_cash_rounding_id: [number, string] /* account.cash.rounding */ | false
  /** Sending Data */
  sending_data: unknown | false
  /** PDF Attachment */
  invoice_pdf_report_id: [number, string] /* ir.attachment */ | false
  /** PDF File */
  invoice_pdf_report_file: string | false
  /** Invoice Incoterm Placeholder */
  invoice_incoterm_placeholder: string | false
  /** Invoice Filter Type Domain */
  invoice_filter_type_domain: string | false
  /** Bank Partner — Technical field to get the domain on the bank */
  bank_partner_id: [number, string] /* res.partner */ | false
  /** Tax Lock Date Message */
  tax_lock_date_message: string | false
  /** Display Inactive Currency Warning */
  display_inactive_currency_warning: boolean
  /** Tax Country */
  tax_country_id: [number, string] /* res.country */ | false
  /** Tax Country Code */
  tax_country_code: string | false
  /** Has Reconciled Entries */
  has_reconciled_entries: boolean
  /** Show Reset To Draft Button */
  show_reset_to_draft_button: boolean
  /** Partner Credit Warning */
  partner_credit_warning: string | false
  /** Duplicated Ref */
  duplicated_ref_ids: number[] /* account.move */ | false
  /** Is Draft Duplicated Ref */
  is_draft_duplicated_ref_ids: boolean
  /** Is Exact Move Duplicate */
  is_exact_move_duplicate: boolean
  /** Need Cancel Request */
  need_cancel_request: boolean
  /** Has Fiscal Position Changed */
  show_update_fpos: boolean
  /** Payment Term Details */
  payment_term_details: string | false
  /** Show Payment Term Details */
  show_payment_term_details: boolean
  /** Show Discount Details */
  show_discount_details: boolean
  /** Abnormal Amount Warning */
  abnormal_amount_warning: string | false
  /** Abnormal Date Warning */
  abnormal_date_warning: string | false
  /** Alerts */
  alerts: unknown | false
  /** Taxes Legal Notes */
  taxes_legal_notes: string | false
  /** Next Payment Date */
  next_payment_date: string | false
  /** Display Send Button */
  display_send_button: boolean
  /** Highlight Send Button */
  highlight_send_button: boolean
  /** Is Sale Installed */
  is_sale_installed: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Payments */
  payment_ids: number[] /* account.payment */
  /** Statements */
  statement_line_ids: number[] /* account.bank.statement.line */
  /** Attachment */
  ubl_cii_xml_id: [number, string] /* ir.attachment */ | false
  /** UBL/CII File */
  ubl_cii_xml_file: string | false
  /** UBL/CII Filename */
  ubl_cii_xml_filename: string | false
  /** Transactions */
  transaction_ids: number[] /* payment.transaction */ | false
  /** Authorized Transactions */
  authorized_transaction_ids: number[] /* payment.transaction */ | false
  /** Transaction Count */
  transaction_count: number | false
  /** Amount paid */
  amount_paid: number | false
  /** Auto-complete — Auto-complete from a previous bill, refund, or purchase order. */
  purchase_vendor_bill_id: [number, string] /* purchase.bill.union */ | false
  /** Purchase Order — Auto-complete from a past purchase order. */
  purchase_id: [number, string] /* purchase.order */ | false
  /** Purchase Order Count */
  purchase_order_count: number | false
  /** Purchase Order Name */
  purchase_order_name: string | false
  /** Is Purchase Matched */
  is_purchase_matched: boolean
  /** Purchase Warning — Internal warning for the partner or the products as set by the user. */
  purchase_warning_text: string | false
  /** Stock Move */
  stock_move_ids: number[] /* stock.move */
  /** Relevant WIP MOs — The MOs that this WIP entry was based on. Expected to be set at time of WIP entry creation. */
  wip_production_ids: number[] /* mrp.production */ | false
  /** Manufacturing Orders Count */
  wip_production_count: number | false
  /** Sales Team */
  team_id: [number, string] /* crm.team */ | false
  /** Sale Order Count */
  sale_order_count: number | false
  /** Sale Warning — Internal warning for the partner or the products as set by the user. */
  sale_warning_text: string | false
  /** Website — Website through which this invoice was created for eCommerce orders. */
  website_id: [number, string] /* website */ | false
  /** Expense */
  expense_ids: number[] /* hr.expense */
  /** Number of Expenses */
  nb_expenses: number | false
}

/** Field names for account.move */
export type AccountMoveFieldName = ModelFieldName<AccountMoveRecord>

/** Typed search_read result */
export type AccountMoveSearchResult = ModelRecord<AccountMoveRecord>
