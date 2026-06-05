import { useEffect, useState } from 'react'
import type { ListModel, ListModelSnapshot } from '@odooseek/odoo-client'

export function useListModel(model: ListModel): ListModelSnapshot {
  const [snap, setSnap] = useState(() => model.getSnapshot())
  useEffect(() => {
    setSnap(model.getSnapshot())
    return model.subscribe(() => setSnap(model.getSnapshot()))
  }, [model])
  return snap
}
