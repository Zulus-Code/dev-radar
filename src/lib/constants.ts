import type { SortField } from './utils'

export const TIME_RANGES = {
  day: { label: 'Today', days: 1 },
  week: { label: 'This Week', days: 7 },
  month: { label: 'This Month', days: 30 },
} as const

export type TimeRange = keyof typeof TIME_RANGES

export const SORT_OPTIONS: { field: SortField; label: string; icon: string }[] = [
  { field: 'best_match', label: 'Best Match', icon: '✨' },
  { field: 'stars', label: 'Most Starred', icon: '⭐' },
  { field: 'forks', label: 'Most Forked', icon: '🍴' },
  { field: 'updated', label: 'Recently Updated', icon: '🕐' },
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

export const DEVELOPER_FILTERS = {
  beginner_friendly: { label: 'Beginner-friendly', icon: '🌱', description: 'Low complexity, good docs' },
  good_first_issue: { label: 'Good First Issue', icon: '🎯', description: 'Has good-first-issue labels' },
  actively_maintained: { label: 'Actively Maintained', icon: '🔧', description: 'Recent commits, active contributors' },
  solo_maintained: { label: 'Solo Project', icon: '👤', description: 'Single maintainer' },
  production_ready: { label: 'Production Ready', icon: '🚀', description: 'Stable, well-tested, widely used' },
  ai_related: { label: 'AI/ML', icon: '🤖', description: 'Artificial intelligence / machine learning' },
  indie_project: { label: 'Indie Project', icon: '🎨', description: 'Small, creative, independent' },
  new_exploding: { label: 'New & Exploding', icon: '💥', description: 'Recently created projects with stars' },
  low_competition: { label: 'Low Competition', icon: '💎', description: 'Undiscovered gems' },
  enterprise_grade: { label: 'Enterprise', icon: '🏢', description: 'Large-scale, robust, corporate use' },
} as const


