import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { OdooFieldMeta } from '../../lib/odoo-types'
import { OdooPivotRenderer } from '../OdooPivotRenderer'

const mockCallKw = vi.fn()
vi.mock('../../lib/api', () => ({
  callKw: (...args: unknown[]) => mockCallKw(...args),
}))

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

  test('displays group count', async () => {
    mockCallKw.mockResolvedValueOnce([
      { stage_id: 'New', 'amount:sum': 100, __domain: [], __context: {} },
      { stage_id: 'Won', 'amount:sum': 200, __domain: [], __context: {} },
      { stage_id: 'Lost', 'amount:sum': 50, __domain: [], __context: {} },
    ])

    render(<OdooPivotRenderer model="crm.lead" arch={pivotArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('3 groups')).toBeInTheDocument()
    })
  })
})
