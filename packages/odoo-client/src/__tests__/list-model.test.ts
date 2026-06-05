import { describe, expect, it, vi } from 'vitest'
import { ListModel } from '../list-model'

describe('ListModel', () => {
  // ── Initialization ──────────────────────────────────────────

  it('initializes with defaults', () => {
    const m = new ListModel()
    expect(m.offset).toBe(0)
    expect(m.limit).toBe(80)
    expect(m.order).toBe('')
    expect(m.selectedIds.size).toBe(0)
    expect(m.expandedGroups.size).toBe(0)
    expect(m.inlineEdit.mode).toBe('idle')
    expect(m.validationErrors).toEqual({})
    expect(m.focusCol).toBe(0)
    expect(m.focusRow).toBe(-1)
    expect(m.multiEditActive).toBe(false)
    expect(m.multiEditValues).toEqual({})
    expect(m.dragRow).toBeNull()
    expect(m.dragOverRow).toBeNull()
  })

  it('accepts config with defaultOrder and defaultLimit', () => {
    const m = new ListModel({ defaultOrder: 'name', defaultLimit: 40 })
    expect(m.order).toBe('name')
    expect(m.limit).toBe(40)
  })

  it('snapshot returns all state', () => {
    const m = new ListModel()
    const snap = m.getSnapshot()
    expect(snap.offset).toBe(0)
    expect(snap.limit).toBe(80)
    expect(snap.order).toBe('')
    expect(snap.selectedIds).toBeInstanceOf(Set)
    expect(snap.expandedGroups).toBeInstanceOf(Set)
    expect(snap.inlineEdit).toEqual({ mode: 'idle', values: {} })
  })

  // ── Pagination ──────────────────────────────────────────────

  it('sort toggles order: field → desc → empty', () => {
    const m = new ListModel()
    m.sort('name')
    expect(m.order).toBe('name')
    m.sort('name')
    expect(m.order).toBe('name desc')
    m.sort('name')
    expect(m.order).toBe('')
  })

  it('sort resets offset', () => {
    const m = new ListModel()
    m.setPage(80)
    expect(m.offset).toBe(80)
    m.sort('name')
    expect(m.offset).toBe(0)
  })

  it('sort clears selection', () => {
    const m = new ListModel()
    m.toggleAll([1, 2, 3], false)
    expect(m.selectedIds.size).toBe(3)
    m.sort('name')
    expect(m.selectedIds.size).toBe(0)
  })

  it('sort saves scroll position', () => {
    const m = new ListModel()
    const el = { scrollTop: 150 } as HTMLDivElement
    m.sort('name', el)
    // scroll saved internally — restore should use it
    const mockEl = { scrollTop: 0 } as unknown as HTMLDivElement
    m.restoreScroll(mockEl)
    expect(mockEl.scrollTop).toBe(150)
  })

  it('setPage changes offset', () => {
    const m = new ListModel()
    m.setPage(80)
    expect(m.offset).toBe(80)
  })

  it('setPage saves scroll position', () => {
    const m = new ListModel()
    const el = { scrollTop: 200 } as HTMLDivElement
    m.setPage(80, el)
    const mockEl = { scrollTop: 0 } as unknown as HTMLDivElement
    m.restoreScroll(mockEl)
    expect(mockEl.scrollTop).toBe(200)
  })

  it('setPageSize resets offset', () => {
    const m = new ListModel()
    m.setPage(80)
    m.setPageSize(40)
    expect(m.offset).toBe(0)
    expect(m.limit).toBe(40)
  })

  it('restoreScroll does nothing without container', () => {
    const m = new ListModel()
    // should not throw
    m.restoreScroll(undefined)
    m.restoreScroll(null)
  })

  it('restoreScroll resets saved position after restore', () => {
    const m = new ListModel()
    const el = { scrollTop: 150 } as HTMLDivElement
    m.sort('name', el)
    const mockEl1 = { scrollTop: 0 } as unknown as HTMLDivElement
    m.restoreScroll(mockEl1)
    expect(mockEl1.scrollTop).toBe(150)
    // second restore should not change (saved cleared)
    const mockEl2 = { scrollTop: 0 } as unknown as HTMLDivElement
    m.restoreScroll(mockEl2)
    expect(mockEl2.scrollTop).toBe(0)
  })

  // ── Selection ───────────────────────────────────────────────

  it('toggleRow adds and removes', () => {
    const m = new ListModel()
    const data = [{ id: 1 }, { id: 2 }]
    m.toggleRow(1, false, 0, data, false)
    expect(m.selectedIds.has(1)).toBe(true)
    m.toggleRow(1, false, 0, data, false)
    expect(m.selectedIds.has(1)).toBe(false)
  })

  it('toggleRow with shift selects range', () => {
    const m = new ListModel()
    const data = [{ id: 10 }, { id: 20 }, { id: 30 }]
    m.toggleRow(10, false, 0, data, false)
    m.toggleRow(30, true, 2, data, false)
    expect(m.selectedIds.has(10)).toBe(true)
    expect(m.selectedIds.has(20)).toBe(true)
    expect(m.selectedIds.has(30)).toBe(true)
  })

  it('toggleRow shift does NOT range select when groupByActive', () => {
    const m = new ListModel()
    const data = [{ id: 10 }, { id: 20 }, { id: 30 }]
    m.toggleRow(10, false, 0, data, false)
    m.toggleRow(30, true, 2, data, true) // groupByActive = true
    expect(m.selectedIds.has(20)).toBe(false) // no range
  })

  it('toggleAll selects/deselects page', () => {
    const m = new ListModel()
    m.toggleAll([1, 2, 3], false)
    expect(m.selectedIds.size).toBe(3)
    m.toggleAll([1, 2, 3], true)
    expect(m.selectedIds.size).toBe(0)
  })

  it('clearSelection empties set', () => {
    const m = new ListModel()
    m.toggleAll([1, 2], false)
    m.clearSelection()
    expect(m.selectedIds.size).toBe(0)
  })

  it('selectAll replaces with given ids', () => {
    const m = new ListModel()
    m.toggleAll([1, 2], false)
    m.selectAll([10, 20, 30])
    expect(m.selectedIds.size).toBe(3)
    expect(m.selectedIds.has(2)).toBe(false)
  })

  // ── Group expansion ─────────────────────────────────────────

  it('toggleGroupExpand adds and removes', () => {
    const m = new ListModel()
    m.toggleGroupExpand('group/a')
    expect(m.expandedGroups.has('group/a')).toBe(true)
    m.toggleGroupExpand('group/a')
    expect(m.expandedGroups.has('group/a')).toBe(false)
  })

  it('toggleGroupExpand collapses children (dash-separated)', () => {
    const m = new ListModel()
    m.toggleGroupExpand('group')
    m.toggleGroupExpand('group-a')
    m.toggleGroupExpand('group-b')
    expect(m.expandedGroups.has('group-a')).toBe(true)
    m.toggleGroupExpand('group') // collapse parent
    expect(m.expandedGroups.has('group')).toBe(false)
    expect(m.expandedGroups.has('group-a')).toBe(false)
    expect(m.expandedGroups.has('group-b')).toBe(false)
  })

  it('setGroupExtraLimits with plain value', () => {
    const m = new ListModel()
    m.setGroupExtraLimits({ 'group/a': 120, 'group/b': 200 })
    expect(m.groupExtraLimits['group/a']).toBe(120)
    expect(m.groupExtraLimits['group/b']).toBe(200)
  })

  it('setGroupExtraLimits with function updater', () => {
    const m = new ListModel()
    m.setGroupExtraLimits({ 'group/a': 100 })
    m.setGroupExtraLimits((prev) => ({ ...prev, 'group/b': 200 }))
    expect(m.groupExtraLimits['group/a']).toBe(100)
    expect(m.groupExtraLimits['group/b']).toBe(200)
  })

  // ── Drag & drop ─────────────────────────────────────────────

  it('drag state lifecycle', () => {
    const m = new ListModel()
    expect(m.dragRow).toBeNull()
    expect(m.dragOverRow).toBeNull()

    m.setDragRow(3)
    expect(m.dragRow).toBe(3)

    m.setDragOverRow(5)
    expect(m.dragOverRow).toBe(5)

    m.clearDragState()
    expect(m.dragRow).toBeNull()
    expect(m.dragOverRow).toBeNull()
  })

  // ── Inline edit ─────────────────────────────────────────────

  it('enterEdit sets editing state with correct values', () => {
    const m = new ListModel()
    m.enterEdit({ id: 42, name: 'test', email: 't@e.com' }, [0, 2])
    expect(m.inlineEdit.mode).toBe('editing')
    expect(m.inlineEdit.recordId).toBe(42)
    expect(m.inlineEdit.values).toEqual({ id: 42, name: 'test', email: 't@e.com' })
    expect(m.focusCol).toBe(0)
    expect(m.validationErrors).toEqual({})
  })

  it('enterEdit clears previous validation errors', () => {
    const m = new ListModel()
    m.enterCreate({ name: '' }, [0])
    m.setValidationErrors({ name: 'Required' })
    m.enterEdit({ id: 1, name: 'test' }, [0])
    expect(Object.keys(m.validationErrors)).toHaveLength(0)
  })

  it('enterCreate sets creating mode', () => {
    const m = new ListModel()
    m.enterCreate({ name: '', email: '' }, [1])
    expect(m.inlineEdit.mode).toBe('creating')
    expect(m.inlineEdit.recordId).toBeUndefined()
    expect(m.focusCol).toBe(1)
  })

  it('leaveEdit resets to idle', () => {
    const m = new ListModel()
    m.enterEdit({ id: 1 }, [0])
    m.leaveEdit()
    expect(m.inlineEdit.mode).toBe('idle')
    expect(m.inlineEdit.values).toEqual({})
    expect(m.validationErrors).toEqual({})
  })

  it('updateEdit changes value and clears field error', () => {
    const m = new ListModel()
    m.enterEdit({ id: 1 }, [0])
    m.setValidationErrors({ name: 'Required', email: 'Invalid' })
    m.updateEdit('name', 'Alice')
    expect(m.inlineEdit.values.name).toBe('Alice')
    expect(m.validationErrors.name).toBeUndefined()
    expect(m.validationErrors.email).toBe('Invalid') // other error preserved
  })

  it('updateEdit does not create error entry if none existed', () => {
    const m = new ListModel()
    m.enterEdit({ id: 1 }, [0])
    m.updateEdit('name', 'Alice')
    expect(m.validationErrors).toEqual({})
  })

  it('setValidationErrors replaces all errors', () => {
    const m = new ListModel()
    m.setValidationErrors({ name: 'Required', qty: 'Must be number' })
    expect(Object.keys(m.validationErrors)).toHaveLength(2)
  })

  // ── Focus ───────────────────────────────────────────────────

  it('moveFocus navigates editable columns', () => {
    const m = new ListModel()
    m.setFocusCol(1)
    m.moveFocus(1, [1, 3, 5])
    expect(m.focusCol).toBe(3)
    m.moveFocus(-1, [1, 3, 5])
    expect(m.focusCol).toBe(1)
  })

  it('moveFocus clamps at start boundary', () => {
    const m = new ListModel()
    m.setFocusCol(1)
    m.moveFocus(-1, [1, 3])
    expect(m.focusCol).toBe(1) // already at start
  })

  it('moveFocus clamps at end boundary', () => {
    const m = new ListModel()
    m.setFocusCol(3)
    m.moveFocus(1, [1, 3])
    expect(m.focusCol).toBe(3) // already at end
  })

  it('moveFocus with empty editableColIndices does nothing', () => {
    const m = new ListModel()
    m.setFocusCol(0)
    m.moveFocus(1, [])
    expect(m.focusCol).toBe(0)
  })

  it('setFocusRow updates row', () => {
    const m = new ListModel()
    m.setFocusRow(5)
    expect(m.focusRow).toBe(5)
  })

  // ── Multi-edit ──────────────────────────────────────────────

  it('multi-edit lifecycle', () => {
    const m = new ListModel()
    m.setMultiEditActive(true)
    expect(m.multiEditActive).toBe(true)

    m.updateMultiEditValue('name', 'test')
    m.updateMultiEditValue('qty', 5)
    expect(m.multiEditValues).toEqual({ name: 'test', qty: 5 })

    m.setMultiEditActive(false)
    expect(m.multiEditActive).toBe(false)
    expect(Object.keys(m.multiEditValues)).toHaveLength(0)
  })

  it('setMultiEditValues replaces all values', () => {
    const m = new ListModel()
    m.setMultiEditActive(true)
    m.setMultiEditValues({ name: 'test' })
    expect(m.multiEditValues).toEqual({ name: 'test' })
  })

  // ── Subscribe / Snapshot ────────────────────────────────────

  it('notify triggers subscriber on sort', () => {
    const m = new ListModel()
    const listener = vi.fn()
    m.subscribe(listener)
    m.sort('name')
    expect(listener).toHaveBeenCalled()
  })

  it('notify triggers subscriber on selection change', () => {
    const m = new ListModel()
    const listener = vi.fn()
    m.subscribe(listener)
    m.toggleRow(1, false, 0, [{ id: 1 }], false)
    expect(listener).toHaveBeenCalled()
  })

  it('subscribe returns unsubscribe function', () => {
    const m = new ListModel()
    const listener = vi.fn()
    const unsub = m.subscribe(listener)
    unsub()
    m.sort('name')
    expect(listener).not.toHaveBeenCalled()
  })

  it('getSnapshot returns independent copy — mutation isolation', () => {
    const m = new ListModel()
    m.toggleRow(1, false, 0, [{ id: 1 }], false)
    const snap = m.getSnapshot()
    expect(snap.selectedIds.has(1)).toBe(true)
    m.clearSelection()
    expect(snap.selectedIds.has(1)).toBe(true) // snapshot unchanged
  })

  it('getSnapshot inlineEdit values are independent', () => {
    const m = new ListModel()
    m.enterEdit({ id: 1, name: 'original' }, [0])
    const snap = m.getSnapshot()
    m.updateEdit('name', 'modified')
    expect(snap.inlineEdit.values.name).toBe('original')
  })

  it('multiple subscribers all get notified', () => {
    const m = new ListModel()
    const l1 = vi.fn()
    const l2 = vi.fn()
    m.subscribe(l1)
    m.subscribe(l2)
    m.sort('name')
    expect(l1).toHaveBeenCalled()
    expect(l2).toHaveBeenCalled()
  })
})
