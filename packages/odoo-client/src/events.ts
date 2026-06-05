type Listener = () => void

export class EventEmitter {
  private _listeners = new Set<Listener>()

  subscribe(fn: Listener): () => void {
    this._listeners.add(fn)
    return () => {
      this._listeners.delete(fn)
    }
  }

  notify(): void {
    for (const fn of this._listeners) fn()
  }
}
