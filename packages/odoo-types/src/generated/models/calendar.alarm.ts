// Auto-generated from calendar.alarm (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** calendar.alarm */
export interface CalendarAlarmRecord extends BaseRecord {
  /** Type */
  alarm_type: 'notification' | 'email' | 'sms'
  /** Additional Message — Additional message that would be sent with the notification for the reminder */
  body: string | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Remind Before */
  duration: number
  /** Duration in minutes */
  duration_minutes: number | false
  /** Unit */
  interval: 'minutes' | 'hours' | 'days'
  /** Email Template — Template used to render mail reminder content. */
  mail_template_id: [number, string] /* mail.template */ | false
  /** Name */
  name: string
  /** Notify Responsible */
  notify_responsible: boolean
  /** SMS Template — Template used to render SMS reminder content. */
  sms_template_id: [number, string] /* sms.template */ | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for calendar.alarm */
export type CalendarAlarmFieldName = ModelFieldName<CalendarAlarmRecord>

/** Typed search_read result */
export type CalendarAlarmSearchResult = ModelRecord<CalendarAlarmRecord>
