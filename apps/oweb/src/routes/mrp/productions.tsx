import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_ACTION_XML_ID, MRP_PRODUCTION_MODEL, mrpProductionRecordPath } from '../../lib/mrp'

function MrpProductions() {
  return (
    <ModuleRoute
      model={MRP_PRODUCTION_MODEL}
      actionXmlId={MRP_ACTION_XML_ID.productions}
      listPath="/mrp/productions"
      recordPath={mrpProductionRecordPath}
    />
  )
}

export const Route = createFileRoute('/mrp/productions')({
  component: MrpProductions,
  beforeLoad: requireAuth,
})
