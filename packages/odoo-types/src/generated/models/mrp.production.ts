// Auto-generated from mrp.production (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.production */
export interface MrpProductionRecord extends BaseRecord {
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
  /** Reference */
  name: string | false
  /** Priority — Components will be reserved first for the MO with the highest priorities. */
  priority: '0' | '1' | false
  /** Backorder Sequence — Backorder sequence, if equals to 0 means there is not related backorder */
  backorder_sequence: number | false
  /** Source — Reference of the document that generated this production order request. */
  origin: string | false
  /** Product */
  product_id: [number, string] /* product.product */
  /** Production Group */
  production_group_id: [number, string] /* mrp.production.group */ | false
  /** Attribute Values */
  product_variant_attributes: number[] /* product.template.attribute.value */ | false
  /** Valid Product Attribute Lines */
  valid_product_template_attribute_line_ids: number[] /* product.template.attribute.line */ | false
  /** Never attribute values */
  never_product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Workcenter */
  workcenter_id: [number, string] /* mrp.workcenter */ | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  product_tracking: 'serial' | 'lot' | 'none' | false
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Quantity To Produce */
  product_qty: number
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */
  /** Lot/Serial Number */
  lot_producing_ids: number[] /* stock.lot */ | false
  /** Quantity Producing */
  qty_producing: number | false
  /** Total Quantity */
  product_uom_qty: number | false
  /** Operation Type */
  picking_type_id: [number, string] /* stock.picking.type */
  /** Create New Lots/Serial Numbers for Components — Allow to create new lot/serial numbers for the components */
  use_create_components_lots: boolean
  /** Components Location — Location where the system will look for components. */
  location_src_id: [number, string] /* stock.location */
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Finished Products Location — Location where the system will stock the finished products. */
  location_dest_id: [number, string] /* stock.location */
  /** Final Location from procurement */
  location_final_id: [number, string] /* stock.location */ | false
  /** Deadline — Informative date allowing to define when the manufacturing order should be processed at the latest to fulfill delivery on time. */
  date_deadline: string | false
  /** Start — Date you plan to start production or date you actually started production. */
  date_start: string
  /** End — Date you expect to finish production or actual date you finished production. */
  date_finished: string | false
  /** Expected Duration — Total expected duration (in minutes) */
  duration_expected: number | false
  /** Real Duration — Total real duration (in minutes) */
  duration: number | false
  /** Bill of Material — Bills of Materials, also called recipes, are used to autocomplete components and work order instructions. */
  bom_id: [number, string] /* mrp.bom */ | false
  /** State —  * Draft: The MO is not confirmed yet.
 * Confirmed: The MO is confirmed, the stock rules and the reordering of the components are trigerred.
 * In Progress: The production has started (on the MO or on the WO).
 * To Close: The production is done, the MO has to be closed.
 * Done: The MO is closed, the stock moves are posted. 
 * Cancelled: The MO has been cancelled, can\'t be confirmed anymore. */
  state: 'draft' | 'confirmed' | 'progress' | 'to_close' | 'done' | 'cancel' | false
  /** MO Readiness — Manufacturing readiness for this MO, as per bill of material configuration:
            * Ready: The material is available to start the production.
            * Waiting: The material is not available to start the production.
 */
  reservation_state: 'confirmed' | 'assigned' | 'waiting' | false
  /** Components */
  move_raw_ids: number[] /* stock.move */
  /** Finished Products */
  move_finished_ids: number[] /* stock.move */
  /** All Move Raw */
  all_move_raw_ids: number[] /* stock.move */
  /** All Move */
  all_move_ids: number[] /* stock.move */
  /** Move Byproduct */
  move_byproduct_ids: number[] /* stock.move */
  /** Finished Product */
  finished_move_line_ids: number[] /* stock.move.line */
  /** Work Orders */
  workorder_ids: number[] /* mrp.workorder */
  /** Stock Movements of Produced Goods */
  move_dest_ids: number[] /* stock.move */
  /** Allowed to Unreserve Production — Technical field to check when we can unreserve */
  unreserve_visible: boolean
  /** Allowed to Reserve Production — Technical field to check when we can reserve quantities */
  reserve_visible: boolean
  /** Responsible */
  user_id: [number, string] /* res.users */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Quantity Produced */
  qty_produced: number | false
  /** References */
  reference_ids: number[] /* stock.reference */ | false
  /** Custom Description */
  product_description_variants: string | false
  /** Orderpoint */
  orderpoint_id: [number, string] /* stock.warehouse.orderpoint */ | false
  /** Propagate cancel and split — If checked, when the previous move of the move (which was generated by a next procurement) is cancelled or split, the move generated by this move will too */
  propagate_cancel: boolean
  /** Delay Alert Date */
  delay_alert_date: string | false
  /** JSON data for the popover widget */
  json_popover: string | false
  /** Scraps */
  scrap_ids: number[] /* stock.scrap */
  /** Scrap Move */
  scrap_count: number | false
  /** Unbuilds */
  unbuild_ids: number[] /* mrp.unbuild */
  /** Number of Unbuilds */
  unbuild_count: number | false
  /** Is Locked */
  is_locked: boolean
  /** Its Operations are Planned */
  is_planned: boolean
  /** Show Final Lots */
  show_final_lots: boolean
  /** Production Location */
  production_location_id: [number, string] /* stock.location */ | false
  /** Picking associated to this manufacturing order */
  picking_ids: number[] /* stock.picking */ | false
  /** Delivery Orders */
  delivery_count: number | false
  /** Consumption */
  consumption: 'flexible' | 'warning' | 'strict'
  /** Number of generated MO */
  mrp_production_child_count: number | false
  /** Number of source MO */
  mrp_production_source_count: number | false
  /** Count of linked backorder */
  mrp_production_backorder_count: number | false
  /** Show Lock/unlock buttons */
  show_lock: boolean
  /** Component Status — Latest component availability status for this MO. If green, then the MO\'s readiness status is ready, as per BOM configuration. */
  components_availability: string | false
  /** Components Availability State */
  components_availability_state: 'available' | 'expected' | 'late' | 'unavailable' | false
  /** Production Capacity — Quantity that can be produced with the current stock of components */
  production_capacity: number | false
  /** Display the serial number shortcut on the moves */
  show_lot_ids: boolean
  /** Forecasted Issue */
  forecasted_issue: boolean
  /** Show Allocation — Technical Field used to decide whether the button "Allocation" should be displayed. */
  show_allocation: boolean
  /** Allow Work Order Dependencies */
  allow_workorder_dependencies: boolean
  /** Show Produce — Technical field to check if produce button can be shown */
  show_produce: boolean
  /** Show Generate BOM */
  show_generate_bom: boolean
  /** Show Produce All — Technical field to check if produce all button can be shown */
  show_produce_all: boolean
  /** Outdated BoM — The BoM has been updated since creation of the MO */
  is_outdated_bom: boolean
  /** Is Delayed */
  is_delayed: boolean
  /** Date Category */
  search_date_category: 'before' | 'yesterday' | 'today' | 'day_1' | 'day_2' | 'after' | false
  /** Count of serial numbers */
  serial_numbers_count: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Extra Unit Cost */
  extra_cost: number | false
  /** Show Valuation */
  show_valuation: boolean
  /** Wip Move */
  wip_move_ids: number[] /* account.move */ | false
  /** WIP Journal Entry Count */
  wip_move_count: number | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Has Analytic Account */
  has_analytic_account: boolean
  /** Count of generated PO */
  purchase_order_count: number | false
  /** Count of Source SO */
  sale_order_count: number | false
  /** Origin sale order line */
  sale_line_id: [number, string] /* sale.order.line */ | false
}

/** Field names for mrp.production */
export type MrpProductionFieldName = ModelFieldName<MrpProductionRecord>

/** Typed search_read result */
export type MrpProductionSearchResult = ModelRecord<MrpProductionRecord>
