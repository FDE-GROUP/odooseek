// Auto-generated from event.registration (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** event.registration */
export interface EventRegistrationRecord extends BaseRecord {
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Is Follower */
  message_is_follower: boolean
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Has Message */
  has_message: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Event */
  event_id: [number, string] /* event.event */
  /** Is Event Multi Slots — Allow multiple time slots. The communications, the maximum number of attendees and the maximum number of tickets registrations are defined for each time slot instead of the whole event. */
  is_multi_slots: boolean
  /** Slot */
  event_slot_id: [number, string] /* event.slot */ | false
  /** Ticket Type */
  event_ticket_id: [number, string] /* event.event.ticket */ | false
  /** Active */
  active: boolean
  /** Barcode */
  barcode: string | false
  /** Campaign */
  utm_campaign_id: [number, string] /* utm.campaign */ | false
  /** Source */
  utm_source_id: [number, string] /* utm.source */ | false
  /** Medium */
  utm_medium_id: [number, string] /* utm.medium */ | false
  /** Booked by */
  partner_id: [number, string] /* res.partner */ | false
  /** Attendee Name */
  name: string | false
  /** Email */
  email: string | false
  /** Phone */
  phone: string | false
  /** Company Name */
  company_name: string | false
  /** Attended Date */
  date_closed: string | false
  /** Event Start Date */
  event_begin_date: string | false
  /** Event End Date */
  event_end_date: string | false
  /** Date Range */
  event_date_range: string | false
  /** Event Organizer */
  event_organizer_id: [number, string] /* res.partner */ | false
  /** Event Responsible */
  event_user_id: [number, string] /* res.users */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Status — Unconfirmed: registrations in a pending state waiting for an action (specific case, notably with sale status)
Registered: registrations considered taken by a client
Attended: registrations for which the attendee attended the event
Cancelled: registrations cancelled manually */
  state: 'draft' | 'open' | 'done' | 'cancel' | false
  /** Attendee Answers */
  registration_answer_ids: number[] /* event.registration.answer */
  /** Attendee Selection Answers */
  registration_answer_choice_ids: number[] /* event.registration.answer */
  /** Scheduler Emails */
  mail_registration_ids: number[] /* event.mail.registration */
  /** Properties */
  registration_properties: unknown | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Leads */
  lead_ids: number[] /* crm.lead */ | false
  /** # Leads */
  lead_count: number | false
  /** Sale Status */
  sale_status: 'to_pay' | 'sold' | 'free' | false
  /** Visitor */
  visitor_id: [number, string] /* website.visitor */ | false
  /** Sales Order */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Sales Order Line */
  sale_order_line_id: [number, string] /* sale.order.line */ | false
}

/** Field names for event.registration */
export type EventRegistrationFieldName = ModelFieldName<EventRegistrationRecord>

/** Typed search_read result */
export type EventRegistrationSearchResult = ModelRecord<EventRegistrationRecord>
