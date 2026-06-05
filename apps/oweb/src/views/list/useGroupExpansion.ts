import { useCallback, useState } from 'react'

export function useGroupExpansion() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [groupExtraLimits, setGroupExtraLimits] = useState<Record<string, number>>({})

  const toggleGroupExpand = useCallback((path: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        for (const p of prev) {
          if (p.startsWith(`${path}-`)) next.delete(p)
        }
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  return { expandedGroups, groupExtraLimits, toggleGroupExpand, setGroupExtraLimits }
}
