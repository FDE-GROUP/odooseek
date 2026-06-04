import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PRODUCT_TEMPLATE_MODEL } from '../../lib/product'

function ProductForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model={PRODUCT_TEMPLATE_MODEL} fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/product/product/$id')({
  component: ProductForm,
  beforeLoad: requireAuth,
})
