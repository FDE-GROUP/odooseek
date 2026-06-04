// Auto-generated from hr.payroll.structure.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.payroll.structure.type */
export interface HrPayrollStructureTypeRecord extends BaseRecord {
  /** Salary Structure Type */
  name: string | false
  /** Working Hours */
  default_resource_calendar_id: [number, string] /* resource.calendar */ | false
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

/** Field names for hr.payroll.structure.type */
export type HrPayrollStructureTypeFieldName = ModelFieldName<HrPayrollStructureTypeRecord>

/** Typed search_read result */
export type HrPayrollStructureTypeSearchResult = ModelRecord<HrPayrollStructureTypeRecord>
