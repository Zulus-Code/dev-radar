import { describe, expect, it } from 'vitest'
import {
  GRAPHQL_BATCH_SIZE,
  chunk,
  computeDelta,
  daysBetween,
  formatDeltaBadge,
  formatWindowLabel,
  groupSnapshots,
  isSyncDue,
  selectTrackingSet,
  shiftDay,
  toRepositoryNodeId,
  toUtcDay,
  windowFromDeltas,
} from '../lib/trends'
import type { DaySnapshot, RepoSnapshot, StarDelta } from '../lib/trends'
import { SYNC_INTERVAL_MS } from '../lib/trends'

const TODAY = '2026-11-01'

function snapshot(day: string, stars: number): DaySnapshot {
  return { day, stars }
}

describe('utc day helpers', () => {
  it('formats a date as a UTC day', () => {
    expect(toUtcDay(new Date('2026-11-01T23:59:59Z'))).toBe('2026-11-01')
    expect(toUtcDay(new Date('2026-11-02T00:00:00Z'))).toBe('2026-11-02')
  })

  it('shifts days across month boundaries', () => {
    expect(shiftDay('2026-11-01', -7)).toBe('2026-10-25')
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('counts calendar days between stored days', () => {
    expect(daysBetween('2026-10-25', '2026-11-01')).toBe(7)
    expect(daysBetween('2026-10-30', '2026-11-01')).toBe(2)
    expect(daysBetween('2026-11-01', '2026-11-01')).toBe(0)
  })
})

describe('isSyncDue', () => {
  const now = Date.parse('2026-11-01T12:00:00Z')

  it('syncs when nothing was ever recorded', () => {
    expect(isSyncDue(null, now)).toBe(true)
  })

  it('skips a sync younger than six hours', () => {
    const fiveHoursAgo = new Date(now - 5 * 60 * 60 * 1000).toISOString()
    expect(SYNC_INTERVAL_MS).toBe(6 * 60 * 60 * 1000)
    expect(isSyncDue(fiveHoursAgo, now)).toBe(false)
  })

  it('syncs again after six hours', () => {
    const sevenHoursAgo = new Date(now - 7 * 60 * 60 * 1000).toISOString()
    expect(isSyncDue(sevenHoursAgo, now)).toBe(true)
  })

  it('treats an unparsable timestamp as due', () => {
    expect(isSyncDue('not-a-date', now)).toBe(true)
  })
})

describe('computeDelta window fallback', () => {
  it('uses the 7-day window when a snapshot is at least a week old', () => {
    const delta = computeDelta([snapshot('2026-10-25', 100), snapshot(TODAY, 512)], TODAY)
    expect(delta).toEqual({ delta: 412, days: 7 })
  })

  it('picks the newest baseline at or before today - 7', () => {
    const delta = computeDelta(
      [snapshot('2026-10-20', 10), snapshot('2026-10-25', 100), snapshot(TODAY, 512)],
      TODAY,
    )
    expect(delta).toEqual({ delta: 412, days: 7 })
  })

  it('falls back to the whole period when the history is shorter than a week', () => {
    const delta = computeDelta(
      [snapshot('2026-10-29', 80), snapshot('2026-10-30', 100), snapshot(TODAY, 120)],
      TODAY,
    )
    expect(delta).toEqual({ delta: 40, days: 3 })
  })

  it('reports the real span when the app was not running for weeks', () => {
    const delta = computeDelta([snapshot('2026-10-10', 100), snapshot('2026-10-31', 400)], TODAY)
    expect(delta).toEqual({ delta: 300, days: 21 })
  })

  it('has no delta for a repo with a single snapshot', () => {
    expect(computeDelta([snapshot(TODAY, 512)], TODAY)).toBeNull()
    expect(computeDelta([], TODAY)).toBeNull()
  })

  it('keeps negative deltas', () => {
    const delta = computeDelta([snapshot('2026-10-25', 500), snapshot(TODAY, 480)], TODAY)
    expect(delta).toEqual({ delta: -20, days: 7 })
  })
})

describe('formatDeltaBadge', () => {
  it('renders a weekly positive delta', () => {
    expect(formatDeltaBadge({ delta: 412, days: 7 }, 'en')).toBe('+412★/wk')
    expect(formatDeltaBadge({ delta: 412, days: 7 }, 'ru')).toBe('+412★/нед')
  })

  it('renders a daily delta', () => {
    expect(formatDeltaBadge({ delta: 38, days: 1 }, 'en')).toBe('+38★/d')
    expect(formatDeltaBadge({ delta: 38, days: 1 }, 'ru')).toBe('+38★/сут')
  })

  it('renders a partial-period delta with its real length', () => {
    expect(formatDeltaBadge({ delta: 9, days: 3 }, 'en')).toBe('+9★/3d')
    expect(formatDeltaBadge({ delta: 9, days: 3 }, 'ru')).toBe('+9★/3 дн.')
  })

  it('renders negative deltas with a minus', () => {
    expect(formatDeltaBadge({ delta: -38, days: 1 }, 'en')).toBe('-38★/d')
    expect(formatDeltaBadge({ delta: -412, days: 7 }, 'ru')).toBe('-412★/нед')
  })

  it('renders a dash when there is no history', () => {
    expect(formatDeltaBadge(null, 'en')).toBe('—')
    expect(formatDeltaBadge(null, 'ru')).toBe('—')
  })

  it('compacts large numbers', () => {
    expect(formatDeltaBadge({ delta: 12345, days: 7 }, 'en')).toMatch(/^\+12\.3k★\/wk$/)
  })
})

describe('formatWindowLabel', () => {
  it('names the week window', () => {
    expect(formatWindowLabel(7, 'en')).toBe('past week')
    expect(formatWindowLabel(7, 'ru')).toBe('за неделю')
  })

  it('names short windows with the real number of days', () => {
    expect(formatWindowLabel(3, 'en')).toBe('past 3 days')
    expect(formatWindowLabel(3, 'ru')).toBe('за 3 дн.')
    expect(formatWindowLabel(1, 'ru')).toBe('за 1 день')
    expect(formatWindowLabel(5, 'ru')).toBe('за 5 дн.')
  })

  it('falls back to the dash without history', () => {
    expect(formatWindowLabel(null, 'en')).toBe('—')
  })

  it('reports the window shared by the delta map', () => {
    const deltas = new Map<number, StarDelta>([
      [1, { delta: 10, days: 7 }],
      [2, { delta: 3, days: 7 }],
    ])
    expect(windowFromDeltas(deltas)).toBe(7)
    expect(windowFromDeltas(new Map())).toBeNull()
  })

  it('uses the dominant window when histories are mixed', () => {
    const mixed = new Map<number, StarDelta>([
      [1, { delta: 10, days: 3 }],
      [2, { delta: 3, days: 3 }],
      [3, { delta: 50, days: 7 }],
    ])
    expect(windowFromDeltas(mixed)).toBe(3)
  })

  it('prefers the longer window when both are equally common', () => {
    const tie = new Map<number, StarDelta>([
      [1, { delta: 10, days: 3 }],
      [2, { delta: 3, days: 7 }],
    ])
    expect(windowFromDeltas(tie)).toBe(7)
  })
})

describe('chunk', () => {
  it('splits GraphQL batches by size', () => {
    const ids = Array.from({ length: 120 }, (_, index) => index)
    const batches = chunk(ids, GRAPHQL_BATCH_SIZE)
    expect(GRAPHQL_BATCH_SIZE).toBe(50)
    expect(batches.map((batch) => batch.length)).toEqual([50, 50, 20])
    expect(batches.flat()).toEqual(ids)
  })

  it('handles exact multiples and empty input', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(chunk([], 50)).toEqual([])
  })
})

describe('selectTrackingSet', () => {
  const known = [
    { id: 1, source: 'seen' as const, lastSeen: '2026-10-01' },
    { id: 2, source: 'seen' as const, lastSeen: '2026-10-02' },
    { id: 3, source: 'seen' as const, lastSeen: '2026-10-03' },
    { id: 4, source: 'seen' as const, lastSeen: '2026-10-04' },
    { id: 5, source: 'seen' as const, lastSeen: '2026-10-05' },
  ]

  it('keeps every known repo while under the cap', () => {
    const ids = selectTrackingSet({ known, top: [{ id: 10, lastSeen: TODAY }], limit: 2000 })
    expect(ids.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 10])
  })

  it('evicts the oldest seen repos first when the cap is hit', () => {
    const ids = selectTrackingSet({ known, top: [{ id: 10, lastSeen: TODAY }], limit: 3 })
    expect(ids).toHaveLength(3)
    expect(ids).toContain(10)
    expect(ids.sort((a, b) => a - b)).toEqual([4, 5, 10])
  })

  it('never evicts top repos, even when the cap is tiny', () => {
    const withTop = [...known, { id: 7, source: 'top' as const, lastSeen: '2025-01-01' }]
    const ids = selectTrackingSet({ known: withTop, top: [], limit: 2 })
    expect(ids).toContain(7)
    expect(ids).toHaveLength(2)
  })

  it('merges a freshly fetched top repo into the protected set', () => {
    const ids = selectTrackingSet({
      known: [{ id: 1, source: 'seen', lastSeen: TODAY }],
      top: [{ id: 1, lastSeen: TODAY }],
      limit: 1,
    })
    expect(ids).toEqual([1])
  })

  it('caps at 2000 by default', () => {
    const many = Array.from({ length: 2100 }, (_, index) => ({
      id: index + 1,
      source: 'seen' as const,
      lastSeen: '2026-10-01',
    }))
    expect(selectTrackingSet({ known: many, top: [] })).toHaveLength(2000)
  })
})

describe('toRepositoryNodeId', () => {
  it('encodes the legacy global id GitHub resolves in nodes(ids:)', () => {
    expect(toRepositoryNodeId(10270250)).toBe('MDEwOlJlcG9zaXRvcnkxMDI3MDI1MA==')
    expect(atob(toRepositoryNodeId(10270250))).toBe('010:Repository10270250')
  })
})

describe('groupSnapshots', () => {
  it('groups snapshot rows by repo', () => {
    const rows: RepoSnapshot[] = [
      { repoId: 1, day: '2026-10-25', stars: 10, forks: 1, openIssues: 0 },
      { repoId: 2, day: '2026-10-25', stars: 20, forks: 2, openIssues: 1 },
      { repoId: 1, day: '2026-11-01', stars: 30, forks: 3, openIssues: 2 },
    ]
    const grouped = groupSnapshots(rows)
    expect(grouped.get(1)).toEqual([
      { day: '2026-10-25', stars: 10 },
      { day: '2026-11-01', stars: 30 },
    ])
    expect(grouped.get(2)).toEqual([{ day: '2026-10-25', stars: 20 }])
  })
})
