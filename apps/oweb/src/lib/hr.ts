/** HR module constants and route/menu helpers. */

import { resolveMenuRoute } from './menu-navigation'

export const HR_EMPLOYEE_MODEL = 'hr.employee'
export const HR_EMPLOYEE_PUBLIC_MODEL = 'hr.employee.public'
export const HR_DEPARTMENT_MODEL = 'hr.department'
export const HR_JOB_MODEL = 'hr.job'
export const HR_WORK_LOCATION_MODEL = 'hr.work.location'
export const MAIL_ACTIVITY_PLAN_MODEL = 'mail.activity.plan'
export const HR_VERSION_MODEL = 'hr.version'

/** Odoo xml ids for HR menu actions (view_mode / views order). */
export const HR_ACTION_XML_ID = {
  employees: 'hr.open_view_employee_list_my',
  directory: 'hr.hr_employee_public_action',
  departments: 'hr.hr_department_kanban_action',
  jobs: 'hr.action_hr_job',
  workLocations: 'hr.hr_work_location_action',
  plans: 'hr.mail_activity_plan_action',
} as const

/** Fields safe for directory / public employee views (Odoo hr.employee.public). */
export const HR_DIRECTORY_FIELDS = [
  'id',
  'display_name',
  'name',
  'active',
  'department_id',
  'job_id',
  'job_title',
  'parent_id',
  'coach_id',
  'work_email',
  'work_phone',
  'mobile_phone',
  'work_location_id',
  'company_id',
  'category_ids',
  'color',
  'image_128',
  'image_256',
] as const

/** @deprecated Use `resolveMenuRoute` from `menu-navigation.ts` (xmlid/actionPath/actionID). */
export function resolveHrMenuRoute(menu: {
  name?: string
  xmlid?: string
  actionID?: number | false
  actionPath?: string | false
}): string | undefined {
  const target = resolveMenuRoute({
    name: menu.name,
    xmlid: menu.xmlid,
    actionID: menu.actionID,
    actionPath: menu.actionPath,
  })
  return target?.kind === 'module' ? target.to : undefined
}

export function hrEmployeeRecordPath(id: number): string {
  return `/hr/employee/${id}`
}

export function hrDepartmentRecordPath(id: number): string {
  return `/hr/department/${id}`
}

export function resolveHrRecordPath(model: string, id: number): string | undefined {
  if (model === HR_EMPLOYEE_MODEL || model === HR_EMPLOYEE_PUBLIC_MODEL) {
    return hrEmployeeRecordPath(id)
  }
  if (model === HR_DEPARTMENT_MODEL) return hrDepartmentRecordPath(id)
  return undefined
}

export { navigateHrOrAction, navigateMenuEntry } from './menu-navigation'

export const HR_TRANSIENT_WIZARD_MODELS = new Set([
  'hr.departure.wizard',
  'hr.bank.account.allocation.wizard',
  'hr.version.wizard',
])
