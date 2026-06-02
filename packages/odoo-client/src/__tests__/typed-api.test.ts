import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as apiModule from '../api'
import {
  createModel,
  defaultGetModel,
  readModel,
  readSingleModel,
  searchReadModel,
  unlinkModel,
  writeModel,
} from '../typed-api'

vi.mock('../api', () => ({
  callKw: vi.fn(),
  searchRead: vi.fn(),
}))

const callKw = apiModule.callKw as ReturnType<typeof vi.fn>
const searchRead = apiModule.searchRead as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('typed-api', () => {
  describe('readModel', () => {
    test('delegates to callKw with read method', async () => {
      callKw.mockResolvedValue([{ id: 1, name: 'A' }])
      const result = await readModel<{ id: number; name: string }>('res.partner', [1], ['id', 'name'])
      expect(callKw).toHaveBeenCalledWith('res.partner', 'read', [[1], ['id', 'name']])
      expect(result).toEqual([{ id: 1, name: 'A' }])
    })

    test('handles empty ids array', async () => {
      callKw.mockResolvedValue([])
      const result = await readModel('res.partner', [], ['id'])
      expect(result).toEqual([])
    })

    test('returns typed array', async () => {
      callKw.mockResolvedValue([{ id: 7, display_name: 'Test' }])
      const result = await readModel<{ id: number; display_name: string }>('hr.employee', [7], ['id', 'display_name'])
      expect(result[0].id).toBe(7)
    })
  })

  describe('searchReadModel', () => {
    test('delegates to searchRead', async () => {
      searchRead.mockResolvedValue([{ id: 1, name: 'Lead' }])
      const result = await searchReadModel<{ id: number; name: string }>('crm.lead', [['type', '=', 'opportunity']], ['id', 'name'])
      expect(searchRead).toHaveBeenCalledWith('crm.lead', [['type', '=', 'opportunity']], ['id', 'name'], undefined, undefined, undefined)
      expect(result).toEqual([{ id: 1, name: 'Lead' }])
    })

    test('passes optional offset/limit/order', async () => {
      searchRead.mockResolvedValue([])
      await searchReadModel('sale.order', [], ['id'], 10, 50, 'id desc')
      expect(searchRead).toHaveBeenCalledWith('sale.order', [], ['id'], 10, 50, 'id desc')
    })

    test('returns empty on no results', async () => {
      searchRead.mockResolvedValue([])
      const result = await searchReadModel('stock.picking', [], ['id'])
      expect(result).toEqual([])
    })
  })

  describe('readSingleModel', () => {
    test('returns first result', async () => {
      callKw.mockResolvedValue([{ id: 42, name: 'Found' }])
      const result = await readSingleModel<{ id: number; name: string }>('res.partner', 42, ['id', 'name'])
      expect(result).toEqual({ id: 42, name: 'Found' })
    })

    test('returns undefined for empty results', async () => {
      callKw.mockResolvedValue([])
      const result = await readSingleModel('res.partner', 99, ['id'])
      expect(result).toBeUndefined()
    })
  })

  describe('writeModel', () => {
    test('delegates to callKw with write method', async () => {
      callKw.mockResolvedValue(true)
      const result = await writeModel('res.partner', [1, 2], { name: 'Updated' })
      expect(callKw).toHaveBeenCalledWith('res.partner', 'write', [[1, 2], { name: 'Updated' }])
      expect(result).toBe(true)
    })

    test('handles single id', async () => {
      callKw.mockResolvedValue(true)
      await writeModel('hr.employee', [7], { active: false })
      expect(callKw).toHaveBeenCalledWith('hr.employee', 'write', [[7], { active: false }])
    })
  })

  describe('createModel', () => {
    test('delegates to callKw with create method', async () => {
      callKw.mockResolvedValue(100)
      const result = await createModel('res.partner', { name: 'New Partner' })
      expect(callKw).toHaveBeenCalledWith('res.partner', 'create', [{ name: 'New Partner' }])
      expect(result).toBe(100)
    })
  })

  describe('unlinkModel', () => {
    test('delegates to callKw with unlink method', async () => {
      callKw.mockResolvedValue(true)
      const result = await unlinkModel('mail.message', [1, 2, 3])
      expect(callKw).toHaveBeenCalledWith('mail.message', 'unlink', [[1, 2, 3]])
      expect(result).toBe(true)
    })
  })

  describe('defaultGetModel', () => {
    test('delegates to callKw with default_get method', async () => {
      callKw.mockResolvedValue({ name: 'Default', active: true })
      const result = await defaultGetModel<{ name: string; active: boolean }>('res.partner', ['name', 'active'])
      expect(callKw).toHaveBeenCalledWith('res.partner', 'default_get', [['name', 'active']])
      expect(result).toEqual({ name: 'Default', active: true })
    })
  })
})
