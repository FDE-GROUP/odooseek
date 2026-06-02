import { describe, expect, test } from 'vitest'
import {
  activityDomainForModel,
  mailActivityFormAction,
  mailActivityScheduleAction,
} from '../activity-actions'

describe('activityDomainForModel', () => {
  test('adds activity_ids filter when field exists', () => {
    const domain = activityDomainForModel([['active', '=', true]], {
      activity_ids: { name: 'activity_ids' },
    })
    expect(domain).toHaveLength(2)
    expect(domain[1]).toEqual(['activity_ids.active', 'in', [true, false]])
    expect(domain[0]).toEqual(['active', '=', true])
  })

  test('skips filter when activity_ids missing', () => {
    expect(activityDomainForModel([['id', '>', 0]], { name: { name: 'name' } })).toEqual([
      ['id', '>', 0],
    ])
  })
})

describe('activity-actions', () => {
  test('mailActivityFormAction sets defaults', () => {
    const action = mailActivityFormAction({
      resModel: 'hr.employee',
      resId: 7,
      activityTypeId: 3,
    })
    expect(action.res_model).toBe('mail.activity')
    expect(action.target).toBe('new')
    expect(action.context).toMatchObject({
      default_res_model: 'hr.employee',
      default_res_id: 7,
      default_activity_type_id: 3,
    })
  })

  test('mailActivityScheduleAction sets active_ids', () => {
    const action = mailActivityScheduleAction({
      resModel: 'hr.employee',
      resIds: [1, 2, 3],
    })
    expect(action.res_model).toBe('mail.activity.schedule')
    expect(action.context).toMatchObject({
      active_model: 'hr.employee',
      active_ids: [1, 2, 3],
      active_id: 1,
    })
  })
})
