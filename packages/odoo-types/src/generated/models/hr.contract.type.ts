// Auto-generated from hr.contract.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.contract.type */
export interface HrContractTypeRecord extends BaseRecord {
  /** Code */
  code: string | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.contract.type */
export type HrContractTypeFieldName = ModelFieldName<HrContractTypeRecord>

/** Typed search_read result */
export type HrContractTypeSearchResult = ModelRecord<HrContractTypeRecord>
