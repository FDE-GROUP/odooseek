import type { KanbanTemplateNode, OdooFieldMeta } from '@odooseek/odoo-client'
import { evalCondition, getValue } from '@odooseek/odoo-client'
import React from 'react'
import { getFieldWidget, NOOP } from '../widgets'

/** Translate Odoo/Bootstrap CSS classes to Tailwind equivalents. */
function translateOdooClass(className?: string): string | undefined {
  if (!className) return undefined
  return className
    .split(/\s+/)
    .map((c) => ODOO_TO_TW[c] ?? c)
    .filter(Boolean)
    .join(' ')
}

const ODOO_TO_TW: Record<string, string> = {
  // Display
  'd-flex': 'flex',
  'd-block': 'block',
  'd-inline-block': 'inline-block',
  'd-inline': 'inline',
  // Flex
  'flex-row': 'flex-row',
  'flex-column': 'flex-col',
  'justify-content-center': 'justify-center',
  'align-items-center': 'items-center',
  'align-items-end': 'items-end',
  // Spacing (Bootstrap → Tailwind)
  'm-0': 'm-0',
  'm-1': 'm-1',
  'm-2': 'm-2',
  'mt-0': 'mt-0',
  'mt-1': 'mt-1',
  'mt-2': 'mt-2',
  'mb-0': 'mb-0',
  'mb-1': 'mb-1',
  'mb-2': 'mb-2',
  'ms-0': 'ml-0',
  'ms-1': 'ml-1',
  'ms-2': 'ml-2',
  'ms-auto': 'ml-auto',
  'me-0': 'mr-0',
  'me-1': 'mr-1',
  'me-2': 'mr-2',
  'me-auto': 'mr-auto',
  'ps-0': 'pl-0',
  'ps-1': 'pl-1',
  'ps-2': 'pl-2',
  'pe-0': 'pr-0',
  'p-0': 'p-0',
  'p-1': 'p-1',
  'p-2': 'p-2',
  'px-0': 'px-0',
  'px-2': 'px-2',
  'py-0': 'py-0',
  // Positioning
  'position-relative': 'relative',
  'position-absolute': 'absolute',
  'bottom-0': 'bottom-0',
  'end-0': 'right-0',
  'start-0': 'left-0',
  'top-0': 'top-0',
  // Float
  'float-end': 'float-right',
  'float-start': 'float-left',
  // Width / height
  'w-25': 'w-1/4',
  'w-50': 'w-1/2',
  'w-75': 'w-3/4',
  'w-100': 'w-full',
  'h-25': 'h-1/4',
  'h-50': 'h-1/2',
  'h-75': 'h-3/4',
  'h-100': 'h-full',
  'h-auto': 'h-auto',
  'mw-100': 'max-w-full',
  'mh-100': 'max-h-full',
  // Typography
  'fw-bold': 'font-bold',
  'fw-normal': 'font-normal',
  'fs-4': 'text-xl',
  'fs-5': 'text-lg',
  'fs-6': 'text-base',
  'text-truncate': 'truncate',
  'text-end': 'text-end',
  'text-center': 'text-center',
  // Background
  'bg-100': 'bg-muted',
  'bg-light': 'bg-muted',
  'bg-white': 'bg-white',
  'bg-gradient': 'bg-gradient-to-b from-transparent to-black/5',
  // Misc
  'opacity-50': 'opacity-50',
  'object-fit-contain': 'object-contain',
  // Odoo-specific kanban layout classes
  o_kanban_aside_full: 'shrink-0 w-16 aspect-square overflow-hidden rounded',
  o_kanban_card_full: 'w-full',
  o_hr_employee_kanban: '',
  // Odoo color utilities
  'text-primary': 'text-accent',
  'text-bg-danger': 'bg-red-500 text-white',
}

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

      // optional="hide": skip rendering when value is null/empty
      if (node.optional === 'hide') {
        const val = record[node.name]
        if (val == null || val === false || val === '') return null
        if (Array.isArray(val) && val.length === 0) return null
      }

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
        (meta.type === 'binary' ||
          meta.name.toLowerCase().startsWith('image') ||
          meta.name.toLowerCase().startsWith('avatar'))
      ) {
        const size = node.options?.size as [number, number] | undefined
        if (size && Array.isArray(size)) {
          return (
            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative image with error fallback
            <img
              alt={node.name ?? ''}
              src={`/api/web/image/${model}/${recordId}/${node.name}`}
              className={translateOdooClass(node.class)}
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
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative image with error fallback
          <img
            alt={node.name ?? ''}
            src={`/api/web/image/${model}/${recordId}/${node.name}`}
            className={[translateOdooClass(node.class), translateOdooClass(imgClass)]
              .filter(Boolean)
              .join(' ')}
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )
      }

      if (!node.widget) {
        return (
          <div className={translateOdooClass(node.class)}>
            {formatKanbanField(record[node.name], meta)}
          </div>
        )
      }

      const Widget = getFieldWidget(
        { type: 'field', name: node.name, widget: node.widget },
        meta.type,
      )
      return (
        <div className={translateOdooClass(node.class)}>
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
        { className: translateOdooClass(node.class) || undefined, key: undefined },
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
