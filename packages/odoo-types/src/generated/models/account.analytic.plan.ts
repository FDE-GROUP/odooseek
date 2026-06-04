// Auto-generated from account.analytic.plan (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.analytic.plan */
export interface AccountAnalyticPlanRecord extends BaseRecord {
  /** Analytic Accounts Count */
  account_count: number | false
  /** Accounts */
  account_ids: number[] /* account.analytic.account */
  /** All Analytic Accounts Count */
  all_account_count: number | false
  /** Applicability */
  applicability_ids: number[] /* account.analytic.applicability */
  /** Children Plans Count */
  children_count: number | false
  /** Childrens */
  children_ids: number[] /* account.analytic.plan */
  /** Color */
  color: number | false
  /** Complete Name */
  complete_name: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Default Applicability */
  default_applicability: 'optional' | 'mandatory' | 'unavailable' | false
  /** Description */
  description: string | false
  /** Name */
  name: string
  /** Parent */
  parent_id: [number, string] /* account.analytic.plan */ | false
  /** Parent Path */
  parent_path: string | false
  /** Root */
  root_id: [number, string] /* account.analytic.plan */ | false
  /** Sequence */
  sequence: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.analytic.plan */
export type AccountAnalyticPlanFieldName = ModelFieldName<AccountAnalyticPlanRecord>

/** Typed search_read result */
export type AccountAnalyticPlanSearchResult = ModelRecord<AccountAnalyticPlanRecord>
