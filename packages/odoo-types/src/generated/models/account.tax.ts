// Auto-generated from account.tax (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.tax */
export interface AccountTaxRecord extends BaseRecord {
  /** Active — Set active to false to hide the tax without removing it. */
  active: boolean
  /** Amount */
  amount: number
  /** Tax Computation — 
    - Group of Taxes: The tax is a set of sub taxes.
    - Fixed: The tax amount stays the same whatever the price.
    - Percentage: The tax amount is a % of the price:
        e.g 100 * (1 + 10%) = 110 (not price included)
        e.g 110 / (1 + 10%) = 100 (price included)
    - Percentage Tax Included: The tax amount is a division of the price:
        e.g 180 / (1 - 10%) = 200 (not price included)
        e.g 200 * (1 - 10%) = 180 (price included)
         */
  amount_type: 'group' | 'fixed' | 'percent' | 'division'
  /** Include in Analytic Cost — If set, the amount computed by this tax will be assigned to the same analytic account as the invoice line (if any) */
  analytic: boolean
  /** Cash Basis Transition Account — Account used to transition the tax amount for cash basis taxes. It will contain the tax amount as long as the original invoice has not been reconciled ; at reconciliation, this amount cancelled on this account and put on the regular tax account. */
  cash_basis_transition_account_id: [number, string] /* account.account */ | false
  /** Children Taxes */
  children_tax_ids: number[] /* account.tax */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Default Sales Price Include — Default on whether the sales price used on the product and invoices with this Company includes its taxes. */
  company_price_include: 'tax_included' | 'tax_excluded' | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Country — The country for which this tax is applicable. */
  country_id: [number, string] /* res.country */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Description */
  description: string | false
  /** Display Alternative Taxes Field */
  display_alternative_taxes_field: boolean
  /** Fiscal Position */
  fiscal_position_ids: number[] /* account.fiscal.position */ | false
  /** Has Message */
  has_message: boolean
  /** Has Negative Factor */
  has_negative_factor: boolean
  /** Hide Use Cash Basis Option */
  hide_tax_exigibility: boolean
  /** Affect Base of Subsequent Taxes — If set, taxes with a higher sequence than this one will be affected by it, provided they accept it. */
  include_base_amount: boolean
  /** Label on Invoices */
  invoice_label: string | false
  /** Legal Notes — Legal mentions that have to be printed on the invoices. */
  invoice_legal_notes: string | false
  /** Distribution for Invoices — Distribution when the tax is used on an invoice */
  invoice_repartition_line_ids: number[] /* account.tax.repartition.line */
  /** Base Affected by Previous Taxes — If set, taxes with a lower sequence might affect this one, provided they try to do it. */
  is_base_affected: boolean
  /** Is Domestic */
  is_domestic: boolean
  /** Tax used */
  is_used: boolean
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
  /** Tax Name */
  name: string
  /** Replaces — List of taxes to replace when applying any of the stipulated fiscal positions. */
  original_tax_ids: number[] /* account.tax */ | false
  /** Price Include — Determines whether the price you use on the product and invoices includes this tax. */
  price_include: boolean
  /** Included in Price — Overrides the Company\'s default on whether the price you use on the product and invoices includes this tax. */
  price_include_override: 'tax_included' | 'tax_excluded' | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Distribution for Refund Invoices — Distribution when the tax is used on a refund */
  refund_repartition_line_ids: number[] /* account.tax.repartition.line */
  /** Distribution */
  repartition_line_ids: number[] /* account.tax.repartition.line */
  /** Repartition Lines */
  repartition_lines_str: string | false
  /** Replaced by */
  replacing_tax_ids: number[] /* account.tax */ | false
  /** Sequence — The sequence field is used to define order in which the tax lines are applied. */
  sequence: number
  /** Tax Exigibility — Based on Invoice: the tax is due as soon as the invoice is validated.
Based on Payment: the tax is due as soon as the payment of the invoice is received. */
  tax_exigibility: 'on_invoice' | 'on_payment' | false
  /** Tax Group */
  tax_group_id: [number, string] /* account.tax.group */
  /** Tax Label */
  tax_label: string | false
  /** Tax Scope */
  tax_scope: 'service' | 'consu' | false
  /** Tax Type — Determines where the tax is selectable. Note: \'None\' means a tax can\'t be used by itself, however it can still be used in a group. \'adjustment\' is used to perform tax adjustment. */
  type_tax_use: 'sale' | 'purchase' | 'none'
  /** Ubl Cii Requires Exemption Reason */
  ubl_cii_requires_exemption_reason: boolean
  /** Tax Category Code — The VAT category code used for electronic invoicing purposes. */
  ubl_cii_tax_category_code: 'AE' | 'E' | 'S' | 'Z' | 'G' | 'O' | 'K' | 'L' | 'M' | 'B' | false
  /** Tax Exemption Reason Code — The reason why the amount is exempted from VAT or why no VAT is being charged, used for electronic invoicing purposes. */
  ubl_cii_tax_exemption_reason_code: 'VATEX-EU-79-C' | 'VATEX-EU-132' | 'VATEX-EU-132-1A' | 'VATEX-EU-132-1B' | 'VATEX-EU-132-1C' | 'VATEX-EU-132-1D' | 'VATEX-EU-132-1E' | 'VATEX-EU-132-1F' | 'VATEX-EU-132-1G' | 'VATEX-EU-132-1H' | 'VATEX-EU-132-1I' | 'VATEX-EU-132-1J' | 'VATEX-EU-132-1K' | 'VATEX-EU-132-1L' | 'VATEX-EU-132-1M' | 'VATEX-EU-132-1N' | 'VATEX-EU-132-1O' | 'VATEX-EU-132-1P' | 'VATEX-EU-132-1Q' | 'VATEX-EU-135-1' | 'VATEX-EU-143' | 'VATEX-EU-143-1A' | 'VATEX-EU-143-1B' | 'VATEX-EU-143-1C' | 'VATEX-EU-143-1D' | 'VATEX-EU-143-1E' | 'VATEX-EU-143-1F' | 'VATEX-EU-143-1FA' | 'VATEX-EU-143-1G' | 'VATEX-EU-143-1H' | 'VATEX-EU-143-1I' | 'VATEX-EU-143-1J' | 'VATEX-EU-143-1K' | 'VATEX-EU-143-1L' | 'VATEX-EU-144' | 'VATEX-EU-146-1E' | 'VATEX-EU-148' | 'VATEX-EU-148-A' | 'VATEX-EU-148-B' | 'VATEX-EU-148-C' | 'VATEX-EU-148-D' | 'VATEX-EU-148-E' | 'VATEX-EU-148-F' | 'VATEX-EU-148-G' | 'VATEX-EU-151' | 'VATEX-EU-151-1A' | 'VATEX-EU-151-1AA' | 'VATEX-EU-151-1B' | 'VATEX-EU-151-1C' | 'VATEX-EU-151-1D' | 'VATEX-EU-151-1E' | 'VATEX-EU-153' | 'VATEX-EU-159' | 'VATEX-EU-309' | 'VATEX-EU-AE' | 'VATEX-EU-D' | 'VATEX-EU-F' | 'VATEX-EU-G' | 'VATEX-EU-I' | 'VATEX-EU-IC' | 'VATEX-EU-O' | 'VATEX-EU-J' | 'VATEX-FR-FRANCHISE' | 'VATEX-FR-CNWVAT' | 'VATEX-FR-CGI261-1' | 'VATEX-FR-CGI261-2' | 'VATEX-FR-CGI261-3' | 'VATEX-FR-CGI261-4' | 'VATEX-FR-CGI261-5' | 'VATEX-FR-CGI261-7' | 'VATEX-FR-CGI261-8' | 'VATEX-FR-CGI261A' | 'VATEX-FR-CGI261B' | 'VATEX-FR-CGI261C-1' | 'VATEX-FR-CGI261C-2' | 'VATEX-FR-CGI261C-3' | 'VATEX-FR-CGI261D-1' | 'VATEX-FR-CGI261D-1BIS' | 'VATEX-FR-CGI261D-2' | 'VATEX-FR-CGI261D-3' | 'VATEX-FR-CGI261D-4' | 'VATEX-FR-CGI261E-1' | 'VATEX-FR-CGI261E-2' | 'VATEX-FR-CGI277A' | 'VATEX-FR-CGI275' | 'VATEX-FR-298SEXDECIESA' | 'VATEX-FR-CGI295' | 'VATEX-FR-AE' | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.tax */
export type AccountTaxFieldName = ModelFieldName<AccountTaxRecord>

/** Typed search_read result */
export type AccountTaxSearchResult = ModelRecord<AccountTaxRecord>
