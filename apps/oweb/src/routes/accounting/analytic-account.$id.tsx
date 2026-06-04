import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AnalyticAccountForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.analytic.account" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/analytic-account/$id')({
  component: AnalyticAccountForm,
  beforeLoad: requireAuth,
})
