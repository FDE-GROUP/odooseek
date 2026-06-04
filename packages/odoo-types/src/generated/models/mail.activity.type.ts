// Auto-generated from mail.activity.type (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mail.activity.type */
export interface MailActivityTypeRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Action — Actions may trigger specific behavior like opening calendar view or automatically mark as done when a document is uploaded */
  category: 'default' | 'upload_file' | 'phonecall' | 'meeting' | false
  /** Chaining Type */
  chaining_type: 'suggest' | 'trigger'
  /** Created on */
  create_date: string | false
  /** Create Uid */
  create_uid: [number, string] /* res.users */ | false
  /** Decoration Type — Change the background color of the related activities of this type. */
  decoration_type: 'warning' | 'danger' | false
  /** Default Note */
  default_note: string | false
  /** Default User */
  default_user_id: [number, string] /* res.users */ | false
  /** Schedule — Number of days/week/month before executing the action. It allows to plan the action deadline. */
  delay_count: number | false
  /** Delay Type — Type of delay */
  delay_from: 'current_date' | 'previous_activity'
  /** Delay Label */
  delay_label: string | false
  /** Delay units — Unit of delay */
  delay_unit: 'days' | 'weeks' | 'months'
  /** Icon — Font awesome icon e.g. fa-tasks */
  icon: string | false
  /** Initial model — Technical field to keep track of the model at the start of editing to support UX related behaviour */
  initial_res_model: 'account.account' | 'account.analytic.account' | 'hr.applicant' | 'hr.attendance' | 'res.partner.bank' | 'mrp.bom' | 'blog.blog' | 'blog.post' | 'calendar.event' | 'res.company' | 'res.partner' | 'hr.department' | 'discuss.channel' | 'mail.thread.cc' | 'mail.thread' | 'hr.employee' | 'event.event' | 'event.registration' | 'hr.expense' | 'forum.forum' | 'forum.post' | 'forum.tag' | 'gamification.badge' | 'gamification.challenge' | 'gamification.badge.user' | 'iap.account' | 'hr.job' | 'account.journal' | 'account.move' | 'crm.lead' | 'stock.lot' | 'mail.blacklist' | 'mail.thread.blacklist' | 'mail.thread.main.attachment' | 'mrp.production' | 'mail.tracking.duration.mixin' | 'account.payment' | 'phone.blacklist' | 'mail.thread.phone' | 'account.reconcile.model' | 'product.pricelist' | 'product.template' | 'product.category' | 'product.feed' | 'product.product' | 'project.project' | 'project.milestone' | 'project.update' | 'purchase.order' | 'rating.mixin' | 'sale.order' | 'crm.team' | 'crm.team.member' | 'ir.cron' | 'stock.scrap' | 'ir.actions.server' | 'hr.talent.pool' | 'project.task' | 'account.tax' | 'stock.picking' | 'mrp.unbuild' | 'hr.version' | 'mrp.workcenter' | 'mrp.routing.workcenter' | false
  /** Email templates */
  mail_template_ids: number[] /* mail.template */ | false
  /** Name */
  name: string
  /** Preceding Activities */
  previous_type_ids: number[] /* mail.activity.type */ | false
  /** Model — Specify a model if the activity should be specific to a model and not available when managing activities for other models. */
  res_model: 'account.account' | 'account.analytic.account' | 'hr.applicant' | 'hr.attendance' | 'res.partner.bank' | 'mrp.bom' | 'blog.blog' | 'blog.post' | 'calendar.event' | 'res.company' | 'res.partner' | 'hr.department' | 'discuss.channel' | 'mail.thread.cc' | 'mail.thread' | 'hr.employee' | 'event.event' | 'event.registration' | 'hr.expense' | 'forum.forum' | 'forum.post' | 'forum.tag' | 'gamification.badge' | 'gamification.challenge' | 'gamification.badge.user' | 'iap.account' | 'hr.job' | 'account.journal' | 'account.move' | 'crm.lead' | 'stock.lot' | 'mail.blacklist' | 'mail.thread.blacklist' | 'mail.thread.main.attachment' | 'mrp.production' | 'mail.tracking.duration.mixin' | 'account.payment' | 'phone.blacklist' | 'mail.thread.phone' | 'account.reconcile.model' | 'product.pricelist' | 'product.template' | 'product.category' | 'product.feed' | 'product.product' | 'project.project' | 'project.milestone' | 'project.update' | 'purchase.order' | 'rating.mixin' | 'sale.order' | 'crm.team' | 'crm.team.member' | 'ir.cron' | 'stock.scrap' | 'ir.actions.server' | 'hr.talent.pool' | 'project.task' | 'account.tax' | 'stock.picking' | 'mrp.unbuild' | 'hr.version' | 'mrp.workcenter' | 'mrp.routing.workcenter' | false
  /** Model has change */
  res_model_change: boolean
  /** Sequence */
  sequence: number | false
  /** Suggest — Suggest these activities once the current one is marked as done. */
  suggested_next_type_ids: number[] /* mail.activity.type */ | false
  /** Default Summary */
  summary: string | false
  /** Trigger — Automatically schedule this activity once the current one is marked as done. */
  triggered_next_type_id: [number, string] /* mail.activity.type */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for mail.activity.type */
export type MailActivityTypeFieldName = ModelFieldName<MailActivityTypeRecord>

/** Typed search_read result */
export type MailActivityTypeSearchResult = ModelRecord<MailActivityTypeRecord>
