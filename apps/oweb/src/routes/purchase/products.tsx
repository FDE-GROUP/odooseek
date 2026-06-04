import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function PurchaseProducts() {
  return (
    <ModuleRoute
      model="product.template"
      actionXmlId="purchase.product_normal_action_puchased"
      listPath="/purchase/products"
      recordPath={(id) => `/product/product/${id}`}
    />
  )
}

export const Route = createFileRoute('/purchase/products')({
  component: PurchaseProducts,
  beforeLoad: requireAuth,
})
