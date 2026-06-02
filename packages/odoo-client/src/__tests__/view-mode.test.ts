import { describe, expect, test } from 'vitest'
import {
  defaultViewTypeFromActWindow,
  normalizeViewMode,
  orderedViewTypesFromActWindow,
  parseActionViewModes,
} from '../view-mode'

describe('view-mode', () => {
  describe('normalizeViewMode', () => {
    test('maps tree to list', () => {
      expect(normalizeViewMode('tree')).toBe('list')
    })

    test('passes through all supported types', () => {
      expect(normalizeViewMode('kanban')).toBe('kanban')
      expect(normalizeViewMode('list')).toBe('list')
      expect(normalizeViewMode('form')).toBe('form')
      expect(normalizeViewMode('pivot')).toBe('pivot')
      expect(normalizeViewMode('graph')).toBe('graph')
      expect(normalizeViewMode('calendar')).toBe('calendar')
      expect(normalizeViewMode('activity')).toBe('activity')
    })

    test('handles whitespace', () => {
      expect(normalizeViewMode('  kanban  ')).toBe('kanban')
      expect(normalizeViewMode('\tlist')).toBe('list')
    })

    test('handles mixed case', () => {
      expect(normalizeViewMode('Kanban')).toBe('kanban')
      expect(normalizeViewMode('FORM')).toBe('form')
      expect(normalizeViewMode('Calendar')).toBe('calendar')
    })

    test('returns undefined for unknown types', () => {
      expect(normalizeViewMode('map')).toBeUndefined()
      expect(normalizeViewMode('gantt')).toBeUndefined()
    })

    test('returns undefined for empty string', () => {
      expect(normalizeViewMode('')).toBeUndefined()
      expect(normalizeViewMode('   ')).toBeUndefined()
    })
  })

  describe('parseActionViewModes', () => {
    test('preserves order', () => {
      expect(parseActionViewModes('kanban,list,form')).toEqual(['kanban', 'list', 'form'])
    })

    test('handles single mode', () => {
      expect(parseActionViewModes('list')).toEqual(['list'])
    })

    test('handles tree → list conversion', () => {
      expect(parseActionViewModes('tree,form')).toEqual(['list', 'form'])
    })

    test('filters unknown modes', () => {
      expect(parseActionViewModes('kanban,gantt,list')).toEqual(['kanban', 'list'])
    })

    test('handles whitespace in modes', () => {
      expect(parseActionViewModes(' kanban , list , form ')).toEqual(['kanban', 'list', 'form'])
    })

    test('returns empty for undefined input', () => {
      expect(parseActionViewModes(undefined)).toEqual([])
    })

    test('returns empty for empty string', () => {
      expect(parseActionViewModes('')).toEqual([])
    })
  })

  describe('orderedViewTypesFromActWindow', () => {
    test('prefers views tuples over view_mode', () => {
      expect(
        orderedViewTypesFromActWindow('list,form', [
          [false, 'kanban'],
          [1, 'list'],
        ]),
      ).toEqual(['kanban', 'list'])
    })

    test('falls back to view_mode when views is empty', () => {
      expect(orderedViewTypesFromActWindow('list,form', [])).toEqual(['list', 'form'])
    })

    test('falls back to view_mode when views is not array', () => {
      expect(orderedViewTypesFromActWindow('kanban,list', {})).toEqual(['kanban', 'list'])
      expect(orderedViewTypesFromActWindow('graph', null)).toEqual(['graph'])
    })

    test('handles views with tree type', () => {
      expect(
        orderedViewTypesFromActWindow('form', [
          [1, 'tree'],
          [2, 'kanban'],
        ]),
      ).toEqual(['list', 'kanban'])
    })

    test('returns empty for both undefined', () => {
      expect(orderedViewTypesFromActWindow()).toEqual([])
    })

    test('handles views with invalid entries', () => {
      expect(
        orderedViewTypesFromActWindow('list', [
          [1, 'kanban'],
          'not_an_array',
          [2, 'unknown_mode'],
          [3, 'pivot'],
        ]),
      ).toEqual(['kanban', 'pivot'])
    })
  })

  describe('defaultViewTypeFromActWindow', () => {
    test('returns first mode', () => {
      expect(defaultViewTypeFromActWindow('activity,kanban,list')).toBe('activity')
    })

    test('returns first from views when views preferred', () => {
      expect(
        defaultViewTypeFromActWindow('list,form', [
          [false, 'kanban'],
          [1, 'list'],
        ]),
      ).toBe('kanban')
    })

    test('returns list as fallback for empty input', () => {
      expect(defaultViewTypeFromActWindow()).toBe('list')
    })

    test('returns list for empty view_mode', () => {
      expect(defaultViewTypeFromActWindow('')).toBe('list')
    })
  })
})
