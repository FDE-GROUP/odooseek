import { useEffect, useState } from 'react'
import type { RecordModel, RecordModelSnapshot } from '@odooseek/odoo-client'

export function useRecordModel(model: RecordModel): RecordModelSnapshot {
  const [snap, setSnap] = useState(() => model.getSnapshot())
  useEffect(() => {
    setSnap(model.getSnapshot())
    return model.subscribe(() => setSnap(model.getSnapshot()))
  }, [model])
  return snap
}
