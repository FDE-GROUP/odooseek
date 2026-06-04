// Auto-generated from im_livechat.channel (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** im_livechat.channel */
export interface Im_livechatChannelRecord extends BaseRecord {
  /** Are you inside the matrix? */
  are_you_inside: boolean
  /** Available Operator */
  available_operator_ids: number[] /* res.users */ | false
  /** No Chats During Call — While on a call, agents will not receive new conversations. */
  block_assignment_during_call: boolean
  /** Button Background Color — Default background color of the Livechat button */
  button_background_color: string | false
  /** Text of the Button */
  button_text: string | false
  /** Button Text Color — Default text color of the Livechat button */
  button_text_color: string | false
  /** Sessions */
  channel_ids: number[] /* discuss.channel */
  /** Number of Chatbot */
  chatbot_script_count: number | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Welcome Message — This is an automated \'welcome\' message that your visitor will see when they initiate a new conversation. */
  default_message: string | false
  /** Header Background Color — Default background color of the channel header once open */
  header_background_color: string | false
  /** Maximum Sessions — Maximum number of concurrent sessions per operator. */
  max_sessions: number | false
  /** Sessions per Operator — If limited, operators will only handle the selected number of sessions at a time. */
  max_sessions_mode: 'unlimited' | 'limited' | false
  /** Channel Name */
  name: string
  /** Number of conversation */
  nbr_channel: number | false
  /** Number of Ongoing Sessions */
  ongoing_session_count: number | false
  /** Average Rating */
  rating_avg: number | false
  /** Average Rating (%) */
  rating_avg_percentage: number | false
  /** # Ratings */
  rating_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Rating Satisfaction — Percentage of happy ratings */
  rating_percentage_satisfaction: number | false
  /** Remaining Session Capacity */
  remaining_session_capacity: number | false
  /** Review Link — Visitors who leave a positive review will be redirected to this optional link. */
  review_link: string | false
  /** Rules */
  rule_ids: number[] /* im_livechat.channel.rule */
  /** Script (external) */
  script_external: string | false
  /** Title Color — Default title color of the channel once open */
  title_color: string | false
  /** Agents */
  user_ids: number[] /* res.users */ | false
  /** Web Page — URL to a static page where you client can discuss with the operator of the channel. */
  web_page: string | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for im_livechat.channel */
export type Im_livechatChannelFieldName = ModelFieldName<Im_livechatChannelRecord>

/** Typed search_read result */
export type Im_livechatChannelSearchResult = ModelRecord<Im_livechatChannelRecord>
