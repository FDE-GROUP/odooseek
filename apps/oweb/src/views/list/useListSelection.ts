import { useCallback, useState } from 'react'

export function useListSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [lastSelectedIdx, setLastSelectedIdx] = useState(-1)

  const toggleRow = useCallback(
    (id: number, shiftKey: boolean, index: number, data: Array<Record<string, unknown>>, groupByActive: boolean) => {
      setSelectedIds((prev) => {
        if (shiftKey && lastSelectedIdx >= 0 && !groupByActive) {
          const start = Math.min(lastSelectedIdx, index)
          const end = Math.max(lastSelectedIdx, index)
          const rangeIds = data.slice(start, end + 1).map((r) => r.id as number)
          const next = new Set(prev)
          for (const rid of rangeIds) next.add(rid)
          return next
        }
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      setLastSelectedIdx(index)
    },
    [lastSelectedIdx],
  )

  const toggleAll = useCallback(
    (pageRecordIds: number[], allSelected: boolean) => {
      if (allSelected) {
        setSelectedIds(new Set())
      } else {
        setSelectedIds(new Set(pageRecordIds))
      }
    },
    [],
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  return {
    selectedIds,
    setSelectedIds,
    lastSelectedIdx,
    toggleRow,
    toggleAll,
    clearSelection,
    selectAll,
  }
}
