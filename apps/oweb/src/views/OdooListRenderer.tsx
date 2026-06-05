import type { FieldElement, OdooFieldMeta, ReadGroupResult } from '@odooseek/odoo-client'
import {
  callKw,
  DEFAULT_COL_WIDTH,
  FIELD_TYPE_WIDTHS,
  getDecorationClass,
  isFieldValueEmpty,
  isListCellImage,
  ListModel,
  parseListXml,
  readGroup,
  renderCell,
  validateFieldValue,
} from '@odooseek/odoo-client'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { ArrowUpDown, ChevronDown, ChevronUp, Settings } from '@/lib/lucide-icons'
import { useConfirmDialog } from '../components/ConfirmDialog'
import { ExportDialog } from '../components/ExportDialog'
import { Pagination } from '../components/Pagination'
import { useDialog } from '../hooks/useDialog'
import { useListModel } from '../hooks/useListModel'
import { useRecordActions } from '../hooks/useRecordActions'
import { GroupNode } from './list/GroupNode'
import { InlineEditRow } from './list/InlineEditRow'
import { ListButtonCell } from './list/ListButtonCell'
import { computeAggregates } from './list/listAggregates'
import {
  defaultForType,
  isButtonGroup,
  isListButton,
  isNonField,
  isViewField,
  viewFieldToFieldElement,
} from './list/listUtils'
import { useColumnPrefs } from './list/useColumnPrefs'
import { getFieldWidget } from './widgets'

function renderListCellContent(content: ReturnType<typeof renderCell>): React.ReactNode {
  if (isListCellImage(content)) {
    return (
      // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative image with error fallback
      <img
        src={content.src}
        alt=""
        className="h-8 w-8 rounded object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  return content
}

interface ListRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  groupBy?: string[]
  onRowClick?: (recordId: number) => void
}

export function OdooListRenderer({
  model,
  arch,
  fields,
  domain = [],
  groupBy = [],
  onRowClick,
}: ListRendererProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const confirmDialog = useConfirmDialog()
  const { openDialog, closeDialog } = useDialog()
  const { archive: recordArchive, unarchive: recordUnarchive } = useRecordActions(model)
  const hasActiveField = 'active' in fields

  const listView = useMemo(() => parseListXml(arch), [arch])

  const listModel = useMemo(
    () => new ListModel({ defaultOrder: listView.defaultOrder, defaultLimit: listView.limit }),
    [listView.defaultOrder, listView.limit],
  )
  const snap = useListModel(listModel)

  const [newGroupName, setNewGroupName] = useState('')
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const colMenuRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const groupLimit = listView.groupsLimit ?? 80

  const {
    visibleColumns,
    allVisibleCols,
    hiddenCols,
    colWidths,
    toggleColumn,
    hasHandle,
    startResize,
  } = useColumnPrefs(model, listView, fields)

  const fieldColumnNames = visibleColumns.filter(isViewField).map((c) => c.name)
  const groupByActive = groupBy.length > 0
  const isEditable = !!listView.editable && !groupByActive

  const editableColIndices = useMemo(
    () =>
      visibleColumns
        .map((col, i) => ({ col, i }))
        .filter(({ col }) => {
          if (isNonField(col)) return false
          const meta = fields[col.name]
          return !meta?.readonly && !col.readonly
        })
        .map(({ i }) => i),
    [visibleColumns, fields],
  )

  // keyboard handler is defined below after handleInlineSave/handleInlineCancel

  const {
    data: groupedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['odoo', 'data', model, 'list', domain, groupBy, snap.offset, snap.limit, snap.order],
    queryFn: () =>
      groupByActive
        ? readGroup<ReadGroupResult[]>(model, domain, fieldColumnNames, groupBy)
        : callKw<Array<Record<string, unknown>>>(model, 'search_read', [domain, fieldColumnNames], {
            offset: snap.offset,
            limit: snap.limit,
            order: snap.order || undefined,
          }),
  })

  const handleSort = useCallback(
    (fieldName: string) => {
      listModel.sort(fieldName, tableContainerRef.current)
    },
    [listModel],
  )

  const sortIcon = useCallback(
    (fieldName: string) => {
      if (snap.order === fieldName) return <ChevronUp className="inline h-3 w-3 text-accent" />
      if (snap.order === `${fieldName} desc`)
        return <ChevronDown className="inline h-3 w-3 text-accent" />
      return <ArrowUpDown className="inline h-3 w-3 opacity-30" />
    },
    [snap.order],
  )

  const data = (groupedData ?? []) as unknown[]
  const groupData = groupByActive ? (groupedData as ReadGroupResult[] | undefined) : null

  // Restore scroll position after data loads
  useEffect(() => {
    if (!isLoading) listModel.restoreScroll(tableContainerRef.current)
  }, [isLoading, listModel])

  const aggregates = useMemo(
    () =>
      computeAggregates(
        data as Array<Record<string, unknown>>,
        visibleColumns,
        fields,
        !!groupData,
      ),
    [data, visibleColumns, fields, groupData],
  )

  const { data: totalCount } = useQuery({
    queryKey: ['odoo', 'count', model, domain],
    queryFn: async () => {
      if (listView.countLimit) {
        const ids = await callKw<number[]>(model, 'search', [domain, 0, listView.countLimit + 1])
        return ids.length > listView.countLimit ? listView.countLimit : ids.length
      }
      return callKw<number>(model, 'search_count', [domain])
    },
    enabled: !groupByActive,
    staleTime: 30_000,
  })

  const handlePageChange = useCallback(
    (newOffset: number) => {
      listModel.setPage(newOffset, tableContainerRef.current)
    },
    [listModel],
  )

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['odoo', 'data', model] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'count', model] })
  }, [queryClient, model])

  const toggleBooleanMutation = useMutation({
    mutationFn: ({ recordId, field, value }: { recordId: number; field: string; value: boolean }) =>
      callKw(model, 'write', [[recordId], { [field]: value }]),
    onSuccess: () => invalidateList(),
  })

  const createGroupMutation = useMutation({
    mutationFn: (name: string) => callKw(model, 'create', [{ [groupBy[0]]: name }]),
    onSuccess: () => {
      setNewGroupName('')
      invalidateList()
    },
  })

  const saveMutation = useMutation({
    mutationFn: ({
      mode,
      values,
      recordId,
    }: {
      mode: 'editing' | 'creating'
      values: Record<string, unknown>
      recordId?: number
    }) =>
      mode === 'editing' && recordId
        ? callKw(model, 'write', [[recordId], values])
        : callKw(model, 'create', [values]),
    onSuccess: () => {
      listModel.leaveEdit()
      invalidateList()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (recordId: number) => callKw(model, 'unlink', [[recordId]]),
    onSuccess: () => invalidateList(),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => callKw(model, 'unlink', [ids]),
    onSuccess: () => {
      listModel.clearSelection()
      invalidateList()
    },
  })

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids: number[]) => recordArchive.mutateAsync(ids),
    onSuccess: () => {
      listModel.clearSelection()
      invalidateList()
    },
  })

  const bulkUnarchiveMutation = useMutation({
    mutationFn: (ids: number[]) => recordUnarchive.mutateAsync(ids),
    onSuccess: () => {
      listModel.clearSelection()
      invalidateList()
    },
  })

  const resequenceMutation = useMutation({
    mutationFn: ({ ids, field }: { ids: number[]; field: string }) =>
      callKw(model, 'resequence', [field, ids], {}),
    onSuccess: () => invalidateList(),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => callKw<number>(model, 'copy', [id]),
    onSuccess: () => invalidateList(),
  })

  const bulkWriteMutation = useMutation({
    mutationFn: ({ ids, values }: { ids: number[]; values: Record<string, unknown> }) =>
      callKw(model, 'write', [ids, values]),
    onSuccess: () => {
      listModel.clearSelection()
      listModel.setMultiEditActive(false)
      invalidateList()
    },
  })

  const handleDrop = useCallback(
    (fromIdx: number, toIdx: number) => {
      const rows = data as Array<Record<string, unknown>>
      const rowsCopy = [...rows]
      const [moved] = rowsCopy.splice(fromIdx, 1)
      rowsCopy.splice(toIdx, 0, moved)
      const sequenceField =
        visibleColumns.filter(isViewField).find((c) => c.name === 'sequence')?.name ?? 'sequence'
      const ids = rowsCopy.map((r) => r.id as number)
      resequenceMutation.mutate({ ids, field: sequenceField })
      listModel.clearDragState()
    },
    [data, visibleColumns, resequenceMutation, listModel],
  )

  const handleRowClick = useCallback(
    (record: Record<string, unknown>) => {
      if (!isEditable) {
        if (!listView.noOpen) onRowClick?.(record.id as number)
        return
      }
      if (listView.openFormView) {
        onRowClick?.(record.id as number)
        return
      }
      listModel.enterEdit(record, editableColIndices)
    },
    [isEditable, onRowClick, editableColIndices, listView.noOpen, listView.openFormView, listModel],
  )

  const handleInlineChange = useCallback((fieldName: string, value: unknown) => {
    listModel.updateEdit(fieldName, value)
  }, [listModel])

  const handleInlineSave = useCallback(() => {
    if (snap.inlineEdit.mode === 'idle') return
    const errors: Record<string, string> = {}
    for (const col of visibleColumns) {
      if (isNonField(col)) continue
      const meta = fields[col.name]
      if (!meta || meta.readonly || col.readonly) continue
      const val = snap.inlineEdit.values[col.name]
      if ((col.required || meta.required) && isFieldValueEmpty(val, meta.type)) {
        errors[col.name] = 'Required'
      } else {
        const typeErr = validateFieldValue(val, meta)
        if (typeErr) errors[col.name] = typeErr
      }
    }
    if (Object.keys(errors).length > 0) {
      listModel.setValidationErrors(errors)
      return
    }
    listModel.setValidationErrors({})
    saveMutation.mutate({
      mode: snap.inlineEdit.mode as 'editing' | 'creating',
      values: snap.inlineEdit.values,
      recordId: snap.inlineEdit.recordId,
    })
  }, [snap.inlineEdit, saveMutation, visibleColumns, fields, listModel])

  const handleInlineCancel = useCallback(() => {
    listModel.leaveEdit()
  }, [listModel])

  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (snap.inlineEdit.mode === 'idle') {
        const rows = data as Array<Record<string, unknown>>
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          listModel.setFocusRow(Math.min(snap.focusRow + 1, rows.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          listModel.setFocusRow(Math.max(snap.focusRow - 1, 0))
        } else if (
          e.key === 'Enter' &&
          snap.focusRow >= 0 &&
          snap.focusRow < rows.length &&
          !listView.noOpen
        ) {
          e.preventDefault()
          onRowClick?.(rows[snap.focusRow].id as number)
        } else if (e.key === 'F2' && snap.focusRow >= 0 && snap.focusRow < rows.length && isEditable) {
          e.preventDefault()
          listModel.enterEdit(rows[snap.focusRow], editableColIndices)
        } else if (e.key === 'a' && (e.ctrlKey || e.metaKey) && !groupByActive) {
          e.preventDefault()
          listModel.selectAll(rows.map((r) => r.id as number))
        } else if (e.key === ' ' && e.shiftKey && snap.focusRow >= 0 && snap.focusRow < rows.length) {
          e.preventDefault()
          handleToggleRow(rows[snap.focusRow].id as number, false, snap.focusRow)
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleInlineCancel()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleInlineSave()
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const idx = editableColIndices.indexOf(snap.focusCol)
        if (idx < editableColIndices.length - 1) {
          listModel.moveFocus(1, editableColIndices)
        } else if (snap.inlineEdit.mode === 'editing') {
          // Tab from last editable column → move to next record
          const rows = data as Array<Record<string, unknown>>
          const currentIdx = rows.findIndex((r) => r.id === snap.inlineEdit.recordId)
          if (currentIdx >= 0 && currentIdx < rows.length - 1) {
            handleInlineSave()
            const nextRecord = rows[currentIdx + 1]
            setTimeout(() => {
              listModel.enterEdit(nextRecord, editableColIndices)
            }, 100)
          }
        }
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        const idx = editableColIndices.indexOf(snap.focusCol)
        if (idx > 0) {
          listModel.moveFocus(-1, editableColIndices)
        } else if (snap.inlineEdit.mode === 'editing') {
          // Shift+Tab from first editable column → move to previous record
          const rows = data as Array<Record<string, unknown>>
          const currentIdx = rows.findIndex((r) => r.id === snap.inlineEdit.recordId)
          if (currentIdx > 0) {
            handleInlineSave()
            const prevRecord = rows[currentIdx - 1]
            setTimeout(() => {
              listModel.enterEdit(prevRecord, editableColIndices)
              listModel.setFocusCol(editableColIndices[editableColIndices.length - 1] ?? 0)
            }, 100)
          }
        }
      }
    },
    [
      snap.inlineEdit,
      snap.focusCol,
      snap.focusRow,
      handleInlineCancel,
      handleInlineSave,
      editableColIndices,
      data,
      onRowClick,
      isEditable,
      groupByActive,
      listView.noOpen,
      listModel,
    ],
  )

  const handleAddRow = useCallback(() => {
    const defaults: Record<string, unknown> = {}
    for (const col of visibleColumns.filter(isViewField)) {
      const meta = fields[col.name]
      if (meta) defaults[col.name] = defaultForType(meta.type)
    }
    listModel.enterCreate(defaults, editableColIndices)
  }, [visibleColumns, fields, editableColIndices, listModel])

  // Warn before leaving page with unsaved inline edits
  useEffect(() => {
    if (snap.inlineEdit.mode === 'idle') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [snap.inlineEdit.mode])

  // Click outside table to close edit mode
  useEffect(() => {
    if (snap.inlineEdit.mode === 'idle') return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('table') || target.closest('[data-edit-panel]')) return
      handleInlineCancel()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [snap.inlineEdit.mode, handleInlineCancel])

  // Close column menu on outside click
  useEffect(() => {
    if (!colMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [colMenuOpen])

  // Group expand queries - multi-level support
  const expandedGroupPaths = useMemo(() => [...snap.expandedGroups].sort(), [snap.expandedGroups])

  // Top-level group queries
  const topLevelQueries = useQueries({
    queries: expandedGroupPaths
      .filter((p) => !p.includes('-'))
      .map((path) => {
        const index = Number(path)
        const isLeaf = groupBy.length <= 1
        const domain = groupData?.[index]?.__domain ?? []
        const gLimit = groupLimit + (snap.groupExtraLimits[path] ?? 0)
        return {
          queryKey: ['odoo', 'group-data', model, path, domain, snap.order, groupBy.length, gLimit],
          queryFn: () =>
            isLeaf
              ? callKw<Array<Record<string, unknown>>>(
                  model,
                  'search_read',
                  [domain, fieldColumnNames],
                  {
                    limit: gLimit,
                    order: snap.order || undefined,
                  },
                )
              : readGroup<ReadGroupResult[]>(model, domain, fieldColumnNames, [groupBy[1]]),
          enabled: !!groupData?.[index] && domain.length > 0,
          staleTime: 30_000,
        }
      }),
  })

  // Build a map of top-level query results by path
  const topLevelPaths = useMemo(
    () => expandedGroupPaths.filter((p) => !p.includes('-')),
    [expandedGroupPaths],
  )
  const topQueryMap = useMemo(() => {
    const m = new Map<string, { data: unknown; isLoading: boolean }>()
    topLevelPaths.forEach((path, qi) => {
      m.set(path, {
        data: topLevelQueries[qi]?.data,
        isLoading: topLevelQueries[qi]?.isLoading ?? false,
      })
    })
    return m
  }, [topLevelPaths, topLevelQueries])

  // Sub-level group queries (depth 1+)
  const subLevelPaths = useMemo(
    () =>
      expandedGroupPaths.filter((p) => {
        const depth = p.split('-').length - 1
        return depth >= 1
      }),
    [expandedGroupPaths],
  )

  const subLevelQueries = useQueries({
    queries: subLevelPaths.map((path) => {
      const parts = path.split('-')
      const depth = parts.length - 1
      const isLeaf = depth >= groupBy.length - 1
      const parentPath = parts.slice(0, -1).join('-')
      const indexInParent = Number(parts[parts.length - 1])

      // Get domain from parent's query result
      let domain: unknown[] = []
      if (depth === 1) {
        const parentResult = topQueryMap.get(parentPath)?.data as ReadGroupResult[] | undefined
        domain = parentResult?.[indexInParent]?.__domain ?? []
      }

      const gLimit = groupLimit + (snap.groupExtraLimits[path] ?? 0)
      return {
        queryKey: ['odoo', 'group-data', model, path, domain, snap.order, gLimit],
        queryFn: () =>
          isLeaf
            ? callKw<Array<Record<string, unknown>>>(
                model,
                'search_read',
                [domain, fieldColumnNames],
                { limit: gLimit, order: snap.order || undefined },
              )
            : readGroup<ReadGroupResult[]>(model, domain, fieldColumnNames, [groupBy[depth + 1]]),
        enabled: domain.length > 0,
        staleTime: 30_000,
      }
    }),
  })

  const subQueryMap = useMemo(() => {
    const m = new Map<string, { data: unknown; isLoading: boolean }>()
    subLevelPaths.forEach((path, qi) => {
      m.set(path, {
        data: subLevelQueries[qi]?.data,
        isLoading: subLevelQueries[qi]?.isLoading ?? false,
      })
    })
    return m
  }, [subLevelPaths, subLevelQueries])

  const groupQueryMap = useMemo(() => {
    const m = new Map<string, { data: unknown; isLoading: boolean }>()
    for (const [k, v] of topQueryMap) m.set(k, v)
    for (const [k, v] of subQueryMap) m.set(k, v)
    return m
  }, [topQueryMap, subQueryMap])

  const handleExportClick = useCallback(() => {
    const records = data as Array<Record<string, unknown>>
    if (!records.length) return
    const dialogId = openDialog({
      size: 'lg',
      title: `Export ${listView.string || model}`,
      content: (
        <ExportDialog
          model={model}
          fields={fields}
          data={records}
          selectedIds={snap.selectedIds.size > 0 ? snap.selectedIds : undefined}
          onClose={() => closeDialog(dialogId)}
        />
      ),
    })
  }, [data, openDialog, closeDialog, model, listView.string, fields, snap.selectedIds])

  const editableFieldElements = useMemo(
    () => visibleColumns.map((col) => (isNonField(col) ? null : viewFieldToFieldElement(col))),
    [visibleColumns],
  )

  const pageRecordIds = useMemo(
    () => (data as Array<Record<string, unknown>>).map((r) => r.id as number),
    [data],
  )

  const allSelected = pageRecordIds.length > 0 && pageRecordIds.every((id) => snap.selectedIds.has(id))
  const someSelected = snap.selectedIds.size > 0 && !allSelected
  const { data: allMatchingIds } = useQuery({
    queryKey: ['odoo', 'allIds', model, domain],
    queryFn: () => callKw<number[]>(model, 'search', [domain]),
    enabled:
      snap.selectedIds.size > 0 && !groupByActive && !!totalCount && snap.selectedIds.size < totalCount,
    staleTime: 30_000,
  })

  const selectAllAcrossPages = useCallback(() => {
    if (allMatchingIds) listModel.selectAll(allMatchingIds)
  }, [allMatchingIds, listModel])

  const handleToggleAll = useCallback(() => {
    listModel.toggleAll(pageRecordIds, allSelected)
  }, [listModel, pageRecordIds, allSelected])

  const handleToggleRow = useCallback(
    (id: number, shiftKey: boolean, index: number) => {
      listModel.toggleRow(id, shiftKey, index, data as Array<Record<string, unknown>>, groupByActive)
    },
    [listModel, data, groupByActive],
  )

  // Recursive group node renderer — thin wrapper around GroupNode component
  const renderGroupNode = useCallback(
    (path: string, group: ReadGroupResult | Record<string, unknown>, depth: number) => (
      <GroupNode
        path={path}
        group={group}
        depth={depth}
        visibleColumns={visibleColumns}
        fields={fields}
        groupBy={groupBy}
        fieldColumnNames={fieldColumnNames}
        model={model}
        selectedIds={snap.selectedIds}
        expandedGroups={snap.expandedGroups}
        groupQueryMap={groupQueryMap}
        groupLimit={groupLimit}
        decorations={listView.decorations}
        groupDelete={!!listView.groupDelete}
        isEditable={isEditable}
        noOpen={!!listView.noOpen}
        onRowClick={onRowClick}
        toggleGroupExpand={listModel.toggleGroupExpand.bind(listModel)}
        toggleRow={handleToggleRow}
        handleRowClick={handleRowClick}
        setGroupExtraLimits={listModel.setGroupExtraLimits.bind(listModel)}
        confirmDialog={confirmDialog}
        invalidateList={invalidateList}
      />
    ),
    [
      visibleColumns,
      fields,
      groupBy,
      fieldColumnNames,
      model,
      snap.selectedIds,
      snap.expandedGroups,
      groupQueryMap,
      groupLimit,
      listView.decorations,
      listView.groupDelete,
      isEditable,
      listView.noOpen,
      onRowClick,
      listModel,
      handleToggleRow,
      handleRowClick,
      confirmDialog,
      invalidateList,
    ],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-4">
      <div className="flex shrink-0 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{listView.string || model}</h3>
          {!groupByActive && data.length > 0 && (
            <div ref={colMenuRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setColMenuOpen(!colMenuOpen)
                }}
                className="rounded border border-border-default p-1 text-text-muted hover:bg-hover hover:text-text-primary"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              {colMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-border-subtle bg-surface p-2 shadow-lg">
                  <div className="mb-1 text-[10px] font-medium uppercase text-text-muted">
                    Columns
                  </div>
                  {allVisibleCols.filter(isViewField).map((col) => {
                    const meta = fields[col.name]
                    const label = col.string || meta?.string || col.name
                    return (
                      <label
                        key={col.name}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs text-text-primary hover:bg-hover"
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(col.name)}
                          onChange={() => toggleColumn(col.name)}
                          className="h-4 w-4 cursor-pointer rounded accent-accent"
                        />
                        {label}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditable && snap.inlineEdit.mode === 'idle' && listView.create !== false && (
            <button
              type="button"
              onClick={handleAddRow}
              className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-on-accent hover:bg-accent/90"
            >
              {listView.controlButtons?.find((b) => b.type === 'create')?.string ?? 'Add'}
            </button>
          )}
          {!groupByActive && totalCount != null ? (
            <Pagination
              offset={snap.offset}
              total={totalCount}
              limit={snap.limit}
              onPageChange={handlePageChange}
              onLimitChange={listModel.setPageSize.bind(listModel)}
            />
          ) : (
            <span className="text-xs text-text-muted">
              {groupByActive
                ? `${groupData?.length ?? 0} groups`
                : `${data.length} record${data.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error instanceof Error ? error.message : t('list.failedToLoad')}
        </div>
      )}

      {!isLoading && !error && data.length === 0 && snap.inlineEdit.mode !== 'creating' && (
        <div className="rounded-lg border border-border-subtle bg-surface/50 py-12 text-center text-sm text-text-muted">
          {t('list.noRecords')}
        </div>
      )}

      {(!isLoading && !error && data.length > 0) || snap.inlineEdit.mode === 'creating' ? (
        <>
          {snap.selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2">
              <span className="text-xs font-medium text-accent">
                {snap.selectedIds.size} selected
                {!groupByActive && !!totalCount && snap.selectedIds.size < totalCount && (
                  <>
                    {' — '}
                    <button
                      type="button"
                      onClick={selectAllAcrossPages}
                      className="text-accent underline hover:no-underline"
                    >
                      Select all {totalCount} records
                    </button>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  confirmDialog({
                    title: 'Delete Records',
                    message: `Are you sure you want to delete ${snap.selectedIds.size} selected record(s)?`,
                    confirmLabel: 'Delete',
                    variant: 'danger',
                    onConfirm: () => bulkDeleteMutation.mutate([...snap.selectedIds]),
                  })
                }}
                disabled={bulkDeleteMutation.isPending}
                className="rounded border border-danger/30 px-2 py-0.5 text-[11px] text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                Delete
              </button>
              {snap.selectedIds.size === 1 && (
                <button
                  type="button"
                  onClick={() => duplicateMutation.mutate([...snap.selectedIds][0])}
                  disabled={duplicateMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Duplicate
                </button>
              )}
              {hasActiveField && (
                <button
                  type="button"
                  onClick={() => bulkArchiveMutation.mutate([...snap.selectedIds])}
                  disabled={bulkArchiveMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Archive
                </button>
              )}
              {hasActiveField && (
                <button
                  type="button"
                  onClick={() => bulkUnarchiveMutation.mutate([...snap.selectedIds])}
                  disabled={bulkUnarchiveMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Unarchive
                </button>
              )}
              {isEditable && snap.selectedIds.size > 1 && (
                <button
                  type="button"
                  onClick={() => listModel.setMultiEditActive(true)}
                  className="rounded border border-accent/40 px-2 py-0.5 text-[11px] text-accent hover:bg-accent/10"
                >
                  Edit
                </button>
              )}
              {listView.exportXlsx !== false && (
                <button
                  type="button"
                  onClick={handleExportClick}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover"
                >
                  Export
                </button>
              )}
              <button
                type="button"
                onClick={() => listModel.clearSelection()}
                className="rounded px-2 py-0.5 text-[11px] text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>
          )}
          {snap.multiEditActive && snap.selectedIds.size > 1 && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
              <div className="mb-2 text-xs font-semibold text-accent">
                Edit {snap.selectedIds.size} records
              </div>
              <div className="flex flex-wrap gap-3">
                {visibleColumns.filter(isViewField).map((col) => {
                  const meta = fields[col.name]
                  if (!meta || meta.readonly || col.readonly) return null
                  return (
                    <div key={col.name} className="flex items-center gap-1.5">
                      <label
                        htmlFor={`multi-edit-${col.name}`}
                        className="text-[11px] text-text-secondary"
                      >
                        {col.string || meta.string || col.name}
                      </label>
                      <input
                        id={`multi-edit-${col.name}`}
                        type={meta.type === 'boolean' ? 'checkbox' : 'text'}
                        checked={meta.type === 'boolean' ? !!snap.multiEditValues[col.name] : undefined}
                        value={
                          meta.type !== 'boolean'
                            ? String(snap.multiEditValues[col.name] ?? '')
                            : undefined
                        }
                        onChange={(e) =>
                          listModel.updateMultiEditValue(
                            col.name,
                            meta.type === 'boolean' ? e.target.checked : e.target.value,
                          )
                        }
                        className="rounded border border-border-default px-2 py-0.5 text-xs"
                        placeholder={meta.type === 'integer' || meta.type === 'float' ? '0' : ''}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const edited: Record<string, unknown> = {}
                    for (const [k, v] of Object.entries(snap.multiEditValues)) {
                      if (v !== '' && v !== undefined) edited[k] = v
                    }
                    if (Object.keys(edited).length === 0) return
                    const changes = Object.keys(edited)
                      .map((k) => {
                        const meta = fields[k]
                        return meta?.string ?? k
                      })
                      .join(', ')
                    confirmDialog({
                      title: 'Confirm Changes',
                      message: `You are about to update ${snap.selectedIds.size} records. Fields: ${changes}`,
                      confirmLabel: 'Apply',
                      onConfirm: () =>
                        bulkWriteMutation.mutate({ ids: [...snap.selectedIds], values: edited }),
                    })
                  }}
                  disabled={bulkWriteMutation.isPending}
                  className="rounded bg-accent px-3 py-1 text-[11px] font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
                >
                  {bulkWriteMutation.isPending ? 'Saving...' : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    listModel.setMultiEditActive(false)
                  }}
                  className="rounded border border-border-default px-3 py-1 text-[11px] text-text-secondary hover:bg-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div
            ref={tableContainerRef}
            data-testid="odoo-list-view"
            className="overflow-x-auto min-h-0 flex-1 overflow-y-auto rounded-lg border border-border-subtle"
          >
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: table with keyboard navigation */}
            <table className="w-full" onKeyDown={handleTableKeyDown}>
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
                  <th className="w-10 px-2 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={handleToggleAll}
                      className="h-4 w-4 cursor-pointer rounded accent-accent"
                    />
                  </th>
                  {visibleColumns.map((col, ci) => {
                    if (isNonField(col)) {
                      return (
                        <th
                          key={`h-${ci}`}
                          className="px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                          style={{ width: isButtonGroup(col) ? col.buttons.length * 40 : 60 }}
                        />
                      )
                    }
                    const meta = fields[col.name]
                    const label = col.string || meta?.string || col.name
                    const defaultWidth = FIELD_TYPE_WIDTHS[meta?.type ?? ''] ?? DEFAULT_COL_WIDTH
                    const width = colWidths[col.name] ?? defaultWidth
                    return (
                      <th
                        key={`h-${col.name}-${ci}`}
                        onClick={() => !groupByActive && handleSort(col.name)}
                        className={`relative whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors ${!groupByActive ? 'cursor-pointer hover:text-text-primary' : ''} ${col.class ?? ''}`}
                        style={width ? { width, minWidth: 60 } : undefined}
                      >
                        {label}
                        {!groupByActive && <span className="ml-1">{sortIcon(col.name)}</span>}
                        {!groupByActive && (
                          <hr
                            className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize border-0 bg-transparent hover:bg-accent/30"
                            onMouseDown={(e) => startResize(col.name, e)}
                          />
                        )}
                      </th>
                    )
                  })}
                  {isEditable && <th className="w-20 px-2 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {snap.inlineEdit.mode === 'creating' && listView.editable !== 'bottom' && (
                  <InlineEditRow
                    columns={visibleColumns}
                    fieldElements={editableFieldElements}
                    fields={fields}
                    values={snap.inlineEdit.values}
                    onChange={handleInlineChange}
                    onSave={handleInlineSave}
                    onCancel={handleInlineCancel}
                    isSaving={saveMutation.isPending}
                    validationErrors={snap.validationErrors}
                  />
                )}
                {groupByActive && groupData ? (
                  <>
                    {groupData.map((group, i) => renderGroupNode(String(i), group, 0))}
                    {listView.groupCreate &&
                      groupBy.length === 1 &&
                      fields[groupBy[0]]?.type === 'many2one' && (
                        <tr>
                          <td className="w-10 px-2 py-2" />
                          <td colSpan={visibleColumns.length} className="px-4 py-1">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                if (newGroupName.trim())
                                  createGroupMutation.mutate(newGroupName.trim())
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Add a group..."
                                className="w-40 rounded border border-border-default bg-transparent px-2 py-0.5 text-xs text-text-primary placeholder:text-text-muted"
                              />
                              <button
                                type="submit"
                                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                                className="rounded bg-accent px-2 py-0.5 text-[10px] text-on-accent hover:bg-accent/90 disabled:opacity-50"
                              >
                                Add
                              </button>
                            </form>
                          </td>
                        </tr>
                      )}
                  </>
                ) : (
                  (data as Array<Record<string, unknown>>).map((record, i) => {
                    const recordId = record.id as number
                    const isEditing =
                      snap.inlineEdit.mode === 'editing' && snap.inlineEdit.recordId === recordId
                    const rowDeco = getDecorationClass(
                      listView.decorations as unknown as Record<string, unknown>,
                      record,
                    )
                    return (
                      <tr
                        key={recordId}
                        data-testid="list-row"
                        data-record-id={String(recordId)}
                        draggable={hasHandle && !isEditing}
                        onDragStart={
                          hasHandle
                            ? (e) => {
                                listModel.setDragRow(i)
                                e.dataTransfer.effectAllowed = 'move'
                              }
                            : undefined
                        }
                        onDragOver={
                          hasHandle
                            ? (e) => {
                                e.preventDefault()
                                listModel.setDragOverRow(i)
                              }
                            : undefined
                        }
                        onDragEnd={
                          hasHandle
                            ? () => {
                                listModel.clearDragState()
                              }
                            : undefined
                        }
                        onDrop={
                          hasHandle
                            ? () => {
                                if (snap.dragRow !== null && snap.dragRow !== i) handleDrop(snap.dragRow, i)
                              }
                            : undefined
                        }
                        onClick={() => !isEditing && handleRowClick(record)}
                        className={[
                          'border-b border-border-subtle transition-colors hover:bg-hover/50',
                          isEditing ? 'bg-accent/5' : '',
                          snap.selectedIds.has(recordId) ? 'bg-accent/5' : '',
                          !isEditable && onRowClick && !listView.noOpen ? 'cursor-pointer' : '',
                          isEditable ? 'cursor-pointer' : '',
                          snap.dragOverRow === i && snap.dragRow !== null ? 'border-t-2 border-t-accent' : '',
                          i === data.length - 1 && snap.inlineEdit.mode !== 'creating'
                            ? 'border-b-0'
                            : '',
                          snap.focusRow === i && snap.inlineEdit.mode === 'idle'
                            ? 'outline outline-2 outline-accent/30 outline-offset-[-2px]'
                            : '',
                          rowDeco,
                          listView.rowClass ?? '',
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
                            checked={snap.selectedIds.has(recordId)}
                            onChange={() => handleToggleRow(recordId, false, i)}
                            onClick={(e) => handleToggleRow(recordId, e.shiftKey, i)}
                            className="h-4 w-4 cursor-pointer rounded accent-accent"
                          />
                        </td>
                        {visibleColumns.map((col, ci) => {
                          if (isNonField(col)) {
                            return (
                              // biome-ignore lint/a11y/noStaticElementInteractions: button cell
                              <td
                                key={`d-${ci}`}
                                role="presentation"
                                className="px-2 py-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isButtonGroup(col)
                                  ? col.buttons.map((btn) => (
                                      <ListButtonCell
                                        key={btn.name}
                                        btn={btn}
                                        record={record}
                                        model={model}
                                        onDone={invalidateList}
                                      />
                                    ))
                                  : isListButton(col) && (
                                      <ListButtonCell
                                        btn={col}
                                        record={record}
                                        model={model}
                                        onDone={invalidateList}
                                      />
                                    )}
                              </td>
                            )
                          }
                          const cellDeco = getDecorationClass(
                            col as unknown as Record<string, unknown>,
                            record,
                          )
                          const meta = fields[col.name]
                          const isReadonly = meta?.readonly || col.readonly

                          if (isEditing && !isReadonly) {
                            const fe = editableFieldElements[ci] as FieldElement
                            const Widget = getFieldWidget(fe, meta?.type ?? 'char')
                            const errMsg = snap.validationErrors[col.name]
                            const hasRequiredErr = errMsg === 'Required'
                            const hasTypeErr = !!errMsg && !hasRequiredErr
                            const errRing = hasRequiredErr
                              ? ' ring-1 ring-danger ring-inset'
                              : hasTypeErr
                                ? ' ring-1 ring-warning ring-inset'
                                : ''
                            return (
                              // biome-ignore lint/a11y/noStaticElementInteractions: edit cell
                              <td
                                key={`d-${col.name}-${ci}`}
                                role="presentation"
                                className={`whitespace-nowrap px-1 py-0.5${errRing}`}
                                title={errMsg ?? undefined}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {createElement(Widget, {
                                  field: fe,
                                  value: snap.inlineEdit.values[col.name],
                                  onChange: (v: unknown) => handleInlineChange(col.name, v),
                                  readOnly: false,
                                  meta,
                                })}
                              </td>
                            )
                          }

                          const isBooleanToggle =
                            isEditable && !isReadonly && meta?.type === 'boolean'
                          return (
                            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: td acts as boolean toggle in editable list
                            <td
                              key={`d-${col.name}-${ci}`}
                              role={isBooleanToggle ? 'button' : undefined}
                              tabIndex={isBooleanToggle ? 0 : undefined}
                              title={(() => {
                                const t = renderListCellContent(
                                  renderCell(
                                    record[col.name],
                                    fields[col.name],
                                    model,
                                    record.id as number,
                                  ),
                                )
                                if (typeof t !== 'string') return undefined
                                return t.length > 30 ? t : undefined
                              })()}
                              className={[
                                'whitespace-nowrap px-4 py-2 text-sm text-text-primary',
                                cellDeco,
                                col.class ?? '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={
                                isBooleanToggle
                                  ? () => {
                                      toggleBooleanMutation.mutate({
                                        recordId,
                                        field: col.name,
                                        value: !record[col.name],
                                      })
                                    }
                                  : undefined
                              }
                              onKeyDown={
                                isBooleanToggle
                                  ? (e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.currentTarget.click()
                                      }
                                    }
                                  : undefined
                              }
                              style={isBooleanToggle ? { cursor: 'pointer' } : undefined}
                            >
                              {renderListCellContent(
                                renderCell(
                                  record[col.name],
                                  fields[col.name],
                                  model,
                                  record.id as number,
                                ),
                              )}
                            </td>
                          )
                        })}
                        {isEditing && (
                          // biome-ignore lint/a11y/noStaticElementInteractions: save/cancel cell
                          <td
                            role="presentation"
                            className="flex items-center gap-1 px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={handleInlineSave}
                              disabled={saveMutation.isPending}
                              className="rounded bg-accent px-2 py-0.5 text-[11px] font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
                            >
                              {saveMutation.isPending ? '...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={handleInlineCancel}
                              className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover"
                            >
                              Cancel
                            </button>
                          </td>
                        )}
                        {isEditable && !isEditing && (
                          // biome-ignore lint/a11y/noStaticElementInteractions: delete cell
                          <td
                            role="presentation"
                            className="px-2 py-1 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {listView.delete !== false && (
                              <button
                                type="button"
                                onClick={() => {
                                  confirmDialog({
                                    title: 'Delete Record',
                                    message: 'Are you sure you want to delete this record?',
                                    confirmLabel: 'Delete',
                                    variant: 'danger',
                                    onConfirm: () => deleteMutation.mutate(recordId),
                                  })
                                }}
                                className="text-xs text-text-muted hover:text-danger"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
                {snap.inlineEdit.mode === 'creating' && listView.editable === 'bottom' && (
                  <InlineEditRow
                    columns={visibleColumns}
                    fieldElements={editableFieldElements}
                    fields={fields}
                    values={snap.inlineEdit.values}
                    onChange={handleInlineChange}
                    onSave={handleInlineSave}
                    onCancel={handleInlineCancel}
                    isSaving={saveMutation.isPending}
                    validationErrors={snap.validationErrors}
                  />
                )}
              </tbody>
              {Object.keys(aggregates).length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border-subtle bg-surface/50 font-semibold">
                    <td className="w-10 px-2 py-2" />
                    {visibleColumns.map((col, ci) => {
                      if (isNonField(col)) return <td key={`f-${ci}`} className="px-4 py-2" />
                      // Collect all aggregate entries for this column
                      const colAggs = Object.entries(aggregates)
                        .filter(([k]) => k.startsWith(`${col.name}_`))
                        .map(([, v]) => v)
                      if (!colAggs.length) return <td key={`f-${ci}`} className="px-4 py-2" />
                      return (
                        <td
                          key={`f-${ci}`}
                          className="whitespace-nowrap px-4 py-2 text-sm text-text-primary"
                        >
                          {colAggs.map((a, i) => (
                            <span key={i}>
                              {i > 0 ? ' · ' : ''}
                              {a.label}: {a.value}
                            </span>
                          ))}
                        </td>
                      )
                    })}
                    {isEditable && <td className="w-20 px-2 py-2" />}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}
