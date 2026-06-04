import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { BooleanToggleWidget, CharWidget, DatetimeWidget, DateWidget, HtmlWidget } from '../basic'
import type { FieldWidgetProps } from '../index'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: { name: 'test', type: 'char', string: 'Test' } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  ...overrides,
})

describe('CharWidget', () => {
  test('renders value in readOnly mode', () => {
    render(<CharWidget {...f({ readOnly: true, value: 'Hello' })} />)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  test('shows dash when empty in readOnly', () => {
    render(<CharWidget {...f({ readOnly: true, value: '' })} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  test('masks password in readOnly', () => {
    const field = { ...f().field, widget: 'password' } as FieldWidgetProps['field']
    render(<CharWidget {...f({ readOnly: true, value: 'secret', field })} />)
    expect(screen.getByText('••••••')).toBeDefined()
  })

  test('calls onChange on input', () => {
    const onChange = vi.fn()
    render(<CharWidget {...f({ onChange })} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } })
    expect(onChange).toHaveBeenCalledWith('new')
  })
})

describe('BooleanToggleWidget', () => {
  test('shows Yes when checked in readOnly', () => {
    render(<BooleanToggleWidget {...f({ readOnly: true, value: true })} />)
    expect(screen.getByText('Yes')).toBeDefined()
  })

  test('shows No when unchecked in readOnly', () => {
    render(<BooleanToggleWidget {...f({ readOnly: true, value: false })} />)
    expect(screen.getByText('No')).toBeDefined()
  })

  test('calls onChange with inverted value', () => {
    const onChange = vi.fn()
    render(<BooleanToggleWidget {...f({ onChange, value: false })} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('DateWidget', () => {
  test('renders date slice in readOnly', () => {
    render(<DateWidget {...f({ readOnly: true, value: '2025-01-15' })} />)
    expect(screen.getByText('2025-01-15')).toBeDefined()
  })

  test('renders empty when no value in readOnly', () => {
    const { container } = render(<DateWidget {...f({ readOnly: true, value: undefined })} />)
    expect(container.querySelector('span')?.textContent).toBe('')
  })
})

describe('DatetimeWidget', () => {
  test('renders datetime slice in readOnly', () => {
    render(<DatetimeWidget {...f({ readOnly: true, value: '2025-01-15 14:30:00' })} />)
    expect(screen.getByText('2025-01-15 14:30:00')).toBeDefined()
  })
})

describe('HtmlWidget', () => {
  test('sanitizes and renders html in readOnly', () => {
    render(<HtmlWidget {...f({ readOnly: true, value: '<b>bold</b>' })} />)
    expect(screen.getByText('bold')).toBeDefined()
  })

  test('strips dangerous tags via DOMPurify', () => {
    render(<HtmlWidget {...f({ readOnly: true, value: '<script>alert(1)</script><p>safe</p>' })} />)
    expect(screen.getByText('safe')).toBeDefined()
    expect(screen.queryByText('alert(1)')).toBeNull()
  })

  test('shows dash when empty in readOnly', () => {
    render(<HtmlWidget {...f({ readOnly: true, value: '' })} />)
    expect(screen.getByText('—')).toBeDefined()
  })
})
