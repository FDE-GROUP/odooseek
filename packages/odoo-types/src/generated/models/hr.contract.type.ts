// Auto-generated from hr.contract.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.contract.type */
export interface HrContractTypeRecord extends BaseRecord {
  /** Name */
  name: string
  /** Code */
  code: string | false
  /** Sequence */
  sequence: number | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for hr.contract.type */
export type HrContractTypeFieldName = ModelFieldName<HrContractTypeRecord>

/** Typed search_read result */
export type HrContractTypeSearchResult = ModelRecord<HrContractTypeRecord>
