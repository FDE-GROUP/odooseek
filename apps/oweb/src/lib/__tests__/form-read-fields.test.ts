import type { FormElement, OdooFieldMeta } from '@odooseek/odoo-client'
import { describe, expect, test } from 'vitest'
import { parseInaccessibleFieldFromError, resolveFormReadFields } from '../form-read-fields'

describe('form-read-fields', () => {
  test('parseInaccessibleFieldFromError parses Chinese Odoo message', () => {
    const msg =
      'Odoo Error: 您没有足够的权限访问 Project（project.project）上的字段“stage_id”。请联系您的系统管理员。'
    expect(parseInaccessibleFieldFromError(msg)).toBe('stage_id')
  })

  test('resolveFormReadFields uses arch fields only', () => {
    const elements: FormElement[] = [
      {
        type: 'group',
        elements: [
          { type: 'field', name: 'name' },
          { type: 'field', name: 'stage_id', groups: 'project.group_project_stages' },
        ],
      },
    ]
    const meta: Record<string, OdooFieldMeta> = {
      id: {
        name: 'id',
        type: 'integer',
        string: 'ID',
        required: false,
        readonly: true,
        store: true,
        searchable: true,
        sortable: true,
      },
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
      stage_id: {
        name: 'stage_id',
        type: 'many2one',
        string: 'Stage',
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      },
      partner_id: {
        name: 'partner_id',
        type: 'many2one',
        string: 'Partner',
        required: false,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      },
    }
    const names = resolveFormReadFields(elements, meta, {
      groups: {},
      is_admin: false,
      is_system: false,
    })
    expect(names).toContain('id')
    expect(names).toContain('name')
    expect(names).not.toContain('partner_id')
    expect(names).not.toContain('stage_id')
  })
})
