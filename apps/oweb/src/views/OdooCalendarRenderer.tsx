import { useQuery } from '@tanstack/react-query'
import { addMonths, endOfMonth, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { useCallback, useMemo, useState } from 'react'
import { dateFnsLocalizer, Calendar as RBC_Calendar } from 'react-big-calendar'
import { searchRead } from '../lib/api'
import type { OdooFieldMeta } from '../lib/odoo-types'
import { parseCalendarXml } from '../lib/xml-parser'

import 'react-big-calendar/lib/css/react-big-calendar.css'

interface CalendarRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  onRecordClick?: (recordId: number) => void
}

const PALETTE = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#4f46e5',
  '#c026d3',
]

const localizer = dateFnsLocalizer({
  format: format as unknown as Record<string, unknown>,
  parse: parse as unknown as Record<string, unknown>,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
})

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  record: Record<string, unknown>
  colorKey?: string
}

export function OdooCalendarRenderer({
  model,
  arch,
  fields: _fields,
  domain = [],
  onRecordClick,
}: CalendarRendererProps) {
  const calView = useMemo(() => parseCalendarXml(arch), [arch])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>(calView.mode)

  const fieldList = useMemo(() => {
    const required = [calView.dateStart, 'display_name', 'id']
    if (calView.dateStop) required.push(calView.dateStop)
    if (calView.colorField) required.push(calView.colorField)
    for (const f of calView.fields) {
      if (!required.includes(f)) required.push(f)
    }
    return required
  }, [calView])

  const rangeStart = startOfMonth(currentDate)
  const rangeEnd = endOfMonth(addMonths(currentDate, 1))

  const dateDomain = useMemo(
    () => [
      ...domain,
      [calView.dateStart, '>=', format(rangeStart, 'yyyy-MM-dd HH:mm:ss')],
      [calView.dateStart, '<=', format(rangeEnd, 'yyyy-MM-dd HH:mm:ss')],
    ],
    [domain, calView.dateStart, rangeStart, rangeEnd],
  )

  const { data: records, isLoading } = useQuery({
    queryKey: ['odoo', 'calendar', model, dateDomain, fieldList],
    queryFn: () => searchRead<Record<string, unknown>[]>(model, dateDomain, fieldList),
    staleTime: 30_000,
  })

  const events: CalendarEvent[] = useMemo(() => {
    if (!records) return []
    return records.map((rec) => {
      const start = rec[calView.dateStart] ? new Date(rec[calView.dateStart] as string) : new Date()
      const end =
        calView.dateStop && rec[calView.dateStop]
          ? new Date(rec[calView.dateStop] as string)
          : new Date(start.getTime() + 3600_000)
      const title = (rec.display_name as string) || (rec.name as string) || `#${rec.id}`
      const colorKey = calView.colorField
        ? String(
            Array.isArray(rec[calView.colorField])
              ? (rec[calView.colorField] as unknown[])[0]
              : rec[calView.colorField],
          )
        : undefined
      return { id: rec.id as number, title, start, end, record: rec, colorKey }
    })
  }, [records, calView])

  const colorMap = useMemo(() => {
    const keys = new Set(events.map((e) => e.colorKey).filter(Boolean))
    const map = new Map<string, string>()
    let i = 0
    for (const k of keys) {
      map.set(k as string, PALETTE[i % PALETTE.length])
      i++
    }
    return map
  }, [events])

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: event.colorKey ? colorMap.get(event.colorKey) : '#3b82f6',
        border: 'none',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 4px',
      },
    }),
    [colorMap],
  )

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onRecordClick?.(event.id)
    },
    [onRecordClick],
  )

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4" style={{ height: 'calc(100vh - 180px)' }}>
      <RBC_Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={view}
        views={['month', 'week', 'day']}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={setView as (view: string) => void}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        popup
        style={{ height: '100%' }}
      />
    </div>
  )
}
