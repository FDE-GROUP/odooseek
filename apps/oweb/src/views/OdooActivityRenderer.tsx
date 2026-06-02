import type {
  OdooAction,
  OdooActivityData,
  OdooActivityGroupCell,
  OdooActivityTypeInfo,
  OdooFieldMeta,
  ParsedActivityView,
  ViewField,
} from '@odooseek/odoo-client'
import { callKw, read } from '@odooseek/odoo-client'
import { parseActivityXml } from '@odooseek/odoo-client/xml-parser'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Settings } from '@/lib/lucide-icons'
import { useToast } from '../hooks/useToast'
import {
  activityDomainForModel,
  fetchActivityDataForModel,
  fetchActivityTypesForModel,
  mailActivityFormAction,
  mailActivityScheduleAction,
} from '../lib/activity-actions'
import { resolveOdooImageFromRecord } from '../lib/odoo-image'

const STATE_CELL_CLASS: Record<string, string> = {
  planned: 'bg-emerald-600 text-white',
  today: 'bg-amber-500 text-white',
  overdue: 'bg-red-600 text-white',
  done: 'bg-gray-400 text-gray-900',
}

function columnStorageKey(model: string): string {
  return `oweb.activity.columns.${model}`
}

function loadHiddenColumnIds(model: string): Set<number> {
  try {
    const raw = sessionStorage.getItem(columnStorageKey(model))
    if (!raw) return new Set()
    const ids = JSON.parse(raw) as number[]
    return new Set(ids)
  } catch {
    return new Set()
  }
}

function saveHiddenColumnIds(model: string, hidden: Set<number>) {
  sessionStorage.setItem(columnStorageKey(model), JSON.stringify([...hidden]))
}

interface ActivityRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  context?: Record<string, unknown>
  onRecordClick?: (id: number) => void
  onOpenFormDialog: (action: OdooAction) => void
}

function activityGroupFor(
  grouped: OdooActivityData['grouped_activities'],
  resId: number,
  typeId: number,
): OdooActivityGroupCell | undefined {
  const byRes = grouped[resId] ?? grouped[String(resId)]
  if (!byRes) return undefined
  return byRes[typeId] ?? byRes[String(typeId)]
}

function formatReportingDate(value: string | false | null | undefined): string {
  if (!value || typeof value !== 'string') return ''
  return value.length >= 10 ? value.slice(0, 10) : value
}

function activityCount(group: OdooActivityGroupCell): number {
  return Object.values(group.count_by_state ?? {}).reduce((sum, n) => sum + n, 0)
}

function summaryText(group: OdooActivityGroupCell): string {
  const parts = (group.summaries ?? []).filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : ''
}

function resIdsWithActivityForType(
  grouped: OdooActivityData['grouped_activities'],
  activityTypeId: number,
  candidateResIds: number[],
): number[] {
  return candidateResIds.filter((resId) => {
    const group = activityGroupFor(grouped, resId, activityTypeId)
    return group && group.state
  })
}

function ActivityRecordBox({
  model,
  record,
  boxFields,
  onClick,
}: {
  model: string
  record: Record<string, unknown>
  boxFields: ViewField[]
  onClick?: () => void
}) {
  const recordId = record.id as number
  const avatarSrc = resolveOdooImageFromRecord(record, model, recordId, ['avatar_128', 'image_128'])

  const lines =
    boxFields.length > 0
      ? boxFields.map((f) => {
          const raw = record[f.name]
          let text = ''
          if (Array.isArray(raw) && raw.length === 2) text = String(raw[1] ?? '')
          else if (raw != null && raw !== false) text = String(raw)
          return { key: f.name, text, bold: f.class?.includes('fw-bold') || f.name === 'name' }
        })
      : [
          {
            key: 'name',
            text: String(record.display_name ?? record.name ?? `#${recordId}`),
            bold: true,
          },
        ]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-[220px] cursor-pointer items-center gap-2 rounded px-2 py-2 text-left transition-colors hover:bg-hover"
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt=""
          className="h-8 w-8 shrink-0 rounded object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface text-xs text-text-muted">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        {lines.map((line) => (
          <div
            key={line.key}
            className={`truncate text-sm ${line.bold ? 'font-semibold text-text-primary' : 'text-text-muted'}`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </button>
  )
}

function ActivityCell({ group, onClick }: { group: OdooActivityGroupCell; onClick: () => void }) {
  const state = group.state || 'planned'
  const cellClass = STATE_CELL_CLASS[state] ?? 'bg-surface text-text-primary'
  const count = activityCount(group)
  const summary = summaryText(group)
  const dateLabel = formatReportingDate(group.reporting_date)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full min-h-[4.5rem] w-full cursor-pointer flex-col justify-between p-2 text-left text-xs ${cellClass}`}
      title={summary || undefined}
    >
      {summary ? (
        <div className="line-clamp-2 opacity-90">{summary}</div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="mt-2 flex items-end justify-between gap-1">
        <span>{dateLabel}</span>
        {count > 1 ? (
          <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{count}</span>
        ) : null}
      </div>
    </button>
  )
}

function ActivityTypeHeader({
  type,
  onSendTemplate,
  isSendingTemplate,
}: {
  type: OdooActivityTypeInfo
  onSendTemplate: (templateId: number) => void
  isSendingTemplate: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const templates = type.template_ids ?? []

  return (
    <th className="relative min-w-[100px] border border-border-subtle bg-surface/50 p-3 text-left text-xs font-medium text-text-primary">
      <div className="flex items-start justify-between gap-1">
        <span>{type.name}</span>
        {templates.length > 0 && (
          <div className="relative">
            <button
              type="button"
              className="rounded p-0.5 text-text-muted hover:bg-hover hover:text-text-primary"
              title="Email templates"
              disabled={isSendingTemplate}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded border border-border-subtle bg-surface py-1 shadow-lg">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
                      onClick={() => {
                        setMenuOpen(false)
                        onSendTemplate(tpl.id)
                      }}
                    >
                      ✉ {tpl.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </th>
  )
}

function ColumnSettingsMenu({
  types,
  hiddenIds,
  onToggle,
}: {
  types: OdooActivityTypeInfo[]
  hiddenIds: Set<number>
  onToggle: (typeId: number) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <th className="w-10 border border-border-subtle bg-surface/50 p-2 align-middle">
      <div className="relative flex justify-center">
        <button
          type="button"
          className="rounded p-1 text-text-muted hover:bg-hover hover:text-text-primary"
          title="Activity columns"
          onClick={() => setOpen((o) => !o)}
        >
          <Settings className="h-4 w-4" />
        </button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded border border-border-subtle bg-surface py-2 shadow-lg">
              <p className="px-3 pb-1 text-[10px] font-medium text-text-muted">Activity types</p>
              {types.map((type) => (
                <label
                  key={type.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1 text-xs text-text-primary hover:bg-hover"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenIds.has(type.id)}
                    onChange={() => onToggle(type.id)}
                  />
                  {type.name}
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </th>
  )
}

export function OdooActivityRenderer({
  model,
  arch,
  fields,
  domain = [],
  context = {},
  onRecordClick,
  onOpenFormDialog,
}: ActivityRendererProps) {
  const parsed: ParsedActivityView = useMemo(() => parseActivityXml(arch), [arch])
  const toast = useToast()
  const queryClient = useQueryClient()
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<number>>(() =>
    loadHiddenColumnIds(model),
  )

  useEffect(() => {
    saveHiddenColumnIds(model, hiddenColumnIds)
  }, [model, hiddenColumnIds])

  const activityDomain = useMemo(() => activityDomainForModel(domain, fields), [domain, fields])

  const {
    data: activityData,
    isLoading: loadingActivity,
    isError: activityDataError,
    error: activityDataErrorDetail,
  } = useQuery({
    queryKey: ['odoo', 'activity-data', model, activityDomain, context],
    queryFn: () => fetchActivityDataForModel(model, activityDomain, context),
    staleTime: 30_000,
  })

  const { data: activityTypesList, isLoading: loadingTypes } = useQuery({
    queryKey: ['odoo', 'activity-types', model, context],
    queryFn: () => fetchActivityTypesForModel(model, context),
    staleTime: 60_000,
  })

  const readFields = useMemo(() => {
    const names = new Set<string>([...parsed.fields, ...parsed.boxFields.map((f) => f.name)])
    names.add('display_name')
    if (!names.has('avatar_128') && !names.has('image_128')) names.add('avatar_128')
    return [...names]
  }, [parsed])

  const resIds = activityData?.activity_res_ids ?? []

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['odoo', 'activity-records', model, resIds, readFields],
    queryFn: async () => {
      if (resIds.length === 0) return []
      const rows = await read<Record<string, unknown>[]>(model, resIds, readFields)
      const byId = new Map(rows.map((r) => [r.id as number, r]))
      return resIds.map((id) => byId.get(id)).filter((r): r is Record<string, unknown> => !!r)
    },
    enabled: resIds.length > 0,
    staleTime: 30_000,
  })

  const sendMailMutation = useMutation({
    mutationFn: ({ resIds: ids, templateId }: { resIds: number[]; templateId: number }) =>
      callKw(model, 'activity_send_mail', [ids, templateId]),
    onSuccess: () => {
      toast.success('Email sent')
      queryClient.invalidateQueries({ queryKey: ['odoo', 'activity-data', model] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send email')
    },
  })

  const activityTypes = useMemo(() => {
    if (activityTypesList && activityTypesList.length > 0) return activityTypesList
    return activityData?.activity_types ?? []
  }, [activityTypesList, activityData?.activity_types])
  const visibleTypes = activityTypes.filter((t) => !hiddenColumnIds.has(t.id))
  const grouped = activityData?.grouped_activities ?? {}

  const toggleColumn = useCallback((typeId: number) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev)
      if (next.has(typeId)) next.delete(typeId)
      else next.add(typeId)
      return next
    })
  }, [])

  const openNewActivity = useCallback(
    (resId: number, activityTypeId: number) => {
      onOpenFormDialog(
        mailActivityFormAction({
          resModel: model,
          resId,
          activityTypeId,
        }),
      )
    },
    [model, onOpenFormDialog],
  )

  const openEditActivity = useCallback(
    (resId: number, activityTypeId: number, group: OdooActivityGroupCell) => {
      const activityId = group.ids?.[0]
      onOpenFormDialog(
        mailActivityFormAction({
          resModel: model,
          resId,
          activityTypeId,
          activityId,
          title: 'Activity',
        }),
      )
    },
    [model, onOpenFormDialog],
  )

  const scheduleForRecords = useCallback(
    (targetResIds: number[], activityTypeId?: number) => {
      if (targetResIds.length === 0) {
        toast.info('No records to schedule activities for')
        return
      }
      onOpenFormDialog(
        mailActivityScheduleAction({
          resModel: model,
          resIds: targetResIds,
          activityTypeId,
        }),
      )
    },
    [model, onOpenFormDialog, toast],
  )

  if (loadingTypes || loadingActivity || loadingRecords) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (activityTypes.length === 0) {
    const errMsg =
      activityDataError && activityDataErrorDetail instanceof Error
        ? activityDataErrorDetail.message
        : undefined
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-text-muted">
        <p>No activity types found for {model}.</p>
        <p className="text-xs">
          Install or configure the Mail app and create activity types in Odoo (Settings → Activities
          / Technical).
        </p>
        {errMsg && <p className="max-w-md text-xs text-danger">{errMsg}</p>}
      </div>
    )
  }

  const allResIds = records?.map((r) => r.id as number) ?? resIds

  if (!records?.length) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-sm text-text-muted">
        <p>No records with activities match the current filters.</p>
        <button
          type="button"
          className="rounded bg-accent px-3 py-1.5 text-xs text-on-accent"
          onClick={() => scheduleForRecords(resIds)}
        >
          Schedule activity
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <table className="mb-8 w-full min-w-[600px] border-collapse border border-border-subtle bg-surface text-sm">
        <thead>
          <tr>
            <th className="min-w-[240px] border border-border-subtle bg-surface/50 p-3" />
            {visibleTypes.map((type) => (
              <ActivityTypeHeader
                key={type.id}
                type={type}
                onSendTemplate={(templateId) => {
                  const ids = resIdsWithActivityForType(grouped, type.id, allResIds)
                  if (ids.length === 0) {
                    toast.info('No activities in this column to email')
                    return
                  }
                  sendMailMutation.mutate({ resIds: ids, templateId })
                }}
                isSendingTemplate={sendMailMutation.isPending}
              />
            ))}
            <ColumnSettingsMenu
              types={activityTypes}
              hiddenIds={hiddenColumnIds}
              onToggle={toggleColumn}
            />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const resId = record.id as number
            return (
              <tr key={resId} className="border-t border-border-subtle">
                <td className="border border-border-subtle p-0 align-middle">
                  <ActivityRecordBox
                    model={model}
                    record={record}
                    boxFields={parsed.boxFields}
                    onClick={() => onRecordClick?.(resId)}
                  />
                </td>
                {visibleTypes.map((type) => {
                  const group = activityGroupFor(grouped, resId, type.id)
                  return (
                    <td
                      key={type.id}
                      className="h-px border border-border-subtle p-0 align-stretch"
                    >
                      {group?.state ? (
                        <ActivityCell
                          group={group}
                          onClick={() => openEditActivity(resId, type.id, group)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => openNewActivity(resId, type.id)}
                          className="flex h-full min-h-[4.5rem] w-full cursor-pointer items-center justify-center text-text-muted hover:bg-hover"
                          title="Schedule activity"
                        >
                          <span className="text-lg opacity-40 transition-opacity hover:opacity-100">
                            +
                          </span>
                        </button>
                      )}
                    </td>
                  )
                })}
                <td className="border border-border-subtle bg-surface/30" />
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-surface/80">
            <td colSpan={visibleTypes.length + 2} className="border border-border-subtle p-3">
              <button
                type="button"
                onClick={() => scheduleForRecords(allResIds)}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Schedule activity
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
