// Auto-generated from mail.followers (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** mail.followers */
export interface MailFollowersRecord extends BaseRecord {
  /** Related Document Model Name */
  res_model: string
  /** Related Document ID — Id of the followed resource */
  res_id: unknown | false
  /** Related Partner */
  partner_id: [number, string] /* res.partner */
  /** Subtype — Message subtypes followed, meaning subtypes that will be pushed onto the user\'s Wall. */
  subtype_ids: number[] /* mail.message.subtype */ | false
  /** Name */
  name: string | false
  /** Email */
  email: string | false
  /** Is Active */
  is_active: boolean
}

/** Field names for mail.followers */
export type MailFollowersFieldName = ModelFieldName<MailFollowersRecord>

/** Typed search_read result */
export type MailFollowersSearchResult = ModelRecord<MailFollowersRecord>
