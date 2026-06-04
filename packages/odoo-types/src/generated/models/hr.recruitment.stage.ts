// Auto-generated from hr.recruitment.stage (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.recruitment.stage */
export interface HrRecruitmentStageRecord extends BaseRecord {
  /** Stage Name */
  name: string
  /** Sequence */
  sequence: number | false
  /** Job Specific — Specific jobs that use this stage. Other jobs will not use this stage. */
  job_ids: number[] /* hr.job */ | false
  /** Requirements */
  requirements: string | false
  /** Email Template — If set, a message is posted on the applicant using the template when the applicant is set to the stage. */
  template_id: [number, string] /* mail.template */ | false
  /** Folded in Kanban — This stage is folded in the kanban view when there are no records in that stage to display. */
  fold: boolean
  /** Hired Stage — If checked, this stage is used to determine the hire date of an applicant */
  hired_stage: boolean
  /** Days to rot — Day count before applicants in this stage become stale.         Set to 0 to disable.  Changing this parameter will not affect the rotting status/date of resources last updated before this change. */
  rotting_threshold_days: number | false
  /** Red Kanban Label */
  legend_blocked: string
  /** Orange Kanban Label */
  legend_waiting: string
  /** Green Kanban Label */
  legend_done: string
  /** Grey Kanban Label */
  legend_normal: string
  /** Is Warning Visible */
  is_warning_visible: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for hr.recruitment.stage */
export type HrRecruitmentStageFieldName = ModelFieldName<HrRecruitmentStageRecord>

/** Typed search_read result */
export type HrRecruitmentStageSearchResult = ModelRecord<HrRecruitmentStageRecord>
