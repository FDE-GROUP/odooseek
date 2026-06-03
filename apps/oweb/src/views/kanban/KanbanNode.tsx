import type { KanbanTemplateNode, OdooFieldMeta } from '@odooseek/odoo-client'
import { evalCondition, getValue } from '@odooseek/odoo-client'
import React from 'react'
import { getFieldWidget, NOOP } from '../widgets'

export function formatKanbanField(value: unknown, meta: OdooFieldMeta): string {
  if (value == null || value === false) return ''
  if (typeof value === 'boolean') return value ? '\u2713' : ''
  if (typeof value === 'string') {
    if (meta.type === 'html') return value.replace(/<[^>]+>/g, '')
    if (meta.selection) {
      const sel = meta.selection.find(([k]) => k === value)
      return sel ? sel[1] : value
    }
    return value
  }
  if (typeof value === 'number') {
    if (meta.type === 'monetary')
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (meta.type === 'float') {
      const s = value.toLocaleString()
      if (s.endsWith('.00')) return s.slice(0, -3)
      return s
    }
    if (meta.type === 'integer') return value.toLocaleString()
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'string') {
      return value[1] || `#${value[0]}`
    }
    return `${value.length} records`
  }
  return String(value ?? '')
}

export function KanbanNode({
  node,
  record,
  fields,
  model,
  recordId,
}: {
  node: KanbanTemplateNode
  record: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId: number
}) {
  switch (node.type) {
    case 'field': {
      const meta = fields[node.name]
      if (!meta) return null

      if (node.widget === 'background_image') {
        const Widget = getFieldWidget(
          { type: 'field', name: node.name, widget: node.widget, options: node.options },
          meta.type,
        )
        return (
          <Widget
            field={{ type: 'field', name: node.name, widget: node.widget, options: node.options }}
            value={record[node.name]}
            onChange={NOOP}
            readOnly
            meta={meta}
            record={record}
            model={model}
            recordId={recordId}
          />
        )
      }

      if (
        node.widget === 'image' &&
        (meta.type === 'binary' || meta.name.toLowerCase().startsWith('image'))
      ) {
        const size = node.options?.size as [number, number] | undefined
        if (size && Array.isArray(size)) {
          return (
            <img
              src={`/api/web/image/${model}/${recordId}/${node.name}`}
              className={node.class}
              width={size[0]}
              height={size[1]}
              loading="lazy"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          )
        }
        const imgClass = (node.options?.img_class as string) ?? 'h-8 w-8 rounded object-cover'
        return (
          <img
            src={`/api/web/image/${model}/${recordId}/${node.name}`}
            className={[node.class, imgClass].filter(Boolean).join(' ')}
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )
      }

      if (!node.widget) {
        return <div className={node.class}>{formatKanbanField(record[node.name], meta)}</div>
      }

      const Widget = getFieldWidget(
        { type: 'field', name: node.name, widget: node.widget },
        meta.type,
      )
      return (
        <div className={node.class}>
          <Widget
            field={{ type: 'field', name: node.name, widget: node.widget, options: node.options }}
            value={record[node.name]}
            onChange={NOOP}
            readOnly
            meta={meta}
            record={record}
            model={model}
            recordId={recordId}
          />
        </div>
      )
    }
    case 'condition': {
      if (node.if) {
        if (!evalCondition(node.if, record)) {
          const alt = node.children.find((c) => c.type === 'condition')
          if (alt)
            return (
              <KanbanNode
                node={alt}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
              />
            )
          return null
        }
        return (
          <>
            {node.children
              .filter((c) => c.type !== 'condition')
              .map((c, i) => (
                <KanbanNode
                  key={i}
                  node={c}
                  record={record}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                />
              ))}
          </>
        )
      }
      if (node.elif) {
        if (evalCondition(node.elif, record)) {
          return (
            <>
              {node.children
                .filter((c) => c.type !== 'condition')
                .map((c, i) => (
                  <KanbanNode
                    key={i}
                    node={c}
                    record={record}
                    fields={fields}
                    model={model}
                    recordId={recordId}
                  />
                ))}
            </>
          )
        }
        const next = node.children.find((c) => c.type === 'condition')
        if (next)
          return (
            <KanbanNode
              node={next}
              record={record}
              fields={fields}
              model={model}
              recordId={recordId}
            />
          )
        return null
      }
      return (
        <>
          {node.children
            .filter((c) => c.type !== 'condition')
            .map((c, i) => (
              <KanbanNode
                key={i}
                node={c}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
              />
            ))}
        </>
      )
    }
    case 'loop': {
      const list = getValue(node.foreach, record)
      if (!Array.isArray(list)) return null
      return (
        <>
          {list.map((item, i) => {
            const loopRecord: Record<string, unknown> = { ...record }
            if (Array.isArray(item)) {
              loopRecord[node.as] = item[1] ?? item[0]
            } else {
              loopRecord[node.as] = item
            }
            return node.children.map((c, j) => (
              <KanbanNode
                key={`${i}-${j}`}
                node={c}
                record={loopRecord}
                fields={fields}
                model={model}
                recordId={recordId}
              />
            ))
          })}
        </>
      )
    }
    case 'output': {
      const val = getValue(node.expr, record)
      return <span>{val != null ? String(val) : ''}</span>
    }
    case 'html':
      return React.createElement(
        node.tag,
        { className: node.class, key: undefined },
        ...node.children.map((c, i) => (
          <KanbanNode
            key={i}
            node={c}
            record={record}
            fields={fields}
            model={model}
            recordId={recordId}
          />
        )),
      )
    case 'text':
      return <>{node.content}</>
    case 'footer':
      return (
        <div className="mt-2 border-t border-border-subtle pt-2 text-xs text-text-muted">
          {node.children.map((c, i) => (
            <KanbanNode
              key={i}
              node={c}
              record={record}
              fields={fields}
              model={model}
              recordId={recordId}
            />
          ))}
        </div>
      )
  }
}

/** Recursively collect field names from kanban template nodes. */
export function collectKanbanFieldNames(nodes: KanbanTemplateNode[] | undefined): string[] {
  if (!nodes?.length) return []
  const names: string[] = []
  for (const node of nodes) {
    if (node.type === 'field' && node.name) names.push(node.name)
    if (
      node.type === 'html' ||
      node.type === 'condition' ||
      node.type === 'loop' ||
      node.type === 'footer'
    ) {
      names.push(...collectKanbanFieldNames(node.children))
    }
  }
  return names
}
