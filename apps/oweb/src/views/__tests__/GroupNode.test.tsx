import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { GroupNode } from '../list/GroupNode'

const visibleColumns = [{ name: 'name', string: 'Name', type: 'field' as const }]
const fields = {
  name: {
    name: 'name',
    type: 'char',
    string: 'Name',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
}
const noop = () => {}

function defaultProps(overrides: Partial<Parameters<typeof GroupNode>[0]> = {}) {
  return {
    path: '0',
    group: { id: 1, name: 'Test Group', name_count: 3 },
    depth: 0,
    visibleColumns: visibleColumns as any,
    fields,
    groupBy: ['name'],
    fieldColumnNames: ['name'],
    model: 'test.model',
    selectedIds: new Set<number>(),
    expandedGroups: new Set<string>(),
    groupQueryMap: new Map(),
    groupLimit: 80,
    decorations: {},
    groupDelete: false,
    isEditable: false,
    noOpen: false,
    toggleGroupExpand: noop,
    toggleRow: noop,
    handleRowClick: noop,
    setGroupExtraLimits: vi.fn(),
    confirmDialog: vi.fn(),
    invalidateList: noop,
    ...overrides,
  } as const
}

describe('GroupNode', () => {
  test('renders group header with count', () => {
    render(<GroupNode {...defaultProps()} />)
    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  test('shows chevron icon for expandable group', () => {
    const { container } = render(<GroupNode {...defaultProps()} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  test('renders leaf records when expanded', () => {
    const groupQueryMap = new Map()
    groupQueryMap.set('0', {
      data: [{ id: 42, name: 'Leaf Record' }],
      isLoading: false,
    })

    render(
      <GroupNode
        {...defaultProps({
          expandedGroups: new Set(['0']),
          groupQueryMap,
          depth: 0,
          groupBy: ['name'],
        })}
      />,
    )
    expect(screen.getByText('Leaf Record')).toBeInTheDocument()
  })

  test('shows loading spinner when data not yet available', () => {
    const { container } = render(
      <GroupNode {...defaultProps({ expandedGroups: new Set(['0']) })} />,
    )
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  test('renders Load more button when records exceed limit', () => {
    const records = Array.from({ length: 80 }, (_, i) => ({ id: i, name: `Rec${i}` }))
    const groupQueryMap = new Map()
    groupQueryMap.set('0', { data: records, isLoading: false })

    render(
      <GroupNode
        {...defaultProps({
          expandedGroups: new Set(['0']),
          groupQueryMap,
          depth: 0,
          groupBy: ['name'],
        })}
      />,
    )
    expect(screen.getByText('Load more...')).toBeInTheDocument()
  })

  test('renders sub-groups recursively', () => {
    const subGroups = [{ id: 2, name: 'Sub Group', name_count: 1 }]
    const groupQueryMap = new Map()
    groupQueryMap.set('0', { data: subGroups, isLoading: false })
    groupQueryMap.set('0-0', {
      data: [{ id: 99, name: 'Deep Record' }],
      isLoading: false,
    })

    render(
      <GroupNode
        {...defaultProps({
          expandedGroups: new Set(['0', '0-0']),
          groupQueryMap,
          depth: 0,
          groupBy: ['name', 'email'],
        })}
      />,
    )
    expect(screen.getByText('Sub Group')).toBeInTheDocument()
    expect(screen.getByText('Deep Record')).toBeInTheDocument()
  })

  test('group delete button visible when groupDelete is true', () => {
    const group = { id: 1, name: [1, 'My Group'], name_count: 5 }
    const { container } = render(
      <GroupNode
        {...defaultProps({
          group,
          groupDelete: true,
          fields: { name: { ...fields.name, type: 'many2one', relation: 'test' } },
        })}
      />,
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  test('no delete button when groupDelete is false', () => {
    const group = { id: 1, name: [1, 'My Group'], name_count: 5 }
    const { container } = render(<GroupNode {...defaultProps({ group, groupDelete: false })} />)
    const buttons = container.querySelectorAll('tr button')
    expect(buttons.length).toBe(0)
  })
})
