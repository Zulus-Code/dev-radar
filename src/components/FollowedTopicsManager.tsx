import { useState } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import Panel from './Panel'
import EmptyState from './EmptyState'
import { TagIcon } from './Icons'
import { useI18n } from '../hooks/useI18n'

interface FollowedTopicsManagerProps {
  isOpen: boolean
  onClose: () => void
}

function FollowedTopicsManager({ isOpen, onClose }: FollowedTopicsManagerProps) {
  const { t } = useI18n()
  const { prefs, followTopic, unfollowTopic } = usePersonalization()
  const [newTopic, setNewTopic] = useState('')

  return (
    <Panel isOpen={isOpen} onClose={onClose} title={t('followed.title')} maxW="max-w-lg" maxH="max-h-[80vh]">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTopic.trim()) {
              followTopic(newTopic.trim().toLowerCase())
              setNewTopic('')
            }
          }}
          placeholder={t('followed.placeholder')}
          className="flex-1 px-3 py-2 bg-github-dark border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
        />
        <button
          onClick={() => {
            if (newTopic.trim()) {
              followTopic(newTopic.trim().toLowerCase())
              setNewTopic('')
            }
          }}
          className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
        >
          {t('common.follow')}
        </button>
      </div>

      {prefs.followedTopics.length === 0 ? (
        <EmptyState
          icon={<TagIcon className="w-12 h-12" />}
          title={t('followed.empty.title')}
          description={t('followed.empty.description')}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {prefs.followedTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-github-accent/10 text-github-accent border border-github-accent/30 rounded-full text-sm"
            >
              <span className="text-xs">#</span>
              {topic}
              <button
                onClick={() => unfollowTopic(topic)}
                className="ml-1 text-github-accent/60 hover:text-red-400 focus:outline-none"
                aria-label={t('followed.unfollow', { topic })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default FollowedTopicsManager
