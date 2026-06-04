// Auto-generated from event.mail.slot (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.mail.slot */
export interface EventMailSlotRecord extends BaseRecord {
  /** Slot */
  event_slot_id: [number, string] /* event.slot */
  /** Schedule Date */
  scheduled_date: string | false
  /** Mail Scheduler */
  scheduler_id: [number, string] /* event.mail */
  /** Last Attendee */
  last_registration_id: [number, string] /* event.registration */ | false
  /** # Sent */
  mail_count_done: number | false
  /** Sent */
  mail_done: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.mail.slot */
export type EventMailSlotFieldName = ModelFieldName<EventMailSlotRecord>

/** Typed search_read result */
export type EventMailSlotSearchResult = ModelRecord<EventMailSlotRecord>
