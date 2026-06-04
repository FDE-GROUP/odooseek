// Auto-generated from project.task.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.task.type */
export interface ProjectTaskTypeRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Projects — Projects in which this stage is present. If you follow a similar workflow in several projects, you can share this stage among them and get consolidated information this way. */
  project_ids: number[] /* project.project */ | false
  /** Email Template — If set, an email will be automatically sent to the customer when the task reaches this stage. */
  mail_template_id: [number, string] /* mail.template */ | false
  /** Color */
  color: number | false
  /** Folded */
  fold: boolean
  /** Rating Email Template — If set, a rating request will automatically be sent by email to the customer when the task reaches this stage. 
Alternatively, it will be sent at a regular interval as long as the task remains in this stage. */
  rating_template_id: [number, string] /* mail.template */ | false
  /** Automatic Kanban Status — Automatically modify the state when the customer replies to the feedback for this stage.
 * Good feedback from the customer will update the state to \'Approved\' (green bullet).
 * Neutral or bad feedback will set the kanban state to \'Changes Requested\' (orange bullet).
 */
  auto_validation_state: boolean
  /** Days to rot — Day count before tasks in this stage become stale. Set to 0 to disable         Changing this parameter will not affect the rotting status/date of resources last updated before this change. */
  rotting_threshold_days: number | false
  /** Stage Owner */
  user_id: [number, string] /* res.users */ | false
  /** Rating Request Deadline */
  rating_request_deadline: string | false
  /** Send a customer rating request */
  rating_active: boolean
  /** Customer Ratings Status — Collect feedback from your customers by sending them a rating request when a task enters a certain stage. To do so, define a rating email template on the stage.
Rating when changing stage: an email will be automatically sent when a task reaches the stage.
Periodic rating: an email will be automatically sent at regular intervals as long as the task remains in the stage. */
  rating_status: 'stage' | 'periodic'
  /** Rating Frequency */
  rating_status_period: 'daily' | 'weekly' | 'bimonthly' | 'monthly' | 'quarterly' | 'yearly'
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** SMS Template — If set, an SMS Text Message will be automatically sent to the customer when the task reaches this stage. */
  sms_template_id: [number, string] /* sms.template */ | false
  /** Show Rating Active */
  show_rating_active: boolean
}

/** Field names for project.task.type */
export type ProjectTaskTypeFieldName = ModelFieldName<ProjectTaskTypeRecord>

/** Typed search_read result */
export type ProjectTaskTypeSearchResult = ModelRecord<ProjectTaskTypeRecord>
