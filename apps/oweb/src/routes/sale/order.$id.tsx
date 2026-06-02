import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function SaleOrderForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="sale.order" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/sale/order/$id')({
  component: SaleOrderForm,
  beforeLoad: requireAuth,
})
