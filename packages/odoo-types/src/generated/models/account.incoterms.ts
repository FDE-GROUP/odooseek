// Auto-generated from account.incoterms (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.incoterms */
export interface AccountIncotermsRecord extends BaseRecord {
  /** Active — By unchecking the active field, you may hide an INCOTERM you will not use. */
  active: boolean
  /** Code — Incoterm Standard Code */
  code: string
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Name — Incoterms are series of sales terms. They are used to divide transaction costs and responsibilities between buyer and seller and reflect state-of-the-art transportation practices. */
  name: string
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.incoterms */
export type AccountIncotermsFieldName = ModelFieldName<AccountIncotermsRecord>

/** Typed search_read result */
export type AccountIncotermsSearchResult = ModelRecord<AccountIncotermsRecord>
