import { useSyncExternalStore } from 'react'
import {
  addUserPreset,
  deleteUserPreset,
  getPresetsSnapshot,
  subscribePresets,
} from '../lib/userPreferences'

export function usePresets() {
  const presets = useSyncExternalStore(subscribePresets, getPresetsSnapshot)
  return { presets, addUserPreset, deleteUserPreset }
}
