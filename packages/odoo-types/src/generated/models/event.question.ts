// Auto-generated from event.question (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.question */
export interface EventQuestionRecord extends BaseRecord {
  /** Title */
  title: string
  /** Question Type */
  question_type: 'simple_choice' | 'text_box' | 'name' | 'email' | 'phone' | 'company_name'
  /** Active */
  active: boolean
  /** Event Types */
  event_type_ids: number[] /* event.type */ | false
  /** Events */
  event_ids: number[] /* event.event */ | false
  /** # Events */
  event_count: number | false
  /** Default question — Include by default in new events. */
  is_default: boolean
  /** Is Reusable — Allow this question to be selected and reused for any future event. Always true for default questions. */
  is_reusable: boolean
  /** Answers */
  answer_ids: number[] /* event.question.answer */
  /** Sequence */
  sequence: number | false
  /** Ask once per order — Check this for order-level questions (e.g., \'Company Name\') where the answer is the same for everyone. */
  once_per_order: boolean
  /** Mandatory Answer */
  is_mandatory_answer: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.question */
export type EventQuestionFieldName = ModelFieldName<EventQuestionRecord>

/** Typed search_read result */
export type EventQuestionSearchResult = ModelRecord<EventQuestionRecord>
