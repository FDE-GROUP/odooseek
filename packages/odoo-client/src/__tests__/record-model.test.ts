import { describe, expect, it, vi } from 'vitest'
import { RecordModel } from '../record-model'
import type { OdooFieldMeta } from '../types'

// Mock callKw
vi.mock('../api', () => ({
  callKw: vi.fn(),
}))

import { callKw } from '../api'
const mockCallKw = vi.mocked(callKw)

function makeFields(overrides?: Record<string, Partial<OdooFieldMeta>>): Record<string, OdooFieldMeta> {
  return {
    name: { type: 'char', string: 'Name', required: true, ...overrides?.name },
    email: { type: 'char', string: 'Email', ...overrides?.email },
    active: { type: 'boolean', string: 'Active', ...overrides?.active },
    ...Object.fromEntries(
      Object.entries(overrides ?? {}).filter(([k]) => k !== 'name' && k !== 'email' && k !== 'active').map(
        ([k, v]) => [k, { type: 'char', string: k, ...v }],
      ),
    ),
  } as Record<string, OdooFieldMeta>
}

const defaultConfig = {
  model: 'res.partner',
  fields: makeFields(),
  recordId: 42,
  readFields: ['name', 'email', 'active'],
}

describe('RecordModel', () => {
  it('initializes with default state', () => {
    const m = new RecordModel(defaultConfig)
    expect(m.data).toEqual({})
    expect(m.dirty).toBe(false)
    expect(m.isNew).toBe(false)
    expect(m.getSnapshot().editMode).toBe(false)
  })

  it('enterEdit sets edit mode and snapshots values', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    const snap = m.getSnapshot()
    expect(snap.editMode).toBe(true)
    expect(snap.data).toEqual({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    expect(snap.dirty).toBe(false)
  })

  it('update sets changes and marks dirty', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    expect(m.data.name).toBe('Bob')
    expect(m.dirty).toBe(true)
  })

  it('update validates required fields', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', false)
    const snap = m.getSnapshot()
    expect(snap.missingFields.has('name')).toBe(true)
  })

  it('update clears missing when value provided', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', false) // missing
    m.update('name', 'Charlie') // filled
    expect(m.getSnapshot().missingFields.has('name')).toBe(false)
  })

  it('discard resets to baseline', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    m.discard()
    expect(m.data.name).toBe('Alice')
    expect(m.dirty).toBe(false)
    expect(m.getSnapshot().editMode).toBe(false)
  })

  it('dirty is false when changes match values', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Alice') // same value
    expect(m.dirty).toBe(false)
  })

  it('dirty is false when not in edit mode', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    m.discard()
    expect(m.dirty).toBe(false)
  })

  it('save validates and returns error for missing required', async () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', false) // required field empty
    const result = await m.save()
    expect(result.success).toBe(false)
    expect(m.getSnapshot().saveError).toBeTruthy()
    expect(mockCallKw).not.toHaveBeenCalled()
  })

  it('save calls write for existing record', async () => {
    mockCallKw.mockResolvedValueOnce(true)
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    m.update('name', 'Bob')
    const result = await m.save()
    expect(result.success).toBe(true)
    expect(mockCallKw.mock.calls[0]![0]).toBe('res.partner')
    expect(mockCallKw.mock.calls[0]![1]).toBe('write')
    const args = mockCallKw.mock.calls[0]![2] as unknown[]
    expect(args[0]).toEqual([42])
    const values = args[1] as Record<string, unknown>
    expect(values.name).toBe('Bob')
    expect(m.getSnapshot().editMode).toBe(false)
    expect(m.getSnapshot().justSaved).toBe(true)
  })

  it('save calls create for new record', async () => {
    mockCallKw.mockResolvedValueOnce(99)
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    m.enterEdit({ name: 'Alice' })
    const result = await m.save()
    expect(result.success).toBe(true)
    expect(result.newId).toBe(99)
    expect(mockCallKw).toHaveBeenCalledWith(
      'res.partner', 'create', [{ name: 'Alice' }], { context: {} },
    )
  })

  it('isNew returns true when no recordId', () => {
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    expect(m.isNew).toBe(true)
  })

  it('save handles RPC error', async () => {
    mockCallKw.mockRejectedValueOnce(new Error('Server error'))
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const result = await m.save()
    expect(result.success).toBe(false)
    expect(m.getSnapshot().saveError).toBe('Server error')
  })

  it('loadFromServer sets values without entering edit mode', () => {
    const m = new RecordModel(defaultConfig)
    m.loadFromServer({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    expect(m.data).toEqual({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    expect(m.getSnapshot().editMode).toBe(false)
  })

  it('loadFromServer enters edit mode for new records', () => {
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    m.loadFromServer({ name: 'New' })
    expect(m.getSnapshot().editMode).toBe(true)
  })

  it('notify triggers subscriber', () => {
    const m = new RecordModel(defaultConfig)
    const listener = vi.fn()
    m.subscribe(listener)
    m.enterEdit({ id: 42, name: 'Alice' })
    expect(listener).toHaveBeenCalled()
  })

  it('subscribe returns unsubscribe function', () => {
    const m = new RecordModel(defaultConfig)
    const listener = vi.fn()
    const unsub = m.subscribe(listener)
    unsub()
    m.enterEdit({ id: 42, name: 'Alice' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('getSnapshot returns consistent snapshot', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const snap1 = m.getSnapshot()
    const snap2 = m.getSnapshot()
    expect(snap1.data).toEqual(snap2.data)
    expect(snap1.dirty).toBe(snap2.dirty)
  })
})
