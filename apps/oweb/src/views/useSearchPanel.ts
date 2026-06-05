import { useState } from 'react'

export function useSearchPanel() {
  const [searchPanelOpen, setSearchPanelOpen] = useState(true)
  const [mobileSearchPanelOpen, setMobileSearchPanelOpen] = useState(false)

  return {
    searchPanelOpen,
    mobileSearchPanelOpen,
    setSearchPanelOpen,
    setMobileSearchPanelOpen,
  }
}
