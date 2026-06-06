import {
  fetchMenus,
  getAppSections,
  getApps,
  type MenusData,
  type MenuTreeNode,
} from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslations } from 'use-intl'
import { LogIn, LogOut, Menu, Settings } from '@/lib/lucide-icons'
import { useHomeMenu } from '../hooks/useHomeMenu'
import { useAuth } from '../lib/auth'
import { isMenuEntryActive, menuEntryFromOdoo, navigateMenuEntry } from '../lib/menu-navigation'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const t = useTranslations()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const currentSearch = routerState.location.search as Record<string, unknown>
  const { isAuthenticated, session, refetch } = useAuth()
  const { toggle: toggleHomeMenu } = useHomeMenu()

  const [currentAppId, setCurrentAppId] = useState<number | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)
  const closeTimer = { current: null as ReturnType<typeof setTimeout> | null }

  const handleMouseEnter = (sectionId: number) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpenSubmenu(sectionId)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpenSubmenu(null)
    }, 200)
  }

  const { data: menus } = useQuery<MenusData>({
    queryKey: ['odoo', 'menus'],
    queryFn: fetchMenus,
    staleTime: 15 * 60_000,
    enabled: isAuthenticated,
  })

  const apps = menus ? getApps(menus) : []
  const currentApp = currentAppId ? menus?.[String(currentAppId)] : null
  const sections = currentApp && menus && currentAppId ? getAppSections(menus, currentAppId) : []

  // Detect current app from URL
  useEffect(() => {
    if (!menus) return
    // Route-based detection for hardcoded module paths
    const routeAppMap: Record<string, string> = {
      crm: 'crm',
      sale: 'sale',
      inventory: 'stock',
      accounting: 'account',
      hr: 'hr',
      event: 'event',
      calendar: 'calendar',
      product: 'product',
      mrp: 'mrp',
      attendance: 'hr_attendance',
      discuss: 'mail',
      expenses: 'expense',
      recruitment: 'recruitment',
    }
    const topSegment = currentPath.split('/')[1]
    const knownModule = routeAppMap[topSegment]
    if (knownModule) {
      // Find the app whose actionPath or xmlid contains the module name
      const app = apps.find(
        (a) =>
          a.xmlid?.startsWith(`${knownModule}.`) || (a.actionPath && a.actionPath === topSegment),
      )
      if (app) {
        setCurrentAppId(app.id as number)
        return
      }
    }

    // Action-based detection for /web?action=N URLs
    if (currentPath === '/web') {
      const actionId = currentSearch?.action as number | undefined
      if (actionId) {
        for (const app of apps) {
          if (app.actionID === actionId) {
            setCurrentAppId(app.id as number)
            return
          }
          const appSections = getAppSections(menus, app.id as number)
          if (appSections.some((s) => s.actionID === actionId)) {
            setCurrentAppId(app.id as number)
            return
          }
        }
      }
    } else {
      setCurrentAppId(null)
    }
  }, [currentPath, currentSearch, menus, apps])

  // Ctrl+H toggles HomeMenu overlay, other shortcuts navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      e.preventDefault()
      if (e.key === 'h') {
        toggleHomeMenu()
        return
      }
      const keyMap: Record<string, string> = { d: '/dashboard', ',': '/settings' }
      const target = keyMap[e.key]
      if (target) navigate({ to: target })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, toggleHomeMenu])

  // Close submenus on outside click
  // (removed — hover handles show/hide now)

  // Odoo-aligned: section buttons are dropdown containers.
  // Click → toggle dropdown if children exist; navigate if leaf with action.
  // Menus without actionID do nothing (Odoo: selectMenu → if (!actionID) return)
  const handleSectionClick = (section: MenuTreeNode) => {
    if (section.children.length > 0) {
      setOpenSubmenu(openSubmenu === section.id ? null : section.id)
      return
    }
    navigateMenuEntry(navigate, menuEntryFromOdoo(section, section.children.length), {
      context: 'menu-leaf',
      menus,
    })
  }

  const settingsActive = currentPath === '/settings'

  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-between border-b border-border-subtle bg-root px-5 py-2"
    >
      <div className="flex items-center gap-3">
        {isAuthenticated && currentApp ? (
          <button
            type="button"
            onClick={toggleHomeMenu}
            className="flex items-center gap-2 rounded-md px-1 py-1 text-[15px] font-semibold tracking-tight text-accent hover:opacity-80"
          >
            {currentApp.webIconData ? (
              <img src={currentApp.webIconData} alt="" className="h-5 w-5 rounded object-contain" />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-[10px] font-bold text-accent">
                {currentApp.name.charAt(0)}
              </span>
            )}
            <span>{currentApp.name}</span>
          </button>
        ) : (
          <Link
            to="/"
            className="text-[15px] font-semibold tracking-tight text-accent hover:opacity-80"
          >
            OdooSeek
          </Link>
        )}

        {isAuthenticated && (
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate({ to: '/menu' })}
              className={`flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                currentPath === '/' || currentPath === '/menu'
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:bg-hover hover:text-text-primary'
              }`}
            >
              <Menu className="h-4 w-4" />
            </button>

            {sections.length > 0 && (
              <div className="ml-2 flex items-center gap-0.5 border-l border-border-subtle pl-2">
                {sections.map((section) => {
                  const isActive = isMenuEntryActive(
                    menuEntryFromOdoo(section, section.children.length),
                    currentPath,
                    { action: currentSearch?.action as number | undefined },
                    menus,
                  )
                  return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: hover container
                    <div
                      key={section.id}
                      role="presentation"
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(section.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSectionClick(section)
                        }}
                        className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent/15 text-accent'
                            : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                        }`}
                      >
                        {section.name}
                      </button>

                      {openSubmenu === section.id && section.children.length > 0 && (
                        // biome-ignore lint/a11y/noStaticElementInteractions: dropdown panel
                        <div
                          role="presentation"
                          className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-border-subtle bg-surface shadow-lg"
                          onMouseEnter={() => {
                            if (closeTimer.current) {
                              clearTimeout(closeTimer.current)
                              closeTimer.current = null
                            }
                          }}
                          onMouseLeave={handleMouseLeave}
                        >
                          {section.children.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigateMenuEntry(
                                  navigate,
                                  menuEntryFromOdoo(sub, sub.children.length),
                                  {
                                    context: 'menu-leaf',
                                    menus,
                                  },
                                )
                                setOpenSubmenu(null)
                              }}
                              className="flex w-full items-center px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-hover/50"
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Link
          to="/settings"
          aria-label={t('nav.settings')}
          data-testid="nav-settings"
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            settingsActive
              ? 'bg-accent/15 text-accent'
              : 'text-text-secondary hover:bg-hover hover:text-text-primary'
          }`}
        >
          <Settings className="h-4 w-4" />
        </Link>
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            <span className="px-2.5 py-1.5 text-xs text-text-secondary">
              {session.name ?? session.username ?? t('nav.user')}
            </span>
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
              onClick={() => {
                fetch('/api/session/logout', { method: 'POST', credentials: 'include' }).then(() =>
                  refetch(),
                )
              }}
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <LogIn className="h-4 w-4" />
            <span>{t('nav.connect')}</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
