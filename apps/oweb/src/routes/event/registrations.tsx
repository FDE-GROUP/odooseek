import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import {
  EVENT_ACTION_XML_ID,
  EVENT_REGISTRATION_MODEL,
  eventRegistrationRecordPath,
} from '../../lib/event'

function EventRegistrations() {
  return (
    <ModuleRoute
      model={EVENT_REGISTRATION_MODEL}
      actionXmlId={EVENT_ACTION_XML_ID.registrations}
      listPath="/event/registrations"
      recordPath={eventRegistrationRecordPath}
    />
  )
}

export const Route = createFileRoute('/event/registrations')({
  component: EventRegistrations,
  beforeLoad: requireAuth,
})
