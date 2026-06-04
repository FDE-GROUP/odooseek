// Auto-generated from hr.work.location (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.work.location */
export interface HrWorkLocationRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Work Address */
  address_id: [number, string] /* res.partner */
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Location Number */
  location_number: string | false
  /** Cover Image */
  location_type: 'home' | 'office' | 'other'
  /** Work Location */
  name: string
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.work.location */
export type HrWorkLocationFieldName = ModelFieldName<HrWorkLocationRecord>

/** Typed search_read result */
export type HrWorkLocationSearchResult = ModelRecord<HrWorkLocationRecord>
