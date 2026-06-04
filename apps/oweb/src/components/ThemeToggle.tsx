import { useCallback, useEffect, useRef, useState } from 'react'
import { Moon, Palette, Sun } from '@/lib/lucide-icons'
import type { PresetId } from '../themes'
import { PRESETS, useTheme } from '../themes'

export function ThemeToggle() {
  const { config, preset, setPreset, setAccent } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDark = preset.isDark

  const toggleTheme = useCallback(() => {
    const presetId: PresetId = isDark ? 'light-minimal' : 'dark-gold'
    setPreset(presetId)
  }, [isDark, setPreset])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          title="Theme palette"
        >
          <Palette className="h-4 w-4" />
        </button>

        {open && (
          <div className="glass-heavy animate-fade-slide-in absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-lg p-3 shadow-xl">
            <div className="space-y-3">
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Theme
                </div>
                <div className="space-y-1">
                  {PRESETS.map((p) => {
                    const active = config.presetId === p.id
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setPreset(p.id)
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
                          active
                            ? 'bg-accent/15 text-accent'
                            : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                        }`}
                      >
                        <div className="flex gap-1">
                          <span
                            className="h-3 w-3 rounded-full border border-border-subtle"
                            style={{ backgroundColor: p.colors.root }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-border-subtle"
                            style={{ backgroundColor: p.colors.surface }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-border-subtle"
                            style={{
                              backgroundColor:
                                p.accentSwatches.find((s) => s.id === p.defaultAccentId)?.accent ??
                                p.accentSwatches[0].accent,
                            }}
                          />
                        </div>
                        <span>{p.name}</span>
                        {active && (
                          <svg
                            className="ml-auto h-3.5 w-3.5 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            aria-hidden="true"
                          >
                            <title>Active</title>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Accent Color
                </div>
                <div className="flex flex-wrap gap-2">
                  {preset.accentSwatches.map((swatch) => (
                    <button
                      type="button"
                      key={swatch.id}
                      onClick={() => setAccent(swatch.id)}
                      className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                        swatch.id === config.accentId
                          ? 'ring-2 ring-text-primary ring-offset-1 ring-offset-root'
                          : ''
                      }`}
                      style={{ backgroundColor: swatch.accent }}
                      title={swatch.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
