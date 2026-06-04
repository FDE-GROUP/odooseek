import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { FieldWidgetProps } from '../index'
import { Many2ManyTagsWidget } from '../utility'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: { name: 'test', type: 'char', string: 'Test' } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  ...overrides,
})

describe('Many2ManyTagsWidget readOnly', () => {
  test('shows tags', () => {
    render(
      <Many2ManyTagsWidget
        {...f({
          readOnly: true,
          value: [
            [1, 'Tag A'],
            [2, 'Tag B'],
          ],
        })}
      />,
    )
    expect(screen.getByText('Tag A')).toBeDefined()
    expect(screen.getByText('Tag B')).toBeDefined()
  })

  test('renders empty container when no tags', () => {
    const { container } = render(<Many2ManyTagsWidget {...f({ readOnly: true, value: false })} />)
    expect(container.querySelector('.flex-wrap')).toBeDefined()
  })
})
