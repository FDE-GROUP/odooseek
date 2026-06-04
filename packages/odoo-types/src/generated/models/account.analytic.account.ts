// Auto-generated from account.analytic.account (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.analytic.account */
export interface AccountAnalyticAccountRecord extends BaseRecord {
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
  /** Analytic Account */
  name: string
  /** Reference */
  code: string | false
  /** Active — Deactivate the account. */
  active: boolean
  /** Plan */
  plan_id: [number, string] /* account.analytic.plan */
  /** Root Plan */
  root_plan_id: [number, string] /* account.analytic.plan */ | false
  /** Color Index */
  color: number | false
  /** Analytic Lines */
  line_ids: number[] /* account.analytic.line */
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Customer */
  partner_id: [number, string] /* res.partner */ | false
  /** Balance */
  balance: number | false
  /** Debit */
  debit: number | false
  /** Credit */
  credit: number | false
  /** Currency */
  currency_id: [number, string] /* res.currency */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Invoice Count */
  invoice_count: number | false
  /** Vendor Bill Count */
  vendor_bill_count: number | false
  /** Projects */
  project_ids: number[] /* project.project */
  /** Project Count */
  project_count: number | false
  /** Purchase Order Count */
  purchase_order_count: number | false
  /** Production */
  production_ids: number[] /* mrp.production */ | false
  /** Manufacturing Orders Count */
  production_count: number | false
  /** Bom */
  bom_ids: number[] /* mrp.bom */ | false
  /** BoM Count */
  bom_count: number | false
  /** Workcenter */
  workcenter_ids: number[] /* mrp.workcenter */ | false
  /** Work Order Count */
  workorder_count: number | false
}

/** Field names for account.analytic.account */
export type AccountAnalyticAccountFieldName = ModelFieldName<AccountAnalyticAccountRecord>

/** Typed search_read result */
export type AccountAnalyticAccountSearchResult = ModelRecord<AccountAnalyticAccountRecord>
