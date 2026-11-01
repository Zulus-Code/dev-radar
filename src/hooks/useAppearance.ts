import { useLayoutEffect, useSyncExternalStore } from 'react'
import type { AccentColor, Density } from '../types/github'
import { getPreferencesSnapshot, savePreferences, subscribePreferences } from '../lib/userPreferences'
import { applyAccent, applyDensity } from '../lib/appearance'

export function useAppearance() {
  const prefs = useSyncExternalStore(subscribePreferences, getPreferencesSnapshot)

  useLayoutEffect(() => {
    applyAccent(prefs.accent)
    applyDensity(prefs.density)
  }, [prefs.accent, prefs.density])

  return {
    accent: prefs.accent,
    density: prefs.density,
    setAccent: (accent: AccentColor) => savePreferences({ accent }),
    setDensity: (density: Density) => savePreferences({ density }),
  }
}
