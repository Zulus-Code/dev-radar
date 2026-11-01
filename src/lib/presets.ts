import type { FilterState } from '../hooks/useFilters'
import type { SortState } from '../hooks/useSort'
import type { TranslationKey } from './i18n'

export const MAX_PRESETS = 20
export const MAX_PRESET_NAME_LENGTH = 40

/**
 * Presets are stored as a canonical search-params string: applying one is
 * exactly "replace the URL", so filters and sort round-trip without a second
 * parser that could drift from useFilters/useSort.
 */
export interface FilterPreset {
  id: string
  name: string
  params: string
  builtIn: boolean
  nameKey?: TranslationKey
}

export const BUILT_IN_PRESETS: readonly FilterPreset[] = [
  {
    id: 'builtin-young',
    name: '',
    nameKey: 'preset.youngProject',
    params: 'createdDays=90&minStars=10&maxStars=500&sort=updated&order=desc',
    builtIn: true,
  },
  {
    id: 'builtin-good-first-issue',
    name: '',
    nameKey: 'preset.goodFirstIssue',
    params: 'gfi=true&minStars=10&maxStars=2000&sort=stars&order=desc',
    builtIn: true,
  },
  {
    id: 'builtin-no-star-leader',
    name: '',
    nameKey: 'preset.noStarLeader',
    params: 'timeRange=month&minStars=50&maxStars=2000&sort=stars&order=desc',
    builtIn: true,
  },
]

export function normalizePresetName(raw: string): string {
  return raw.trim().slice(0, MAX_PRESET_NAME_LENGTH)
}

export function buildPresetParams(filters: FilterState, sort: SortState): string {
  const params = new URLSearchParams()

  if (filters.timeRange !== 'week') params.set('timeRange', filters.timeRange)
  filters.language.forEach((language) => params.append('language', language))
  if (filters.licenseType !== 'all') params.set('licenseType', filters.licenseType)
  if (filters.minStars > 0) params.set('minStars', String(filters.minStars))
  if (filters.maxStars > 0) params.set('maxStars', String(filters.maxStars))
  if (filters.createdWithinDays > 0) {
    params.set('createdDays', String(filters.createdWithinDays))
  }
  if (filters.goodFirstIssues) params.set('gfi', 'true')
  filters.topics.forEach((topic) => params.append('topics', topic))
  if (filters.includeArchived) params.set('includeArchived', 'true')
  if (filters.includeForks) params.set('includeForks', 'true')
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.readmeLanguage !== 'all') params.set('readmeLanguage', filters.readmeLanguage)
  filters.developerFilters.forEach((filter) => params.append('developerFilters', filter))

  params.set('sort', sort.field)
  params.set('order', sort.order)

  return params.toString()
}

/** Drops malformed entries instead of letting one bad row poison the list. */
export function sanitizePreset(raw: unknown): FilterPreset | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Record<string, unknown>
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (typeof value.params !== 'string') return null
  if (typeof value.name !== 'string') return null
  const name = normalizePresetName(value.name)
  if (!name) return null
  return { id: value.id, name, params: value.params, builtIn: false }
}
