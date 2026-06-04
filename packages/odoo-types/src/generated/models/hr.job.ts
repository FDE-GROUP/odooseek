// Auto-generated from hr.job (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.job */
export interface HrJobRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Activity Count */
  activity_count: number | false
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
  /** Job Location — Select the location where the applicant will work. Addresses listed here are defined on the company\'s contact information. */
  address_id: [number, string] /* res.partner */ | false
  /** Custom Bounced Message — If set, this content will automatically be sent out to unauthorized users instead of the default message. */
  alias_bounced_content: string | false
  /** Alias Contact Security — Policy to post a message on the document using the mailgateway.
- everyone: everyone can post
- partners: only authenticated partners
- followers: only followers of the related document or members of following channels
 */
  alias_contact: 'everyone' | 'partners' | 'followers' | 'employees'
  /** Default Values — A Python dictionary that will be evaluated to provide default values when creating new records for this alias. */
  alias_defaults: string
  /** Alias Domain Name — Email domain e.g. \'example.com\' in \'odoo@example.com\' */
  alias_domain: string | false
  /** Alias Domain */
  alias_domain_id: [number, string] /* mail.alias.domain */ | false
  /** Email Alias */
  alias_email: string | false
  /** Record Thread ID — Optional ID of a thread (record) to which all incoming messages will be attached, even if they did not reply to it. If set, this will disable the creation of new records completely. */
  alias_force_thread_id: number | false
  /** Alias Email */
  alias_full_name: string | false
  /** Alias — Email alias for this job position. New emails will automatically create new applicants for this job position. */
  alias_id: [number, string] /* mail.alias */
  /** Local-part based incoming detection */
  alias_incoming_local: boolean
  /** Aliased Model — The model (Odoo Document Kind) to which this alias corresponds. Any incoming email that does not reply to an existing record will cause the creation of a new record of this model (e.g. a Project Task) */
  alias_model_id: [number, string] /* ir.model */
  /** Alias Name — The name of the email alias, e.g. \'jobs\' if you want to catch emails for <jobs@example.odoo.com> */
  alias_name: string | false
  /** Parent Model — Parent model holding the alias. The model holding the alias reference is not necessarily the model given by alias_model_id (example: project (parent_model) and task (model)) */
  alias_parent_model_id: [number, string] /* ir.model */ | false
  /** Parent Record Thread ID — ID of the parent record holding the alias (example: project holding the task creation alias) */
  alias_parent_thread_id: number | false
  /** Alias Status — Alias status assessed on the last message received. */
  alias_status: 'not_tested' | 'valid' | 'invalid' | false
  /** All Application Count */
  all_application_count: number | false
  /** Allowed User */
  allowed_user_ids: number[] /* res.users */ | false
  /** Applicants Hired */
  applicant_hired: number | false
  /** Matching Score(%) */
  applicant_matching_score: number | false
  /** Applicant Properties */
  applicant_properties_definition: unknown | false
  /** Application Count */
  application_count: number | false
  /** Job Applications */
  application_ids: number[] /* hr.applicant */
  /** Can Publish */
  can_publish: boolean
  /** Color Index */
  color: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Employment Type */
  contract_type_id: [number, string] /* hr.contract.type */ | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Current Job Skill */
  current_job_skill_ids: number[] /* hr.job.skill */
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Job Description */
  description: string | false
  /** Documents */
  document_ids: number[] /* ir.attachment */
  /** Document Count */
  documents_count: number | false
  /** Employee Count */
  employee_count: number | false
  /** Employees */
  employee_ids: number[] /* hr.employee */
  /** Expected Degree */
  expected_degree: [number, string] /* hr.recruitment.degree */ | false
  /** Total Forecasted Employees — Expected number of employees for this job position after new recruitment. */
  expected_employees: number | false
  /** Extended Interviewer */
  extended_interviewer_ids: number[] /* res.users */ | false
  /** Favorite User */
  favorite_user_ids: number[] /* res.users */ | false
  /** job URL */
  full_url: string | false
  /** Has Message */
  has_message: boolean
  /** Industry */
  industry_id: [number, string] /* res.partner.industry */ | false
  /** Interviewers — The Interviewers set on the job position can see all Applicants in it. They have access to the information, the attachments, the meeting management and they can refuse him. You don\'t need to have Recruitment rights to be set as an interviewer. */
  interviewer_ids: number[] /* res.users */ | false
  /** Is Favorite */
  is_favorite: boolean
  /** Is Published */
  is_published: boolean
  /** SEO optimized */
  is_seo_optimized: boolean
  /** Process Details — Complementary information that will appear on the job submission page */
  job_details: string | false
  /** Properties */
  job_properties: unknown | false
  /** Skills */
  job_skill_ids: number[] /* hr.job.skill */
  /** Job Source */
  job_source_ids: number[] /* hr.recruitment.source */
  /** Department Manager */
  manager_id: [number, string] /* hr.employee */ | false
  /** Attachment Count */
  message_attachment_count: number | false
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
  /** Job Position */
  name: string
  /** New Application — Number of applications that are new in the flow (typically at first step of the flow) */
  new_application_count: number | false
  /** Current Number of Employees — Number of employees currently occupying this job position. */
  no_of_employee: number | false
  /** Hired — Number of hired employees for this job position during recruitment phase. */
  no_of_hired_employee: number | false
  /** Target — Number of new employees you expect to recruit. */
  no_of_recruitment: number | false
  /** Old Application */
  old_application_count: number | false
  /** Open Application Count — Number of applications that are still ongoing (not hired or refused) */
  open_application_count: number | false
  /** Published Date */
  published_date: string | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Requirements */
  requirements: string | false
  /** Seo name */
  seo_name: string | false
  /** Sequence */
  sequence: number | false
  /** Skill */
  skill_ids: number[] /* hr.skill */ | false
  /** Recruiter — The Recruiter will be the default value for all Applicants in this job             position. The Recruiter is automatically added to all meetings with the Applicant. */
  user_id: [number, string] /* res.users */ | false
  /** Website Absolute URL — The full absolute URL to access the document through the website. */
  website_absolute_url: string | false
  /** Website description */
  website_description: string | false
  /** Website — Restrict to a specific website. */
  website_id: [number, string] /* website */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Website meta description */
  website_meta_description: string | false
  /** Website meta keywords */
  website_meta_keywords: string | false
  /** Website opengraph image */
  website_meta_og_img: string | false
  /** Website meta title */
  website_meta_title: string | false
  /** Visible on current website — Set if the application is published on the website of the company. */
  website_published: boolean
  /** Website URL — The full relative URL to access the document through the website. */
  website_url: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.job */
export type HrJobFieldName = ModelFieldName<HrJobRecord>

/** Typed search_read result */
export type HrJobSearchResult = ModelRecord<HrJobRecord>
