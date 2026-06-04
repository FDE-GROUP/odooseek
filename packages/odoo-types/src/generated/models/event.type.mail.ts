// Auto-generated from event.type.mail (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.type.mail */
export interface EventTypeMailRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Event Type */
  event_type_id: [number, string] /* event.type */
  /** Interval */
  interval_nbr: number | false
  /** Trigger */
  interval_type: 'after_sub' | 'before_event' | 'after_event_start' | 'after_event' | 'before_event_end'
  /** Unit */
  interval_unit: 'now' | 'hours' | 'days' | 'weeks' | 'months'
  /** Send */
  notification_type: 'mail' | 'sms' | false
  /** Template */
  template_ref: unknown
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for event.type.mail */
export type EventTypeMailFieldName = ModelFieldName<EventTypeMailRecord>

/** Typed search_read result */
export type EventTypeMailSearchResult = ModelRecord<EventTypeMailRecord>
