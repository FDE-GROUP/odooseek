import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { OdooCalendarRenderer } from '../OdooCalendarRenderer'

const mockSearchRead = vi.fn()
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      searchRead: (...args: unknown[]) => mockSearchRead(...args),
      callKw: vi.fn(),
    },
  }
})

vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }),
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

describe('OdooCalendarRenderer Phase 24', () => {
  const calArchPhase24 = `<calendar string="Meetings" date_start="start" date_stop="stop" color="partner_id" event_open_popup="1">
    <field name="name"/>
    <field name="partner_id"/>
  </calendar>`

  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  test('privacy: private event shows "Busy" for non-attendee', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 1,
        display_name: 'Secret Meeting',
        start: '2026-06-01 10:00:00',
        stop: '2026-06-01 11:00:00',
        effective_privacy: 'private',
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calArchPhase24}
        fields={fields}
        onRecordClick={vi.fn()}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Busy')).toBeInTheDocument()
    })
  })

  test('privacy: non-private event shows original title', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 2,
        display_name: 'Public Standup',
        start: '2026-06-01 09:00:00',
        stop: '2026-06-01 09:30:00',
        effective_privacy: 'public',
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calArchPhase24}
        fields={fields}
        onRecordClick={vi.fn()}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Public Standup')).toBeInTheDocument()
    })
  })

  test('RSVP: declined event renders with title visible', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 3,
        display_name: 'Team Sync',
        start: '2026-06-01 14:00:00',
        stop: '2026-06-01 15:00:00',
        current_status: 'declined',
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calArchPhase24}
        fields={fields}
        onRecordClick={vi.fn()}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Team Sync')).toBeInTheDocument()
    })
  })

  test('RSVP: accepted event shows normally', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 4,
        display_name: 'Accepted Meeting',
        start: '2026-06-01 16:00:00',
        stop: '2026-06-01 17:00:00',
        current_status: 'accepted',
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calArchPhase24}
        fields={fields}
        onRecordClick={vi.fn()}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Accepted Meeting')).toBeInTheDocument()
    })
  })

  test('recurrence: recurring event flag set', async () => {
    mockSearchRead.mockResolvedValueOnce([
      {
        id: 5,
        display_name: 'Weekly Standup',
        start: '2026-06-01 09:00:00',
        stop: '2026-06-01 09:30:00',
        recurrency: true,
        recurrence_display_name: 'Weekly standup (every Monday)',
      },
    ])

    render(
      <OdooCalendarRenderer
        model="calendar.event"
        arch={calArchPhase24}
        fields={fields}
        onRecordClick={vi.fn()}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Weekly Standup')).toBeInTheDocument()
    })
  })
})
