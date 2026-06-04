// Auto-generated from event.mail (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.mail */
export interface EventMailRecord extends BaseRecord {
  /** Event */
  event_id: [number, string] /* event.event */
  /** Display order */
  sequence: number | false
  /** Interval */
  interval_nbr: number | false
  /** Unit */
  interval_unit: 'now' | 'hours' | 'days' | 'weeks' | 'months'
  /** Trigger  — Indicates when the communication is sent. If the event has multiple slots, the interval is related to each time slot instead of the whole event. */
  interval_type: 'after_sub' | 'before_event' | 'after_event_start' | 'after_event' | 'before_event_end'
  /** Schedule Date */
  scheduled_date: string | false
  /** Last Error */
  error_datetime: string | false
  /** Last Attendee */
  last_registration_id: [number, string] /* event.registration */ | false
  /** Mail Registration — Communication related to event registrations */
  mail_registration_ids: number[] /* event.mail.registration */
  /** Mail Slot — Slot-based communication */
  mail_slot_ids: number[] /* event.mail.slot */
  /** Sent */
  mail_done: boolean
  /** Global communication Status */
  mail_state: 'running' | 'scheduled' | 'sent' | 'error' | 'cancelled' | false
  /** # Sent */
  mail_count_done: number | false
  /** Send */
  notification_type: 'mail' | 'sms' | false
  /** Template */
  template_ref: unknown
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.mail */
export type EventMailFieldName = ModelFieldName<EventMailRecord>

/** Typed search_read result */
export type EventMailSearchResult = ModelRecord<EventMailRecord>
