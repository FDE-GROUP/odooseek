import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { DialogProvider } from '../../hooks/useDialog'
import type { OdooFieldMeta } from '../../lib/odoo-types'
import { OdooFormRenderer } from '../OdooFormRenderer'

const mockCallKw = vi.fn()
vi.mock('../../lib/api', () => ({
  callKw: (...args: unknown[]) => mockCallKw(...args),
}))

let queryClient: QueryClient

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <DialogProvider>{children}</DialogProvider>
  </QueryClientProvider>
)

const formArch = `<form string="Partner">
  <sheet>
    <group col="2">
      <field name="name" required="1"/>
      <field name="email"/>
      <field name="state"/>
    </group>
  </sheet>
</form>`

const fields: Record<string, OdooFieldMeta> = {
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
  state: {
    name: 'state',
    type: 'selection',
    string: 'Status',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
    selection: [
      ['draft', 'Draft'],
      ['confirmed', 'Confirmed'],
      ['done', 'Done'],
    ],
  },
}

const readResult = [{ id: 1, name: 'Test', email: 't@e.com', state: 'draft' }]

describe('OdooFormRenderer', () => {
  beforeEach(() => {
    mockCallKw.mockReset()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test('renders form in read-only mode', async () => {
    mockCallKw.mockResolvedValue(readResult)
    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  test('clicking Edit shows Save and Cancel', async () => {
    const user = userEvent.setup()
    mockCallKw.mockResolvedValue(readResult)
    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  test('Cancel returns to read-only', async () => {
    const user = userEvent.setup()
    mockCallKw.mockResolvedValue(readResult)
    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Edit'))
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  test('Save triggers write for existing record', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'write') return Promise.resolve(true)
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Edit'))
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Save'))

    await waitFor(() => {
      const writeCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'write',
      )
      expect(writeCall).toBeDefined()
      expect(writeCall?.[0]).toBe('res.partner')
      expect(writeCall?.[2][0]).toEqual([1])
    })
  })

  test('Save triggers create for new record', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'default_get') return Promise.resolve({ name: '', email: '', state: false })
      if (method === 'onchange') return Promise.resolve({ value: {} })
      if (method === 'create') return Promise.resolve(42)
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    const nameInput = screen.getAllByRole('textbox')[0]
    await user.clear(nameInput)
    await user.type(nameInput, 'New Partner')
    await user.click(screen.getByText('Save'))

    await waitFor(() => {
      const createCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'create',
      )
      expect(createCall).toBeDefined()
      expect(createCall?.[0]).toBe('res.partner')
    })
  })

  test('required validation shows error', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'default_get') return Promise.resolve({ name: '', email: '', state: false })
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(screen.getByText(/Required/)).toBeInTheDocument()
    })
  })

  test('shows statusbar when state field has selection', async () => {
    mockCallKw.mockResolvedValue([{ id: 1, name: 'Test', email: 't@e.com', state: 'confirmed' }])

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  test('shows notebook tabs', async () => {
    const notebookArch = `<form string="Product">
      <sheet>
        <notebook>
          <page string="General"><field name="name"/></page>
          <page string="Sales"><field name="email"/></page>
        </notebook>
      </sheet>
    </form>`

    mockCallKw.mockResolvedValue([
      { id: 1, name: 'Test Product', email: 'p@e.com', state: 'draft' },
    ])

    render(
      <OdooFormRenderer
        model="product.template"
        arch={notebookArch}
        fields={fields}
        recordId={1}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  test('renders header action buttons', async () => {
    const headerArch = `<form string="Lead">
      <header>
        <button name="action_confirm" type="object" string="Confirm" class="btn-primary"/>
        <button name="action_cancel" type="object" string="Cancel"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    mockCallKw.mockResolvedValue(readResult)
    render(<OdooFormRenderer model="crm.lead" arch={headerArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  test('hides button when states does not match', async () => {
    const statesArch = `<form string="Lead">
      <header>
        <button name="action_confirm" type="object" string="Confirm" states="draft"/>
        <button name="action_done" type="object" string="Done" states="confirmed"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    mockCallKw.mockResolvedValue([{ id: 1, name: 'Test', email: 't@e.com', state: 'confirmed' }])
    render(<OdooFormRenderer model="crm.lead" arch={statesArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  test('clicking object button calls callKw with method', async () => {
    const user = userEvent.setup()
    const headerArch = `<form string="Lead">
      <header>
        <button name="action_won" type="object" string="Mark as Won"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'action_won') return Promise.resolve(true)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="crm.lead" arch={headerArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Mark as Won')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Mark as Won'))

    await waitFor(() => {
      const actionCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'action_won',
      )
      expect(actionCall).toBeDefined()
      expect(actionCall?.[0]).toBe('crm.lead')
      expect(actionCall?.[2]).toEqual([[1]])
    })
  })

  test('clicking action button calls ir.actions.server run', async () => {
    const user = userEvent.setup()
    const headerArch = `<form string="Lead">
      <header>
        <button name="42" type="action" string="Run Report"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'run') return Promise.resolve(true)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="crm.lead" arch={headerArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Run Report')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Run Report'))

    await waitFor(() => {
      const actionCall = mockCallKw.mock.calls.find(
        (c: unknown[]) =>
          (c as unknown[])[0] === 'ir.actions.server' && (c as unknown[])[1] === 'run',
      )
      expect(actionCall).toBeDefined()
      expect(actionCall?.[2]).toEqual([[42]])
    })
  })

  test('sheet uses max-w-[860px] for layout', async () => {
    mockCallKw.mockResolvedValue(readResult)
    const { container } = render(
      <OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    const sheet = container.querySelector('.o_form_sheet')
    expect(sheet).toBeInTheDocument()
    // max-w-[860px] is on the sheet's parent div
    const layoutContainer = sheet?.closest('[class*="max-w"]')
    expect(layoutContainer?.className).toContain('max-w-[860px]')
  })

  test('shows Unsaved indicator when form is dirty', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Edit'))

    // Change a field value to make the form dirty
    const nameInput = screen.getAllByRole('textbox')[0]
    await user.clear(nameInput)
    await user.type(nameInput, 'Changed Name')

    await waitFor(() => {
      expect(screen.getByText('Unsaved')).toBeInTheDocument()
    })
  })

  test('shows Saved indicator after successful save', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'write') return Promise.resolve(true)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Edit'))

    // Change a field to make form dirty
    const nameInput = screen.getAllByRole('textbox')[0]
    await user.clear(nameInput)
    await user.type(nameInput, 'Changed Name')

    await waitFor(() => {
      expect(screen.getByText('Unsaved')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument()
    })
    expect(screen.queryByText('Unsaved')).not.toBeInTheDocument()
  })

  test('shows Invalid indicator when there is a save error', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'default_get') return Promise.resolve({ name: '', email: '', state: false })
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
    // Click Save without filling required field
    await user.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument()
    })
  })

  test('header with statusbar and buttons renders in header area', async () => {
    const fullArch = `<form string="Lead">
      <header>
        <button name="action_confirm" type="object" string="Confirm" states="draft" class="btn-primary"/>
      </header>
      <sheet><field name="name"/></sheet>
    </form>`

    mockCallKw.mockResolvedValue([{ id: 1, name: 'Test', email: 't@e.com', state: 'draft' }])
    render(<OdooFormRenderer model="crm.lead" arch={fullArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  test('renders button_box stat buttons', async () => {
    const buttonBoxArch = `<form string="Lead">
      <sheet>
        <div class="oe_button_box" name="button_box">
          <button name="action_open" type="object" class="oe_stat_button" icon="fa-pencil">
            <field name="count" widget="statinfo" string="Records"/>
          </button>
        </div>
        <field name="name"/>
      </sheet>
    </form>`

    const fieldsWithCount = {
      ...fields,
      count: {
        name: 'count',
        type: 'integer',
        string: 'Count',
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      },
    }

    mockCallKw.mockResolvedValue([
      { id: 1, name: 'Test', email: 't@e.com', state: 'draft', count: 5 },
    ])
    render(
      <OdooFormRenderer
        model="crm.lead"
        arch={buttonBoxArch}
        fields={fieldsWithCount}
        recordId={1}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    expect(screen.getByText('Records')).toBeInTheDocument()
  })

  test('clicking stat button calls object method', async () => {
    const user = userEvent.setup()
    const buttonBoxArch = `<form string="Lead">
      <sheet>
        <div class="oe_button_box" name="button_box">
          <button name="action_open" type="object" class="oe_stat_button" icon="fa-eye">
            <field name="count" widget="statinfo" string="View"/>
          </button>
        </div>
        <field name="name"/>
      </sheet>
    </form>`

    const fieldsWithCount = {
      ...fields,
      count: {
        name: 'count',
        type: 'integer',
        string: 'Count',
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      },
    }

    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read')
        return Promise.resolve([
          { id: 1, name: 'Test', email: 't@e.com', state: 'draft', count: 3 },
        ])
      if (method === 'action_open') return Promise.resolve(true)
      return Promise.resolve(undefined)
    })

    render(
      <OdooFormRenderer
        model="crm.lead"
        arch={buttonBoxArch}
        fields={fieldsWithCount}
        recordId={1}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('View')).toBeInTheDocument()
    })
    await user.click(screen.getByText('View'))

    await waitFor(() => {
      const actionCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'action_open',
      )
      expect(actionCall).toBeDefined()
      expect(actionCall?.[0]).toBe('crm.lead')
      expect(actionCall?.[2]).toEqual([[1]])
    })
  })

  test('Ctrl+S triggers save', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'write') return Promise.resolve(true)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Edit'))

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    act(() => {
      fireEvent.keyDown(document, { key: 's', ctrlKey: true })
    })

    await waitFor(() => {
      const writeCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'write',
      )
      expect(writeCall).toBeDefined()
    })
  })

  test('Escape cancels edit mode', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })
    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Edit'))

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  test('clicking statusbar calls write with new state', async () => {
    const user = userEvent.setup()
    mockCallKw.mockImplementation((_model: string, method: string) => {
      if (method === 'read') return Promise.resolve(readResult)
      if (method === 'write') return Promise.resolve(true)
      if (method === 'onchange') return Promise.resolve({ value: {} })
      return Promise.resolve(undefined)
    })

    render(<OdooFormRenderer model="res.partner" arch={formArch} fields={fields} recordId={1} />, {
      wrapper,
    })

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Confirmed'))

    await waitFor(() => {
      const writeCall = mockCallKw.mock.calls.find(
        (c: unknown[]) => (c as unknown[])[1] === 'write',
      )
      expect(writeCall).toBeDefined()
      expect(writeCall?.[2]).toEqual([[1], { state: 'confirmed' }])
    })
  })

  test('renders help tooltip on field with help attribute', async () => {
    const fieldsWithHelp: Record<string, OdooFieldMeta> = {
      ...fields,
      name: {
        ...fields.name,
        help: 'Enter the partner name',
      },
    }

    mockCallKw.mockResolvedValue(readResult)
    render(
      <OdooFormRenderer model="res.partner" arch={formArch} fields={fieldsWithHelp} recordId={1} />,
      { wrapper },
    )

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    // HelpPopover renders a button with "?" text
    const helpButtons = screen.getAllByText('?')
    expect(helpButtons.length).toBeGreaterThan(0)
    // Click to open popover
    const helpBtn = helpButtons.find((el) => el.tagName === 'BUTTON')
    expect(helpBtn).toBeTruthy()
    helpBtn?.click()
    await waitFor(() => {
      expect(screen.getByText('Enter the partner name')).toBeInTheDocument()
    })
  })

  test('renders boolean field with checkbox before label', async () => {
    const boolArch = `<form string="Settings">
      <sheet>
        <group>
          <field name="active"/>
          <field name="name"/>
        </group>
      </sheet>
    </form>`

    const boolFields: Record<string, OdooFieldMeta> = {
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
      name: fields.name,
    }

    mockCallKw.mockResolvedValue([{ id: 1, active: true, name: 'Test' }])
    render(
      <OdooFormRenderer model="res.settings" arch={boolArch} fields={boolFields} recordId={1} />,
      {
        wrapper,
      },
    )

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })
})
