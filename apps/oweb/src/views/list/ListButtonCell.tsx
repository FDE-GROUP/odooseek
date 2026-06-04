import { callKw } from '@odooseek/odoo-client'
import type { ListButtonElement } from '@odooseek/odoo-client'
import { useState } from 'react'

export function ListButtonCell({
  btn,
  record,
  model,
  onDone,
}: {
  btn: ListButtonElement
  record: Record<string, unknown>
  model: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  if (btn.states) {
    const allowed = btn.states.split(',').map((s: string) => s.trim())
    const currentState = String(record.state ?? '')
    if (!allowed.includes(currentState)) return null
  }

  const handleClick = async () => {
    if (btn.confirm && !window.confirm(btn.confirm)) return
    setLoading(true)
    try {
      if (btn.buttonType === 'object') {
        await callKw(model, btn.name, [[record.id as number]])
      } else if (btn.buttonType === 'action') {
        await callKw(model, 'button_execute', [[record.id as number]], { action_name: btn.name })
      }
      onDone()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
        btn.class?.includes('btn-primary')
          ? 'bg-accent text-on-accent hover:bg-accent/90'
          : 'border border-border-default text-text-secondary hover:bg-hover hover:text-text-primary'
      } disabled:opacity-50`}
    >
      {loading ? '...' : btn.string || btn.name}
    </button>
  )
}
