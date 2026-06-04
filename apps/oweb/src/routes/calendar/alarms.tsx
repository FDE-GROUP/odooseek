import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CalendarAlarms() {
  return (
    <ModuleRoute
      model="calendar.alarm"
      actionXmlId="calendar.action_calendar_alarm"
      listPath="/calendar/alarms"
    />
  )
}

export const Route = createFileRoute('/calendar/alarms')({
  component: CalendarAlarms,
  beforeLoad: requireAuth,
})
