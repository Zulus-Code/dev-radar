import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { usePersonalization } from '../hooks/usePersonalization'
import { useAuthRevision } from '../hooks/useAuth'
import { fetchRepoByFullName } from '../lib/github'
import type { Repository } from '../types/github'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import Panel from './Panel'
import RepoStatsRow from './RepoStatsRow'
import TopicChipList from './TopicChipList'
import EmptyState from './EmptyState'
import { ChevronUpIcon, TrashIcon, CloseIcon, CollectionIcon } from './Icons'
import { openExternal } from '../lib/openExternal'

interface CollectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  onTopicClick: (topic: string) => void
}

function CollectionsPanel({ isOpen, onClose, onTopicClick }: CollectionsPanelProps) {
  const { prefs, addCollection, deleteCollection, removeFromCollection } = usePersonalization()
  const authRevision = useAuthRevision()
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)

  const fullNames = useMemo(() => {
    const names = new Set<string>()
    prefs.collections.forEach((collection) =>
      collection.repoFullNames.forEach((fullName) => names.add(fullName)),
    )
    return Array.from(names)
  }, [prefs.collections])

  const results = useQueries({
    queries: fullNames.map((fullName) => ({
      queryKey: ['repo', fullName, authRevision],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchRepoByFullName(fullName, signal),
      enabled: isOpen && fullNames.length > 0,
      staleTime: 60_000,
    })),
  })

  const reposMap = useMemo(() => {
    const map = new Map<string, Repository>()
    results.forEach((result, index) => {
      const fullName = fullNames[index]
      if (fullName && result.data) {
        map.set(fullName, result.data)
      }
    })
    return map
  }, [results, fullNames])

  const loading = results.some((result) => result.isLoading)

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Collections"
      headerExtra={
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          {prefs.collections.length} collection{prefs.collections.length !== 1 ? 's' : ''}
        </span>
      }
      footer={
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full px-4 py-2 bg-github-accent/10 text-github-accent rounded-lg hover:bg-github-accent/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-github-accent"
        >
          + New Collection
        </button>
      }
    >
      {prefs.collections.length === 0 && !showCreateForm ? (
        <EmptyState
          icon={<CollectionIcon />}
          title="No collections yet"
          description="Create a collection and add repos from the folder icon on any repo card"
        />
      ) : (
        <div className="space-y-3">
          {showCreateForm && (
            <div className="p-4 bg-github-dark border border-github-border rounded-lg">
              <h3 className="text-sm font-medium text-github-text mb-3">New Collection</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent mb-2"
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      addCollection(newName.trim(), newDescription.trim() || undefined)
                      setNewName('')
                      setNewDescription('')
                      setShowCreateForm(false)
                    }
                  }}
                  className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-github-border text-github-text rounded-lg hover:bg-github-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {prefs.collections.map((collection) => {
            const isExpanded = expandedCollection === collection.id
            const repoCount = collection.repoFullNames.length

            return (
              <div
                key={collection.id}
                className="bg-github-dark border border-github-border rounded-lg overflow-hidden"
              >
                <div className="p-4 flex items-start justify-between hover:bg-github-border/30 transition-colors">
                  <button
                    onClick={() => setExpandedCollection(isExpanded ? null : collection.id)}
                    aria-expanded={isExpanded}
                    className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
                  >
                    <h3 className="text-sm font-semibold text-github-text">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-xs text-github-muted mt-1">{collection.description}</p>
                    )}
                    <p className="text-xs text-github-muted mt-2">
                      {repoCount} repo{repoCount !== 1 ? 's' : ''} · Updated{' '}
                      {new Date(collection.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <div className="flex items-center gap-2 ml-2">
                    {isExpanded && <ChevronUpIcon />}
                    <button
                      onClick={() => deleteCollection(collection.id)}
                      className="p-1 text-github-muted hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      aria-label={`Delete collection ${collection.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-github-border p-4">
                    {repoCount === 0 ? (
                      <p className="text-xs text-github-muted text-center py-4">
                        No repos yet. Click the 📁 icon on any repo card to add it here.
                      </p>
                    ) : loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: repoCount }).map((_, i) => (
                          <div
                            key={i}
                            className="p-3 bg-github-darker border border-github-border rounded animate-pulse"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-github-border" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-github-border rounded w-3/4" />
                                <div className="h-3 bg-github-border rounded w-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {collection.repoFullNames.map((fullName) => {
                          const repo = reposMap.get(fullName)
                          return (
                            <div
                              key={fullName}
                              className="p-3 bg-github-darker border border-github-border rounded-lg hover:border-github-accent/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <a
                                    href={repo?.htmlUrl || `https://github.com/${fullName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => {
                                      event.preventDefault()
                                      openExternal(repo?.htmlUrl || `https://github.com/${fullName}`)
                                    }}
                                    className="text-sm font-semibold text-github-accent hover:underline truncate block"
                                  >
                                    {fullName}
                                  </a>
                                  {repo?.description && (
                                    <p className="text-xs text-github-muted line-clamp-2 mt-0.5">
                                      {repo.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeFromCollection(collection.id, fullName)}
                                  className="flex-shrink-0 p-1 text-github-muted hover:text-red-400 focus:outline-none rounded"
                                  aria-label={`Remove ${fullName} from collection`}
                                >
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {repo && (
                                <>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    <LanguageBadge language={repo.language} color={repo.languageColor} />
                                    <LicenseBadge spdxId={repo.license?.spdxId || null} />
                                  </div>

                                  <RepoStatsRow
                                    stars={repo.stars}
                                    forks={repo.forks}
                                    pushedAt={repo.pushedAt}
                                    compact
                                  />

                                  <TopicChipList topics={repo.topics} max={3} onTopicClick={onTopicClick} />
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

export default CollectionsPanel
