import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import {
  type HrSettingsPatch,
  type HrSettingsRecord,
  loadHrSettings,
  saveHrSettings,
} from '../lib/hr-settings'

interface HrSettingsPanelProps {
  canEdit: boolean
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 border-b border-border-subtle/30 py-2 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-xs font-medium text-text-primary">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11px] text-text-muted">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="mt-0.5 shrink-0 accent-accent"
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border-subtle/30 py-1.5 last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-medium text-text-primary">
        {value != null && value !== false ? String(value) : '—'}
      </span>
    </div>
  )
}

function draftFromRecord(record: HrSettingsRecord): HrSettingsPatch {
  return {
    module_hr_presence: !!record.module_hr_presence,
    hr_presence_control_login: !!record.hr_presence_control_login,
    hr_presence_control_email: !!record.hr_presence_control_email,
    hr_presence_control_ip: !!record.hr_presence_control_ip,
    module_hr_attendance: !!record.module_hr_attendance,
    hr_presence_control_email_amount: record.hr_presence_control_email_amount ?? 0,
    hr_presence_control_ip_list: record.hr_presence_control_ip_list ?? '',
  }
}

export function HrSettingsPanel({ canEdit }: HrSettingsPanelProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [draft, setDraft] = useState<HrSettingsPatch>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['odoo', 'hr-settings'],
    queryFn: loadHrSettings,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!data) return
    setSettingsId(data.id)
    setDraft(draftFromRecord(data))
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!settingsId) throw new Error('Settings not loaded')
      await saveHrSettings(settingsId, draft)
    },
    onSuccess: async () => {
      toast.success('HR settings saved')
      await queryClient.invalidateQueries({ queryKey: ['odoo', 'hr-settings'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save HR settings')
    },
  })

  const patch = useCallback((next: Partial<HrSettingsPatch>) => {
    setDraft((current) => ({ ...current, ...next }))
  }, [])

  if (isLoading) {
    return <p className="text-xs text-text-muted">Loading HR settings…</p>
  }

  if (isError || !data) {
    return (
      <p className="text-xs text-text-muted">
        HR settings unavailable. Configure presence in Odoo Settings → Employees.
      </p>
    )
  }

  const advanced = !!draft.module_hr_presence

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Presence control
        </h4>
        <ToggleRow
          label="Advanced presence control"
          description="Calculate availability from login, email, IP, or attendance signals."
          checked={!!draft.module_hr_presence}
          disabled={!canEdit || saveMutation.isPending}
          onChange={(checked) => patch({ module_hr_presence: checked })}
        />
        <ToggleRow
          label="Based on user login"
          checked={!!draft.hr_presence_control_login}
          disabled={!canEdit || !advanced || saveMutation.isPending}
          onChange={(checked) => patch({ hr_presence_control_login: checked })}
        />
        <ToggleRow
          label="Based on attendances"
          checked={!!draft.module_hr_attendance}
          disabled={!canEdit || !advanced || saveMutation.isPending}
          onChange={(checked) => patch({ module_hr_attendance: checked })}
        />
        <ToggleRow
          label="Based on emails sent"
          checked={!!draft.hr_presence_control_email}
          disabled={!canEdit || !advanced || saveMutation.isPending}
          onChange={(checked) => patch({ hr_presence_control_email: checked })}
        />
        {advanced && draft.hr_presence_control_email ? (
          <label className="flex items-center justify-between gap-3 border-b border-border-subtle/30 py-2">
            <span className="text-xs text-text-secondary">Minimum emails per hour</span>
            <input
              type="number"
              min={0}
              disabled={!canEdit || saveMutation.isPending}
              value={draft.hr_presence_control_email_amount ?? 0}
              className="w-20 rounded border border-border-default bg-surface px-2 py-1 text-xs"
              onChange={(e) =>
                patch({ hr_presence_control_email_amount: Number(e.target.value) || 0 })
              }
            />
          </label>
        ) : null}
        <ToggleRow
          label="Based on IP address"
          checked={!!draft.hr_presence_control_ip}
          disabled={!canEdit || !advanced || saveMutation.isPending}
          onChange={(checked) => patch({ hr_presence_control_ip: checked })}
        />
        {advanced && draft.hr_presence_control_ip ? (
          <label className="block border-b border-border-subtle/30 py-2">
            <span className="mb-1 block text-xs text-text-secondary">Allowed IP addresses</span>
            <input
              type="text"
              disabled={!canEdit || saveMutation.isPending}
              value={draft.hr_presence_control_ip_list ?? ''}
              placeholder="192.168.1.1, 10.0.0.0/24"
              className="w-full rounded border border-border-default bg-surface px-2 py-1.5 text-xs"
              onChange={(e) => patch({ hr_presence_control_ip_list: e.target.value })}
            />
          </label>
        ) : null}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Notifications (read-only)
        </h4>
        <ReadOnlyRow
          label="Contract expiry notice (days)"
          value={data.contract_expiration_notice_period}
        />
        <ReadOnlyRow
          label="Work permit expiry notice (days)"
          value={data.work_permit_expiration_notice_period}
        />
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Scheduled jobs (Odoo backend)
        </h4>
        <p className="text-[11px] leading-relaxed text-text-muted">
          Contract/work permit reminders and employee version updates run daily via Odoo{' '}
          <code className="font-mono">ir.cron</code>. See{' '}
          <code className="font-mono">apps/oweb/HR_SETTINGS.md</code> for Docker ops.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
          User ↔ employee linking uses <code className="font-mono">hr.employee.user_id</code> in
          Odoo; there is no built-in sync cron in Odoo 19.
        </p>
      </div>

      {canEdit ? (
        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent hover:brightness-110 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save HR settings'}
        </button>
      ) : (
        <p className="text-[11px] text-text-muted">HR Manager access required to edit settings.</p>
      )}
    </div>
  )
}
