import { useEffect, useRef } from 'react'

interface FormLifecycleOptions {
  model: string
  recordId: number | undefined
  editMode: boolean
  isDirty: boolean
  formValues: Record<string, unknown>
  handleSave: () => Promise<void>
  handleCancel: () => void
  savePending: boolean
  formRef: React.RefObject<HTMLDivElement | null>
  setFormValues: (values: Record<string, unknown>) => void
}

export function useFormLifecycle({
  model,
  recordId,
  editMode,
  isDirty,
  formValues,
  handleSave,
  handleCancel,
  savePending,
  formRef,
  setFormValues,
}: FormLifecycleOptions) {
  const newRecordId = !recordId ? 0 : recordId

  // Keyboard shortcuts: Ctrl+S save, Escape cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (editMode && !savePending) handleSave()
      }
      if (e.key === 'Escape' && editMode) {
        e.preventDefault()
        handleCancel()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [editMode, savePending, handleSave, handleCancel])

  // beforeUnload: warn when leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Autosave: save after 5s idle when dirty
  useEffect(() => {
    if (!isDirty || !editMode || !newRecordId) return
    const timer = setTimeout(() => {
      handleSave()
    }, 5000)
    return () => clearTimeout(timer)
  }, [isDirty, editMode, newRecordId, handleSave])

  // Draft recovery: save draft to localStorage, restore on mount
  const draftKey = `form_draft_${model}_${recordId ?? 'new'}`
  useEffect(() => {
    if (isDirty && editMode) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formValues))
      } catch {
        // localStorage full or unavailable
      }
    }
  }, [isDirty, editMode, formValues, draftKey])

  const draftLoaded = useRef(false)
  useEffect(() => {
    if (!editMode || draftLoaded.current) return
    draftLoaded.current = true
    try {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        localStorage.removeItem(draftKey)
        setFormValues(JSON.parse(draft))
      }
    } catch {
      // invalid draft
    }
  }, [editMode, draftKey, setFormValues])

  // Autofocus first editable field on new record
  useEffect(() => {
    if (!editMode || !formRef.current) return
    const first = formRef.current.querySelector<HTMLInputElement>(
      'input[type="text"], textarea, select',
    )
    if (first) first.focus()
  }, [editMode, formRef])
}
