// Auto-generated from res.country (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** res.country */
export interface ResCountryRecord extends BaseRecord {
  /** Country Name */
  name: string
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  code: string
  /** Layout in Reports — Display format to use for addresses belonging to this country.

You can use python-style string pattern with all the fields of the address (for example, use \'%(street)s\' to display the field \'street\') plus
%(state_name)s: the name of the state
%(state_code)s: the code of the state
%(country_name)s: the name of the country
%(country_code)s: the code of the country */
  address_format: string | false
  /** Input View — Use this field if you want to replace the usual way to encode a complete address. Note that the address_format field is used to modify the way to display addresses (in reports for example), while this field is used to modify the input form for addresses. */
  address_view_id: [number, string] /* ir.ui.view */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Flag — Url of static flag image */
  image_url: string | false
  /** Country Calling Code */
  phone_code: number | false
  /** Country Groups */
  country_group_ids: number[] /* res.country.group */ | false
  /** Country Group Codes */
  country_group_codes: unknown | false
  /** States */
  state_ids: number[] /* res.country.state */
  /** Customer Name Position — Determines where the customer/company name should be placed, i.e. after or before the address. */
  name_position: 'before' | 'after' | false
  /** Vat Label — Use this field if you want to change vat label. */
  vat_label: string | false
  /** State Required */
  state_required: boolean
  /** Zip Required */
  zip_required: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Is Mercado Pago Supported Country */
  is_mercado_pago_supported_country: boolean
  /** Is Stripe Supported Country */
  is_stripe_supported_country: boolean
}

/** Field names for res.country */
export type ResCountryFieldName = ModelFieldName<ResCountryRecord>

/** Typed search_read result */
export type ResCountrySearchResult = ModelRecord<ResCountryRecord>
