/** HR module constants and route/menu helpers. */

export const HR_EMPLOYEE_MODEL = 'hr.employee'
export const HR_EMPLOYEE_PUBLIC_MODEL = 'hr.employee.public'
export const HR_DEPARTMENT_MODEL = 'hr.department'
export const HR_JOB_MODEL = 'hr.job'
export const HR_WORK_LOCATION_MODEL = 'hr.work.location'
export const MAIL_ACTIVITY_PLAN_MODEL = 'mail.activity.plan'
export const HR_VERSION_MODEL = 'hr.version'

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

/** Menu label / xml_id fragments → frontend routes (Phase 41). */
export const HR_MENU_ROUTE_BY_LABEL: Record<string, string> = {
  Employees: '/hr/employees',
  Directory: '/hr/directory',
  Departments: '/hr/departments',
  'Human Resources': '/hr/employees',
  Jobs: '/hr/jobs',
  'Work Locations': '/hr/work-locations',
  'Onboarding / Offboarding': '/hr/plans',
}

export const HR_MENU_ROUTE_BY_XML_FRAGMENT: Record<string, string> = {
  menu_hr_employee_payroll: '/hr/employees',
  menu_hr_employee: '/hr/directory',
  menu_hr_department: '/hr/departments',
  menu_hr_department_kanban: '/hr/departments',
  menu_hr_root: '/hr/employees',
  menu_hr_main: '/hr/employees',
  menu_view_hr_job: '/hr/jobs',
  menu_hr_work_location_tree: '/hr/work-locations',
  menu_config_plan_plan: '/hr/plans',
  mail_activity_plan_action: '/hr/plans',
}

export function resolveHrMenuRoute(menu: { name?: string; xmlid?: string }): string | undefined {
  if (menu.name && HR_MENU_ROUTE_BY_LABEL[menu.name]) {
    return HR_MENU_ROUTE_BY_LABEL[menu.name]
  }
  const xml = menu.xmlid ?? ''
  for (const [fragment, route] of Object.entries(HR_MENU_ROUTE_BY_XML_FRAGMENT)) {
    if (xml.includes(fragment)) return route
  }
  if (/employee/i.test(menu.name ?? '') && /directory/i.test(menu.name ?? '')) {
    return '/hr/directory'
  }
  if (/department/i.test(menu.name ?? '')) return '/hr/departments'
  if (/employee/i.test(menu.name ?? '')) return '/hr/employees'
  return undefined
}

export function hrEmployeeRecordPath(id: number): string {
  return `/hr/employee/${id}`
}

export function hrDepartmentRecordPath(id: number): string {
  return `/hr/department/${id}`
}

/** Navigate to a dedicated HR route or fall back to Odoo action. Returns true if handled. */
export function navigateHrOrAction(
  navigate: (opts: { to: string; search?: Record<string, unknown> }) => void,
  entry: { name?: string; xmlid?: string; actionID?: number | false },
): boolean {
  const hrRoute = resolveHrMenuRoute({ name: entry.name ?? '', xmlid: entry.xmlid })
  if (hrRoute) {
    navigate({ to: hrRoute })
    return true
  }
  if (entry.actionID) {
    navigate({ to: '/web', search: { action: entry.actionID } })
    return true
  }
  return false
}

export const HR_TRANSIENT_WIZARD_MODELS = new Set([
  'hr.departure.wizard',
  'hr.bank.account.allocation.wizard',
  'hr.version.wizard',
])
