// Auto-generated from calendar.event.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** calendar.event.type */
export interface CalendarEventTypeRecord extends BaseRecord {
  /** Color */
  color: number | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Name */
  name: string
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for calendar.event.type */
export type CalendarEventTypeFieldName = ModelFieldName<CalendarEventTypeRecord>

/** Typed search_read result */
export type CalendarEventTypeSearchResult = ModelRecord<CalendarEventTypeRecord>
