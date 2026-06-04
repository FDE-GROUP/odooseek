// Auto-generated from event.mail.registration (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.mail.registration */
export interface EventMailRegistrationRecord extends BaseRecord {
  /** Mail Scheduler */
  scheduler_id: [number, string] /* event.mail */
  /** Attendee */
  registration_id: [number, string] /* event.registration */
  /** Scheduled Time */
  scheduled_date: string | false
  /** Mail Sent */
  mail_sent: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.mail.registration */
export type EventMailRegistrationFieldName = ModelFieldName<EventMailRegistrationRecord>

/** Typed search_read result */
export type EventMailRegistrationSearchResult = ModelRecord<EventMailRegistrationRecord>
