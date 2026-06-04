// Auto-generated from event.registration.answer (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.registration.answer */
export interface EventRegistrationAnswerRecord extends BaseRecord {
  /** Question */
  question_id: [number, string] /* event.question */
  /** Registration */
  registration_id: [number, string] /* event.registration */
  /** Booked by */
  partner_id: [number, string] /* res.partner */ | false
  /** Event */
  event_id: [number, string] /* event.event */ | false
  /** Question Type */
  question_type: 'simple_choice' | 'text_box' | 'name' | 'email' | 'phone' | 'company_name' | false
  /** Suggested answer */
  value_answer_id: [number, string] /* event.question.answer */ | false
  /** Text answer */
  value_text_box: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.registration.answer */
export type EventRegistrationAnswerFieldName = ModelFieldName<EventRegistrationAnswerRecord>

/** Typed search_read result */
export type EventRegistrationAnswerSearchResult = ModelRecord<EventRegistrationAnswerRecord>
