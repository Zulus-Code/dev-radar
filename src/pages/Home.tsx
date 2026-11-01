import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useFilters } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'
import { useRepos } from '../hooks/useRepos'
import { useTrendDeltas } from '../hooks/useTrendDeltas'
import { useTheme } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'
import { usePersonalization } from '../hooks/usePersonalization'
import { useAuthRevision } from '../hooks/useAuth'
import { SORT_OPTIONS } from '../lib/constants'
import { fetchCoreRateLimit } from '../lib/github'
import { formatWindowLabel, windowFromDeltas } from '../lib/trends'
import type { SortState } from '../hooks/useSort'
import RepoGrid from '../components/RepoGrid'
import { formatNumber } from '../lib/utils'
import { BookmarkIcon, FolderIcon, ChevronUpIcon, ChevronDownIcon, SunIcon, MoonIcon, MenuIcon, GitHubIcon, TagIcon, NoEntryIcon, SettingsIcon } from '../components/Icons'
import BadgeCount from '../components/BadgeCount'
import CollectionsPanel from '../components/CollectionsPanel'
import FollowedTopicsManager from '../components/FollowedTopicsManager'
import IgnoreListManager from '../components/IgnoreListManager'
import BookmarksPanel from '../components/BookmarksPanel'
import FilterSidebar from '../components/FilterSidebar'
import MinStarsInput from '../components/MinStarsInput'

type PanelId = 'bookmarks' | 'collections' | 'followed' | 'ignore'

function Home() {
  const { filters, updateFilters, resetFilters, activeFilterCount } = useFilters()
  const { sort, setSort, toggleOrder } = useSort()
  const { theme, toggleTheme } = useTheme()
  const { t, lang } = useI18n()
  const { prefs } = usePersonalization()
  const authRevision = useAuthRevision()
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const {
    repos,
    data,
    rateLimit,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    emptyPageStreak,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useRepos({
    keyword: filters.keyword,
    timeRange: filters.timeRange,
    language: filters.language,
    licenseType: filters.licenseType,
    minStars: filters.minStars,
    maxStars: filters.maxStars,
    createdWithinDays: filters.createdWithinDays,
    goodFirstIssues: filters.goodFirstIssues,
    topics: filters.topics,
    includeArchived: filters.includeArchived,
    includeForks: filters.includeForks,
    developerFilters: filters.developerFilters,
    readmeLanguage: filters.readmeLanguage,
    ignoredLanguages: prefs.ignoredLanguages,
    ignoredTopics: prefs.ignoredTopics,
    sort: sort.field,
    order: sort.order,
    authRevision,
  })

  const { data: coreRateLimit } = useQuery({
    queryKey: ['coreRateLimit'],
    queryFn: fetchCoreRateLimit,
    staleTime: 60_000,
    retry: false,
  })

  const repoIds = useMemo(() => repos.map((repo) => repo.id), [repos])
  const deltas = useTrendDeltas(repoIds)
  const deltaWindow = useMemo(() => windowFromDeltas(deltas), [deltas])

  const orderedRepos = useMemo(() => {
    if (sort.field !== 'growing') return repos
    const ranked = repos.filter((repo) => deltas.has(repo.id))
    const unranked = repos.filter((repo) => !deltas.has(repo.id))
    ranked.sort((a, b) => {
      const deltaA = deltas.get(a.id)?.delta ?? 0
      const deltaB = deltas.get(b.id)?.delta ?? 0
      return sort.order === 'asc' ? deltaA - deltaB : deltaB - deltaA
    })
    // No history means no delta: those repos keep their place at the end.
    return [...ranked, ...unranked]
  }, [repos, deltas, sort.field, sort.order])

  const growingLabel =
    deltaWindow === null
      ? t('sort.growing')
      : `${t('sort.growing')} — ${formatWindowLabel(deltaWindow, lang)}`

  const displayRateLimit = coreRateLimit || rateLimit

  const handleTopicClick = useCallback(
    (topic: string) => {
      if (!filters.topics.includes(topic)) {
        updateFilters({ topics: [...filters.topics, topic] })
      }
    },
    [filters.topics, updateFilters],
  )

  const handleRetry = useCallback(() => {
    if (data) {
      fetchNextPage()
    } else {
      refetch()
    }
  }, [data, fetchNextPage, refetch])

  const closePanel = useCallback(() => setActivePanel(null), [])

  const errorStatus = error && 'status' in error ? (error as { status: number }).status : null
  const isRateLimitError = errorStatus === 403
  const isAuthError = errorStatus === 401

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-github-dark/95 backdrop-blur-sm border-b border-github-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-1.5 text-github-muted hover:text-github-text rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent"
              aria-label={t('home.openFilters')}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <GitHubIcon className="w-8 h-8 text-github-text" />
              <h1 className="text-2xl font-bold text-github-text">Dev Radar</h1>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {displayRateLimit && (
              <span className="text-sm hidden lg:inline">
                {displayRateLimit.remaining > 0 ? (
                  <span className={displayRateLimit.remaining <= 100 ? 'text-red-400' : ''}>
                    {t('home.rateLimitRemaining', { remaining: formatNumber(displayRateLimit.remaining, lang) })}
                  </span>
                ) : (
                  <span className="text-red-400">{t('home.rateLimitExceeded')}</span>
                )}
              </span>
            )}
            <button
              onClick={() => setActivePanel('bookmarks')}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label={t('home.bookmarks')}
              title={t('home.bookmarks')}
            >
              <BookmarkIcon />
              <BadgeCount count={prefs.bookmarks.length} color="yellow" />
            </button>
            <button
              onClick={() => setActivePanel('collections')}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label={t('home.collections')}
              title={t('home.collections')}
            >
              <FolderIcon />
              <BadgeCount count={prefs.collections.length} color="blue" />
            </button>
            <button
              onClick={() => setActivePanel('followed')}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label={t('home.followedTopics')}
              title={t('home.followedTopics')}
            >
              <TagIcon className="w-5 h-5" />
              <BadgeCount count={prefs.followedTopics.length} color="green" />
            </button>
            <button
              onClick={() => setActivePanel('ignore')}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label={t('home.ignoreList')}
              title={t('home.ignoreList')}
            >
              <NoEntryIcon className="w-5 h-5" />
              <BadgeCount
                count={prefs.ignoredTopics.length + prefs.ignoredLanguages.length}
                color="red"
              />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={t('theme.switchTo', { mode: t(theme === 'dark' ? 'theme.light' : 'theme.dark') })}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              to="/settings"
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={t('home.settings')}
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <FilterSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 min-w-0 px-4 py-6 lg:pl-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select-main" className="sr-only">
                {t('home.sortBy')}
              </label>
              <select
                id="sort-select-main"
                value={sort.field}
                onChange={(e) => setSort({ field: e.target.value as SortState['field'] })}
                className="px-3 py-1.5 bg-github-darker border border-github-border rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent cursor-pointer"
                aria-label={t('home.sortAria')}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.icon} {option.field === 'growing' ? growingLabel : t(option.label)}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleOrder}
                className="p-1.5 bg-github-darker border border-github-border rounded-lg text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent"
                aria-label={t('home.switchOrder', { order: t(sort.order === 'asc' ? 'home.descending' : 'home.ascending') })}
                title={t(sort.order === 'asc' ? 'home.ascending' : 'home.descending')}
              >
                {sort.order === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              <div className="w-px h-6 bg-github-border" />
              <MinStarsInput value={filters.minStars} onChange={(v) => updateFilters({ minStars: v })} />
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-github-accent hover:underline focus:outline-none"
              >
                {t('home.resetFilters', { count: activeFilterCount })}
              </button>
            )}
          </div>

          {isError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-center mb-6">
              <p className="text-red-400 font-medium mb-2">
                {isAuthError
                  ? t('error.auth')
                  : isRateLimitError
                    ? t('error.rateLimit')
                    : t('error.loadRepos')}
              </p>
              {isAuthError && (
                <>
                  <p className="text-sm text-github-muted mb-3">
                    {t('error.authDetail')}
                  </p>
                  <Link
                    to="/settings"
                    className="inline-block px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {t('home.openSettings')}
                  </Link>
                </>
              )}
              {!isAuthError && (
                <>
                  {isRateLimitError && rateLimit && (
                    <p className="text-sm text-github-muted mb-3">
                      {t('error.resetsAt', { time: new Date(rateLimit.reset * 1000).toLocaleTimeString(lang) })}
                    </p>
                  )}
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {t('common.retry')}
                  </button>
                </>
              )}
            </div>
          )}

          <RepoGrid
            repos={orderedRepos}
            deltas={deltas}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            emptyPageStreak={emptyPageStreak}
            fetchNextPage={fetchNextPage}
            onTopicClick={handleTopicClick}
            activeDeveloperFilters={filters.developerFilters}
          />
        </main>
      </div>

      {activePanel === 'collections' && (
        <CollectionsPanel isOpen onClose={closePanel} onTopicClick={handleTopicClick} />
      )}
      {activePanel === 'followed' && <FollowedTopicsManager isOpen onClose={closePanel} />}
      {activePanel === 'ignore' && <IgnoreListManager isOpen onClose={closePanel} />}
      {activePanel === 'bookmarks' && (
        <BookmarksPanel isOpen onClose={closePanel} onTopicClick={handleTopicClick} />
      )}
    </div>
  )
}

export default Home
