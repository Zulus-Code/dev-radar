import { useState } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import Panel from './Panel'
import { useI18n } from '../hooks/useI18n'

interface IgnoreListManagerProps {
  isOpen: boolean
  onClose: () => void
}

function IgnoreListManager({ isOpen, onClose }: IgnoreListManagerProps) {
  const { t } = useI18n()
  const { prefs, ignoreTopic, unignoreTopic, ignoreLanguage, unignoreLanguage } = usePersonalization()
  const [newTopic, setNewTopic] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  return (
    <Panel isOpen={isOpen} onClose={onClose} title={t('ignore.title')} maxW="max-w-lg" maxH="max-h-[80vh]">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-github-text mb-3">{t('ignore.topics')}</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTopic.trim()) {
                  ignoreTopic(newTopic.trim().toLowerCase())
                  setNewTopic('')
                }
              }}
              placeholder={t('ignore.topicPlaceholder')}
              className="flex-1 px-3 py-2 bg-github-dark border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
            />
            <button
              onClick={() => {
                if (newTopic.trim()) {
                  ignoreTopic(newTopic.trim().toLowerCase())
                  setNewTopic('')
                }
              }}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('common.ignore')}
            </button>
          </div>

          {prefs.ignoredTopics.length === 0 ? (
            <p className="text-xs text-github-muted">{t('ignore.noTopics')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prefs.ignoredTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-600/20 rounded-full text-sm"
                >
                  <span className="text-xs">#</span>
                  {topic}
                  <button
                    onClick={() => unignoreTopic(topic)}
                    className="ml-1 text-red-400/60 hover:text-white focus:outline-none"
                    aria-label={t('ignore.stopTopic', { topic })}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-github-border">
          <h3 className="text-sm font-medium text-github-text mb-3">{t('ignore.languages')}</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newLanguage.trim()) {
                  ignoreLanguage(newLanguage.trim())
                  setNewLanguage('')
                }
              }}
              placeholder={t('ignore.languagePlaceholder')}
              className="flex-1 px-3 py-2 bg-github-dark border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
            />
            <button
              onClick={() => {
                if (newLanguage.trim()) {
                  ignoreLanguage(newLanguage.trim())
                  setNewLanguage('')
                }
              }}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('common.ignore')}
            </button>
          </div>

          {prefs.ignoredLanguages.length === 0 ? (
            <p className="text-xs text-github-muted">{t('ignore.noLanguages')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prefs.ignoredLanguages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-600/20 rounded-full text-sm"
                >
                  {language}
                  <button
                    onClick={() => unignoreLanguage(language)}
                    className="ml-1 text-red-400/60 hover:text-white focus:outline-none"
                    aria-label={t('ignore.stopLanguage', { language })}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

export default IgnoreListManager
