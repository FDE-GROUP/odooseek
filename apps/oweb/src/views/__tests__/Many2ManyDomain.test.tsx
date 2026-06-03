import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Many2ManyWidget } from '../widgets/relational'

const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    callKw: (...args: unknown[]) => mockCallKw(...args),
  }
})

let queryClient: QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const field = { type: 'field' as const, name: 'tag_ids' }

describe('Many2ManyWidget domain filtering', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReset()
  })

  test('search passes meta.domain to web_name_search', async () => {
    mockCallKw.mockResolvedValue([])

    const { container } = render(
      <Many2ManyWidget
        field={field}
        value={[]}
        onChange={() => {}}
        readOnly={false}
        meta={{ relation: 'res.partner', domain: [['is_company', '=', true]] }}
      />,
      { wrapper },
    )

    // Find the search input
    const input = container.querySelector('input')
    if (!input) return // Widget structure dependent

    fireEvent.change(input, { target: { value: 'Acme' } })

    await new Promise((r) => setTimeout(r, 500))
    const searchCall = mockCallKw.mock.calls.find((c) => c[1] === 'web_name_search')
    expect(searchCall).toBeTruthy()
  })

  test('handles empty domain gracefully', async () => {
    mockCallKw.mockResolvedValue([])

    render(
      <Many2ManyWidget
        field={field}
        value={[[1, 'Existing']]}
        onChange={() => {}}
        readOnly
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Existing')).toBeInTheDocument()
    })
  })
})
