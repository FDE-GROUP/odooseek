import {
  callKw,
  fetchMenus,
  getAppSections,
  getApps,
  type MenusData,
  type OdooMenuEntry,
} from '@odooseek/odoo-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GripVertical, Search, X } from '@/lib/lucide-icons'
import { useHomeMenu } from '../hooks/useHomeMenu'
import { useAuth } from '../lib/auth'
import { menuEntryFromOdoo, navigateMenuEntry } from '../lib/menu-navigation'
import '../styles/odoo-icons.css'

const ICON_FALLBACK: Record<string, string> = {
  CRM: 'oi oi-suitcase',
  Sales: 'oi oi-suitcase-plus',
  Inventory: 'oi oi-transfer',
  Invoicing: 'oi oi-numpad',
  Accounting: 'oi oi-numpad',
  Purchase: 'oi oi-panel-right',
  Contacts: 'oi oi-users',
  Project: 'oi oi-star-plus',
  Discuss: 'oi oi-activity',
  Settings: 'oi oi-settings-adjust',
  Apps: 'oi oi-apps',
  Employees: 'oi oi-user-profile',
  'Human Resources': 'oi oi-user-profile',
  Events: 'oi oi-schedule-today',
  Calendar: 'oi oi-schedule-today',
  Products: 'oi oi-cube',
  Manufacturing: 'oi oi-wrench',
  Attendance: 'oi oi-timer',
}

function getAppIconClass(app: OdooMenuEntry): string | null {
  if (ICON_FALLBACK[app.name]) return ICON_FALLBACK[app.name]
  for (const name of Object.keys(ICON_FALLBACK)) {
    if (app.name.toLowerCase().includes(name.toLowerCase())) return ICON_FALLBACK[name]
  }
  return null
}

export function HomeMenuOverlay() {
  const { isOpen, close } = useHomeMenu()
  const navigate = useNavigate()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const { data: menus } = useQuery<MenusData>({
    queryKey: ['odoo', 'menus'],
    queryFn: fetchMenus,
    staleTime: 5 * 60_000,
    enabled: isOpen,
  })

  const uid = session?.uid

  // Load saved app order
  const { data: savedOrder } = useQuery<number[]>({
    queryKey: ['odoo', 'homemenu_config'],
    queryFn: async () => {
      if (!uid) return []
      const users = await callKw<Array<{ homemenu_config: string }>>('res.users', 'read', [
        [uid],
        ['homemenu_config'],
      ])
      const config = users?.[0]?.homemenu_config
      if (!config) return []
      try {
        const parsed = JSON.parse(config)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    },
    enabled: isOpen && !!uid,
  })

  // Sort apps by saved order
  const sortedApps = useMemo(() => {
    if (!menus) return []
    const apps = getApps(menus)
    if (!savedOrder || savedOrder.length === 0) return apps
    const orderMap = new Map(savedOrder.map((id, i) => [id, i]))
    return [...apps].sort((a, b) => {
      const ai = orderMap.get(a.id as number) ?? Number.MAX_SAFE_INTEGER
      const bi = orderMap.get(b.id as number) ?? Number.MAX_SAFE_INTEGER
      return ai - bi
    })
  }, [menus, savedOrder])

  // Filter by search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return sortedApps
    const q = searchQuery.toLowerCase()
    return sortedApps.filter((app) => app.name.toLowerCase().includes(q))
  }, [sortedApps, searchQuery])

  // Persist app order
  const saveOrderMutation = useMutation({
    mutationFn: (order: number[]) => {
      if (!uid) return Promise.resolve()
      return callKw('res.users', 'write', [[uid], { homemenu_config: JSON.stringify(order) }])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odoo', 'homemenu_config'] })
    },
  })

  const handleAppClick = useCallback(
    (app: OdooMenuEntry) => {
      close()
      if (
        navigateMenuEntry(navigate, menuEntryFromOdoo(app, app.children.length), {
          context: 'app-root',
          menus,
        })
      ) {
        return
      }
      if (menus && app.children.length > 0) {
        const sections = getAppSections(menus, app.id as number)
        const firstWithAction = sections.find((s) => s.actionID)
        if (firstWithAction?.actionID) {
          navigateMenuEntry(
            navigate,
            menuEntryFromOdoo(firstWithAction, firstWithAction.children.length),
            {
              context: 'menu-leaf',
              menus,
            },
          )
        }
      }
    },
    [close, navigate, menus],
  )

  const handleReorder = useCallback(
    (from: number, to: number) => {
      const newOrder = [...sortedApps]
      const [moved] = newOrder.splice(from, 1)
      newOrder.splice(to, 0, moved)
      saveOrderMutation.mutate(newOrder.map((a) => a.id as number))
    },
    [sortedApps, saveOrderMutation],
  )

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setFocusIndex(0)
      setSearchQuery('')
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in search input
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.preventDefault()
          close()
        }
        return
      }
      const cols = getGridColumns()
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusIndex((i) => Math.min(i + 1, filteredApps.length - 1))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusIndex((i) => Math.max(i - 1, 0))
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusIndex((i) => Math.min(i + cols, filteredApps.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusIndex((i) => Math.max(i - cols, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredApps[focusIndex]) handleAppClick(filteredApps[focusIndex])
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, filteredApps, focusIndex, handleAppClick, close])

  if (!isOpen || !menus) return null

  return createPortal(
    <div className="fixed inset-0 z-[55] flex flex-col bg-root/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-8 py-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setFocusIndex(0)
            }}
            placeholder="Search apps..."
            className="w-full rounded-lg border border-border-default bg-surface pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            // biome-ignore lint/a11y/noAutofocus: intentional focus for immediate user interaction
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={close}
          className="ml-4 rounded-lg p-2 text-text-secondary hover:bg-hover hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* App Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto p-8">
        {filteredApps.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {searchQuery ? 'No matching apps' : 'No applications available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {filteredApps.map((app, index) => (
              <AppTile
                key={String(app.id)}
                app={app}
                index={index}
                focused={index === focusIndex}
                isDragging={dragIndex === index}
                isDragOver={dragIndex !== null && dragIndex !== index}
                onClick={() => handleAppClick(app)}
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== index) {
                    handleReorder(dragIndex, index)
                  }
                  setDragIndex(null)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function getGridColumns(): number {
  if (typeof window === 'undefined') return 4
  if (window.innerWidth >= 1280) return 8
  if (window.innerWidth >= 1024) return 6
  if (window.innerWidth >= 768) return 4
  if (window.innerWidth >= 640) return 3
  return 2
}

function AppTile({
  app,
  index,
  focused,
  isDragging,
  isDragOver,
  onClick,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  app: OdooMenuEntry
  index: number
  focused: boolean
  isDragging: boolean
  isDragOver: boolean
  onClick: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
}) {
  const iconClass = getAppIconClass(app)

  return (
    <button
      type="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(index))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.currentTarget.click()
        }
      }}
      className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border p-6 transition-all ${
        focused
          ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
          : isDragging
            ? 'border-border-default bg-surface/30 opacity-50'
            : isDragOver
              ? 'border-accent/50 bg-accent/5'
              : 'border-border-subtle bg-surface/50 hover:border-border-default hover:bg-surface'
      }`}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1 cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-3.5 w-3.5 text-text-muted" />
      </div>

      {/* App Icon */}
      {app.webIconData ? (
        <img src={app.webIconData} alt={app.name} className="h-12 w-12 rounded-lg object-contain" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {iconClass ? (
            <i className={`${iconClass} text-xl`} />
          ) : (
            <span className="text-xl font-semibold">{app.name[0]}</span>
          )}
        </div>
      )}

      <span className="text-sm font-medium text-text-primary text-center leading-tight">
        {app.name}
      </span>
    </button>
  )
}
