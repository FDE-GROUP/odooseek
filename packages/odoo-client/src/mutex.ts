export class Mutex {
  private _lock: Promise<void> = Promise.resolve()
  private _locked = false

  get isLocked(): boolean {
    return this._locked
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const prev = this._lock
    let release!: () => void
    this._lock = new Promise<void>((r) => {
      release = r
    })
    this._locked = true
    await prev
    try {
      return await fn()
    } finally {
      release()
      this._locked = false
    }
  }
}
