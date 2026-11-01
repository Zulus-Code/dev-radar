import type { Lang } from './i18n'
import { translate, translatePlural } from './i18n'
import { formatNumber } from './utils'

/** docs/TRENDS.md §3 */
export const TRACKING_LIMIT = 2000
export const TOP_TRACKING_COUNT = 300
/** docs/TRENDS.md §4 */
export const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000
export const GRAPHQL_BATCH_SIZE = 50
export const SNAPSHOT_RETENTION_DAYS = 180
/** docs/TRENDS.md §5 */
export const DELTA_WINDOW_DAYS = 7

export type TrendSource = 'seen' | 'top'

export interface TrackedRepo {
  id: number
  fullName: string
  language: string | null
  stars: number
  forks: number
  openIssues: number
  source: TrendSource
  firstSeen: string
  lastSeen: string
  missingSince: string | null
}

export interface RepoSnapshot {
  repoId: number
  day: string
  stars: number
  forks: number
  openIssues: number
}

export interface DaySnapshot {
  day: string
  stars: number
}

export interface StarDelta {
  delta: number
  /** Actual span between the newest snapshot and the chosen baseline, in days. */
  days: number
}

/** UTC `YYYY-MM-DD`, the only day format stored in `snapshots.day`. */
export function toUtcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return toUtcDay(date)
}

export function daysBetween(from: string, to: string): number {
  const fromTime = Date.parse(`${from}T00:00:00Z`)
  const toTime = Date.parse(`${to}T00:00:00Z`)
  return Math.round((toTime - fromTime) / 86_400_000)
}

export function isSyncDue(lastSyncAt: string | null, now: number = Date.now()): boolean {
  if (!lastSyncAt) return true
  const timestamp = Date.parse(lastSyncAt)
  if (!Number.isFinite(timestamp)) return true
  return now - timestamp >= SYNC_INTERVAL_MS
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new Error('chunk size must be positive')
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size))
  }
  return batches
}

export function groupSnapshots(rows: RepoSnapshot[]): Map<number, DaySnapshot[]> {
  const grouped = new Map<number, DaySnapshot[]>()
  for (const row of rows) {
    const list = grouped.get(row.repoId)
    if (list) {
      list.push({ day: row.day, stars: row.stars })
    } else {
      grouped.set(row.repoId, [{ day: row.day, stars: row.stars }])
    }
  }
  return grouped
}

/**
 * docs/TRENDS.md §5. The baseline is the newest snapshot at or before
 * `today - 7`; when that does not exist the whole available period is used.
 * `days` is the real span between baseline and latest, so the UI never claims a
 * week when the measured gap is three weeks.
 */
export function computeDelta(snapshots: DaySnapshot[], today: string): StarDelta | null {
  if (snapshots.length < 2) return null

  const sorted = [...snapshots].sort((a, b) => a.day.localeCompare(b.day))
  const latest = sorted[sorted.length - 1]
  const cutoff = shiftDay(today, -DELTA_WINDOW_DAYS)

  let baseline: DaySnapshot | null = null
  for (const snapshot of sorted) {
    if (snapshot.day <= cutoff) baseline = snapshot
  }
  if (!baseline) baseline = sorted[0]

  const days = daysBetween(baseline.day, latest.day)
  if (days < 1) return null

  return { delta: latest.stars - baseline.stars, days }
}

export function unitSuffix(days: number, lang: Lang): string {
  if (days === 1) return translate(lang, 'trend.unit.day')
  if (days === DELTA_WINDOW_DAYS) return translate(lang, 'trend.unit.week')
  return translate(lang, 'trend.unit.days', { count: formatNumber(days, lang) })
}

/** `+412★/wk`, `-38★/d`, `+0★/5d`, or `—` when the repo has no history. */
export function formatDeltaBadge(delta: StarDelta | null, lang: Lang = 'en'): string {
  if (!delta) return translate(lang, 'trend.noHistory')
  const sign = delta.delta > 0 ? '+' : delta.delta < 0 ? '-' : '+'
  return `${sign}${formatNumber(Math.abs(delta.delta), lang)}★${unitSuffix(delta.days, lang)}`
}

/** Honest window wording for the sort label: «за неделю», «за 3 дн.», «—». */
export function formatWindowLabel(days: number | null, lang: Lang = 'en'): string {
  if (days === null) return translate(lang, 'trend.noHistory')
  if (days === DELTA_WINDOW_DAYS) return translate(lang, 'trend.window.week')
  return translatePlural(lang, 'trend.window.days', days)
}

/**
 * Window shared by the visible deltas, used for the «Растущие» sort label.
 * Mixed histories are summarized by the most common window (ties go to the
 * longer one), so the label never promises a week for a majority of 3-day
 * deltas.
 */
export function windowFromDeltas(deltas: Map<number, StarDelta>): number | null {
  const counts = new Map<number, number>()
  for (const delta of deltas.values()) {
    counts.set(delta.days, (counts.get(delta.days) ?? 0) + 1)
  }
  let best: number | null = null
  let bestCount = 0
  for (const [days, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && days > best)) {
      best = days
      bestCount = count
    }
  }
  return best
}

export interface TrackingEntry {
  id: number
  source: TrendSource
  lastSeen: string
}

/**
 * docs/TRENDS.md §3: known repos ∪ fresh top-300, capped at `limit`. `top`
 * repos are never evicted; the seen tail goes oldest-`last_seen` first.
 */
export function selectTrackingSet(input: {
  known: TrackingEntry[]
  top: { id: number; lastSeen: string }[]
  limit?: number
}): number[] {
  const limit = input.limit ?? TRACKING_LIMIT
  const protectedIds = new Set<number>()
  const lastSeen = new Map<number, string>()

  for (const entry of input.known) {
    lastSeen.set(entry.id, entry.lastSeen)
    if (entry.source === 'top') protectedIds.add(entry.id)
  }

  for (const entry of input.top) {
    const previous = lastSeen.get(entry.id)
    if (!previous || entry.lastSeen > previous) {
      lastSeen.set(entry.id, entry.lastSeen)
    }
    protectedIds.add(entry.id)
  }

  if (protectedIds.size >= limit) {
    return Array.from(protectedIds)
  }

  const evictable = Array.from(lastSeen.keys())
    .filter((id) => !protectedIds.has(id))
    .sort((a, b) => {
      const bySeen = (lastSeen.get(b) ?? '').localeCompare(lastSeen.get(a) ?? '')
      return bySeen !== 0 ? bySeen : a - b
    })

  const room = limit - protectedIds.size
  return [...protectedIds, ...evictable.slice(0, room)]
}

/**
 * Legacy GraphQL global id: base64 of `010:Repository<databaseId>`. GitHub still
 * resolves these for `nodes(ids:)` (with a deprecation warning), which is what
 * lets the numeric REST ids stored in SQLite drive a single batched query.
 */
export function toRepositoryNodeId(id: number): string {
  return btoa(`010:Repository${id}`)
}
