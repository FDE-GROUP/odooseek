// Auto-generated from mrp.routing.workcenter (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.routing.workcenter */
export interface MrpRoutingWorkcenterRecord extends BaseRecord {
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
  /** Operation Dependencies — Create operation level dependencies that will influence both planning and the status of work orders upon MO confirmation. If this feature is ticked, and nothing is specified, Odoo will assume that all operations can be started simultaneously. */
  allow_operation_dependencies: boolean
  /** Blocked By — Operations that need to be completed before this operation can start. */
  blocked_by_operation_ids: number[] /* mrp.routing.workcenter */ | false
  /** Bill of Material */
  bom_id: [number, string] /* mrp.bom */
  /** Apply on Variants — BOM Product Variants needed to apply this line. */
  bom_product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Cost */
  cost: number | false
  /** Cost based on — Determines the way Odoo calculates the cost of the operation:
- Based on Actual time: the cost will be calculated based on tracked time and real employee costs.
- Based on Estimated time: the cost will be calculated based on estimated time and costs. */
  cost_mode: 'actual' | 'estimated' | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Repetitions */
  cycle_number: number | false
  /** Has Message */
  has_message: boolean
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
  /** Operation */
  name: string
  /** Blocks — Operations that cannot start before this operation is completed. */
  needed_by_operation_ids: number[] /* mrp.routing.workcenter */ | false
  /** Possible Product Template Attribute Value */
  possible_bom_product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Sequence — Gives the sequence order when displaying a list of routing Work Centers. */
  sequence: number | false
  /** Show Total Duration? */
  show_time_total: boolean
  /** Computed on last */
  time_computed_on: string | false
  /** Cycles */
  time_cycle: number | false
  /** Manual Duration — Time in minutes:- In fixed mode, time used- In computed mode, supposed first time when there aren\'t any work orders yet */
  time_cycle_manual: number | false
  /** Duration Computation */
  time_mode: 'manual' | 'auto' | false
  /** Based on */
  time_mode_batch: number | false
  /** Total Duration */
  time_total: number | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Work Center */
  workcenter_id: [number, string] /* mrp.workcenter */
  /** # Work Orders */
  workorder_count: number | false
  /** Work Orders */
  workorder_ids: number[] /* mrp.workorder */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for mrp.routing.workcenter */
export type MrpRoutingWorkcenterFieldName = ModelFieldName<MrpRoutingWorkcenterRecord>

/** Typed search_read result */
export type MrpRoutingWorkcenterSearchResult = ModelRecord<MrpRoutingWorkcenterRecord>
