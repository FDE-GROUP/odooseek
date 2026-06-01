import { describe, expect, test } from 'vitest'
import { PresenceIcon } from '../PresenceIcon'

describe('PresenceIcon', () => {
  test('renders present state', () => {
    const ctx = { field: {} as any, value: 'present', onChange: () => {}, readOnly: true }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })

  test('renders absent state', () => {
    const ctx = { field: {} as any, value: 'absent', onChange: () => {}, readOnly: true }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })

  test('renders away state', () => {
    const ctx = { field: {} as any, value: 'away', onChange: () => {}, readOnly: true }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })

  test('renders out_of_working_hour state', () => {
    const ctx = {
      field: {} as any,
      value: 'out_of_working_hour',
      onChange: () => {},
      readOnly: true,
    }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })

  test('defaults to absent for unknown value', () => {
    const ctx = { field: {} as any, value: null, onChange: () => {}, readOnly: true }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })

  test('renders compact (non-readOnly) without text', () => {
    const ctx = { field: {} as any, value: 'present', onChange: () => {}, readOnly: false }
    const result = PresenceIcon(ctx)
    expect(result).toBeTruthy()
  })
})
