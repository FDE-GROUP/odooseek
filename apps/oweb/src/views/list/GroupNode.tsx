import type { ListColumn, OdooFieldMeta, ReadGroupResult, ViewField } from '@odooseek/odoo-client'
import { callKw, getDecorationClass, renderCell } from '@odooseek/odoo-client'
import React from 'react'
import { ChevronRight } from '@/lib/lucide-icons'
import { isNonField } from './listUtils'

interface GroupNodeProps {
  path: string
  group: ReadGroupResult | Record<string, unknown>
  depth: number
  visibleColumns: ListColumn[]
  fields: Record<string, OdooFieldMeta>
  groupBy: readonly string[]
  fieldColumnNames: readonly string[]
  model: string
  selectedIds: Set<number>
  expandedGroups: Set<string>
  groupQueryMap: Map<string, { data: unknown; isLoading: boolean }>
  groupLimit: number
  decorations: Record<string, string>
  groupDelete: boolean
  isEditable: boolean
  noOpen: boolean
  onRowClick?: (recordId: number) => void
  toggleGroupExpand: (path: string) => void
  toggleRow: (id: number, shiftKey: boolean, index: number) => void
  handleRowClick: (record: Record<string, unknown>) => void
  setGroupExtraLimits: React.Dispatch<React.SetStateAction<Record<string, number>>>
  confirmDialog: (opts: {
    title: string
    message: string
    confirmLabel: string
    variant: 'warning' | 'danger' | 'default'
    onConfirm: () => void
  }) => void
  invalidateList: () => void
}

function renderListCellContent(content: unknown): React.ReactNode {
  if (content && typeof content === 'object' && 'src' in (content as Record<string, unknown>)) {
    const img = content as { src: string }
    return <img src={img.src} alt="" className="h-8 w-8 rounded object-cover" loading="lazy" />
  }
  return content as React.ReactNode
}

export function GroupNode({
  path,
  group,
  depth,
  visibleColumns,
  fields,
  groupBy,
  fieldColumnNames,
  model,
  selectedIds,
  expandedGroups,
  groupQueryMap,
  groupLimit,
  decorations,
  groupDelete,
  isEditable,
  noOpen,
  onRowClick,
  toggleGroupExpand,
  toggleRow,
  handleRowClick,
  setGroupExtraLimits,
  confirmDialog,
  invalidateList,
}: GroupNodeProps) {
  const isExpanded = expandedGroups.has(path)
  const queryResult = groupQueryMap.get(path)
  const groupRecords = queryResult?.data as Array<Record<string, unknown>> | undefined
  const subGroups = queryResult?.data as ReadGroupResult[] | undefined
  const isLeaf = depth >= groupBy.length - 1
  const countKey = `${fieldColumnNames[0] ?? 'id'}_count`
  const count = (group as Record<string, unknown>)[countKey] ?? 0
  const indent = depth * 24

  return (
    <React.Fragment key={`g-${path}`}>
      <tr
        onClick={() => toggleGroupExpand(path)}
        className="border-b border-border-subtle bg-surface/30 transition-colors hover:bg-hover/30 cursor-pointer"
      >
        <td className="w-10 px-2 py-2">
          <div className="flex items-center" style={{ paddingLeft: indent }}>
            <ChevronRight
              className={`h-3.5 w-3.5 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </div>
        </td>
        {visibleColumns.map((col, ci) => {
          if (isNonField(col)) return <td key={`gd-${ci}`} className="px-2 py-2" />
          const vf = col as ViewField
          const isGroupField = groupBy[depth] === vf.name
          const val = (group as Record<string, unknown>)[vf.name]
          const meta = fields[vf.name]
          return (
            <td
              key={`gd-${vf.name}-${ci}`}
              className="whitespace-nowrap px-4 py-2 text-sm text-text-primary"
            >
              {isGroupField ? (
                <>
                  <span className="font-medium">
                    {renderListCellContent(renderCell(val, meta, model))}
                  </span>
                  <span className="ml-1.5 rounded bg-hover px-1 py-0.5 text-[10px] text-text-muted">
                    {String(count)}
                  </span>
                  {groupDelete && meta?.type === 'many2one' && Array.isArray(val) && val[0] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDialog({
                          title: 'Delete Group',
                          message: `Remove the group "${val[1]}"? This will not delete the underlying records.`,
                          confirmLabel: 'Delete',
                          variant: 'danger',
                          onConfirm: () => callKw(model, 'unlink', [[val[0]]]).then(invalidateList),
                        })
                      }}
                      className="ml-2 rounded px-1 py-0 text-[10px] text-text-muted hover:text-danger"
                    >
                      ×
                    </button>
                  )}
                </>
              ) : (
                <span className="text-text-muted">
                  {val !== undefined && val !== null
                    ? renderListCellContent(renderCell(val, meta, model))
                    : ''}
                </span>
              )}
            </td>
          )
        })}
      </tr>
      {isExpanded &&
        !isLeaf &&
        subGroups != null &&
        subGroups.length > 0 &&
        subGroups.map((sg, si) => (
          <GroupNode
            key={`g-${path}-${si}`}
            path={`${path}-${si}`}
            group={sg}
            depth={depth + 1}
            visibleColumns={visibleColumns}
            fields={fields}
            groupBy={groupBy}
            fieldColumnNames={fieldColumnNames}
            model={model}
            selectedIds={selectedIds}
            expandedGroups={expandedGroups}
            groupQueryMap={groupQueryMap}
            groupLimit={groupLimit}
            decorations={decorations}
            groupDelete={groupDelete}
            isEditable={isEditable}
            noOpen={noOpen}
            onRowClick={onRowClick}
            toggleGroupExpand={toggleGroupExpand}
            toggleRow={toggleRow}
            handleRowClick={handleRowClick}
            setGroupExtraLimits={setGroupExtraLimits}
            confirmDialog={confirmDialog}
            invalidateList={invalidateList}
          />
        ))}
      {isExpanded &&
        isLeaf &&
        groupRecords != null &&
        groupRecords.length > 0 &&
        groupRecords.map((record) => {
          const recordId = record.id as number
          const rowDeco = getDecorationClass(
            decorations as unknown as Record<string, unknown>,
            record,
          )
          return (
            <tr
              key={`gr-${path}-${recordId}`}
              onClick={() => handleRowClick(record)}
              className={[
                'border-b border-border-subtle bg-root/50 transition-colors hover:bg-hover/50',
                selectedIds.has(recordId) ? 'bg-accent/5' : '',
                !isEditable && onRowClick && !noOpen ? 'cursor-pointer' : '',
                rowDeco,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* biome-ignore lint/a11y/noStaticElementInteractions: checkbox cell */}
              <td
                role="presentation"
                className="w-10 px-2 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(recordId)}
                  onChange={() => toggleRow(recordId, false, 0)}
                  className="h-4 w-4 cursor-pointer rounded accent-accent"
                />
              </td>
              {visibleColumns.map((col, ci) => {
                if (isNonField(col))
                  return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: button cell
                    <td
                      role="presentation"
                      key={`grd-${ci}`}
                      className="px-2 py-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                const vf = col as ViewField
                const cellDeco = getDecorationClass(
                  vf as unknown as Record<string, unknown>,
                  record,
                )
                return (
                  <td
                    key={`grd-${vf.name}-${ci}`}
                    className={['whitespace-nowrap px-4 py-2 text-sm text-text-primary', cellDeco]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {renderListCellContent(
                      renderCell(record[vf.name], fields[vf.name], model, record.id as number),
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      {isExpanded && isLeaf && groupRecords && groupRecords.length >= groupLimit && (
        <tr>
          <td colSpan={visibleColumns.length + 1} className="px-4 py-1 text-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setGroupExtraLimits((prev) => ({ ...prev, [path]: (prev[path] ?? 0) + groupLimit }))
              }}
              className="text-[10px] text-accent hover:underline"
            >
              Load more...
            </button>
          </td>
        </tr>
      )}
      {isExpanded && !queryResult?.data && (
        <tr>
          <td
            colSpan={visibleColumns.length + 1}
            className="px-4 py-2 text-center text-xs text-text-muted"
          >
            <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}
