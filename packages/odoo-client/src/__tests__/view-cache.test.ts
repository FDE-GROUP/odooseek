import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { cacheKey, getCachedViews, getColumnPrefs, setCachedViews, setColumnPrefs } from '../view-cache'

// Mock Date.now for consistent TTL testing
const fixedNow = 1_700_000_000_000

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(fixedNow)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('view-cache', () => {
  describe('cacheKey', () => {
    test('generates stable key from model and views', () => {
      expect(cacheKey('res.partner', [[false, 'list'], [1, 'form']])).toBe('res.partner:f:list,1:form')
      expect(cacheKey('hr.employee', [[7, 'kanban']])).toBe('hr.employee:7:kanban')
    })

    test('handles empty views array', () => {
      expect(cacheKey('crm.lead', [])).toBe('crm.lead:')
    })
  })

  describe('getCachedViews', () => {
    test('returns cached data within TTL', () => {
      const key = cacheKey('res.partner', [[false, 'list']])
      const data = { views: { list: '<tree/>' } }
      localStorage.setItem('oweb_views_' + key, JSON.stringify({ timestamp: fixedNow - 1000, data }))

      const result = getCachedViews(key)
      expect(result).toEqual(data)
    })

    test('returns null for expired entry', () => {
      const key = cacheKey('res.partner', [[false, 'list']])
      const data = { views: { list: '<tree/>' } }
      // TTL is 1 hour, set timestamp to 2 hours ago
      localStorage.setItem('oweb_views_' + key, JSON.stringify({ timestamp: fixedNow - 7200_000, data }))

      const result = getCachedViews(key)
      expect(result).toBeNull()
      // Should also remove the expired entry
      expect(localStorage.getItem('oweb_views_' + key)).toBeNull()
    })

    test('returns null for missing key', () => {
      expect(getCachedViews('nonexistent')).toBeNull()
    })

    test('returns null for invalid JSON', () => {
      localStorage.setItem('oweb_views_bad', 'not json')
      expect(getCachedViews('bad')).toBeNull()
    })
  })

  describe('setCachedViews', () => {
    test('stores data with timestamp', () => {
      const key = cacheKey('res.partner', [[false, 'kanban']])
      const data = { views: { kanban: '<kanban/>' } }

      setCachedViews(key, data)
      const raw = localStorage.getItem('oweb_views_' + key)
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!)
      expect(parsed.data).toEqual(data)
      expect(parsed.timestamp).toBe(fixedNow)
    })

    test('evicts oldest entries when exceeding MAX_ENTRIES', () => {
      // Fill with 25 entries (MAX_ENTRIES is 20)
      for (let i = 0; i < 25; i++) {
        const key = `model_${i}:f:list`
        const ts = fixedNow - (25 - i) * 1000 // older entries first
        localStorage.setItem('oweb_views_' + key, JSON.stringify({ timestamp: ts, data: { i } }))
      }
      // Clear existing localStorage (setCachedViews will trigger eviction)
      // Only set one more to trigger eviction check

      const newKey = cacheKey('new.model', [[false, 'form']])
      setCachedViews(newKey, { fresh: true })

      // All entries should be present (one was evicted)
      expect(localStorage.getItem('oweb_views_' + newKey)).toBeTruthy()

      // Oldest entries should be gone
      let count = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('oweb_views_')) count++
      }
      expect(count).toBeLessThanOrEqual(20)
    })
  })

  describe('getColumnPrefs', () => {
    test('returns hidden columns array', () => {
      localStorage.setItem('oweb_cols_res.partner', JSON.stringify(['email', 'phone']))
      expect(getColumnPrefs('res.partner')).toEqual(['email', 'phone'])
    })

    test('returns null for missing prefs', () => {
      expect(getColumnPrefs('no.prefs')).toBeNull()
    })

    test('returns null for invalid JSON', () => {
      localStorage.setItem('oweb_cols_bad', 'garbage')
      expect(getColumnPrefs('bad')).toBeNull()
    })
  })

  describe('setColumnPrefs', () => {
    test('stores hidden columns', () => {
      setColumnPrefs('sale.order', ['amount_total', 'date_order'])
      const raw = localStorage.getItem('oweb_cols_sale.order')
      expect(JSON.parse(raw!)).toEqual(['amount_total', 'date_order'])
    })
  })
})
