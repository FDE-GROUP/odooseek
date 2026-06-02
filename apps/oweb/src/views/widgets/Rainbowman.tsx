import { useQueryClient } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Rainbowman celebratory effect — triggered after marking an opportunity as Won.
 *
 * Shows a full-screen overlay with animated confetti-like sparkles
 * and a congratulatory message, auto-dismissing after 3 seconds.
 */
export function Rainbowman({
  model,
  recordId,
  onDismiss,
}: {
  model: string
  recordId: number
  onDismiss: () => void
}) {
  const queryClient = useQueryClient()
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<number>(0)

  const dismiss = useCallback(() => {
    setVisible(false)
    clearTimeout(timerRef.current)
    queryClient.invalidateQueries({ queryKey: ['odoo', 'read', model, recordId] })
    onDismiss()
  }, [model, recordId, queryClient, onDismiss])

  useEffect(() => {
    timerRef.current = window.setTimeout(dismiss, 3500)
    return () => clearTimeout(timerRef.current)
  }, [dismiss])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          {[...Array(10)].map((_, i) => (
            <Sparkles
              key={i}
              className="h-8 w-8 animate-bounce text-amber-400"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '1.2s',
              }}
            />
          ))}
        </div>
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Opportunity Won!</h2>
        <p className="mt-2 text-lg text-white/80">Congratulations on closing the deal.</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 rounded-lg bg-white/20 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
