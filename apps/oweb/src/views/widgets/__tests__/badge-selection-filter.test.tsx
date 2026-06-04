import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { BadgeSelectionFilterWidget } from '../badge-selection-filter'
import type { FieldWidgetProps } from '../index'

function props(overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps {
  return {
    field: {
      name: 'test',
      type: 'selection',
      string: 'Test',
    } as unknown as FieldWidgetProps['field'],
    value: 'draft',
    onChange: vi.fn(),
    meta: {
      selection: [
        ['draft', 'Draft'],
        ['confirmed', 'Confirmed'],
        ['done', 'Done'],
      ],
    },
    ...overrides,
  }
}

describe('BadgeSelectionFilterWidget', () => {
  test('renders current selection in readOnly mode', () => {
    render(<BadgeSelectionFilterWidget {...props({ readOnly: true })} />)
    expect(screen.getByText('Draft')).toBeDefined()
  })

  test('filters badges by search text', () => {
    render(<BadgeSelectionFilterWidget {...props()} />)
    fireEvent.change(screen.getByPlaceholderText('Filter...'), { target: { value: 'conf' } })
    expect(screen.getByText('Confirmed')).toBeDefined()
    expect(screen.queryByText('Draft')).toBeNull()
  })

  test('calls onChange on badge click', () => {
    const onChange = vi.fn()
    render(<BadgeSelectionFilterWidget {...props({ onChange, value: '' })} />)
    fireEvent.click(screen.getByText('Draft'))
    expect(onChange).toHaveBeenCalledWith('draft')
  })
})
