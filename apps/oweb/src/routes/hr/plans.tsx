import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, MAIL_ACTIVITY_PLAN_MODEL } from '../../lib/hr'

function HrActivityPlans() {
  return (
    <ModuleRoute
      model={MAIL_ACTIVITY_PLAN_MODEL}
      actionXmlId={HR_ACTION_XML_ID.plans}
      listPath="/hr/plans"
    />
  )
}

export const Route = createFileRoute('/hr/plans')({
  component: HrActivityPlans,
  beforeLoad: requireAuth,
})
