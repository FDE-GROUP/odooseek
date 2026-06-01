import type { FieldWidgetProps } from './index'

const PRESENCE_CONFIG: Record<string, { color: string; title: string }> = {
  present: { color: '#28a745', title: 'Present' },
  absent: { color: '#6c757d', title: 'Absent' },
  away: { color: '#ffc107', title: 'Away' },
  out_of_working_hour: { color: '#ced4da', title: 'Off Hours' },
}

export function PresenceIcon({ value, readOnly }: FieldWidgetProps) {
  const state = (value as string) || 'absent'
  const cfg = PRESENCE_CONFIG[state] || PRESENCE_CONFIG.absent

  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full border border-white/20"
          style={{ backgroundColor: cfg.color }}
          title={cfg.title}
        />
        {cfg.title}
      </span>
    )
  }

  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full border border-white/20"
      style={{ backgroundColor: cfg.color }}
      title={cfg.title}
    />
  )
}
