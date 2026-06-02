import { describe, expect, test } from 'vitest'
import {
  defaultViewTypeFromActWindow,
  normalizeViewMode,
  orderedViewTypesFromActWindow,
  parseActionViewModes,
} from '../view-mode'

describe('view-mode', () => {
  test('normalizeViewMode maps tree to list', () => {
    expect(normalizeViewMode('tree')).toBe('list')
    expect(normalizeViewMode('kanban')).toBe('kanban')
  })

  test('parseActionViewModes preserves order', () => {
    expect(parseActionViewModes('kanban,list,form')).toEqual(['kanban', 'list', 'form'])
  })

  test('orderedViewTypesFromActWindow prefers views tuples', () => {
    expect(
      orderedViewTypesFromActWindow('list,form', [
        [false, 'kanban'],
        [1, 'list'],
      ]),
    ).toEqual(['kanban', 'list'])
  })

  test('defaultViewTypeFromActWindow returns first mode', () => {
    expect(defaultViewTypeFromActWindow('activity,kanban,list')).toBe('activity')
  })
})
