import { describe, expect, it } from 'vitest'
import { KeepLast, KeepLastDroppedError } from '../keep-last'

describe('KeepLast', () => {
  it('resolves the latest promise', async () => {
    const kl = new KeepLast()
    const result = await kl.add(Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('drops earlier promises when a newer one is added', async () => {
    const kl = new KeepLast()
    let resolve1!: (v: number) => void
    let resolve2!: (v: number) => void

    const p1 = kl.add(new Promise<number>((r) => { resolve1 = r }))
    const p2 = kl.add(new Promise<number>((r) => { resolve2 = r }))

    resolve1(1)
    resolve2(2)

    await expect(p1).rejects.toThrow(KeepLastDroppedError)
    await expect(p2).resolves.toBe(2)
  })

  it('invalidate drops pending promises', async () => {
    const kl = new KeepLast()
    let resolve!: (v: number) => void
    const p = kl.add(new Promise<number>((r) => { resolve = r }))

    kl.invalidate()
    resolve(1)

    await expect(p).rejects.toThrow(KeepLastDroppedError)
  })
})
