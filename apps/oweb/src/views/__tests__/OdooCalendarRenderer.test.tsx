import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { OdooFieldMeta } from '../../lib/odoo-types'
import { OdooCalendarRenderer } from '../OdooCalendarRenderer'

const mockSearchRead = vi.fn()
vi.mock('../../lib/api', () => ({
  searchRead: (...args: unknown[]) => mockSearchRead(...args),
}))

// Mock react-big-calendar to avoid CSS loading issues in tests
vi.mock('react-big-calendar', () => {
  return {
    Calendar: ({
      events,
      onSelectEvent,
    }: {
      events: Array<{ id: number; title: string }>
      onSelectEvent?: (e: { id: number }) => void
    }) => (
      <div data-testid="calendar">
        {events.map((e) => (
          <button
            key={e.id}
            type="button"
            data-testid={`event-${e.id}`}
            onClick={() => onSelectEvent?.(e as { id: number })}
          >
            {e.title}
          </button>
        ))}
      </div>
    ),
    dateFnsLocalizer: () => ({}),
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

const calendarArch = `<calendar string="Meetings" date_start="start" date_stop="stop" color="partner_id">
  <field name="name"/>
  <field name="partner_id"/>
</calendar>`

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
  start: {
    name: 'start',
    type: 'datetime',
    string: 'Start',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  stop: {
    name: 'stop',
    type: 'datetime',
    string: 'Stop',
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
    store: true,
    searchable: true,
    sortable: true,
    relation: 'res.partner',
  },
}

describe('OdooCalendarRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('renders calendar container with events', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 1,
        display_name: 'Team Meeting',
        start: '2026-05-30 10:00:00',
        stop: '2026-05-30 11:00:00',
        partner_id: [1, 'Alice'],
      },
    ])

    render(<OdooCalendarRenderer model="calendar.event" arch={calendarArch} fields={fields} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
      expect(screen.getByText('Team Meeting')).toBeInTheDocument()
    })
  })

  test('clicking event triggers onRecordClick', async () => {
    const onRecordClick = vi.fn()
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 42,
        display_name: 'Sync',
        start: '2026-05-30 09:00:00',
        stop: '2026-05-30 09:30:00',
        partner_id: false,
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calendarArch}
        fields={fields}
        onRecordClick={onRecordClick}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Sync')).toBeInTheDocument()
    })

    screen.getByText('Sync').click()
    expect(onRecordClick).toHaveBeenCalledWith(42)
  })

  test('shows loading spinner', () => {
    mockSearchRead.mockReturnValue(new Promise(() => {}))

    render(<OdooCalendarRenderer model="calendar.event" arch={calendarArch} fields={fields} />, {
      wrapper,
    })

    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })
})
