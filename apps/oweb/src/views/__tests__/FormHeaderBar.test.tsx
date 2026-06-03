import type { ButtonElement } from '@odooseek/odoo-client'
import { describe, expect, test, vi } from 'vitest'
import { isButtonVisible } from '../form/FormHeaderBar'

// Mock passesXmlGroups — default to visible (returns true)
vi.mock('../../lib/field-access', () => ({
  passesXmlGroups: vi.fn(() => true),
}))

import { passesXmlGroups } from '../../lib/field-access'

function btn(overrides: Partial<ButtonElement> = {}): ButtonElement {
  return { type: 'button', name: 'test_btn', ...overrides }
}

describe('isButtonVisible', () => {
  test('visible by default', () => {
    expect(isButtonVisible(btn())).toBe(true)
  })

  test('hidden when groups check fails', () => {
    vi.mocked(passesXmlGroups).mockReturnValueOnce(false)
    expect(isButtonVisible(btn({ groups: 'admin.group' }))).toBe(false)
  })

  test('visible when groups check passes', () => {
    vi.mocked(passesXmlGroups).mockReturnValueOnce(true)
    expect(isButtonVisible(btn({ groups: 'user.group' }))).toBe(true)
  })

  test('hidden by static invisible="1"', () => {
    expect(isButtonVisible(btn({ invisible: '1' }), {})).toBe(false)
  })

  test('hidden by static invisible="True"', () => {
    expect(isButtonVisible(btn({ invisible: 'True' }), {})).toBe(false)
  })

  test('visible when invisible is undefined', () => {
    expect(isButtonVisible(btn({ invisible: undefined }), {})).toBe(true)
  })

  test('hidden by states — current state not in allowed list', () => {
    expect(isButtonVisible(btn({ states: 'draft,sent' }), { state: 'done' })).toBe(false)
  })

  test('visible when state is in allowed list', () => {
    expect(isButtonVisible(btn({ states: 'draft,sent' }), { state: 'draft' })).toBe(true)
  })

  test('visible when states is empty string', () => {
    expect(isButtonVisible(btn({ states: undefined }), { state: 'done' })).toBe(true)
  })

  test('hidden when states is set but record has no state', () => {
    expect(isButtonVisible(btn({ states: 'draft' }), {})).toBe(false)
  })

  test('multiple conditions: groups + states both pass', () => {
    vi.mocked(passesXmlGroups).mockReturnValueOnce(true)
    expect(isButtonVisible(btn({ groups: 'hr.group', states: 'draft' }), { state: 'draft' })).toBe(
      true,
    )
  })

  test('multiple conditions: groups pass but states fail', () => {
    vi.mocked(passesXmlGroups).mockReturnValueOnce(true)
    expect(isButtonVisible(btn({ groups: 'hr.group', states: 'draft' }), { state: 'done' })).toBe(
      false,
    )
  })

  test('StatButtonElement without groups/states is visible', () => {
    expect(isButtonVisible({ type: 'stat_button', name: 'action_test' })).toBe(true)
  })
})
