import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { useCallback, useMemo, useState } from 'react'

interface ExportDialogProps {
  model: string
  fields: Record<string, OdooFieldMeta>
  data: Array<Record<string, unknown>>
  selectedIds?: Set<number>
  onClose: () => void
}

export function ExportDialog({ model, fields, data, selectedIds, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv'>('csv')

  // Build field list from model metadata, excluding non-exportable types
  const allFields = useMemo(() => {
    return Object.entries(fields)
      .filter(([, meta]) => !['one2many', 'binary'].includes(meta.type) && meta.store)
      .map(([name, meta]) => ({ name, label: meta.string || name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [fields])

  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    // Default: select commonly useful fields (up to 10)
    return allFields.slice(0, Math.min(10, allFields.length)).map((f) => f.name)
  })

  const addField = useCallback((name: string) => {
    setSelectedFields((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }, [])

  const removeField = useCallback((name: string) => {
    setSelectedFields((prev) => prev.filter((f) => f !== name))
  }, [])

  const addAllFields = useCallback(() => {
    setSelectedFields(allFields.map((f) => f.name))
  }, [allFields])

  const removeAllFields = useCallback(() => {
    setSelectedFields([])
  }, [])

  const moveFieldUp = useCallback((index: number) => {
    setSelectedFields((prev) => {
      if (index <= 0 || index >= prev.length) return prev
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveFieldDown = useCallback((index: number) => {
    setSelectedFields((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])

  const availableFields = useMemo(
    () => allFields.filter((f) => !selectedFields.includes(f.name)),
    [allFields, selectedFields],
  )

  const exportAsCSV = useCallback(
    (records: Array<Record<string, unknown>>, fieldNames: string[]) => {
      if (!records.length) return

      const csvRows: string[] = []
      csvRows.push(
        fieldNames
          .map((name) => {
            const meta = fields[name]
            return `"${meta?.string || name}"`
          })
          .join(','),
      )
      for (const r of records) {
        csvRows.push(
          fieldNames
            .map((name) => {
              const v = r[name]
              const str = v == null ? '' : Array.isArray(v) ? (v[1] ?? v[0]) : String(v)
              return `"${String(str).replace(/"/g, '""')}"`
            })
            .join(','),
        )
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${model}_export.csv`
      a.click()
      URL.revokeObjectURL(url)
    },
    [fields, model],
  )

  const handleExport = useCallback(() => {
    if (selectedFields.length === 0) return

    const rows =
      selectedIds && selectedIds.size > 0
        ? data.filter((r) => selectedIds.has(r.id as number))
        : data

    if (format === 'csv') {
      exportAsCSV(rows, selectedFields)
    }
    onClose()
  }, [selectedFields, selectedIds, data, format, onClose, exportAsCSV])

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div>
        <label htmlFor="export-format" className="text-xs font-medium text-text-muted">
          Format
        </label>
        <select
          id="export-format"
          value={format}
          onChange={(e) => setFormat(e.target.value as 'csv')}
          className="ml-2 rounded border border-border-default bg-surface px-2 py-1 text-sm text-text-primary"
        >
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* Selection info */}
      {selectedIds && selectedIds.size > 0 && (
        <div className="rounded border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">
          Exporting {selectedIds.size} selected record{selectedIds.size !== 1 ? 's' : ''}
        </div>
      )}

      {/* Field picker: two-column layout */}
      <div className="flex gap-4">
        {/* Available fields */}
        <div className="flex-1 rounded-lg border border-border-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
            <h4 className="text-xs font-semibold text-text-secondary">Available Fields</h4>
            <button
              type="button"
              onClick={addAllFields}
              className="text-[10px] text-accent hover:underline"
            >
              Add all
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {availableFields.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-text-muted">
                All fields selected
              </div>
            )}
            {availableFields.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => addField(f.name)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
              >
                <span className="truncate">{f.label}</span>
                <span className="ml-2 text-accent">+</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected / export fields */}
        <div className="flex-1 rounded-lg border border-border-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
            <h4 className="text-xs font-semibold text-text-secondary">Export Fields</h4>
            <button
              type="button"
              onClick={removeAllFields}
              className="text-[10px] text-text-muted hover:underline"
            >
              Remove all
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {selectedFields.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-text-muted">
                No fields selected
              </div>
            )}
            {selectedFields.map((name, index) => {
              const meta = allFields.find((f) => f.name === name)
              return (
                <div
                  key={name}
                  className="flex items-center justify-between px-3 py-1.5 text-xs text-text-primary hover:bg-hover"
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveFieldUp(index)}
                      disabled={index === 0}
                      className="text-text-muted hover:text-text-primary disabled:opacity-30"
                    >
                      &#9650;
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFieldDown(index)}
                      disabled={index === selectedFields.length - 1}
                      className="text-text-muted hover:text-text-primary disabled:opacity-30"
                    >
                      &#9660;
                    </button>
                    <span className="truncate">{meta?.label || name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(name)}
                    className="ml-2 text-text-muted hover:text-danger"
                  >
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={selectedFields.length === 0}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
        >
          Export{selectedFields.length > 0 ? ` (${selectedFields.length} fields)` : ''}
        </button>
      </div>
    </div>
  )
}
