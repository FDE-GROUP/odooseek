// Auto-generated from mrp.bom (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mrp.bom */
export interface MrpBomRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Operation Dependencies — Create operation level dependencies that will influence both planning and the status of work orders upon MO confirmation. If this feature is ticked, and nothing is specified, Odoo will assume that all operations can be started simultaneously. */
  allow_operation_dependencies: boolean
  /** Batch Size — All automatically generated manufacturing orders for this product will be of this size. */
  batch_size: number | false
  /** BoM Lines */
  bom_line_ids: number[] /* mrp.bom.line */
  /** By-products */
  byproduct_ids: number[] /* mrp.bom.byproduct */
  /** Reference */
  code: string | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Flexible Consumption — Defines if you can consume more or less components than the quantity defined on the BoM:
  * Allowed: allowed for all manufacturing users.
  * Allowed with warning: allowed for all manufacturing users with summary of consumption differences when closing the manufacturing order.
  Note that in the case of component Highlight Consumption, where consumption is registered manually exclusively, consumption warnings will still be issued when appropriate also.
  * Blocked: only a manager can close a manufacturing order when the BoM consumption is not respected. */
  consumption: 'flexible' | 'warning' | 'strict'
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Days to prepare Manufacturing Order — Create and confirm Manufacturing Orders this many days in advance, to have enough time to replenish components or manufacture semi-finished products. */
  days_to_prepare_mo: number | false
  /** Enable Batch Size */
  enable_batch_size: boolean
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
  /** Operations Count */
  operation_count: number | false
  /** Operations */
  operation_ids: number[] /* mrp.routing.workcenter */
  /** Operation Type — When a procurement has a ‘produce’ route with a operation type set, it will try to create a Manufacturing Order for that product using a BoM of the same operation type.If not,the operation type is not taken into account in the BoM search. That allows to define stock rules which trigger different manufacturing orders with different BoMs. */
  picking_type_id: [number, string] /* stock.picking.type */ | false
  /** Possible Product Template Attribute Value */
  possible_product_template_attribute_value_ids: number[] /* product.template.attribute.value */ | false
  /** Manufacturing Lead Time — Average lead time in days to manufacture this product. In the case of multi-level BOM, the manufacturing lead times of the components will be added. In case the product is subcontracted, this can be used to determine the date at which components should be sent to the subcontractor. */
  produce_delay: number | false
  /** Product Variant — If a product variant is defined the BOM is available only for this product. */
  product_id: [number, string] /* product.product */ | false
  /** Quantity — This should be the smallest quantity that this product can be produced in. If the BOM contains operations, make sure the work center capacity is accurate. */
  product_qty: number
  /** Product */
  product_tmpl_id: [number, string] /* product.template */
  /** Unit — Unit of Measure (Unit of Measure) is the unit of measurement for the inventory control */
  product_uom_id: [number, string] /* uom.uom */
  /** Project */
  project_id: [number, string] /* project.project */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Manufacturing Readiness */
  ready_to_produce: 'all_available' | 'asap'
  /** Sequence */
  sequence: number | false
  /** Show Copy Operations Button — Technical field used to control the visibility of the \'Copy Existing Operations\' button. */
  show_copy_operations_button: boolean
  /** Show Set Bom Button */
  show_set_bom_button: boolean
  /** BoM Type */
  _type: 'normal' | 'phantom'
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for mrp.bom */
export type MrpBomFieldName = ModelFieldName<MrpBomRecord>

/** Typed search_read result */
export type MrpBomSearchResult = ModelRecord<MrpBomRecord>
