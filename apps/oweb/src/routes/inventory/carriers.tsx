import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function DeliveryCarriers() {
  return (
    <ModuleRoute
      model="delivery.carrier"
      listPath="/inventory/carriers"
      recordPath={(id) => `/inventory/carrier/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/carriers')({
  component: DeliveryCarriers,
  beforeLoad: requireAuth,
})
