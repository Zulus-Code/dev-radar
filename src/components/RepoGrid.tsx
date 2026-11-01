import { useEffect, useRef, memo } from 'react'
import type { Repository } from '../types/github'
import type { StarDelta } from '../lib/trends'
import type { DeveloperFilter } from '../hooks/useFilters'
import RepoCard from './RepoCard'
import { useI18n } from '../hooks/useI18n'
import EmptyState from './EmptyState'
import { SadFaceIcon } from './Icons'

const MAX_AUTO_EMPTY_PAGES = 3

interface RepoGridProps {
  repos: Repository[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  emptyPageStreak: number
  fetchNextPage: () => void
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
  deltas?: Map<number, StarDelta>
}

const RepoGrid = memo(function RepoGrid({
  repos,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  emptyPageStreak,
  fetchNextPage,
  onTopicClick,
  activeDeveloperFilters = [],
  deltas,
}: RepoGridProps) {
  const { t } = useI18n()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const fetchNextPageRef = useRef(fetchNextPage)

  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage
  }, [fetchNextPage])

  const autoFetchAllowed = emptyPageStreak < MAX_AUTO_EMPTY_PAGES

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && autoFetchAllowed) {
          fetchNextPageRef.current()
        }
      },
      { rootMargin: '200px' },
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, autoFetchAllowed])

  if (isLoading) {
    return (
      <div className="repo-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (repos.length === 0) {
    if (hasNextPage) {
      return (
        <div className="space-y-4">
          <EmptyState
            icon={<SadFaceIcon />}
            title={t('grid.noMatches.title')}
            description={t('grid.noMatches.description')}
          />
          <div className="text-center">
            <button
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 focus:outline-none focus:ring-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? t('grid.searching') : t('grid.searchMore')}
            </button>
          </div>
        </div>
      )
    }
    return (
      <EmptyState
        icon={<SadFaceIcon />}
        title={t('grid.empty.title')}
        description={t('grid.empty.description')}
      />
    )
  }

  return (
    <>
      <div className="repo-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} onTopicClick={onTopicClick} activeDeveloperFilters={activeDeveloperFilters} delta={deltas?.get(repo.id) ?? null} />
        ))}
      </div>
      {hasNextPage && autoFetchAllowed && (
        <div ref={sentinelRef} className="h-4 mt-4" aria-hidden="true" />
      )}
      {hasNextPage && !autoFetchAllowed && (
        <div className="text-center mt-4">
          <button
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-github-darker border border-github-border text-github-text rounded-lg hover:border-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? t('grid.loadingMore') : t('grid.loadMore')}
          </button>
        </div>
      )}
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={`more-${i}`} />
          ))}
        </div>
      )}
    </>
  )
})

function SkeletonCard() {
  return (
    <div className="repo-card p-5 bg-github-darker border border-github-border rounded-xl animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-github-border flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-github-border rounded w-3/4" />
          <div className="h-4 bg-github-border rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-github-border rounded-full w-20" />
        <div className="h-5 bg-github-border rounded-full w-24" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-4 bg-github-border rounded w-12" />
        <div className="h-4 bg-github-border rounded w-12" />
        <div className="h-4 bg-github-border rounded w-12" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-github-border">
        <div className="h-5 bg-github-border rounded-full w-16" />
        <div className="h-5 bg-github-border rounded-full w-16" />
        <div className="h-5 bg-github-border rounded-full w-16" />
      </div>
    </div>
  )
}

export default RepoGrid
