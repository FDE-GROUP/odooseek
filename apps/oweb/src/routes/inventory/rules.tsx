import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryRules() {
  return <ModuleRoute model="stock.rule" listPath="/inventory/rules" />
}

export const Route = createFileRoute('/inventory/rules')({
  component: InventoryRules,
  beforeLoad: requireAuth,
})
