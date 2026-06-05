import { describe, expect, it } from 'vitest'
import { Mutex } from '../mutex'

describe('Mutex', () => {
  it('runs a single async operation', async () => {
    const mutex = new Mutex()
    const result = await mutex.run(async () => 42)
    expect(result).toBe(42)
  })

  it('serializes concurrent operations', async () => {
    const mutex = new Mutex()
    const order: number[] = []

    const op1 = mutex.run(async () => {
      order.push(1)
      await new Promise((r) => setTimeout(r, 50))
      order.push(1)
    })
    const op2 = mutex.run(async () => {
      order.push(2)
    })

    await Promise.all([op1, op2])
    // op2 waits for op1 to finish
    expect(order).toEqual([1, 1, 2])
  })

  it('releases lock when operation throws', async () => {
    const mutex = new Mutex()
    const op1 = mutex.run(async () => {
      throw new Error('boom')
    }).catch(() => {})

    const result = await mutex.run(async () => 'ok')
    expect(result).toBe('ok')
    await op1
  })

  it('reports locked state', async () => {
    const mutex = new Mutex()
    expect(mutex.isLocked).toBe(false)

    let resolveOp!: () => void
    const op = mutex.run(async () => {
      await new Promise<void>((r) => { resolveOp = r })
    })
    // Allow microtask to run so the fn body starts executing
    await new Promise((r) => setTimeout(r, 0))
    expect(mutex.isLocked).toBe(true)

    resolveOp()
    await op
    expect(mutex.isLocked).toBe(false)
  })
})
