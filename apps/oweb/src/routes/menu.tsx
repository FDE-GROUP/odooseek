import { fetchMenus, getApps, type MenusData, type OdooMenuEntry } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Search } from '@/lib/lucide-icons'
import { menuEntryFromOdoo, navigateMenuEntry } from '../lib/menu-navigation'

function MenuPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: menus } = useQuery<MenusData>({
    queryKey: ['odoo', 'menus'],
    queryFn: fetchMenus,
    staleTime: 5 * 60_000,
  })

  const apps = useMemo(() => {
    if (!menus) return []
    const allApps = getApps(menus)
    if (!searchQuery.trim()) return allApps
    const q = searchQuery.toLowerCase()
    return allApps.filter((app) => app.name.toLowerCase().includes(q))
  }, [menus, searchQuery])

  const handleAppClick = (app: OdooMenuEntry) => {
    navigateMenuEntry(navigate, menuEntryFromOdoo(app, app.children.length), {
      context: 'app-root',
      menus,
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" data-testid="app-menu">
      <div className="px-8 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            className="w-full rounded-lg border border-border-default bg-surface pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-0">
        {apps.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {searchQuery ? 'No matching apps' : 'No applications available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {apps.map((app) => (
              <button
                type="button"
                key={String(app.id)}
                data-testid="app-tile"
                data-app-name={app.name}
                tabIndex={0}
                onClick={() => handleAppClick(app)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.currentTarget.click()
                  }
                }}
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-border-subtle bg-surface/50 p-6 transition-all hover:border-border-default hover:bg-surface"
              >
                {app.webIconData ? (
                  <img
                    src={app.webIconData}
                    alt={app.name}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <span className="text-xl font-semibold">{app.name[0]}</span>
                  </div>
                )}
                <span className="text-center text-sm font-medium leading-tight text-text-primary">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})
