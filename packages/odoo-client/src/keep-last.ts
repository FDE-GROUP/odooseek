export class KeepLastDroppedError extends Error {
  constructor() {
    super('KeepLast: operation dropped')
    this.name = 'KeepLastDroppedError'
  }
}

export class KeepLast {
  private _id = 0

  async add<T>(promise: Promise<T>): Promise<T> {
    const id = ++this._id
    const result = await promise
    if (id !== this._id) throw new KeepLastDroppedError()
    return result
  }

  invalidate(): void {
    ++this._id
  }
}
