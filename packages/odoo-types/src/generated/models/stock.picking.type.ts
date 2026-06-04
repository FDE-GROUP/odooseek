// Auto-generated from stock.picking.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.picking.type */
export interface StockPickingTypeRecord extends BaseRecord {
  /** Operation Type */
  name: string
  /** Color */
  color: number | false
  /** Sequence — Used to order the \'All Operations\' kanban view */
  sequence: number | false
  /** Reference Sequence */
  sequence_id: [number, string] /* ir.sequence */ | false
  /** Sequence Prefix */
  sequence_code: string
  /** Source Location — This is the default source location when this operation is manually created. However, it is possible to change it afterwards or that the routes use another one by default. */
  default_location_src_id: [number, string] /* stock.location */
  /** Destination Location — This is the default destination location when this operation is manually created. However, it is possible to change it afterwards or that the routes use another one by default. */
  default_location_dest_id: [number, string] /* stock.location */
  /** Type of Operation */
  code: 'incoming' | 'outgoing' | 'internal' | 'mrp_operation'
  /** Operation Type for Returns */
  return_picking_type_id: [number, string] /* stock.picking.type */ | false
  /** Move Entire Packages — If ticked, packages to move will be directly displayed in Barcode instead of the products they contain */
  show_entire_packs: boolean
  /** Set Package Type — If ticked, you will be able to select which package or package type to use in a put in pack */
  set_package_type: boolean
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Active */
  active: boolean
  /** Create New Lots/Serial Numbers — If this is checked only, it will suppose you want to create new Lots/Serial Numbers, so you can provide them in a text field.  */
  use_create_lots: boolean
  /** Use Existing Lots/Serial Numbers — If this is checked, you will be able to choose the Lots/Serial Numbers. You can also decide to not put lots in this operation type.  This means it will create stock with no lot or not put a restriction on the lot taken.  */
  use_existing_lots: boolean
  /** Generate Shipping Labels — Check this box if you want to generate shipping label in this operation. */
  print_label: boolean
  /** Show Detailed Operations — If this checkbox is ticked, the pickings lines will represent detailed stock operations. If not, the picking lines will represent an aggregate of detailed stock operations. */
  show_operations: boolean
  /** Reservation Method — How products in transfers of this operation type should be reserved. */
  reservation_method: 'at_confirm' | 'manual' | 'by_date'
  /** Days — Maximum number of days before scheduled date that products should be reserved. */
  reservation_days_before: number | false
  /** Days when starred — Maximum number of days before scheduled date that priority picking products should be reserved. */
  reservation_days_before_priority: number | false
  /** Show Reception Report at Validation — If this checkbox is ticked, Odoo will automatically show the reception report (if there are moves to allocate to) when validating. */
  auto_show_reception_report: boolean
  /** Auto Print Delivery Slip — If this checkbox is ticked, Odoo will automatically print the delivery slip of a picking when it is validated. */
  auto_print_delivery_slip: boolean
  /** Auto Print Return Slip — If this checkbox is ticked, Odoo will automatically print the return slip of a picking when it is validated. */
  auto_print_return_slip: boolean
  /** Auto Print Product Labels — If this checkbox is ticked, Odoo will automatically print the product labels of a picking when it is validated. */
  auto_print_product_labels: boolean
  /** Product Label Format to auto-print */
  product_label_format: 'dymo' | '2x7xprice' | '4x7xprice' | '4x12' | '4x12xprice' | 'zpl' | 'zplxprice' | false
  /** Auto Print Lot/SN Labels — If this checkbox is ticked, Odoo will automatically print the lot/SN labels of a picking when it is validated. */
  auto_print_lot_labels: boolean
  /** Lot Label Format to auto-print */
  lot_label_format: '4x12_lots' | '4x12_units' | 'zpl_lots' | 'zpl_units' | false
  /** Auto Print Reception Report — If this checkbox is ticked, Odoo will automatically print the reception report of a picking when it is validated and has assigned moves. */
  auto_print_reception_report: boolean
  /** Auto Print Reception Report Labels — If this checkbox is ticked, Odoo will automatically print the reception report labels of a picking when it is validated. */
  auto_print_reception_report_labels: boolean
  /** Auto Print Packages — If this checkbox is ticked, Odoo will automatically print the packages and their contents of a picking when it is validated. */
  auto_print_packages: boolean
  /** Auto Print Package Label — If this checkbox is ticked, Odoo will automatically print the package label when "Put in Pack" button is used. */
  auto_print_package_label: boolean
  /** Package Label to Print */
  package_label_to_print: 'pdf' | 'zpl' | false
  /** Count Picking Draft */
  count_picking_draft: number | false
  /** Count Picking Ready */
  count_picking_ready: number | false
  /** Count Picking */
  count_picking: number | false
  /** Count Picking Waiting */
  count_picking_waiting: number | false
  /** Count Picking Late */
  count_picking_late: number | false
  /** Count Picking Backorders */
  count_picking_backorders: number | false
  /** Count Move Ready */
  count_move_ready: number | false
  /** Hide Reservation Method */
  hide_reservation_method: boolean
  /** Barcode */
  barcode: string | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Create Backorder — When validating a transfer:
 * Ask: users are asked to choose if they want to make a backorder for remaining products
 * Always: a backorder is automatically created for the remaining products
 * Never: remaining products are cancelled */
  create_backorder: 'ask' | 'always' | 'never'
  /** Show Picking Type */
  show_picking_type: boolean
  /** Picking Properties */
  picking_properties_definition: unknown | false
  /** Favorite User */
  favorite_user_ids: number[] /* res.users */ | false
  /** Show Operation in Overview */
  is_favorite: boolean
  /** Kanban Dashboard Graph */
  kanban_dashboard_graph: string | false
  /** Shipping Policy — It specifies goods to be transferred partially or all at once */
  move_type: 'direct' | 'one'
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Number of Manufacturing Orders to Process */
  count_mo_todo: number | false
  /** Number of Manufacturing Orders Waiting */
  count_mo_waiting: number | false
  /** Number of Manufacturing Orders Late */
  count_mo_late: number | false
  /** Number of Manufacturing Orders In Progress */
  count_mo_in_progress: number | false
  /** Number of Manufacturing Orders To Close */
  count_mo_to_close: number | false
  /** Create New Lots/Serial Numbers for Components — Allow to create new lot/serial numbers for the components */
  use_create_components_lots: boolean
  /** Auto Print Done Production Order — If this checkbox is ticked, Odoo will automatically print the production order of a MO when it is done. */
  auto_print_done_production_order: boolean
  /** Auto Print Produced Product Labels — If this checkbox is ticked, Odoo will automatically print the product labels of a MO when it is done. */
  auto_print_done_mrp_product_labels: boolean
  /** Product Label to Print */
  mrp_product_label_to_print: 'pdf' | 'zpl' | false
  /** Auto Print Produced Lot Label — If this checkbox is ticked, Odoo will automatically print the lot/SN label of a MO when it is done. */
  auto_print_done_mrp_lot: boolean
  /** Lot/SN Label to Print */
  done_mrp_lot_label_to_print: 'pdf' | 'zpl' | false
  /** Auto Print Allocation Report — If this checkbox is ticked, Odoo will automatically print the allocation report of a MO when it is done and has assigned moves. */
  auto_print_mrp_reception_report: boolean
  /** Auto Print Allocation Report Labels — If this checkbox is ticked, Odoo will automatically print the allocation report labels of a MO when it is done. */
  auto_print_mrp_reception_report_labels: boolean
  /** Auto Print Generated Lot/SN Label — Automatically print the lot/SN label when the "Create a new serial/lot number" button is used. */
  auto_print_generated_mrp_lot: boolean
  /** Generated Lot/SN Label to Print */
  generated_mrp_lot_label_to_print: 'pdf' | 'zpl' | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Analytic Costs — Validating stock pickings will generate analytic entries for the selected project. Products set for re-invoicing will also be billed to the customer. */
  analytic_costs: boolean
}

/** Field names for stock.picking.type */
export type StockPickingTypeFieldName = ModelFieldName<StockPickingTypeRecord>

/** Typed search_read result */
export type StockPickingTypeSearchResult = ModelRecord<StockPickingTypeRecord>
