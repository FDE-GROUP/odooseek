import { useCallback, useEffect, useRef, useState } from 'react'

export function useListPagination(defaultOrder?: string, defaultLimit?: number) {
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(defaultLimit ?? 80)
  const [order, setOrder] = useState('')
  const savedScrollTop = useRef(0)

  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) return
    didMount.current = true
    if (defaultOrder) setOrder(defaultOrder)
    if (defaultLimit) setLimit(defaultLimit)
  }, [defaultOrder, defaultLimit])

  const handleSort = useCallback(
    (fieldName: string, scrollContainer: HTMLDivElement | null) => {
      if (scrollContainer) savedScrollTop.current = scrollContainer.scrollTop
      setOrder((prev) => {
        if (prev === fieldName) return `${fieldName} desc`
        if (prev === `${fieldName} desc`) return ''
        return fieldName
      })
      setOffset(0)
    },
    [],
  )

  const handlePageChange = useCallback((newOffset: number, scrollContainer: HTMLDivElement | null) => {
    if (scrollContainer) savedScrollTop.current = scrollContainer.scrollTop
    setOffset(newOffset)
  }, [])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setOffset(0)
  }, [])

  const restoreScroll = useCallback((scrollContainer: HTMLDivElement | null) => {
    if (scrollContainer && savedScrollTop.current > 0) {
      scrollContainer.scrollTop = savedScrollTop.current
      savedScrollTop.current = 0
    }
  }, [])

  return {
    offset,
    limit,
    order,
    setOffset,
    handleSort,
    handlePageChange,
    handleLimitChange,
    restoreScroll,
  }
}
