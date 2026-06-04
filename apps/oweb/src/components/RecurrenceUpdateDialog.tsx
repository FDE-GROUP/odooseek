import { useState } from 'react'
import { createPortal } from 'react-dom'

export type RecurrencePolicy = 'self_only' | 'future_events' | 'all_events'

interface RecurrenceUpdateDialogProps {
  mode: 'edit' | 'delete'
  onConfirm: (policy: RecurrencePolicy) => void
  onCancel: () => void
}

export function RecurrenceUpdateDialog({ mode, onConfirm, onCancel }: RecurrenceUpdateDialogProps) {
  const [policy, setPolicy] = useState<RecurrencePolicy>('self_only')

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
      <div role="presentation" className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-5 shadow-2xl">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          {mode === 'delete' ? 'Delete recurring event' : 'Edit recurring event'}
        </h3>
        <p className="mb-4 text-xs text-text-muted">
          This is a recurring event. What would you like to {mode}?
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-lg border border-border-subtle p-3 cursor-pointer hover:bg-hover">
            <input
              type="radio"
              name="recurrence_policy"
              checked={policy === 'self_only'}
              onChange={() => setPolicy('self_only')}
              className="h-4 w-4 accent-accent"
            />
            <div>
              <div className="text-sm font-medium text-text">This event</div>
              <div className="text-xs text-text-muted">Only {mode} this occurrence</div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-border-subtle p-3 cursor-pointer hover:bg-hover">
            <input
              type="radio"
              name="recurrence_policy"
              checked={policy === 'future_events'}
              onChange={() => setPolicy('future_events')}
              className="h-4 w-4 accent-accent"
            />
            <div>
              <div className="text-sm font-medium text-text">This and following events</div>
              <div className="text-xs text-text-muted">
                {mode === 'delete' ? 'Delete this' : 'Edit this'} and all future occurrences
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-border-subtle p-3 cursor-pointer hover:bg-hover">
            <input
              type="radio"
              name="recurrence_policy"
              checked={policy === 'all_events'}
              onChange={() => setPolicy('all_events')}
              className="h-4 w-4 accent-accent"
            />
            <div>
              <div className="text-sm font-medium text-text">All events</div>
              <div className="text-xs text-text-muted">
                {mode === 'delete' ? 'Delete all' : 'Edit all'} events in the series
              </div>
            </div>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(policy)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-on-accent hover:bg-accent/90"
          >
            {mode === 'delete' ? 'Delete' : 'Edit'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export type { RecurrenceUpdateDialogProps }
