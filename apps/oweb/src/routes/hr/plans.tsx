import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MAIL_ACTIVITY_PLAN_MODEL } from '../../lib/hr'

function HrActivityPlans() {
  return <ModuleRoute model={MAIL_ACTIVITY_PLAN_MODEL} defaultView="list" listPath="/hr/plans" />
}

export const Route = createFileRoute('/hr/plans')({
  component: HrActivityPlans,
  beforeLoad: requireAuth,
})
