// Auto-generated from event.event.ticket (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.event.ticket */
export interface EventEventTicketRecord extends BaseRecord {
  /** Sequence */
  sequence: number | false
  /** Name */
  name: string
  /** Description — A description of the ticket that you want to communicate to your customers. */
  description: string | false
  /** Event Category */
  event_type_id: [number, string] /* event.type */ | false
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
  /** Event */
  event_id: [number, string] /* event.event */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Registration Start */
  start_sale_datetime: string | false
  /** Registration End */
  end_sale_datetime: string | false
  /** Are sales launched */
  is_launched: boolean
  /** Is Expired */
  is_expired: boolean
  /** Is Available — Whether it is possible to sell these tickets */
  sale_available: boolean
  /** Registrations */
  registration_ids: number[] /* event.registration */
  /** Reserved Seats */
  seats_reserved: number | false
  /** Available Seats */
  seats_available: number | false
  /** Used Seats */
  seats_used: number | false
  /** Taken Seats */
  seats_taken: number | false
  /** Limit per Order — Maximum of this product per order.
Set to 0 to ignore this rule */
  limit_max_per_order: number | false
  /** Sold Out — Whether seats are not available for this ticket. */
  is_sold_out: boolean
  /** Color */
  color: string | false
  /** Price Reduce Tax inc */
  price_reduce_taxinc: number | false
  /** Price include */
  price_incl: number | false
}

/** Field names for event.event.ticket */
export type EventEventTicketFieldName = ModelFieldName<EventEventTicketRecord>

/** Typed search_read result */
export type EventEventTicketSearchResult = ModelRecord<EventEventTicketRecord>
