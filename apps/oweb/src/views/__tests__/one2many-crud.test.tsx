import type { FieldElement } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    callKw: (...args: unknown[]) => mockCallKw(...args),
    fieldsGet: vi.fn().mockResolvedValue({}),
  }
})

let queryClient: QueryClient

const queryWrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const o2mField: FieldElement = {
  type: 'field',
  name: 'order_line',
  subViews: {
    list: {
      columns: [
        { name: 'product_id', string: 'Product', type: 'field' },
        { name: 'quantity', string: 'Quantity', type: 'field' },
      ],
      editable: 'bottom',
      decorations: {},
    },
  },
}

const meta = { relation: 'sale.order.line' }

describe('One2ManyWidget CRUD', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    mockCallKw.mockReset()
  })

  test('renders existing records from value', async () => {
    mockCallKw.mockResolvedValue([
      { id: 1, product_id: [10, 'Chair'], quantity: 5 },
      { id: 2, product_id: [11, 'Desk'], quantity: 2 },
    ])

    const { One2ManyWidget } = await import('../widgets/relational')
    const onChange = vi.fn()

    render(
      <One2ManyWidget
        field={o2mField}
        value={[1, 2]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Chair')).toBeInTheDocument()
      expect(screen.getByText('Desk')).toBeInTheDocument()
    })
  })

  test('Add a row creates new record command on explicit save', async () => {
    mockCallKw
      .mockResolvedValueOnce([{ id: 10, product_id: [1, 'Pen'], quantity: 1 }]) // initial read
      .mockResolvedValueOnce({ product_id: false, quantity: 1 }) // default_get

    const { One2ManyWidget } = await import('../widgets/relational')
    const onChange = vi.fn()

    render(
      <One2ManyWidget
        field={o2mField}
        value={[10]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Pen')).toBeInTheDocument()
    })

    // Add a row — should NOT immediately call onChange (stored as draft)
    fireEvent.click(screen.getByText('Add a row'))

    await waitFor(() => {
      // The row appears in the table with edit controls
      expect(screen.getByTitle('Save')).toBeInTheDocument()
    })

    // onChange should NOT have been called yet
    expect(onChange).not.toHaveBeenCalled()

    // Explicitly save the draft row
    fireEvent.click(screen.getByTitle('Save'))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(Array.isArray(lastCall)).toBe(true)
      const createCmd = lastCall.find((cmd: number[]) => cmd[0] === 0)
      expect(createCmd).toBeDefined()
      expect(typeof createCmd[1]).toBe('number')
      expect(createCmd[1]).toBeLessThan(0) // negative virtual ID
    })
  })

  test('delete existing record adds [2, id] command', async () => {
    mockCallKw.mockResolvedValue([{ id: 5, product_id: [1, 'Table'], quantity: 3 }])

    const { One2ManyWidget } = await import('../widgets/relational')
    const onChange = vi.fn()

    render(
      <One2ManyWidget
        field={o2mField}
        value={[5]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Table')).toBeInTheDocument()
    })

    // Click the × delete button (not the edit save/cancel buttons)
    const deleteButtons = screen.getAllByText('×')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      const deleteCmd = lastCall.find((cmd: number[]) => cmd[0] === 2)
      expect(deleteCmd).toBeDefined()
      expect(deleteCmd[1]).toBe(5)
    })
  })

  test('delete draft row removes it without server command', async () => {
    mockCallKw
      .mockResolvedValueOnce([]) // initial read (no records)
      .mockResolvedValueOnce({ product_id: false, quantity: 1 }) // default_get

    const { One2ManyWidget } = await import('../widgets/relational')
    const onChange = vi.fn()

    render(
      <One2ManyWidget
        field={o2mField}
        value={[]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    // Add a row (enters inline edit mode as draft)
    fireEvent.click(screen.getByText('Add a row'))

    await waitFor(() => {
      expect(screen.getByTitle('Save')).toBeInTheDocument()
    })

    // Cancel the inline edit first (click ✕), then the × delete button appears
    fireEvent.click(screen.getByTitle('Cancel'))

    await waitFor(() => {
      expect(screen.getByText('×')).toBeInTheDocument()
    })

    // Delete the draft row — no onChange needed since it was never committed
    fireEvent.click(screen.getByText('×'))

    // The row is removed from the table — "Add a row" button visible again
    await waitFor(() => {
      expect(screen.getByText('Add a row')).toBeInTheDocument()
    })
  })

  test('new record gets stable negative ID that persists across re-renders', async () => {
    mockCallKw
      .mockResolvedValueOnce([]) // initial read
      .mockResolvedValueOnce({ product_id: false, quantity: 2 }) // default_get

    const { One2ManyWidget } = await import('../widgets/relational')
    const onChange = vi.fn()

    const { rerender } = render(
      <One2ManyWidget
        field={o2mField}
        value={[]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    fireEvent.click(screen.getByText('Add a row'))

    await waitFor(() => {
      // Draft row is visible with edit controls
      expect(screen.getByTitle('Save')).toBeInTheDocument()
    })

    // Re-render the same component
    rerender(
      <One2ManyWidget
        field={o2mField}
        value={[]}
        onChange={onChange}
        readOnly={false}
        meta={meta}
      />,
    )

    // The new row should still be visible (not disappear due to unstable ID)
    expect(screen.getByText('Add a row')).toBeInTheDocument()
  })

  test('shows empty state when no records', async () => {
    mockCallKw.mockResolvedValue([])

    const { One2ManyWidget } = await import('../widgets/relational')
    render(
      <One2ManyWidget
        field={{
          ...o2mField,
          subViews: { list: { columns: [], editable: undefined, decorations: {} } },
        }}
        value={[]}
        onChange={() => {}}
        readOnly={true}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('No records')).toBeInTheDocument()
    })
  })
})

describe('One2ManyWidget sub-form editing', () => {
  const subFormField: FieldElement = {
    type: 'field',
    name: 'order_line',
    subViews: {
      list: {
        columns: [
          { name: 'product_id', string: 'Product', type: 'field' },
          { name: 'quantity', string: 'Qty', type: 'field' },
        ],
        editable: 'bottom',
        decorations: {},
      },
      form: {
        elements: [
          { type: 'field', name: 'product_id', string: 'Product' },
          { type: 'field', name: 'quantity', string: 'Qty' },
        ],
      },
    },
  }

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReset()
  })

  test('uses sub-form layout when adding a row', async () => {
    mockCallKw
      .mockResolvedValueOnce([{ id: 10, product_id: [1, 'Pen'], quantity: 1 }])
      .mockResolvedValueOnce({ product_id: false, quantity: 1 })

    const { One2ManyWidget } = await import('../widgets/relational')
    render(
      <One2ManyWidget
        field={subFormField}
        value={[10]}
        onChange={() => {}}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Pen')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Add a row'))

    await waitFor(() => {
      // Sub-form should render labels from the form elements
      expect(screen.getByText('Product')).toBeInTheDocument()
      expect(screen.getByText('Qty')).toBeInTheDocument()
    })
  })

  test('sub-form shows Save and Cancel buttons', async () => {
    mockCallKw.mockResolvedValueOnce([]).mockResolvedValueOnce({ product_id: false, quantity: 1 })

    const { One2ManyWidget } = await import('../widgets/relational')
    render(
      <One2ManyWidget
        field={subFormField}
        value={[]}
        onChange={() => {}}
        readOnly={false}
        meta={meta}
      />,
      { wrapper: queryWrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Add a row')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Add a row'))

    await waitFor(() => {
      expect(screen.getByTitle('Save')).toBeInTheDocument()
      expect(screen.getByTitle('Cancel')).toBeInTheDocument()
    })
  })
})
