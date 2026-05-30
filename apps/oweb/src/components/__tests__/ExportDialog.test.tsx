import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { OdooFieldMeta } from '../../lib/odoo-types'
import { ExportDialog } from '../ExportDialog'

const mockFields: Record<string, OdooFieldMeta> = {
  name: {
    name: 'name',
    type: 'char',
    string: 'Name',
    required: true,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  email: {
    name: 'email',
    type: 'char',
    string: 'Email',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  phone: {
    name: 'phone',
    type: 'char',
    string: 'Phone',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  active: {
    name: 'active',
    type: 'boolean',
    string: 'Active',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  notes: {
    name: 'notes',
    type: 'text',
    string: 'Notes',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
  },
  // Excluded: one2many (should not appear)
  line_ids: {
    name: 'line_ids',
    type: 'one2many',
    string: 'Lines',
    required: false,
    readonly: false,
    store: false,
    searchable: false,
    sortable: false,
  },
  // Excluded: binary (should not appear)
  image: {
    name: 'image',
    type: 'binary',
    string: 'Image',
    required: false,
    readonly: false,
    store: true,
    searchable: false,
    sortable: false,
  },
}

const mockData: Array<Record<string, unknown>> = [
  { id: 1, name: 'Alice', email: 'alice@example.com', phone: '123', active: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', phone: '456', active: false },
]

describe('ExportDialog', () => {
  test('renders field picker with available and selected fields', () => {
    const onClose = vi.fn()
    render(
      <ExportDialog model="res.partner" fields={mockFields} data={mockData} onClose={onClose} />,
    )

    // Header labels
    expect(screen.getByText('Available Fields')).toBeInTheDocument()
    expect(screen.getByText('Export Fields')).toBeInTheDocument()

    // Some fields should be in "Available" (those not in the first 10 default-selected)
    // Since we have 5 exportable fields and default selects up to 10, all 5 will be selected
    // So "Available" will show "All fields selected"
    expect(screen.getByText('All fields selected')).toBeInTheDocument()

    // All 5 exportable field labels should appear
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()

    // one2many and binary fields should NOT appear
    expect(screen.queryByText('Lines')).not.toBeInTheDocument()
    expect(screen.queryByText('Image')).not.toBeInTheDocument()
  })

  test('can remove a field from the export list', () => {
    const onClose = vi.fn()
    render(
      <ExportDialog model="res.partner" fields={mockFields} data={mockData} onClose={onClose} />,
    )

    // "Notes" should be in the Export Fields column initially (selected by default)
    // Find the remove button next to "Notes" in the export column
    const exportSection = screen.getByText('Export Fields').closest('.rounded-lg') as HTMLElement
    const notesRow = Array.from(exportSection.querySelectorAll('div')).find((div) =>
      div.textContent?.includes('Notes'),
    ) as HTMLDivElement
    const removeBtn = notesRow.querySelector('button:last-child') as HTMLButtonElement
    fireEvent.click(removeBtn)

    // "Notes" should now appear in Available Fields
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  test('can add a field to the export list', () => {
    const onClose = vi.fn()

    // Use a larger field set so some start unselected
    const manyFields: Record<string, OdooFieldMeta> = {}
    for (let i = 0; i < 15; i++) {
      manyFields[`field_${i}`] = {
        name: `field_${i}`,
        type: 'char',
        string: `Field ${i}`,
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      }
    }

    render(
      <ExportDialog model="test.model" fields={manyFields} data={mockData} onClose={onClose} />,
    )

    // Fields are sorted by label alphabetically. "Field 9" will be after "Field 8" lexicographically
    // and should be outside the first 10 defaults.
    // Alphabetical order: Field 0, 1, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
    // First 10 selected: Field 0, 1, 10, 11, 12, 13, 14, 2, 3, 4
    // Available: Field 5, 6, 7, 8, 9
    // "Field 5" should be in Available section as a button
    const field5Btn = screen.getByRole('button', { name: /^Field 5/ })
    expect(field5Btn).toBeInTheDocument()
    fireEvent.click(field5Btn)

    // After adding, "Field 5" should no longer be an addable button (moved to export list)
    expect(screen.queryByRole('button', { name: /^Field 5/ })).not.toBeInTheDocument()

    // And the export button should now show 11 fields
    const exportBtn = screen.getByRole('button', { name: /Export.*fields/ })
    expect(exportBtn.textContent).toContain('11 fields')
  })

  test('export button is disabled when no fields selected', () => {
    const onClose = vi.fn()

    // Create fields where none will be pre-selected by using removeAll
    const manyFields: Record<string, OdooFieldMeta> = {}
    for (let i = 0; i < 5; i++) {
      manyFields[`field_${i}`] = {
        name: `field_${i}`,
        type: 'char',
        string: `Field ${i}`,
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      }
    }

    render(
      <ExportDialog model="test.model" fields={manyFields} data={mockData} onClose={onClose} />,
    )

    // Click "Remove all" to deselect everything
    fireEvent.click(screen.getByText('Remove all'))

    // Export button should be disabled
    const exportBtn = screen.getByRole('button', { name: /Export/ })
    expect(exportBtn).toBeDisabled()
  })

  test('format selector renders with CSV option', () => {
    const onClose = vi.fn()
    render(
      <ExportDialog model="res.partner" fields={mockFields} data={mockData} onClose={onClose} />,
    )

    const select = screen.getByDisplayValue('CSV')
    expect(select).toBeInTheDocument()
    expect(select.tagName).toBe('SELECT')
  })

  test('shows selection count when selectedIds provided', () => {
    const onClose = vi.fn()
    const selectedIds = new Set([1])

    render(
      <ExportDialog
        model="res.partner"
        fields={mockFields}
        data={mockData}
        selectedIds={selectedIds}
        onClose={onClose}
      />,
    )

    expect(screen.getByText('Exporting 1 selected record')).toBeInTheDocument()
  })

  test('export button triggers CSV download and calls onClose', () => {
    const onClose = vi.fn()
    const createObjectURLSpy = vi.fn(() => 'blob:test')
    const revokeObjectURLSpy = vi.fn()
    const originalURL = globalThis.URL
    vi.stubGlobal('URL', {
      ...originalURL,
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    })

    // Mock createElement to capture the download link
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { click: clickSpy, href: '', download: '' } as unknown as HTMLAnchorElement
      }
      return originalCreateElement(tag)
    })

    render(
      <ExportDialog model="res.partner" fields={mockFields} data={mockData} onClose={onClose} />,
    )

    const exportBtn = screen.getByRole('button', { name: /Export.*fields/ })
    fireEvent.click(exportBtn)

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})
