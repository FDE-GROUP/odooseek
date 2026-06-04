// Auto-generated from account.reconcile.model (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** account.reconcile.model */
export interface AccountReconcileModelRecord extends BaseRecord {
  /** Active */
  active: boolean
  /** Can Be Proposed */
  can_be_proposed: boolean
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Has Message */
  has_message: boolean
  /** Line */
  line_ids: number[] /* account.reconcile.model.line */
  /** Mapped Partner */
  mapped_partner_id: [number, string] /* res.partner */ | false
  /** Amount — The reconciliation model will only be applied when the amount being lower than, greater than or between specified amount(s). */
  match_amount: 'lower' | 'greater' | 'between' | false
  /** Amount Max Parameter */
  match_amount_max: number | false
  /** Amount Min Parameter */
  match_amount_min: number | false
  /** Journals — The reconciliation model will only be available from the selected journals. */
  match_journal_ids: number[] /* account.journal */ | false
  /** Label — The reconciliation model will only be applied when either the statement line label, the transaction details or the note matches the following:
        * Contains: The statement line must contains this string (case insensitive).
        * Not Contains: Negation of "Contains".
        * Match Regex: Define your own regular expression. */
  match_label: 'contains' | 'not_contains' | 'match_regex' | false
  /** Label Parameter */
  match_label_param: string | false
  /** Partners — The reconciliation model will only be applied to the selected customers/vendors. */
  match_partner_ids: number[] /* res.partner */ | false
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
  /** Name */
  name: string
  /** Next Activity */
  next_activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Sequence */
  sequence: number
  /** Trigger — Validate the statement line automatically (reconciliation based on your rule). */
  trigger: 'manual' | 'auto_reconcile'
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for account.reconcile.model */
export type AccountReconcileModelFieldName = ModelFieldName<AccountReconcileModelRecord>

/** Typed search_read result */
export type AccountReconcileModelSearchResult = ModelRecord<AccountReconcileModelRecord>
