// Auto-generated from ir.attachment (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** ir.attachment */
export interface IrAttachmentRecord extends BaseRecord {
  /** Name */
  name: string
  /** Description */
  description: string | false
  /** Resource Name */
  res_name: string | false
  /** Resource Model */
  res_model: string | false
  /** Resource Field */
  res_field: string | false
  /** Resource ID */
  res_id: unknown | false
  /** Company */
  company_id: [number, string] /* res.company */ | false
  /** Type — You can either upload a file from your computer or copy/paste an internet link to your file. */
  _type: 'url' | 'binary'
  /** Url */
  url: string | false
  /** Is public document */
  public: boolean
  /** Access Token */
  access_token: string | false
  /** File Content (raw) */
  raw: string | false
  /** File Content (base64) */
  datas: string | false
  /** Database Data */
  db_datas: string | false
  /** Stored Filename */
  store_fname: string | false
  /** File Size */
  file_size: number | false
  /** Checksum/SHA1 */
  checksum: string | false
  /** Mime Type */
  mimetype: string | false
  /** Indexed Content */
  index_content: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** Attachment URL */
  local_url: string | false
  /** Image Src */
  image_src: string | false
  /** Image Width */
  image_width: number | false
  /** Image Height */
  image_height: number | false
  /** Original (unoptimized, unresized) attachment */
  original_id: [number, string] /* ir.attachment */ | false
  /** Thumbnail */
  thumbnail: string | false
  /** Has Thumbnail */
  has_thumbnail: boolean
  /** Voice */
  voice_ids: number[] /* discuss.voice.metadata */
  /** Key */
  key: string | false
  /** Website */
  website_id: [number, string] /* website */ | false
  /** Theme Template */
  theme_template_id: [number, string] /* theme.ir.attachment */ | false
}

/** Field names for ir.attachment */
export type IrAttachmentFieldName = ModelFieldName<IrAttachmentRecord>

/** Typed search_read result */
export type IrAttachmentSearchResult = ModelRecord<IrAttachmentRecord>
