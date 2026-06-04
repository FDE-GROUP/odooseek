import type { OdooAction, StatButtonElement } from '@odooseek/odoo-client'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { MODEL_MODULE_ROUTES } from '../../lib/module-routes'

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
    text = raw != null ? '' : (button.content.textFallback ?? button.string ?? '')
  }

  const handleNavAction = useCallback(
    (action: OdooAction) => {
      if (action.type === 'ir.actions.client') {
        const tag = (action as Record<string, unknown>).tag as string | undefined
        if (tag === 'event.event_barcode_scan_view') {
          window.open(`/event/registration-desk?event_id=${recordId}`, '_self')
        }
      } else if (action.type === 'ir.actions.act_window') {
        const resModel = action.res_model
        if (resModel && typeof resModel === 'string') {
          const spec = MODEL_MODULE_ROUTES[resModel]
          if (spec) {
            window.open(spec.listPath, '_self')
          }
        }
      }
    },
    [recordId],
  )

  const handleClick = useCallback(async () => {
    if (loading) return
    if (button.confirm && !window.confirm(button.confirm)) return

    if (button.buttonType === 'action') {
      setLoading(true)
      try {
        const { loadAction } = await import('@odooseek/odoo-client')
        const context: Record<string, unknown> = {
          active_model: model,
          active_id: recordId,
          active_ids: recordId ? [recordId] : [],
        }
        if (button.context) {
          try {
            const parsed = JSON.parse(button.context.replace(/'/g, '"'))
            Object.assign(context, parsed)
          } catch {
            /* skip malformed context */
          }
        }
        const action = await loadAction(button.name, context)
        if (!action) return
        handleNavAction(action)
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
        const { callKw } = await import('@odooseek/odoo-client')
        await callKw(model, button.name, [[recordId]])
        queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed. Please try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }, [button, loading, model, recordId, queryClient, handleNavAction])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={error ?? undefined}
      className={`oe_stat_button ${error ? 'oe_stat_button--error' : ''}`}
    >
      {button.icon && <i className={`fa ${button.icon} oe_stat_button_icon`} />}
      <div className="o_stat_info">
        {value && <span className="o_stat_value">{value}</span>}
        {text && <span className="o_stat_text">{text}</span>}
      </div>
    </button>
  )
}

export function ButtonBoxRenderer({
  buttons,
  record,
  model,
  recordId,
  inline,
}: {
  buttons: StatButtonElement[]
  record?: Record<string, unknown>
  model: string
  recordId?: number
  inline?: boolean
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const primary = buttons.slice(0, MAX_BUTTON_BOX)

  const overflow = buttons
    .slice(MAX_BUTTON_BOX)
    .filter((btn, i, arr) => arr.findIndex((b) => b.name === btn.name) === i)

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOverflowOpen(true)
  }
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOverflowOpen(false), 200)
  }
  const toggleMenu = () => {
    if (overflowOpen) {
      setOverflowOpen(false)
    } else {
      openMenu()
    }
  }

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
        // biome-ignore lint/a11y/noStaticElementInteractions: hover container
        <div
          role="presentation"
          className="relative"
          onMouseEnter={openMenu}
          onMouseLeave={closeMenu}
        >
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-xs text-text-secondary hover:bg-hover"
          >
            More ▾
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded border bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700">
              {overflow.map((btn, bi) => (
                <StatButton
                  key={`ov-${bi}`}
                  button={btn}
                  record={record}
                  model={model}
                  recordId={recordId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
