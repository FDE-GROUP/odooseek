import { useCallback, useEffect, useRef, useReducer } from 'react'
import type { ViewType } from '@odooseek/odoo-client'

type NavigationState = {
  viewType: ViewType
  recordId: number | undefined
  internalRecordId: number | undefined
}

type NavigationAction =
  | { type: 'SYNC_PROPS'; viewType: ViewType; recordId: number | undefined }
  | { type: 'MODEL_CHANGED' }
  | { type: 'SWITCH_TO_FORM' }
  | { type: 'SET_RECORD'; recordId: number | undefined }

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SYNC_PROPS':
      return {
        ...state,
        viewType: action.viewType,
        recordId: action.recordId,
        internalRecordId: action.recordId,
      }
    case 'MODEL_CHANGED':
      return { ...state, recordId: undefined, internalRecordId: undefined }
    case 'SWITCH_TO_FORM':
      return { ...state, viewType: 'form', recordId: undefined, internalRecordId: undefined }
    case 'SET_RECORD':
      return { ...state, recordId: action.recordId, internalRecordId: action.recordId }
  }
}

export function useViewNavigation(viewType: ViewType, recordId: number | undefined, model: string) {
  const [state, dispatch] = useReducer(navigationReducer, {
    viewType,
    recordId,
    internalRecordId: recordId,
  })

  const prevModelRef = useRef(model)
  const prevViewTypeRef = useRef(viewType)
  const prevRecordIdRef = useRef(recordId)

  useEffect(() => {
    if (prevModelRef.current !== model) {
      prevModelRef.current = model
      dispatch({ type: 'MODEL_CHANGED' })
      // Also sync props since model changed
      dispatch({ type: 'SYNC_PROPS', viewType, recordId })
      prevViewTypeRef.current = viewType
      prevRecordIdRef.current = recordId
      return
    }
    let needsSync = false
    const syncAction: NavigationAction = { type: 'SYNC_PROPS', viewType, recordId }
    if (prevViewTypeRef.current !== viewType) {
      needsSync = true
      prevViewTypeRef.current = viewType
    }
    if (prevRecordIdRef.current !== recordId) {
      needsSync = true
      prevRecordIdRef.current = recordId
    }
    if (needsSync) dispatch(syncAction)
  }, [viewType, recordId, model])

  const handleCreate = useCallback(() => {
    dispatch({ type: 'SWITCH_TO_FORM' })
  }, [])

  return {
    internalViewType: state.viewType,
    recordId: state.recordId,
    handleCreate,
  }
}
