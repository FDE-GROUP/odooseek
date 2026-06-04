// Auto-generated from event.tag (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.tag */
export interface EventTagRecord extends BaseRecord {
  /** Website — Restrict to a specific website. */
  website_id: [number, string] /* website */ | false
  /** Visible on current website */
  website_published: boolean
  /** Is Published */
  is_published: boolean
  /** Can Publish */
  can_publish: boolean
  /** Website URL — The full relative URL to access the document through the website. */
  website_url: string | false
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Category */
  category_id: [number, string] /* event.tag.category */
  /** Category Sequence */
  category_sequence: number | false
  /** Color Index — Tag color. No color means no display in kanban or front-end, to distinguish internal tags from public categorization tags. */
  color: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for event.tag */
export type EventTagFieldName = ModelFieldName<EventTagRecord>

/** Typed search_read result */
export type EventTagSearchResult = ModelRecord<EventTagRecord>
