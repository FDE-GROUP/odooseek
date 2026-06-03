import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Chatter } from '../Chatter'

const mockSearchRead = vi.fn()
const mockCallKw = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      searchRead: (...args: unknown[]) => mockSearchRead(...args),
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

describe('Chatter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('renders empty state when no messages', async () => {
    mockSearchRead
      .mockResolvedValueOnce([]) // messages
      .mockResolvedValueOnce([]) // followers

    render(<Chatter model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument()
    })
  })

  test('renders message list', async () => {
    mockSearchRead
      .mockResolvedValueOnce([
        {
          id: 1,
          body: '<p>Hello</p>',
          author_id: [1, 'Admin'],
          date: '2026-05-30 10:00:00',
          message_type: 'comment',
          subtype_id: [1, 'Comment'],
          is_note: false,
        },
        {
          id: 2,
          body: '<p>Note text</p>',
          author_id: [2, 'Bob'],
          date: '2026-05-29 09:00:00',
          message_type: 'comment',
          subtype_id: [2, 'Note'],
          is_note: true,
        },
      ])
      .mockResolvedValueOnce([])

    render(<Chatter model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Note')).toBeInTheDocument()
    })
  })

  test('shows Send Message and Log Note buttons', async () => {
    mockSearchRead.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    render(<Chatter model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeInTheDocument()
      expect(screen.getByText('Log Note')).toBeInTheDocument()
    })
  })

  test('shows follower count', async () => {
    mockSearchRead.mockResolvedValueOnce([]).mockResolvedValueOnce([
      { id: 1, partner_id: [1, 'Admin'], channel_id: false },
      { id: 2, partner_id: [2, 'Bob'], channel_id: false },
    ])

    render(<Chatter model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('2 followers')).toBeInTheDocument()
    })
  })

  test('does not render when recordId is undefined', () => {
    const { container } = render(<Chatter model="res.partner" recordId={undefined} />, { wrapper })
    expect(container.innerHTML).toBe('')
  })
})
