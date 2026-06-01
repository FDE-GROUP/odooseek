import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { callKw, parseCalendarXml, searchRead } from '@odooseek/odoo-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addMonths, endOfMonth, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { useCallback, useMemo, useState } from 'react'
import { dateFnsLocalizer, Calendar as RBC_Calendar } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { useToast } from '../hooks/useToast'
import { getOdooIndexedColor } from '../lib/odoo-colors'
import { CalendarPopover } from './CalendarPopover'
import { CalendarQuickCreate } from './CalendarQuickCreate'
import { getEventAvatarUrl } from './calendar-event-avatar'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './calendar-theme.css'

const DnDCalendar =
  typeof withDragAndDrop === 'function'
    ? withDragAndDrop(RBC_Calendar)
    : // CJS interop: import may return { default: fn } instead of fn directly
      (
        withDragAndDrop as unknown as { default: (c: typeof RBC_Calendar) => typeof RBC_Calendar }
      ).default(RBC_Calendar)

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
  allDay: boolean
  record: Record<string, unknown>
  colorKey?: string
  attendeeStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  isOrganizer?: boolean
  isHighlighted?: boolean
  effectivePrivacy?: 'public' | 'private' | 'confidential'
  isRecurring?: boolean
  recurrenceName?: string
}

export type { CalendarEvent }

interface CalendarRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  onRecordClick?: (recordId: number) => void
}

export function OdooCalendarRenderer({
  model,
  arch,
  fields,
  domain = [],
  onRecordClick,
}: CalendarRendererProps) {
  const calView = useMemo(() => parseCalendarXml(arch), [arch])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>(calView.mode)
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const toast = useToast()
  const queryClient = useQueryClient()

  const fieldList = useMemo(() => {
    const required = [calView.dateStart, 'display_name', 'id']
    if (calView.dateStop) required.push(calView.dateStop)
    if (calView.dateDelay) required.push(calView.dateDelay)
    if (calView.allDay) required.push(calView.allDay)
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

  const queryKey = ['odoo', 'calendar', model, dateDomain, fieldList]

  const { data: records, isLoading } = useQuery({
    queryKey,
    queryFn: () => searchRead<Record<string, unknown>[]>(model, dateDomain, fieldList),
    staleTime: 30_000,
  })

  const events: CalendarEvent[] = useMemo(() => {
    if (!records) return []
    return records.map((rec) => {
      const start = rec[calView.dateStart] ? new Date(rec[calView.dateStart] as string) : new Date()
      const allDay = calView.allDay ? !!rec[calView.allDay] : false

      let end: Date
      if (allDay) {
        end =
          calView.dateStop && rec[calView.dateStop]
            ? new Date(rec[calView.dateStop] as string)
            : new Date(start.getTime() + 86400000)
      } else {
        end =
          calView.dateStop && rec[calView.dateStop]
            ? new Date(rec[calView.dateStop] as string)
            : calView.dateDelay && rec[calView.dateDelay]
              ? new Date(start.getTime() + (rec[calView.dateDelay] as number) * 3600000)
              : new Date(start.getTime() + 3600000)
      }

      let title = (rec.display_name as string) || (rec.name as string) || `#${rec.id}`

      const colorKey = calView.colorField
        ? String(
            Array.isArray(rec[calView.colorField])
              ? (rec[calView.colorField] as unknown[])[0]
              : rec[calView.colorField],
          )
        : undefined

      const attendeeStatus = rec.current_status as string as
        | CalendarEvent['attendeeStatus']
        | undefined
      const isHighlighted = !!rec.is_highlighted
      const effectivePrivacy = rec.effective_privacy as
        | CalendarEvent['effectivePrivacy']
        | undefined
      const isRecurring = !!rec.recurrency
      const recurrenceName = (rec.recurrence_display_name as string) || undefined

      if (effectivePrivacy === 'private' && !attendeeStatus) {
        title = 'Busy'
      }

      return {
        id: rec.id as number,
        title,
        start,
        end,
        allDay,
        record: rec,
        colorKey,
        attendeeStatus: attendeeStatus || undefined,
        isOrganizer: !!(rec.is_organizer_alone !== undefined),
        isHighlighted,
        effectivePrivacy,
        isRecurring,
        recurrenceName,
      }
    })
  }, [records, calView])

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const classNames = ['o-cal-event']
    if (event.isHighlighted) classNames.push('o-cal-event--highlighted')
    if (event.attendeeStatus === 'accepted') classNames.push('o-cal-event--accepted')
    else if (event.attendeeStatus === 'declined') classNames.push('o-cal-event--declined')
    else if (event.attendeeStatus === 'tentative') classNames.push('o-cal-event--tentative')
    else if (event.attendeeStatus === 'needsAction') classNames.push('o-cal-event--needs-action')

    const rawColor = event.colorKey ? getOdooIndexedColor(event.colorKey) : undefined
    const style: React.CSSProperties & { '--event-color'?: string } = {}
    if (rawColor) style['--event-color'] = rawColor

    return { className: classNames.join(' '), style }
  }, [])

  const EventContent = useCallback(
    ({ event, title }: { event: CalendarEvent; title?: string }) => {
      const avatarUrl = getEventAvatarUrl(event, calView, fields)
      const label = title ?? event.title
      return (
        <span className="o-cal-event-content flex min-w-0 items-center gap-1">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <span className="truncate">{label}</span>
        </span>
      )
    },
    [calView, fields],
  )

  const calendarComponents = useMemo(() => ({ event: EventContent }), [EventContent])

  // Hide time from event display when hide_time=1
  const hideTimeFormats = useMemo(
    () =>
      calView.hideTime
        ? {
            eventTimeRangeFormat: () => '',
            timeGutterFormat: (date: Date, culture?: string, localizer?: unknown) =>
              (localizer as { format: (d: Date, fmt: string, c?: string) => string })?.format?.(
                date,
                'ha',
                culture,
              ) ?? '',
          }
        : undefined,
    [calView.hideTime],
  )

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const handleSelectSlot = useCallback(
    async ({ start, end, action }: { start: Date; end: Date; action?: string }) => {
      if (!calView.quickCreate) return

      if (calView.quickCreateViewId) {
        setShowQuickCreate(true)
        return
      }

      if (calView.multiEdit && action === 'select' && start.toDateString() !== end.toDateString()) {
        const dayMs = 86400000
        const days = Math.round((end.getTime() - start.getTime()) / dayMs)
        const batchValues: Record<string, unknown>[] = []
        for (let i = 0; i < days; i++) {
          const d = new Date(start.getTime() + i * dayMs)
          const values: Record<string, unknown> = {
            [calView.dateStart]: format(d, 'yyyy-MM-dd HH:mm:ss'),
          }
          if (calView.dateStop) {
            const dEnd = new Date(d.getTime() + (end.getTime() - start.getTime()) / days)
            values[calView.dateStop] = format(dEnd, 'yyyy-MM-dd HH:mm:ss')
          }
          batchValues.push(values)
        }
        try {
          for (const vals of batchValues) {
            await callKw(model, 'create', [vals])
          }
          invalidate()
          toast.success(`${batchValues.length} events created`)
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to create events')
        }
        return
      }

      const values: Record<string, unknown> = {
        [calView.dateStart]: format(start, 'yyyy-MM-dd HH:mm:ss'),
      }
      if (calView.dateStop) {
        values[calView.dateStop] = format(end, 'yyyy-MM-dd HH:mm:ss')
      }
      try {
        await callKw(model, 'create', [values])
        invalidate()
        toast.success('Event created')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create event')
      }
    },
    [calView, model, invalidate, toast],
  )

  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      const values: Record<string, unknown> = {
        [calView.dateStart]: format(start, 'yyyy-MM-dd HH:mm:ss'),
      }
      if (calView.dateStop) {
        values[calView.dateStop] = format(end, 'yyyy-MM-dd HH:mm:ss')
      }
      try {
        await callKw(model, 'write', [[event.id], values])
        invalidate()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to move event')
      }
    },
    [calView, model, invalidate, toast],
  )

  const handleEventResize = useCallback(
    async ({ event, end }: { event: CalendarEvent; end: Date }) => {
      if (!calView.dateStop) return
      try {
        await callKw(model, 'write', [
          [event.id],
          {
            [calView.dateStop]: format(end, 'yyyy-MM-dd HH:mm:ss'),
          },
        ])
        invalidate()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to resize event')
      }
    },
    [calView, model, invalidate, toast],
  )

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (calView.eventOpenPopup) {
        setPopoverEvent(event)
      } else {
        onRecordClick?.(event.id)
      }
    },
    [calView.eventOpenPopup, onRecordClick],
  )

  const handlePopoverClose = useCallback(() => {
    setPopoverEvent(null)
  }, [])

  const handlePopoverEdit = useCallback(
    (recordId: number) => {
      setPopoverEvent(null)
      onRecordClick?.(recordId)
    },
    [onRecordClick],
  )

  const handlePopoverDelete = useCallback(
    (_recordId: number) => {
      setPopoverEvent(null)
      invalidate()
    },
    [invalidate],
  )

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[28rem] flex-1 items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div
      className={`odooseek-calendar flex flex-col p-4 ${
        view === 'month'
          ? 'odooseek-calendar--month'
          : 'odooseek-calendar--time min-h-0 flex-1 overflow-hidden'
      }`}
    >
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        titleAccessor="title"
        view={view}
        views={['month', 'week', 'day']}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={setView as (view: string) => void}
        dayMaxEventRows={calView.eventLimit ?? 5}
        formats={hideTimeFormats}
        selectable
        resizable={!!calView.dateStop}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventPropGetter}
        components={calendarComponents}
        popup
        style={{
          height: view === 'month' ? 'auto' : '100%',
          minHeight: view === 'month' ? '100%' : undefined,
        }}
      />
      {popoverEvent && (
        <CalendarPopover
          event={popoverEvent}
          model={model}
          fields={fields}
          dateStartField={calView.dateStart}
          dateStopField={calView.dateStop}
          allDayField={calView.allDay}
          archFields={calView.fields}
          fieldAttrs={calView.fieldAttrs}
          onClose={handlePopoverClose}
          onEdit={handlePopoverEdit}
          onDelete={handlePopoverDelete}
          onInvalidate={invalidate}
        />
      )}
      {showQuickCreate && calView.quickCreateViewId && (
        <CalendarQuickCreate
          model={model}
          viewId={calView.quickCreateViewId}
          onClose={() => setShowQuickCreate(false)}
          onSaved={() => {
            setShowQuickCreate(false)
            invalidate()
          }}
        />
      )}
    </div>
  )
}
