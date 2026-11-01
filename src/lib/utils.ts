import { formatDistanceToNow, parseISO } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import type { Locale } from 'date-fns'
import type { Lang } from './i18n'
import { TIME_RANGES } from './constants'
import { OSI_LICENSE_IDS } from './licenseLegend'
import type { TimeRange } from './constants'

export type SortField = 'stars' | 'forks' | 'updated' | 'best_match'
export type SortOrder = 'asc' | 'desc'

const DATE_FNS_LOCALES: Record<Lang, Locale> = { en: enUS, ru }

const compactFormatters = new Map<Lang, Intl.NumberFormat>()
const decimalFormatters = new Map<Lang, Intl.NumberFormat>()

function compactFormatter(lang: Lang): Intl.NumberFormat {
  const cached = compactFormatters.get(lang)
  if (cached) return cached
  const formatter = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 })
  compactFormatters.set(lang, formatter)
  return formatter
}

function decimalFormatter(lang: Lang): Intl.NumberFormat {
  const cached = decimalFormatters.get(lang)
  if (cached) return cached
  const formatter = new Intl.NumberFormat(lang)
  decimalFormatters.set(lang, formatter)
  return formatter
}

export function formatNumber(num: number, lang: Lang = 'en'): string {
  const formatted = compactFormatter(lang).format(num)
  // English compact notation emits "K"; the app has always shown a lowercase "k".
  return lang === 'en' ? formatted.replace('K', 'k') : formatted
}

export function formatDecimal(num: number, lang: Lang = 'en'): string {
  return decimalFormatter(lang).format(num)
}

export function formatRelativeTime(dateString: string, lang: Lang = 'en'): string {
  const date = parseISO(dateString)
  // GitHub's pushed_at can be minutes ahead of the local clock; "in 15 minutes" is noise.
  const safe = date.getTime() > Date.now() ? new Date() : date
  return formatDistanceToNow(safe, {
    addSuffix: true,
    locale: DATE_FNS_LOCALES[lang],
  })
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
