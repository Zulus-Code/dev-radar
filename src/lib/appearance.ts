import type { AccentColor, Density } from '../types/github'
import type { TranslationKey } from './i18n'

interface AccentOption {
  /** Space-separated channels so Tailwind can append its own alpha. */
  rgb: string
  hex: string
  label: TranslationKey
}

export const ACCENTS: Record<AccentColor, AccentOption> = {
  blue: { rgb: '88 166 255', hex: '#58a6ff', label: 'appearance.accent.blue' },
  violet: { rgb: '163 113 247', hex: '#a371f7', label: 'appearance.accent.violet' },
  emerald: { rgb: '63 185 80', hex: '#3fb950', label: 'appearance.accent.emerald' },
  amber: { rgb: '210 153 34', hex: '#d29922', label: 'appearance.accent.amber' },
}

export const ACCENT_ORDER: AccentColor[] = ['blue', 'violet', 'emerald', 'amber']

export function applyAccent(accent: AccentColor): void {
  document.documentElement.style.setProperty('--github-accent-rgb', ACCENTS[accent].rgb)
}

export function applyDensity(density: Density): void {
  document.documentElement.classList.toggle('density-compact', density === 'compact')
}
