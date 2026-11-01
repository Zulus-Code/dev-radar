import type { SortField } from './utils'
import type { TranslationKey } from './i18n'
import type { DeveloperFilter } from '../hooks/useFilters'

export const TIME_RANGES = {
  day: { label: 'timeRange.today', days: 1 },
  week: { label: 'timeRange.thisWeek', days: 7 },
  month: { label: 'timeRange.thisMonth', days: 30 },
} as const satisfies Record<string, { label: TranslationKey; days: number }>

export type TimeRange = keyof typeof TIME_RANGES

export const SORT_OPTIONS: { field: SortField; label: TranslationKey; icon: string }[] = [
  { field: 'best_match', label: 'sort.bestMatch', icon: '✨' },
  { field: 'stars', label: 'sort.mostStarred', icon: '⭐' },
  { field: 'forks', label: 'sort.mostForked', icon: '🍴' },
  { field: 'updated', label: 'sort.recentlyUpdated', icon: '🕐' },
  { field: 'growing', label: 'sort.growing', icon: '📈' },
] as const

export const COMMON_LICENSES = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'GPL-2.0',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'LGPL-3.0',
  'MPL-2.0',
  'ISC',
  'AGPL-3.0',
  'Unlicense',
  'CC0-1.0',
] as const

export const DEFAULT_PER_PAGE = 30

export const GITHUB_API_BASE = 'https://api.github.com'

export const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

export const DEVELOPER_FILTERS: Record<
  DeveloperFilter,
  { label: TranslationKey; icon: string; description: TranslationKey }
> = {
  beginner_friendly: {
    label: 'devFilter.beginnerFriendly.label',
    icon: '🌱',
    description: 'devFilter.beginnerFriendly.description',
  },
  good_first_issue: {
    label: 'devFilter.goodFirstIssue.label',
    icon: '🎯',
    description: 'devFilter.goodFirstIssue.description',
  },
  actively_maintained: {
    label: 'devFilter.activelyMaintained.label',
    icon: '🔧',
    description: 'devFilter.activelyMaintained.description',
  },
  solo_maintained: {
    label: 'devFilter.soloMaintained.label',
    icon: '👤',
    description: 'devFilter.soloMaintained.description',
  },
  production_ready: {
    label: 'devFilter.productionReady.label',
    icon: '🚀',
    description: 'devFilter.productionReady.description',
  },
  ai_related: {
    label: 'devFilter.aiRelated.label',
    icon: '🤖',
    description: 'devFilter.aiRelated.description',
  },
  indie_project: {
    label: 'devFilter.indieProject.label',
    icon: '🎨',
    description: 'devFilter.indieProject.description',
  },
  new_exploding: {
    label: 'devFilter.newExploding.label',
    icon: '💥',
    description: 'devFilter.newExploding.description',
  },
  low_competition: {
    label: 'devFilter.lowCompetition.label',
    icon: '💎',
    description: 'devFilter.lowCompetition.description',
  },
  enterprise_grade: {
    label: 'devFilter.enterpriseGrade.label',
    icon: '🏢',
    description: 'devFilter.enterpriseGrade.description',
  },
}
