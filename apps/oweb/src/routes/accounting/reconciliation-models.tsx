import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ReconciliationModels() {
  return (
    <ModuleRoute
      model="account.reconcile.model"
      actionXmlId="account.action_account_reconcile_model"
      listPath="/accounting/reconciliation-models"
      recordPath={(id) => `/accounting/reconciliation-model/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/reconciliation-models')({
  component: ReconciliationModels,
  beforeLoad: requireAuth,
})
