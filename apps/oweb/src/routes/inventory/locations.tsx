import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryLocations() {
  return (
    <ModuleRoute
      model="stock.location"
      actionXmlId="stock.action_location_form"
      listPath="/inventory/locations"
      recordPath={(id) => `/inventory/location/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/locations')({
  component: InventoryLocations,
  beforeLoad: requireAuth,
})
