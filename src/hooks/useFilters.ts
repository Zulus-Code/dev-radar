import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TIME_RANGES, COMMON_LICENSES, DEVELOPER_FILTERS } from '../lib/constants'
import type { TimeRange } from '../lib/constants'

export type DeveloperFilter =
  | 'beginner_friendly'
  | 'good_first_issue'
  | 'actively_maintained'
  | 'solo_maintained'
  | 'production_ready'
  | 'ai_related'
  | 'indie_project'
  | 'new_exploding'
  | 'low_competition'
  | 'enterprise_grade'

export interface FilterState {
  timeRange: TimeRange
  language: string[]
  licenseType: 'all' | 'open_source' | 'no_license' | string
  minStars: number
  maxStars: number
  createdWithinDays: number
  goodFirstIssues: boolean
  topics: string[]
  includeArchived: boolean
  includeForks: boolean
  keyword: string
  readmeLanguage: 'all' | 'english'
  developerFilters: DeveloperFilter[]
}

export const DEFAULT_FILTERS: FilterState = {
  timeRange: 'week',
  language: [],
  licenseType: 'all',
  minStars: 0,
  maxStars: 0,
  createdWithinDays: 0,
  goodFirstIssues: false,
  topics: [],
  includeArchived: false,
  includeForks: false,
  keyword: '',
  readmeLanguage: 'all',
  developerFilters: [],
}

const TIME_RANGE_VALUES = new Set<string>(Object.keys(TIME_RANGES))
const LICENSE_VALUES = new Set<string>(['all', 'open_source', 'no_license', ...COMMON_LICENSES])
const DEVELOPER_FILTER_VALUES = new Set<string>(Object.keys(DEVELOPER_FILTERS))

function parseListParam(values: string[]): string[] {
  return Array.from(
    new Set(values.map((v) => v.trim()).filter((v) => v.length > 0)),
  ).sort()
}

function parseFilters(searchParams: URLSearchParams): FilterState {
  const timeRange = searchParams.get('timeRange')
  const licenseType = searchParams.get('licenseType')
  const readmeLanguage = searchParams.get('readmeLanguage')
  const rawMinStars = parseInt(searchParams.get('minStars') || '0', 10)
  const rawMaxStars = parseInt(searchParams.get('maxStars') || '0', 10)
  const rawCreatedDays = parseInt(searchParams.get('createdDays') || '0', 10)
  return {
    timeRange: timeRange && TIME_RANGE_VALUES.has(timeRange) ? (timeRange as TimeRange) : DEFAULT_FILTERS.timeRange,
    language: parseListParam(searchParams.getAll('language')),
    licenseType: licenseType && LICENSE_VALUES.has(licenseType) ? licenseType : DEFAULT_FILTERS.licenseType,
    minStars: Number.isFinite(rawMinStars) && rawMinStars > 0 ? rawMinStars : 0,
    maxStars: Number.isFinite(rawMaxStars) && rawMaxStars > 0 ? rawMaxStars : 0,
    createdWithinDays: Number.isFinite(rawCreatedDays) && rawCreatedDays > 0 ? rawCreatedDays : 0,
    goodFirstIssues: searchParams.get('gfi') === 'true',
    topics: parseListParam(searchParams.getAll('topics')),
    includeArchived: searchParams.get('includeArchived') === 'true',
    includeForks: searchParams.get('includeForks') === 'true',
    keyword: (searchParams.get('keyword') || '').trim(),
    readmeLanguage: readmeLanguage === 'english' ? 'english' : 'all',
    developerFilters: parseListParam(searchParams.getAll('developerFilters')).filter((f) =>
      DEVELOPER_FILTER_VALUES.has(f),
    ) as DeveloperFilter[],
  }
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const newParams = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          newParams.delete(key)
          value.forEach((v) => newParams.append(key, v))
        } else if (value === '' || value === false || value === 0) {
          newParams.delete(key)
        } else {
          newParams.set(key, String(value))
        }
      })
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams()
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')
    if (sort) newParams.set('sort', sort)
    if (order) newParams.set('order', order)
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.language.length > 0) count++
    if (filters.licenseType !== 'all') count++
    if (filters.minStars > 0) count++
    if (filters.maxStars > 0) count++
    if (filters.createdWithinDays > 0) count++
    if (filters.goodFirstIssues) count++
    if (filters.topics.length > 0) count++
    if (filters.includeArchived) count++
    if (filters.includeForks) count++
    if (filters.keyword) count++
    if (filters.readmeLanguage !== 'all') count++
    if (filters.developerFilters.length > 0) count++
    return count
  }, [filters])

  return { filters, updateFilters, resetFilters, activeFilterCount }
}
