import { describe, expect, test } from 'vitest'
import { resolveOdooImageFromRecord, resolveOdooImageSrc } from '../odoo-image'

describe('resolveOdooImageSrc', () => {
  test('returns data URL for base64 without record id', () => {
    expect(resolveOdooImageSrc({ raw: 'aGVsbG8=' })).toBe('data:image/png;base64,aGVsbG8=')
  })

  test('returns data URL for JPEG base64 starting with /9j/', () => {
    const jpeg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBD'
    expect(resolveOdooImageSrc({ raw: jpeg })).toBe(`data:image/jpeg;base64,${jpeg}`)
  })

  test('returns web/image path when model and id given without raw', () => {
    expect(resolveOdooImageSrc({ model: 'hr.employee', recordId: 7, field: 'avatar_128' })).toBe(
      '/api/web/image/hr.employee/7/avatar_128',
    )
  })

  test('returns undefined when raw is false (explicit empty)', () => {
    expect(
      resolveOdooImageSrc({ raw: false, model: 'res.users', recordId: 42, field: 'avatar_128' }),
    ).toBeUndefined()
  })

  test('passes through http URLs', () => {
    expect(resolveOdooImageSrc({ raw: 'https://cdn.example/x.png' })).toBe(
      'https://cdn.example/x.png',
    )
  })

  test('JPEG base64 starting with /9j/ uses web/image when record id is known', () => {
    const jpegB64 = '/9j/4AAQSkZJRg'
    expect(
      resolveOdooImageSrc({
        raw: jpegB64,
        model: 'hr.employee',
        recordId: 3,
        field: 'image_128',
      }),
    ).toBe('/api/web/image/hr.employee/3/image_128')
  })

  test('JPEG base64 without record id keeps full payload in data URL', () => {
    const jpegB64 = '/9j/4AAQSkZJRg'
    expect(resolveOdooImageSrc({ raw: jpegB64 })).toBe(`data:image/jpeg;base64,${jpegB64}`)
  })

  test('passes through /api/web/image paths', () => {
    expect(resolveOdooImageSrc({ raw: '/api/web/image/hr.employee/1/image_128' })).toBe(
      '/api/web/image/hr.employee/1/image_128',
    )
  })
})

describe('resolveOdooImageFromRecord', () => {
  test('prefers web/image for inline base64 when model and id exist', () => {
    const src = resolveOdooImageFromRecord({ image_128: '/9j/abc123+/=' }, 'hr.employee', 1)
    expect(src).toBe('/api/web/image/hr.employee/1/image_128')
  })
})
