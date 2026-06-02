import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_WORK_LOCATION_MODEL } from '../../lib/hr'

function HrWorkLocations() {
  return (
    <ModuleRoute
      model={HR_WORK_LOCATION_MODEL}
      actionXmlId={HR_ACTION_XML_ID.workLocations}
      listPath="/hr/work-locations"
    />
  )
}

export const Route = createFileRoute('/hr/work-locations')({
  component: HrWorkLocations,
  beforeLoad: requireAuth,
})
