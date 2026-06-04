// Auto-generated from mrp.workorder (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.workorder */
export interface MrpWorkorderRecord extends BaseRecord {
  /** Allow Work Order Dependencies */
  allow_workorder_dependencies: boolean
  /** Barcode */
  barcode: string | false
  /** Blocked By */
  blocked_by_workorder_ids: number[] /* mrp.workorder */ | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Consumption */
  consumption: 'flexible' | 'warning' | 'strict' | false
  /** Cost Mode */
  cost_mode: 'actual' | 'estimated' | false
  /** Cost per hour */
  costs_hour: number | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** End */
  date_finished: string | false
  /** Start */
  date_start: string | false
  /** Real Duration */
  duration: number | false
  /** Expected Duration */
  duration_expected: number | false
  /** Duration Deviation (%) */
  duration_percent: number | false
  /** Duration Per Unit */
  duration_unit: number | false
  /** Lot/Serial Numbers */
  finished_lot_ids: number[] /* stock.lot */ | false
  /** Its Operations are Planned */
  is_planned: boolean
  /** Has Been Produced */
  is_produced: boolean
  /** Is the Current User Working */
  is_user_working: boolean
  /** Popover Data JSON */
  json_popover: string | false
  /** Last user that worked on this work order. */
  last_working_user_id: [number, string] /* res.users */ | false
  /** Leave — Slot into workcenter calendar once planned */
  leave_id: [number, string] /* resource.calendar.leaves */ | false
  /** Mo Analytic Account Line */
  mo_analytic_account_line_ids: number[] /* account.analytic.line */ | false
  /** Finished Moves */
  move_finished_ids: number[] /* stock.move */
  /** Moves to Track — Inventory moves for which you must scan a lot number at this work order */
  move_line_ids: number[] /* stock.move.line */
  /** Raw Moves */
  move_raw_ids: number[] /* stock.move */
  /** Work Order */
  name: string
  /** Blocks */
  needed_by_workorder_ids: number[] /* mrp.workorder */ | false
  /** Operation */
  operation_id: [number, string] /* mrp.routing.workcenter */ | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Tracking — Ensure the traceability of a storable product in your warehouse. */
  product_tracking: 'serial' | 'lot' | 'none' | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Attribute Values */
  product_variant_attributes: number[] /* product.template.attribute.value */ | false
  /** Stock Availability — Manufacturing readiness for this MO, as per bill of material configuration:
            * Ready: The material is available to start the production.
            * Waiting: The material is not available to start the production.
 */
  production_availability: 'confirmed' | 'assigned' | 'waiting' | false
  /** Bill of Material — Bills of Materials, also called recipes, are used to autocomplete components and work order instructions. */
  production_bom_id: [number, string] /* mrp.bom */ | false
  /** Production Date */
  production_date: string | false
  /** Manufacturing Order */
  production_id: [number, string] /* mrp.production */
  /** Production State —  * Draft: The MO is not confirmed yet.
 * Confirmed: The MO is confirmed, the stock rules and the reordering of the components are trigerred.
 * In Progress: The production has started (on the MO or on the WO).
 * To Close: The production is done, the MO has to be closed.
 * Done: The MO is closed, the stock moves are posted. 
 * Cancelled: The MO has been cancelled, can\'t be confirmed anymore. */
  production_state: 'draft' | 'confirmed' | 'progress' | 'to_close' | 'done' | 'cancel' | false
  /** Progress Done (%) */
  progress: number | false
  /** Quantity Done — The number of products already handled by this work order */
  qty_produced: number | false
  /** Currently Produced Quantity */
  qty_producing: number | false
  /** Original Production Quantity */
  qty_production: number | false
  /** Quantity Ready */
  qty_ready: number | false
  /** Quantity To Be Produced */
  qty_remaining: number | false
  /** Carried Quantity — The quantity already produced awaiting allocation in the backorders chain. */
  qty_reported_from_previous_wo: number | false
  /** Scrap Move */
  scrap_count: number | false
  /** Scrap */
  scrap_ids: number[] /* stock.scrap */
  /** Sequence */
  sequence: number | false
  /** Show Popover? */
  show_json_popover: boolean
  /** Status */
  state: 'blocked' | 'ready' | 'progress' | 'done' | 'cancel' | false
  /** Time */
  time_ids: number[] /* mrp.workcenter.productivity */
  /** Wc Analytic Account Line */
  wc_analytic_account_line_ids: number[] /* account.analytic.line */ | false
  /** Work Center */
  workcenter_id: [number, string] /* mrp.workcenter */
  /** Workcenter Status */
  working_state: 'normal' | 'blocked' | 'done' | false
  /** Working user on this work order. */
  working_user_ids: number[] /* res.users */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for mrp.workorder */
export type MrpWorkorderFieldName = ModelFieldName<MrpWorkorderRecord>

/** Typed search_read result */
export type MrpWorkorderSearchResult = ModelRecord<MrpWorkorderRecord>
