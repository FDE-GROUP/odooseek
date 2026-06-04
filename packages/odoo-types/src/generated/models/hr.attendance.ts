// Auto-generated from hr.attendance (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.attendance */
export interface HrAttendanceRecord extends BaseRecord {
  /** Attendance Approver — The user set in Attendance will access the attendance of the employee through the dedicated app and will be able to edit them. */
  attendance_manager_id: [number, string] /* res.users */ | false
  /** Check In */
  check_in: string
  /** Check Out */
  check_out: string | false
  /** Color */
  color: number | false
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Date */
  date: string
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Device & Location Tracking */
  device_tracking_enabled: boolean
  /** Employee */
  employee_id: [number, string] /* hr.employee */
  /** Theoretical Hours */
  expected_hours: number | false
  /** Has Message */
  has_message: boolean
  /** Browser */
  in_browser: string | false
  /** IP Address */
  in_ip_address: string | false
  /** Latitude */
  in_latitude: number | false
  /** In Location — Based on GPS-Coordinates if available or on IP Address */
  in_location: string | false
  /** Longitude */
  in_longitude: number | false
  /** Mode */
  in_mode: 'kiosk' | 'systray' | 'manual' | 'technical' | false
  /** Is Manager */
  is_manager: boolean
  /** Linked Overtime */
  linked_overtime_ids: number[] /* hr.attendance.overtime.line */ | false
  /** Manager */
  manager_id: [number, string] /* hr.employee */ | false
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
  /** Out Browser */
  out_browser: string | false
  /** Out Ip Address */
  out_ip_address: string | false
  /** Out Latitude */
  out_latitude: number | false
  /** Out Location — Based on GPS-Coordinates if available or on IP Address */
  out_location: string | false
  /** Out Longitude */
  out_longitude: number | false
  /** Out Mode */
  out_mode: 'kiosk' | 'systray' | 'manual' | 'technical' | 'auto_check_out' | false
  /** Over Time */
  overtime_hours: number | false
  /** Overtime Status */
  overtime_status: 'to_approve' | 'approved' | 'refused' | false
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Extra Hours */
  validated_overtime_hours: number | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Worked Hours */
  worked_hours: number | false
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.attendance */
export type HrAttendanceFieldName = ModelFieldName<HrAttendanceRecord>

/** Typed search_read result */
export type HrAttendanceSearchResult = ModelRecord<HrAttendanceRecord>
