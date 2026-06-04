import type { O2mCommand, OdooFieldMeta, ViewField } from '@odooseek/odoo-client'
import { callKw, evalCondition, fieldsGet } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FormLayoutNode } from '../../form/FormLayoutNode'
import type { FieldWidgetProps } from '../index'
import { normalizeO2mValue, O2mCellDisplay, O2mCellEdit } from './shared.tsx'

export function One2ManyWidget({ field, value, onChange, readOnly, meta }: FieldWidgetProps) {
  const relation = meta?.relation
  const subViewList = field.subViews?.list
  const columnDefs = subViewList?.columns
  const editable = !readOnly && subViewList?.editable
  const decorations = subViewList?.decorations ?? {}

  // Auto-discover fields when no sub-view is defined
  const { data: autoFields } = useQuery({
    queryKey: ['odoo', 'fields_get', relation],
    queryFn: () =>
      fieldsGet<Record<string, OdooFieldMeta>>(
        relation as string,
        [],
        ['string', 'type', 'relation', 'selection', 'required'],
      ),
    enabled: !!relation,
  })

  const columns = useMemo<ViewField[]>(() => {
    if (columnDefs) return columnDefs
    if (!autoFields) return []
    return Object.entries(autoFields)
      .filter(([name]) => !['id', 'display_name', 'create_date', 'write_date'].includes(name))
      .slice(0, 6)
      .map(([name, f]) => ({ name, string: f.string, widget: f.widget, required: f.required }))
  }, [columnDefs, autoFields])

  const fieldNames = useMemo(() => columns.map((c) => c.name), [columns])

  // Resolve record IDs to full data
  const ids = normalizeO2mValue(value)
  const { data: records, isLoading } = useQuery({
    queryKey: ['odoo', 'read', relation, ids, fieldNames],
    queryFn: () =>
      callKw<Array<Record<string, unknown>>>(relation as string, 'read', [ids, fieldNames]),
    enabled: !!relation && ids.length > 0 && fieldNames.length > 0,
  })

  // Local ORM commands for pending changes
  const [pendingCommands, setPendingCommands] = useState<O2mCommand[]>([])

  // Inline editing state: which record row is being edited
  const [editingId, setEditingId] = useState<unknown>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [cellErrors, setCellErrors] = useState<Set<string>>(new Set())
  // Draft rows: new rows not yet explicitly saved — not in pendingCommands
  const [draftRows, setDraftRows] = useState<Map<number, Record<string, unknown>>>(new Map())
  const tempIdCounter = useRef(0)

  const emitChange = useCallback(
    (commands: O2mCommand[]) => {
      setPendingCommands(commands)
      if (commands.length > 0) {
        onChange(commands)
      } else {
        onChange(ids.length > 0 ? [[6, 0, ids]] : false)
      }
    },
    [onChange, ids],
  )

  const handleDelete = useCallback(
    (recordId: number) => {
      // Draft rows: just remove from drafts, no server command needed
      if (draftRows.has(recordId)) {
        setDraftRows((prev) => {
          const next = new Map(prev)
          next.delete(recordId)
          return next
        })
        if (editingId === recordId) {
          setEditingId(null)
          setEditValues({})
        }
        return
      }
      const cmds = [...pendingCommands, [2, recordId] as O2mCommand]
      emitChange(cmds)
    },
    [pendingCommands, emitChange, draftRows, editingId],
  )

  const handleAddRow = useCallback(async () => {
    if (!relation) return
    const defaults = await callKw<Record<string, unknown>>(relation, 'default_get', [fieldNames])
    const tempId = -++tempIdCounter.current
    if (editable) {
      setEditValues(defaults)
      setEditingId(tempId)
    }
    setDraftRows((prev) => {
      const next = new Map(prev)
      next.set(tempId, defaults)
      return next
    })
  }, [relation, fieldNames, editable])

  const handleCellChange = useCallback((_recordId: unknown, colName: string, val: unknown) => {
    setEditValues((prev) => ({ ...prev, [colName]: val }))
    setSaveError(null)
    setCellErrors((prev) => {
      if (!prev.has(colName)) return prev
      const next = new Set(prev)
      next.delete(colName)
      return next
    })
  }, [])

  const handleSaveEdit = useCallback(
    (recordId: unknown) => {
      // Validate required columns
      const errors = new Set<string>()
      for (const col of columns) {
        const isRequired = col.required || autoFields?.[col.name]?.required
        if (isRequired && !editValues[col.name]) {
          errors.add(col.name)
        }
      }
      if (errors.size > 0) {
        setCellErrors(errors)
        const labels = Array.from(errors).map(
          (name) =>
            columns.find((c) => c.name === name)?.string || autoFields?.[name]?.string || name,
        )
        setSaveError(`Required: ${labels.join(', ')}`)
        return
      }
      setCellErrors(new Set())
      setSaveError(null)

      const isNew = typeof recordId === 'number' && recordId < 0
      if (isNew) {
        // Move from draft to pending commands
        setDraftRows((prev) => {
          const next = new Map(prev)
          next.delete(recordId)
          return next
        })
        const cmds = [...pendingCommands, [0, recordId, { ...editValues }] as O2mCommand]
        emitChange(cmds)
      } else {
        const hasUpdate = pendingCommands.some((c) => c[0] === 1 && c[1] === recordId)
        let cmds: O2mCommand[]
        if (hasUpdate) {
          cmds = pendingCommands.map((cmd) => {
            if (cmd[0] === 1 && cmd[1] === recordId)
              return [1, recordId, { ...(cmd[2] ?? {}), ...editValues }] as O2mCommand
            return cmd
          })
        } else {
          cmds = [...pendingCommands, [1, recordId, editValues] as O2mCommand]
        }
        emitChange(cmds)
      }
      setEditingId(null)
      setEditValues({})
    },
    [pendingCommands, editValues, emitChange, columns, autoFields],
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValues({})
    setSaveError(null)
    setCellErrors(new Set())
  }, [])

  const handleStartEdit = useCallback(
    (record: Record<string, unknown>) => {
      const rid = record.id
      setEditingId(rid)
      setSaveError(null)
      setCellErrors(new Set())
      const initialValues: Record<string, unknown> = {}
      for (const col of columns) {
        initialValues[col.name] = record[col.name]
      }
      setEditValues(initialValues)
    },
    [columns],
  )

  // Merge server records with pending commands and draft rows
  const displayRecords = useMemo(() => {
    const base = (records ?? []).map((r) => ({ ...r }))
    for (const cmd of pendingCommands) {
      if (cmd[0] === 0 && cmd[2]) {
        base.push({ id: cmd[1], ...cmd[2] } as Record<string, unknown>)
      } else if (cmd[0] === 2) {
        const delIdx = base.findIndex((r) => r.id === cmd[1])
        if (delIdx >= 0) base.splice(delIdx, 1)
      } else if (cmd[0] === 1 && cmd[2]) {
        const upd = base.find((r) => r.id === cmd[1])
        if (upd) Object.assign(upd, cmd[2])
      }
    }
    // Append draft rows (not yet committed to commands)
    for (const [tempId, values] of draftRows) {
      if (typeof tempId === 'number' && tempId < 0) {
        base.push({ id: tempId, ...values } as Record<string, unknown>)
      }
    }
    return base
  }, [records, pendingCommands, draftRows])

  // Compute decoration class for a row
  const getRowClass = useCallback(
    (record: Record<string, unknown>) => {
      if (!decorations || Object.keys(decorations).length === 0) return ''
      let cls = ''
      for (const [expr, className] of Object.entries(decorations)) {
        if (evalCondition(expr, record)) cls += ` ${className}`
      }
      return cls.trim()
    },
    [decorations],
  )

  const subViewForm = field.subViews?.form
  const hasSubForm = !!subViewForm?.elements?.length

  if (!relation) return <span className="text-sm text-text-muted">—</span>

  return (
    <div className="rounded-lg border border-border-subtle overflow-x-auto">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!isLoading && displayRecords.length === 0 && !editable && (
        <div className="px-4 py-6 text-center text-sm text-text-muted">No records</div>
      )}

      {(!isLoading && displayRecords.length > 0 && columns.length > 0) || editable ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-surface/50">
              {columns.map((col, i) => {
                const colMeta = autoFields?.[col.name]
                return (
                  <th
                    key={`o2m-h-${col.name}-${i}`}
                    className="whitespace-nowrap px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  >
                    {col.string || colMeta?.string || col.name}
                  </th>
                )
              })}
              {(!readOnly || editable) && subViewList?.delete !== false && (
                <th className="w-8 px-1 py-1.5" />
              )}
            </tr>
          </thead>
          <tbody>
            {displayRecords.map((record) => {
              const rowId = record.id
              const isEditing = editingId === rowId
              const decoClass = getRowClass(record)
              const useSubForm = isEditing && hasSubForm

              if (useSubForm && subViewForm) {
                const { elements } = subViewForm
                return (
                  <tr key={String(rowId)} className={`border-b border-border-subtle ${decoClass}`}>
                    <td
                      colSpan={columns.length + (subViewList?.delete !== false ? 1 : 0)}
                      className="px-2 py-2"
                    >
                      <div className="o_form_sheet_bg">
                        <FormLayoutNode
                          elements={elements}
                          record={editValues}
                          fields={autoFields ?? {}}
                          model={relation ?? ''}
                          editMode
                          onChange={(name, v) => handleCellChange(rowId, name, v)}
                        />
                      </div>
                      {subViewList?.delete !== false && (
                        <div className="mt-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(rowId)}
                            className="text-xs text-accent hover:text-accent/80"
                            title="Save"
                          >
                            ✓ Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs text-text-muted hover:text-danger"
                            title="Cancel"
                          >
                            ✕ Cancel
                          </button>
                          {saveError && (
                            <span className="text-[10px] text-danger">{saveError}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }

              return (
                <tr
                  key={String(rowId)}
                  className={`border-b border-border-subtle last:border-b-0 ${isEditing ? 'bg-accent/5' : ''} ${decoClass}`}
                  onDoubleClick={() => editable && !isEditing && handleStartEdit(record)}
                >
                  {columns.map((col, i) => {
                    const colMeta = autoFields?.[col.name]
                    const cellValue = isEditing ? editValues[col.name] : record[col.name]

                    const cellHasError = isEditing && cellErrors.has(col.name)

                    return (
                      <td
                        key={`o2m-d-${col.name}-${i}`}
                        className={`whitespace-nowrap px-1 py-1 text-sm text-text-primary${cellHasError ? ' ring-1 ring-danger ring-inset' : ''}`}
                      >
                        {isEditing ? (
                          <O2mCellEdit
                            col={col}
                            value={cellValue}
                            onChange={(val) => handleCellChange(rowId, col.name, val)}
                            meta={colMeta}
                            record={isEditing ? editValues : record}
                            relation={relation}
                          />
                        ) : (
                          <O2mCellDisplay
                            col={col}
                            value={cellValue}
                            meta={colMeta}
                            record={record}
                            relation={relation}
                          />
                        )}
                      </td>
                    )
                  })}
                  {(!readOnly || editable) && subViewList?.delete !== false && (
                    <td className="px-1 py-1.5 text-center">
                      {isEditing ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(rowId)}
                              className="text-xs text-accent hover:text-accent/80"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="text-xs text-text-muted hover:text-danger"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                          {isEditing && saveError && (
                            <span className="whitespace-nowrap text-[10px] text-danger">
                              {saveError}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const rid = rowId as number
                            handleDelete(rid)
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
            })}
          </tbody>
        </table>
      ) : null}

      {!readOnly && subViewList?.create !== false && (
        <div className="border-t border-border-subtle px-3 py-1.5">
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs font-medium text-accent hover:text-accent/80"
          >
            Add a row
          </button>
        </div>
      )}
    </div>
  )
}
