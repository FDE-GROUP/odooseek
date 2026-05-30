import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { ChevronRight, Settings } from '@/lib/lucide-icons'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useConfirmDialog } from '../components/ConfirmDialog'
import { ExportDialog } from '../components/ExportDialog'
import { Pagination } from '../components/Pagination'
import { useDialog } from '../hooks/useDialog'
import { useRecordActions } from '../hooks/useRecordActions'
import { callKw, readGroup } from '../lib/api'
import { evalCondition, getDecorationClass } from '../lib/expression-evaluator'
import { DEFAULT_COL_WIDTH, FIELD_TYPE_WIDTHS, renderCell } from '../lib/list-formatters'
import type {
  FieldElement,
  ListButtonElement,
  ListButtonGroup,
  ListColumn,
  OdooFieldMeta,
  ReadGroupResult,
  ViewField,
} from '../lib/odoo-types'
import { getColumnPrefs, setColumnPrefs } from '../lib/view-cache'
import { parseListXml } from '../lib/xml-parser'
import { getFieldWidget } from './field-widgets'

interface ListRendererProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain?: unknown[]
  groupBy?: string[]
  onRowClick?: (recordId: number) => void
}

interface InlineEditState {
  mode: 'idle' | 'editing' | 'creating'
  recordId?: number
  values: Record<string, unknown>
}

function viewFieldToFieldElement(vf: ViewField): FieldElement {
  return {
    type: 'field',
    name: vf.name,
    widget: vf.widget,
    string: vf.string,
    readonly: vf.readonly,
    required: vf.required,
  }
}

function isListButton(col: ListColumn): col is ListButtonElement {
  return 'buttonType' in col
}

function isButtonGroup(col: ListColumn): col is ListButtonGroup {
  return col.type === 'button_group'
}

function isNonField(col: ListColumn): col is ListButtonElement | ListButtonGroup {
  return isListButton(col) || isButtonGroup(col)
}

function isViewField(col: ListColumn): col is ViewField {
  return !isListButton(col) && !isButtonGroup(col)
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
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(80)
  const [order, setOrder] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [groupExtraLimits, setGroupExtraLimits] = useState<Record<string, number>>({})
  const [newGroupName, setNewGroupName] = useState('')
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [colWidths, setColWidths] = useState<Record<string, number>>({})
  const colMenuRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const savedScrollTop = useRef(0)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const listView = useMemo(() => parseListXml(arch), [arch])

  // Apply default_order and limit on mount
  useEffect(() => {
    if (listView.defaultOrder) setOrder(listView.defaultOrder)
    if (listView.limit) setLimit(listView.limit)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const groupLimit = listView.groupsLimit ?? 80
  const allVisibleColumns = listView.columns.filter((c) => {
    if (isListButton(c)) return !c.invisible
    if (isButtonGroup(c)) return c.buttons.some((b) => !b.invisible)
    return !c.invisible || c.invisible < 1
  })

  // Initialize hidden columns from localStorage or optional="hide" attributes
  useEffect(() => {
    const saved = getColumnPrefs(model)
    if (saved) {
      setHiddenCols(new Set(saved))
    } else {
      const hidden = new Set(
        listView.columns
          .filter((c): c is ViewField => isViewField(c) && c.optional === 'hide')
          .map((c) => c.name),
      )
      setHiddenCols(hidden)
    }
  }, [listView, model])
  const visibleColumns = allVisibleColumns
    .filter((c) => isNonField(c) || !hiddenCols.has(c.name))
    .filter((c) => {
      if (isNonField(c)) return true
      if (!c.columnInvisible) return true
      return !evalCondition(c.columnInvisible, {})
    })
  const fieldColumnNames = visibleColumns.filter(isViewField).map((c) => c.name)
  const groupByActive = groupBy.length > 0
  const isEditable = !!listView.editable && !groupByActive
  const hasHandle = allVisibleColumns.some(
    (c): c is ViewField => isViewField(c) && c.widget === 'handle',
  )
  const [dragRow, setDragRow] = useState<number | null>(null)
  const [dragOverRow, setDragOverRow] = useState<number | null>(null)

  const [inlineEdit, setInlineEdit] = useState<InlineEditState>({
    mode: 'idle',
    values: {},
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [focusCol, setFocusCol] = useState(0)
  const [focusRow, setFocusRow] = useState(-1)
  const [multiEditActive, setMultiEditActive] = useState(false)
  const [multiEditValues, setMultiEditValues] = useState<Record<string, unknown>>({})

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

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      setFocusCol((prev) => {
        const idx = editableColIndices.indexOf(prev)
        const next = idx + direction
        if (next < 0 || next >= editableColIndices.length) return prev
        return editableColIndices[next]
      })
    },
    [editableColIndices],
  )

  // keyboard handler is defined below after handleInlineSave/handleInlineCancel

  const {
    data: groupedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['odoo', 'data', model, 'list', domain, groupBy, offset, limit, order],
    queryFn: () =>
      groupByActive
        ? readGroup<ReadGroupResult[]>(model, domain, fieldColumnNames, groupBy)
        : callKw<Array<Record<string, unknown>>>(model, 'search_read', [domain, fieldColumnNames], {
            offset,
            limit,
            order: order || undefined,
          }),
  })

  const handleSort = (fieldName: string) => {
    if (tableContainerRef.current) savedScrollTop.current = tableContainerRef.current.scrollTop
    setOrder((prev) => {
      if (prev === fieldName) return `${fieldName} desc`
      if (prev === `${fieldName} desc`) return ''
      return fieldName
    })
    setOffset(0)
    setSelectedIds(new Set())
  }

  const sortIcon = (fieldName: string) => {
    if (order === fieldName) return <ChevronUp className="inline h-3 w-3 text-accent" />
    if (order === `${fieldName} desc`) return <ChevronDown className="inline h-3 w-3 text-accent" />
    return <ArrowUpDown className="inline h-3 w-3 opacity-30" />
  }

  const data = (groupedData ?? []) as unknown[]
  const groupData = groupByActive ? (groupedData as ReadGroupResult[] | undefined) : null

  // Restore scroll position after data loads
  useEffect(() => {
    if (!isLoading && savedScrollTop.current > 0 && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = savedScrollTop.current
      savedScrollTop.current = 0
    }
  }, [isLoading])

  const aggregates = useMemo(() => {
    const result: Record<string, { label: string; value: number | string }> = {}
    const rows = data as Array<Record<string, unknown>>
    if (!rows.length || groupData) return result

    const numericTypes = ['integer', 'float', 'monetary']
    const compute = (vals: number[], op: string): number => {
      if (op === 'sum') return vals.reduce((a, b) => a + b, 0)
      if (op === 'avg') return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      if (op === 'min') return Math.min(...vals)
      if (op === 'max') return Math.max(...vals)
      return 0
    }
    const fmt = (v: number, isInt: boolean) =>
      isInt ? String(Math.round(v)) : v.toFixed(2).replace(/\.00$/, '')

    for (const col of visibleColumns) {
      if (isNonField(col)) continue
      const meta = fields[col.name]
      if (!meta || !numericTypes.includes(meta.type)) continue
      const isInt = meta.type === 'integer'

      // Collect values for each aggregate operator
      const ops: Array<{ key: 'sum' | 'avg' | 'min' | 'max'; label: string }> = []
      if (col.sum) ops.push({ key: 'sum', label: col.sum })
      if (col.avg) ops.push({ key: 'avg', label: col.avg })
      if (col.min) ops.push({ key: 'min', label: col.min })
      if (col.max) ops.push({ key: 'max', label: col.max })
      if (!ops.length) continue

      if (meta.type === 'monetary') {
        const byCurrency = new Map<string, number[]>()
        for (const r of rows) {
          const curId = (r.currency_id as [number, string] | undefined)?.[1]
          const curKey = curId ?? 'default'
          const arr = byCurrency.get(curKey) ?? []
          arr.push(Number(r[col.name]) || 0)
          byCurrency.set(curKey, arr)
        }
        for (const op of ops) {
          if (byCurrency.size <= 1) {
            const vals = [...byCurrency.values()][0] ?? []
            result[`${col.name}_${op.key}`] = { label: op.label, value: fmt(compute(vals, op.key), false) }
          } else {
            const parts = [...byCurrency.entries()].map(
              ([cur, vals]) => `${fmt(compute(vals, op.key), false)} ${cur}`,
            )
            result[`${col.name}_${op.key}`] = { label: op.label, value: parts.join(' / ') }
          }
        }
      } else {
        const vals = rows.map((r) => Number(r[col.name]) || 0)
        for (const op of ops) {
          result[`${col.name}_${op.key}`] = { label: op.label, value: fmt(compute(vals, op.key), isInt) }
        }
      }
    }
    return result
  }, [data, visibleColumns, fields, groupData])

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
      setInlineEdit({ mode: 'idle', values: {} })
      setValidationErrors({})
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
      setSelectedIds(new Set())
      invalidateList()
    },
  })

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids: number[]) => recordArchive.mutateAsync(ids),
    onSuccess: () => {
      setSelectedIds(new Set())
      invalidateList()
    },
  })

  const bulkUnarchiveMutation = useMutation({
    mutationFn: (ids: number[]) => recordUnarchive.mutateAsync(ids),
    onSuccess: () => {
      setSelectedIds(new Set())
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
      setSelectedIds(new Set())
      setMultiEditActive(false)
      setMultiEditValues({})
      invalidateList()
    },
  })

  const handleDrop = useCallback(
    (fromIdx: number, toIdx: number) => {
      const rows = data as Array<Record<string, unknown>>
      const rowsCopy = [...rows]
      const [moved] = rowsCopy.splice(fromIdx, 1)
      rowsCopy.splice(toIdx, 0, moved)
      const sequenceField = visibleColumns.filter(isViewField).find((c) => c.name === 'sequence')?.name ?? 'sequence'
      const ids = rowsCopy.map((r) => r.id as number)
      resequenceMutation.mutate({ ids, field: sequenceField })
      setDragRow(null)
      setDragOverRow(null)
    },
    [data, visibleColumns, resequenceMutation],
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
      setInlineEdit({
        mode: 'editing',
        recordId: record.id as number,
        values: { ...record },
      })
      setFocusCol(editableColIndices[0] ?? 0)
    },
    [isEditable, onRowClick, editableColIndices, listView.noOpen, listView.openFormView],
  )

  const handleInlineChange = useCallback((fieldName: string, value: unknown) => {
    setInlineEdit((prev) => ({
      ...prev,
      values: { ...prev.values, [fieldName]: value },
    }))
  }, [])

  const handleInlineSave = useCallback(() => {
    if (inlineEdit.mode === 'idle') return
    const errors: Record<string, string> = {}
    for (const col of visibleColumns) {
      if (isNonField(col)) continue
      const meta = fields[col.name]
      if (!meta || meta.readonly || col.readonly) continue
      const val = inlineEdit.values[col.name]
      if (col.required || meta.required) {
        if (val === null || val === undefined || val === false || val === '') {
          errors[col.name] = 'Required'
        }
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors({})
    saveMutation.mutate({
      mode: inlineEdit.mode as 'editing' | 'creating',
      values: inlineEdit.values,
      recordId: inlineEdit.recordId,
    })
  }, [inlineEdit, saveMutation, visibleColumns, fields])

  const handleInlineCancel = useCallback(() => {
    setInlineEdit({ mode: 'idle', values: {} })
    setValidationErrors({})
  }, [])

  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (inlineEdit.mode === 'idle') {
        const rows = data as Array<Record<string, unknown>>
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setFocusRow((prev) => Math.min(prev + 1, rows.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setFocusRow((prev) => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && focusRow >= 0 && focusRow < rows.length && !listView.noOpen) {
          e.preventDefault()
          onRowClick?.(rows[focusRow].id as number)
        } else if (e.key === 'F2' && focusRow >= 0 && focusRow < rows.length && isEditable) {
          e.preventDefault()
          const record = rows[focusRow]
          setInlineEdit({
            mode: 'editing',
            recordId: record.id as number,
            values: { ...record },
          })
          setFocusCol(editableColIndices[0] ?? 0)
        } else if (e.key === 'a' && (e.ctrlKey || e.metaKey) && !groupByActive) {
          e.preventDefault()
          setSelectedIds(new Set(rows.map((r) => r.id as number)))
        } else if (e.key === ' ' && e.shiftKey && focusRow >= 0 && focusRow < rows.length) {
          e.preventDefault()
          const id = rows[focusRow].id as number
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
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
        const idx = editableColIndices.indexOf(focusCol)
        if (idx < editableColIndices.length - 1) {
          moveFocus(1)
        } else if (inlineEdit.mode === 'editing') {
          // Tab from last editable column → move to next record
          const rows = data as Array<Record<string, unknown>>
          const currentIdx = rows.findIndex((r) => r.id === inlineEdit.recordId)
          if (currentIdx >= 0 && currentIdx < rows.length - 1) {
            handleInlineSave()
            const nextRecord = rows[currentIdx + 1]
            setTimeout(() => {
              setInlineEdit({ mode: 'editing', recordId: nextRecord.id as number, values: { ...nextRecord } })
              setFocusCol(editableColIndices[0] ?? 0)
            }, 100)
          }
        }
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        const idx = editableColIndices.indexOf(focusCol)
        if (idx > 0) {
          moveFocus(-1)
        } else if (inlineEdit.mode === 'editing') {
          // Shift+Tab from first editable column → move to previous record
          const rows = data as Array<Record<string, unknown>>
          const currentIdx = rows.findIndex((r) => r.id === inlineEdit.recordId)
          if (currentIdx > 0) {
            handleInlineSave()
            const prevRecord = rows[currentIdx - 1]
            setTimeout(() => {
              setInlineEdit({ mode: 'editing', recordId: prevRecord.id as number, values: { ...prevRecord } })
              setFocusCol(editableColIndices[editableColIndices.length - 1] ?? 0)
            }, 100)
          }
        }
      }
    },
    [
      inlineEdit.mode,
      handleInlineCancel,
      handleInlineSave,
      editableColIndices,
      focusCol,
      focusRow,
      moveFocus,
      data,
      onRowClick,
      isEditable,
      groupByActive,
    ],
  )

  const handleAddRow = useCallback(() => {
    const defaults: Record<string, unknown> = {}
    for (const col of visibleColumns.filter(isViewField)) {
      const meta = fields[col.name]
      if (meta) defaults[col.name] = defaultForType(meta.type)
    }
    setInlineEdit({ mode: 'creating', values: defaults })
  }, [visibleColumns, fields])

  // Column management (14.1)
  const toggleColumn = useCallback(
    (name: string) => {
      setHiddenCols((prev) => {
        const next = new Set(prev)
        if (next.has(name)) next.delete(name)
        else next.add(name)
        setColumnPrefs(model, [...next])
        return next
      })
    },
    [model],
  )

  // Warn before leaving page with unsaved inline edits
  useEffect(() => {
    if (inlineEdit.mode === 'idle') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [inlineEdit.mode])

  // Click outside table to close edit mode
  useEffect(() => {
    if (inlineEdit.mode === 'idle') return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('table') || target.closest('[data-edit-panel]')) return
      handleInlineCancel()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [inlineEdit.mode, handleInlineCancel])

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
  const expandedGroupPaths = useMemo(() => [...expandedGroups].sort(), [expandedGroups])

  // Top-level group queries
  const topLevelQueries = useQueries({
    queries: expandedGroupPaths
      .filter((p) => !p.includes('-'))
      .map((path) => {
        const index = Number(path)
        const isLeaf = groupBy.length <= 1
        const domain = groupData?.[index]?.__domain ?? []
        const gLimit = groupLimit + (groupExtraLimits[path] ?? 0)
        return {
          queryKey: ['odoo', 'group-data', model, path, domain, order, groupBy.length, gLimit],
          queryFn: () =>
            isLeaf
              ? callKw<Array<Record<string, unknown>>>(
                  model,
                  'search_read',
                  [domain, fieldColumnNames],
                  {
                    limit: gLimit,
                    order: order || undefined,
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

      const gLimit = groupLimit + (groupExtraLimits[path] ?? 0)
      return {
        queryKey: ['odoo', 'group-data', model, path, domain, order, gLimit],
        queryFn: () =>
          isLeaf
            ? callKw<Array<Record<string, unknown>>>(
                model,
                'search_read',
                [domain, fieldColumnNames],
                { limit: gLimit, order: order || undefined },
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

  const toggleGroupExpand = useCallback((path: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        // Collapse: also remove all children
        for (const p of prev) {
          if (p.startsWith(`${path}-`)) next.delete(p)
        }
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  // Column resize handler
  const startResize = useCallback(
    (colName: string, e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = colWidths[colName] ?? 120
      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX
        setColWidths((prev) => ({ ...prev, [colName]: Math.max(60, startWidth + delta) }))
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [colWidths],
  )

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
          selectedIds={selectedIds.size > 0 ? selectedIds : undefined}
          onClose={() => closeDialog(dialogId)}
        />
      ),
    })
  }, [data, openDialog, closeDialog, model, listView.string, fields, selectedIds])

  const editableFieldElements = useMemo(
    () => visibleColumns.map((col) => (isNonField(col) ? null : viewFieldToFieldElement(col))),
    [visibleColumns],
  )

  const pageRecordIds = useMemo(
    () => (data as Array<Record<string, unknown>>).map((r) => r.id as number),
    [data],
  )

  const allSelected = pageRecordIds.length > 0 && pageRecordIds.every((id) => selectedIds.has(id))
  const someSelected = selectedIds.size > 0 && !allSelected
  const [lastSelectedIdx, setLastSelectedIdx] = useState(-1)

  const { data: allMatchingIds } = useQuery({
    queryKey: ['odoo', 'allIds', model, domain],
    queryFn: () => callKw<number[]>(model, 'search', [domain]),
    enabled:
      selectedIds.size > 0 && !groupByActive && !!totalCount && selectedIds.size < totalCount,
    staleTime: 30_000,
  })

  const selectAllAcrossPages = useCallback(() => {
    if (allMatchingIds) {
      setSelectedIds(new Set(allMatchingIds))
    }
  }, [allMatchingIds])

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pageRecordIds))
    }
  }, [allSelected, pageRecordIds])

  const toggleRow = useCallback(
    (id: number, shiftKey: boolean, index: number) => {
      setSelectedIds((prev) => {
        if (shiftKey && lastSelectedIdx >= 0 && !groupByActive) {
          const rows = data as Array<Record<string, unknown>>
          const start = Math.min(lastSelectedIdx, index)
          const end = Math.max(lastSelectedIdx, index)
          const rangeIds = rows.slice(start, end + 1).map((r) => r.id as number)
          const next = new Set(prev)
          for (const rid of rangeIds) next.add(rid)
          return next
        }
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      setLastSelectedIdx(index)
    },
    [data, lastSelectedIdx, groupByActive],
  )

  // Recursive group node renderer
  const renderGroupNode = useCallback(
    (path: string, group: ReadGroupResult | Record<string, unknown>, depth: number) => {
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
              if (isNonField(col)) {
                return <td key={`gd-${ci}`} className="px-2 py-2" />
              }
              const isGroupField = groupBy[depth] === col.name
              const val = (group as Record<string, unknown>)[col.name]
              const meta = fields[col.name]
              return (
                <td
                  key={`gd-${col.name}-${ci}`}
                  className="whitespace-nowrap px-4 py-2 text-sm text-text-primary"
                >
                  {isGroupField ? (
                    <>
                      <span className="font-medium">{renderCell(val, meta)}</span>
                      <span className="ml-1.5 rounded bg-hover px-1 py-0.5 text-[10px] text-text-muted">
                        {String(count)}
                      </span>
                      {listView.groupDelete && meta?.type === 'many2one' && Array.isArray(val) && val[0] && (
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
                          className="ml-2 rounded px-1 py-0 text-[10px] text-text-muted hover:text-red-400"
                        >
                          ×
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-text-muted">
                      {val !== undefined && val !== null ? renderCell(val, meta) : ''}
                    </span>
                  )}
                </td>
              )
            })}
          </tr>
          {isExpanded &&
            !isLeaf &&
            subGroups &&
            subGroups.length > 0 &&
            subGroups.map((subGroup, si) => renderGroupNode(`${path}-${si}`, subGroup, depth + 1))}
          {isExpanded &&
            isLeaf &&
            groupRecords &&
            groupRecords.length > 0 &&
            groupRecords.map((record) => {
              const recordId = record.id as number
              const rowDeco = getDecorationClass(
                listView.decorations as unknown as Record<string, unknown>,
                record,
              )
              return (
                <tr
                  key={`gr-${path}-${recordId}`}
                  onClick={() => handleRowClick(record)}
                  className={[
                    'border-b border-border-subtle bg-root/50 transition-colors hover:bg-hover/50',
                    selectedIds.has(recordId) ? 'bg-accent/5' : '',
                    !isEditable && onRowClick && !listView.noOpen ? 'cursor-pointer' : '',
                    rowDeco,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="w-10 px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(recordId)}
                      onChange={() => toggleRow(recordId, false, 0)}
                      className="accent-accent"
                    />
                  </td>
                  {visibleColumns.map((col, ci) => {
                    if (isNonField(col)) {
                      return (
                        <td
                          key={`grd-${ci}`}
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
                    return (
                      <td
                        key={`grd-${col.name}-${ci}`}
                        className={[
                          'whitespace-nowrap px-4 py-2 text-sm text-text-primary',
                          cellDeco,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {renderCell(record[col.name], fields[col.name])}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          {isExpanded && isLeaf && groupRecords && groupRecords.length >= groupLimit && (
            <tr>
              <td
                colSpan={visibleColumns.length + 1}
                className="px-4 py-1 text-center"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setGroupExtraLimits((prev) => ({
                      ...prev,
                      [path]: (prev[path] ?? 0) + groupLimit,
                    }))
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
    },
    [
      expandedGroups,
      groupQueryMap,
      groupBy,
      fieldColumnNames,
      visibleColumns,
      fields,
      toggleGroupExpand,
      listView.decorations,
      listView.groupDelete,
      confirmDialog,
      handleRowClick,
      selectedIds,
      isEditable,
      onRowClick,
      toggleRow,
      model,
      invalidateList,
    ],
  )

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{listView.string || model}</h3>
          {!groupByActive && data.length > 0 && listView.exportXlsx !== false && (
            <>
              <button
                type="button"
                onClick={handleExportClick}
                className="rounded border border-border-default px-2 py-0.5 text-[10px] text-text-muted hover:bg-hover hover:text-text-primary"
              >
                Export
              </button>
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
                    {allVisibleColumns
                      .filter(isViewField)
                      .map((col) => {
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
                              className="accent-accent"
                            />
                            {label}
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditable && inlineEdit.mode === 'idle' && listView.create !== false && (
            <button
              type="button"
              onClick={handleAddRow}
              className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent/90"
            >
              {listView.controlButtons?.find((b) => b.type === 'create')?.string ?? 'Add'}
            </button>
          )}
          <span className="text-xs text-text-muted">
            {groupByActive
              ? `${groupData?.length ?? 0} groups`
              : totalCount != null
                ? `${offset + 1}-${Math.min(offset + data.length, totalCount)} / ${totalCount}${listView.countLimit && totalCount >= listView.countLimit ? '+' : ''}`
                : `${data.length} record${data.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error instanceof Error ? error.message : t('list.failedToLoad')}
        </div>
      )}

      {!isLoading && !error && data.length === 0 && inlineEdit.mode !== 'creating' && (
        <div className="rounded-lg border border-border-subtle bg-surface/50 py-12 text-center text-sm text-text-muted">
          {t('list.noRecords')}
        </div>
      )}

      {(!isLoading && !error && data.length > 0) || inlineEdit.mode === 'creating' ? (
        <>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2">
              <span className="text-xs font-medium text-accent">
                {selectedIds.size} selected
                {!groupByActive && !!totalCount && selectedIds.size < totalCount && (
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
                    message: `Are you sure you want to delete ${selectedIds.size} selected record(s)?`,
                    confirmLabel: 'Delete',
                    variant: 'danger',
                    onConfirm: () => bulkDeleteMutation.mutate([...selectedIds]),
                  })
                }}
                disabled={bulkDeleteMutation.isPending}
                className="rounded border border-red-400/30 px-2 py-0.5 text-[11px] text-red-400 hover:bg-red-400/10 disabled:opacity-50"
              >
                Delete
              </button>
              {selectedIds.size === 1 && (
                <button
                  type="button"
                  onClick={() => duplicateMutation.mutate([...selectedIds][0])}
                  disabled={duplicateMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Duplicate
                </button>
              )}
              {hasActiveField && (
                <button
                  type="button"
                  onClick={() => bulkArchiveMutation.mutate([...selectedIds])}
                  disabled={bulkArchiveMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Archive
                </button>
              )}
              {hasActiveField && (
                <button
                  type="button"
                  onClick={() => bulkUnarchiveMutation.mutate([...selectedIds])}
                  disabled={bulkUnarchiveMutation.isPending}
                  className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover disabled:opacity-50"
                >
                  Unarchive
                </button>
              )}
              {isEditable && selectedIds.size > 1 && (
                <button
                  type="button"
                  onClick={() => setMultiEditActive(true)}
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
                onClick={() => setSelectedIds(new Set())}
                className="rounded px-2 py-0.5 text-[11px] text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>
          )}
          {multiEditActive && selectedIds.size > 1 && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
              <div className="mb-2 text-xs font-semibold text-accent">
                Edit {selectedIds.size} records
              </div>
              <div className="flex flex-wrap gap-3">
                {visibleColumns
                  .filter(isViewField)
                  .map((col) => {
                    const meta = fields[col.name]
                    if (!meta || meta.readonly || col.readonly) return null
                    return (
                      <div key={col.name} className="flex items-center gap-1.5">
                        <label className="text-[11px] text-text-secondary">
                          {col.string || meta.string || col.name}
                        </label>
                        <input
                          type={meta.type === 'boolean' ? 'checkbox' : 'text'}
                          checked={
                            meta.type === 'boolean' ? !!multiEditValues[col.name] : undefined
                          }
                          value={
                            meta.type !== 'boolean'
                              ? String(multiEditValues[col.name] ?? '')
                              : undefined
                          }
                          onChange={(e) =>
                            setMultiEditValues((prev) => ({
                              ...prev,
                              [col.name]:
                                meta.type === 'boolean' ? e.target.checked : e.target.value,
                            }))
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
                    for (const [k, v] of Object.entries(multiEditValues)) {
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
                      message: `You are about to update ${selectedIds.size} records. Fields: ${changes}`,
                      confirmLabel: 'Apply',
                      onConfirm: () => bulkWriteMutation.mutate({ ids: [...selectedIds], values: edited }),
                    })
                  }}
                  disabled={bulkWriteMutation.isPending}
                  className="rounded bg-accent px-3 py-1 text-[11px] font-medium text-white hover:bg-accent/90 disabled:opacity-50"
                >
                  {bulkWriteMutation.isPending ? 'Saving...' : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMultiEditActive(false)
                    setMultiEditValues({})
                  }}
                  className="rounded border border-border-default px-3 py-1 text-[11px] text-text-secondary hover:bg-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div ref={tableContainerRef} className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full" onKeyDown={handleTableKeyDown}>
              <thead>
                <tr className="border-b border-border-subtle bg-surface/50">
                  <th className="w-10 px-2 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={toggleAll}
                      className="accent-accent"
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
                        {!groupByActive && (
                        <span className="ml-1">{sortIcon(col.name)}</span>
                        )}
                        {!groupByActive && (
                          <div
                            className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-accent/30"
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
                {inlineEdit.mode === 'creating' && listView.editable !== 'bottom' && (
                  <InlineEditRow
                    columns={visibleColumns}
                    fieldElements={editableFieldElements}
                    fields={fields}
                    values={inlineEdit.values}
                    onChange={handleInlineChange}
                    onSave={handleInlineSave}
                    onCancel={handleInlineCancel}
                    isSaving={saveMutation.isPending}
                    validationErrors={validationErrors}
                  />
                )}
                {groupByActive && groupData
                  ? <>
                    {groupData.map((group, i) => renderGroupNode(String(i), group, 0))}
                    {listView.groupCreate && groupBy.length === 1 && fields[groupBy[0]]?.type === 'many2one' && (
                      <tr>
                        <td className="w-10 px-2 py-2" />
                        <td colSpan={visibleColumns.length} className="px-4 py-1">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              if (newGroupName.trim()) createGroupMutation.mutate(newGroupName.trim())
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
                              className="rounded bg-accent px-2 py-0.5 text-[10px] text-white hover:bg-accent/90 disabled:opacity-50"
                            >
                              Add
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </>
                  : (data as Array<Record<string, unknown>>).map((record, i) => {
                      const recordId = record.id as number
                      const isEditing =
                        inlineEdit.mode === 'editing' && inlineEdit.recordId === recordId
                      const rowDeco = getDecorationClass(
                        listView.decorations as unknown as Record<string, unknown>,
                        record,
                      )
                      return (
                        <tr
                          key={recordId}
                          draggable={hasHandle && !isEditing}
                          onDragStart={
                            hasHandle
                              ? (e) => {
                                  setDragRow(i)
                                  e.dataTransfer.effectAllowed = 'move'
                                }
                              : undefined
                          }
                          onDragOver={
                            hasHandle
                              ? (e) => {
                                  e.preventDefault()
                                  setDragOverRow(i)
                                }
                              : undefined
                          }
                          onDragEnd={
                            hasHandle
                              ? () => {
                                  setDragRow(null)
                                  setDragOverRow(null)
                                }
                              : undefined
                          }
                          onDrop={
                            hasHandle
                              ? () => {
                                  if (dragRow !== null && dragRow !== i) handleDrop(dragRow, i)
                                }
                              : undefined
                          }
                          onClick={() => !isEditing && handleRowClick(record)}
                          className={[
                            'border-b border-border-subtle transition-colors hover:bg-hover/50',
                            isEditing ? 'bg-accent/5' : '',
                            selectedIds.has(recordId) ? 'bg-accent/5' : '',
                            !isEditable && onRowClick && !listView.noOpen ? 'cursor-pointer' : '',
                            isEditable ? 'cursor-pointer' : '',
                            dragOverRow === i && dragRow !== null
                              ? 'border-t-2 border-t-accent'
                              : '',
                            i === data.length - 1 && inlineEdit.mode !== 'creating'
                              ? 'border-b-0'
                              : '',
                            focusRow === i && inlineEdit.mode === 'idle'
                              ? 'outline outline-2 outline-accent/30 outline-offset-[-2px]'
                              : '',
                            rowDeco,
                            listView.rowClass ?? '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <td className="w-10 px-2 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(recordId)}
                              onChange={() => toggleRow(recordId, false, i)}
                              onClick={(e) => toggleRow(recordId, e.shiftKey, i)}
                              className="accent-accent"
                            />
                          </td>
                          {visibleColumns.map((col, ci) => {
                            if (isNonField(col)) {
                              return (
                                <td
                                  key={`d-${ci}`}
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
                              const hasError = !!validationErrors[col.name]
                              return (
                                <td
                                  key={`d-${col.name}-${ci}`}
                                  className={`whitespace-nowrap px-1 py-0.5${hasError ? ' ring-1 ring-red-400 ring-inset' : ''}`}
                                  title={hasError ? validationErrors[col.name] : undefined}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {createElement(Widget, {
                                    field: fe,
                                    value: inlineEdit.values[col.name],
                                    onChange: (v: unknown) => handleInlineChange(col.name, v),
                                    readOnly: false,
                                    meta,
                                  })}
                                </td>
                              )
                            }

                            return (
                              <td
                                key={`d-${col.name}-${ci}`}
                                title={(() => {
                                  const t = renderCell(record[col.name], fields[col.name])
                                  return t.length > 30 ? t : undefined
                                })()}
                                className={[
                                  'whitespace-nowrap px-4 py-2 text-sm text-text-primary',
                                  cellDeco,
                                  col.class ?? '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => {
                                  if (isEditable && !isReadonly && meta?.type === 'boolean') {
                                    toggleBooleanMutation.mutate({
                                      recordId,
                                      field: col.name,
                                      value: !record[col.name],
                                    })
                                  }
                                }}
                                style={isEditable && !isReadonly && meta?.type === 'boolean' ? { cursor: 'pointer' } : undefined}
                              >
                                {renderCell(record[col.name], fields[col.name])}
                              </td>
                            )
                          })}
                          {isEditing && (
                            <td
                              className="flex items-center gap-1 px-2 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={handleInlineSave}
                                disabled={saveMutation.isPending}
                                className="rounded bg-accent px-2 py-0.5 text-[11px] font-medium text-white hover:bg-accent/90 disabled:opacity-50"
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
                            <td
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
                                  className="text-xs text-text-muted hover:text-red-500"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                {inlineEdit.mode === 'creating' && listView.editable === 'bottom' && (
                  <InlineEditRow
                    columns={visibleColumns}
                    fieldElements={editableFieldElements}
                    fields={fields}
                    values={inlineEdit.values}
                    onChange={handleInlineChange}
                    onSave={handleInlineSave}
                    onCancel={handleInlineCancel}
                    isSaving={saveMutation.isPending}
                    validationErrors={validationErrors}
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
                      if (!colAggs.length) return <td key={`f-${col.name}`} className="px-4 py-2" />
                      return (
                        <td
                          key={`f-${col.name}`}
                          className="whitespace-nowrap px-4 py-2 text-sm text-text-primary"
                        >
                          {colAggs.map((a, i) => (
                            <span key={i}>{i > 0 ? ' · ' : ''}{a.label}: {a.value}</span>
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

          {!groupByActive && totalCount != null && (
            <Pagination
              offset={offset}
              total={totalCount}
              limit={limit}
              onPageChange={(newOffset) => {
                if (tableContainerRef.current) savedScrollTop.current = tableContainerRef.current.scrollTop
                setOffset(newOffset)
              }}
              onLimitChange={(newLimit) => {
                setLimit(newLimit)
                setOffset(0)
              }}
            />
          )}
        </>
      ) : null}
    </div>
  )
}

function InlineEditRow({
  columns,
  fieldElements,
  fields,
  values,
  onChange,
  onSave,
  onCancel,
  isSaving,
  validationErrors = {},
}: {
  columns: ListColumn[]
  fieldElements: (FieldElement | null)[]
  fields: Record<string, OdooFieldMeta>
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  validationErrors?: Record<string, string>
}) {
  return (
    <tr className="border-b border-border-subtle bg-accent/5">
      <td className="w-10 px-2 py-2" />
      {columns.map((col, ci) => {
        if (isNonField(col)) {
          return <td key={`new-${ci}`} className="px-2 py-2" />
        }
        const meta = fields[col.name]
        const isReadonly = meta?.readonly || col.readonly
        const fe = fieldElements[ci] as FieldElement
        const Widget = getFieldWidget(fe, meta?.type ?? 'char')
        const hasError = !!validationErrors[col.name]
        return (
          <td
            key={`new-${col.name}-${ci}`}
            className={`whitespace-nowrap px-1 py-0.5${hasError ? ' ring-1 ring-red-400 ring-inset' : ''}`}
            title={hasError ? validationErrors[col.name] : undefined}
          >
            {createElement(Widget, {
              field: fe,
              value: values[col.name],
              onChange: (v: unknown) => onChange(col.name, v),
              readOnly: isReadonly,
              meta,
            })}
          </td>
        )
      })}
      <td className="flex items-center gap-1 px-2 py-1">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded bg-accent px-2 py-0.5 text-[11px] font-medium text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {isSaving ? '...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-border-default px-2 py-0.5 text-[11px] text-text-secondary hover:bg-hover"
        >
          Cancel
        </button>
      </td>
    </tr>
  )
}

function defaultForType(type: string): unknown {
  if (type === 'boolean') return false
  if (type === 'integer' || type === 'float' || type === 'monetary') return 0
  return false
}

function ListButtonCell({
  btn,
  record,
  model,
  onDone,
}: {
  btn: ListButtonElement
  record: Record<string, unknown>
  model: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  // states filter: e.g. states="draft,sent" → only show when state is in list
  if (btn.states) {
    const allowed = btn.states.split(',').map((s) => s.trim())
    const currentState = String(record.state ?? '')
    if (!allowed.includes(currentState)) return null
  }

  const handleClick = async () => {
    if (btn.confirm && !window.confirm(btn.confirm)) return
    setLoading(true)
    try {
      if (btn.buttonType === 'object') {
        await callKw(model, btn.name, [[record.id as number]])
      } else if (btn.buttonType === 'action') {
        await callKw(model, 'button_execute', [[record.id as number]], { action_name: btn.name })
      }
      onDone()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
        btn.class?.includes('btn-primary')
          ? 'bg-accent text-white hover:bg-accent/90'
          : 'border border-border-default text-text-secondary hover:bg-hover hover:text-text-primary'
      } disabled:opacity-50`}
    >
      {loading ? '...' : btn.string || btn.name}
    </button>
  )
}
