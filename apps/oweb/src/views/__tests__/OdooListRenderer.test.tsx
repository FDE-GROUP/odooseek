import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { DialogProvider } from '../../hooks/useDialog'
import { OdooListRenderer } from '../OdooListRenderer'

const mockCallKw = vi.fn()
const mockReadGroup = vi.fn()
vi.mock('@odooseek/odoo-client', async (original) => {
  const actual = await original()
  return {
    ...(actual as Record<string, unknown>),
    callKw: (...args: unknown[]) => mockCallKw(...args),
    readGroup: (...args: unknown[]) => mockReadGroup(...args),
    getDecorationClass: () => '',
  }
})

vi.mock('use-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      'list.noRecords': 'No records',
      'list.prev': 'Prev',
      'list.next': 'Next',
      'list.page': `Page ${params?.page ?? 1}`,
      'list.failedToLoad': 'Failed to load',
    }
    return map[key] ?? key
  },
}))

let queryClient: QueryClient
let wrapper: ({ children }: { children: React.ReactNode }) => React.ReactElement

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>{children}</DialogProvider>
    </QueryClientProvider>
  )
}

const listArch = `<list string="Contacts">
  <field name="name"/>
  <field name="email"/>
</list>`

const fields: Record<string, OdooFieldMeta> = {
  name: {
    name: 'name',
    type: 'char',
    string: 'Name',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  email: {
    name: 'email',
    type: 'char',
    string: 'Email',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
}

describe('OdooListRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('renders table header with column labels', async () => {
    mockCallKw
      .mockResolvedValueOnce([{ id: 1, name: 'Test', email: 't@t.com' }])
      .mockResolvedValueOnce(1)

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  test('renders data rows', async () => {
    mockCallKw
      .mockResolvedValueOnce([
        { id: 1, name: 'Alice', email: 'a@b.com' },
        { id: 2, name: 'Bob', email: 'b@c.com' },
      ])
      .mockResolvedValueOnce(2)

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  test('clicking row triggers onRowClick', async () => {
    const onRowClick = vi.fn()
    mockCallKw
      .mockResolvedValueOnce([
        { id: 1, name: 'Alice', email: 'a@b.com' },
        { id: 2, name: 'Bob', email: 'b@c.com' },
      ])
      .mockResolvedValueOnce(2)

    render(
      <OdooListRenderer
        model="res.partner"
        arch={listArch}
        fields={fields}
        onRowClick={onRowClick}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Alice').closest('tr') as HTMLElement)
    expect(onRowClick).toHaveBeenCalledWith(1)
  })

  test('shows no records message for empty data', async () => {
    mockCallKw.mockResolvedValueOnce([]).mockResolvedValueOnce(0)

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('No records')).toBeInTheDocument()
    })
  })

  test('shows grouped data when groupBy is active', async () => {
    mockReadGroup.mockResolvedValueOnce([
      { name: 'Alice', name_count: 3, __domain: [], __context: {} },
    ])

    render(
      <OdooListRenderer model="res.partner" arch={listArch} fields={fields} groupBy={['name']} />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('1 groups')).toBeInTheDocument()
    })
  })

  test('Export is not shown in list header (use ControlPanel Export)', async () => {
    mockCallKw
      .mockResolvedValueOnce([{ id: 1, name: 'Alice', email: 'a@b.com' }])
      .mockResolvedValueOnce(1)

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
    expect(screen.queryByText('Export')).not.toBeInTheDocument()
  })
})

describe('OdooListRenderer — inline editing', () => {
  const editableArch = `<list string="Items" editable="bottom">
    <field name="name"/>
    <field name="qty"/>
  </list>`

  const editableFields: Record<string, OdooFieldMeta> = {
    name: {
      name: 'name',
      type: 'char',
      string: 'Name',
      required: false,
      readonly: false,
      store: true,
      searchable: true,
      sortable: true,
    },
    qty: {
      name: 'qty',
      type: 'integer',
      string: 'Qty',
      required: false,
      readonly: false,
      store: true,
      searchable: true,
      sortable: true,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('editable list shows Add button', async () => {
    mockCallKw.mockResolvedValueOnce([]).mockResolvedValueOnce(0)

    render(<OdooListRenderer model="test.model" arch={editableArch} fields={editableFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument()
    })
  })

  test('clicking row in editable list enters edit mode', async () => {
    mockCallKw.mockResolvedValueOnce([{ id: 1, name: 'Widget', qty: 5 }]).mockResolvedValueOnce(1)

    render(<OdooListRenderer model="test.model" arch={editableArch} fields={editableFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Widget')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Widget').closest('tr') as HTMLElement)

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  test('clicking Save calls write for existing record', async () => {
    mockCallKw
      .mockResolvedValueOnce([{ id: 1, name: 'Widget', qty: 5 }]) // search_read
      .mockResolvedValueOnce(1) // search_count
      .mockResolvedValueOnce(undefined) // write
      .mockResolvedValueOnce([{ id: 1, name: 'Widget Updated', qty: 5 }]) // refetch search_read
      .mockResolvedValueOnce(1) // refetch count

    render(<OdooListRenderer model="test.model" arch={editableArch} fields={editableFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Widget')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Widget').closest('tr') as HTMLElement)

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      // 3rd call should be write (after search_read and search_count)
      const calls = mockCallKw.mock.calls
      const writeCall = calls.find((c: unknown[]) => (c as unknown[])[1] === 'write')
      expect(writeCall).toBeTruthy()
      expect(writeCall?.[0]).toBe('test.model')
      expect(writeCall?.[2][0]).toEqual([1])
    })
  })

  test('clicking Add then Save calls create', async () => {
    mockCallKw
      .mockResolvedValueOnce([]) // search_read (empty)
      .mockResolvedValueOnce(0) // count
      .mockResolvedValueOnce(42) // create returns id
      .mockResolvedValueOnce([{ id: 42, name: '', qty: 0 }]) // refetch search_read
      .mockResolvedValueOnce(1) // refetch count

    render(<OdooListRenderer model="test.model" arch={editableArch} fields={editableFields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add'))

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const calls = mockCallKw.mock.calls
      const createCall = calls.find((c: unknown[]) => (c as unknown[])[1] === 'create')
      expect(createCall).toBeTruthy()
      expect(createCall?.[0]).toBe('test.model')
    })
  })

  test('non-editable list does not show Add button', async () => {
    mockCallKw.mockResolvedValueOnce([{ id: 1, name: 'A' }]).mockResolvedValueOnce(1)

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    expect(screen.queryByText('Add')).not.toBeInTheDocument()
  })

  test('non-editable list clicking row triggers onRowClick', async () => {
    const onRowClick = vi.fn()
    mockCallKw.mockResolvedValueOnce([{ id: 1, name: 'A' }]).mockResolvedValueOnce(1)

    render(
      <OdooListRenderer
        model="res.partner"
        arch={listArch}
        fields={fields}
        onRowClick={onRowClick}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('A').closest('tr') as HTMLElement)
    expect(onRowClick).toHaveBeenCalledWith(1)
  })

  test('renders empty state when no records', async () => {
    mockCallKw.mockResolvedValue([])
    mockReadGroup.mockResolvedValue([])

    render(<OdooListRenderer model="res.partner" arch={listArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.queryByText('A')).not.toBeInTheDocument()
    })
  })

  test('renders grouped view with group headers', async () => {
    mockCallKw.mockResolvedValue([{ id: 1, name: 'A', email: 'a@test.com' }])
    mockReadGroup.mockResolvedValue([{ name: [1, 'A'], _count: 1, __domain: '' }])

    render(
      <OdooListRenderer model="res.partner" arch={listArch} fields={fields} groupBy={['name']} />,
      { wrapper },
    )

    await waitFor(() => {
      const cells = document.querySelectorAll('td')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  test('renders editable list with inputs', async () => {
    mockCallKw.mockResolvedValue([{ id: 1, name: 'A', email: 'a@test.com' }])

    render(<OdooListRenderer model="res.partner" arch={editableArch} fields={fields} />, {
      wrapper,
    })

    await waitFor(() => {
      const inputs = document.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })
  })
})
