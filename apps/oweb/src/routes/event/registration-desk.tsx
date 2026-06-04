import { callKw, searchRead } from '@odooseek/odoo-client'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from '@/lib/lucide-icons'
import { CameraBarcodeScanner } from '../../components/CameraBarcodeScanner'
import { requireAuth } from '../../lib/auth'

interface AttendeeResult {
  id?: number
  name?: string
  partner_id?: number
  slot_name?: string | false
  ticket_name?: string | false
  event_id?: number
  event_display_name?: string
  registration_answers?: string[]
  company_name?: string
  badge_format?: string
  date_closed_formatted?: string | false
  is_date_closed_today?: boolean
  status?: string
  error?: string
}

interface EventChoice {
  id: number
  display_name: string
  date_begin?: string
  date_end?: string
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  confirmed_registration: {
    label: 'Attended',
    color: 'text-green-800 border-green-300',
    bg: 'bg-green-100 dark:bg-green-950',
    icon: '✅',
  },
  already_registered: {
    label: 'Already Attended',
    color: 'text-amber-800 border-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-950',
    icon: '⚠️',
  },
  invalid_ticket: {
    label: 'Invalid Ticket',
    color: 'text-red-800 border-red-300',
    bg: 'bg-red-100 dark:bg-red-950',
    icon: '❌',
  },
  canceled_registration: {
    label: 'Cancelled',
    color: 'text-gray-600 border-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: '🚫',
  },
  unconfirmed_registration: {
    label: 'Unconfirmed',
    color: 'text-amber-800 border-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-950',
    icon: '📝',
  },
  not_ongoing_event: {
    label: 'Event Ended',
    color: 'text-gray-600 border-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: '⏰',
  },
  need_manual_confirmation: {
    label: 'Different Event',
    color: 'text-blue-800 border-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-950',
    icon: '🤔',
  },
}

function RegistrationDesk() {
  const { event_id } = Route.useSearch()
  const initialEventId = typeof event_id === 'number' ? event_id : Number(event_id) || null

  const inputRef = useRef<HTMLInputElement>(null)
  const [barcode, setBarcode] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<number | null>(initialEventId)
  const [selectedEventName, setSelectedEventName] = useState<string>('')
  const [events, setEvents] = useState<EventChoice[]>([])
  const [eventSearch, setEventSearch] = useState('')
  const [showEventPicker, setShowEventPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AttendeeResult | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [mode, setMode] = useState<'barcode' | 'search'>('barcode')
  const [nameSearch, setNameSearch] = useState('')
  const [nameResults, setNameResults] = useState<AttendeeResult[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  const isMultiEvent = !selectedEventId

  useEffect(() => {
    if (initialEventId) {
      searchRead<EventChoice>(
        'event.event',
        [['id', '=', initialEventId]],
        ['display_name', 'name', 'date_begin', 'date_end'],
        1,
      ).then((results) => {
        if (results?.[0]?.display_name) {
          setSelectedEventName(results[0].display_name)
        }
      })
    }
  }, [initialEventId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [selectedEventId, mode])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEventPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (result) {
          setResult(null)
          inputRef.current?.focus()
        } else if (barcode) {
          setBarcode('')
        }
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [result, barcode])

  const searchEvents = useCallback(async (query: string) => {
    if (query.length < 2) {
      setEvents([])
      return
    }
    const results = await searchRead<EventChoice>(
      'event.event',
      [['name', 'ilike', query]],
      ['name', 'display_name', 'date_begin', 'date_end'],
      10,
      'id desc',
    )
    setEvents(results ?? [])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchEvents(eventSearch), 300)
    return () => clearTimeout(timer)
  }, [eventSearch, searchEvents])

  const selectEvent = useCallback((id: number, name: string) => {
    setSelectedEventId(id)
    setSelectedEventName(name)
    setShowEventPicker(false)
    setEventSearch('')
    setResult(null)
  }, [])

  const performScan = useCallback(
    async (code: string) => {
      if (!code.trim()) return
      setLoading(true)
      setResult(null)

      try {
        const res = await callKw<AttendeeResult>('event.registration', 'register_attendee', [
          code.trim(),
          selectedEventId || false,
        ])

        setResult(res)
        setScanCount((c) => c + 1)
        setBarcode('')

        if (res.event_id && !selectedEventId) {
          setSelectedEventId(res.event_id)
          setSelectedEventName(res.event_display_name || '')
        }
      } catch (err) {
        setResult({
          error: err instanceof Error ? err.message : 'Unknown error',
          status: 'invalid_ticket',
        })
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [selectedEventId],
  )

  const handleScan = useCallback(async () => {
    await performScan(barcode)
  }, [barcode, performScan])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleScan()
      }
    },
    [handleScan],
  )

  const dismissResult = useCallback(() => {
    setResult(null)
    inputRef.current?.focus()
  }, [])

  const searchAttendees = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setNameResults([])
        return
      }
      const domain: Array<Array<string | number | boolean | Array<string | number>>> = [
        '|',
        ['name', 'ilike', query],
        ['email', 'ilike', query],
      ]
      if (selectedEventId) {
        domain.unshift(['event_id', '=', selectedEventId])
      }
      const results = await searchRead<Record<string, unknown>>(
        'event.registration',
        domain as string[][],
        [
          'id',
          'name',
          'email',
          'company_name',
          'event_id',
          'state',
          'event_ticket_id',
          'event_slot_id',
        ],
        20,
      )
      setNameResults(
        (results ?? []).map(
          (r): AttendeeResult => ({
            id: r.id as number,
            name: r.name as string,
            company_name: r.company_name as string,
            event_id: r.event_id as number,
            ticket_name: Array.isArray(r.event_ticket_id) ? (r.event_ticket_id[1] as string) : '',
            slot_name: Array.isArray(r.event_slot_id) ? (r.event_slot_id[1] as string) : '',
            status: r.state as string,
          }),
        ),
      )
    },
    [selectedEventId],
  )

  useEffect(() => {
    const timer = setTimeout(() => searchAttendees(nameSearch), 300)
    return () => clearTimeout(timer)
  }, [nameSearch, searchAttendees])

  const handleMarkAttended = useCallback(
    async (id?: number) => {
      if (!id) return
      setLoading(true)
      try {
        await callKw('event.registration', 'register_attendee', [
          String(id),
          selectedEventId || false,
        ])
        setScanCount((c) => c + 1)
        setNameResults((prev) => prev.filter((r) => r.id !== id))
        setResult({ name: 'Marked as attended', status: 'confirmed_registration' })
      } catch (err) {
        setResult({
          error: err instanceof Error ? err.message : 'Unknown error',
          status: 'invalid_ticket',
        })
      } finally {
        setLoading(false)
      }
    },
    [selectedEventId],
  )

  const resultBg = useMemo(
    () =>
      result?.status
        ? (STATUS_DISPLAY[result.status]?.bg ?? 'bg-white dark:bg-gray-800')
        : 'bg-white dark:bg-gray-800',
    [result?.status],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="text-left">
          <h1 className="text-2xl font-bold">
            Registration Desk
            {selectedEventName && (
              <span className="ml-3 text-lg font-normal text-muted-foreground">
                — {selectedEventName}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isMultiEvent ? 'Multi-event mode — scan from any event' : 'Single event mode'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {scanCount > 0 && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              {scanCount} scanned
            </span>
          )}
          <div className="flex rounded-lg border dark:border-gray-600">
            <button
              type="button"
              className={`rounded-l-lg px-3 py-1.5 text-sm font-medium ${mode === 'barcode' ? 'bg-accent text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMode('barcode')}
            >
              Barcode
            </button>
            <button
              type="button"
              className={`rounded-r-lg px-3 py-1.5 text-sm font-medium ${mode === 'search' ? 'bg-accent text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMode('search')}
            >
              Search
            </button>
          </div>
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              onClick={() => setShowEventPicker(!showEventPicker)}
            >
              {selectedEventId ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {selectedEventName || `Event #${selectedEventId}`}
                </>
              ) : (
                <>
                  <Search size={16} />
                  Select Event
                </>
              )}
            </button>
            {showEventPicker && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800 dark:border-gray-600">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    autoFocus
                  />
                  {!isMultiEvent && (
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setSelectedEventId(null)
                        setSelectedEventName('')
                        setShowEventPicker(false)
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <ul className="max-h-48 overflow-auto rounded-md">
                  {events.length === 0 && eventSearch.length >= 2 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">No events found</li>
                  )}
                  {events.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => selectEvent(ev.id, ev.display_name)}
                      >
                        <div className="font-medium">{ev.display_name}</div>
                        {ev.date_begin && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(ev.date_begin).toLocaleDateString()}
                            {ev.date_end ? ` — ${new Date(ev.date_end).toLocaleDateString()}` : ''}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center py-12">
        <div className="w-full max-w-md space-y-4 px-6">
          {mode === 'barcode' ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <label htmlFor="barcode-input" className="mb-3 block text-sm font-medium">
                Scan Barcode
              </label>
              <input
                ref={inputRef}
                id="barcode-input"
                type="text"
                className="w-full rounded-lg border px-4 py-3 text-center text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600"
                placeholder={
                  selectedEventId ? 'Scan or type barcode...' : 'Scan barcode (any event)...'
                }
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoFocus
                autoComplete="off"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  onClick={handleScan}
                  disabled={loading || !barcode.trim()}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Checking...
                    </span>
                  ) : (
                    'Verify ⏎'
                  )}
                </button>
                {barcode && (
                  <button
                    type="button"
                    className="rounded-lg border px-4 py-2.5 text-sm text-muted-foreground hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={() => {
                      setBarcode('')
                      setResult(null)
                      inputRef.current?.focus()
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-4 border-t pt-4 dark:border-gray-700">
                <CameraBarcodeScanner
                  onScan={(code) => {
                    setBarcode(code)
                    performScan(code)
                  }}
                  onError={() => {
                    /* silent — fallback to manual input */
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <label htmlFor="name-search-input" className="mb-3 block text-sm font-medium">
                Search Attendees
              </label>
              <input
                ref={inputRef}
                id="name-search-input"
                type="text"
                className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600"
                placeholder="Search by name or email..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                autoFocus
                autoComplete="off"
              />
              {nameResults.length > 0 && (
                <ul className="mt-3 max-h-64 overflow-auto rounded-md border dark:border-gray-700">
                  {nameResults.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between border-b px-4 py-2.5 last:border-b-0 dark:border-gray-700"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{r.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {[r.company_name, r.ticket_name, r.slot_name].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-3 shrink-0 rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
                        onClick={() => handleMarkAttended(r.id)}
                        disabled={loading}
                      >
                        ✓ Attend
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result && (
            <div
              className={`rounded-xl border p-5 shadow-sm ${result.status && STATUS_DISPLAY[result.status] ? `${resultBg} border-l-4 ${STATUS_DISPLAY[result.status].color}` : 'border-red-200 bg-red-50 dark:bg-red-950'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Scan Result
                </h3>
                <button
                  type="button"
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={dismissResult}
                >
                  ×
                </button>
              </div>

              {result.status && STATUS_DISPLAY[result.status] && (
                <div
                  className={`mb-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${STATUS_DISPLAY[result.status].bg} ${STATUS_DISPLAY[result.status].color}`}
                >
                  <span>{STATUS_DISPLAY[result.status].icon}</span>
                  {STATUS_DISPLAY[result.status].label}
                </div>
              )}

              {result.error && (
                <p className="mb-2 text-sm text-red-600 dark:text-red-400">{result.error}</p>
              )}

              {result.name && (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {result.company_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company</span>
                      <span>{result.company_name}</span>
                    </div>
                  )}
                  {result.ticket_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket</span>
                      <span>{result.ticket_name}</span>
                    </div>
                  )}
                  {result.slot_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slot</span>
                      <span>{result.slot_name}</span>
                    </div>
                  )}
                  {result.event_display_name && !selectedEventId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event</span>
                      <span>{result.event_display_name}</span>
                    </div>
                  )}
                  {result.registration_answers && result.registration_answers.length > 0 && (
                    <div className="mt-2 border-t pt-2 dark:border-gray-600">
                      <span className="text-xs text-muted-foreground">Answers</span>
                      <ul className="mt-1 space-y-0.5 text-xs">
                        {result.registration_answers.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.date_closed_formatted && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attended at</span>
                      <span>{result.date_closed_formatted}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />{' '}
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/event/registration-desk')({
  component: RegistrationDesk,
  beforeLoad: requireAuth,
  validateSearch: (search: Record<string, unknown>) => ({
    event_id:
      typeof search.event_id === 'number' ? search.event_id : Number(search.event_id) || undefined,
  }),
})
