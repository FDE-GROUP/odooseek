// Auto-generated from event.type.ticket (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.type.ticket */
export interface EventTypeTicketRecord extends BaseRecord {
  /** Sequence */
  sequence: number | false
  /** Name */
  name: string
  /** Description — A description of the ticket that you want to communicate to your customers. */
  description: string | false
  /** Event Category */
  event_type_id: [number, string] /* event.type */
  /** Limit Attendees */
  seats_limited: boolean
  /** Maximum Attendees — Define the number of available tickets. If you have too many registrations you will not be able to sell tickets anymore. Set 0 to ignore this rule set as unlimited. */
  seats_max: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Price */
  price: number | false
  /** Price Reduce */
  price_reduce: number | false
}

/** Field names for event.type.ticket */
export type EventTypeTicketFieldName = ModelFieldName<EventTypeTicketRecord>

/** Typed search_read result */
export type EventTypeTicketSearchResult = ModelRecord<EventTypeTicketRecord>
