// Auto-generated from project.milestone (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.milestone */
export interface ProjectMilestoneRecord extends BaseRecord {
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
  /** Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Project */
  project_id: [number, string] /* project.project */
  /** Deadline */
  deadline: string | false
  /** Reached */
  is_reached: boolean
  /** Reached Date */
  reached_date: string | false
  /** Tasks */
  task_ids: number[] /* project.task */
  /** Project Allow Milestones */
  project_allow_milestones: boolean
  /** Is Deadline Exceeded */
  is_deadline_exceeded: boolean
  /** Is Deadline Future */
  is_deadline_future: boolean
  /** # of Tasks */
  task_count: number | false
  /** # of Done Tasks */
  done_task_count: number | false
  /** Can Be Marked As Done */
  can_be_marked_as_done: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Billable */
  allow_billable: boolean
  /** Customer */
  project_partner_id: [number, string] /* res.partner */ | false
  /** Sales Order Item — Sales Order Item that will be updated once the milestone is reached. */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Quantity (%) — Percentage of the ordered quantity that will automatically be delivered once the milestone is reached. */
  quantity_percentage: number | false
  /** Sale Line Display Name */
  sale_line_display_name: string | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity */
  product_uom_qty: number | false
}

/** Field names for project.milestone */
export type ProjectMilestoneFieldName = ModelFieldName<ProjectMilestoneRecord>

/** Typed search_read result */
export type ProjectMilestoneSearchResult = ModelRecord<ProjectMilestoneRecord>
