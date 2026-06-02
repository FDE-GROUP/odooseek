import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth, useHasGroup } from '../lib/auth'
import { HR_EMPLOYEE_MODEL, HR_EMPLOYEES_SEARCH_DEFAULT } from '../lib/hr'

function SettingsPage() {
  const { session } = useAuth()
  const isHrUser = useHasGroup('hr.group_hr_user')
  const isHrManager = useHasGroup('hr.group_hr_manager')
  const isHrOfficer = isHrUser || isHrManager

  const { data: modules } = useQuery({
    queryKey: ['odoo', 'installed-modules'],
    queryFn: async () => {
      const res = await fetch('/api/session/modules', { credentials: 'include' })
      if (!res.ok) return []
      return (await res.json()) as string[]
    },
    staleTime: 60_000,
  })

  const { data: langList } = useQuery({
    queryKey: ['odoo', 'languages'],
    queryFn: async () => {
      const res = await fetch('/api/session/languages')
      if (!res.ok) return []
      return (await res.json()) as [string, string][]
    },
    staleTime: 60_000,
  })

  const companies = session.user_companies as
    | [number, string][]
    | { allowed_companies: Array<{ id: number; name: string }> }
    | undefined
  const companyList: Array<{ id: number; name: string }> = Array.isArray(companies)
    ? companies.map(([id, name]) => ({ id, name }))
    : Array.isArray((companies as Record<string, unknown>)?.allowed_companies)
      ? ((companies as Record<string, unknown>).allowed_companies as Array<{
          id: number
          name: string
        }>)
      : []

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <h2 className="mb-6 text-xl font-semibold text-text-primary">Settings</h2>

          <div className="space-y-4">
            {/* User Profile */}
            <Section title="User Profile">
              <KVRow label="Name" value={session.name} />
              <KVRow label="Username" value={session.username} />
              <KVRow label="User ID" value={session.uid} />
              <KVRow label="Partner" value={session.partner_display_name} />
              <KVRow
                label="Language"
                value={(session.user_context as Record<string, string>)?.lang ?? 'en_US'}
              />
              <KVRow
                label="Timezone"
                value={(session.user_context as Record<string, string>)?.tz ?? 'UTC'}
              />
              <KVRow label="Admin" value={session.is_admin ? 'Yes' : 'No'} />
              <KVRow label="System" value={session.is_system ? 'Yes' : 'No'} />
            </Section>

            {/* Odoo Server */}
            <Section title="Odoo Server">
              <KVRow label="Database" value={session.db} />
              <KVRow label="Version" value={session.server_version} />
              <KVRow label="Web Base URL" value={session.web_base_url} />
              <KVRow
                label="Max Upload Size"
                value={
                  session.max_file_upload_size
                    ? `${(session.max_file_upload_size / 1024 / 1024).toFixed(0)} MB`
                    : undefined
                }
              />
              <KVRow label="Active IDs Limit" value={session.active_ids_limit} />
            </Section>

            {/* Companies */}
            {companyList.length > 0 && (
              <Section title={`Companies (${companyList.length})`}>
                <div className="flex flex-wrap gap-2">
                  {companyList.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-[11px] text-text-secondary"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Installed Modules */}
            {modules && modules.length > 0 && (
              <Section title={`Installed Modules (${modules.length})`}>
                <div className="max-h-60 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {modules.map((name) => (
                      <span
                        key={name}
                        className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[11px] text-text-secondary"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Languages */}
            {langList && langList.length > 0 && (
              <Section title={`Languages (${langList.length})`}>
                <div className="flex flex-wrap gap-2">
                  {langList.map(([code, name]) => (
                    <span
                      key={code}
                      className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-[11px] text-text-secondary"
                    >
                      {name} ({code})
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Human Resources */}
            {modules?.includes('hr') && (
              <Section title="Human Resources">
                <KVRow label="Module" value="hr (installed)" />
                <KVRow label="HR access" value={isHrOfficer ? 'Yes' : 'No'} />
                <KVRow label="Employee model" value={HR_EMPLOYEE_MODEL} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/hr/employees"
                    search={HR_EMPLOYEES_SEARCH_DEFAULT}
                    className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary"
                  >
                    Open Employees
                  </Link>
                  <Link
                    to="/hr/directory"
                    className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary"
                  >
                    Open Directory
                  </Link>
                </div>
              </Section>
            )}

            {/* Appearance */}
            <Section title="Appearance">
              <ThemeToggle />
            </Section>

            {/* Technology Stack */}
            <Section title="Technology Stack">
              <div className="flex flex-wrap gap-2">
                {[
                  'React 19',
                  'TypeScript 6',
                  'TanStack Router',
                  'TanStack Query',
                  'Vite 8',
                  'Bun',
                  'Tailwind CSS 4',
                  'Rust (axum)',
                ].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-[11px] text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/50 p-5">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

function KVRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border-subtle/30 py-1.5 last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-medium text-text-primary">
        {value != null && value !== false ? String(value) : '—'}
      </span>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
