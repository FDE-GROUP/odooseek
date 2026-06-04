// Auto-generated from project.milestone (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.milestone */
export interface ProjectMilestoneRecord extends BaseRecord {
  /** Billable */
  allow_billable: boolean
  /** Can Be Marked As Done */
  can_be_marked_as_done: boolean
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Deadline */
  deadline: string | false
  /** # of Done Tasks */
  done_task_count: number | false
  /** Has Message */
  has_message: boolean
  /** Is Deadline Exceeded */
  is_deadline_exceeded: boolean
  /** Is Deadline Future */
  is_deadline_future: boolean
  /** Reached */
  is_reached: boolean
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
  /** Name */
  name: string
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity */
  product_uom_qty: number | false
  /** Project Allow Milestones */
  project_allow_milestones: boolean
  /** Project */
  project_id: [number, string] /* project.project */
  /** Customer */
  project_partner_id: [number, string] /* res.partner */ | false
  /** Quantity (%) — Percentage of the ordered quantity that will automatically be delivered once the milestone is reached. */
  quantity_percentage: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Reached Date */
  reached_date: string | false
  /** Sale Line Display Name */
  sale_line_display_name: string | false
  /** Sales Order Item — Sales Order Item that will be updated once the milestone is reached. */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Sequence */
  sequence: number | false
  /** # of Tasks */
  task_count: number | false
  /** Tasks */
  task_ids: number[] /* project.task */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for project.milestone */
export type ProjectMilestoneFieldName = ModelFieldName<ProjectMilestoneRecord>

/** Typed search_read result */
export type ProjectMilestoneSearchResult = ModelRecord<ProjectMilestoneRecord>
