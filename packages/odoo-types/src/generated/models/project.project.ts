// Auto-generated from project.project (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.project */
export interface ProjectProjectRecord extends BaseRecord {
  /** Project Account */
  account_id: [number, string] /* account.analytic.account */ | false
  /** Analytic Account */
  auto_account_id: [number, string] /* account.analytic.account */ | false
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
  /** Days Rotting — Day count since this resource was last updated */
  rotting_days: number | false
  /** Rotting */
  is_rotting: boolean
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
  /** Rating Satisfaction — Percentage of happy ratings */
  rating_percentage_satisfaction: number | false
  /** # Ratings */
  rating_count: number | false
  /** Average Rating */
  rating_avg: number | false
  /** Average Rating (%) */
  rating_avg_percentage: number | false
  /** Alias — Internal email associated with this project. Incoming emails are automatically synchronized with Tasks (or optionally Issues if the Issue Tracker module is installed). */
  alias_id: [number, string] /* mail.alias */
  /** Alias Name — The name of the email alias, e.g. \'jobs\' if you want to catch emails for <jobs@example.odoo.com> */
  alias_name: string | false
  /** Alias Domain */
  alias_domain_id: [number, string] /* mail.alias.domain */ | false
  /** Alias Domain Name — Email domain e.g. \'example.com\' in \'odoo@example.com\' */
  alias_domain: string | false
  /** Default Values — A Python dictionary that will be evaluated to provide default values when creating new records for this alias. */
  alias_defaults: string
  /** Email Alias */
  alias_email: string | false
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Security Token */
  access_token: string | false
  /** Access warning */
  access_warning: string | false
  /** Name */
  name: string
  /** Description — Description to provide more information and context about this project */
  description: string | false
  /** Active */
  active: boolean
  /** Sequence */
  sequence: number | false
  /** Customer */
  partner_id: [number, string] /* res.partner */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Balance */
  analytic_account_balance: number | false
  /** Members */
  favorite_user_ids: number[] /* res.users */ | false
  /** Show Project on Dashboard */
  is_favorite: boolean
  /** Use Tasks as — Name used to refer to the tasks of your project e.g. tasks, tickets, sprints, etc... */
  label_tasks: string | false
  /** Task Activities */
  tasks: number[] /* project.task */
  /** Working Time */
  resource_calendar_id: [number, string] /* resource.calendar */ | false
  /** Tasks Stages */
  type_ids: number[] /* project.task.type */ | false
  /** Task Count */
  task_count: number | false
  /** Open Task Count */
  open_task_count: number | false
  /** Tasks */
  task_ids: number[] /* project.task */
  /** Color Index */
  color: number | false
  /** Project Manager */
  user_id: [number, string] /* res.users */ | false
  /** Visibility — Project and Task Visibility:
- Invited internal users: Can access only the project or tasks they follow. Assignees automatically get access.
- Invited internal and portal users: Same as above, extended to portal users.
- All internal users: Full access to the project and all its tasks.
- All internal and invited portal users: Internal users get full access. Portal users can access only the project or tasks they follow.

Portal Access Levels:
- Read-only: Portal users see tasks via their portal but can’t edit them.
- Edit (limited): Portal users access kanban/list views and can edit limited fields on followed tasks.
- Edit: Same as above, with access to all tasks.

Other Rules:
- Internal users can open a task from a direct link, even without project access.
- Project admins have access to private projects, even if not followers.
 */
  privacy_visibility: 'followers' | 'invited_users' | 'employees' | 'portal'
  /** Privacy Visibility Warning */
  privacy_visibility_warning: string | false
  /** Access Instruction Message */
  access_instruction_message: string | false
  /** Start Date */
  date_start: string | false
  /** Expiration Date — Date on which this project ends. The timeframe defined on the project is taken into account when viewing its planning. */
  date: string | false
  /** Task Dependencies */
  allow_task_dependencies: boolean
  /** Milestones */
  allow_milestones: boolean
  /** Recurring Tasks */
  allow_recurring_tasks: boolean
  /** Tags */
  tag_ids: number[] /* project.tags */ | false
  /** Task Properties */
  task_properties_definition: unknown | false
  /** Closed Task Count */
  closed_task_count: number | false
  /** Task Completion Percentage */
  task_completion_percentage: number | false
  /** Collaborators */
  collaborator_ids: number[] /* project.collaborator */
  /** # Collaborators */
  collaborator_count: number | false
  /** Stage Color */
  stage_id_color: number | false
  /** Update */
  update_ids: number[] /* project.update */
  /** Update Count */
  update_count: number | false
  /** Last Update */
  last_update_id: [number, string] /* project.update */ | false
  /** Last Update Status */
  last_update_status: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'to_define' | 'done'
  /** Last Update Color */
  last_update_color: number | false
  /** Milestone */
  milestone_ids: number[] /* project.milestone */
  /** Milestone Count */
  milestone_count: number | false
  /** Milestone Count Reached */
  milestone_count_reached: number | false
  /** Is Milestone Exceeded */
  is_milestone_exceeded: boolean
  /** Milestones Reached */
  milestone_progress: number | false
  /** Next Milestone */
  next_milestone_id: [number, string] /* project.milestone */ | false
  /** Can Mark Milestone As Done */
  can_mark_milestone_as_done: boolean
  /** Is Milestone Deadline Exceeded */
  is_milestone_deadline_exceeded: boolean
  /** Is Template */
  is_template: boolean
  /** Show Ratings */
  show_ratings: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Bom Count */
  bom_count: number | false
  /** Production Count */
  production_count: number | false
  /** # Purchase Orders */
  purchase_orders_count: number | false
  /** Billable */
  allow_billable: boolean
  /** Sales Order Item — Sales order item that will be selected by default on the tasks and timesheets of this project, except if the employee set on the timesheets is explicitely linked to another sales order item on the project.
It can be modified on each task and timesheet entry individually if necessary. */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Order Reference */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Has SO to Invoice */
  has_any_so_to_invoice: boolean
  /** Sale Order Line Count */
  sale_order_line_count: number | false
  /** Sale Order Count */
  sale_order_count: number | false
  /** Has a SO with an invoice status of No */
  has_any_so_with_nothing_to_invoice: boolean
  /** Display Sales Stat Buttons */
  display_sales_stat_buttons: boolean
  /** Status */
  sale_order_state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Sales Order — Products added to stock pickings, whose operation type is configured to generate analytic costs, will be re-invoiced in this sales order if they are set up for it. */
  reinvoiced_sale_order_id: [number, string] /* sale.order */ | false
  /** Departments */
  x_plan2_id: [number, string] /* account.analytic.account */ | false
  /** Internal */
  x_plan3_id: [number, string] /* account.analytic.account */ | false
  /** Alias Email */
  alias_full_name: string | false
  /** Aliased Model — The model (Odoo Document Kind) to which this alias corresponds. Any incoming email that does not reply to an existing record will cause the creation of a new record of this model (e.g. a Project Task) */
  alias_model_id: [number, string] /* ir.model */
  /** Record Thread ID — Optional ID of a thread (record) to which all incoming messages will be attached, even if they did not reply to it. If set, this will disable the creation of new records completely. */
  alias_force_thread_id: number | false
  /** Parent Model — Parent model holding the alias. The model holding the alias reference is not necessarily the model given by alias_model_id (example: project (parent_model) and task (model)) */
  alias_parent_model_id: [number, string] /* ir.model */ | false
  /** Parent Record Thread ID — ID of the parent record holding the alias (example: project holding the task creation alias) */
  alias_parent_thread_id: number | false
  /** Alias Contact Security — Policy to post a message on the document using the mailgateway.
- everyone: everyone can post
- partners: only authenticated partners
- followers: only followers of the related document or members of following channels
 */
  alias_contact: 'everyone' | 'partners' | 'followers' | 'employees'
  /** Local-part based incoming detection */
  alias_incoming_local: boolean
  /** Custom Bounced Message — If set, this content will automatically be sent out to unauthorized users instead of the default message. */
  alias_bounced_content: string | false
  /** Alias Status — Alias status assessed on the last message received. */
  alias_status: 'not_tested' | 'valid' | 'invalid' | false
}

/** Field names for project.project */
export type ProjectProjectFieldName = ModelFieldName<ProjectProjectRecord>

/** Typed search_read result */
export type ProjectProjectSearchResult = ModelRecord<ProjectProjectRecord>
