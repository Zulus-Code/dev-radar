import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { fetchReposWithIntelligence } from '../lib/github'
import { recordSeenRepos } from '../lib/trendsStore'
import type { Repository, RateLimitInfo } from '../types/github'
import type { BuildQueryOptions, SortField, SortOrder } from '../lib/utils'

interface UseReposOptions extends BuildQueryOptions {
  sort: SortField
  order: SortOrder
  authRevision: number
}

interface ReposPage {
  repos: Repository[]
  rateLimit: RateLimitInfo
  serverReposCount: number
}

export function useRepos({ sort, order, authRevision, ...queryOptions }: UseReposOptions) {
  const queryKey = ['repos', queryOptions, sort, order, authRevision]

  const result = useInfiniteQuery<ReposPage>({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchReposWithIntelligence(queryOptions, sort, order, pageParam as number, signal),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.serverReposCount === 0) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status
      if (typeof status === 'number' && status >= 400 && status < 500) return false
      return failureCount < 1
    },
  })

  const allRepos = useMemo(() => {
    const pages = result.data?.pages
    if (!pages) return []
    const seen = new Set<number>()
    const unique: Repository[] = []
    for (const page of pages) {
      for (const repo of page.repos) {
        if (seen.has(repo.id)) continue
        seen.add(repo.id)
        unique.push(repo)
      }
    }
    return unique
  }, [result.data])

  const emptyPageStreak = useMemo(() => {
    const pages = result.data?.pages
    if (!pages) return 0
    let streak = 0
    for (let i = pages.length - 1; i >= 0; i--) {
      if (pages[i].repos.length === 0) {
        streak += 1
      } else {
        break
      }
    }
    return streak
  }, [result.data])

  const pages = result.data?.pages
  const rateLimit = pages && pages.length > 0 ? pages[pages.length - 1].rateLimit : undefined

  // Fire-and-forget: what the user sees feeds the tracking set (Tauri only).
  useEffect(() => {
    if (allRepos.length === 0) return
    void recordSeenRepos(allRepos)
  }, [allRepos])

  return {
    ...result,
    repos: allRepos,
    emptyPageStreak,
    rateLimit,
  }
}
