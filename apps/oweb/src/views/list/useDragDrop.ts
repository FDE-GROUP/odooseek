import { useState } from 'react'

export function useDragDrop() {
  const [dragRow, setDragRow] = useState<number | null>(null)
  const [dragOverRow, setDragOverRow] = useState<number | null>(null)

  const clearDragState = () => {
    setDragRow(null)
    setDragOverRow(null)
  }

  return { dragRow, dragOverRow, setDragRow, setDragOverRow, clearDragState }
}
