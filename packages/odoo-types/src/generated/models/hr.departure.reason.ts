// Auto-generated from hr.departure.reason (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.departure.reason */
export interface HrDepartureReasonRecord extends BaseRecord {
  /** Sequence */
  sequence: number | false
  /** Reason */
  name: string
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for hr.departure.reason */
export type HrDepartureReasonFieldName = ModelFieldName<HrDepartureReasonRecord>

/** Typed search_read result */
export type HrDepartureReasonSearchResult = ModelRecord<HrDepartureReasonRecord>
