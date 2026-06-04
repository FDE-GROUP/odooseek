import { fieldsGet } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { FieldWidgetProps } from './index'

type DomainNode = unknown[]

function isOp(n: unknown[]): boolean {
  return n.length > 0 && typeof n[0] === 'string' && (n[0] === '&' || n[0] === '|' || n[0] === '!')
}
function getOp(n: unknown[]): '&' | '|' | '!' {
  return n[0] as '&' | '|' | '!'
}

const OPERATORS = [
  ['=', '='],
  ['!=', '!='],
  ['>', '>'],
  ['<', '<'],
  ['>=', '>='],
  ['<=', '<='],
  ['like', 'contains'],
  ['ilike', 'contains (ci)'],
  ['in', 'in'],
  ['not in', 'not in'],
]

function parseDomain(value: unknown): DomainNode[] {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (first === '&' || first === '|' || first === '!') {
      return value as unknown as DomainNode[]
    }
    return [value as DomainNode]
  }
  return []
}

function domainToString(nodes: DomainNode[]): string {
  if (nodes.length === 0) return ''
  return JSON.stringify(nodes.length === 1 ? nodes[0] : nodes)
}

function LeafEditor({
  leaf,
  onChange,
  onDelete,
  fields,
}: {
  leaf: DomainNode
  onChange: (n: DomainNode) => void
  onDelete: () => void
  fields: string[]
}) {
  const [field, op, val] = leaf as [string, string, unknown]
  return (
    <div className="flex items-center gap-1 py-0.5">
      <select
        value={field}
        onChange={(e) => onChange([e.target.value, op, val])}
        className="rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
      >
        {fields.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <select
        value={op}
        onChange={(e) => onChange([field, e.target.value, val])}
        className="rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
      >
        {OPERATORS.map(([o, label]) => (
          <option key={o} value={o}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={val === false || val === null ? '' : String(val ?? '')}
        onChange={(e) => onChange([field, op, e.target.value])}
        placeholder="value"
        className="min-w-[80px] flex-1 rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
      />
      <button
        type="button"
        onClick={onDelete}
        className="text-xs text-text-muted hover:text-danger"
      >
        ✕
      </button>
    </div>
  )
}

function BranchEditor({
  nodes,
  onChange,
}: {
  nodes: DomainNode[]
  onChange: (nodes: DomainNode[]) => void
}) {
  const [op, setOp] = useState<'&' | '|' | '!'>(isOp(nodes) ? getOp(nodes) : '&')

  const children = isOp(nodes) ? (nodes.slice(1) as DomainNode[]) : nodes

  const updateOp = (newOp: '&' | '|' | '!') => {
    setOp(newOp)
    onChange([newOp, ...children] as unknown as DomainNode[])
  }

  const addLeaf = () => {
    const newChildren = [...children, ['name', '=', ''] as DomainNode]
    onChange([op, ...newChildren] as unknown as DomainNode[])
  }

  const updateChild = (idx: number, child: DomainNode) => {
    const newChildren = [...children]
    newChildren[idx] = child
    onChange([op, ...newChildren] as unknown as DomainNode[])
  }

  const deleteChild = (idx: number) => {
    const newChildren = children.filter((_, i) => i !== idx)
    if (newChildren.length === 0) {
      onChange([])
    } else {
      onChange([op, ...newChildren] as unknown as DomainNode[])
    }
  }

  return (
    <div className="rounded border border-border-subtle bg-surface p-2">
      <div className="mb-1 flex items-center gap-1">
        <select
          value={op}
          onChange={(e) => updateOp(e.target.value as '&' | '|' | '!')}
          className="rounded border border-border-default bg-transparent px-1 py-0 text-xs font-bold text-accent"
        >
          <option value="&">AND</option>
          <option value="|">OR</option>
          <option value="!">NOT</option>
        </select>
        <span className="text-[10px] text-text-muted">
          {op === '&' ? 'All of:' : op === '|' ? 'Any of:' : 'None of:'}
        </span>
      </div>
      {children.map((child, i) => (
        <NodeEditor
          key={i}
          node={child}
          onChange={(n) => updateChild(i, n)}
          onDelete={() => deleteChild(i)}
        />
      ))}
      <button type="button" onClick={addLeaf} className="mt-1 text-xs text-accent hover:underline">
        + Add condition
      </button>
    </div>
  )
}

function NodeEditor({
  node,
  onChange,
  onDelete,
}: {
  node: DomainNode
  onChange: (n: DomainNode) => void
  onDelete: () => void
}) {
  const first = node[0]
  if (first === '&' || first === '|' || first === '!') {
    return (
      <div className="relative ml-3 pl-3 border-l border-border-subtle">
        <button
          type="button"
          onClick={onDelete}
          className="absolute -left-2 top-0 text-[10px] text-text-muted hover:text-danger"
        >
          ✕
        </button>
        <BranchEditor
          nodes={node as unknown as DomainNode[]}
          onChange={(n) => onChange(n[0] as DomainNode)}
        />
      </div>
    )
  }
  return <LeafEditor leaf={node} onChange={onChange} onDelete={onDelete} fields={[]} />
}

export function DomainWidget({ value, onChange, readOnly, model }: FieldWidgetProps) {
  const { data: fieldData } = useQuery({
    queryKey: ['odoo', 'fields_get', model],
    queryFn: () => fieldsGet<Record<string, { string: string }>>(model as string, [], ['string']),
    enabled: !!model,
    staleTime: 600_000,
  })

  const fieldNames = fieldData ? Object.keys(fieldData).sort() : []

  const nodes = parseDomain(value)

  if (readOnly) {
    const text = domainToString(nodes)
    return <span className="text-sm text-text-primary font-mono">{text || '—'}</span>
  }

  return (
    <div className="flex flex-col gap-1">
      <BranchEditorWithFields
        nodes={nodes}
        fieldNames={fieldNames}
        onChange={(newNodes) => {
          if (newNodes.length === 0) {
            onChange([])
          } else if (newNodes.length === 1) {
            onChange(newNodes[0])
          } else {
            onChange(newNodes)
          }
        }}
      />
    </div>
  )
}

function BranchEditorWithFields({
  nodes,
  fieldNames,
  onChange,
}: {
  nodes: DomainNode[]
  fieldNames: string[]
  onChange: (nodes: DomainNode[]) => void
}) {
  return <DomainEditorInner nodes={nodes} fieldNames={fieldNames} onChange={onChange} />
}

function DomainEditorInner({
  nodes,
  fieldNames,
  onChange,
}: {
  nodes: DomainNode[]
  fieldNames: string[]
  onChange: (nodes: DomainNode[]) => void
}) {
  const [op, setOp] = useState<'&' | '|'>(
    isOp(nodes) && getOp(nodes) !== '!' ? (getOp(nodes) as '&' | '|') : '&',
  )
  const [not, setNot] = useState(isOp(nodes) && getOp(nodes) === '!')

  const children = isOp(nodes) ? (nodes.slice(1) as DomainNode[]) : nodes

  const update = (newChildren: DomainNode[]) => {
    if (newChildren.length === 0) {
      onChange([])
      return
    }
    const result: DomainNode[] = [op, ...newChildren] as DomainNode[]
    onChange(not ? (['!', ...result] as DomainNode[]) : result)
  }

  const addLeaf = () => {
    const field = fieldNames[0] ?? 'name'
    update([...children, [field, '=', ''] as DomainNode])
  }

  if (children.length === 0) {
    return (
      <div className="text-center">
        <button type="button" onClick={addLeaf} className="text-xs text-accent hover:underline">
          + Add condition
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <select
          value={op}
          onChange={(e) => {
            setOp(e.target.value as '&' | '|')
            const result: DomainNode[] = [e.target.value as '&' | '|', ...children] as DomainNode[]
            onChange(not ? (['!', ...result] as DomainNode[]) : result)
          }}
          className="rounded border border-border-default bg-transparent px-1 py-0 text-xs font-bold text-accent"
        >
          <option value="&">AND</option>
          <option value="|">OR</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={not}
            onChange={(e) => {
              setNot(e.target.checked)
              const result: DomainNode[] = [op, ...children] as DomainNode[]
              onChange(e.target.checked ? (['!', ...result] as DomainNode[]) : result)
            }}
            className="accent-accent"
          />
          NOT
        </label>
      </div>
      <div className="ml-3 pl-3 border-l border-border-subtle flex flex-col gap-1">
        {children.map((child, i) => {
          const first = child[0]
          if (first === '&' || first === '|' || first === '!') {
            return (
              <div key={i} className="relative">
                <button
                  type="button"
                  onClick={() => update(children.filter((_, j) => j !== i))}
                  className="absolute -left-2 top-0 text-[10px] text-text-muted hover:text-danger"
                >
                  ✕
                </button>
                <DomainEditorInner
                  nodes={[child as unknown as DomainNode]}
                  fieldNames={fieldNames}
                  onChange={(subNodes) => {
                    const newChildren = [...children]
                    if (subNodes.length === 0) {
                      update(newChildren.filter((_, j) => j !== i))
                    } else {
                      newChildren[i] = subNodes[0] as unknown as DomainNode
                      update(newChildren)
                    }
                  }}
                />
              </div>
            )
          }
          const [field, op, val] = child as [string, string, unknown]
          return (
            <div key={i} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => update(children.filter((_, j) => j !== i))}
                className="text-xs text-text-muted hover:text-danger shrink-0"
              >
                ✕
              </button>
              <select
                value={field}
                onChange={(e) => {
                  const c = [...children]
                  c[i] = [e.target.value, op, val] as unknown as DomainNode
                  update(c)
                }}
                className="w-28 rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
              >
                {fieldNames.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={op}
                onChange={(e) => {
                  const c = [...children]
                  c[i] = [field, e.target.value, val] as unknown as DomainNode
                  update(c)
                }}
                className="rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
              >
                {OPERATORS.map(([o, label]) => (
                  <option key={o} value={o}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={val === false || val === null ? '' : String(val ?? '')}
                onChange={(e) => {
                  const c = [...children]
                  c[i] = [field, op, e.target.value] as unknown as DomainNode
                  update(c)
                }}
                placeholder="value"
                className="min-w-[60px] flex-1 rounded border border-border-default bg-transparent px-1 py-0.5 text-xs"
              />
            </div>
          )
        })}
        <button type="button" onClick={addLeaf} className="text-xs text-accent hover:underline">
          + Add condition
        </button>
        <button
          type="button"
          onClick={() => {
            update([...children, ['&'] as unknown as DomainNode])
          }}
          className="text-xs text-text-muted hover:text-accent"
        >
          + Add group
        </button>
      </div>
    </div>
  )
}
