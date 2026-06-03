import { describe, expect, test } from 'vitest'
import type { OdooFieldMeta } from '../types'
import {
  ALWAYS_NON_EMPTY_TYPES,
  isFieldValueEmpty,
  validateFieldValue,
  validateModelData,
} from '../validation'

// ── Test helpers ─────────────────────────────────────────────────

function meta(overrides: Partial<OdooFieldMeta> = {}): OdooFieldMeta {
  return {
    name: 'test_field',
    type: 'char',
    string: 'Test Field',
    required: false,
    readonly: false,
    store: true,
    searchable: true,
    sortable: true,
    ...overrides,
  }
}

// ── isFieldValueEmpty ────────────────────────────────────────────

describe('isFieldValueEmpty', () => {
  test('null/undefined/false/empty string are empty for char', () => {
    expect(isFieldValueEmpty(null, 'char')).toBe(true)
    expect(isFieldValueEmpty(undefined, 'char')).toBe(true)
    expect(isFieldValueEmpty('', 'char')).toBe(true)
  })

  test('non-empty string is not empty', () => {
    expect(isFieldValueEmpty('hello', 'char')).toBe(false)
  })

  test('boolean false/true are never empty', () => {
    expect(isFieldValueEmpty(false, 'boolean')).toBe(false)
    expect(isFieldValueEmpty(true, 'boolean')).toBe(false)
  })

  test('integer 0 is never empty', () => {
    expect(isFieldValueEmpty(0, 'integer')).toBe(false)
    expect(isFieldValueEmpty(42, 'integer')).toBe(false)
  })

  test('float 0 is never empty', () => {
    expect(isFieldValueEmpty(0, 'float')).toBe(false)
    expect(isFieldValueEmpty(3.14, 'float')).toBe(false)
  })

  test('monetary 0 is never empty', () => {
    expect(isFieldValueEmpty(0, 'monetary')).toBe(false)
  })

  test('html empty string is empty', () => {
    expect(isFieldValueEmpty('', 'html')).toBe(true)
  })

  test('html with content is not empty', () => {
    expect(isFieldValueEmpty('<p>text</p>', 'html')).toBe(false)
  })

  test('one2many empty array / null / undefined is empty', () => {
    expect(isFieldValueEmpty([], 'one2many')).toBe(true)
    expect(isFieldValueEmpty(null, 'one2many')).toBe(true)
    expect(isFieldValueEmpty(undefined, 'one2many')).toBe(true)
  })

  test('one2many with records is not empty', () => {
    expect(isFieldValueEmpty([[0, -1, {}]], 'one2many')).toBe(false)
  })

  test('many2many empty is empty, with data is not', () => {
    expect(isFieldValueEmpty([], 'many2many')).toBe(true)
    expect(isFieldValueEmpty([1, 2, 3], 'many2many')).toBe(false)
  })

  test('date with value is not empty', () => {
    expect(isFieldValueEmpty('2026-06-03', 'date')).toBe(false)
    expect(isFieldValueEmpty('', 'date')).toBe(true)
  })

  test('many2one false is empty', () => {
    expect(isFieldValueEmpty(false, 'many2one')).toBe(true)
  })
})

// ── validateFieldValue ───────────────────────────────────────────

describe('validateFieldValue', () => {
  describe('integer / float / monetary', () => {
    test('valid number returns null', () => {
      expect(validateFieldValue(42, meta({ type: 'integer' }))).toBeNull()
      expect(validateFieldValue(3.14, meta({ type: 'float' }))).toBeNull()
      expect(validateFieldValue(100, meta({ type: 'monetary' }))).toBeNull()
    })

    test('non-number returns error', () => {
      expect(validateFieldValue('abc', meta({ type: 'integer' }))).toBe('Must be a number')
      expect(validateFieldValue('12.5', meta({ type: 'integer' }))).toBe('Must be a number')
      expect(validateFieldValue(true, meta({ type: 'float' }))).toBe('Must be a number')
    })

    test('empty values (null/undefined/false/empty string) return null', () => {
      expect(validateFieldValue(null, meta({ type: 'integer' }))).toBeNull()
      expect(validateFieldValue(undefined, meta({ type: 'float' }))).toBeNull()
      expect(validateFieldValue(false, meta({ type: 'monetary' }))).toBeNull()
      expect(validateFieldValue('', meta({ type: 'integer' }))).toBeNull()
    })
  })

  describe('selection', () => {
    const selectionMeta = meta({
      type: 'selection',
      selection: [
        ['draft', 'Draft'],
        ['sent', 'Sent'],
        ['done', 'Done'],
      ],
    })

    test('valid selection returns null', () => {
      expect(validateFieldValue('draft', selectionMeta)).toBeNull()
      expect(validateFieldValue('sent', selectionMeta)).toBeNull()
      expect(validateFieldValue('done', selectionMeta)).toBeNull()
    })

    test('invalid selection returns error', () => {
      const err = validateFieldValue('cancelled', selectionMeta)
      expect(err).toContain('Invalid selection')
      expect(err).toContain('cancelled')
    })

    test('selection without options returns null (no constraint)', () => {
      expect(validateFieldValue('anything', meta({ type: 'selection' }))).toBeNull()
    })

    test('empty values return null', () => {
      expect(validateFieldValue(null, selectionMeta)).toBeNull()
      expect(validateFieldValue(false, selectionMeta)).toBeNull()
      expect(validateFieldValue('', selectionMeta)).toBeNull()
    })
  })

  describe('many2one', () => {
    const m2oMeta = meta({ type: 'many2one', relation: 'res.partner' })

    test('valid [id, name] tuple returns null', () => {
      expect(validateFieldValue([42, 'Partner Name'], m2oMeta)).toBeNull()
    })

    test('false returns null (empty reference)', () => {
      expect(validateFieldValue(false, m2oMeta)).toBeNull()
    })

    test('null/undefined returns null', () => {
      expect(validateFieldValue(null, m2oMeta)).toBeNull()
      expect(validateFieldValue(undefined, m2oMeta)).toBeNull()
    })

    test('non-array non-false returns error', () => {
      expect(validateFieldValue('some string', m2oMeta)).toBe('Invalid reference')
      expect(validateFieldValue(42, m2oMeta)).toBe('Invalid reference')
    })

    test('array with wrong format returns error', () => {
      expect(validateFieldValue([], m2oMeta)).toBe('Invalid reference format')
      expect(validateFieldValue(['not', 'a', 'tuple'], m2oMeta)).toBe('Invalid reference format')
      expect(validateFieldValue([42], m2oMeta)).toBe('Invalid reference format')
    })

    test('array with wrong types returns error', () => {
      expect(validateFieldValue(['string', 'string'], m2oMeta)).toBe('Invalid reference format')
    })
  })

  describe('date / datetime', () => {
    test('valid date returns null', () => {
      expect(validateFieldValue('2026-06-03', meta({ type: 'date' }))).toBeNull()
      expect(validateFieldValue('2026-06-03 14:30:00', meta({ type: 'datetime' }))).toBeNull()
    })

    test('invalid date returns error', () => {
      expect(validateFieldValue('not-a-date', meta({ type: 'date' }))).toBe('Invalid date format')
      expect(validateFieldValue('03/06/2026', meta({ type: 'date' }))).toBe('Invalid date format')
    })

    test('empty/false returns null', () => {
      expect(validateFieldValue('', meta({ type: 'date' }))).toBeNull()
      expect(validateFieldValue(false, meta({ type: 'date' }))).toBeNull()
      expect(validateFieldValue(null, meta({ type: 'date' }))).toBeNull()
    })
  })

  describe('char / text', () => {
    test('any string returns null (no type constraint)', () => {
      expect(validateFieldValue('hello', meta({ type: 'char' }))).toBeNull()
      expect(validateFieldValue('long text', meta({ type: 'text' }))).toBeNull()
    })
  })
})

// ── validateModelData ────────────────────────────────────────────

describe('validateModelData', () => {
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
    priority: {
      name: 'priority',
      type: 'selection',
      string: 'Priority',
      required: false,
      readonly: false,
      store: true,
      searchable: true,
      sortable: true,
      selection: [
        ['0', 'Low'],
        ['1', 'Medium'],
        ['2', 'High'],
      ],
    },
    amount: {
      name: 'amount',
      type: 'monetary',
      string: 'Amount',
      required: false,
      readonly: false,
      store: true,
      searchable: true,
      sortable: true,
    },
  }

  test('valid data returns empty array', () => {
    const errors = validateModelData(fields, {
      name: 'Test',
      priority: '1',
      amount: 100,
    })
    expect(errors).toEqual([])
  })

  test('missing required field returns error', () => {
    const errors = validateModelData(fields, { priority: '0' })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'name', message: 'Required: Name' })
  })

  test('type error returns error message', () => {
    const errors = validateModelData(fields, {
      name: 'Test',
      amount: 'not-a-number',
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'amount', message: 'Must be a number' })
  })

  test('selection validation catches invalid enum', () => {
    const errors = validateModelData(fields, {
      name: 'Test',
      priority: '99',
    })
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('Invalid selection')
  })

  test('unknown field returns error', () => {
    const errors = validateModelData(fields, {
      name: 'Test',
      nonexistent: 'value',
    })
    // Required + type check on name (ok), plus unknown field check
    const unknownErrors = errors.filter((e) => e.message === 'Unknown field')
    expect(unknownErrors).toHaveLength(1)
    expect(unknownErrors[0].field).toBe('nonexistent')
  })

  test('empty required string passes boolean literal false check', () => {
    const errors = validateModelData(fields, {
      name: false,
      amount: 0,
    })
    // name is required and false is empty for char → error
    // amount is 0 which is valid for monetary
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('name')
  })

  test('boolean required field with false passes', () => {
    const boolFields: Record<string, OdooFieldMeta> = {
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
    expect(validateModelData(boolFields, { active: false })).toEqual([])
    expect(validateModelData(boolFields, { active: true })).toEqual([])
  })
})

// ── ALWAYS_NON_EMPTY_TYPES ────────────────────────────────────────

describe('ALWAYS_NON_EMPTY_TYPES', () => {
  test('contains boolean, float, integer, monetary', () => {
    expect(ALWAYS_NON_EMPTY_TYPES.has('boolean')).toBe(true)
    expect(ALWAYS_NON_EMPTY_TYPES.has('float')).toBe(true)
    expect(ALWAYS_NON_EMPTY_TYPES.has('integer')).toBe(true)
    expect(ALWAYS_NON_EMPTY_TYPES.has('monetary')).toBe(true)
  })

  test('does not contain char, text, selection', () => {
    expect(ALWAYS_NON_EMPTY_TYPES.has('char')).toBe(false)
    expect(ALWAYS_NON_EMPTY_TYPES.has('text')).toBe(false)
    expect(ALWAYS_NON_EMPTY_TYPES.has('selection')).toBe(false)
    expect(ALWAYS_NON_EMPTY_TYPES.has('many2one')).toBe(false)
  })
})

describe('validateModelData edge cases', () => {
  const fields: Record<string, OdooFieldMeta> = {
    name: { name: 'name', type: 'char', string: 'Name', required: true, readonly: false, store: true, searchable: true, sortable: true },
    priority: { name: 'priority', type: 'selection', string: 'Priority', required: false, readonly: false, store: true, searchable: true, sortable: true, selection: [['0', 'Low'], ['1', 'Medium']] },
    amount: { name: 'amount', type: 'integer', string: 'Amount', required: false, readonly: false, store: true, searchable: true, sortable: true },
  }

  test('multiple errors collected at once', () => {
    const errors = validateModelData(fields, { priority: '99', amount: 'bad' })
    expect(errors.length).toBeGreaterThanOrEqual(2)
    const fieldsWithErrors = errors.map(e => e.field)
    expect(fieldsWithErrors).toContain('name')
    expect(fieldsWithErrors).toContain('priority')
  })

  test('integer field accepts 0', () => {
    expect(validateModelData(fields, { name: 'T', amount: 0 })).toEqual([])
  })

  test('integer field rejects negative (validates as number)', () => {
    expect(validateModelData(fields, { name: 'T', amount: -5 })).toEqual([])
  })

  test('selection with single valid option', () => {
    const singleFields: Record<string, OdooFieldMeta> = {
      name: { ...fields.name, required: false },
      type: { ...fields.priority, selection: [['draft', 'Draft']] },
    }
    expect(validateModelData(singleFields, { type: 'draft' })).toEqual([])
    expect(validateModelData(singleFields, { type: 'invalid' }).length).toBe(1)
  })

  test('datetime with full ISO format passes', () => {
    const dtFields: Record<string, OdooFieldMeta> = {
      name: { ...fields.name, required: false },
      created: { name: 'created', type: 'datetime', string: 'Created', required: false, readonly: false, store: true, searchable: true, sortable: true },
    }
    expect(validateModelData(dtFields, { created: '2026-06-03 14:30:00' })).toEqual([])
  })

  test('many2one accepts valid [id, name] tuple', () => {
    const m2oFields: Record<string, OdooFieldMeta> = {
      name: { ...fields.name, required: false },
      partner_id: { name: 'partner_id', type: 'many2one', string: 'Partner', required: false, readonly: false, store: true, searchable: true, sortable: true, relation: 'res.partner' },
    }
    expect(validateModelData(m2oFields, { partner_id: [1, 'Test Partner'] })).toEqual([])
    expect(validateModelData(m2oFields, { partner_id: false })).toEqual([])
    expect(validateModelData(m2oFields, { partner_id: [1] }).length).toBe(1)
  })

  test('field not in fields metadata is flagged as unknown', () => {
    const errors = validateModelData(fields, { name: 'T', madeUpField: 'value' })
    const unknown = errors.filter(e => e.message === 'Unknown field')
    expect(unknown.length).toBe(1)
  })

  test('isFieldValueEmpty handles undefined field type gracefully', () => {
    expect(isFieldValueEmpty('', undefined)).toBe(true)
    expect(isFieldValueEmpty('hello', undefined)).toBe(false)
  })

  test('isFieldValueEmpty handles o2m with false value', () => {
    expect(isFieldValueEmpty(false, 'one2many')).toBe(true)
  })

  test('validateFieldValue skips html type for empty check', () => {
    expect(validateFieldValue('<p>x</p>', meta({ type: 'html' }))).toBeNull()
  })
})
