/** Shared control panel toolbar control height (matches Odoo view switcher pills). */
export const CP_TOOLBAR_HEIGHT = 'h-7'

export const CP_PILL_BTN =
  'flex cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-medium transition-colors'

export function cpPillBtn(extra?: string): string {
  return [CP_TOOLBAR_HEIGHT, 'shrink-0', CP_PILL_BTN, extra].filter(Boolean).join(' ')
}

/** Create / Edit — accent tint pill (matches control panel Create). */
export const cpAccentTintPill = () => cpPillBtn('bg-accent/15 text-accent hover:bg-accent/20')

/** Print / Action / Cancel — neutral toolbar pill. */
export const cpNeutralPill = () =>
  cpPillBtn('text-text-secondary hover:bg-hover hover:text-text-primary')
