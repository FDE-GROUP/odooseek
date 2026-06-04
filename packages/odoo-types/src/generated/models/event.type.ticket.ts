// Auto-generated from event.type.ticket (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.type.ticket */
export interface EventTypeTicketRecord extends BaseRecord {
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Description — A description of the ticket that you want to communicate to your customers. */
  description: string | false
  /** Event Category */
  event_type_id: [number, string] /* event.type */
  /** Name */
  name: string
  /** Price */
  price: number | false
  /** Price Reduce */
  price_reduce: number | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Limit Attendees */
  seats_limited: boolean
  /** Maximum Attendees — Define the number of available tickets. If you have too many registrations you will not be able to sell tickets anymore. Set 0 to ignore this rule set as unlimited. */
  seats_max: number | false
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for event.type.ticket */
export type EventTypeTicketFieldName = ModelFieldName<EventTypeTicketRecord>

/** Typed search_read result */
export type EventTypeTicketSearchResult = ModelRecord<EventTypeTicketRecord>
