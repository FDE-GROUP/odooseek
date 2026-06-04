// Auto-generated from event.event.ticket (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.event.ticket */
export interface EventEventTicketRecord extends BaseRecord {
  /** Color */
  color: string | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Description — A description of the ticket that you want to communicate to your customers. */
  description: string | false
  /** Registration End */
  end_sale_datetime: string | false
  /** Event */
  event_id: [number, string] /* event.event */
  /** Event Category */
  event_type_id: [number, string] /* event.type */ | false
  /** Is Expired */
  is_expired: boolean
  /** Are sales launched */
  is_launched: boolean
  /** Sold Out — Whether seats are not available for this ticket. */
  is_sold_out: boolean
  /** Limit per Order — Maximum of this product per order.
Set to 0 to ignore this rule */
  limit_max_per_order: number | false
  /** Name */
  name: string
  /** Price */
  price: number | false
  /** Price include */
  price_incl: number | false
  /** Price Reduce */
  price_reduce: number | false
  /** Price Reduce Tax inc */
  price_reduce_taxinc: number | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Registrations */
  registration_ids: number[] /* event.registration */
  /** Is Available — Whether it is possible to sell these tickets */
  sale_available: boolean
  /** Available Seats */
  seats_available: number | false
  /** Limit Attendees */
  seats_limited: boolean
  /** Maximum Attendees — Define the number of available tickets. If you have too many registrations you will not be able to sell tickets anymore. Set 0 to ignore this rule set as unlimited. */
  seats_max: number | false
  /** Reserved Seats */
  seats_reserved: number | false
  /** Taken Seats */
  seats_taken: number | false
  /** Used Seats */
  seats_used: number | false
  /** Sequence */
  sequence: number | false
  /** Registration Start */
  start_sale_datetime: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for event.event.ticket */
export type EventEventTicketFieldName = ModelFieldName<EventEventTicketRecord>

/** Typed search_read result */
export type EventEventTicketSearchResult = ModelRecord<EventEventTicketRecord>
