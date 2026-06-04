// Auto-generated from mail.followers (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mail.followers */
export interface MailFollowersRecord extends BaseRecord {
  /** Email */
  email: string | false
  /** Is Active */
  is_active: boolean
  /** Name */
  name: string | false
  /** Related Partner */
  partner_id: [number, string] /* res.partner */
  /** Related Document ID — Id of the followed resource */
  res_id: unknown | false
  /** Related Document Model Name */
  res_model: string
  /** Subtype — Message subtypes followed, meaning subtypes that will be pushed onto the user\'s Wall. */
  subtype_ids: number[] /* mail.message.subtype */ | false
}

/** Field names for mail.followers */
export type MailFollowersFieldName = ModelFieldName<MailFollowersRecord>

/** Typed search_read result */
export type MailFollowersSearchResult = ModelRecord<MailFollowersRecord>
