import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { FilterableSelectionWidget } from '../filterable-selection'
import type { FieldWidgetProps } from '../index'

function props(overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps {
  return {
    field: {
      name: 'test',
      type: 'selection',
      string: 'Test',
    } as unknown as FieldWidgetProps['field'],
    value: 'draft',
    onChange: () => {},
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

describe('FilterableSelectionWidget', () => {
  test('renders current value label in readOnly mode', () => {
    render(<FilterableSelectionWidget {...props({ readOnly: true })} />)
    expect(screen.getByText('Draft')).toBeDefined()
  })

  test('shows placeholder when readonly and no value', () => {
    render(<FilterableSelectionWidget {...props({ readOnly: true, value: '' })} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  test('filters options by search text', () => {
    render(<FilterableSelectionWidget {...props()} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'con' } })
    expect(screen.getByText('Confirmed')).toBeDefined()
    expect(screen.queryByText('Draft')).toBeNull()
  })

  test('shows all options when search is empty', () => {
    render(<FilterableSelectionWidget {...props()} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.focus(input)
    expect(screen.getByText('Draft')).toBeDefined()
    expect(screen.getByText('Confirmed')).toBeDefined()
    expect(screen.getByText('Done')).toBeDefined()
  })
})
