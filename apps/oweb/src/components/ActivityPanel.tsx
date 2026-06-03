import { callKw, searchRead } from '@odooseek/odoo-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface ActivityRecord {
  id: number
  activity_type_id: [number, string] | false
  summary: string | false
  note: string | false
  date_deadline: string
  state: string
  user_id: [number, string] | false
}

interface ActivityTypeRecord {
  id: number
  name: string
  category: string
  default_user_id: [number, string] | false
}

interface ActivityPanelProps {
  model: string
  recordId: number | undefined
}

const ACTIVITY_FIELDS = [
  'id',
  'activity_type_id',
  'summary',
  'note',
  'date_deadline',
  'state',
  'user_id',
]

function groupByState(activities: ActivityRecord[]) {
  const overdue: ActivityRecord[] = []
  const today: ActivityRecord[] = []
  const planned: ActivityRecord[] = []
  const todayStr = new Date().toISOString().slice(0, 10)
  for (const a of activities) {
    const dl = a.date_deadline
    if (dl < todayStr) overdue.push(a)
    else if (dl === todayStr) today.push(a)
    else planned.push(a)
  }
  return { overdue, today, planned }
}

export function ActivityPanel({ model, recordId }: ActivityPanelProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [newSummary, setNewSummary] = useState('')
  const [newDeadline, setNewDeadline] = useState(new Date().toISOString().slice(0, 10))
  const [newActivityTypeId, setNewActivityTypeId] = useState<number | null>(null)
  const [feedbackId, setFeedbackId] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const enabled = !!recordId

  const { data: activities, isLoading } = useQuery({
    queryKey: ['odoo', 'activities', model, recordId],
    queryFn: () =>
      searchRead<ActivityRecord[]>(
        'mail.activity',
        [
          ['res_id', '=', recordId],
          ['res_model', '=', model],
        ],
        ACTIVITY_FIELDS,
        0,
        80,
        'date_deadline asc',
      ),
    enabled,
    staleTime: 15_000,
  })

  const { data: activityTypes } = useQuery({
    queryKey: ['odoo', 'activity-types'],
    queryFn: () =>
      searchRead<ActivityTypeRecord[]>(
        'mail.activity.type',
        [['active', '=', true]],
        ['id', 'name', 'category', 'default_user_id'],
        0,
        50,
        'name asc',
      ),
    staleTime: 60_000,
  })

  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: ['odoo', 'activities', model, recordId] })
  }

  const doneMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: string }) =>
      callKw('mail.activity', 'action_feedback', [[id]], { feedback }),
    onSuccess: () => {
      setFeedbackId(null)
      setFeedbackText('')
      invalidateActivities()
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => callKw('mail.activity', 'unlink', [[id]]),
    onSuccess: invalidateActivities,
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => callKw('mail.activity', 'create', [values]),
    onSuccess: () => {
      setShowForm(false)
      setNewSummary('')
      setNewDeadline(new Date().toISOString().slice(0, 10))
      invalidateActivities()
    },
  })

  if (!enabled) return null

  const groups = groupByState(activities ?? [])

  const handleCreate = () => {
    const values: Record<string, unknown> = {
      res_model: model,
      res_id: recordId as number,
      summary: newSummary,
      date_deadline: newDeadline,
    }
    if (newActivityTypeId) values.activity_type_id = newActivityTypeId
    createMutation.mutate(values)
  }

  return (
    <div className="border-t border-border-subtle px-4 py-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">Activities</h4>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/10"
        >
          {showForm ? 'Cancel' : 'Schedule'}
        </button>
      </div>

      {isLoading && <div className="py-4 text-center text-xs text-text-muted">Loading...</div>}

      {showForm && (
        <div className="mt-2 flex items-end gap-2 rounded-lg border border-border-subtle bg-surface/50 p-3">
          {activityTypes && activityTypes.length > 0 && (
            <div>
              <label className="mb-1 block text-[10px] text-text-secondary">Type</label>
              <select
                value={newActivityTypeId ?? ''}
                onChange={(e) =>
                  setNewActivityTypeId(e.target.value ? Number(e.target.value) : null)
                }
                className="rounded border border-border-default bg-root px-2 py-1 text-xs text-text-primary"
              >
                <option value="">-- None --</option>
                {activityTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label className="mb-1 block text-[10px] text-text-secondary">Summary</label>
            <input
              type="text"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              className="w-full rounded border border-border-default bg-root px-2 py-1 text-xs text-text-primary"
              placeholder="Activity summary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-text-secondary">Due Date</label>
            <input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="rounded border border-border-default bg-root px-2 py-1 text-xs text-text-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMutation.isPending || !newSummary}
            className="rounded bg-accent px-3 py-1 text-[11px] font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
          >
            {createMutation.isPending ? '...' : 'Add'}
          </button>
        </div>
      )}

      {!isLoading && (activities?.length ?? 0) === 0 && !showForm && (
        <p className="py-3 text-center text-xs text-text-muted">No activities scheduled</p>
      )}

      {(
        [
          ['overdue', 'Overdue', 'text-danger', groups.overdue],
          ['today', 'Today', 'text-warning', groups.today],
          ['planned', 'Planned', 'text-success', groups.planned],
        ] as const
      ).map(
        ([key, label, color, items]) =>
          items.length > 0 && (
            <div key={key} className="mt-2">
              <span className={`text-[10px] font-semibold uppercase ${color}`}>
                {label} ({items.length})
              </span>
              {items.map((a) => (
                <div
                  key={a.id}
                  className="mt-1 flex items-center gap-2 rounded border border-border-subtle bg-surface/30 px-3 py-1.5"
                >
                  <div className="flex-1">
                    <span className="text-xs font-medium text-text-primary">
                      {a.summary ||
                        (Array.isArray(a.activity_type_id) ? a.activity_type_id[1] : 'Activity')}
                    </span>
                    <span className="ml-2 text-[10px] text-text-muted">{a.date_deadline}</span>
                  </div>
                  {feedbackId === a.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Feedback..."
                        className="w-28 rounded border border-border-default bg-root px-1.5 py-0.5 text-[10px]"
                      />
                      <button
                        type="button"
                        onClick={() => doneMutation.mutate({ id: a.id, feedback: feedbackText })}
                        disabled={doneMutation.isPending}
                        className="rounded bg-success px-1.5 py-0.5 text-[10px] text-on-accent"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackId(null)
                          setFeedbackText('')
                        }}
                        className="rounded px-1.5 py-0.5 text-[10px] text-text-muted hover:bg-hover"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setFeedbackId(a.id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-success hover:bg-success/10"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelMutation.mutate(a.id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-text-muted hover:text-danger"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ),
      )}
    </div>
  )
}
