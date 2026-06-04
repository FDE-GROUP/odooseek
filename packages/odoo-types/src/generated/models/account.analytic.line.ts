// Auto-generated from account.analytic.line (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.analytic.line */
export interface AccountAnalyticLineRecord extends BaseRecord {
  /** Project Account */
  account_id: [number, string] /* account.analytic.account */ | false
  /** Amount */
  amount: number
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic Precision */
  analytic_precision: number | false
  /** Analytic Account */
  auto_account_id: [number, string] /* account.analytic.account */ | false
  /** Category */
  category: 'other' | 'invoice' | 'vendor_bill' | 'manufacturing_order' | 'picking_entry' | false
  /** Code */
  code: string | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Date */
  date: string
  /** Fiscal Year Search */
  fiscal_year_search: boolean
  /** Financial Account */
  general_account_id: [number, string] /* account.account */ | false
  /** Financial Journal */
  journal_id: [number, string] /* account.journal */ | false
  /** Journal Item */
  move_line_id: [number, string] /* account.move.line */ | false
  /** Description */
  name: string
  /** Partner */
  partner_id: [number, string] /* res.partner */ | false
  /** Product */
  product_id: [number, string] /* product.product */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Ref. */
  ref: string | false
  /** Sales Order Item */
  so_line: [number, string] /* sale.order.line */ | false
  /** Quantity */
  unit_amount: number | false
  /** User */
  user_id: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Departments */
  x_plan2_id: [number, string] /* account.analytic.account */ | false
  /** Internal */
  x_plan3_id: [number, string] /* account.analytic.account */ | false
}

/** Field names for account.analytic.line */
export type AccountAnalyticLineFieldName = ModelFieldName<AccountAnalyticLineRecord>

/** Typed search_read result */
export type AccountAnalyticLineSearchResult = ModelRecord<AccountAnalyticLineRecord>
