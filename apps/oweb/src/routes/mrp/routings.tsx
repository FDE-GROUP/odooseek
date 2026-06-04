import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID } from '../../lib/mrp'

function MrpRoutings() {
  return (
    <ModuleRoute
      model="mrp.routing.workcenter"
      actionXmlId={MRP_ACTION_XML_ID.routings}
      listPath="/mrp/routings"
      recordPath={(id) => `/mrp/routing/${id}`}
    />
  )
}

export const Route = createFileRoute('/mrp/routings')({
  component: MrpRoutings,
  beforeLoad: requireAuth,
})
