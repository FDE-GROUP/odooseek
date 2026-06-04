// Auto-generated from hr.employee.category (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.employee.category */
export interface HrEmployeeCategoryRecord extends BaseRecord {
  /** Color Index */
  color: number | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Employees */
  employee_ids: number[] /* hr.employee */ | false
  /** Tag Name */
  name: string
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.employee.category */
export type HrEmployeeCategoryFieldName = ModelFieldName<HrEmployeeCategoryRecord>

/** Typed search_read result */
export type HrEmployeeCategorySearchResult = ModelRecord<HrEmployeeCategoryRecord>
