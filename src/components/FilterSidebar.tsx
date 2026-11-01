import { useState } from 'react'
import { useFilters } from '../hooks/useFilters'
import { TIME_RANGES, COMMON_LICENSES, DEVELOPER_FILTERS } from '../lib/constants'
import type { TimeRange } from '../lib/constants'
import type { DeveloperFilter } from '../hooks/useFilters'
import { requiresTokenFor } from '../lib/developerFilters'
import { useI18n } from '../hooks/useI18n'
import SearchInput from './SearchInput'
import LicenseLegend from './LicenseLegend'
import { LANGUAGE_COLORS } from '../lib/languageColors'
import { CloseIcon, ChevronDownIcon } from './Icons'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_LANGUAGES = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Java', 'C++', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'Dart', 'Vue', 'Svelte', 'Shell', 'Lua', 'Scala',
]

interface SectionHeaderProps {
  title: string
  section: string
  rightElement?: React.ReactNode
  collapsed: boolean
  onToggle: (section: string) => void
}

function SectionHeader({ title, section, rightElement, collapsed, onToggle }: SectionHeaderProps) {
  return (
    <div className="flex items-center w-full py-2">
      <button
        onClick={() => onToggle(section)}
        className="flex items-center justify-between flex-1 text-sm font-semibold text-github-text hover:text-github-accent transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>
      {rightElement && <div className="ml-2">{rightElement}</div>}
    </div>
  )
}

function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const { t } = useI18n()
  const { filters, updateFilters, resetFilters, activeFilterCount } = useFilters()
  const [topicInput, setTopicInput] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    time: false,
    language: false,
    license: false,
    stars: false,
    topics: false,
    developer: false,
    misc: false,
  })

  const handleTopicAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault()
      const newTopics = [...filters.topics, topicInput.trim()]
      updateFilters({ topics: newTopics })
      setTopicInput('')
    }
  }

  const removeTopic = (topic: string) => {
    updateFilters({ topics: filters.topics.filter((t) => t !== topic) })
  }

  const toggleLanguage = (lang: string) => {
    const exists = filters.language.includes(lang)
    updateFilters({
      language: exists
        ? filters.language.filter((l) => l !== lang)
        : [...filters.language, lang],
    })
  }

  const toggleDeveloperFilter = (filter: DeveloperFilter) => {
    const exists = filters.developerFilters.includes(filter)
    updateFilters({
      developerFilters: exists
        ? filters.developerFilters.filter((f) => f !== filter)
        : [...filters.developerFilters, filter],
    })
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-72 bg-github-darker border-r border-github-border overflow-y-auto transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="text-lg font-semibold text-github-text">{t('filters.title')}</span>
            <button
              onClick={onClose}
              className="p-1 text-github-muted hover:text-github-text"
              aria-label={t('filters.close')}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mb-4">
            <SearchInput
              value={filters.keyword}
              onChange={(value) => updateFilters({ keyword: value })}
            />
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={t('filters.timeRange')}
              section="time"
              collapsed={collapsedSections.time}
              onToggle={toggleSection}
            />
            {!collapsedSections.time && (
              <div className="flex gap-1.5 mt-2">
                {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => updateFilters({ timeRange: key as TimeRange })}
                    className={`flex-1 px-1 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                      filters.timeRange === key
                        ? 'bg-github-accent text-white'
                        : 'bg-github-border text-github-muted hover:text-github-text'
                    }`}
                    aria-pressed={filters.timeRange === key}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={`${t('filters.language')}${filters.language.length > 0 ? ` (${filters.language.length})` : ''}`}
              section="language"
              collapsed={collapsedSections.language}
              onToggle={toggleSection}
            />
            {!collapsedSections.language && (
              <div className="relative mt-2">
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                  {POPULAR_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-2 py-1 rounded text-xs text-left transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent flex items-center gap-1.5 ${
                        filters.language.includes(lang)
                          ? 'bg-github-accent text-white'
                          : 'text-github-muted hover:bg-github-border'
                      }`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#8b949e' }}
                        aria-hidden="true"
                      />
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={t('filters.license')}
              section="license"
              rightElement={<LicenseLegend />}
              collapsed={collapsedSections.license}
              onToggle={toggleSection}
            />
            {!collapsedSections.license && (
              <div className="mt-2">
                <select
                  value={filters.licenseType}
                  onChange={(e) => updateFilters({ licenseType: e.target.value })}
                  className="w-full px-2 py-1.5 bg-github-dark border border-github-border rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent cursor-pointer"
                  aria-label={t('filters.licenseAria')}
                >
                  <option value="all">{t('filters.allLicenses')}</option>
                  <option value="open_source">{t('filters.openSourceOnly')}</option>
                  <option value="no_license">{t('filters.noLicenseOption')}</option>
                  <optgroup label={t('filters.specific')}>
                    {COMMON_LICENSES.map((license) => (
                      <option key={license} value={license}>
                        {license}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={t('filters.topics')}
              section="topics"
              collapsed={collapsedSections.topics}
              onToggle={toggleSection}
            />
            {!collapsedSections.topics && (
              <div className="mt-2 space-y-2">
                {filters.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {filters.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-github-accent/20 text-github-accent rounded-full text-xs"
                      >
                        {topic}
                        <button
                          onClick={() => removeTopic(topic)}
                          className="ml-1 hover:text-white focus:outline-none"
                          aria-label={t('filters.removeTopic', { topic })}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTopicAdd}
                  placeholder={t('filters.addTopicPlaceholder')}
                  className="w-full px-2 py-1.5 bg-github-dark border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
                  aria-label={t('filters.addTopicAria')}
                />
              </div>
            )}
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={t('filters.developerFilters')}
              section="developer"
              collapsed={collapsedSections.developer}
              onToggle={toggleSection}
            />
            {!collapsedSections.developer && (
              <div className="mt-2 space-y-1">
                {Object.entries(DEVELOPER_FILTERS).map(([key, { label, icon }]) => {
                  const isActive = filters.developerFilters.includes(key as DeveloperFilter)
                  const needsToken = requiresTokenFor(key as DeveloperFilter)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleDeveloperFilter(key as DeveloperFilter)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                        isActive
                          ? 'bg-github-accent/20 text-github-accent'
                          : 'text-github-muted hover:bg-github-border hover:text-github-text'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{t(label)}</span>
                      {needsToken && (
                        <span
                          className="ml-auto text-[10px] px-1 py-0.5 rounded bg-github-border text-github-muted"
                          title={t('filters.patHint')}
                        >
                          PAT
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-b border-github-border pb-3">
            <SectionHeader
              title={t('filters.options')}
              section="misc"
              collapsed={collapsedSections.misc}
              onToggle={toggleSection}
            />
            {!collapsedSections.misc && (
              <div className="mt-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includeArchived}
                    onChange={(e) => updateFilters({ includeArchived: e.target.checked })}
                    className="w-4 h-4 rounded border-github-border bg-github-dark text-github-accent focus:ring-github-accent focus:ring-offset-0"
                  />
                  <span className="text-sm text-github-muted">{t('filters.includeArchived')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includeForks}
                    onChange={(e) => updateFilters({ includeForks: e.target.checked })}
                    className="w-4 h-4 rounded border-github-border bg-github-dark text-github-accent focus:ring-github-accent focus:ring-offset-0"
                  />
                  <span className="text-sm text-github-muted">{t('filters.includeForks')}</span>
                </label>
                <div>
                  <span className="text-sm text-github-muted block mb-1">{t('filters.readme')}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateFilters({ readmeLanguage: 'all' })}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                        filters.readmeLanguage === 'all'
                          ? 'bg-github-accent text-white'
                          : 'bg-github-border text-github-muted hover:text-github-text'
                      }`}
                      aria-pressed={filters.readmeLanguage === 'all'}
                    >
                      {t('filters.readmeAll')}
                    </button>
                    <button
                      onClick={() => updateFilters({ readmeLanguage: 'english' })}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                        filters.readmeLanguage === 'english'
                          ? 'bg-github-accent text-white'
                          : 'bg-github-border text-github-muted hover:text-github-text'
                      }`}
                      aria-pressed={filters.readmeLanguage === 'english'}
                    >
                      {t('filters.readmeEnglish')}
                    </button>
                  </div>
                  {filters.readmeLanguage === 'english' && (
                    <p className="text-xs text-github-muted/70 mt-1">
                      {t('filters.readmeTokenHint')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full mt-2 px-3 py-2 text-sm font-medium text-github-accent hover:bg-github-accent/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              {t('filters.resetAll', { count: activeFilterCount })}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default FilterSidebar
