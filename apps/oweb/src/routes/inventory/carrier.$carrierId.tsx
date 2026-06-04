import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CarrierDetail() {
  return <ModuleRoute model="delivery.carrier" listPath="/inventory/carriers" />
}

export const Route = createFileRoute('/inventory/carrier/$carrierId')({
  component: CarrierDetail,
  beforeLoad: requireAuth,
})
