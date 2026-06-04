import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID } from '../../lib/mrp'

function MrpBoms() {
  return (
    <ModuleRoute
      model="mrp.bom"
      actionXmlId={MRP_ACTION_XML_ID.boms}
      listPath="/mrp/boms"
      recordPath={(id) => `/mrp/bom/${id}`}
    />
  )
}

export const Route = createFileRoute('/mrp/boms')({
  component: MrpBoms,
  beforeLoad: requireAuth,
})
