import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AnalyticPlans() {
  return <ModuleRoute model="account.analytic.plan" listPath="/accounting/analytic-plans" />
}

export const Route = createFileRoute('/accounting/analytic-plans')({
  component: AnalyticPlans,
  beforeLoad: requireAuth,
})
