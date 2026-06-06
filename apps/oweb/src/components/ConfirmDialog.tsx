import { useCallback } from 'react'
import { useDialog } from '../hooks/useDialog'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void | Promise<void>
}

let confirmIdCounter = 0

export function useConfirmDialog() {
  const { openDialog, closeDialog } = useDialog()

  return useCallback(
    (options: ConfirmOptions) => {
      const descId = `confirm-desc-${++confirmIdCounter}`
      const id = openDialog({
        size: 'sm',
        title: options.title,
        closeOnBackdrop: true,
        content: (
          <p id={descId} className="text-sm text-text-secondary">
            {options.message}
          </p>
        ),
        footer: (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => closeDialog(id)}
              className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:bg-hover"
            >
              {options.cancelLabel || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={async () => {
                await options.onConfirm()
                closeDialog(id)
              }}
              // biome-ignore lint/a11y/noAutofocus: focus confirm button for keyboard accessibility
              autoFocus
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-on-accent ${
                options.variant === 'danger'
                  ? 'bg-danger hover:opacity-90'
                  : options.variant === 'warning'
                    ? 'bg-warning hover:opacity-90'
                    : 'bg-accent hover:brightness-110'
              }`}
            >
              {options.confirmLabel || 'Confirm'}
            </button>
          </div>
        ),
      })
    },
    [openDialog, closeDialog],
  )
}
