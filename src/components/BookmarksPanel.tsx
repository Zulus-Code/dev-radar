import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { usePersonalization } from '../hooks/usePersonalization'
import { useAuthRevision } from '../hooks/useAuth'
import { fetchRepoByFullName } from '../lib/github'
import type { Repository } from '../types/github'
import { formatRelativeTime } from '../lib/utils'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import Panel from './Panel'
import RepoStatsRow from './RepoStatsRow'
import TopicChipList from './TopicChipList'
import EmptyState from './EmptyState'
import { BookmarkIcon, BookmarkOutlineIcon } from './Icons'
import { openExternal } from '../lib/openExternal'

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onTopicClick: (topic: string) => void
}

function BookmarksPanel({ isOpen, onClose, onTopicClick }: BookmarksPanelProps) {
  const { prefs, toggleBookmark } = usePersonalization()
  const authRevision = useAuthRevision()

  const results = useQueries({
    queries: prefs.bookmarks.map((bookmark) => ({
      queryKey: ['repo', bookmark.fullName, authRevision],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchRepoByFullName(bookmark.fullName, signal),
      enabled: isOpen && prefs.bookmarks.length > 0,
      staleTime: 60_000,
    })),
  })

  const repos = useMemo(() => {
    const map = new Map<string, Repository>()
    results.forEach((result, index) => {
      const fullName = prefs.bookmarks[index]?.fullName
      if (fullName && result.data) {
        map.set(fullName, result.data)
      }
    })
    return map
  }, [results, prefs.bookmarks])

  const loading = results.some((result) => result.isLoading)

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Bookmarks"
      headerExtra={
        <span className="px-2 py-0.5 bg-github-accent/20 text-github-accent rounded-full text-xs font-medium">
          {prefs.bookmarks.length} saved
        </span>
      }
    >
      {prefs.bookmarks.length === 0 ? (
        <EmptyState
          icon={<BookmarkOutlineIcon />}
          title="No bookmarks yet"
          description="Click the bookmark icon on any repo to save it here"
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 bg-github-dark border border-github-border rounded-xl animate-pulse"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-github-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-github-border rounded w-3/4" />
                  <div className="h-4 bg-github-border rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prefs.bookmarks.map((bookmark) => {
            const repo = repos.get(bookmark.fullName)
            return (
              <div
                key={bookmark.fullName}
                className="p-4 bg-github-dark border border-github-border rounded-xl hover:border-github-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <a
                      href={repo?.htmlUrl || `https://github.com/${bookmark.fullName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        event.preventDefault()
                        openExternal(repo?.htmlUrl || `https://github.com/${bookmark.fullName}`)
                      }}
                      className="text-sm font-semibold text-github-accent hover:underline truncate block"
                    >
                      {bookmark.fullName}
                    </a>
                    {repo?.description && (
                      <p className="text-xs text-github-muted line-clamp-2 mt-1">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBookmark(bookmark.fullName)}
                    className="flex-shrink-0 p-1 text-yellow-400 hover:text-yellow-300 focus:outline-none rounded"
                    aria-label="Remove bookmark"
                  >
                    <BookmarkIcon className="w-4 h-4" filled />
                  </button>
                </div>

                {repo && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <LanguageBadge language={repo.language} color={repo.languageColor} />
                      <LicenseBadge spdxId={repo.license?.spdxId || null} />
                    </div>

                    <RepoStatsRow stars={repo.stars} forks={repo.forks} pushedAt={repo.pushedAt} compact />

                    <TopicChipList topics={repo.topics} max={4} onTopicClick={onTopicClick} />
                  </>
                )}

                {bookmark.note && (
                  <p className="text-xs text-github-muted mt-2 italic">"{bookmark.note}"</p>
                )}
                <p className="text-xs text-github-muted/60 mt-1">
                  Saved {formatRelativeTime(bookmark.addedAt)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

export default BookmarksPanel
