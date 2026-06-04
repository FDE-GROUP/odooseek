import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID } from '../../lib/mrp'

function MrpWorkOrders() {
  return (
    <ModuleRoute
      model="mrp.workorder"
      actionXmlId={MRP_ACTION_XML_ID.workOrders}
      listPath="/mrp/work-orders"
      recordPath={(id) => `/mrp/work-order/${id}`}
    />
  )
}

export const Route = createFileRoute('/mrp/work-orders')({
  component: MrpWorkOrders,
  beforeLoad: requireAuth,
})
