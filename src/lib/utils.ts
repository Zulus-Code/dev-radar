import { formatDistanceToNow, parseISO } from 'date-fns'
import { TIME_RANGES } from './constants'
import { OSI_LICENSE_IDS } from './licenseLegend'
import type { TimeRange } from './constants'

export type SortField = 'stars' | 'forks' | 'updated' | 'best_match'
export type SortOrder = 'asc' | 'desc'

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return num.toString()
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

export function getDateForTimeRange(timeRange: TimeRange): string {
  const now = new Date()
  const days = TIME_RANGES[timeRange].days
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

export interface BuildQueryOptions {
  keyword?: string
  timeRange: TimeRange
  language?: string[]
  licenseType?: string
  minStars?: number
  topics?: string[]
  includeArchived?: boolean
  includeForks?: boolean
  readmeLanguage?: 'all' | 'english'
  developerFilters?: string[]
  ignoredLanguages?: string[]
  ignoredTopics?: string[]
}

export function buildGitHubQuery(options: BuildQueryOptions): string {
  const parts: string[] = []

  if (options.keyword?.trim()) {
    parts.push(options.keyword.trim())
  }

  const pushedDate = getDateForTimeRange(options.timeRange)
  parts.push(`pushed:>${pushedDate}`)

  if (options.language && options.language.length > 0) {
    options.language.forEach((lang) => {
      parts.push(`language:${lang}`)
    })
  }

  if (options.licenseType && options.licenseType !== 'all') {
    if (options.licenseType === 'open_source' || options.licenseType === 'no_license') {
      // no valid API qualifier for these; handled client-side after fetch
    } else {
      parts.push(`license:${options.licenseType.toLowerCase()}`)
    }
  }

  if (options.topics && options.topics.length > 0) {
    options.topics.forEach((topic) => {
      parts.push(`topic:${topic}`)
    })
  }

  if (!options.includeArchived) {
    parts.push('archived:false')
  }

  if (!options.includeForks) {
    parts.push('fork:false')
  }

  if (options.developerFilters?.includes('low_competition')) {
    parts.push('stars:100..14999')
  } else if (options.minStars && options.minStars > 0) {
    parts.push(`stars:>=${options.minStars}`)
  } else {
    parts.push('stars:>50')
  }

  return parts.join(' ')
}

export function getAPISortField(field: SortField): string | undefined {
  const mapping: Record<SortField, string | undefined> = {
    stars: 'stars',
    forks: 'forks',
    updated: 'updated',
    best_match: undefined,
  }
  return mapping[field]
}

export function isOSILicense(spdxId: string | null): boolean {
  if (!spdxId || spdxId === 'NOASSERTION' || spdxId === 'Other') {
    return false
  }
  return OSI_LICENSE_IDS.has(spdxId)
}
