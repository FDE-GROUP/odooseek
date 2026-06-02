import type { OdooAction, OdooActivityData, OdooActivityTypeInfo } from '@odooseek/odoo-client'
import { callKw } from '@odooseek/odoo-client'

/** Odoo activity view: only records that have (or had) mail activities. */
export const ACTIVITY_RECORD_FILTER: [string, string, boolean[]] = [
  'activity_ids.active',
  'in',
  [true, false],
]

export function activityDomainForModel(
  domain: unknown[],
  fields: Record<string, { name?: string } | undefined>,
): unknown[] {
  if ('activity_ids' in fields) {
    return [...domain, ACTIVITY_RECORD_FILTER]
  }
  return domain
}

/** Load column headers when `get_activity_data` is missing or failed. */
export async function fetchActivityTypesForModel(
  resModel: string,
  context?: Record<string, unknown>,
): Promise<OdooActivityTypeInfo[]> {
  const rows = await callKw<Array<{ id: number; name: string }>>(
    'mail.activity.type',
    'search_read',
    [
      ['|', ['res_model', '=', resModel], ['res_model', '=', false], ['active', '=', true]],
      ['id', 'name'],
    ],
    {
      offset: 0,
      limit: 200,
      order: 'sequence, id',
      context: context ?? {},
    },
  )
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    template_ids: [],
  }))
}

export async function fetchActivityDataForModel(
  resModel: string,
  domain: unknown[],
  context?: Record<string, unknown>,
): Promise<OdooActivityData> {
  const kwargs = {
    res_model: resModel,
    limit: 100,
    offset: 0,
    fetch_done: false,
    context: context ?? {},
  }
  try {
    return await callKw<OdooActivityData>('mail.activity', 'get_activity_data', [], {
      ...kwargs,
      domain,
    })
  } catch (firstError) {
    const hasActivityFilter = domain.some(
      (clause) =>
        Array.isArray(clause) && clause.length === 3 && clause[0] === 'activity_ids.active',
    )
    if (!hasActivityFilter) throw firstError
    return callKw<OdooActivityData>('mail.activity', 'get_activity_data', [], {
      ...kwargs,
      domain: domain.filter(
        (clause) =>
          !(Array.isArray(clause) && clause.length === 3 && clause[0] === 'activity_ids.active'),
      ),
    })
  }
}

/** Transient models opened as dialogs must be created before the form loads. */
export const ACTIVITY_DIALOG_WIZARD_MODELS = new Set(['mail.activity.schedule'])

export function parseActionContext(context: OdooAction['context']): Record<string, unknown> {
  if (!context) return {}
  if (typeof context === 'object') return { ...context }
  if (typeof context === 'string') {
    try {
      const parsed = JSON.parse(context.replace(/'/g, '"')) as Record<string, unknown>
      return parsed ?? {}
    } catch {
      return {}
    }
  }
  return {}
}

export function mailActivityFormAction(opts: {
  resModel: string
  resId: number
  activityTypeId?: number
  activityId?: number
  title?: string
}): OdooAction {
  const context: Record<string, unknown> = {
    default_res_model: opts.resModel,
    default_res_id: opts.resId,
  }
  if (opts.activityTypeId != null) {
    context.default_activity_type_id = opts.activityTypeId
  }
  return {
    type: 'ir.actions.act_window',
    name: opts.title ?? 'Schedule Activity',
    res_model: 'mail.activity',
    view_mode: 'form',
    views: [[false, 'form']],
    target: 'new',
    res_id: opts.activityId,
    context,
  }
}

export function mailActivityScheduleAction(opts: {
  resModel: string
  resIds: number[]
  activityTypeId?: number
  title?: string
}): OdooAction {
  const context: Record<string, unknown> = {
    active_model: opts.resModel,
    active_ids: opts.resIds,
    active_id: opts.resIds[0],
  }
  if (opts.activityTypeId != null) {
    context.default_activity_type_id = opts.activityTypeId
  }
  const multi = opts.resIds.length > 1
  return {
    type: 'ir.actions.act_window',
    name: opts.title ?? (multi ? 'Schedule Activity On Selected Records' : 'Schedule Activity'),
    res_model: 'mail.activity.schedule',
    view_mode: 'form',
    views: [[false, 'form']],
    target: 'new',
    context,
  }
}
