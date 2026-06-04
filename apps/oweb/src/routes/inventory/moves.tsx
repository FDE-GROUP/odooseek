import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryMoves() {
  return (
    <ModuleRoute
      model="stock.move"
      actionXmlId="stock.stock_move_action"
      listPath="/inventory/moves"
      recordPath={(id) => `/inventory/move/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/moves')({
  component: InventoryMoves,
  beforeLoad: requireAuth,
})
