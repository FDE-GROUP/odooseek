// Auto-generated from event.stage (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.stage */
export interface EventStageRecord extends BaseRecord {
  /** Stage Name */
  name: string
  /** Stage description */
  description: string | false
  /** Sequence */
  sequence: number | false
  /** Folded in Kanban */
  fold: boolean
  /** End Stage — Events will automatically be moved into this stage when they are finished. The event moved into this stage will automatically be set as green. */
  pipe_end: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.stage */
export type EventStageFieldName = ModelFieldName<EventStageRecord>

/** Typed search_read result */
export type EventStageSearchResult = ModelRecord<EventStageRecord>
