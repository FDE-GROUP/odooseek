// Auto-generated from event.stage (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.stage */
export interface EventStageRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Stage description */
  description: string | false
  /** Folded in Kanban */
  fold: boolean
  /** Stage Name */
  name: string
  /** End Stage — Events will automatically be moved into this stage when they are finished. The event moved into this stage will automatically be set as green. */
  pipe_end: boolean
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for event.stage */
export type EventStageFieldName = ModelFieldName<EventStageRecord>

/** Typed search_read result */
export type EventStageSearchResult = ModelRecord<EventStageRecord>
