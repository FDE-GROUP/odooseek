import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Many2OneWidget } from '../widgets/relational'

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
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const field = { type: 'field' as const, name: 'partner_id' }

describe('Many2OneWidget domain filtering', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mockCallKw.mockReset()
  })

  test('passes meta.domain to web_search_read', async () => {
    mockCallKw.mockResolvedValue({ records: [] })

    const { container } = render(
      <Many2OneWidget
        field={field}
        value={false}
        onChange={() => {}}
        readOnly={false}
        meta={{ relation: 'res.partner', domain: [['is_company', '=', true]] }}
      />,
      { wrapper },
    )

    const input = container.querySelector('input')
    if (!input) return
    fireEvent.change(input, { target: { value: 'Acme' } })

    await new Promise((r) => setTimeout(r, 500))
    const searchCall = mockCallKw.mock.calls.find((c) => c[1] === 'web_search_read')
    expect(searchCall).toBeTruthy()
    expect(searchCall?.[3]).toHaveProperty('domain')
  })

  test('shows display name for [id, name] value in readOnly', () => {
    render(
      <Many2OneWidget
        field={field}
        value={[42, 'Acme Corp']}
        onChange={() => {}}
        readOnly
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  test('shows dash for false value in readOnly', () => {
    render(
      <Many2OneWidget
        field={field}
        value={false}
        onChange={() => {}}
        readOnly
        meta={{ relation: 'res.partner' }}
      />,
      { wrapper },
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
