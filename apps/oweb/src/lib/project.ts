/** Project module constants and route helpers. */

export const PROJECT_PROJECT_MODEL = 'project.project'
export const PROJECT_TASK_MODEL = 'project.task'

/** Odoo xml ids for project menu actions. */
export const PROJECT_ACTION_XML_ID = {
  projects: 'project.open_view_project_all',
  tasks: 'project.action_view_all_task',
  myTasks: 'project.action_view_my_task',
} as const

export function projectTaskRecordPath(id: number): string {
  return `/project/task/${id}`
}

export function projectProjectRecordPath(id: number): string {
  return `/project/project/${id}`
}

export function resolveProjectRecordPath(model: string, id: number): string | undefined {
  if (model === PROJECT_TASK_MODEL) return projectTaskRecordPath(id)
  if (model === PROJECT_PROJECT_MODEL) return projectProjectRecordPath(id)
  return undefined
}
