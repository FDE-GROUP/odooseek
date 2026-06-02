import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'
import {
  projectProjectRecordPath,
  projectTaskRecordPath,
  resolveProjectRecordPath,
} from '../../../lib/project'

describe('project routes', () => {
  test('Projects menu xmlid → /project/projects', () => {
    const target = resolveMenuRoute({
      xmlid: 'project.open_view_project_all',
      actionID: 300,
      resModel: 'project.project',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/project/projects' })
  })

  test('All Tasks menu xmlid → /project/tasks', () => {
    const target = resolveMenuRoute({
      xmlid: 'project.action_view_all_task',
      actionID: 301,
      resModel: 'project.task',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/project/tasks' })
  })

  test('My Tasks menu xmlid → /project/tasks', () => {
    const target = resolveMenuRoute({
      xmlid: 'project.action_view_my_task',
      actionID: 302,
      resModel: 'project.task',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/project/tasks' })
  })

  test('Project root menu → /project/tasks', () => {
    const target = resolveMenuRoute({
      xmlid: 'project.menu_main_pm',
      actionID: 0,
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/project/tasks' })
  })

  test('Project by resModel project.task → /project/tasks', () => {
    const target = resolveMenuRoute({ resModel: 'project.task' })
    expect(target).toMatchObject({ kind: 'module', to: '/project/tasks' })
  })

  test('Project by resModel project.project → /project/projects', () => {
    const target = resolveMenuRoute({ resModel: 'project.project' })
    expect(target).toMatchObject({ kind: 'module', to: '/project/projects' })
  })
})

describe('project helpers', () => {
  test('projectTaskRecordPath returns correct path', () => {
    expect(projectTaskRecordPath(42)).toBe('/project/task/42')
  })

  test('projectProjectRecordPath returns correct path', () => {
    expect(projectProjectRecordPath(99)).toBe('/project/project/99')
  })

  test('resolveProjectRecordPath for project.task', () => {
    expect(resolveProjectRecordPath('project.task', 7)).toBe('/project/task/7')
  })

  test('resolveProjectRecordPath for project.project', () => {
    expect(resolveProjectRecordPath('project.project', 3)).toBe('/project/project/3')
  })

  test('resolveProjectRecordPath returns undefined for unknown model', () => {
    expect(resolveProjectRecordPath('sale.order', 1)).toBeUndefined()
  })
})
