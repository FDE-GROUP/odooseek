import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ActivityPanel } from '../ActivityPanel'

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

describe('ActivityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('renders empty state when no activities', async () => {
    mockSearchRead.mockResolvedValueOnce([])

    render(<ActivityPanel model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('No activities scheduled')).toBeInTheDocument()
    })
  })

  test('renders activities grouped by state', async () => {
    const today = new Date().toISOString().slice(0, 10)
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 1,
        activity_type_id: [1, 'Email'],
        summary: 'Follow up',
        note: '',
        date_deadline: '2020-01-01',
        state: 'overdue',
        user_id: [1, 'Admin'],
        res_model: 'res.partner',
        res_id: 1,
      },
      {
        id: 2,
        activity_type_id: [2, 'Call'],
        summary: 'Call back',
        note: '',
        date_deadline: today,
        state: 'today',
        user_id: [1, 'Admin'],
        res_model: 'res.partner',
        res_id: 1,
      },
      {
        id: 3,
        activity_type_id: [3, 'Meeting'],
        summary: 'Meet',
        note: '',
        date_deadline: '2030-01-01',
        state: 'planned',
        user_id: [1, 'Admin'],
        res_model: 'res.partner',
        res_id: 1,
      },
    ])

    render(<ActivityPanel model="res.partner" recordId={1} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Follow up')).toBeInTheDocument()
      expect(screen.getByText('Call back')).toBeInTheDocument()
      expect(screen.getByText('Meet')).toBeInTheDocument()
    })

    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
    expect(screen.getByText(/Today/)).toBeInTheDocument()
    expect(screen.getByText(/Planned/)).toBeInTheDocument()
  })

  test('Schedule button shows form', async () => {
    mockSearchRead.mockResolvedValueOnce([])

    render(<ActivityPanel model="res.partner" recordId={1} />, { wrapper })

    // Wait for loading to finish and Schedule button to appear
    await waitFor(() => {
      expect(screen.getByText('No activities scheduled')).toBeInTheDocument()
    })

    const scheduleBtn = screen.getByText('Schedule')
    scheduleBtn.click()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Activity summary')).toBeInTheDocument()
    })
  })

  test('does not render when recordId is undefined', () => {
    const { container } = render(<ActivityPanel model="res.partner" recordId={undefined} />, {
      wrapper,
    })
    expect(container.innerHTML).toBe('')
  })
})
