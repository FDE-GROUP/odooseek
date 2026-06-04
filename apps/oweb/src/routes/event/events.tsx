import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { EVENT_ACTION_XML_ID, EVENT_EVENT_MODEL, eventEventRecordPath } from '../../lib/event'

function EventEvents() {
  return (
    <ModuleRoute
      model={EVENT_EVENT_MODEL}
      actionXmlId={EVENT_ACTION_XML_ID.events}
      listPath="/event/events"
      recordPath={eventEventRecordPath}
    />
  )
}

export const Route = createFileRoute('/event/events')({
  component: EventEvents,
  beforeLoad: requireAuth,
})
