// Auto-generated from account.fiscal.position (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.fiscal.position */
export interface AccountFiscalPositionRecord extends BaseRecord {
  /** Sequence */
  sequence: number | false
  /** Fiscal Position */
  name: string
  /** Active — By unchecking the active field, you may hide a fiscal position without deleting it. */
  active: boolean
  /** Company */
  company_id: [number, string] /* res.company */
  /** Account Mapping */
  account_ids: number[] /* account.fiscal.position.account */
  /** Account Map */
  account_map: string | false
  /** Taxes */
  tax_ids: number[] /* account.tax */ | false
  /** Tax Map */
  tax_map: string | false
  /** Notes — Legal mentions that have to be printed on the invoices. */
  note: string | false
  /** Detect Automatically — Apply tax & account mappings on invoices automatically if the matching criterias (VAT/Country) are met. */
  auto_apply: boolean
  /** VAT required — Apply only if partner has a VAT number. */
  vat_required: boolean
  /** Company Country — The country to use the tax reports from for this company */
  company_country_id: [number, string] /* res.country */ | false
  /** Company Fiscal Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  fiscal_country_codes: string | false
  /** Country — Apply only if delivery country matches. */
  country_id: [number, string] /* res.country */ | false
  /** Is Domestic */
  is_domestic: boolean
  /** Country Group — Apply only if delivery country matches the group. */
  country_group_id: [number, string] /* res.country.group */ | false
  /** Federal States */
  state_ids: number[] /* res.country.state */ | false
  /** Zip Range From */
  zip_from: string | false
  /** Zip Range To */
  zip_to: string | false
  /** States Count */
  states_count: number | false
  /** Foreign Tax ID — The tax ID of your company in the region mapped by this fiscal position. */
  foreign_vat: string | false
  /** Foreign Vat Header Mode */
  foreign_vat_header_mode: 'templates_found' | 'no_template' | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for account.fiscal.position */
export type AccountFiscalPositionFieldName = ModelFieldName<AccountFiscalPositionRecord>

/** Typed search_read result */
export type AccountFiscalPositionSearchResult = ModelRecord<AccountFiscalPositionRecord>
