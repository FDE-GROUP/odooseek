import type { ReadGroupResult } from '@odooseek/odoo-client'
import { callKw, readGroup } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { requireAuth, useAuth } from '../lib/auth'
import { CalendarDays, TrendingUp } from '../lib/lucide-icons'

interface QuickAction {
  label: string
  model: string
  view: string
  icon: string
  color: string
  domain?: unknown[]
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'CRM',
    model: 'crm.lead',
    view: 'list',
    icon: 'oi oi-suitcase',
    color: 'bg-info/10 text-info',
    domain: [['type', '=', 'opportunity']],
  },
  {
    label: 'Leads',
    model: 'crm.lead',
    view: 'list',
    icon: 'oi oi-plus',
    color: 'bg-accent/10 text-accent',
    domain: [['type', '=', 'lead']],
  },
  {
    label: 'Sales',
    model: 'sale.order',
    view: 'list',
    icon: 'oi oi-suitcase-plus',
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Inventory',
    model: 'stock.picking',
    view: 'list',
    icon: 'oi oi-transfer',
    color: 'bg-warning/10 text-warning',
  },
  {
    label: 'Accounting',
    model: 'account.move',
    view: 'list',
    icon: 'oi oi-numpad',
    color: 'bg-accent-bright/10 text-accent-bright',
  },
  {
    label: 'Pipeline',
    model: 'crm.lead',
    view: 'kanban',
    icon: 'oi oi-view-kanban',
    color: 'bg-rose-500/10 text-rose-500',
    domain: [['type', '=', 'opportunity']],
  },
  {
    label: 'Purchase',
    model: 'purchase.order',
    view: 'kanban',
    icon: 'oi oi-shopping-cart',
    color: 'bg-amber-500/10 text-amber-500',
    domain: [['state', 'in', ['draft', 'sent', 'to approve']]],
  },
  {
    label: 'Projects',
    model: 'project.task',
    view: 'kanban',
    icon: 'oi oi-project',
    color: 'bg-sky-500/10 text-sky-500',
  },
]

const STAGE_STATS = [
  {
    model: 'crm.lead',
    domain: [['type', '=', 'opportunity']],
    groupField: 'stage_id',
    label: 'Pipeline by Stage',
  },
  { model: 'sale.order', domain: [], groupField: 'state', label: 'Orders by State' },
  {
    model: 'purchase.order',
    domain: [],
    groupField: 'state',
    label: 'Purchase Orders by State',
  },
]

const RECENT_MODELS = [
  {
    model: 'crm.lead',
    domain: [['type', '=', 'opportunity']],
    fields: ['name', 'partner_id', 'stage_id', 'create_date'],
    label: 'Recent Opportunities',
  },
  {
    model: 'sale.order',
    domain: [],
    fields: ['name', 'partner_id', 'state', 'amount_total'],
    label: 'Recent Orders',
  },
  {
    model: 'project.task',
    domain: [['is_closed', '=', false]],
    fields: ['name', 'project_id', 'stage_id', 'priority'],
    label: 'Open Tasks',
  },
]

function StatCard({ model, domain, label }: { model: string; domain: unknown[]; label: string }) {
  const { data: count } = useQuery({
    queryKey: ['odoo', 'count', model, domain, 'dashboard'],
    queryFn: () => callKw<number>(model, 'search_count', [domain]),
    staleTime: 60_000,
  })

  return (
    <div className="flex flex-col rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-border-default">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="mt-1 text-2xl font-bold text-text-primary">
        {count != null ? count.toLocaleString() : '—'}
      </span>
    </div>
  )
}

function StageBarChart({
  model,
  domain,
  groupField,
  label,
}: {
  model: string
  domain: unknown[]
  groupField: string
  label: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['odoo', 'dashboard', 'stages', model, domain, groupField],
    queryFn: () =>
      readGroup<ReadGroupResult[]>(model, domain, [groupField, '__count'], [groupField], 0, 0),
    staleTime: 60_000,
  })

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-surface/50" />

  const groups = data ?? []
  const maxCount = Math.max(...groups.map((g) => Number(g.__count ?? 0)), 1)

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <h4 className="mb-3 text-xs font-semibold text-text-secondary">{label}</h4>
      <div className="space-y-2">
        {groups.map((g) => {
          const name = String(g[groupField] ?? 'Unknown')
          const count = Number(g.__count ?? 0)
          const pct = (count / maxCount) * 100
          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-text-primary" title={name}>
                {name}
              </span>
              <div className="flex-1">
                <div
                  className="h-5 rounded bg-accent/20 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-text-primary">{count}</span>
            </div>
          )
        })}
        {groups.length === 0 && <div className="text-xs text-text-muted">No data</div>}
      </div>
    </div>
  )
}

function RecentRecords({
  model,
  domain,
  fields,
  label,
}: {
  model: string
  domain: unknown[]
  fields: string[]
  label: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['odoo', 'dashboard', 'recent', model, domain],
    queryFn: () =>
      callKw<Record<string, unknown>[]>(model, 'search_read', [domain, fields], {
        order: 'create_date desc',
        limit: 5,
      }),
    staleTime: 60_000,
  })

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-surface/50" />

  const records = data ?? []

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <h4 className="mb-3 text-xs font-semibold text-text-secondary">{label}</h4>
      <div className="space-y-1">
        {records.map((rec) => (
          <div
            key={rec.id as number}
            className="flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors hover:bg-hover/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-medium text-text-primary">
                {String(rec[fields[0]] ?? '')}
              </span>
              {fields[1] && rec[fields[1]] != null && (
                <span className="shrink-0 text-text-muted">
                  — {String(rec[fields[1]] as unknown)}
                </span>
              )}
            </div>
            {fields[2] && rec[fields[2]] != null && (
              <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                {String(rec[fields[2]] as unknown)}
              </span>
            )}
          </div>
        ))}
        {records.length === 0 && <div className="text-xs text-text-muted">No records</div>}
      </div>
    </div>
  )
}

const OVERVIEW_STATS = [
  { model: 'crm.lead', domain: [['type', '=', 'lead']], label: 'Leads' },
  { model: 'crm.lead', domain: [['type', '=', 'opportunity']], label: 'Opportunities' },
  { model: 'sale.order', domain: [], label: 'Sale Orders' },
  {
    model: 'purchase.order',
    domain: [['state', 'in', ['draft', 'sent', 'to approve']]],
    label: 'RFQs',
  },
  { model: 'purchase.order', domain: [['state', '=', 'purchase']], label: 'Purchase Orders' },
  { model: 'project.task', domain: [['is_closed', '=', false]], label: 'Open Tasks' },
  { model: 'stock.picking', domain: [], label: 'Pickings' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, session } = useAuth()
  const homeModel = useMemo(() => {
    const homeActionId = Number(session.home_action_id)
    return homeActionId && homeActionId !== 0 ? null : 'res.partner'
  }, [session.home_action_id])

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-md rounded-lg border border-border-default bg-surface p-6 text-center">
          <p className="mb-3 text-sm text-text-secondary">
            Not authenticated. Connect to an Odoo database to get started.
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent"
          >
            Connect to Odoo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface/50 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">Dashboard</span>
          <span className="text-xs text-text-muted">{session.db}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString()}
          <span className="ml-2">{session.name ?? session.username}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard
                  key={`${action.model}-${action.view}-${action.label}`}
                  action={action}
                />
              ))}
            </div>
          </div>

          {/* Overview Stats */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Overview</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {OVERVIEW_STATS.map((stat) => (
                <StatCard
                  key={`${stat.model}-${stat.label}`}
                  model={stat.model}
                  domain={stat.domain}
                  label={stat.label}
                />
              ))}
            </div>
          </div>

          {/* Stage Distribution Charts */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-text-secondary" />
              <h3 className="text-sm font-semibold text-text-primary">Distribution</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STAGE_STATS.map((s) => (
                <StageBarChart
                  key={`${s.model}-${s.groupField}`}
                  model={s.model}
                  domain={s.domain}
                  groupField={s.groupField}
                  label={s.label}
                />
              ))}
            </div>
          </div>

          {/* Recent Records */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Recent Activity</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {RECENT_MODELS.map((r) => (
                <RecentRecords
                  key={r.model}
                  model={r.model}
                  domain={r.domain}
                  fields={r.fields}
                  label={r.label}
                />
              ))}
            </div>
          </div>

          {homeModel && (
            <div className="rounded-lg border border-border-subtle bg-surface p-4 text-center">
              <span className="text-xs text-text-muted">
                Your home app is {homeModel}.{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/web', search: { model: homeModel } })}
                  className="text-accent underline"
                >
                  Open
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const navigate = useNavigate()
  const { data: count } = useQuery({
    queryKey: ['odoo', 'count', action.model, action.domain, 'quick-action'],
    queryFn: () => callKw<number>(action.model, 'search_count', [action.domain ?? []]),
    staleTime: 60_000,
  })

  return (
    <button
      type="button"
      onClick={() =>
        navigate({
          to: '/web',
          search: { model: action.model, viewType: action.view },
        })
      }
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-border-default hover:bg-surface/80"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
        <i className={`${action.icon} text-lg`} />
      </div>
      <span className="text-xs font-medium text-text-primary">{action.label}</span>
      {count != null && (
        <span className="text-[10px] text-text-muted">{count.toLocaleString()}</span>
      )}
    </button>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: requireAuth,
})
