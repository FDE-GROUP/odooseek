import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { OdooKanbanRenderer } from '../OdooKanbanRenderer'

const { mockCallKw, mockReadGroup } = vi.hoisted(() => ({
  mockCallKw: vi.fn(),
  mockReadGroup: vi.fn(),
}))

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      callKw: mockCallKw,
      readGroup: mockReadGroup,
    },
  }
})
vi.mock('../../components/ConfirmDialog', () => ({
  useConfirmDialog: () => vi.fn(),
}))

let queryClient: QueryClient

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const simpleKanbanArch = `<kanban>
  <field name="name"/>
  <field name="expected_revenue"/>
  <field name="partner_id"/>
  <templates>
    <t t-name="card">
      <field name="name" class="fw-bold"/>
      <field name="expected_revenue"/>
    </t>
  </templates>
</kanban>`

const kanbanFields: Record<string, OdooFieldMeta> = {
  name: {
    name: 'name',
    type: 'char',
    string: 'Name',
    required: true,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  expected_revenue: {
    name: 'expected_revenue',
    type: 'monetary',
    string: 'Revenue',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  partner_id: {
    name: 'partner_id',
    type: 'many2one',
    string: 'Partner',
    required: false,
    readonly: false,
    relation: 'res.partner',
    store: true,
    searchable: true,
    sortable: true,
  },
}

const sampleRecords = [
  { id: 1, name: 'Opportunity A', expected_revenue: 5000, partner_id: [1, 'Company A'] },
  { id: 2, name: 'Opportunity B', expected_revenue: 3000, partner_id: [2, 'Company B'] },
]

describe('OdooKanbanRenderer', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReset()
    mockReadGroup.mockReset()
    mockCallKw.mockResolvedValue(sampleRecords)
    mockReadGroup.mockResolvedValue([])
  })

  test('renders kanban cards from search_read data', async () => {
    mockCallKw.mockResolvedValue(sampleRecords)

    render(<OdooKanbanRenderer model="crm.lead" arch={simpleKanbanArch} fields={kanbanFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Opportunity A')).toBeInTheDocument()
    })
    expect(screen.getByText('Opportunity B')).toBeInTheDocument()
  })

  test('renders columns when groupBy is set', async () => {
    render(
      <OdooKanbanRenderer
        model="crm.lead"
        arch={simpleKanbanArch}
        fields={kanbanFields}
        groupBy={['partner_id']}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getAllByText('Opportunity A').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Opportunity B').length).toBeGreaterThan(0)
    })
  })

  test('shows loading state initially', () => {
    mockCallKw.mockReturnValue(new Promise(() => {})) // never resolves

    render(<OdooKanbanRenderer model="crm.lead" arch={simpleKanbanArch} fields={kanbanFields} />, {
      wrapper,
    })

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('renders aside background_image and requests template fields in search_read', async () => {
    const hrKanbanArch = `<kanban>
  <field name="image_1024"/>
  <templates>
    <t t-name="card">
      <aside>
        <field name="image_1024" widget="background_image" options="{'preview_image': 'image_128'}"/>
      </aside>
      <main>
        <field name="name" class="fw-bold"/>
      </main>
    </t>
  </templates>
</kanban>`

    const hrFields: Record<string, OdooFieldMeta> = {
      ...kanbanFields,
      image_1024: {
        name: 'image_1024',
        type: 'binary',
        string: 'Image',
        required: false,
        readonly: false,
        store: true,
        searchable: false,
        sortable: false,
      },
    }

    mockCallKw.mockResolvedValue([{ id: 1, name: 'Alice', image_1024: false }])

    render(<OdooKanbanRenderer model="hr.employee" arch={hrKanbanArch} fields={hrFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    const searchReadCall = mockCallKw.mock.calls.find((c) => c[1] === 'search_read')
    expect(searchReadCall).toBeTruthy()
    const requestedFields = searchReadCall?.[2]?.[1] as string[]
    expect(requestedFields).toContain('image_1024')

    expect(document.querySelector('aside')).toBeTruthy()
    expect(document.querySelector('.flex.flex-row')).toBeTruthy()
  })

  test('collects template fields for search_read', async () => {
    mockCallKw.mockResolvedValue(sampleRecords)

    render(<OdooKanbanRenderer model="crm.lead" arch={simpleKanbanArch} fields={kanbanFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Opportunity A')).toBeInTheDocument()
    })

    const searchReadCall = mockCallKw.mock.calls.find((c) => c[1] === 'search_read')
    const requestedFields = searchReadCall?.[2]?.[1] as string[]
    expect(requestedFields).toContain('name')
    expect(requestedFields).toContain('expected_revenue')
    expect(requestedFields).toContain('partner_id')
  })

  test('empty data renders no cards', async () => {
    mockCallKw.mockResolvedValue([])

    const { container } = render(
      <OdooKanbanRenderer model="crm.lead" arch={simpleKanbanArch} fields={kanbanFields} />,
      { wrapper },
    )

    await waitFor(() => {
      expect(container.querySelector('.kanban-card')).toBeNull()
    })
  })
})
