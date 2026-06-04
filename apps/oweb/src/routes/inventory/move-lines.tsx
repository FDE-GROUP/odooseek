import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryMoveLines() {
  return (
    <ModuleRoute
      model="stock.move.line"
      actionXmlId="stock.stock_move_line_action"
      listPath="/inventory/move-lines"
      recordPath={(id) => `/inventory/move-line/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/move-lines')({
  component: InventoryMoveLines,
  beforeLoad: requireAuth,
})
