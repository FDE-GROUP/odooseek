// Auto-generated from stock.move (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.move */
export interface StockMoveRecord extends BaseRecord {
  /** Sequence */
  sequence: number | false
  /** Priority */
  priority: '0' | '1' | false
  /** Date Scheduled — Scheduled date until move is done, then date of actual move processing */
  date: string
  /** Deadline — In case of outgoing flow, validate the transfer before this date to allow to deliver at promised date to the customer.
        In case of incoming flow, validate the transfer before this date in order to have these products in stock at the date promised by the supplier */
  date_deadline: string | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Product */
  product_id: [number, string] /* product.product */
  /** Product Category */
  product_category_id: [number, string] /* product.category */ | false
  /** Never attribute Values */
  never_product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Description Of Picking */
  description_picking: string | false
  /** Description Picking Manual */
  description_picking_manual: string | false
  /** Real Quantity — Quantity in the default UoM of the product */
  product_qty: number | false
  /** Demand — This is the quantity of product that is planned to be moved.Lowering this quantity does not generate a backorder.Changing this quantity on assigned moves affects the product reservation, and should be done with care. */
  product_uom_qty: number
  /** Allowed Uom */
  allowed_uom_ids: number[] /* uom.uom */ | false
  /** Unit */
  product_uom: [number, string] /* uom.uom */
  /** Product Template */
  product_tmpl_id: [number, string] /* product.template */ | false
  /** Source Location — The operation takes and suggests products from this location. */
  location_id: [number, string] /* stock.location */
  /** Intermediate Location — The operations brings product to this location */
  location_dest_id: [number, string] /* stock.location */
  /** Final Location — The operation brings the products to the intermediate location.But this operation is part of a chain of operations targeting the final location. */
  location_final_id: [number, string] /* stock.location */ | false
  /** Source Location Type — * Vendor: Virtual location representing the source location for products coming from your vendors
* Virtual: Virtual location used to create a hierarchical structure for your warehouse by aggregating its child locations. Can\'t directly contain products
* Internal: Physical locations inside your warehouses,
* Customer: Virtual location representing the destination location for products sent to your customers
* Inventory Loss: Virtual location serving as the counterpart for inventory operations done to correct stock levels (Physical inventories)
* Production: Virtual counterpart location for production operations. I.e. This location consumes components and produces finished products
* Transit: Counterpart location that should be used for inter-company or inter-warehouses operations */
  location_usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit' | false
  /** Destination Location Type — * Vendor: Virtual location representing the source location for products coming from your vendors
* Virtual: Virtual location used to create a hierarchical structure for your warehouse by aggregating its child locations. Can\'t directly contain products
* Internal: Physical locations inside your warehouses,
* Customer: Virtual location representing the destination location for products sent to your customers
* Inventory Loss: Virtual location serving as the counterpart for inventory operations done to correct stock levels (Physical inventories)
* Production: Virtual counterpart location for production operations. I.e. This location consumes components and produces finished products
* Transit: Counterpart location that should be used for inter-company or inter-warehouses operations */
  location_dest_usage: 'supplier' | 'view' | 'internal' | 'customer' | 'inventory' | 'production' | 'transit' | false
  /** Destination Address  — Optional address where goods are to be delivered, specifically used for allotment */
  partner_id: [number, string] /* res.partner */ | false
  /** Destination Moves — Optional: next stock move when chaining them */
  move_dest_ids: number[] /* stock.move */ | false
  /** Original Move — Optional: previous stock move when chaining them */
  move_orig_ids: number[] /* stock.move */ | false
  /** Transfer */
  picking_id: [number, string] /* stock.picking */ | false
  /** Status — * New: The stock move is created but not confirmed.
* Waiting Another Move: A linked stock move should be done before this one.
* Waiting: The stock move is confirmed but the product can\'t be reserved.
* Available: The product of the stock move is reserved.
* Done: The product has been transferred and the transfer has been confirmed. */
  state: 'draft' | 'waiting' | 'confirmed' | 'partially_available' | 'assigned' | 'done' | 'cancel' | false
  /** Picked — This checkbox is just indicative, it doesn\'t validate or generate any product moves. */
  picked: boolean
  /** Price Unit */
  price_unit: number | false
  /** Source Document */
  origin: string | false
  /** Supply Method — By default, the system will take from the stock in the source location and passively wait for availability. The other possibility allows you to directly create a procurement on the source location (and thus ignore its current stock) to gather products. If we want to chain moves and have this one to wait for the previous, this second option should be chosen. */
  procure_method: 'make_to_stock' | 'make_to_order'
  /** Scrap operation */
  scrap_id: [number, string] /* stock.scrap */ | false
  /** Procurement Values — Dummy field to store procurement values to propagate them to later steps */
  procurement_values: unknown | false
  /** References */
  reference_ids: number[] /* stock.reference */ | false
  /** Stock Rule — The stock rule that created this stock move */
  rule_id: [number, string] /* stock.rule */ | false
  /** Propagate cancel and split — If checked, when this move is cancelled, cancel the linked move too */
  propagate_cancel: boolean
  /** Delay Alert Date — Process at this date to be on time */
  delay_alert_date: string | false
  /** Operation Type */
  picking_type_id: [number, string] /* stock.picking.type */ | false
  /** Inventory */
  is_inventory: boolean
  /** Inventory Name */
  inventory_name: string | false
  /** Move Line */
  move_line_ids: number[] /* stock.move.line */
  /** Packages */
  package_ids: number[] /* stock.package */
  /** Origin return move — Move that created the return move */
  origin_returned_move_id: [number, string] /* stock.move */ | false
  /** All returned moves — Optional: all returned moves created from this move */
  returned_move_ids: number[] /* stock.move */
  /** Forecasted Quantity — Quantity in stock that can still be reserved for this move */
  availability: number | false
  /** Owner  */
  restrict_partner_id: [number, string] /* res.partner */ | false
  /** Destination route — Preferred route */
  route_ids: number[] /* stock.route */ | false
  /** Warehouse — the warehouse to consider for the route selection on the next procurement (if any). */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Product with Tracking — Ensure the traceability of a storable product in your warehouse. */
  has_tracking: 'serial' | 'lot' | 'none' | false
  /** Has Lines Without Result Package */
  has_lines_without_result_package: boolean
  /** Quantity */
  quantity: number | false
  /** Show Detailed Operations — If this checkbox is ticked, the pickings lines will represent detailed stock operations. If not, the picking lines will represent an aggregate of detailed stock operations. */
  show_operations: boolean
  /** Type of Operation */
  picking_code: 'incoming' | 'outgoing' | 'internal' | 'mrp_operation' | false
  /** Details Visible */
  show_details_visible: boolean
  /** Track Inventory — A storable product is a product for which you manage stock. */
  is_storable: boolean
  /** Whether the move was added after the picking\'s confirmation */
  additional: boolean
  /** Is Locked */
  is_locked: boolean
  /** Is initial demand editable */
  is_initial_demand_editable: boolean
  /** Is Date Editable */
  is_date_editable: boolean
  /** Is quantity done editable */
  is_quantity_done_editable: boolean
  /** Reference */
  reference: string | false
  /** Move Lines Count */
  move_lines_count: number | false
  /** Display Assign Serial */
  display_assign_serial: boolean
  /** Display Import Lot */
  display_import_lot: boolean
  /** First SN/Lot */
  next_serial: string | false
  /** Number of SN/Lots */
  next_serial_count: number | false
  /** Original Reordering Rule */
  orderpoint_id: [number, string] /* stock.warehouse.orderpoint */ | false
  /** Forecast Availability */
  forecast_availability: number | false
  /** Forecasted Expected date */
  forecast_expected_date: string | false
  /** Serial Numbers */
  lot_ids: number[] /* stock.lot */ | false
  /** Date to Reserve — Computes when a move should be reserved */
  reservation_date: string | false
  /** Packaging — Packaging unit from sale or purchase orders */
  packaging_uom_id: [number, string] /* uom.uom */ | false
  /** Packaging Quantity — Quantity in the packaging unit */
  packaging_uom_qty: number | false
  /** Show Quant */
  show_quant: boolean
  /** Show lot_id */
  show_lots_m2o: boolean
  /** Show lot_name */
  show_lots_text: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Created Production Order */
  created_production_id: [number, string] /* mrp.production */ | false
  /** Production Order for finished products */
  production_id: [number, string] /* mrp.production */ | false
  /** Production Order for components */
  raw_material_production_id: [number, string] /* mrp.production */ | false
  /** Used for Productions */
  production_group_id: [number, string] /* mrp.production.group */ | false
  /** Disassembly Order */
  unbuild_id: [number, string] /* mrp.unbuild */ | false
  /** Consumed Disassembly Order */
  consume_unbuild_id: [number, string] /* mrp.unbuild */ | false
  /** Operations */
  allowed_operation_ids: number[] /* mrp.routing.workcenter */
  /** Operation To Consume */
  operation_id: [number, string] /* mrp.routing.workcenter */ | false
  /** Work Order To Consume */
  workorder_id: [number, string] /* mrp.workorder */ | false
  /** BoM Line */
  bom_line_id: [number, string] /* mrp.bom.line */ | false
  /** By-products — By-product line that generated the move in a manufacturing order */
  byproduct_id: [number, string] /* mrp.bom.byproduct */ | false
  /** Unit Factor */
  unit_factor: number | false
  /** Finished Lot/Serial Number */
  order_finished_lot_ids: number[] /* stock.lot */ | false
  /** Quantity To Consume */
  should_consume_qty: number | false
  /** Cost Share (%) — The percentage of the final production cost for this by-product. The total of all by-products\' cost share must be smaller or equal to 100. */
  cost_share: number | false
  /** Product On Hand Quantity — Current quantity of products.
In a context with a single Stock Location, this includes goods stored at this Location, or any of its children.
In a context with a single Warehouse, this includes goods stored in the Stock Location of this Warehouse, or any of its children.
stored in the Stock Location of the Warehouse of this Shop, or any of its children.
Otherwise, this includes goods stored in any Stock Location with \'internal\' type. */
  product_qty_available: number | false
  /** Product Forecasted Quantity — Forecast quantity (computed as Quantity On Hand - Outgoing + Incoming)
In a context with a single Stock Location, this includes goods stored in this location, or any of its children.
In a context with a single Warehouse, this includes goods stored in the Stock Location of this Warehouse, or any of its children.
Otherwise, this includes goods stored in any Stock Location with \'internal\' type. */
  product_virtual_available: number | false
  /** Manual Consumption — When activated, then the registration of consumption for that component is recorded manually exclusively.
If not activated, and any of the components consumption is edited manually on the manufacturing order, Odoo assumes manual consumption also. */
  manual_consumption: boolean
  /** Update quantities on SO/PO — Trigger a decrease of the delivered/received quantity in the associated Sale Order/Purchase Order */
  to_refund: boolean
  /** Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Value — The current value of the move. It\'s zero if the move is not valued. */
  value: number | false
  /** Value Description */
  value_justification: string | false
  /** Computed Value Description */
  value_computed_justification: string | false
  /** Manual Value */
  value_manual: number | false
  /** Standard Price */
  standard_price: number | false
  /** Is Incoming (valued) */
  is_in: boolean
  /** Is Outgoing (valued) */
  is_out: boolean
  /** Is Dropship */
  is_dropship: boolean
  /** Is Valued */
  is_valued: boolean
  /** Remaining Quantity */
  remaining_qty: number | false
  /** Remaining Value */
  remaining_value: number | false
  /** Analytic Account Line */
  analytic_account_line_ids: number[] /* account.analytic.line */ | false
  /** stock_move_id */
  account_move_id: [number, string] /* account.move */ | false
  /** Purchase Order Line */
  purchase_line_id: [number, string] /* purchase.order.line */ | false
  /** Created Purchase Order Lines */
  created_purchase_line_ids: number[] /* purchase.order.line */ | false
  /** Sale Line */
  sale_line_id: [number, string] /* sale.order.line */ | false
  /** Weight */
  weight: number | false
}

/** Field names for stock.move */
export type StockMoveFieldName = ModelFieldName<StockMoveRecord>

/** Typed search_read result */
export type StockMoveSearchResult = ModelRecord<StockMoveRecord>
