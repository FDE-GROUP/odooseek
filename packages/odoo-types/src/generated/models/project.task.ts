// Auto-generated from project.task (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.task */
export interface ProjectTaskRecord extends BaseRecord {
  /** Security Token */
  access_token: string | false
  /** Portal Access URL — Customer Portal URL */
  access_url: string | false
  /** Access warning */
  access_warning: string | false
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
  /** Allocated Time */
  allocated_hours: number | false
  /** Billable */
  allow_billable: boolean
  /** Milestones */
  allow_milestones: boolean
  /** Recurring Tasks */
  allow_recurring_tasks: boolean
  /** Task Dependencies */
  allow_task_dependencies: boolean
  /** Attachments — Attachments that don\'t come from a message */
  attachment_ids: number[] /* ir.attachment */
  /** Sub-tasks */
  child_ids: number[] /* project.task */
  /** Closed Depending on Tasks */
  closed_depend_on_count: number | false
  /** Closed Sub-tasks Count */
  closed_subtask_count: number | false
  /** Color Index */
  color: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Created On */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Current User Same Company Partner */
  current_user_same_company_partner: boolean
  /** Assigning Date — Date on which this task was last assigned (or unassigned). Based on this, you can get statistics on the time it usually takes to assign tasks. */
  date_assign: string | false
  /** Deadline */
  date_deadline: string | false
  /** Ending Date */
  date_end: string | false
  /** Last Stage Update — Date on which the state of your task has last been modified.
Based on this information you can identify tasks that are stalling and get statistics on the time it usually takes to move tasks from one stage/state to another. */
  date_last_stage_update: string | false
  /** Depending on Tasks */
  depend_on_count: number | false
  /** Blocked By */
  depend_on_ids: number[] /* project.task */ | false
  /** Block */
  dependent_ids: number[] /* project.task */ | false
  /** Dependent Tasks */
  dependent_tasks_count: number | false
  /** Description */
  description: string | false
  /** Display Follow Button */
  display_follow_button: boolean
  /** Display In Project */
  display_in_project: boolean
  /** Display Parent Task Button */
  display_parent_task_button: boolean
  /** Display Sales Order */
  display_sale_order_button: boolean
  /** Cover Image */
  displayed_image_id: [number, string] /* ir.attachment */ | false
  /** Status time — JSON that maps ids from a many2one field to seconds spent */
  duration_tracking: unknown | false
  /** Email cc — Email addresses that were in the CC of the incoming emails from this task and that are not currently linked to an existing customer. */
  email_cc: string | false
  /** Email From */
  email_from: string | false
  /** Has Late And Unreached Milestone */
  has_late_and_unreached_milestone: boolean
  /** Has Message */
  has_message: boolean
  /** Has Project Template */
  has_project_template: boolean
  /** Has Template Ancestor */
  has_template_ancestor: boolean
  /** History data */
  html_field_history: unknown | false
  /** History metadata */
  html_field_history_metadata: unknown | false
  /** Closed state */
  is_closed: boolean
  /** Rotting */
  is_rotting: boolean
  /** Is Template */
  is_template: boolean
  /** Link Preview Name */
  link_preview_name: string | false
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
  /** Milestone — Deliver your services automatically when a milestone is reached by linking it to a sales order item. */
  milestone_id: [number, string] /* project.milestone */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Title */
  name: string
  /** Parent Task */
  parent_id: [number, string] /* project.task */ | false
  /** Company Name */
  partner_company_name: string | false
  /** Customer */
  partner_id: [number, string] /* res.partner */ | false
  /** Customer Name */
  partner_name: string | false
  /** Contact Number */
  partner_phone: string | false
  /** Personal Stage State — The current user\'s personal stage. */
  personal_stage_id: [number, string] /* project.task.stage.personal */ | false
  /** Personal Stage — The current user\'s personal task stage. */
  personal_stage_type_id: [number, string] /* project.task.type */ | false
  /** Personal Stages */
  personal_stage_type_ids: number[] /* project.task.type */ | false
  /** Portal User Names */
  portal_user_names: string | false
  /** Priority */
  priority: '0' | '1' | '2' | '3' | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Project Visibility — Project and Task Visibility:
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
  project_privacy_visibility: 'followers' | 'invited_users' | 'employees' | 'portal' | false
  /** Project\'s sale order */
  project_sale_order_id: [number, string] /* sale.order */ | false
  /** Stage Rating Status */
  rating_active: boolean
  /** Average Rating */
  rating_avg: number | false
  /** Rating Avg Text */
  rating_avg_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Rating count */
  rating_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Rating Last Feedback */
  rating_last_feedback: string | false
  /** Rating Last Image */
  rating_last_image: string | false
  /** Rating Text */
  rating_last_text: 'top' | 'ok' | 'ko' | 'none' | false
  /** Rating Last Value */
  rating_last_value: number | false
  /** Rating Satisfaction */
  rating_percentage_satisfaction: number | false
  /** Recurrence */
  recurrence_id: [number, string] /* project.task.recurrence */ | false
  /** Tasks in Recurrence */
  recurring_count: number | false
  /** Recurrent */
  recurring_task: boolean
  /** Repeat Every */
  repeat_interval: number | false
  /** Until */
  repeat_type: 'forever' | 'until' | false
  /** Repeat Unit */
  repeat_unit: 'day' | 'week' | 'month' | 'year' | false
  /** End Date */
  repeat_until: string | false
  /** Project Roles — When you create a project from a template, you can choose which employee takes each role. These employees will be added to the tasks, along with anyone already assigned. */
  role_ids: number[] /* project.role */ | false
  /** Days Rotting — Day count since this resource was last updated */
  rotting_days: number | false
  /** Sales Order Item — Sales Order Item to which the time spent on this task will be added in order to be invoiced to your customer.
By default the sales order item set on the project will be selected. In the absence of one, the last prepaid sales order item that has time remaining will be used.
Remove the sales order item in order to make this task non billable. You can also change or remove the sales order item of each timesheet entry individually. */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Sales Order — Sales order to which the task is linked. */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Status */
  sale_order_state: 'draft' | 'sent' | 'sale' | 'cancel' | false
  /** Sequence */
  sequence: number | false
  /** Stage */
  stage_id: [number, string] /* project.task.type */ | false
  /** Stage Color */
  stage_id_color: number | false
  /** State */
  state: '01_in_progress' | '02_changes_requested' | '03_approved' | '1_done' | '1_canceled' | '04_waiting_normal'
  /** Sub-tasks Allocated Time — Sum of the hours allocated for all the sub-tasks (and their own sub-tasks) linked to this task. Usually less than or equal to the allocated hours of this task. */
  subtask_allocated_hours: number | false
  /** Subtask Completion Percentage */
  subtask_completion_percentage: number | false
  /** Sub-task Count */
  subtask_count: number | false
  /** Tags */
  tag_ids: number[] /* project.tags */ | false
  /** Properties */
  task_properties: unknown | false
  /** To invoice */
  task_to_invoice: boolean
  /** Assignees */
  user_ids: number[] /* res.users */ | false
  /** Skills */
  user_skill_ids: number[] /* hr.employee.skill */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Working Days to Close */
  working_days_close: number | false
  /** Working Days to Assign */
  working_days_open: number | false
  /** Working Hours to Close */
  working_hours_close: number | false
  /** Working Hours to Assign */
  working_hours_open: number | false
  /** Last Updated On */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for project.task */
export type ProjectTaskFieldName = ModelFieldName<ProjectTaskRecord>

/** Typed search_read result */
export type ProjectTaskSearchResult = ModelRecord<ProjectTaskRecord>
