import type {
  ListButtonGroup,
  ListColumn,
  OdooFieldMeta,
  ParsedListView,
  ViewField,
} from '@odooseek/odoo-client'
import { evalCondition, getColumnPrefs, setColumnPrefs } from '@odooseek/odoo-client'
import { useCallback, useEffect, useMemo, useState } from 'react'

function isViewField(col: ListColumn): col is ViewField {
  return !('buttonType' in col) && col.type !== 'button_group'
}
function isNonField(col: ListColumn): boolean {
  return 'buttonType' in col || col.type === 'button_group'
}

export function useColumnPrefs(
  model: string,
  listView: ParsedListView,
  fields: Record<string, OdooFieldMeta>,
) {
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [colWidths, setColWidths] = useState<Record<string, number>>({})

  // Static column filtering (invisible check on arch definition)
  const allVisibleCols = useMemo(
    () =>
      listView.columns.filter((c) => {
        if ('buttonType' in c) return !c.invisible
        if (c.type === 'button_group')
          return (c as ListButtonGroup).buttons.some((b) => !b.invisible)
        const inv = (c as ViewField).invisible
        return inv === undefined || inv < 1
      }),
    [listView.columns],
  )

  // Restore hidden columns from localStorage or optional="hide"
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
  }, [listView.columns, model])

  // Dynamic column filtering
  const visibleColumns = useMemo(
    () =>
      allVisibleCols
        .filter((c) => isNonField(c) || (isViewField(c) && !hiddenCols.has(c.name)))
        .filter((c) => {
          if (isNonField(c)) return true
          const ci = (c as ViewField).columnInvisible
          if (!ci) return true
          return !evalCondition(ci, {})
        }),
    [allVisibleCols, hiddenCols],
  )

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

  const hasHandle = useMemo(
    () => allVisibleCols.some((c): c is ViewField => isViewField(c) && c.widget === 'handle'),
    [allVisibleCols],
  )

  const startResize = useCallback(
    (colName: string, e: { preventDefault: () => void; clientX: number }) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = colWidths[colName] ?? 120
      const onMove = (ev: MouseEvent) => {
        setColWidths((prev) => ({
          ...prev,
          [colName]: Math.max(60, startWidth + ev.clientX - startX),
        }))
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

  return {
    visibleColumns,
    allVisibleCols,
    hiddenCols,
    colWidths,
    toggleColumn,
    hasHandle,
    startResize,
  } as const
}
