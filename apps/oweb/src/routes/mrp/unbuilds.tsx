import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID } from '../../lib/mrp'

function MrpUnbuilds() {
  return (
    <ModuleRoute
      model="mrp.unbuild"
      actionXmlId={MRP_ACTION_XML_ID.unbuilds}
      listPath="/mrp/unbuilds"
      recordPath={(id) => `/mrp/unbuild/${id}`}
    />
  )
}

export const Route = createFileRoute('/mrp/unbuilds')({
  component: MrpUnbuilds,
  beforeLoad: requireAuth,
})
