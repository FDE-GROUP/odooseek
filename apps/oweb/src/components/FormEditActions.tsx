import { cpAccentTintPill, cpNeutralPill } from './control-panel-styles'

export interface FormEditActionsProps {
  editMode: boolean
  isDirty: boolean
  justSaved: boolean
  saveError: string | null
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  /** Match control panel toolbar (`h-7` pills). */
  compact?: boolean
}

export function FormEditActions({
  editMode,
  isDirty,
  justSaved,
  saveError,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  compact = false,
}: FormEditActionsProps) {
  const badgeClass = compact ? 'text-[11px]' : 'text-xs'
  const btnAccent = compact
    ? cpAccentTintPill()
    : 'rounded bg-accent/15 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20'
  const btnNeutral = compact
    ? cpNeutralPill()
    : 'rounded px-3 py-1 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary'
  const btnSave = compact
    ? cpAccentTintPill()
    : 'rounded bg-accent/15 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20'

  return (
    <div className="flex items-center gap-2 shrink-0">
      {saveError && (
        <span
          className={`flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 font-medium text-danger transition-all duration-200 ${badgeClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          Invalid
        </span>
      )}
      {isDirty && (
        <span
          className={`flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning transition-all duration-200 ${badgeClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
          Unsaved
        </span>
      )}
      {justSaved && !isDirty && (
        <span
          className={`flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 font-medium text-success transition-all duration-200 ${badgeClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Saved
        </span>
      )}
      {editMode ? (
        <>
          <button type="button" onClick={onCancel} className={btnNeutral}>
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={isSaving} className={btnSave}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </>
      ) : (
        <button type="button" onClick={onEdit} className={btnAccent}>
          Edit
        </button>
      )}
    </div>
  )
}
