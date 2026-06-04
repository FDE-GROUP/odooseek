import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDialog } from '../hooks/useDialog'

const SIZE_CLASSES: Record<string, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1100px]',
}

export function DialogContainer() {
  const { dialogs, closeDialog } = useDialog()

  useEffect(() => {
    if (dialogs.length === 0) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog(dialogs[dialogs.length - 1].id)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dialogs, closeDialog])

  if (dialogs.length === 0) return null

  return createPortal(
    dialogs.map((dialog, index) => (
      <div key={dialog.id} className="fixed inset-0" style={{ zIndex: 60 + index * 10 }}>
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
        <div
          role="presentation"
          className="absolute inset-0 bg-black/30"
          onClick={() => dialog.closeOnBackdrop !== false && closeDialog(dialog.id)}
        />
        {/* Dialog */}
        <div className="flex items-center justify-center min-h-full p-4">
          <div
            className={`relative w-full ${SIZE_CLASSES[dialog.size]} rounded-xl border border-border-subtle bg-surface shadow-2xl`}
          >
            {/* Header */}
            {dialog.title && (
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <h3 className="text-sm font-semibold text-text-primary">{dialog.title}</h3>
                <button
                  type="button"
                  onClick={() => closeDialog(dialog.id)}
                  className="text-text-muted hover:text-text-primary"
                >
                  ×
                </button>
              </div>
            )}
            {/* Content */}
            <div className="px-4 py-3">{dialog.content}</div>
            {/* Footer */}
            {dialog.footer && (
              <div className="border-t border-border-subtle px-4 py-3">{dialog.footer}</div>
            )}
          </div>
        </div>
      </div>
    )),
    document.body,
  )
}
