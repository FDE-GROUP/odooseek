import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { parseHierarchyXml, searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

interface HierarchyRecord {
  id: number
  display_name: string
  [key: string]: unknown
}

export function OdooHierarchyRenderer({ model, arch }: { model: string; arch: string }) {
  const hierarchyView = useMemo(() => parseHierarchyXml(arch), [arch])
  const childField = hierarchyView.childField
  const displayFields = hierarchyView.fields

  const { data: roots, isLoading } = useQuery({
    queryKey: ['odoo', 'hierarchy', model, childField],
    queryFn: () =>
      searchRead<HierarchyRecord>(
        model,
        [[childField, '=', false]],
        ['display_name', ...displayFields],
        0,
      ),
    staleTime: 30_000,
  })

  const { data: fieldMeta } = useQuery({
    queryKey: ['odoo', 'fields_get', model],
    queryFn: async () => {
      const { callKw } = await import('@odooseek/odoo-client')
      return callKw<Record<string, OdooFieldMeta>>(model, 'fields_get', [
        displayFields,
        ['string', 'type'],
      ])
    },
    staleTime: 300_000,
    enabled: displayFields.length > 0,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl">
        {roots?.map((root) => (
          <HierarchyNode
            key={root.id}
            model={model}
            record={root}
            childField={childField}
            displayFields={displayFields}
            fieldMeta={fieldMeta ?? {}}
            depth={0}
          />
        ))}
        {(!roots || roots.length === 0) && (
          <div className="py-12 text-center text-sm text-muted-foreground">No records found</div>
        )}
      </div>
    </div>
  )
}

function HierarchyNode({
  model,
  record,
  childField,
  displayFields,
  fieldMeta,
  depth,
}: {
  model: string
  record: HierarchyRecord
  childField: string
  displayFields: string[]
  fieldMeta: Record<string, OdooFieldMeta>
  depth: number
}) {
  const [expanded, setExpanded] = useState(depth < 2)

  const { data: children } = useQuery({
    queryKey: ['odoo', 'hierarchy', model, childField, record.id],
    queryFn: () =>
      searchRead<HierarchyRecord>(
        model,
        [[childField, '=', record.id]],
        ['display_name', ...displayFields],
        0,
      ),
    staleTime: 30_000,
    enabled: expanded,
  })

  const hasChildren = children && children.length > 0

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute left-3 top-0 h-full w-px bg-border-subtle"
          style={{ height: hasChildren ? '100%' : '1.5rem' }}
        />
      )}
      <div className="flex items-start gap-2 py-1">
        <button
          type="button"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${hasChildren ? 'cursor-pointer hover:bg-hover' : 'text-text-muted'}`}
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren ? (expanded ? '▼' : '▶') : '•'}
        </button>
        <div className="flex-1 rounded border border-border-subtle bg-surface px-3 py-1.5">
          <div className="text-sm font-medium text-text-primary">
            {record.display_name || record.name || `#${record.id}`}
          </div>
          {displayFields.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-secondary">
              {displayFields.map((f) => {
                const val = record[f]
                if (val == null || val === false) return null
                const display = Array.isArray(val) ? val[1] : String(val)
                return (
                  <span key={f}>
                    <span className="text-text-muted">{fieldMeta[f]?.string || f}:</span> {display}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="ml-5">
          {children.map((child) => (
            <HierarchyNode
              key={child.id}
              model={model}
              record={child}
              childField={childField}
              displayFields={displayFields}
              fieldMeta={fieldMeta}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
