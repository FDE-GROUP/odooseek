// Auto-generated from res.company (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** res.company */
export interface ResCompanyRecord extends BaseRecord {
  /** Absence Management */
  absence_management: boolean
  /** Base Tax Received Account — Account that will be set on lines created in cash basis journal entry and used to keep track of the tax base amount. */
  account_cash_basis_base_account_id: [number, string] /* account.account */ | false
  /** Default PoS Receivable Account */
  account_default_pos_receivable_account_id: [number, string] /* account.account */ | false
  /** Separate account for expense discount */
  account_discount_expense_allocation_id: [number, string] /* account.account */ | false
  /** Separate account for income discount */
  account_discount_income_allocation_id: [number, string] /* account.account */ | false
  /** l10n-used countries — Technical field containing the countries for which this company is using tax-related features(hence the ones for which l10n modules need to show tax-related fields). */
  account_enabled_tax_country_ids: number[] /* res.country */ | false
  /** Account Fiscal Country Group Codes */
  account_fiscal_country_group_codes: unknown | false
  /** Fiscal Country — The country to use the tax reports from for this company */
  account_fiscal_country_id: [number, string] /* res.country */ | false
  /** Cash Discount Write-Off Gain Account */
  account_journal_early_pay_discount_gain_account_id: [number, string] /* account.account */ | false
  /** Cash Discount Write-Off Loss Account */
  account_journal_early_pay_discount_loss_account_id: [number, string] /* account.account */ | false
  /** Journal Suspense Account */
  account_journal_suspense_account_id: [number, string] /* account.account */ | false
  /** Opening Entry — That is the date of the opening entry. */
  account_opening_date: string | false
  /** Opening Journal — Journal where the opening entry of this company\'s accounting has been posted. */
  account_opening_journal_id: [number, string] /* account.journal */ | false
  /** Opening Journal Entry — The journal entry containing the initial balance of all this company\'s accounts. */
  account_opening_move_id: [number, string] /* account.move */ | false
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  account_price_include: 'tax_included' | 'tax_excluded'
  /** Production WIP Account */
  account_production_wip_account_id: [number, string] /* account.account */ | false
  /** Production WIP Overhead Account */
  account_production_wip_overhead_account_id: [number, string] /* account.account */ | false
  /** Default Purchase Receipt Fiscal Position */
  account_purchase_receipt_fiscal_position_id: [number, string] /* account.fiscal.position */ | false
  /** Default Purchase Tax */
  account_purchase_tax_id: [number, string] /* account.tax */ | false
  /** Default Sale Tax */
  account_sale_tax_id: [number, string] /* account.tax */ | false
  /** Stock Journal */
  account_stock_journal_id: [number, string] /* account.journal */ | false
  /** Stock Valuation Account */
  account_stock_valuation_id: [number, string] /* account.account */ | false
  /** Storno accounting */
  account_storno: boolean
  /** Sales Credit Limit — Enable the use of credit limit on partners. */
  account_use_credit_limit: boolean
  /** Active */
  active: boolean
  /** Email Domain */
  alias_domain_id: [number, string] /* mail.alias.domain */ | false
  /** All Child */
  all_child_ids: number[] /* res.company */
  /** Use anglo-saxon accounting */
  anglo_saxon_accounting: boolean
  /** Day of the month — Day of the month when the annual inventory should occur. If zero or negative, then the first day of the month will be selected instead.
        If greater than the last day of a month, then the last day of the month will be selected instead. */
  annual_inventory_day: number | false
  /** Annual Inventory Month — Annual inventory month for products not in a location with a cyclic inventory date. Set to no month if no automatic annual inventory. */
  annual_inventory_month: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | false
  /** Barcode Source */
  attendance_barcode_source: 'scanner' | 'front' | 'back' | false
  /** Device & Location Tracking */
  attendance_device_tracking: boolean
  /** Attendance From Systray */
  attendance_from_systray: boolean
  /** Attendance Kiosk Delay */
  attendance_kiosk_delay: number | false
  /** Attendance Kiosk Key */
  attendance_kiosk_key: string | false
  /** Attendance Mode */
  attendance_kiosk_mode: 'barcode' | 'barcode_manual' | 'manual' | false
  /** Attendance Kiosk Url */
  attendance_kiosk_url: string | false
  /** Employee PIN Identification */
  attendance_kiosk_use_pin: boolean
  /** Extra Hours Validation */
  attendance_overtime_validation: 'no_validation' | 'by_manager' | false
  /** Automatic Check Out */
  auto_check_out: boolean
  /** Auto Check Out Tolerance */
  auto_check_out_tolerance: number | false
  /** Automatic Entry Default Journal — Journal used by default for moving the period of an entry */
  automatic_entry_default_journal_id: [number, string] /* account.journal */ | false
  /** Auto-validate bills */
  autopost_bills: boolean
  /** Prefix of the bank accounts */
  bank_account_code_prefix: string | false
  /** Banks */
  bank_ids: number[] /* res.partner.bank */
  /** Bank Journals */
  bank_journal_ids: number[] /* account.journal */
  /** Batch Payment Sequence */
  batch_payment_sequence_id: [number, string] /* ir.sequence */ | false
  /** Bounce Email */
  bounce_email: string | false
  /** Bounce */
  bounce_formatted: string | false
  /** Prefix of the cash accounts */
  cash_account_code_prefix: string | false
  /** Catchall Email */
  catchall_email: string | false
  /** Catchall */
  catchall_formatted: string | false
  /** Chart Template */
  chart_template: 'generic_coa' | 'ae' | 'ar_ri' | 'ar_base' | 'ar_ex' | 'at' | 'au' | 'bd' | 'be_comp' | 'be_asso' | 'bf' | 'bf_syscebnl' | 'bg' | 'bh' | 'bj' | 'bj_syscebnl' | 'bo' | 'br' | 'ca_2023' | 'cd' | 'cd_syscebnl' | 'cf' | 'cf_syscebnl' | 'cg' | 'cg_syscebnl' | 'ch' | 'ci' | 'ci_syscebnl' | 'cl' | 'cm' | 'cm_syscebnl' | 'cn' | 'cn_large_bis' | 'co' | 'cr' | 'cy' | 'cz' | 'de_skr03' | 'de_skr04' | 'dk' | 'do' | 'dz' | 'ec' | 'ee' | 'eg' | 'es_pymes' | 'es_assec' | 'es_canary_assoc' | 'es_canary_full' | 'es_canary_pymes' | 'es_coop_full' | 'es_coop_pymes' | 'es_full' | 'et' | 'fi' | 'fr' | 'mc' | 'ga' | 'ga_syscebnl' | 'gn' | 'gn_syscebnl' | 'gq' | 'gq_syscebnl' | 'gr' | 'gt' | 'gw' | 'gw_syscebnl' | 'hk' | 'hn' | 'hr' | 'hr_kuna' | 'hu' | 'id' | 'ie' | 'il' | 'in' | 'iq' | 'it' | 'jo_standard' | 'jp' | 'ke' | 'kh' | 'km' | 'km_syscebnl' | 'kr' | 'kw' | 'kz' | 'lb' | 'lk' | 'lt' | 'lu' | 'lv' | 'ma' | 'ml' | 'ml_syscebnl' | 'mn' | 'mr' | 'mt' | 'mu' | 'mx' | 'my' | 'mz' | 'ne' | 'ne_syscebnl' | 'ng' | 'nl' | 'no' | 'nz' | 'om' | 'pa' | 'pe' | 'ph' | 'pk' | 'pl' | 'pt' | 'qa' | 'ro' | 'rs' | 'rw' | 'sa' | 'se' | 'se_K2' | 'se_K3' | 'sg' | 'si' | 'sk' | 'sn' | 'sn_syscebnl' | 'syscebnl' | 'syscohada' | 'td' | 'td_syscebnl' | 'tg' | 'tg_syscebnl' | 'th' | 'tn' | 'tr' | 'tw' | 'tz' | 'ua_psbo' | 'ug' | 'uk' | 'xi' | 'us' | 'uy' | 'uz' | 've' | 'vn' | 'za' | 'zm' | false
  /** Branches */
  child_ids: number[] /* res.company */
  /** City */
  city: string | false
  /** Color */
  color: number | false
  /** Company Details — Header text displayed at the top of all reports. */
  company_details: string | false
  /** Payment methods available for expenses paid by company */
  company_expense_allowed_payment_method_line_ids: number[] /* account.payment.method.line */ | false
  /** Company ID — The registry number of the company. Use it if it is different from the Tax ID. It must be unique across all partners of a same country */
  company_registry: string | false
  /** Company Registry Placeholder */
  company_registry_placeholder: string | false
  /** Company Vat Placeholder */
  company_vat_placeholder: string | false
  /** Contract Expiry Notice Period */
  contract_expiration_notice_period: number | false
  /** Cost Method */
  cost_method: 'standard' | 'fifo' | 'average'
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Exchange Gain or Loss Journal */
  currency_exchange_journal_id: [number, string] /* account.journal */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */
  /** Days to Purchase — Days needed to confirm a PO, define when a PO should be validated */
  days_to_purchase: number | false
  /** Cash Difference Expense */
  default_cash_difference_expense_account_id: [number, string] /* account.account */ | false
  /** Cash Difference Income */
  default_cash_difference_income_account_id: [number, string] /* account.account */ | false
  /** Default From */
  default_from_email: string | false
  /** Display Account Storno */
  display_account_storno: boolean
  /** Total amount of invoice in letters */
  display_invoice_amount_total_words: boolean
  /** Taxes in company currency */
  display_invoice_tax_company_currency: boolean
  /** Domestic Fiscal Position */
  domestic_fiscal_position_id: [number, string] /* account.fiscal.position */ | false
  /** Downpayment Account — This account will be used on Downpayment invoices. */
  downpayment_account_id: [number, string] /* account.account */ | false
  /** Email */
  email: string | false
  /** Formatted Email */
  email_formatted: string | false
  /** Email Button Text */
  email_primary_color: string | false
  /** Email Button Color */
  email_secondary_color: string | false
  /** Employee Properties */
  employee_properties_definition: unknown | false
  /** Expects a Chart of Accounts */
  expects_chart_of_accounts: boolean
  /** Expense Account — The expense is accounted for when a vendor bill is validated, except in anglo-saxon accounting with perpetual inventory valuation in which case the expense (Cost of Goods Sold account) is recognized at the customer invoice validation. */
  expense_account_id: [number, string] /* account.account */ | false
  /** Expense Accrual Account — Account used to move the period of an expense */
  expense_accrual_account_id: [number, string] /* account.account */ | false
  /** Loss Exchange Rate Account */
  expense_currency_exchange_account_id: [number, string] /* account.account */ | false
  /** Default Expense Journal — The company\'s default journal used when an employee expense is created. */
  expense_journal_id: [number, string] /* account.journal */ | false
  /** Document Template */
  external_report_layout_id: [number, string] /* ir.ui.view */ | false
  /** Fiscal Position */
  fiscal_position_ids: number[] /* account.fiscal.position */
  /** Fiscalyear Last Day */
  fiscalyear_last_day: number
  /** Fiscalyear Last Month */
  fiscalyear_last_month: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  /** Global Lock Date — Any entry up to and including that date will be postponed to a later time, in accordance with its journal\'s sequence. */
  fiscalyear_lock_date: string | false
  /** Font */
  font: 'Lato' | 'Roboto' | 'Open_Sans' | 'Montserrat' | 'Oswald' | 'Raleway' | 'Tajawal' | 'Fira_Mono' | false
  /** Force Audit Trail */
  force_restrictive_audit_trail: boolean
  /** Hard Lock Date — Any entry up to and including that date will be postponed to a later time, in accordance with its journal sequence. This lock date is irreversible and does not allow any exception. */
  hard_lock_date: string | false
  /** Has Message */
  has_message: boolean
  /** Has Received Warning Stock Sms */
  has_received_warning_stock_sms: boolean
  /** Replenishment Horizon — Configure your horizon to trigger reordering rules earlier to get
                                a head start on replenishment and avoid delays, or trigger it just-in-time
                                (\'0 days\') to avoid overstocking. */
  horizon_days: number
  /** Display Extra Hours */
  hr_attendance_display_overtime: boolean
  /** Based on attendances */
  hr_presence_control_attendance: boolean
  /** Based on number of emails sent */
  hr_presence_control_email: boolean
  /** # emails to send */
  hr_presence_control_email_amount: number | false
  /** Based on IP Address */
  hr_presence_control_ip: boolean
  /** Valid IP addresses */
  hr_presence_control_ip_list: string | false
  /** Based on user status in system */
  hr_presence_control_login: boolean
  /** Enrich Done */
  iap_enrich_auto_done: boolean
  /** Income Account — This account will be used when validating a customer invoice. */
  income_account_id: [number, string] /* account.account */ | false
  /** Gain Exchange Rate Account */
  income_currency_exchange_account_id: [number, string] /* account.account */ | false
  /** Default incoterm — International Commercial Terms are a series of predefined commercial terms used in international transactions. */
  incoterm_id: [number, string] /* account.incoterms */ | false
  /** Internal Transit Location */
  internal_transit_location_id: [number, string] /* stock.location */ | false
  /** Inventory Period */
  inventory_period: 'manual' | 'daily' | 'monthly'
  /** Valuation */
  inventory_valuation: 'periodic' | 'real_time' | false
  /** Default Terms and Conditions */
  invoice_terms: string | false
  /** Default Terms and Conditions as a Web page */
  invoice_terms_html: string | false
  /** Is Company Details Empty */
  is_company_details_empty: boolean
  /** Job Properties */
  job_properties_definition: unknown | false
  /** Layout Background */
  layout_background: 'Blank' | 'Demo logo' | 'Custom'
  /** Background Image */
  layout_background_image: string | false
  /** Display Link QR-code */
  link_qr_code: boolean
  /** Company Logo */
  logo: string | false
  /** Logo Web */
  logo_web: string | false
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
  /** Foreign VAT countries — Countries for which the company has a VAT number */
  multi_vat_foreign_country_ids: number[] /* res.country */ | false
  /** Company Name */
  name: string
  /** Nomenclature */
  nomenclature_id: [number, string] /* barcode.nomenclature */ | false
  /** Tolerance Time In Favor Of Company */
  overtime_company_threshold: number | false
  /** Tolerance Time In Favor Of Employee */
  overtime_employee_threshold: number | false
  /** Paper format */
  paperformat_id: [number, string] /* report.paperformat */ | false
  /** Parent Company */
  parent_id: [number, string] /* res.company */ | false
  /** Parent */
  parent_ids: number[] /* res.company */ | false
  /** Parent Path */
  parent_path: string | false
  /** Partner */
  partner_id: [number, string] /* res.partner */
  /** Phone */
  phone: string | false
  /** Levels of Approvals — Provide a double validation mechanism for purchases */
  po_double_validation: 'one_step' | 'two_step' | false
  /** Double validation amount — Minimum amount for which a double validation is required */
  po_double_validation_amount: number | false
  /** Purchase Order Modification — Purchase Order Modification used when you want to purchase order editable after confirm */
  po_lock: 'edit' | 'lock' | false
  /** Online Payment */
  portal_confirmation_pay: boolean
  /** Online Signature */
  portal_confirmation_sign: boolean
  /** Prepayment percentage — The percentage of the amount needed to be paid to confirm quotations. */
  prepayment_percent: number | false
  /** Price Difference Account — During perpetual valuation, this account will hold the price difference between the standard price and the bill price. */
  price_difference_account_id: [number, string] /* account.account */ | false
  /** Primary Color */
  primary_color: string | false
  /** Purchase Lock date — Any purchase entry prior to and including this date will be postponed to a later date, in accordance with its journal\'s sequence. */
  purchase_lock_date: string | false
  /** Display QR-code on invoices */
  qr_code: boolean
  /** Quick encoding */
  quick_edit_mode: 'out_invoices' | 'in_invoices' | 'out_and_in_invoices' | false
  /** Default Quotation Validity — Days between quotation proposal and expiration. 0 days means automatic expiration is disabled */
  quotation_validity_days: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Report Footer — Footer text displayed at the bottom of all reports. */
  report_footer: string | false
  /** Company Tagline — Company tagline, which is included in a printed document\'s header or footer (depending on the selected layout). */
  report_header: string | false
  /** Default Working Hours */
  resource_calendar_id: [number, string] /* resource.calendar */ | false
  /** Working Hours */
  resource_calendar_ids: number[] /* resource.calendar */
  /** Restrictive Audit Trail — Enable this option to prevent deletion of journal item related logs */
  restrictive_audit_trail: boolean
  /** Revenue Accrual Account — Account used to move the period of a revenue */
  revenue_accrual_account_id: [number, string] /* account.account */ | false
  /** Root */
  root_id: [number, string] /* res.company */ | false
  /** Discount Product — Default product used for discounts */
  sale_discount_product_id: [number, string] /* product.product */ | false
  /** Sales Lock Date — Any sales entry prior to and including this date will be postponed to a later date, in accordance with its journal\'s sequence. */
  sale_lock_date: string | false
  /** Sale onboarding selected payment method */
  sale_onboarding_payment_method: 'digital_signature' | 'paypal' | 'stripe' | 'other' | 'manual' | false
  /** Default Sale Template */
  sale_order_template_id: [number, string] /* sale.order.template */ | false
  /** Secondary Color */
  secondary_color: string | false
  /** Sales Safety Days — Margin of error for dates promised to customers. Products will be scheduled for procurement and delivery that many days earlier than the actual promised date, to cope with unexpected delays in the supply chain. */
  security_lead: number
  /** Sequence — Used to order Companies in the company switcher */
  sequence: number | false
  /** Snailmail Color */
  snailmail_color: boolean
  /** Add a Cover Page */
  snailmail_cover: boolean
  /** Both sides */
  snailmail_duplex: boolean
  /** Discord Account */
  social_discord: string | false
  /** Facebook Account */
  social_facebook: string | false
  /** GitHub Account */
  social_github: string | false
  /** Instagram Account */
  social_instagram: string | false
  /** LinkedIn Account */
  social_linkedin: string | false
  /** TikTok Account */
  social_tiktok: string | false
  /** X Account */
  social_twitter: string | false
  /** Youtube Account */
  social_youtube: string | false
  /** Fed. State */
  state_id: [number, string] /* res.country.state */ | false
  /** Stock Confirmation Type */
  stock_confirmation_type: 'sms' | false
  /** Email Template confirmation picking — Email sent to the customer once the order is done. */
  stock_mail_confirmation_template_id: [number, string] /* mail.template */ | false
  /** Email Confirmation picking */
  stock_move_email_validation: boolean
  /** SMS Template — SMS sent to the customer once the order is delivered. */
  stock_sms_confirmation_template_id: [number, string] /* sms.template */ | false
  /** Stock Text Confirmation */
  stock_text_confirmation: boolean
  /** Street */
  street: string | false
  /** Street2 */
  street2: string | false
  /** Tax Calculation Rounding Method */
  tax_calculation_rounding_method: 'round_globally' | 'round_per_line' | false
  /** Cash Basis Journal */
  tax_cash_basis_journal_id: [number, string] /* account.journal */ | false
  /** Use Cash Basis */
  tax_exigibility: boolean
  /** Tax Return Lock Date — Any entry with taxes up to and including that date will be postponed to a later time, in accordance with its journal\'s sequence. The tax lock date is automatically set when the tax closing entry is posted. */
  tax_lock_date: string | false
  /** Terms & Conditions format */
  terms_type: 'plain' | 'html' | false
  /** Prefix of the transfer accounts */
  transfer_account_code_prefix: string | false
  /** Inter-Banks Transfer Account — Intermediary account used when moving money from a liquidity account to another */
  transfer_account_id: [number, string] /* account.account */ | false
  /** Uninstalled L10N Module */
  uninstalled_l10n_module_ids: number[] /* ir.module.module */ | false
  /** User Fiscalyear Lock Date */
  user_fiscalyear_lock_date: string | false
  /** User Hard Lock Date */
  user_hard_lock_date: string | false
  /** Accepted Users */
  user_ids: number[] /* res.users */ | false
  /** User Purchase Lock Date */
  user_purchase_lock_date: string | false
  /** User Sale Lock Date */
  user_sale_lock_date: string | false
  /** User Tax Lock Date */
  user_tax_lock_date: string | false
  /** Uses Default Logo */
  uses_default_logo: boolean
  /** Tax ID — The Tax Identification Number. Values here will be validated based on the country format. You can use \'/\' to indicate that the partner is not subject to tax. */
  vat: string | false
  /** Website Link */
  website: string | false
  /** Website */
  website_id: [number, string] /* website */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Work Permit Expiry Notice Period */
  work_permit_expiration_notice_period: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Zip */
  zip: string | false
}

/** Field names for res.company */
export type ResCompanyFieldName = ModelFieldName<ResCompanyRecord>

/** Typed search_read result */
export type ResCompanySearchResult = ModelRecord<ResCompanyRecord>
