import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ThemeProvider } from '../../themes/ThemeContext'
import { OdooGraphRenderer } from '../OdooGraphRenderer'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      callKw: (...args: unknown[]) => mockCallKw(...args),
      readGroup: (...args: unknown[]) => mockCallKw(...args),
    },
  }
})

let queryClient: QueryClient

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>{children}</ThemeProvider>
  </QueryClientProvider>
)

const barArch = `<graph string="Sales">
  <field name="stage_id" type="row"/>
  <field name="amount" type="measure" operator="sum"/>
</graph>`

const multiMeasureArch = `<graph string="Revenue" type="bar">
  <field name="stage_id" type="row"/>
  <field name="amount" type="measure" operator="sum"/>
  <field name="quantity" type="measure" operator="sum"/>
</graph>`

const pieArch = `<graph string="By Stage" type="pie">
  <field name="stage_id" type="row"/>
</graph>`

const areaArch = `<graph string="Trend" type="area">
  <field name="date" type="row" interval="month"/>
  <field name="amount" type="measure"/>
</graph>`

const fields: Record<string, OdooFieldMeta> = {
  stage_id: {
    name: 'stage_id',
    type: 'many2one',
    string: 'Stage',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  amount: {
    name: 'amount',
    type: 'float',
    string: 'Amount',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  quantity: {
    name: 'quantity',
    type: 'float',
    string: 'Quantity',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  date: {
    name: 'date',
    type: 'date',
    string: 'Date',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
}

describe('OdooGraphRenderer', () => {
  test('renders graph title', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([
      { stage_id: 'New', amount: 1000 },
      { stage_id: 'Won', amount: 5000 },
    ])

    render(<OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument()
    })
  })

  test('shows loading spinner', () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReturnValue(new Promise(() => {}))

    const { container } = render(
      <OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />,
      { wrapper },
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('shows error on failure', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockRejectedValue(new Error('Network error'))

    render(<OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  test('shows chart type selector with Bar default', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([{ stage_id: 'New', amount: 100 }])

    render(<OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Bar')).toBeInTheDocument()
    })
  })

  test('shows Pie chart type for pie arch', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([{ stage_id: 'New', __count: 5 }])

    render(<OdooGraphRenderer model="crm.lead" arch={pieArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Pie')).toBeInTheDocument()
    })
  })

  test('shows Area chart type for area arch', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([{ 'date:month': '2026-05', amount: 500 }])

    render(<OdooGraphRenderer model="crm.lead" arch={areaArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Area')).toBeInTheDocument()
    })
  })

  test('shows measure selector when multiple measures exist', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([{ stage_id: 'New', amount: 100, quantity: 5 }])

    render(<OdooGraphRenderer model="sale.order" arch={multiMeasureArch} fields={fields} />, {
      wrapper,
    })

    await waitFor(() => {
      // Title renders
      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })

    // Measure dropdown button should show the first measure name
    const buttons = screen.getAllByRole('button')
    const measureBtn = buttons.find((b) => b.textContent?.includes('amount'))
    expect(measureBtn).toBeTruthy()
  })

  test('sort button toggles sort order', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([
      { stage_id: 'New', amount: 100 },
      { stage_id: 'Won', amount: 500 },
    ])

    render(<OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Sort')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sort'))
    expect(screen.getByText('Sort ↓')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Sort ↓'))
    expect(screen.getByText('Sort ↑')).toBeInTheDocument()
  })

  test('chart type dropdown opens and shows options', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockResolvedValue([{ stage_id: 'New', amount: 100 }])

    render(<OdooGraphRenderer model="crm.lead" arch={barArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Bar')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Bar'))
    expect(screen.getByText('Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Line Chart')).toBeInTheDocument()
    expect(screen.getByText('Pie Chart')).toBeInTheDocument()
    expect(screen.getByText('Area Chart')).toBeInTheDocument()
  })
})
