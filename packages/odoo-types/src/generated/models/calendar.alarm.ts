// Auto-generated from calendar.alarm (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** calendar.alarm */
export interface CalendarAlarmRecord extends BaseRecord {
  /** Name */
  name: string
  /** Type */
  alarm_type: 'notification' | 'email' | 'sms'
  /** Remind Before */
  duration: number
  /** Unit */
  interval: 'minutes' | 'hours' | 'days'
  /** Duration in minutes */
  duration_minutes: number | false
  /** Email Template — Template used to render mail reminder content. */
  mail_template_id: [number, string] /* mail.template */ | false
  /** Additional Message — Additional message that would be sent with the notification for the reminder */
  body: string | false
  /** Notify Responsible */
  notify_responsible: boolean
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
  /** SMS Template — Template used to render SMS reminder content. */
  sms_template_id: [number, string] /* sms.template */ | false
}

/** Field names for calendar.alarm */
export type CalendarAlarmFieldName = ModelFieldName<CalendarAlarmRecord>

/** Typed search_read result */
export type CalendarAlarmSearchResult = ModelRecord<CalendarAlarmRecord>
