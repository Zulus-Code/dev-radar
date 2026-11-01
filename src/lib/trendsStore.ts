import type { Repository } from '../types/github'
import type { RepoSnapshot, StarDelta, TrackedRepo } from './trends'
import { computeDelta, groupSnapshots, toUtcDay } from './trends'

export const DB_FILE = 'dev-radar.db'

/** SQLite only exists inside the Tauri webview; jsdom and plain browsers get no-ops. */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

type SqlDatabase = {
  select<T>(query: string, values?: unknown[]): Promise<T>
  execute(query: string, values?: unknown[]): Promise<unknown>
}

let dbPromise: Promise<SqlDatabase | null> | null = null

async function loadDatabase(): Promise<SqlDatabase | null> {
  if (!isTauri()) return null
  if (!dbPromise) {
    dbPromise = (async () => {
      const [{ default: Database }, path] = await Promise.all([
        import('@tauri-apps/plugin-sql'),
        import('@tauri-apps/api/path'),
      ])
      const dataDir = await path.appDataDir()
      const file = await path.join(dataDir, DB_FILE)
      return (await Database.load(`sqlite:${file}`)) as unknown as SqlDatabase
    })().catch(() => {
      dbPromise = null
      return null
    })
  }
  return dbPromise
}

async function select<T>(query: string, values: unknown[] = []): Promise<T[]> {
  const db = await loadDatabase()
  if (!db) return []
  try {
    return await db.select<T[]>(query, values)
  } catch {
    return []
  }
}

async function execute(query: string, values: unknown[] = []): Promise<void> {
  const db = await loadDatabase()
  if (!db) return
  try {
    await db.execute(query, values)
  } catch {
    // A broken local database must never break the UI; trends simply stay empty.
  }
}

const ROW_CHUNK = 100
const ID_CHUNK = 500

function placeholders(rowCount: number, columnCount: number): string {
  const row = `(${Array.from({ length: columnCount }, () => '?').join(', ')})`
  return Array.from({ length: rowCount }, () => row).join(', ')
}

function chunked<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size))
  return result
}

let revision = 0
const listeners = new Set<() => void>()

export function subscribeTrends(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getTrendsRevision(): number {
  return revision
}

export function notifyTrendsChanged(): void {
  revision += 1
  listeners.forEach((listener) => listener())
}

export async function getMeta(key: string): Promise<string | null> {
  const rows = await select<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key])
  return rows[0]?.value ?? null
}

export async function setMeta(key: string, value: string): Promise<void> {
  await execute('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, value])
}

interface RepoRow {
  id: number
  full_name: string
  language: string | null
  stars: number
  forks: number
  open_issues: number
  source: string
  first_seen: string
  last_seen: string
  missing_since: string | null
}

function toTrackedRepo(row: RepoRow): TrackedRepo {
  return {
    id: row.id,
    fullName: row.full_name,
    language: row.language,
    stars: row.stars,
    forks: row.forks,
    openIssues: row.open_issues,
    source: row.source === 'top' ? 'top' : 'seen',
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    missingSince: row.missing_since,
  }
}

export async function listTrackedRepos(): Promise<TrackedRepo[]> {
  const rows = await select<RepoRow>(
    `SELECT id, full_name, language, stars, forks, open_issues, source, first_seen, last_seen, missing_since
     FROM repos`,
  )
  return rows.map(toTrackedRepo)
}

export async function countTrackedRepos(): Promise<number> {
  const rows = await select<{ tracked: number }>('SELECT COUNT(*) AS tracked FROM repos')
  return rows[0]?.tracked ?? 0
}

export async function getTrendStatus(): Promise<{ tracked: number; lastSyncAt: string | null }> {
  const [tracked, lastSyncAt] = await Promise.all([countTrackedRepos(), getMeta('last_sync_at')])
  return { tracked, lastSyncAt }
}

/**
 * Upsert repo metadata. `first_seen` is only written on insert, and when
 * `promoteTop` is set the `top` source sticks so cap eviction never drops it.
 */
export async function upsertRepos(
  repos: TrackedRepo[],
  { promoteTop = false }: { promoteTop?: boolean } = {},
): Promise<void> {
  const sourceUpdate = promoteTop
    ? `source = CASE WHEN repos.source = 'top' OR excluded.source = 'top' THEN 'top' ELSE 'seen' END,`
    : ''

  for (const batch of chunked(repos, ROW_CHUNK)) {
    const values: unknown[] = []
    for (const repo of batch) {
      values.push(
        repo.id,
        repo.fullName,
        repo.language,
        repo.stars,
        repo.forks,
        repo.openIssues,
        repo.source,
        repo.firstSeen,
        repo.lastSeen,
        repo.missingSince,
      )
    }
    await execute(
      `INSERT INTO repos (id, full_name, language, stars, forks, open_issues, source, first_seen, last_seen, missing_since)
       VALUES ${placeholders(batch.length, 10)}
       ON CONFLICT(id) DO UPDATE SET
         full_name = excluded.full_name,
         language = excluded.language,
         stars = excluded.stars,
         forks = excluded.forks,
         open_issues = excluded.open_issues,
         ${sourceUpdate}
         last_seen = excluded.last_seen,
         missing_since = NULL`,
      values,
    )
  }
}

export async function markMissing(ids: number[], day: string): Promise<void> {
  for (const batch of chunked(ids, ID_CHUNK)) {
    if (batch.length === 0) continue
    await execute(
      `UPDATE repos SET missing_since = COALESCE(missing_since, ?) WHERE id IN (${batch
        .map(() => '?')
        .join(', ')})`,
      [day, ...batch],
    )
  }
}

export async function deleteRepos(ids: number[]): Promise<void> {
  for (const batch of chunked(ids, ID_CHUNK)) {
    if (batch.length === 0) continue
    await execute(`DELETE FROM repos WHERE id IN (${batch.map(() => '?').join(', ')})`, batch)
  }
}

export async function saveSnapshots(snapshots: RepoSnapshot[]): Promise<void> {
  for (const batch of chunked(snapshots, ROW_CHUNK)) {
    const values: unknown[] = []
    for (const snapshot of batch) {
      values.push(snapshot.repoId, snapshot.day, snapshot.stars, snapshot.forks, snapshot.openIssues)
    }
    await execute(
      `INSERT OR REPLACE INTO snapshots (repo_id, day, stars, forks, open_issues)
       VALUES ${placeholders(batch.length, 5)}`,
      values,
    )
  }
}

export async function deleteSnapshotsBefore(day: string): Promise<void> {
  await execute('DELETE FROM snapshots WHERE day < ?', [day])
}

/** docs/TRENDS.md §5 delta map for the repos currently on screen. */
export async function getStarDeltas(
  repoIds: number[],
  today: string = toUtcDay(),
): Promise<Map<number, StarDelta>> {
  const deltas = new Map<number, StarDelta>()
  const unique = Array.from(new Set(repoIds))
  if (unique.length === 0) return deltas

  const rows: RepoSnapshot[] = []
  for (const batch of chunked(unique, ID_CHUNK)) {
    if (batch.length === 0) continue
    const page = await select<{
      repo_id: number
      day: string
      stars: number
      forks: number
      open_issues: number
    }>(
      `SELECT repo_id, day, stars, forks, open_issues FROM snapshots
       WHERE repo_id IN (${batch.map(() => '?').join(', ')})`,
      batch,
    )
    for (const row of page) {
      rows.push({
        repoId: row.repo_id,
        day: row.day,
        stars: row.stars,
        forks: row.forks,
        openIssues: row.open_issues,
      })
    }
  }

  const grouped = groupSnapshots(rows)
  for (const [repoId, snapshots] of grouped) {
    const delta = computeDelta(snapshots, today)
    if (delta) deltas.set(repoId, delta)
  }
  return deltas
}

/** Fire-and-forget: everything the user sees becomes part of the tracking set. */
export async function recordSeenRepos(
  repos: Repository[],
  day: string = toUtcDay(),
): Promise<void> {
  if (!isTauri() || repos.length === 0) return
  const rows: TrackedRepo[] = repos.map((repo) => ({
    id: repo.id,
    fullName: repo.fullName,
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.openIssues,
    source: 'seen',
    firstSeen: day,
    lastSeen: day,
    missingSince: null,
  }))
  await upsertRepos(rows)
}
