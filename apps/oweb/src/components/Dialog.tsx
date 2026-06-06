import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDialog } from '../hooks/useDialog'
import { useFocusTrap } from '../hooks/useFocusTrap'

const SIZE_CLASSES: Record<string, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1100px]',
}

let dialogIdCounter = 0

export function DialogContainer() {
  const { dialogs, closeDialog } = useDialog()
  const panelRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (dialogs.length === 0) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog(dialogs[dialogs.length - 1].id)
      }
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      if (dialogs.length <= 1) document.body.style.overflow = ''
    }
  }, [dialogs, closeDialog])

  useFocusTrap(
    {
      get current() {
        const last = dialogs[dialogs.length - 1]
        return last ? (panelRefs.current.get(last.id) ?? null) : null
      },
    },
    dialogs.length > 0,
  )

  if (dialogs.length === 0) return null

  return createPortal(
    dialogs.map((dialog) => {
      const titleId = `dialog-title-${++dialogIdCounter}`
      return (
        <div key={dialog.id} className="fixed inset-0" style={{ zIndex: 60 }}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
          <div
            role="presentation"
            className="absolute inset-0 bg-black/30"
            onClick={() => dialog.closeOnBackdrop !== false && closeDialog(dialog.id)}
          />
          <div className="flex items-center justify-center min-h-full p-4">
            <div
              ref={(el) => {
                if (el) panelRefs.current.set(dialog.id, el)
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialog.title ? titleId : undefined}
              className={`relative w-full ${SIZE_CLASSES[dialog.size]} rounded-xl border border-border-subtle bg-surface shadow-2xl`}
            >
              {dialog.title && (
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <h3 id={titleId} className="text-sm font-semibold text-text-primary">
                    {dialog.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => closeDialog(dialog.id)}
                    aria-label="Close"
                    className="text-text-muted hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="px-4 py-3">{dialog.content}</div>
              {dialog.footer && (
                <div className="border-t border-border-subtle px-4 py-3">{dialog.footer}</div>
              )}
            </div>
          </div>
        </div>
      )
    }),
    document.body,
  )
}
