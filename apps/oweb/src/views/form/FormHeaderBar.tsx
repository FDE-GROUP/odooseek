import type {
  ButtonElement,
  HeaderElement,
  OdooFieldMeta,
  StatButtonElement,
} from '@odooseek/odoo-client'
import { evalModifier } from '@odooseek/odoo-client'
import { useEffect, useState } from 'react'
import { FormEditActions } from '../../components/FormEditActions'
import type { GroupCheckSession } from '../../lib/auth'
import { passesXmlGroups } from '../../lib/field-access'

const MAX_HEADER_BUTTONS = 3

function HeaderButtonGroup({
  buttons,
  onAction,
}: {
  buttons: ButtonElement[]
  onAction: (btn: ButtonElement) => void
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const primary = buttons.slice(0, MAX_HEADER_BUTTONS)
  const overflow = buttons.slice(MAX_HEADER_BUTTONS)

  const btnClass = (btn: ButtonElement) =>
    `px-3 py-1 text-xs font-medium transition-colors ${
      btn.class?.includes('btn-primary')
        ? 'bg-accent text-on-accent hover:bg-accent/90 rounded'
        : 'text-text-secondary hover:bg-hover rounded'
    }`

  return (
    <div className="flex items-center gap-1.5">
      {primary.map((btn, i) => (
        <button
          key={`${btn.name}-${i}`}
          type="button"
          onClick={() => onAction(btn)}
          className={btnClass(btn)}
        >
          {btn.icon && <span className="mr-1">{btn.icon}</span>}
          {btn.string || btn.name}
        </button>
      ))}
      {overflow.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOverflowOpen(!overflowOpen)}
            onBlur={() => setTimeout(() => setOverflowOpen(false), 150)}
            className="px-2 py-1 text-xs font-medium text-text-secondary hover:bg-hover rounded"
          >
            More ▾
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-border-subtle bg-surface shadow-lg">
              {overflow.map((btn, i) => (
                <button
                  key={`${btn.name}-${i}`}
                  type="button"
                  onMouseDown={() => {
                    onAction(btn)
                    setOverflowOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-hover"
                >
                  {btn.string || btn.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function isButtonVisible(
  btn: ButtonElement | StatButtonElement,
  record?: Record<string, unknown>,
  session?: GroupCheckSession,
): boolean {
  if ('groups' in btn && btn.groups && !passesXmlGroups(btn.groups, session)) return false
  if (btn.invisible && evalModifier(btn.invisible, record)) return false
  if ('states' in btn && btn.states) {
    const allowedStates = btn.states.split(',').map((s) => s.trim())
    const currentState = record?.state as string | undefined
    if (!currentState || !allowedStates.includes(currentState)) return false
  }
  return true
}

export function HeaderBar({
  headerElement,
  stateField,
  currentRecord,
  session,
  onAction,
  onStatusChange,
  editMode,
  isDirty,
  justSaved,
  saveError,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  hideActionButtons = false,
}: {
  headerElement?: HeaderElement
  stateField?: OdooFieldMeta
  currentRecord?: Record<string, unknown>
  session?: GroupCheckSession
  onAction: (btn: ButtonElement) => void
  onStatusChange?: (value: string) => void
  editMode: boolean
  isDirty: boolean
  justSaved: boolean
  saveError: string | null
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  hideActionButtons?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => {
      const container = document.querySelector('.o_form_body')
      setScrolled(container ? container.scrollTop > 4 : false)
    }
    const container = document.querySelector('.o_form_body')
    if (container) {
      container.addEventListener('scroll', handler, { passive: true })
      return () => container.removeEventListener('scroll', handler)
    }
  }, [])

  const stateSelection = stateField?.selection ?? []
  const stateValue = currentRecord?.state as string | undefined
  const stateIdx = stateSelection.findIndex(([k]) => k === stateValue)

  const visibleButtons = headerElement
    ? headerElement.buttons.filter((btn) => isButtonVisible(btn, currentRecord, session))
    : []

  const hasContent =
    stateSelection.length > 1 || visibleButtons.length > 0 || (editMode && !hideActionButtons)

  if (!hasContent) {
    if (hideActionButtons) return null
    return (
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-1.5 transition-shadow">
        <div className="flex items-center gap-2">
          <span />
        </div>
        <FormEditActions
          editMode={editMode}
          isDirty={isDirty}
          justSaved={justSaved}
          saveError={saveError}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      </div>
    )
  }

  return (
    <div
      className={`sticky top-0 z-20 border-b border-border-subtle bg-surface px-4 py-1.5 transition-shadow ${scrolled ? 'shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {stateSelection.length > 1 && (
            <div className="flex items-center gap-0.5">
              {stateSelection.map(([key, label], i) => {
                const isCurrent = key === stateValue
                const isPast = stateIdx >= 0 && i < stateIdx
                const isFirst = i === 0
                const isLast = i === stateSelection.length - 1
                const baseClass = 'px-3 py-1 text-[11px] font-medium transition-colors'
                const roundedClass = isFirst ? 'rounded-l' : isLast ? 'rounded-r' : ''
                const colorClass = isCurrent
                  ? 'bg-accent text-on-accent'
                  : isPast
                    ? 'bg-success/20 text-success hover:bg-success/30'
                    : 'bg-elevated text-text-muted hover:bg-hover'
                const cursorClass = isCurrent || editMode ? 'cursor-default' : 'cursor-pointer'
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={editMode || isCurrent}
                    onClick={() => onStatusChange?.(key)}
                    className={`${baseClass} ${colorClass} ${roundedClass} ${cursorClass}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
          {visibleButtons.length > 0 && (
            <HeaderButtonGroup buttons={visibleButtons} onAction={onAction} />
          )}
        </div>
        {!hideActionButtons && (
          <FormEditActions
            editMode={editMode}
            isDirty={isDirty}
            justSaved={justSaved}
            saveError={saveError}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  )
}
