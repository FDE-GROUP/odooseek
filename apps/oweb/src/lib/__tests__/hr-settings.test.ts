import { callKw } from '@odooseek/odoo-client'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { HR_SETTINGS_FIELDS, loadHrSettings, saveHrSettings } from '../hr-settings'

vi.mock('@odooseek/odoo-client', () => ({
  callKw: vi.fn(),
}))

const mockCallKw = vi.mocked(callKw)

describe('hr-settings', () => {
  beforeEach(() => {
    mockCallKw.mockReset()
  })

  test('loadHrSettings creates transient record and reads HR fields', async () => {
    mockCallKw.mockResolvedValueOnce(99).mockResolvedValueOnce([
      {
        id: 99,
        module_hr_presence: true,
        hr_presence_control_login: false,
        hr_presence_control_email: true,
        hr_presence_control_ip: false,
        module_hr_attendance: false,
        hr_presence_control_email_amount: 3,
        hr_presence_control_ip_list: '',
        contract_expiration_notice_period: 30,
        work_permit_expiration_notice_period: 60,
      },
    ])

    const settings = await loadHrSettings()

    expect(settings.id).toBe(99)
    expect(settings.hr_presence_control_email_amount).toBe(3)
    expect(mockCallKw).toHaveBeenNthCalledWith(1, 'res.config.settings', 'create', [{}])
    expect(mockCallKw).toHaveBeenNthCalledWith(2, 'res.config.settings', 'read', [
      [99],
      [...HR_SETTINGS_FIELDS],
    ])
  })

  test('saveHrSettings writes and executes settings record', async () => {
    mockCallKw.mockResolvedValue(true)

    await saveHrSettings(42, { module_hr_presence: true, hr_presence_control_login: true })

    expect(mockCallKw).toHaveBeenNthCalledWith(1, 'res.config.settings', 'write', [
      [42],
      { module_hr_presence: true, hr_presence_control_login: true },
    ])
    expect(mockCallKw).toHaveBeenNthCalledWith(2, 'res.config.settings', 'execute', [[42]])
  })

  test('saveHrSettings skips RPC when patch is empty', async () => {
    await saveHrSettings(42, {})
    expect(mockCallKw).not.toHaveBeenCalled()
  })
})
