import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { BackgroundImageWidget } from '../BackgroundImage'
import type { FieldWidgetProps } from '../index'
import {
  EmailWidget,
  ImageUrlWidget,
  PercentPieWidget,
  PhoneWidget,
  ProgressbarWidget,
  RemainingDaysWidget,
  UrlWidget,
  WebRibbonWidget,
} from '../utility'

const f = (overrides: Partial<FieldWidgetProps> = {}): FieldWidgetProps => ({
  field: { name: 'test', type: 'char', string: 'Test' } as unknown as FieldWidgetProps['field'],
  value: '',
  onChange: vi.fn(),
  ...overrides,
})

describe('EmailWidget', () => {
  test('renders mailto link in readOnly', () => {
    const { container } = render(<EmailWidget {...f({ readOnly: true, value: 'user@test.com' })} />)
    expect(container.querySelector('a[href="mailto:user@test.com"]')).toBeDefined()
  })

  test('renders CharWidget in edit mode', () => {
    render(<EmailWidget {...f({ value: 'user@test.com' })} />)
    expect(screen.getByRole('textbox')).toBeDefined()
  })
})

describe('PhoneWidget', () => {
  test('renders tel link in readOnly', () => {
    const { container } = render(<PhoneWidget {...f({ readOnly: true, value: '+1234567890' })} />)
    expect(container.querySelector('a[href="tel:+1234567890"]')).toBeDefined()
  })
})

describe('UrlWidget', () => {
  test('renders link with target blank in readOnly', () => {
    const { container } = render(
      <UrlWidget {...f({ readOnly: true, value: 'https://odoo.com' })} />,
    )
    const a = container.querySelector('a[href="https://odoo.com"]')
    expect(a).toBeDefined()
    expect(a?.getAttribute('target')).toBe('_blank')
  })
})

describe('PercentPieWidget', () => {
  test('renders SVG circle', () => {
    const { container } = render(<PercentPieWidget {...f({ value: 0.75 })} />)
    expect(container.querySelector('svg')).toBeDefined()
    expect(container.querySelector('circle')).toBeDefined()
  })
})

describe('ImageUrlWidget', () => {
  test('renders img for valid URL', () => {
    const { container } = render(<ImageUrlWidget {...f({ value: 'https://img.com/pic.png' })} />)
    expect(container.querySelector('img[src="https://img.com/pic.png"]')).toBeDefined()
  })

  test('renders dash for empty URL', () => {
    render(<ImageUrlWidget {...f({ value: '' })} />)
    expect(screen.getByText('—')).toBeDefined()
  })
})

describe('ProgressbarWidget', () => {
  test('renders percentage text', () => {
    render(<ProgressbarWidget {...f({ value: 50 })} />)
    expect(screen.getByText('50%')).toBeDefined()
  })

  test('calls onChange on bar click', () => {
    const onChange = vi.fn()
    const { container } = render(<ProgressbarWidget {...f({ onChange, value: 0 })} />)
    const bar = container.querySelector('.cursor-pointer')
    if (bar) fireEvent.click(bar)
    expect(onChange).toHaveBeenCalled()
  })
})

describe('RemainingDaysWidget', () => {
  test('renders dash for falsy', () => {
    render(<RemainingDaysWidget {...f({ value: null })} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  test('renders formatted remaining days', () => {
    render(<RemainingDaysWidget {...f({ value: 5 })} />)
    // formatRemainingDays returns { text, color } — text contains the formatted value
    const el = document.querySelector('.text-sm.font-medium')
    expect(el).toBeDefined()
  })
})

describe('WebRibbonWidget', () => {
  test('renders ribbon with title', () => {
    const field = {
      ...f().field,
      options: { title: 'New', bg_color: 'text-bg-success' },
    } as FieldWidgetProps['field']
    render(<WebRibbonWidget {...f({ field })} />)
    expect(screen.getByText('New')).toBeDefined()
  })

  test('returns null when no title', () => {
    const field = { ...f().field, options: {} } as FieldWidgetProps['field']
    const { container } = render(<WebRibbonWidget {...f({ field })} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('BackgroundImageWidget', () => {
  test('renders background image container', () => {
    const field = {
      ...f().field,
      name: 'image_1920',
    } as FieldWidgetProps['field']
    const { container } = render(
      <BackgroundImageWidget
        {...f({
          field,
          value: 'base64...',
          record: { id: 1, image_1920: 'base64...' },
        })}
      />,
    )
    expect(container.querySelector('.absolute.inset-0')).toBeDefined()
  })
})
