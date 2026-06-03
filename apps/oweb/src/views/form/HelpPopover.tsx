import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export function HelpPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  return (
    <span className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center text-[10px] text-info cursor-help hover:opacity-80"
      >
        ?
      </button>
      {open &&
        btnRef.current &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onMouseDown={() => setOpen(false)}>
            <div
              className="absolute z-[10000] mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface p-3 text-xs leading-relaxed text-text-secondary shadow-lg"
              style={{
                top: btnRef.current?.getBoundingClientRect().bottom + 4,
                left: Math.min(
                  btnRef.current?.getBoundingClientRect().left,
                  window.innerWidth - 300,
                ),
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {text}
            </div>
          </div>,
          document.body,
        )}
    </span>
  )
}
