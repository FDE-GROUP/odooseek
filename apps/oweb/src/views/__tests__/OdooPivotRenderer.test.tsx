import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { OdooPivotRenderer } from '../OdooPivotRenderer'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      callKw: (...args: unknown[]) => mockCallKw(...args),
    },
  }
})

let queryClient: QueryClient
let wrapper: ({ children }: { children: React.ReactNode }) => React.ReactElement

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const pivotArch = `<pivot string="Analysis">
  <field name="stage_id" type="row"/>
  <field name="amount" type="measure" operator="sum"/>
</pivot>`

const multiMeasureArch = `<pivot string="Revenue">
  <field name="stage_id" type="row"/>
  <field name="amount" type="measure" operator="sum"/>
  <field name="quantity" type="measure" operator="sum"/>
</pivot>`

const colArch = `<pivot string="By Stage">
  <field name="stage_id" type="row"/>
  <field name="team_id" type="col"/>
  <field name="amount" type="measure" operator="sum"/>
</pivot>`

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
    relation: 'crm.stage',
  },
  team_id: {
    name: 'team_id',
    type: 'many2one',
    string: 'Team',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
    relation: 'crm.team',
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
    type: 'integer',
    string: 'Quantity',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
}

describe('OdooPivotRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('renders pivot table with data', async () => {
    mockCallKw.mockResolvedValueOnce([
      {
        stage_id: 'New',
        'amount:sum': 100,
        __domain: [],
        __context: {},
      },
    ])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Analysis')).toBeInTheDocument()
    })
  })

  test('shows no data message for empty results', async () => {
    mockCallKw.mockResolvedValueOnce([])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })

  test('shows loading spinner initially', () => {
    mockCallKw.mockReturnValue(new Promise(() => {}))

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('renders row values and totals', async () => {
    mockCallKw.mockResolvedValueOnce([
      { stage_id: 'New', 'amount:sum': 100, __domain: [], __context: {} },
      { stage_id: 'Won', 'amount:sum': 200, __domain: [], __context: {} },
    ])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument()
      expect(screen.getByText('Won')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  test('renders column groups with col field', async () => {
    mockCallKw.mockResolvedValueOnce([
      { stage_id: 'New', team_id: 'A', 'amount:sum': 100 },
      { stage_id: 'New', team_id: 'B', 'amount:sum': 50 },
      { stage_id: 'Won', team_id: 'A', 'amount:sum': 200 },
      { stage_id: 'Won', team_id: 'B', 'amount:sum': 150 },
    ])

    render(<OdooPivotRenderer model="crm.lead" arch={colArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('By Stage')).toBeInTheDocument()
      expect(screen.getByText('A Amount')).toBeInTheDocument()
      expect(screen.getByText('B Amount')).toBeInTheDocument()
    })
  })

  test('shows flip axes button', async () => {
    mockCallKw.mockResolvedValueOnce([{ stage_id: 'New', 'amount:sum': 100 }])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByTitle('Flip axes')).toBeInTheDocument()
    })
  })

  test('shows export CSV button', async () => {
    mockCallKw.mockResolvedValueOnce([{ stage_id: 'New', 'amount:sum': 100 }])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByTitle('Export CSV')).toBeInTheDocument()
    })
  })

  test('shows measure toggle buttons for multiple measures', async () => {
    mockCallKw.mockResolvedValueOnce([{ stage_id: 'New', 'amount:sum': 100, 'quantity:sum': 5 }])

    render(<OdooPivotRenderer model="sale.order" arch={multiMeasureArch} fields={fields} />, {
      wrapper,
    })

    await waitFor(() => {
      // Both measure toggle buttons should be visible
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Quantity')).toBeInTheDocument()
    })
  })

  test('row expand buttons are present', async () => {
    mockCallKw.mockResolvedValueOnce([
      { stage_id: 'New', 'amount:sum': 100 },
      { stage_id: 'Won', 'amount:sum': 200 },
    ])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      const expandBtns = screen.getAllByTitle('Expand')
      expect(expandBtns.length).toBe(2)
    })
  })
})
