import type {
  KanbanProgressbar,
  KanbanTemplateNode,
  OdooFieldMeta,
  ViewField,
} from '@odooseek/odoo-client'
import { callKw, parseKanbanFields, parseKanbanXml, readGroup } from '@odooseek/odoo-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useConfirmDialog } from '../components/ConfirmDialog'
import { HR_EMPLOYEE_MODEL } from '../lib/hr'
import { ODOO_INDEXED_COLORS } from '../lib/odoo-colors'
import { collectKanbanFieldNames, KanbanNode } from './kanban/KanbanNode'
import { getFieldWidget, NOOP } from './widgets'
import { PresenceIconOverlay } from './widgets/PresenceIcon'

interface StageInfo {
  id: number
  name: string
  sequence: number
  fold?: boolean
}

interface KanbanRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  groupBy?: readonly string[]
  onRecordClick?: (id: number) => void
}

export function OdooKanbanRenderer({
  model,
  arch,
  fields,
  domain = [],
  groupBy: activeGroupBy,
  onRecordClick,
}: KanbanRendererProps) {
  const queryClient = useQueryClient()
  const confirmDialog = useConfirmDialog()
  const kanbanView = useMemo(() => parseKanbanXml(arch), [arch])
  const cardFields = useMemo(
    () => (kanbanView.template ? parseKanbanFields(kanbanView.template) : []),
    [kanbanView.template],
  )
  const templateNodes = kanbanView.templateNodes
  const groupBy = activeGroupBy?.[0] || kanbanView.defaultGroupBy || undefined
  const highlightColor = kanbanView.highlightColor
  const progressbar = kanbanView.progressbar
  const canOpen = kanbanView.canOpen !== false // defaults to true when undefined

  // Ensure groupBy + name + template fields (e.g. image_1024 in HR kanban aside)
  const searchFields = useMemo(() => {
    const names = new Set(kanbanView.fields)
    for (const n of collectKanbanFieldNames(templateNodes)) names.add(n)
    return [...names]
  }, [kanbanView.fields, templateNodes])
  if (groupBy && !searchFields.includes(groupBy)) searchFields.push(groupBy)
  if (!searchFields.includes('name')) searchFields.push('name')

  // 1. Fetch all records
  const { data: records, isLoading } = useQuery({
    queryKey: ['odoo', 'kanban', model, domain, groupBy],
    queryFn: () =>
      callKw<Array<Record<string, unknown>>>(model, 'search_read', [domain, searchFields], {
        limit: 200,
      }),
  })

  // 2. Fetch column headers dynamically based on the groupBy field's relation model
  const groupByFieldMeta = groupBy ? fields[groupBy] : null
  const stageModel = groupByFieldMeta?.relation

  const { data: stages } = useQuery({
    queryKey: ['odoo', 'groupby-headers', stageModel, groupBy],
    queryFn: async () => {
      if (!stageModel) return []
      return callKw<StageInfo[]>(
        stageModel,
        'search_read',
        [[], ['name', 'sequence', 'color', 'fold']],
        { order: 'sequence', limit: 100 },
      )
    },
    enabled: !!stageModel,
  })

  // 3. Group records by groupBy field (only when groupBy is set)
  const groups = useMemo(() => {
    const map = new Map<number, Record<string, unknown>[]>()
    if (!records || !groupBy) return map
    for (const r of records) {
      const stageVal = r[groupBy] as [number, string] | number | undefined
      const stageId = Array.isArray(stageVal)
        ? stageVal[0]
        : typeof stageVal === 'number'
          ? stageVal
          : 0
      if (!map.has(stageId)) map.set(stageId, [])
      map.get(stageId)?.push(r)
    }
    return map
  }, [records, groupBy])

  // Column order: follow stage sequence if available, else group IDs
  const columnOrder = useMemo(() => {
    if (!groupBy) return []
    if (stages?.length) return stages.map((s) => s.id as number)
    return [...groups.keys()].sort()
  }, [stages, groups, groupBy])

  // Stage fold support
  const [showFolded, setShowFolded] = useState(false)
  const foldedIds = useMemo(
    () => new Set((stages ?? []).filter((s) => s.fold).map((s) => s.id as number)),
    [stages],
  )
  const visibleOrder = useMemo(() => {
    if (showFolded) return columnOrder
    return columnOrder.filter((id) => !foldedIds.has(id))
  }, [columnOrder, foldedIds, showFolded])

  // 4. Fetch progressbar aggregate data (counts by progressbar field per group)
  const { data: progressbarData } = useQuery({
    queryKey: ['odoo', 'kanban-progressbar', model, domain, groupBy, progressbar?.field],
    queryFn: async () => {
      if (!progressbar || !groupBy) return {}
      const pbField = progressbar.field
      // read_group: group by groupBy, aggregate by progressbar field values
      const result = await readGroup<Array<Record<string, unknown> & { [key: string]: unknown }>>(
        model,
        domain as unknown[],
        [`${pbField}:count_array`],
        [groupBy],
        0,
        80,
      )
      // Build map: columnId -> { value: count, ... }
      const map: Record<number, Record<string, number>> = {}
      for (const row of result) {
        const colVal = row[groupBy]
        const colId = Array.isArray(colVal) ? colVal[0] : typeof colVal === 'number' ? colVal : 0
        const counts: Record<string, number> = {}
        for (const key of Object.keys(progressbar.colors)) {
          const countKey = `${pbField}_count_array`
          const arr = row[countKey]
          if (Array.isArray(arr)) {
            // read_group with :count_array returns [[value, count], ...]
            for (const pair of arr) {
              if (Array.isArray(pair) && pair[0] === key) {
                counts[key] = (pair[1] as number) || 0
              }
            }
          }
        }
        map[colId as number] = counts
      }
      return map
    },
    enabled: !!progressbar && !!groupBy && !!records,
  })

  const quickCreateMutation = useMutation({
    mutationFn: (vals: Record<string, unknown>) => callKw<number>(model, 'create', [vals]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odoo', 'kanban', model, domain, groupBy] })
    },
  })

  const handleQuickCreate = useCallback(
    (vals: Record<string, unknown>) => quickCreateMutation.mutate(vals),
    [quickCreateMutation],
  )

  const handleDragEnd = async (recordId: number, newStageId: number) => {
    if (!groupBy) return
    // Optimistic update
    queryClient.setQueryData(
      ['odoo', 'kanban', model, domain, groupBy],
      (old: Record<string, unknown>[] | undefined) => {
        if (!old) return old
        return old.map((r) => {
          if (r.id === recordId) {
            return { ...r, [groupBy]: [newStageId, ''] }
          }
          return r
        })
      },
    )

    // Server update
    await callKw(model, 'write', [[recordId], { [groupBy]: newStageId }]).catch(() => {
      queryClient.invalidateQueries({ queryKey: ['odoo', 'kanban', model, domain, groupBy] })
    })
  }

  const deleteMutation = useMutation({
    mutationFn: (recordId: number) => callKw(model, 'unlink', [[recordId]]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odoo', 'kanban', model] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (recordId: number) => callKw(model, 'action_archive', [[recordId]]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odoo', 'kanban', model] })
    },
  })

  const handleCardDelete = useCallback(
    (recordId: number) => {
      confirmDialog({
        title: 'Delete Record',
        message: 'Are you sure you want to delete this record?',
        confirmLabel: 'Delete',
        variant: 'danger',
        onConfirm: () => deleteMutation.mutate(recordId),
      })
    },
    [confirmDialog, deleteMutation],
  )

  const handleCardArchive = useCallback(
    (recordId: number) => {
      archiveMutation.mutate(recordId)
    },
    [archiveMutation],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  // Ungrouped: show cards in a responsive grid
  if (!groupBy) {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(records ?? []).map((record) => (
            <KanbanCard
              key={record.id as number}
              model={model}
              record={record}
              cardFields={cardFields}
              templateNodes={templateNodes}
              fields={fields}
              highlightColor={highlightColor}
              onClick={canOpen ? onRecordClick : undefined}
              onDelete={handleCardDelete}
              onArchive={handleCardArchive}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="kanban-scroll flex min-h-0 w-full flex-1 gap-4 overflow-x-auto p-4">
      {visibleOrder.map((colId) => {
        const colRecords = groups.get(colId) ?? []
        const stageName =
          stages?.find((s) => s.id === colId)?.name ??
          (colRecords[0]?.[groupBy] as [number, string])?.[1] ??
          `#${colId}`

        return (
          <KanbanColumn
            key={colId}
            model={model}
            stageId={colId}
            title={String(stageName)}
            count={colRecords.length}
            records={colRecords}
            cardFields={cardFields}
            templateNodes={templateNodes}
            fields={fields}
            highlightColor={highlightColor}
            progressbar={progressbar}
            progressbarCounts={progressbarData?.[colId]}
            sumField={progressbar?.sumField}
            onRecordClick={onRecordClick}
            canRecordOpen={canOpen}
            onDrop={handleDragEnd}
            onQuickCreate={handleQuickCreate}
            onDelete={handleCardDelete}
            onArchive={handleCardArchive}
            groupBy={groupBy}
          />
        )
      })}
      {foldedIds.size > 0 && (
        <button
          type="button"
          onClick={() => setShowFolded((v) => !v)}
          className="flex shrink-0 items-center self-center rounded-lg border border-border-default px-3 py-2 text-xs text-text-muted hover:bg-hover hover:text-text-primary"
        >
          {showFolded ? 'Hide empty stages' : `Show ${foldedIds.size} folded`}
        </button>
      )}
    </div>
  )
}

function KanbanColumn({
  title,
  stageId,
  count,
  records,
  cardFields,
  templateNodes,
  fields,
  highlightColor,
  progressbar,
  progressbarCounts,
  sumField,
  onRecordClick,
  canRecordOpen,
  onDrop,
  onQuickCreate,
  onDelete,
  onArchive,
  model,
  groupBy,
}: {
  title: string
  stageId: number
  count: number
  records: Record<string, unknown>[]
  cardFields: ViewField[]
  templateNodes?: KanbanTemplateNode[]
  fields: Record<string, OdooFieldMeta>
  highlightColor?: string
  progressbar?: KanbanProgressbar
  progressbarCounts?: Record<string, number>
  sumField?: string
  onRecordClick?: (id: number) => void
  canRecordOpen?: boolean
  onDrop: (recordId: number, newStageId: number) => void
  onQuickCreate?: (vals: Record<string, unknown>) => void
  onDelete?: (id: number) => void
  onArchive?: (id: number) => void
  model: string
  groupBy?: string
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const vals: Record<string, unknown> = { name: trimmed }
    if (groupBy) vals[groupBy] = stageId
    // Fetch default values from Odoo (mimics quick_create_view + default_get)
    try {
      const defaults = await callKw<Record<string, unknown>>(model, 'default_get', [[]], {})
      if (defaults) {
        for (const [k, v] of Object.entries(defaults)) {
          if (vals[k] == null && v != null && v !== false) vals[k] = v
        }
      }
    } catch {
      // default_get may fail for some models — Odoo handles defaults server-side
    }
    onQuickCreate?.(vals)
    setName('')
    setCreating(false)
  }, [name, stageId, groupBy, model, onQuickCreate])

  return (
    <div className="flex h-full min-h-0 min-w-64 flex-1 flex-col rounded-lg border border-border-subtle bg-surface/30">
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-3 py-2">
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-text-muted">
          {count}
        </span>
      </div>
      {progressbar && progressbarCounts && (
        <KanbanProgressbarBar colors={progressbar.colors} counts={progressbarCounts} />
      )}
      {sumField && records.length > 0 && <ColumnSum records={records} field={sumField} />}
      <div
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const recordId = Number(e.dataTransfer.getData('recordId'))
          if (recordId) onDrop(recordId, stageId)
        }}
      >
        {records.map((record) => (
          <KanbanCard
            key={record.id as number}
            model={model}
            record={record}
            cardFields={cardFields}
            templateNodes={templateNodes}
            fields={fields}
            highlightColor={highlightColor}
            onClick={canRecordOpen !== false ? onRecordClick : undefined}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        ))}
        {onQuickCreate &&
          (creating ? (
            <div className="flex flex-col gap-1.5 rounded-lg border border-border-default bg-surface p-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Record name..."
                className="w-full rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                  if (e.key === 'Escape') setCreating(false)
                }}
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 rounded bg-accent px-2 py-1 text-xs font-medium text-on-accent hover:opacity-90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded border border-border-default px-2 py-1 text-xs text-text-secondary hover:bg-hover/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-lg border border-dashed border-border-default px-3 py-2 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              + Add a card
            </button>
          ))}
      </div>
    </div>
  )
}

function ColumnSum({ records, field }: { records: Record<string, unknown>[]; field: string }) {
  const total = records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0)
  if (total === 0) return null
  return (
    <div className="px-3 py-0.5 text-[10px] font-medium text-text-secondary">
      ${total.toLocaleString()}
    </div>
  )
}

const PROGRESSBAR_COLOR_MAP: Record<string, string> = {
  success: 'bg-accent',
  warning: 'bg-accent-bright',
  danger: 'bg-accent-dim',
  info: 'bg-text-muted/40',
}

function KanbanProgressbarBar({
  colors,
  counts,
}: {
  colors: Record<string, string>
  counts: Record<string, number>
}) {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0)
  if (total === 0) return null

  const segments = Object.entries(colors)
    .map(([value, colorName]) => ({
      value,
      count: counts[value] || 0,
      className: PROGRESSBAR_COLOR_MAP[colorName] || 'bg-border-default',
    }))
    .filter((s) => s.count > 0)

  if (segments.length === 0) return null

  return (
    <div className="flex gap-0.5 px-3 py-1">
      {segments.map((s) => (
        <div
          key={s.value}
          className={`h-1.5 rounded-full ${s.className}`}
          style={{ width: `${(s.count / total) * 100}%` }}
          title={`${s.value}: ${s.count}`}
        />
      ))}
    </div>
  )
}

/** Collect preview_image field names from background_image widgets in a node tree. */
function collectPreviewFields(node: KanbanTemplateNode): Set<string> {
  const names = new Set<string>()
  if (node.type === 'field' && node.widget === 'background_image' && node.options) {
    const preview = (node.options as Record<string, unknown>).preview_image as string | undefined
    if (preview) names.add(preview)
  }
  // Also detect: any image_* field in the same container means avatar_* is a fallback
  if (node.type === 'field' && /^image_/.test(node.name)) {
    names.add('avatar_128')
    names.add('avatar_1024')
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      for (const name of collectPreviewFields(child)) names.add(name)
    }
  }
  return names
}

/** Remove nodes whose name is a preview target of a background_image widget elsewhere in the tree. */
function filterPreviewNodes(
  node: KanbanTemplateNode,
  previewFields: Set<string>,
): KanbanTemplateNode | null {
  if (node.type === 'field' && previewFields.has(node.name)) return null
  if ('children' in node && Array.isArray(node.children)) {
    const filtered = node.children
      .map((c) => filterPreviewNodes(c, previewFields))
      .filter((c): c is KanbanTemplateNode => c != null)
    return { ...node, children: filtered }
  }
  return node
}

function KanbanCard({
  record,
  cardFields,
  templateNodes,
  fields,
  highlightColor,
  onClick,
  onDelete,
  onArchive,
  model,
}: {
  record: Record<string, unknown>
  cardFields: ViewField[]
  templateNodes?: KanbanTemplateNode[]
  fields: Record<string, OdooFieldMeta>
  highlightColor?: string
  onClick?: (id: number) => void
  onDelete?: (id: number) => void
  onArchive?: (id: number) => void
  model: string
}) {
  const colorIdx = highlightColor ? Number(record[highlightColor]) : 0
  const borderColor =
    colorIdx > 0
      ? ODOO_INDEXED_COLORS[Math.min(colorIdx, ODOO_INDEXED_COLORS.length - 1)]
      : undefined
  const recordId = record.id as number
  const showPresence =
    model === HR_EMPLOYEE_MODEL &&
    (record.hr_presence_state != null || record.hr_icon_display != null)

  let mainNodes = templateNodes
  let asideNode: KanbanTemplateNode | undefined
  if (templateNodes && templateNodes.length > 0) {
    // Collect preview_image targets from background_image widgets
    const previewFields = new Set<string>()
    for (const node of templateNodes) {
      for (const name of collectPreviewFields(node)) previewFields.add(name)
    }

    const asideIdx = templateNodes.findIndex((n) => n.type === 'html' && n.tag === 'aside')
    if (asideIdx >= 0) {
      const rawAside = templateNodes[asideIdx]
      asideNode =
        previewFields.size > 0
          ? (filterPreviewNodes(rawAside, previewFields) ?? rawAside)
          : rawAside
      mainNodes = [...templateNodes.slice(0, asideIdx), ...templateNodes.slice(asideIdx + 1)]
    }
  }

  const content =
    mainNodes && mainNodes.length > 0 ? (
      mainNodes.map((node, i) => (
        <KanbanNode
          key={i}
          node={node}
          record={record}
          fields={fields}
          model={model}
          recordId={recordId}
        />
      ))
    ) : cardFields.length > 0 ? (
      cardFields.map((f, fi) => {
        const meta = fields[f.name]
        if (!meta) return null
        if (f.invisible && f.invisible >= 1) return null
        const Widget = getFieldWidget({ type: 'field', name: f.name, widget: f.widget }, meta.type)
        return (
          <div key={`${f.name}-${fi}`}>
            <Widget
              field={{ type: 'field', name: f.name, widget: f.widget }}
              value={record[f.name]}
              onChange={NOOP}
              readOnly
              meta={meta}
              record={record}
              model={model}
              recordId={recordId}
            />
          </div>
        )
      })
    ) : (
      <span className="text-sm font-medium text-text-primary">
        {(record.display_name || record.name) as string}
      </span>
    )

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('recordId', String(record.id))}
      onClick={() => onClick?.(recordId)}
      className="group relative cursor-pointer rounded-lg border border-border-subtle bg-surface p-3 transition-colors hover:border-border-default"
      style={borderColor ? { borderLeftWidth: 3, borderLeftColor: borderColor } : undefined}
    >
      {showPresence && (
        <div className="absolute right-2 top-8 z-[1]">
          <PresenceIconOverlay record={record} />
        </div>
      )}
      <CardActions recordId={recordId} onEdit={onClick} onDelete={onDelete} onArchive={onArchive} />
      {asideNode ? (
        <div className="flex flex-row gap-2">
          <div className="shrink-0">
            <KanbanNode
              node={asideNode}
              record={record}
              fields={fields}
              model={model}
              recordId={recordId}
            />
          </div>
          <div className="min-w-0 flex-1">{content}</div>
        </div>
      ) : (
        content
      )}
    </div>
  )
}

function CardActions({
  recordId,
  onEdit,
  onDelete,
  onArchive,
}: {
  recordId: number
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onArchive?: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="rounded p-1 text-text-muted hover:bg-hover hover:text-text-primary"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-28 rounded border border-border-subtle bg-surface py-1 shadow-lg">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(recordId)
                setOpen(false)
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
            >
              Edit
            </button>
          )}
          {onArchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onArchive(recordId)
                setOpen(false)
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
            >
              Archive
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(recordId)
                setOpen(false)
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-text-muted hover:bg-hover hover:text-text-primary"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
