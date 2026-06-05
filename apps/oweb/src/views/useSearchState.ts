import { useCallback, useMemo, useState } from 'react'

export function useSearchState(initialDomain: unknown[]) {
  const [domain, setDomain] = useState<unknown[]>([])
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [searchPanelDomain, setSearchPanelDomain] = useState<unknown[]>([])

  const effectiveDomain = useMemo<unknown[]>(
    () => [...initialDomain, ...domain, ...searchPanelDomain],
    [initialDomain, domain, searchPanelDomain],
  )

  const searchPanelBaseDomain = useMemo<unknown[]>(
    () => [...initialDomain, ...domain],
    [initialDomain, domain],
  )

  const handleSearch = useCallback((newDomain: unknown[]) => {
    setDomain(newDomain)
  }, [])

  const handleGroupByChange = useCallback((groupBys: string[]) => {
    setGroupBy(groupBys)
  }, [])

  return {
    domain,
    groupBy,
    searchPanelDomain,
    effectiveDomain,
    searchPanelBaseDomain,
    handleSearch,
    handleGroupByChange,
    setSearchPanelDomain,
  }
}
