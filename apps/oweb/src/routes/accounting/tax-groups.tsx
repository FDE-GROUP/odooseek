import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function TaxGroups() {
  return <ModuleRoute model="account.tax.group" listPath="/accounting/tax-groups" />
}

export const Route = createFileRoute('/accounting/tax-groups')({
  component: TaxGroups,
  beforeLoad: requireAuth,
})
