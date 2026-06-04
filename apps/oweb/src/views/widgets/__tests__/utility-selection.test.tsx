import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { DaterangeWidget } from '../daterange'
import type { FieldWidgetProps } from '../index'
import { LabelSelectionWidget, StateBadgeWidget, StateSelectionWidget } from '../selection'
import {
  BooleanFavoriteWidget,
  BooleanIconWidget,
  CopyClipboardWidget,
  HandleWidget,
  KanbanActivityWidget,
  RottingWidget,
} from '../utility'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: { name: 'test', type: 'char', string: 'Test' } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  meta: { selection: [['draft', 'Draft']] },
  ...overrides,
})

describe('DaterangeWidget', () => {
  test('renders two date inputs', () => {
    render(<DaterangeWidget {...f({ value: ['2025-01-01', '2025-01-31'] })} />)
    const inputs = screen.getAllByDisplayValue('2025-01-01')
    expect(inputs).toHaveLength(1)
  })

  test('renders empty when value is false', () => {
    const { container } = render(<DaterangeWidget {...f({ value: false })} />)
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(2)
  })
})

describe('HandleWidget', () => {
  test('renders null in non-readonly mode', () => {
    const { container } = render(<HandleWidget {...f()} />)
    // HandleWidget returns null when not readOnly
    expect(container.innerHTML).toBe('')
  })

  test('renders drag handle in readOnly', () => {
    render(<HandleWidget {...f({ readOnly: true })} />)
    expect(screen.getByText('⋮⋮')).toBeDefined()
  })
})

describe('BooleanFavoriteWidget', () => {
  test('shows filled star when active', () => {
    render(<BooleanFavoriteWidget {...f({ value: true })} />)
    expect(screen.getByText('★')).toBeDefined()
  })

  test('shows empty star when inactive', () => {
    render(<BooleanFavoriteWidget {...f({ value: false })} />)
    expect(screen.getByText('☆')).toBeDefined()
  })

  test('calls onChange on click', () => {
    const onChange = vi.fn()
    render(<BooleanFavoriteWidget {...f({ onChange, value: false })} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('BooleanIconWidget', () => {
  test('renders fa icon', () => {
    const { container } = render(<BooleanIconWidget {...f()} />)
    expect(container.querySelector('i.fa')).toBeDefined()
  })
})

describe('CopyClipboardWidget', () => {
  test('renders text value', () => {
    render(<CopyClipboardWidget {...f({ value: 'copy-me' })} />)
    expect(screen.getByText('copy-me')).toBeDefined()
  })
})

describe('KanbanActivityWidget', () => {
  test('renders planned state', () => {
    render(<KanbanActivityWidget {...f({ value: 'planned' })} />)
    expect(screen.getByText('Planned')).toBeDefined()
  })

  test('renders overdue state', () => {
    render(<KanbanActivityWidget {...f({ value: 'overdue' })} />)
    expect(screen.getByText('Overdue')).toBeDefined()
  })

  test('returns null for unknown state', () => {
    const { container } = render(<KanbanActivityWidget {...f({ value: 'unknown' })} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('RottingWidget', () => {
  test('renders days count', () => {
    render(<RottingWidget {...f({ value: 10 })} />)
    expect(screen.getByText('10d')).toBeDefined()
  })

  test('returns null for zero or NaN', () => {
    const { container } = render(<RottingWidget {...f({ value: 0 })} />)
    expect(container.innerHTML).toBe('')
  })

  test('applies danger class for overdue (>14 days)', () => {
    render(<RottingWidget {...f({ value: 20 })} />)
    expect(screen.getByText('20d').className).toContain('text-danger')
  })
})

describe('LabelSelectionWidget', () => {
  test('renders label for matching value', () => {
    render(<LabelSelectionWidget {...f({ value: 'draft' })} />)
    expect(screen.getByText('Draft')).toBeDefined()
  })
})

describe('StateBadgeWidget', () => {
  test('renders done state with success class', () => {
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
})

describe('StateSelectionWidget', () => {
  test('renders select dropdown', () => {
    render(
      <StateSelectionWidget
        {...f({
          value: 'done',
          meta: {
            selection: [
              ['normal', 'Normal'],
              ['done', 'Done'],
              ['blocked', 'Blocked'],
            ],
          },
        })}
      />,
    )
    expect(screen.getByText('Done')).toBeDefined()
  })

  test('shows color for readOnly done state', () => {
    render(
      <StateSelectionWidget
        {...f({
          readOnly: true,
          value: 'done',
          meta: { selection: [['done', 'Done']] },
        })}
      />,
    )
    const star = screen.getByText('★')
    expect(star.className).toContain('text-success')
  })
})
