// Auto-generated from stock.rule (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** stock.rule */
export interface StockRuleRecord extends BaseRecord {
  /** Name — This field will fill the packing origin and the name of its moves */
  name: string
  /** Active — If unchecked, it will allow you to hide the rule without removing it. */
  active: boolean
  /** Action */
  action: 'pull' | 'push' | 'pull_push' | 'manufacture' | 'buy'
  /** Sequence */
  sequence: number | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Destination Location */
  location_dest_id: [number, string] /* stock.location */
  /** Source Location */
  location_src_id: [number, string] /* stock.location */ | false
  /** Destination location origin from rule — When set to True the destination location of the stock.move will be the rule.Otherwise, it takes it from the picking type. */
  location_dest_from_rule: boolean
  /** Route */
  route_id: [number, string] /* stock.route */
  /** Route Company — Leave this field empty if this route is shared between all companies */
  route_company_id: [number, string] /* res.company */ | false
  /** Supply Method — Take From Stock: the products will be taken from the available stock of the source location.
Trigger Another Rule: the system will try to find a stock rule to bring the products in the source location. The available stock will be ignored.
Take From Stock, if Unavailable, Trigger Another Rule: the products will be taken from the available stock of the source location.If there is no stock available, the system will try to find a  rule to bring the products in the source location. */
  procure_method: 'make_to_stock' | 'make_to_order' | 'mts_else_mto'
  /** Route Sequence */
  route_sequence: number | false
  /** Operation Type */
  picking_type_id: [number, string] /* stock.picking.type */
  /** Picking Type Code Domain */
  picking_type_code_domain: unknown | false
  /** Lead Time — The expected date of the created transfer will be computed based on this lead time. */
  delay: number | false
  /** Partner Address — Address where goods should be delivered. Optional. */
  partner_address_id: [number, string] /* res.partner */ | false
  /** Cancel Next Move — When ticked, if the move created by this rule is cancelled, the next move will be cancelled too. */
  propagate_cancel: boolean
  /** Propagation of carrier — When ticked, carrier of shipment will be propagated. */
  propagate_carrier: boolean
  /** Warehouse */
  warehouse_id: [number, string] /* stock.warehouse */ | false
  /** Automatic Move — The \'Manual Operation\' value will create a stock move after the current one. With \'Automatic No Step Added\', the location is replaced in the original move. */
  auto: 'manual' | 'transparent'
  /** Rule Message */
  rule_message: string | false
  /** Push Applicability */
  push_domain: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for stock.rule */
export type StockRuleFieldName = ModelFieldName<StockRuleRecord>

/** Typed search_read result */
export type StockRuleSearchResult = ModelRecord<StockRuleRecord>
