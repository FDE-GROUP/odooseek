import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isRedirect, redirect } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext, useEffect } from 'react'
import { parseSessionGroups, type SessionGroups, userHasGroup } from './groups'

export interface AuthState {
  authenticated: boolean
  uid: number | null
  name: string | null
  username: string | null
  db: string | null
  is_admin: boolean
  is_system: boolean
  partner_id: number | null
  partner_display_name: string | null
  server_version: string | null
  home_action_id: number | null
  groups?: SessionGroups
  user_companies?: unknown
  web_base_url?: string
  max_file_upload_size?: number
  active_ids_limit?: number
  user_context?: { lang?: string; tz?: string; uid?: number }
}

const ANONYMOUS: AuthState = {
  authenticated: false,
  uid: null,
  name: null,
  username: null,
  db: null,
  is_admin: false,
  is_system: false,
  partner_id: null,
  partner_display_name: null,
  server_version: null,
  home_action_id: null,
  web_base_url: undefined,
  max_file_upload_size: undefined,
  active_ids_limit: undefined,
}

async function fetchSession(): Promise<AuthState> {
  const res = await fetch('/api/session', { credentials: 'include' })
  if (!res.ok) return ANONYMOUS
  const data = (await res.json()) as AuthState & { groups?: unknown }
  return {
    ...data,
    groups: parseSessionGroups(data.groups),
  }
}

const AuthContext = createContext<{
  isAuthenticated: boolean
  isLoading: boolean
  session: AuthState
  refetch: () => void
}>({
  isAuthenticated: false,
  isLoading: true,
  session: ANONYMOUS,
  refetch: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: session = ANONYMOUS, isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    const handler = () => {
      queryClient.setQueryData(['auth', 'session'], ANONYMOUS)
      const search = `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      window.location.assign(`/login${search}`)
    }
    window.addEventListener('odoo:session-expired', handler)
    return () => window.removeEventListener('odoo:session-expired', handler)
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session.authenticated,
        isLoading,
        session,
        refetch: () => {
          queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Route guard — call from `beforeLoad` to redirect unauthenticated users. */
export async function requireAuth(): Promise<void> {
  try {
    const res = await fetch('/api/session', { credentials: 'include' })
    if (!res.ok) throw redirect({ to: '/login' })
    const data = await res.json()
    if (!data.authenticated) throw redirect({ to: '/login' })
  } catch (e) {
    if (isRedirect(e)) throw e
    throw redirect({ to: '/login' })
  }
}

/** Subset of session used for XML `groups` / `hasGroup` checks. */
export type GroupCheckSession = {
  groups?: SessionGroups
  is_admin: boolean
  is_system: boolean
}

/** Check security group from session (pass from `useAuth().session` when in React). */
export function hasGroup(groupXmlId: string, session?: GroupCheckSession): boolean {
  return userHasGroup(session?.groups, groupXmlId, {
    isAdmin: session?.is_admin,
    isSystem: session?.is_system,
  })
}

export function useHasGroup(groupXmlId: string): boolean {
  const { session } = useAuth()
  return hasGroup(groupXmlId, session)
}
