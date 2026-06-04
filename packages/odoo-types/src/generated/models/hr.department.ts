// Auto-generated from hr.department (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.department */
export interface HrDepartmentRecord extends BaseRecord {
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
  /** Department Name */
  name: string
  /** Complete Name */
  complete_name: string | false
  /** Active */
  active: boolean
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Parent Department */
  parent_id: [number, string] /* hr.department */ | false
  /** Child Departments */
  child_ids: number[] /* hr.department */
  /** Manager */
  manager_id: [number, string] /* hr.employee */ | false
  /** Members */
  member_ids: number[] /* hr.employee */
  /** Has Read Access */
  has_read_access: boolean
  /** Total Employee */
  total_employee: number | false
  /** Jobs */
  jobs_ids: number[] /* hr.job */
  /** Plan */
  plan_ids: number[] /* mail.activity.plan */
  /** Plans Count */
  plans_count: number | false
  /** Note */
  note: string | false
  /** Color Index */
  color: number | false
  /** Parent Path */
  parent_path: string | false
  /** Master Department */
  master_department_id: [number, string] /* hr.department */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** New Applicant */
  new_applicant_count: number | false
  /** New Hired Employee */
  new_hired_employee: number | false
  /** Expected Employee */
  expected_employee: number | false
  /** Expenses to Approve */
  expenses_to_approve_count: number | false
}

/** Field names for hr.department */
export type HrDepartmentFieldName = ModelFieldName<HrDepartmentRecord>

/** Typed search_read result */
export type HrDepartmentSearchResult = ModelRecord<HrDepartmentRecord>
