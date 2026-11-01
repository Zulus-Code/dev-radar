import type { Repository } from '../types/github'
import type { StarDelta } from '../lib/trends'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import { formatDecimal, formatNumber, formatRelativeTime } from '../lib/utils'
import { formatDeltaBadge } from '../lib/trends'
import { evaluateDeveloperFilter } from '../lib/developerFilters'
import type { DeveloperFilter } from '../hooks/useFilters'
import { useBookmarked, useIsInAnyCollection, useCollections } from '../hooks/usePersonalization'
import { useI18n } from '../hooks/useI18n'
import { toggleBookmark, addToCollection } from '../lib/userPreferences'
import { useClickOutside } from '../hooks/useClickOutside'
import { useState, useRef, useMemo, memo } from 'react'
import { StarIcon, ForkIcon, BookmarkIcon, FolderIcon, CheckmarkIcon, PullRequestIcon, IssueIcon } from './Icons'
import TopicChipList from './TopicChipList'
import { openExternal } from '../lib/openExternal'

interface RepoCardProps {
  repo: Repository
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
  delta?: StarDelta | null
}

const RepoCard = memo(function RepoCard({ repo, onTopicClick, activeDeveloperFilters = [], delta = null }: RepoCardProps) {
  const { t, lang } = useI18n()
  const bookmarked = useBookmarked(repo.fullName)
  const isInAnyCollection = useIsInAnyCollection(repo.fullName)
  const collections = useCollections()
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, showCollectionDropdown, () => setShowCollectionDropdown(false))

  const developerBadges = useMemo(
    () =>
      activeDeveloperFilters
        .map((filter) => evaluateDeveloperFilter(filter, repo, undefined, lang))
        .filter((result) => result.badge),
    [activeDeveloperFilters, repo, lang],
  )

  return (
    <article className="repo-card flex flex-col p-5 bg-github-darker border border-github-border rounded-xl hover:border-github-accent/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={repo.owner.avatarUrl}
          alt={t('repo.avatarAlt', { login: repo.owner.login })}
          className="w-10 h-10 rounded-full flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                event.preventDefault()
                openExternal(repo.htmlUrl)
              }}
              className="text-lg font-semibold text-github-accent hover:underline truncate block"
            >
              {repo.fullName}
            </a>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                    isInAnyCollection
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-github-muted hover:text-github-text'
                  }`}
                  aria-label={t('repo.addToCollection')}
                  title={t(isInAnyCollection ? 'repo.inCollections' : 'repo.addToCollection')}
                >
                  <FolderIcon filled={isInAnyCollection} />
                </button>
                {showCollectionDropdown && (
                  <div className="absolute right-0 z-20 mt-2 w-56 bg-github-dark border border-github-border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-github-border">
                      <p className="text-xs text-github-muted font-medium">{t('repo.addToCollection')}</p>
                    </div>
                    {collections.length === 0 ? (
                      <div className="p-3 text-xs text-github-muted text-center">{t('repo.noCollections')}</div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {collections.map((collection) => {
                          const isInCollection = collection.repoFullNames.includes(repo.fullName)
                          return (
                            <button
                              key={collection.id}
                              onClick={() => {
                                addToCollection(collection.id, repo.fullName)
                                setShowCollectionDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-github-border transition-colors flex items-center justify-between gap-2 ${
                                isInCollection ? 'text-github-accent' : 'text-github-text'
                              }`}
                            >
                              <span className="truncate">{collection.name}</span>
                              {isInCollection && <CheckmarkIcon />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleBookmark(repo.fullName)}
                className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                  bookmarked
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-github-muted hover:text-github-text'
                }`}
                aria-label={t(bookmarked ? 'repo.removeBookmark' : 'repo.bookmarkThis')}
                title={t(bookmarked ? 'repo.bookmarked' : 'repo.bookmark')}
              >
                <BookmarkIcon className="w-5 h-5" filled={bookmarked} />
              </button>
            </div>
          </div>
          {repo.description && (
            <p className="text-sm text-github-muted line-clamp-2 mt-1">{repo.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <LanguageBadge language={repo.language} color={repo.languageColor} />
        <LicenseBadge spdxId={repo.license?.spdxId || null} />
      </div>

      {developerBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {developerBadges.map((result, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${result.badge!.color} bg-github-dark/50 border border-github-border`}
            >
              <span>{result.badge!.icon}</span>
              <span>{result.badge!.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-github-muted mb-3">
        <span className="flex items-center gap-1" title={t('repo.starsTitle', { count: formatDecimal(repo.stars, lang) })}>
          <StarIcon />
          {formatNumber(repo.stars, lang)}
        </span>
        <span className="flex items-center gap-1" title={t('repo.forksTitle', { count: formatDecimal(repo.forks, lang) })}>
          <ForkIcon />
          {formatNumber(repo.forks, lang)}
        </span>
        {repo.openPRs > 0 && (
          <span className="flex items-center gap-1" title={t('repo.openPRsTitle', { count: formatDecimal(repo.openPRs, lang) })}>
            <PullRequestIcon />
            {formatNumber(repo.openPRs, lang)}
          </span>
        )}
        <span className="flex items-center gap-1" title={t('repo.openIssuesTitle', { count: formatDecimal(repo.openIssues, lang) })}>
          <IssueIcon />
          {formatNumber(repo.openIssues, lang)}
        </span>
        <span
          className={`flex items-center gap-1 font-medium ${
            delta && delta.delta > 0
              ? 'text-green-400'
              : delta && delta.delta < 0
                ? 'text-red-400'
                : ''
          }`}
          title={t('repo.growthTitle')}
        >
          {formatDeltaBadge(delta, lang)}
        </span>
        <span className="ml-auto text-xs" title={repo.pushedAt}>
          {formatRelativeTime(repo.pushedAt, lang)}
        </span>
      </div>

      {repo.topics.length > 0 && (
        <div className="mt-auto">
          <TopicChipList topics={repo.topics} max={5} onTopicClick={onTopicClick} />
        </div>
      )}
    </article>
  )
})

export default RepoCard
