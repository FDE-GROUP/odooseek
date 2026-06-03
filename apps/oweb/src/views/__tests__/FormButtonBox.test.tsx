import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { StatButton } from '../form/FormButtonBox'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return { ...actual, callKw: (...args: unknown[]) => mockCallKw(...args) }
})

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('StatButton', () => {
  test('renders button name as text', () => {
    render(
      <StatButton
        button={{ type: 'stat_button', name: 'print_quotation', string: 'Print' }}
        model="sale.order"
      />,
      { wrapper },
    )
    expect(screen.getByText('Print')).toBeInTheDocument()
  })

  test('renders field value from record', () => {
    render(
      <StatButton
        button={{
          type: 'stat_button',
          name: 'test',
          string: 'Orders',
          content: { type: 'field', fieldName: 'order_count', string: 'Orders' },
        }}
        model="res.partner"
        record={{ order_count: 42 }}
      />,
      { wrapper },
    )
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
  })

  test('renders custom value from record', () => {
    render(
      <StatButton
        button={{
          type: 'stat_button',
          name: 'test',
          string: 'Revenue',
          content: { type: 'custom', valueField: 'total', textFallback: 'Revenue' },
        }}
        model="sale.order"
        record={{ total: 15000 }}
      />,
      { wrapper },
    )
    expect(screen.getByText('15000')).toBeInTheDocument()
  })

  test('renders fallback text when custom value is missing', () => {
    render(
      <StatButton
        button={{
          type: 'stat_button',
          name: 'test',
          content: { type: 'custom', textFallback: 'No data' },
        }}
        model="sale.order"
      />,
      { wrapper },
    )
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  test('renders zero when field value is null', () => {
    render(
      <StatButton
        button={{
          type: 'stat_button',
          name: 'test',
          string: 'Orders',
          content: { type: 'field', fieldName: 'count' },
        }}
        model="res.partner"
        record={{ count: null as unknown }}
      />,
      { wrapper },
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
