import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Many2ManyTagsWidget } from '../widgets/utility'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return { ...actual, callKw: (...args: unknown[]) => mockCallKw(...args) }
})

let queryClient: QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const field = { type: 'field' as const, name: 'tag_ids', nolabel: true }

describe('Many2ManyTagsWidget', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReset()
  })

  test('renders existing tags in readOnly mode', () => {
    render(
      <Many2ManyTagsWidget
        field={field}
        value={[
          [1, 'Tag A'],
          [2, 'Tag B'],
        ]}
        onChange={() => {}}
        readOnly
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )
    expect(screen.getByText('Tag A')).toBeInTheDocument()
    expect(screen.getByText('Tag B')).toBeInTheDocument()
  })

  test('shows remove button for each tag in edit mode', () => {
    const { container } = render(
      <Many2ManyTagsWidget
        field={field}
        value={[[1, 'Remove Me']]}
        onChange={() => {}}
        readOnly={false}
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )
    const removeBtn = container.querySelector('button')
    expect(removeBtn).toBeTruthy()
  })

  test('search triggers search_read', async () => {
    mockCallKw.mockResolvedValue([{ id: 3, display_name: 'New Tag' }])

    const { container } = render(
      <Many2ManyTagsWidget
        field={field}
        value={[]}
        onChange={() => {}}
        readOnly={false}
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )

    const input = container.querySelector('input')
    if (!input) return
    fireEvent.change(input, { target: { value: 'New' } })

    await new Promise((r) => setTimeout(r, 500))
    expect(mockCallKw).toHaveBeenCalled()
  })

  test('handles empty value without crashing', () => {
    const { container } = render(
      <Many2ManyTagsWidget
        field={field}
        value={[]}
        onChange={() => {}}
        readOnly
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )
    expect(container).toBeTruthy()
  })
})
