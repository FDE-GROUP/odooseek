import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { FieldWidgetProps } from '../index'
import { PriorityWidget, RadioWidget, StateBadgeWidget } from '../selection'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: {
    name: 'test',
    type: 'selection',
    string: 'Test',
  } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  meta: {
    selection: [
      ['0', 'Low'],
      ['1', 'Medium'],
      ['2', 'High'],
    ],
  },
  ...overrides,
})

describe('PriorityWidget', () => {
  test('renders stars in readOnly mode', () => {
    render(<PriorityWidget {...f({ readOnly: true, value: '1' })} />)
    // value '1' → Medium = 2nd item. All items show ★, color indicates count.
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(3)
    // First 2 items should have warning class (active)
    expect(stars[0].className).toContain('text-warning')
    expect(stars[1].className).toContain('text-warning')
    // 3rd item should be default (inactive)
    expect(stars[2].className).toContain('text-border-default')
  })

  test('calls onChange on star click', () => {
    const onChange = vi.fn()
    render(<PriorityWidget {...f({ onChange, value: '0' })} />)
    const buttons = screen.getAllByText('☆')
    fireEvent.click(buttons[0])
    expect(onChange).toHaveBeenCalled()
  })
})

describe('StateBadgeWidget', () => {
  test('renders label for known state', () => {
    render(
      <StateBadgeWidget
        {...f({
          value: 'draft',
          meta: { selection: [['draft', 'Draft']] },
        })}
      />,
    )
    expect(screen.getByText('Draft')).toBeDefined()
  })

  test('applies color class for known state', () => {
    render(
      <StateBadgeWidget
        {...f({
          value: 'done',
          meta: { selection: [['done', 'Done']] },
        })}
      />,
    )
    const badge = screen.getByText('Done')
    expect(badge.className).toContain('success')
  })

  test('renders raw value when no selection', () => {
    render(<StateBadgeWidget {...f({ value: 'custom' })} />)
    expect(screen.getByText('custom')).toBeDefined()
  })
})

describe('RadioWidget', () => {
  test('renders all options', () => {
    render(<RadioWidget {...f()} />)
    expect(screen.getByText('Low')).toBeDefined()
    expect(screen.getByText('Medium')).toBeDefined()
    expect(screen.getByText('High')).toBeDefined()
  })

  test('shows label in readOnly mode', () => {
    render(<RadioWidget {...f({ readOnly: true, value: '1' })} />)
    expect(screen.getByText('Medium')).toBeDefined()
  })

  test('calls onChange on radio click', () => {
    const onChange = vi.fn()
    render(<RadioWidget {...f({ onChange })} />)
    fireEvent.click(screen.getByLabelText('Low'))
    expect(onChange).toHaveBeenCalledWith('0')
  })
})
