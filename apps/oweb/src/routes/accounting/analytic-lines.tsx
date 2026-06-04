import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AnalyticLines() {
  return <ModuleRoute model="account.analytic.line" listPath="/accounting/analytic-lines" />
}

export const Route = createFileRoute('/accounting/analytic-lines')({
  component: AnalyticLines,
  beforeLoad: requireAuth,
})
