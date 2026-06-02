import { callKw } from '@odooseek/odoo-client'

export const HR_CONFIG_SETTINGS_MODEL = 'res.config.settings'

/** Fields from Odoo 19 `addons/hr/models/res_config_settings.py`. */
export const HR_SETTINGS_FIELDS = [
  'module_hr_presence',
  'hr_presence_control_login',
  'hr_presence_control_email',
  'hr_presence_control_ip',
  'module_hr_attendance',
  'hr_presence_control_email_amount',
  'hr_presence_control_ip_list',
  'contract_expiration_notice_period',
  'work_permit_expiration_notice_period',
] as const

export type HrSettingsField = (typeof HR_SETTINGS_FIELDS)[number]

export interface HrSettingsValues {
  module_hr_presence?: boolean
  hr_presence_control_login?: boolean
  hr_presence_control_email?: boolean
  hr_presence_control_ip?: boolean
  module_hr_attendance?: boolean
  hr_presence_control_email_amount?: number
  hr_presence_control_ip_list?: string
  contract_expiration_notice_period?: number
  work_permit_expiration_notice_period?: number
}

export interface HrSettingsRecord extends HrSettingsValues {
  id: number
}

export type HrSettingsPatch = Partial<
  Pick<
    HrSettingsValues,
    | 'module_hr_presence'
    | 'hr_presence_control_login'
    | 'hr_presence_control_email'
    | 'hr_presence_control_ip'
    | 'module_hr_attendance'
    | 'hr_presence_control_email_amount'
    | 'hr_presence_control_ip_list'
  >
>

/** Create transient settings record and read current HR fields. */
export async function loadHrSettings(): Promise<HrSettingsRecord> {
  const id = await callKw<number>(HR_CONFIG_SETTINGS_MODEL, 'create', [{}])
  const [record] = await callKw<HrSettingsRecord[]>(HR_CONFIG_SETTINGS_MODEL, 'read', [
    [id],
    [...HR_SETTINGS_FIELDS],
  ])
  if (!record?.id) {
    throw new Error('HR settings unavailable')
  }
  return record
}

/** Persist HR settings via Odoo settings execute flow. */
export async function saveHrSettings(settingsId: number, values: HrSettingsPatch): Promise<void> {
  if (!Object.keys(values).length) return
  await callKw(HR_CONFIG_SETTINGS_MODEL, 'write', [[settingsId], values])
  await callKw(HR_CONFIG_SETTINGS_MODEL, 'execute', [[settingsId]])
}
