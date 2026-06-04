// Auto-generated from hr.departure.reason (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.departure.reason */
export interface HrDepartureReasonRecord extends BaseRecord {
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Reason */
  name: string
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.departure.reason */
export type HrDepartureReasonFieldName = ModelFieldName<HrDepartureReasonRecord>

/** Typed search_read result */
export type HrDepartureReasonSearchResult = ModelRecord<HrDepartureReasonRecord>
