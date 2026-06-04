// Auto-generated from stock.picking (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.picking */
export interface StockPickingRecord extends BaseRecord {
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
  /** Allowed Carrier */
  allowed_carrier_ids: number[] /* delivery.carrier */ | false
  /** Back Order of — If this shipment was split, then this field links to the shipment which contains the already processed part. */
  backorder_id: [number, string] /* stock.picking */ | false
  /** Back Orders */
  backorder_ids: number[] /* stock.picking */
  /** Carrier */
  carrier_id: [number, string] /* delivery.carrier */ | false
  /** Shipping Cost */
  carrier_price: number | false
  /** Tracking Reference */
  carrier_tracking_ref: string | false
  /** Tracking URL */
  carrier_tracking_url: string | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Country Code — The ISO country code in two chars. 
You can use this field for quick search. */
  country_code: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Deadline — In case of outgoing flow, validate the transfer before this date to allow to deliver at promised date to the customer.
        In case of incoming flow, validate the transfer before this date in order to have these products in stock at the date promised by the supplier */
  date_deadline: string | false
  /** Date of Transfer — Date at which the transfer has been processed or cancelled. */
  date_done: string | false
  /** Days To Arrive */
  days_to_arrive: string | false
  /** Delay Alert Date */
  delay_alert_date: string | false
  /** Delay Pass */
  delay_pass: string | false
  /** Provider */
  delivery_type: 'base_on_rule' | 'fixed' | false
  /** Destination Country — The ISO country code in two chars. 
You can use this field for quick search. */
  destination_country_code: string | false
  /** Is late — Is late or will be late depending on the deadline and scheduled date */
  has_deadline_issue: boolean
  /** Has Kits */
  has_kits: boolean
  /** Has Message */
  has_message: boolean
  /** Has Scrap Moves */
  has_scrap_move: boolean
  /** Has Tracking */
  has_tracking: boolean
  /** Integration Level — Action while validating Delivery Orders */
  integration_level: 'rate' | 'rate_and_ship' | false
  /** Is Scheduled Date Editable */
  is_date_editable: boolean
  /** Is Locked — When the picking is not done this allows changing the initial demand. When the picking is done this allows changing the done quantities. */
  is_locked: boolean
  /** Is Return Picking */
  is_return_picking: boolean
  /** Is Signed */
  is_signed: boolean
  /** JSON data for the popover widget */
  json_popover: string | false
  /** Destination Location */
  location_dest_id: [number, string] /* stock.location */
  /** Source Location */
  location_id: [number, string] /* stock.location */
  /** Lot/Serial Number */
  lot_id: [number, string] /* stock.lot */ | false
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
  /** Stock Moves */
  move_ids: number[] /* stock.move */
  /** Operations */
  move_line_ids: number[] /* stock.move.line */
  /** Shipping Policy — It specifies goods to be deliver partially or all at once */
  move_type: 'direct' | 'one'
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Reference */
  name: string | false
  /** Notes */
  note: string | false
  /** Source Document — Reference of the document */
  origin: string | false
  /** Assign Owner — When validating the transfer, the products will be assigned to this owner. */
  owner_id: [number, string] /* res.partner */ | false
  /** Transfered Packages */
  package_history_ids: number[] /* stock.package.history */ | false
  /** Packages Count */
  packages_count: number | false
  /** Country */
  partner_country_id: [number, string] /* res.country */ | false
  /** Contact */
  partner_id: [number, string] /* res.partner */ | false
  /** Properties */
  picking_properties: unknown | false
  /** Type of Operation */
  picking_type_code: 'incoming' | 'outgoing' | 'internal' | 'mrp_operation' | false
  /** Move Entire Packages — If ticked, packages to move will be directly displayed in Barcode instead of the products they contain */
  picking_type_entire_packs: boolean
  /** Operation Type */
  picking_type_id: [number, string] /* stock.picking.type */
  /** Picking Instructions — Internal instructions for the partner or its parent company as set by the user. */
  picking_warning_text: string | false
  /** Printed */
  printed: boolean
  /** Priority — Products will be reserved first for the transfers with the highest priorities. */
  priority: '0' | '1' | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Count of MO generated */
  production_count: number | false
  /** Production Group */
  production_group_id: [number, string] /* mrp.production.group */ | false
  /** Manufacturing Orders */
  production_ids: number[] /* mrp.production */
  /** Product Availability — Latest product availability status of the picking */
  products_availability: string | false
  /** Products Availability State */
  products_availability_state: 'available' | 'expected' | 'late' | false
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Purchase Orders */
  purchase_id: [number, string] /* purchase.order */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** References */
  reference_ids: number[] /* stock.reference */ | false
  /** # Returns */
  return_count: number | false
  /** Return of — If this picking was created as a return of another picking, this field links to the original picking. */
  return_id: [number, string] /* stock.picking */ | false
  /** Returns */
  return_ids: number[] /* stock.picking */
  /** Return Label */
  return_label_ids: number[] /* ir.attachment */
  /** Sales Order */
  sale_id: [number, string] /* sale.order */ | false
  /** Scheduled Date — Scheduled time for the first part of the shipment to be processed. Setting manually a value here would set it as expected date for all the stock moves. */
  scheduled_date: string | false
  /** Date Category */
  search_date_category: 'before' | 'yesterday' | 'today' | 'day_1' | 'day_2' | 'after' | false
  /** Volume for Shipping */
  shipping_volume: number | false
  /** Weight for Shipping — Total weight of packages and products not in a package. Packages with no shipping weight specified will default to their products\' total weight. This is the weight used to compute the cost of the shipping. */
  shipping_weight: number | false
  /** Show Allocation — Technical Field used to decide whether the button "Allocation" should be displayed. */
  show_allocation: boolean
  /** Show Check Availability — Technical field used to compute whether the button "Check Availability" should be displayed. */
  show_check_availability: boolean
  /** Show Lots Text */
  show_lots_text: boolean
  /** Show Next Pickings */
  show_next_pickings: boolean
  /** Show Detailed Operations — If this checkbox is ticked, the pickings lines will represent detailed stock operations. If not, the picking lines will represent an aggregate of detailed stock operations. */
  show_operations: boolean
  /** Signature — Signature */
  signature: string | false
  /** Status —  * Draft: The transfer is not confirmed yet. Reservation doesn\'t apply.
 * Waiting another operation: This transfer is waiting for another operation before being ready.
 * Waiting: The transfer is waiting for the availability of some products.
(a) The shipping policy is "As soon as possible": no product could be reserved.
(b) The shipping policy is "When all products are ready": not all the products could be reserved.
 * Ready: The transfer is ready to be processed.
(a) The shipping policy is "As soon as possible": at least one product has been reserved.
(b) The shipping policy is "When all products are ready": all product have been reserved.
 * Done: The transfer has been processed.
 * Cancelled: The transfer has been cancelled. */
  state: 'draft' | 'waiting' | 'confirmed' | 'assigned' | 'done' | 'cancel' | false
  /** Create New Lots/Serial Numbers — If this is checked only, it will suppose you want to create new Lots/Serial Numbers, so you can provide them in a text field.  */
  use_create_lots: boolean
  /** Use Existing Lots/Serial Numbers — If this is checked, you will be able to choose the Lots/Serial Numbers. You can also decide to not put lots in this operation type.  This means it will create stock with no lot or not put a restriction on the lot taken.  */
  use_existing_lots: boolean
  /** Responsible */
  user_id: [number, string] /* res.users */ | false
  /** Address */
  warehouse_address_id: [number, string] /* res.partner */ | false
  /** Website — Website where this order has been placed, for eCommerce orders. */
  website_id: [number, string] /* website */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Weight — Total weight of the products in the picking. */
  weight: number | false
  /** Bulk Weight — Total weight of products which are not in a package. */
  weight_bulk: number | false
  /** Weight unit of measure label */
  weight_uom_name: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for stock.picking */
export type StockPickingFieldName = ModelFieldName<StockPickingRecord>

/** Typed search_read result */
export type StockPickingSearchResult = ModelRecord<StockPickingRecord>
