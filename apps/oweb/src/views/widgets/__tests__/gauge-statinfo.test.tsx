import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { GaugeWidget, StatInfoWidget } from '../gauge-statinfo'
import type { FieldWidgetProps } from '../index'

function fieldProps(overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps {
  return {
    field: { name: 'test', type: 'float', string: 'Test' } as unknown as FieldWidgetProps['field'],
    value: 0,
    onChange: () => {},
    ...overrides,
  }
}

describe('GaugeWidget', () => {
  test('renders percentage text', () => {
    render(<GaugeWidget {...fieldProps({ value: 75 })} />)
    expect(screen.getByText('75%')).toBeDefined()
  })

  test('clamps value to 0-100', () => {
    render(<GaugeWidget {...fieldProps({ value: 150 })} />)
    expect(screen.getByText('100%')).toBeDefined()
  })
})

describe('StatInfoWidget', () => {
  test('renders label and value', () => {
    render(
      <StatInfoWidget
        {...fieldProps({
          value: 42,
          field: {
            ...fieldProps().field,
            string: 'Revenue',
          } as unknown as FieldWidgetProps['field'],
        })}
      />,
    )
    expect(screen.getByText('Revenue')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })

  test('formats monetary type', () => {
    render(
      <StatInfoWidget
        {...fieldProps({
          value: 1234.5,
          field: {
            ...fieldProps().field,
            options: { type: 'monetary' },
          } as unknown as FieldWidgetProps['field'],
        })}
      />,
    )
    expect(screen.getByText('1,234.50')).toBeDefined()
  })
})
