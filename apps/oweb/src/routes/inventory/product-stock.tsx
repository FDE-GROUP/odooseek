import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProductStock() {
  return (
    <ModuleRoute
      model="product.product"
      actionXmlId="stock.action_product_stock_view"
      listPath="/inventory/product-stock"
      recordPath={(id) => `/product/product/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/product-stock')({
  component: ProductStock,
  beforeLoad: requireAuth,
})
