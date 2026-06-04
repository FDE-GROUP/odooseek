import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID } from '../../lib/mrp'

function MrpWorkCenters() {
  return (
    <ModuleRoute
      model="mrp.workcenter"
      actionXmlId={MRP_ACTION_XML_ID.workCenters}
      listPath="/mrp/work-centers"
      recordPath={(id) => `/mrp/work-center/${id}`}
    />
  )
}

export const Route = createFileRoute('/mrp/work-centers')({
  component: MrpWorkCenters,
  beforeLoad: requireAuth,
})
