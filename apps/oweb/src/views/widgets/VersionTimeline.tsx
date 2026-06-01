import { useVersioning } from '../../hooks/useVersioning'
import type { FieldWidgetProps } from './index'

const STATUS_CLASS: Record<string, string> = {
  current: 'border-accent bg-accent/10 text-accent',
  future: 'border-blue-500/40 bg-blue-500/5 text-blue-600',
  past: 'border-border-subtle bg-surface text-text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  current: 'Current',
  future: 'Future',
  past: 'Past',
}

function getStatus(v: { isCurrent: boolean; isFuture: boolean; isPast: boolean }): string {
  if (v.isCurrent) return 'current'
  if (v.isFuture) return 'future'
  return 'past'
}

export function VersionTimeline({ record, recordId }: FieldWidgetProps) {
  const employeeId = recordId ?? (record?.id as number | undefined)
  const { versions, currentVersionId, selectedVersionId, isLoading, selectVersion, goToCurrent } =
    useVersioning(employeeId)

  if (!employeeId) {
    return <div className="text-sm text-text-muted py-2">Version history unavailable</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (versions.length === 0) {
    return <div className="text-sm text-text-muted py-2">No versions</div>
  }

  const effectiveId = selectedVersionId ?? currentVersionId

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {versions.map((v) => {
          const status = getStatus(v)
          const isSelected = v.id === effectiveId
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => selectVersion(v.id)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                STATUS_CLASS[status]
              } ${isSelected ? 'ring-2 ring-accent/30' : 'hover:opacity-80'}`}
            >
              <div className="font-medium flex items-center gap-1.5">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    status === 'current'
                      ? 'bg-accent'
                      : status === 'future'
                        ? 'bg-blue-500'
                        : 'bg-text-muted'
                  }`}
                />
                {v.dateVersion ? new Date(v.dateVersion).toLocaleDateString() : `v${v.id}`}
              </div>
              {v.department && (
                <div className="text-text-muted mt-0.5 truncate max-w-[100px]">
                  {v.department[1] || v.department[0]}
                </div>
              )}
              {v.job && <div className="truncate max-w-[120px]">{v.job[1] || v.job[0]}</div>}
              {v.wage != null && (
                <div className="mt-0.5 tabular-nums">{v.wage.toLocaleString()}</div>
              )}
              <div className="mt-1 text-[10px] opacity-60">{STATUS_LABEL[status]}</div>
            </button>
          )
        })}
      </div>
      {selectedVersionId && selectedVersionId !== currentVersionId && (
        <button
          type="button"
          onClick={goToCurrent}
          className="mt-1 text-xs text-accent hover:underline"
        >
          ← Back to current version
        </button>
      )}
    </div>
  )
}
