import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { describe, expect, test } from 'vitest'
import {
  isWizardModel,
  normalizeOnchangeValue,
  validateAllFields,
  wizardBtn,
} from '../form/formUtils'

describe('normalizeOnchangeValue', () => {
  test('converts many2one false to null', () => {
    expect(normalizeOnchangeValue(false, 'many2one')).toBe(null)
  })

  test('extracts id from many2one tuple', () => {
    expect(normalizeOnchangeValue([1, 'Sales'], 'many2one')).toBe(1)
    expect(normalizeOnchangeValue([42, 'Admin'], 'many2one')).toBe(42)
  })

  test('extracts ids from many2many tuples', () => {
    expect(
      normalizeOnchangeValue(
        [
          [1, 'A'],
          [2, 'B'],
        ],
        'many2many',
      ),
    ).toEqual([1, 2])
  })

  test('passes through other values', () => {
    expect(normalizeOnchangeValue('hello', 'char')).toBe('hello')
    expect(normalizeOnchangeValue(42, 'integer')).toBe(42)
    expect(normalizeOnchangeValue(null, 'char')).toBe(null)
  })
})

describe('isWizardModel', () => {
  test('detects .wizard suffix', () => {
    expect(isWizardModel('hr.departure.wizard')).toBe(true)
    expect(isWizardModel('project.task.create.wizard')).toBe(true)
  })

  test('detects known wizard models', () => {
    expect(isWizardModel('crm.lead2opportunity.partner')).toBe(true)
    expect(isWizardModel('crm.lead.lost')).toBe(true)
    expect(isWizardModel('crm.merge.opportunity')).toBe(true)
  })

  test('returns false for non-wizard', () => {
    expect(isWizardModel('crm.lead')).toBe(false)
    expect(isWizardModel('res.partner')).toBe(false)
    expect(isWizardModel(undefined)).toBe(false)
  })
})

describe('wizardBtn', () => {
  test('returns correct labels for known wizards', () => {
    expect(wizardBtn('crm.lead.lost')).toEqual({
      label: 'Mark Lost',
      name: 'action_lost_reason_apply',
    })
    expect(wizardBtn('crm.lead2opportunity.partner')).toEqual({
      label: 'Convert',
      name: 'action_apply',
    })
  })

  test('defaults to Confirm for unknown', () => {
    expect(wizardBtn('hr.departure.wizard')).toEqual({ label: 'Confirm', name: 'action_apply' })
  })
})

describe('validateAllFields', () => {
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
    age: {
      name: 'age',
      type: 'integer',
      string: 'Age',
      required: true,
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
  }

  test('detects missing required fields', () => {
    const { missing } = validateAllFields(fields, { name: '', age: undefined })
    expect(missing.has('name')).toBe(true)
    expect(missing.has('age')).toBe(false) // integer never empty
  })

  test('detects type errors', () => {
    const { errors } = validateAllFields(fields, { name: 'test', age: 'not_a_number' as any })
    expect(errors.has('age')).toBe(true)
    expect(errors.has('name')).toBe(false)
  })

  test('passes all valid fields', () => {
    const { missing, errors } = validateAllFields(fields, {
      name: 'John',
      email: 'j@c.com',
      age: 30,
      active: true,
    })
    expect(missing.size).toBe(0)
    expect(errors.size).toBe(0)
  })

  test('boolean field never empty', () => {
    const f: Record<string, OdooFieldMeta> = {
      active: {
        name: 'active',
        type: 'boolean',
        string: 'Active',
        required: true,
        readonly: false,
        store: true,
        searchable: true,
        sortable: true,
      },
    }
    const { missing } = validateAllFields(f, { active: false })
    expect(missing.has('active')).toBe(false)
  })
})
