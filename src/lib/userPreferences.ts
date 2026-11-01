import type { UserPreferences, Collection, AccentColor, Density } from '../types/github'
import type { FilterPreset } from './presets'
import { MAX_PRESETS, normalizePresetName, sanitizePreset } from './presets'

const STORAGE_KEY = 'github_dashboard_preferences'

function freshDefaults(): UserPreferences {
  return {
    followedTopics: [],
    ignoredTopics: [],
    ignoredLanguages: [],
    bookmarks: [],
    collections: [],
    statsEnabled: true,
    accent: 'blue',
    density: 'comfortable',
  }
}

const ACCENT_VALUES: Record<AccentColor, true> = {
  blue: true,
  violet: true,
  emerald: true,
  amber: true,
}
const DENSITY_VALUES: Record<Density, true> = { comfortable: true, compact: true }

function isAccent(value: unknown): value is AccentColor {
  return typeof value === 'string' && Object.hasOwn(ACCENT_VALUES, value)
}

function isDensity(value: unknown): value is Density {
  return typeof value === 'string' && Object.hasOwn(DENSITY_VALUES, value)
}

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return freshDefaults()
    const parsed = JSON.parse(stored)
    return {
      followedTopics: parsed.followedTopics ?? [],
      ignoredTopics: parsed.ignoredTopics ?? [],
      ignoredLanguages: parsed.ignoredLanguages ?? [],
      bookmarks: parsed.bookmarks ?? [],
      collections: parsed.collections ?? [],
      statsEnabled: parsed.statsEnabled !== false,
      accent: isAccent(parsed.accent) ? parsed.accent : 'blue',
      density: isDensity(parsed.density) ? parsed.density : 'comfortable',
    }
  } catch {
    return freshDefaults()
  }
}

let cachedPrefs: UserPreferences = typeof localStorage !== 'undefined' ? loadPreferences() : freshDefaults()
let localWrite = false
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function reloadPreferences(): void {
  cachedPrefs = loadPreferences()
  notifyListeners()
}

export function getPreferencesSnapshot(): UserPreferences {
  return cachedPrefs
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const next = { ...cachedPrefs, ...prefs }
  cachedPrefs = next
  localWrite = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('preferences-changed'))
  } finally {
    localWrite = false
  }
  notifyListeners()
  return next
}

if (typeof window !== 'undefined') {
  window.addEventListener('preferences-changed', () => {
    if (!localWrite) {
      reloadPreferences()
    }
  })
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      reloadPreferences()
    }
  })
}

export function isBookmarked(fullName: string): boolean {
  return cachedPrefs.bookmarks.some((b) => b.fullName === fullName)
}

export function toggleBookmark(fullName: string, note?: string): UserPreferences {
  const bookmarks = [...cachedPrefs.bookmarks]
  const exists = bookmarks.findIndex((b) => b.fullName === fullName)

  if (exists >= 0) {
    bookmarks.splice(exists, 1)
  } else {
    bookmarks.push({ fullName, addedAt: new Date().toISOString(), note })
  }

  return savePreferences({ bookmarks })
}

export function addCollection(name: string, description?: string): Collection {
  const now = new Date().toISOString()
  const collection: Collection = {
    id: crypto.randomUUID(),
    name,
    description,
    repoFullNames: [],
    createdAt: now,
    updatedAt: now,
  }
  savePreferences({ collections: [...cachedPrefs.collections, collection] })
  return collection
}

export function deleteCollection(id: string): void {
  savePreferences({ collections: cachedPrefs.collections.filter((c) => c.id !== id) })
}

export function addToCollection(collectionId: string, repoFullName: string): void {
  const collection = cachedPrefs.collections.find((c) => c.id === collectionId)
  if (collection && !collection.repoFullNames.includes(repoFullName)) {
    savePreferences({
      collections: cachedPrefs.collections.map((c) =>
        c.id === collectionId
          ? { ...c, repoFullNames: [...c.repoFullNames, repoFullName], updatedAt: new Date().toISOString() }
          : c,
      ),
    })
  }
}

export function removeFromCollection(collectionId: string, repoFullName: string): void {
  const collection = cachedPrefs.collections.find((c) => c.id === collectionId)
  if (collection) {
    savePreferences({
      collections: cachedPrefs.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              repoFullNames: c.repoFullNames.filter((f) => f !== repoFullName),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    })
  }
}

export function followTopic(topic: string): void {
  if (!cachedPrefs.followedTopics.includes(topic)) {
    savePreferences({ followedTopics: [...cachedPrefs.followedTopics, topic] })
  }
}

export function unfollowTopic(topic: string): void {
  savePreferences({ followedTopics: cachedPrefs.followedTopics.filter((t) => t !== topic) })
}

export function ignoreTopic(topic: string): void {
  if (!cachedPrefs.ignoredTopics.includes(topic)) {
    savePreferences({ ignoredTopics: [...cachedPrefs.ignoredTopics, topic] })
  }
}

export function unignoreTopic(topic: string): void {
  savePreferences({ ignoredTopics: cachedPrefs.ignoredTopics.filter((t) => t !== topic) })
}

export function ignoreLanguage(language: string): void {
  if (!cachedPrefs.ignoredLanguages.includes(language)) {
    savePreferences({ ignoredLanguages: [...cachedPrefs.ignoredLanguages, language] })
  }
}

export function unignoreLanguage(language: string): void {
  savePreferences({ ignoredLanguages: cachedPrefs.ignoredLanguages.filter((l) => l !== language) })
}

// Filter presets live under their own key so they survive preference resets.
const PRESETS_KEY = 'dev_radar_presets'

export function loadPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem(PRESETS_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(sanitizePreset)
      .filter((preset): preset is FilterPreset => preset !== null)
      .slice(0, MAX_PRESETS)
  } catch {
    return []
  }
}

let cachedPresets: FilterPreset[] = typeof localStorage !== 'undefined' ? loadPresets() : []
const presetListeners = new Set<() => void>()

function persistPresets(presets: FilterPreset[]): void {
  cachedPresets = presets
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // Quota or disabled storage: keep the in-memory list usable.
  }
  presetListeners.forEach((listener) => listener())
}

export function reloadPresets(): void {
  cachedPresets = loadPresets()
  presetListeners.forEach((listener) => listener())
}

export function getPresetsSnapshot(): FilterPreset[] {
  return cachedPresets
}

export function subscribePresets(listener: () => void): () => void {
  presetListeners.add(listener)
  return () => {
    presetListeners.delete(listener)
  }
}

/** Returns null at the name or capacity limit; both are user-facing errors. */
export function addUserPreset(name: string, params: string): FilterPreset | null {
  const trimmed = normalizePresetName(name)
  if (!trimmed || cachedPresets.length >= MAX_PRESETS) return null
  const preset: FilterPreset = {
    id: crypto.randomUUID(),
    name: trimmed,
    params,
    builtIn: false,
  }
  persistPresets([...cachedPresets, preset])
  return preset
}

export function deleteUserPreset(id: string): void {
  persistPresets(cachedPresets.filter((preset) => preset.id !== id))
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === PRESETS_KEY) reloadPresets()
  })
}
