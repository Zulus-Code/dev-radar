import { GITHUB_API_BASE, GITHUB_GRAPHQL_URL } from './constants'
import { getToken } from './authStore'
import { getPreferencesSnapshot } from './userPreferences'
import { buildGitHubQuery } from './utils'
import type { GitHubRepositoryREST } from '../types/github'
import {
  GRAPHQL_BATCH_SIZE,
  SNAPSHOT_RETENTION_DAYS,
  TOP_TRACKING_COUNT,
  chunk,
  isSyncDue,
  selectTrackingSet,
  shiftDay,
  toRepositoryNodeId,
  toUtcDay,
} from './trends'
import type { RepoSnapshot, TrackedRepo } from './trends'
import {
  deleteRepos,
  deleteSnapshotsBefore,
  getMeta,
  isTauri,
  listTrackedRepos,
  markMissing,
  notifyTrendsChanged,
  saveSnapshots,
  setMeta,
  upsertRepos,
} from './trendsStore'

export type SyncStatus =
  | 'ok'
  | 'fresh'
  | 'disabled'
  | 'no-token'
  | 'unavailable'
  | 'failed'

export interface SyncOutcome {
  status: SyncStatus
  tracked?: number
  snapshots?: number
}

interface GraphQLNode {
  databaseId: number | null
  nameWithOwner: string
  stargazerCount: number
  forkCount: number
  issues: { totalCount: number }
  primaryLanguage: { name: string } | null
}

const NODES_QUERY = `query ($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Repository {
      databaseId
      nameWithOwner
      stargazerCount
      forkCount
      issues(states: OPEN) { totalCount }
      primaryLanguage { name }
    }
  }
}`

const SEARCH_PER_PAGE = 100

/** Top of the default filter view; the stable background of the tracking set. */
async function fetchTopRepos(token: string, today: string): Promise<TrackedRepo[]> {
  const query = buildGitHubQuery({ timeRange: 'week' })
  const pages = Math.ceil(TOP_TRACKING_COUNT / SEARCH_PER_PAGE)
  const repos: TrackedRepo[] = []

  for (let page = 1; page <= pages; page++) {
    const params = new URLSearchParams({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: String(SEARCH_PER_PAGE),
      page: String(page),
    })
    const response = await fetch(`${GITHUB_API_BASE}/search/repositories?${params.toString()}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Search API responded ${response.status}`)
    }
    const data = (await response.json()) as { items?: GitHubRepositoryREST[] }
    const items = data.items ?? []
    for (const item of items) {
      repos.push({
        id: item.id,
        fullName: item.full_name,
        language: item.language,
        stars: item.stargazers_count,
        forks: item.forks_count,
        openIssues: item.open_issues_count,
        source: 'top',
        firstSeen: today,
        lastSeen: today,
        missingSince: null,
      })
    }
    if (items.length < SEARCH_PER_PAGE) break
  }

  return repos.slice(0, TOP_TRACKING_COUNT)
}

/**
 * One GraphQL request for up to 50 repositories. Nodes that no longer resolve
 * come back as `null` (NOT_FOUND); anything else — rate limit, auth, network,
 * HTTP — throws so the caller can abort without touching `last_sync_at`.
 */
async function fetchNodeBatch(ids: number[], token: string): Promise<(GraphQLNode | null)[]> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: NODES_QUERY,
      variables: { ids: ids.map(toRepositoryNodeId) },
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL responded ${response.status}`)
  }

  const payload = (await response.json()) as {
    data?: { nodes?: (GraphQLNode | null)[] | null }
    errors?: { type?: string; message?: string }[]
  }

  const nodes = payload.data?.nodes
  if (!Array.isArray(nodes)) {
    throw new Error(payload.errors?.[0]?.message ?? 'GraphQL returned no nodes')
  }

  const fatal = (payload.errors ?? []).some((error) => error.type !== 'NOT_FOUND')
  if (fatal) {
    throw new Error(payload.errors?.[0]?.message ?? 'GraphQL error')
  }

  return ids.map((_, index) => nodes[index] ?? null)
}

export async function syncStarTrends(now: Date = new Date()): Promise<SyncOutcome> {
  if (!isTauri()) return { status: 'unavailable' }
  if (getPreferencesSnapshot().statsEnabled === false) return { status: 'disabled' }

  const token = getToken()
  if (!token) return { status: 'no-token' }

  const today = toUtcDay(now)
  const lastSyncAt = await getMeta('last_sync_at')
  if (!isSyncDue(lastSyncAt, now.getTime())) return { status: 'fresh' }

  try {
    const known = await listTrackedRepos()
    const top = await fetchTopRepos(token, today)
    const trackedIds = selectTrackingSet({ known, top })
    const keep = new Set(trackedIds)

    const evicted = known.filter((repo) => !keep.has(repo.id)).map((repo) => repo.id)
    if (evicted.length > 0) {
      await deleteRepos(evicted)
    }

    const knownById = new Map(known.map((repo) => [repo.id, repo]))
    const topById = new Map(top.map((repo) => [repo.id, repo]))
    const snapshots: RepoSnapshot[] = []
    const updated: TrackedRepo[] = []
    const missing: number[] = []

    for (const batch of chunk(trackedIds, GRAPHQL_BATCH_SIZE)) {
      const nodes = await fetchNodeBatch(batch, token)
      batch.forEach((id, index) => {
        const node = nodes[index]
        if (!node) {
          missing.push(id)
          return
        }
        const previous = knownById.get(id)
        const fetchedTop = topById.get(id)
        updated.push({
          id,
          fullName: node.nameWithOwner,
          language: node.primaryLanguage?.name ?? null,
          stars: node.stargazerCount,
          forks: node.forkCount,
          openIssues: node.issues.totalCount,
          source: fetchedTop || previous?.source === 'top' ? 'top' : 'seen',
          firstSeen: previous?.firstSeen ?? today,
          lastSeen: today,
          missingSince: null,
        })
        snapshots.push({
          repoId: id,
          day: today,
          stars: node.stargazerCount,
          forks: node.forkCount,
          openIssues: node.issues.totalCount,
        })
      })
    }

    await saveSnapshots(snapshots)
    await upsertRepos(updated, { promoteTop: true })
    await markMissing(missing, today)
    await deleteSnapshotsBefore(shiftDay(today, -SNAPSHOT_RETENTION_DAYS))
    await setMeta('last_sync_at', now.toISOString())

    notifyTrendsChanged()
    return { status: 'ok', tracked: trackedIds.length, snapshots: snapshots.length }
  } catch {
    // Rate limit, offline, expired token: retry on the next start, stay silent.
    return { status: 'failed' }
  }
}

let startupSync: Promise<SyncOutcome> | null = null

/** Called once on app start; StrictMode's double effect reuses the same run. */
export function runStartupSync(now: Date = new Date()): Promise<SyncOutcome> {
  startupSync ??= syncStarTrends(now)
  return startupSync
}
