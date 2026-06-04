// Auto-generated from hr.applicant (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.applicant */
export interface HrApplicantRecord extends BaseRecord {
  /** Active — If the active field is set to false, it will allow you to hide the case without removing it. */
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
  /** Applicant Notes */
  applicant_notes: string | false
  /** Properties */
  applicant_properties: unknown | false
  /** Skills */
  applicant_skill_ids: number[] /* hr.applicant.skill */
  /** Application Count — Applications with the same email or phone or mobile */
  application_count: number | false
  /** Application Status */
  application_status: 'ongoing' | 'hired' | 'refused' | 'archived' | false
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */
  /** Number of Attachments */
  attachment_number: number | false
  /** Availability — The date at which the applicant will be available to start working */
  availability: string | false
  /** Campaign — This is a name that helps you keep track of your different campaign efforts, e.g. Fall_Drive, Christmas_Special */
  campaign_id: [number, string] /* utm.campaign */ | false
  /** Tags */
  categ_ids: number[] /* hr.applicant.category */ | false
  /** Color Index */
  color: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Applied on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Current Applicant Skill */
  current_applicant_skill_ids: number[] /* hr.applicant.skill */
  /** Hire Date */
  date_closed: string | false
  /** Last Stage Update */
  date_last_stage_update: string | false
  /** Assigned */
  date_open: string | false
  /** Days to Close */
  day_close: number | false
  /** Days to Open */
  day_open: number | false
  /** Delay to Close — Number of days to close */
  delay_close: number | false
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Status time — JSON that maps ids from a many2one field to seconds spent */
  duration_tracking: unknown | false
  /** Email cc */
  email_cc: string | false
  /** Email */
  email_from: string | false
  /** Normalized Email — This field is used to search on email address as the primary email field can contain more than strictly an email address. */
  email_normalized: string | false
  /** Employee Active — If the active field is set to False, it will allow you to hide the resource record without removing it. */
  emp_is_active: boolean
  /** Employee — Employee linked to the applicant. */
  employee_id: [number, string] /* hr.employee */ | false
  /** Employee Name */
  employee_name: string | false
  /** Has Message */
  has_message: boolean
  /** Interviewers */
  interviewer_ids: number[] /* res.users */ | false
  /** Is Applicant In Pool */
  is_applicant_in_pool: boolean
  /** Blacklist — If the email address is on the blacklist, the contact won\'t receive mass mailing anymore, from any list */
  is_blacklisted: boolean
  /** Is Pool Applicant */
  is_pool_applicant: boolean
  /** Rotting */
  is_rotting: boolean
  /** Job Position */
  job_id: [number, string] /* hr.job */ | false
  /** Kanban State */
  kanban_state: 'normal' | 'done' | 'waiting' | 'blocked'
  /** Last Stage — Stage of the applicant before being in the current stage. Used for lost cases analysis. */
  last_stage_id: [number, string] /* hr.recruitment.stage */ | false
  /** Kanban Blocked */
  legend_blocked: string | false
  /** Kanban Valid */
  legend_done: string | false
  /** Kanban Ongoing */
  legend_normal: string | false
  /** Kanban Waiting */
  legend_waiting: string | false
  /** LinkedIn Profile */
  linkedin_profile: string | false
  /** Matching Score */
  matching_score: number | false
  /** Matching Skills */
  matching_skill_ids: number[] /* hr.skill */ | false
  /** Medium — This displays how the applicant has reached out, e.g. via Email, LinkedIn, Website, etc. */
  medium_id: [number, string] /* utm.medium */ | false
  /** Meeting Display Date */
  meeting_display_date: string | false
  /** Meeting Display Text */
  meeting_display_text: string | false
  /** Meetings */
  meeting_ids: number[] /* calendar.event */
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
  /** Main Attachment */
  message_main_attachment_id: [number, string] /* ir.attachment */ | false
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Missing Skills */
  missing_skill_ids: number[] /* hr.skill */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Contact */
  partner_id: [number, string] /* res.partner */ | false
  /** Applicant\'s Name */
  partner_name: string | false
  /** Phone */
  partner_phone: string | false
  /** Sanitized Phone Number */
  partner_phone_sanitized: string | false
  /** Blacklisted Phone is Phone — Indicates if a blacklisted sanitized phone number is a phone number. Helps distinguish which number is blacklisted             when there is both a mobile and phone field in a model. */
  phone_blacklisted: boolean
  /** Phone Number */
  phone_mobile_search: string | false
  /** Sanitized Number — Field used to store sanitized phone number. Helps speeding up searches and comparisons. */
  phone_sanitized: string | false
  /** Phone Blacklisted — If the sanitized phone number is on the blacklist, the contact won\'t receive mass mailing sms anymore, from any list */
  phone_sanitized_blacklisted: boolean
  /** Pool Applicant */
  pool_applicant_id: [number, string] /* hr.applicant */ | false
  /** Evaluation */
  priority: '0' | '1' | '2' | '3' | false
  /** Probability */
  probability: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Refuse Date */
  refuse_date: string | false
  /** Refuse Reason */
  refuse_reason_id: [number, string] /* hr.applicant.refuse.reason */ | false
  /** Days Rotting — Day count since this resource was last updated */
  rotting_days: number | false
  /** Expected — Salary Expected by Applicant */
  salary_expected: number | false
  /** Expected Salary Extra — Salary Expected by Applicant, extra advantages */
  salary_expected_extra: string | false
  /** Proposed — Salary Proposed by the Organisation */
  salary_proposed: number | false
  /** Proposed Salary Extra — Salary Proposed by the Organisation, extra advantages */
  salary_proposed_extra: string | false
  /** Sequence */
  sequence: number | false
  /** Skill */
  skill_ids: number[] /* hr.skill */ | false
  /** Source — This is the source of the link, e.g. Search Engine, another domain, or name of email list */
  source_id: [number, string] /* utm.source */ | false
  /** Stage */
  stage_id: [number, string] /* hr.recruitment.stage */ | false
  /** Talent Pool Count */
  talent_pool_count: number | false
  /** Talent Pools */
  talent_pool_ids: number[] /* hr.talent.pool */ | false
  /** Degree */
  type_id: [number, string] /* hr.recruitment.degree */ | false
  /** User Email */
  user_email: string | false
  /** Recruiter */
  user_id: [number, string] /* res.users */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.applicant */
export type HrApplicantFieldName = ModelFieldName<HrApplicantRecord>

/** Typed search_read result */
export type HrApplicantSearchResult = ModelRecord<HrApplicantRecord>
