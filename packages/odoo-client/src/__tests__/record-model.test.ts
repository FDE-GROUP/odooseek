import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { RecordModel, _setCallKw } from '../record-model'
import type { OdooFieldMeta } from '../types'

const mockCallKw = vi.fn()

beforeAll(() => {
  _setCallKw((...args: unknown[]) => mockCallKw(...args))
})

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
  afterEach(() => {
    mockCallKw.mockReset()
    vi.useFakeTimers()
  })

  // ── Initialization ──────────────────────────────────────────

  it('initializes with default state', () => {
    const m = new RecordModel(defaultConfig)
    expect(m.data).toEqual({})
    expect(m.dirty).toBe(false)
    expect(m.isNew).toBe(false)
    expect(m.getSnapshot().editMode).toBe(false)
    expect(m.getSnapshot().missingFields.size).toBe(0)
    expect(m.getSnapshot().fieldErrors.size).toBe(0)
    expect(m.getSnapshot().saveError).toBeNull()
    expect(m.getSnapshot().warning).toBeNull()
    expect(m.getSnapshot().justSaved).toBe(false)
    expect(m.getSnapshot().saving).toBe(false)
  })

  // ── enterEdit ───────────────────────────────────────────────

  it('enterEdit sets edit mode and snapshots values', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    const snap = m.getSnapshot()
    expect(snap.editMode).toBe(true)
    expect(snap.data).toEqual({ id: 42, name: 'Alice', email: 'a@b.com', active: true })
    expect(snap.dirty).toBe(false)
  })

  it('enterEdit validates fields on entry', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42 }) // name is required but missing
    const snap = m.getSnapshot()
    expect(snap.missingFields.has('name')).toBe(true)
  })

  it('enterEdit clears previous saveError and warning', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42 })
    m.update('name', '')
    const result = m.save()
    // enterEdit should clear errors
    m.enterEdit({ id: 42, name: 'Alice' })
    expect(m.getSnapshot().saveError).toBeNull()
    expect(m.getSnapshot().warning).toBeNull()
  })

  // ── update ──────────────────────────────────────────────────

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

  it('update type-validates field values', () => {
    const fields = makeFields({ qty: { type: 'integer', string: 'Qty' } })
    const m = new RecordModel({ ...defaultConfig, fields, readFields: ['name', 'qty'] })
    m.enterEdit({ id: 1, name: 'X', qty: 5 })
    m.update('qty', 'not a number')
    expect(m.getSnapshot().fieldErrors.get('qty')).toBeTruthy()
    m.update('qty', 10)
    expect(m.getSnapshot().fieldErrors.has('qty')).toBe(false)
  })

  it('update ignores unknown fields', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('nonexistent_field', 'value')
    expect(m.data.nonexistent_field).toBe('value')
    expect(m.getSnapshot().missingFields.has('nonexistent_field')).toBe(false)
  })

  // ── dirty ───────────────────────────────────────────────────

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

  // ── discard ─────────────────────────────────────────────────

  it('discard resets to baseline', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    m.discard()
    expect(m.data.name).toBe('Alice')
    expect(m.dirty).toBe(false)
    expect(m.getSnapshot().editMode).toBe(false)
  })

  it('discard clears validation state', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', false)
    m.discard()
    expect(m.getSnapshot().missingFields.size).toBe(0)
    expect(m.getSnapshot().fieldErrors.size).toBe(0)
    expect(m.getSnapshot().saveError).toBeNull()
    expect(m.getSnapshot().warning).toBeNull()
  })

  // ── save — validation ───────────────────────────────────────

  it('save validates and returns error for missing required', async () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', false) // required field empty
    const result = await m.save()
    expect(result.success).toBe(false)
    expect(m.getSnapshot().saveError).toBeTruthy()
    expect(mockCallKw).not.toHaveBeenCalled()
  })

  it('save includes field labels in error messages', async () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42 })
    m.update('name', false)
    await m.save()
    expect(m.getSnapshot().saveError).toContain('Name')
  })

  it('save validates only readFields, not all fields', async () => {
    const fields = makeFields({ extra_required: { type: 'char', string: 'Extra', required: true } })
    const m = new RecordModel({ ...defaultConfig, fields, readFields: ['name'] })
    m.enterEdit({ id: 42, name: 'Alice' })
    mockCallKw.mockResolvedValueOnce(true)
    const result = await m.save()
    // extra_required is not in readFields, so save should succeed
    expect(result.success).toBe(true)
  })

  // ── save — write (existing record) ──────────────────────────

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

  it('save exits edit mode after successful write', async () => {
    mockCallKw.mockResolvedValueOnce(true)
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    await m.save()
    expect(m.getSnapshot().editMode).toBe(false)
    expect(m.dirty).toBe(false)
  })

  // ── save — create (new record) ──────────────────────────────

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

  it('save for new record sets values with new id', async () => {
    mockCallKw.mockResolvedValueOnce(99)
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    m.enterEdit({ name: 'Alice' })
    await m.save()
    expect(m.data.id).toBe(99)
    expect(m.getSnapshot().editMode).toBe(false)
  })

  // ── save — error handling ───────────────────────────────────

  it('save handles RPC error', async () => {
    mockCallKw.mockRejectedValueOnce(new Error('Server error'))
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const result = await m.save()
    expect(result.success).toBe(false)
    expect(m.getSnapshot().saveError).toBe('Server error')
  })

  it('save sets saving state during operation', async () => {
    let resolveWrite!: () => void
    mockCallKw.mockReturnValueOnce(new Promise<void>((r) => { resolveWrite = r }))
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const savePromise = m.save()
    // Wait for the async mutex to start executing
    await vi.advanceTimersByTimeAsync(0)
    // The saving flag should be set before the RPC resolves
    expect(m.getSnapshot().saving).toBe(true)
    resolveWrite()
    await savePromise
    expect(m.getSnapshot().saving).toBe(false)
  })

  // ── justSaved ───────────────────────────────────────────────

  it('justSaved auto-clears after timeout', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce(true)
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    await m.save()
    expect(m.getSnapshot().justSaved).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(m.getSnapshot().justSaved).toBe(false)
    vi.useRealTimers()
  })

  // ── showRainbowman ──────────────────────────────────────────

  it('showRainbowman sets justSaved and auto-clears', () => {
    vi.useFakeTimers()
    const m = new RecordModel(defaultConfig)
    m.showRainbowman()
    expect(m.getSnapshot().justSaved).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(m.getSnapshot().justSaved).toBe(false)
    vi.useRealTimers()
  })

  // ── loadFromServer ──────────────────────────────────────────

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

  it('loadFromServer clears saveError and warning', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42 })
    m.update('name', false)
    m.save() // sets saveError
    m.loadFromServer({ id: 42, name: 'Alice' })
    expect(m.getSnapshot().saveError).toBeNull()
    expect(m.getSnapshot().warning).toBeNull()
  })

  // ── loadDefaults ────────────────────────────────────────────

  it('loadDefaults calls default_get and enters edit mode', async () => {
    mockCallKw.mockResolvedValueOnce({ name: 'Default Name', active: true })
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    await m.loadDefaults()
    expect(mockCallKw).toHaveBeenCalledWith(
      'res.partner', 'default_get', [['name', 'email', 'active']], { context: {} },
    )
    expect(m.data.name).toBe('Default Name')
    expect(m.getSnapshot().editMode).toBe(true)
  })

  it('loadDefaults merges context default_ values', async () => {
    mockCallKw.mockResolvedValueOnce({ name: 'Default' })
    const m = new RecordModel({
      ...defaultConfig,
      recordId: undefined,
      context: { default_name: 'From Context', default_email: 'ctx@test.com' },
    })
    await m.loadDefaults()
    expect(m.data.name).toBe('From Context')
    expect(m.data.email).toBe('ctx@test.com')
  })

  it('loadDefaults validates merged values', async () => {
    mockCallKw.mockResolvedValueOnce({}) // no defaults — name is still required
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    await m.loadDefaults()
    expect(m.getSnapshot().missingFields.has('name')).toBe(true)
  })

  // ── onchange ────────────────────────────────────────────────

  it('onchange is debounced after update', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce({ value: { email: 'auto@filled.com' } })
    const m = new RecordModel({
      ...defaultConfig,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ id: 42, name: 'Alice' })

    // update triggers debounce
    m.update('name', 'Bob')
    // onchange should NOT have been called yet (debounced)
    expect(mockCallKw).not.toHaveBeenCalledWith(
      'res.partner', 'onchange', expect.anything(), expect.anything(),
    )
    // advance timer to trigger
    await vi.advanceTimersByTimeAsync(300)
    expect(mockCallKw).toHaveBeenCalledWith(
      'res.partner', 'onchange', expect.anything(), expect.anything(),
    )
    vi.useRealTimers()
  })

  it('onchange merges returned values into changes', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce({ value: { email: 'auto@filled.com' } })
    const m = new RecordModel({
      ...defaultConfig,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ id: 42, name: 'Alice', email: '' })
    m.update('name', 'Bob')
    await vi.advanceTimersByTimeAsync(300)
    expect(m.data.email).toBe('auto@filled.com')
    vi.useRealTimers()
  })

  it('onchange normalizes many2one values', async () => {
    vi.useFakeTimers()
    const fields = makeFields({ partner_id: { type: 'many2one', string: 'Partner', onChange: true } })
    mockCallKw.mockResolvedValueOnce({ value: { partner_id: [5, 'Partner Name'] } })
    const m = new RecordModel({ ...defaultConfig, fields, readFields: ['name', 'partner_id'] })
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    await vi.advanceTimersByTimeAsync(300)
    expect(m.data.partner_id).toBe(5) // normalized from [5, 'Partner Name']
    vi.useRealTimers()
  })

  it('onchange sets warning and auto-dismisses', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce({
      value: {},
      warning: { title: 'Warning!', message: 'Check this field', type: 'dialog' },
    })
    const m = new RecordModel({
      ...defaultConfig,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    await vi.advanceTimersByTimeAsync(300)
    expect(m.getSnapshot().warning).toEqual({ title: 'Warning!', message: 'Check this field', type: 'dialog' })
    vi.advanceTimersByTime(5000)
    expect(m.getSnapshot().warning).toBeNull()
    vi.useRealTimers()
  })

  it('onchange sends correct params to RPC', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce({ value: {} })
    const m = new RecordModel({
      ...defaultConfig,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'Bob')
    await vi.advanceTimersByTimeAsync(300)
    const call = mockCallKw.mock.calls.find(
      (c) => c[1] === 'onchange',
    )
    expect(call).toBeTruthy()
    const args = call![2] as unknown[]
    expect(args[0]).toEqual([42]) // existing record → [id]
    expect(args[2]).toEqual(['name']) // changed fields
    vi.useRealTimers()
  })

  it('onchange for new record sends empty id list', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValueOnce({ value: {} })
    const m = new RecordModel({
      ...defaultConfig,
      recordId: undefined,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ name: 'New' })
    m.update('name', 'Changed')
    await vi.advanceTimersByTimeAsync(300)
    const call = mockCallKw.mock.calls.find(
      (c) => c[1] === 'onchange',
    )
    const args = call![2] as unknown[]
    expect(args[0]).toEqual([]) // new record → []
    vi.useRealTimers()
  })

  it('rapid updates only trigger one onchange', async () => {
    vi.useFakeTimers()
    mockCallKw.mockResolvedValue({ value: {} })
    const m = new RecordModel({
      ...defaultConfig,
      fields: makeFields({ name: { onChange: true } }),
    })
    m.enterEdit({ id: 42, name: 'Alice' })
    m.update('name', 'B')
    m.update('name', 'Bo')
    m.update('name', 'Bob')
    await vi.advanceTimersByTimeAsync(300)
    const onchangeCalls = mockCallKw.mock.calls.filter((c) => c[1] === 'onchange')
    expect(onchangeCalls.length).toBe(1)
    vi.useRealTimers()
  })

  // ── subscribe / snapshot ────────────────────────────────────

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

  it('getSnapshot returns independent copy', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const snap = m.getSnapshot()
    m.update('name', 'Bob')
    // snapshot should still show Alice
    expect(snap.data.name).toBe('Alice')
  })

  it('getSnapshot returns consistent snapshot', () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42, name: 'Alice' })
    const snap1 = m.getSnapshot()
    const snap2 = m.getSnapshot()
    expect(snap1.data).toEqual(snap2.data)
    expect(snap1.dirty).toBe(snap2.dirty)
  })

  it('multiple subscribers all get notified', () => {
    const m = new RecordModel(defaultConfig)
    const l1 = vi.fn()
    const l2 = vi.fn()
    m.subscribe(l1)
    m.subscribe(l2)
    m.enterEdit({ id: 42, name: 'Alice' })
    expect(l1).toHaveBeenCalled()
    expect(l2).toHaveBeenCalled()
  })

  // ── isNew ───────────────────────────────────────────────────

  it('isNew returns true when no recordId', () => {
    const m = new RecordModel({ ...defaultConfig, recordId: undefined })
    expect(m.isNew).toBe(true)
  })

  it('isNew returns false with recordId', () => {
    const m = new RecordModel(defaultConfig)
    expect(m.isNew).toBe(false)
  })

  // ── _buildErrorMessage ──────────────────────────────────────

  it('save error message includes field labels not field names', async () => {
    const m = new RecordModel(defaultConfig)
    m.enterEdit({ id: 42 })
    await m.save()
    const error = m.getSnapshot().saveError!
    expect(error).toContain('Name')
    expect(error).not.toMatch(/^• name/)
  })

  it('save error message includes type validation errors', async () => {
    const fields = makeFields({ qty: { type: 'integer', string: 'Quantity' } })
    const m = new RecordModel({ ...defaultConfig, fields, readFields: ['name', 'qty'] })
    m.enterEdit({ id: 42, name: 'Alice', qty: 'bad' })
    await m.save()
    const error = m.getSnapshot().saveError!
    expect(error).toContain('Quantity')
  })
})
