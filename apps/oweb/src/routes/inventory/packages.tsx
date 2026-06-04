import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryPackages() {
  return (
    <ModuleRoute
      model="stock.package"
      actionXmlId="stock.action_package_view"
      listPath="/inventory/packages"
      recordPath={(id) => `/inventory/package/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/packages')({
  component: InventoryPackages,
  beforeLoad: requireAuth,
})
