// Auto-generated from project.project.stage (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** project.project.stage */
export interface ProjectProjectStageRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Sequence */
  sequence: number | false
  /** Name */
  name: string
  /** Email Template — If set, an email will be automatically sent to the customer when the project reaches this stage. */
  mail_template_id: [number, string] /* mail.template */ | false
  /** Folded — If enabled, this stage will be displayed as folded in the Kanban and List views of your projects. Projects in a folded stage are considered as closed. */
  fold: boolean
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Color */
  color: number | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** SMS Template — If set, an SMS Text Message will be automatically sent to the customer when the project reaches this stage. */
  sms_template_id: [number, string] /* sms.template */ | false
}

/** Field names for project.project.stage */
export type ProjectProjectStageFieldName = ModelFieldName<ProjectProjectStageRecord>

/** Typed search_read result */
export type ProjectProjectStageSearchResult = ModelRecord<ProjectProjectStageRecord>
