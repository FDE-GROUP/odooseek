import { describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@odooseek/odoo-client', () => ({
  callKw: vi.fn().mockResolvedValue({}),
}))

describe('WizardDialog', () => {
  test('module can be imported', async () => {
    const mod = await import('../WizardDialog')
    expect(mod.WizardDialog).toBeDefined()
    expect(mod.WizardDialog).toBeTruthy()
  })
})
