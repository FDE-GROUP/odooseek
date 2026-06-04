// Auto-generated from hr.attendance (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.attendance */
export interface HrAttendanceRecord extends BaseRecord {
  /** Is Follower */
  message_is_follower: boolean
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Has Message */
  has_message: boolean
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Employee */
  employee_id: [number, string] /* hr.employee */
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Manager */
  manager_id: [number, string] /* hr.employee */ | false
  /** Attendance Approver — The user set in Attendance will access the attendance of the employee through the dedicated app and will be able to edit them. */
  attendance_manager_id: [number, string] /* res.users */ | false
  /** Is Manager */
  is_manager: boolean
  /** Check In */
  check_in: string
  /** Check Out */
  check_out: string | false
  /** Date */
  date: string
  /** Worked Hours */
  worked_hours: number | false
  /** Color */
  color: number | false
  /** Over Time */
  overtime_hours: number | false
  /** Overtime Status */
  overtime_status: 'to_approve' | 'approved' | 'refused' | false
  /** Extra Hours */
  validated_overtime_hours: number | false
  /** Latitude */
  in_latitude: number | false
  /** Longitude */
  in_longitude: number | false
  /** In Location — Based on GPS-Coordinates if available or on IP Address */
  in_location: string | false
  /** IP Address */
  in_ip_address: string | false
  /** Browser */
  in_browser: string | false
  /** Mode */
  in_mode: 'kiosk' | 'systray' | 'manual' | 'technical' | false
  /** Out Latitude */
  out_latitude: number | false
  /** Out Longitude */
  out_longitude: number | false
  /** Out Location — Based on GPS-Coordinates if available or on IP Address */
  out_location: string | false
  /** Out Ip Address */
  out_ip_address: string | false
  /** Out Browser */
  out_browser: string | false
  /** Out Mode */
  out_mode: 'kiosk' | 'systray' | 'manual' | 'technical' | 'auto_check_out' | false
  /** Theoretical Hours */
  expected_hours: number | false
  /** Device & Location Tracking */
  device_tracking_enabled: boolean
  /** Linked Overtime */
  linked_overtime_ids: number[] /* hr.attendance.overtime.line */ | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Created on */
  create_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
  /** Last Updated on */
  write_date: string | false
}

/** Field names for hr.attendance */
export type HrAttendanceFieldName = ModelFieldName<HrAttendanceRecord>

/** Typed search_read result */
export type HrAttendanceSearchResult = ModelRecord<HrAttendanceRecord>
