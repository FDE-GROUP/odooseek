import type { StatButtonElement } from '@odooseek/odoo-client'
import { callKw } from '@odooseek/odoo-client'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

const MAX_BUTTON_BOX = 4

export function StatButton({
  button,
  record,
  model,
  recordId,
}: {
  button: StatButtonElement
  record?: Record<string, unknown>
  model: string
  recordId?: number
}) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  let value: React.ReactNode = ''
  let text = button.string ?? ''

  if (button.content?.type === 'field') {
    const raw = record?.[button.content.fieldName]
    value = raw != null ? String(raw) : '0'
    text = button.content.string ?? text
  } else if (button.content?.type === 'custom') {
    const raw = button.content.valueField ? record?.[button.content.valueField] : undefined
    value = raw != null ? String(raw) : ''
    text = button.content.textFallback ?? text
  }

  const handleClick = useCallback(async () => {
    if (loading) return
    if (button.confirm && !window.confirm(button.confirm)) return

    if (button.buttonType === 'action') {
      setLoading(true)
      try {
        await callKw('ir.actions.server', 'run', [[Number(button.name)]])
        if (recordId) {
          queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed. Please try again.')
        setTimeout(() => setError(null), 5000)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!recordId) return

    setLoading(true)
    try {
      if (button.buttonType === 'object') {
        await callKw(model, button.name, [[recordId]])
        queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed. Please try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }, [button, loading, model, recordId, queryClient])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={error ?? undefined}
      className={`oe_stat_button ${error ? 'oe_stat_button--error' : ''}`}
    >
      {button.icon && <i className={`fa ${button.icon} oe_stat_button_icon`} />}
      {value !== '' && <span className="oe_stat_button_value">{value}</span>}
      <span className="oe_stat_button_text">{error ?? text}</span>
    </button>
  )
}

export function ButtonBoxRenderer({
  buttons,
  record,
  model,
  recordId,
  inline = false,
}: {
  buttons: StatButtonElement[]
  record?: Record<string, unknown>
  model: string
  recordId?: number
  inline?: boolean
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const primary = buttons.slice(0, MAX_BUTTON_BOX)
  const overflow = buttons.slice(MAX_BUTTON_BOX)

  return (
    <div
      className={
        inline
          ? 'o_form_button_box'
          : 'flex flex-wrap gap-1 border-b border-border-subtle pb-3 mb-3'
      }
    >
      {primary.map((btn, bi) => (
        <StatButton key={bi} button={btn} record={record} model={model} recordId={recordId} />
      ))}
      {overflow.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOverflowOpen(!overflowOpen)}
            onBlur={() => setTimeout(() => setOverflowOpen(false), 150)}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-xs text-text-secondary hover:bg-hover"
          >
            More ▾
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border-subtle bg-surface shadow-lg">
              {overflow.map((btn, bi) => (
                <div key={bi} className="px-2 py-1">
                  <StatButton button={btn} record={record} model={model} recordId={recordId} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
