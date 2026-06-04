import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { FieldWidgetProps } from '../index'
import { Many2OneWidget } from '../relational/many2one'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: { name: 'test', type: 'char', string: 'Test' } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  ...overrides,
})

describe('Many2OneWidget readOnly', () => {
  test('shows display name from array value', () => {
    render(<Many2OneWidget {...f({ readOnly: true, value: [1, 'Admin'] })} />)
    expect(screen.getByText('Admin')).toBeDefined()
  })

  test('shows #id when value is number', () => {
    render(<Many2OneWidget {...f({ readOnly: true, value: 42 })} />)
    expect(screen.getByText('#42')).toBeDefined()
  })

  test('shows dash when empty', () => {
    render(<Many2OneWidget {...f({ readOnly: true, value: '' })} />)
    expect(screen.getByText('—')).toBeDefined()
  })
})
