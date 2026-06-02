import type { OdooAction, ViewType } from '@odooseek/odoo-client'
import {
  defaultViewTypeFromActWindow,
  loadAction,
  orderedViewTypesFromActWindow,
  parseDomainString,
  resolveAction,
} from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export interface UseActWindowDefaultsOptions {
  actionId?: number
  actionXmlId?: string
  fallbackViewType?: ViewType
  enabled?: boolean
}

function parseActionContext(context: OdooAction['context']): Record<string, unknown> {
  if (typeof context === 'object' && context !== null) return context
  return {}
}

function parseActionDomain(domain: OdooAction['domain']): unknown[] | undefined {
  if (Array.isArray(domain)) return domain
  if (typeof domain === 'string') return parseDomainString(domain) ?? []
  return undefined
}

function viewSettingsFromAction(action: OdooAction) {
  const viewTypes = orderedViewTypesFromActWindow(action.view_mode, action.views)
  return {
    viewTypes,
    defaultViewType: defaultViewTypeFromActWindow(action.view_mode, action.views),
    domain: parseActionDomain(action.domain),
    context: parseActionContext(action.context),
    resId: typeof action.res_id === 'number' && action.res_id > 0 ? action.res_id : undefined,
  }
}

/** Load act_window defaults (view_mode order, domain, context) for dedicated module routes. */
export function useActWindowDefaults({
  actionId,
  actionXmlId,
  fallbackViewType = 'list',
  enabled = true,
}: UseActWindowDefaultsOptions) {
  const actionRef = actionXmlId ?? actionId

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['odoo', 'act_window', actionXmlId ?? actionId],
    queryFn: async () => {
      if (actionXmlId) {
        const action = await loadAction(actionXmlId)
        return viewSettingsFromAction(action)
      }
      if (actionId != null) {
        const resolved = await resolveAction(actionId)
        return {
          viewTypes: resolved.viewTypes,
          defaultViewType: resolved.defaultViewType,
          domain: resolved.domain,
          context: resolved.context,
          resId: resolved.resId,
        }
      }
      throw new Error('actionId or actionXmlId required')
    },
    enabled: enabled && actionRef != null,
    staleTime: 15 * 60_000,
    retry: false,
  })

  const availableViews = useMemo(
    () => (data?.viewTypes?.length ? data.viewTypes : undefined),
    [data?.viewTypes],
  )

  return {
    availableViews,
    defaultViewType: data?.defaultViewType ?? fallbackViewType,
    domain: data?.domain,
    context: data?.context,
    resId: data?.resId,
    isLoading,
    isError,
    error,
  }
}
