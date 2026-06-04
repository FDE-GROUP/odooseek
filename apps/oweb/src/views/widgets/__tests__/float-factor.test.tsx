import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { FloatFactorWidget } from '../float-factor'
import type { FieldWidgetProps } from '../index'

function props(overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps {
  return {
    field: { name: 'test', type: 'float', string: 'Test' } as unknown as FieldWidgetProps['field'],
    value: 0,
    onChange: vi.fn(),
    ...overrides,
  }
}

describe('FloatFactorWidget', () => {
  test('renders value in readOnly mode', () => {
    render(<FloatFactorWidget {...props({ readOnly: true, value: 2.5 })} />)
    expect(screen.getByText('2.5')).toBeDefined()
  })

  test('increments value on + click', () => {
    const onChange = vi.fn()
    render(<FloatFactorWidget {...props({ onChange, value: 3 })} />)
    fireEvent.click(screen.getByText('+'))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  test('decrements value on − click', () => {
    const onChange = vi.fn()
    render(<FloatFactorWidget {...props({ onChange, value: 3 })} />)
    fireEvent.click(screen.getByText('−'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  test('respects min constraint', () => {
    const onChange = vi.fn()
    render(
      <FloatFactorWidget
        {...props({
          onChange,
          value: 0,
          field: {
            ...props().field,
            options: { min: 0 },
          } as unknown as FieldWidgetProps['field'],
        })}
      />,
    )
    fireEvent.click(screen.getByText('−'))
    expect(onChange).toHaveBeenCalledWith(0)
  })
})
