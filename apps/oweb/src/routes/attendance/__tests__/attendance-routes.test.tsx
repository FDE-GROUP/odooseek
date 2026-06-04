import { describe, expect, test } from 'vitest'
import { ATTENDANCE_ACTION_XML_ID, ATTENDANCE_MODEL } from '../../../lib/attendance'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('attendance routes — menu navigation', () => {
  test('Attendance main menu → /attendance/kiosk', () => {
    const target = resolveMenuRoute({
      xmlid: 'hr_attendance.menu_hr_attendance_root',
      resModel: ATTENDANCE_MODEL,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/attendance/kiosk' })
  })

  test('hr.attendance by resModel → /attendance/kiosk', () => {
    const target = resolveMenuRoute({ resModel: ATTENDANCE_MODEL })
    expect(target).toMatchObject({ kind: 'module', to: '/attendance/kiosk' })
  })
})

describe('attendance action xml ids', () => {
  test('kiosk action', () => {
    expect(ATTENDANCE_ACTION_XML_ID.kiosk).toBe('hr_attendance.hr_attendance_action_kiosk_mode')
  })
})
