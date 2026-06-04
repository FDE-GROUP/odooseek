// Auto-generated from event.question.answer (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.question.answer */
export interface EventQuestionAnswerRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Answer */
  name: string
  /** Question */
  question_id: [number, string] /* event.question */
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for event.question.answer */
export type EventQuestionAnswerFieldName = ModelFieldName<EventQuestionAnswerRecord>

/** Typed search_read result */
export type EventQuestionAnswerSearchResult = ModelRecord<EventQuestionAnswerRecord>
