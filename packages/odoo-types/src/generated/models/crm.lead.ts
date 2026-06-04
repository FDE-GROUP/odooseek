// Auto-generated from crm.lead (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** crm.lead */
export interface CrmLeadRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Automated Probability */
  automated_probability: number | false
  /** Meetings */
  calendar_event_ids: number[] /* calendar.event */
  /** Campaign — This is a name that helps you keep track of your different campaign efforts, e.g. Fall_Drive, Christmas_Special */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** City */
  city: string | false
  /** Color Index */
  color: number | false
  /** Customer Company */
  commercial_partner_id: [number, string] /* res.partner */ | false
  /** Currency */
  company_currency: [number, string] /* res.currency */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Contact Name */
  contact_name: string | false
  /** Country */
  country_id: [number, string] /* res.country */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Last Action */
  date_automation_last: string | false
  /** Closed Date */
  date_closed: string | false
  /** Conversion Date */
  date_conversion: string | false
  /** Expected Closing — Estimate of the date on which the opportunity will be won. */
  date_deadline: string | false
  /** Last Stage Update */
  date_last_stage_update: string | false
  /** Assignment Date */
  date_open: string | false
  /** Days to Close */
  day_close: number | false
  /** Days to Assign */
  day_open: number | false
  /** Notes */
  description: string | false
  /** Potential Duplicate Lead Count */
  duplicate_lead_count: number | false
  /** Potential Duplicate Lead */
  duplicate_lead_ids: number[] /* crm.lead */ | false
  /** Status time — JSON that maps ids from a many2one field to seconds spent */
  duration_tracking: unknown | false
  /** Email cc */
  email_cc: string | false
  /** Email Domain Criterion */
  email_domain_criterion: string | false
  /** Email */
  email_from: string | false
  /** Normalized Email — This field is used to search on email address as the primary email field can contain more than strictly an email address. */
  email_normalized: string | false
  /** Email Quality */
  email_state: 'correct' | 'incorrect' | false
  /** Source Event — Event triggering the rule that created this lead */
  event_id: [number, string] /* event.event */ | false
  /** Registration Rule — Rule that created this lead */
  event_lead_rule_id: [number, string] /* event.lead.rule */ | false
  /** Expected Revenue */
  expected_revenue: number | false
  /** Job Position */
  _function: string | false
  /** Has Message */
  has_message: boolean
  /** Enrichment done — Whether IAP service for lead enrichment based on email has been performed on this lead. */
  iap_enrich_done: boolean
  /** Is automated probability? */
  is_automated_probability: boolean
  /** Blacklist — If the email address is on the blacklist, the contact won\'t receive mass mailing anymore, from any list */
  is_blacklisted: boolean
  /** Is Partner Visible */
  is_partner_visible: boolean
  /** Rotting */
  is_rotting: boolean
  /** Lang Active Count */
  lang_active_count: number | false
  /** Locale Code — This field is used to set/get locales for user */
  lang_code: string | false
  /** Language */
  lang_id: [number, string] /* res.lang */ | false
  /** Lead Mining Request */
  lead_mining_request_id: [number, string] /* crm.iap.lead.mining.request */ | false
  /** Properties */
  lead_properties: unknown | false
  /** Lost Reason */
  lost_reason_id: [number, string] /* crm.lost.reason */ | false
  /** Medium — This is the method of delivery, e.g. Postcard, Email, or Banner Ad */
  medium_id: [number, string] /* utm.medium */ | false
  /** Meeting Display Date */
  meeting_display_date: string | false
  /** Meeting Display Label */
  meeting_display_label: string | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Bounce — Counter of the number of bounced emails for this contact */
  message_bounce: number | false
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Is Follower */
  message_is_follower: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Opportunity */
  name: string
  /** Orders */
  order_ids: number[] /* sale.order */
  /** Live chat from which the lead was created */
  origin_channel_id: [number, string] /* discuss.channel */ | false
  /** Partner Email will Update */
  partner_email_update: boolean
  /** Contact — Linked partner (optional). Usually created when converting the lead. You can find a partner by its Name, TIN, Email or Internal Reference. */
  partner_id: [number, string] /* res.partner */ | false
  /** Partner is blacklisted — If the email address is on the blacklist, the contact won\'t receive mass mailing anymore, from any list */
  partner_is_blacklisted: boolean
  /** Company Name — The name of the future partner company that will be created while converting the lead into opportunity */
  partner_name: string | false
  /** Partner Phone will Update */
  partner_phone_update: boolean
  /** Phone */
  phone: string | false
  /** Blacklisted Phone is Phone — Indicates if a blacklisted sanitized phone number is a phone number. Helps distinguish which number is blacklisted             when there is both a mobile and phone field in a model. */
  phone_blacklisted: boolean
  /** Phone Number */
  phone_mobile_search: string | false
  /** Sanitized Number — Field used to store sanitized phone number. Helps speeding up searches and comparisons. */
  phone_sanitized: string | false
  /** Phone Blacklisted — If the sanitized phone number is on the blacklist, the contact won\'t receive mass mailing sms anymore, from any list */
  phone_sanitized_blacklisted: boolean
  /** Phone Quality */
  phone_state: 'correct' | 'incorrect' | false
  /** Priority */
  priority: '0' | '1' | '2' | '3' | false
  /** Probability */
  probability: number | false
  /** Prorated Revenue */
  prorated_revenue: number | false
  /** Number of Quotations */
  quotation_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Recurring Plan */
  recurring_plan: [number, string] /* crm.recurring.plan */ | false
  /** Recurring Revenues */
  recurring_revenue: number | false
  /** Expected MRR */
  recurring_revenue_monthly: number | false
  /** Prorated MRR */
  recurring_revenue_monthly_prorated: number | false
  /** Prorated Recurring Revenues */
  recurring_revenue_prorated: number | false
  /** Referred By */
  referred: string | false
  /** # Registrations — Counter for the registrations linked to this lead */
  registration_count: number | false
  /** Source Registrations — Registrations triggering the rule that created this lead */
  registration_ids: number[] /* event.registration */ | false
  /** Reveal ID */
  reveal_id: string | false
  /** Days Rotting — Day count since this resource was last updated */
  rotting_days: number | false
  /** Sum of Orders — Untaxed Total of Confirmed Orders */
  sale_amount_total: number | false
  /** Number of Sale Orders */
  sale_order_count: number | false
  /** Allow manual enrich */
  show_enrich_button: boolean
  /** Source — This is the source of the link, e.g. Search Engine, another domain, or name of email list */
  source_id: [number, string] /* utm.source */ | false
  /** Stage */
  stage_id: [number, string] /* crm.stage */ | false
  /** Stage Color */
  stage_id_color: number | false
  /** State */
  state_id: [number, string] /* res.country.state */ | false
  /** Street */
  street: string | false
  /** Street2 */
  street2: string | false
  /** Tags — Classify and analyze your lead/opportunity categories like: Training, Service */
  tag_ids: number[] /* crm.tag */ | false
  /** Sales Team */
  team_id: [number, string] /* crm.team */ | false
  /** Type */
  _type: 'lead' | 'opportunity'
  /** User Company — UX: Limit to lead company or all if no company */
  user_company_ids: number[] /* res.company */ | false
  /** Salesperson */
  user_id: [number, string] /* res.users */ | false
  /** Web Visitors */
  visitor_ids: number[] /* website.visitor */ | false
  /** # Page Views */
  visitor_page_count: number | false
  /** # Sessions */
  visitor_sessions_count: number | false
  /** Website — Website of the contact */
  website: string | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Won/Lost */
  won_status: 'won' | 'lost' | 'pending' | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Zip */
  zip: string | false
}

/** Field names for crm.lead */
export type CrmLeadFieldName = ModelFieldName<CrmLeadRecord>

/** Typed search_read result */
export type CrmLeadSearchResult = ModelRecord<CrmLeadRecord>
