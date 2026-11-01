import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAppearance } from '../hooks/useAppearance'
import { ACCENTS, ACCENT_ORDER } from '../lib/appearance'
import { useI18n } from '../hooks/useI18n'
import { usePersonalization } from '../hooks/usePersonalization'
import { useTrendsRevision } from '../hooks/useTrendDeltas'
import { getToken, setGitHubToken, clearGitHubToken } from '../lib/authStore'
import { validateToken } from '../lib/github'
import { formatDecimal, formatRelativeTime } from '../lib/utils'
import { getTrendStatus, isTauri } from '../lib/trendsStore'
import { savePreferences } from '../lib/userPreferences'
import { LANGUAGES } from '../lib/i18n'
import { SunIcon, MoonIcon, BackArrowIcon } from '../components/Icons'
import { openExternal } from '../lib/openExternal'

function Settings() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [hasExistingToken, setHasExistingToken] = useState(() => getToken() !== null)
  const { theme, toggleTheme } = useTheme()
  const { accent, density, setAccent, setDensity } = useAppearance()
  const { t, tPlural, lang, setLang } = useI18n()
  const { prefs } = usePersonalization()
  const trendsRevision = useTrendsRevision()
  const trendsAvailable = isTauri()
  const [trendStatus, setTrendStatus] = useState<{
    tracked: number
    lastSyncAt: string | null
  } | null>(null)

  useEffect(() => {
    if (!trendsAvailable) return
    let cancelled = false
    void getTrendStatus().then((status) => {
      if (!cancelled) setTrendStatus(status)
    })
    return () => {
      cancelled = true
    }
  }, [trendsAvailable, trendsRevision])

  const handleSave = async () => {
    const trimmed = token.trim()
    if (!trimmed) {
      clearGitHubToken()
      setHasExistingToken(false)
      setTokenError(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }

    setIsValidating(true)
    setTokenError(null)
    try {
      const result = await validateToken(trimmed)
      if (!result.ok) {
        if (result.status === 401) {
          setTokenError(t('settings.tokenInvalid'))
        } else if (result.status !== undefined) {
          setTokenError(t('settings.tokenHttpError', { status: result.status }))
        } else {
          setTokenError(t('settings.tokenNetworkError'))
        }
        return
      }
      setGitHubToken(trimmed)
      setHasExistingToken(true)
      setToken('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-github-dark/95 backdrop-blur-sm border-b border-github-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
            aria-label={t('settings.back')}
          >
            <BackArrowIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-github-text">{t('settings.title')}</h1>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={t('theme.switchTo', {
                mode: t(theme === 'dark' ? 'theme.light' : 'theme.dark'),
              })}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">{t('settings.languageHeading')}</h2>
          <p className="text-sm text-github-muted">{t('settings.languageHelp')}</p>
          <div className="flex gap-2" role="group" aria-label={t('settings.languageHeading')}>
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                // shortcut: interface language lives in localStorage for now;
                // Phase 3 moves it into the SQLite settings table with the rest of the prefs.
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                  lang === code
                    ? 'bg-github-accent text-white'
                    : 'bg-github-border text-github-muted hover:text-github-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">{t('appearance.heading')}</h2>
          <p className="text-sm text-github-muted">{t('appearance.help')}</p>
          <div className="space-y-2">
            <span className="text-sm text-github-text block">{t('appearance.accent')}</span>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t('appearance.accent')}
            >
              {ACCENT_ORDER.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccent(color)}
                  aria-pressed={accent === color}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                    accent === color
                      ? 'bg-github-accent/20 text-github-text'
                      : 'bg-github-border text-github-muted hover:text-github-text'
                  }`}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: ACCENTS[color].hex }}
                    aria-hidden="true"
                  />
                  {t(ACCENTS[color].label)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-github-text block">{t('appearance.density')}</span>
            <div
              className="flex gap-2"
              role="group"
              aria-label={t('appearance.density')}
            >
              {(['comfortable', 'compact'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setDensity(option)}
                  aria-pressed={density === option}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                    density === option
                      ? 'bg-github-accent text-white'
                      : 'bg-github-border text-github-muted hover:text-github-text'
                  }`}
                >
                  {t(option === 'compact' ? 'appearance.compact' : 'appearance.comfortable')}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">{t('settings.tokenHeading')}</h2>
          <p className="text-sm text-github-muted">
            {t('settings.tokenHelp')}{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                event.preventDefault()
                openExternal('https://github.com/settings/tokens')
              }}
              className="text-github-accent hover:underline"
            >
              github.com/settings/tokens
            </a>
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={
                hasExistingToken
                  ? t('settings.tokenPlaceholderSaved')
                  : 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
              }
              className="flex-1 px-4 py-2 bg-github-dark border border-github-border rounded-lg text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
              aria-label={t('settings.tokenHeading')}
            />
            <button
              onClick={handleSave}
              disabled={isValidating}
              className="px-6 py-2 bg-github-green text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? t('settings.validating') : t('settings.save')}
            </button>
          </div>
          {saved && <p className="text-sm text-green-400">{t('settings.tokenSaved')}</p>}
          {tokenError && (
            <p className="text-sm text-red-400" role="alert">
              {tokenError}
            </p>
          )}
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">{t('settings.trendsHeading')}</h2>
          {trendsAvailable ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.statsEnabled}
                onChange={(event) => savePreferences({ statsEnabled: event.target.checked })}
                className="h-4 w-4 accent-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent"
              />
              <span className="text-sm text-github-text">{t('settings.statsEnabled')}</span>
            </label>
          ) : (
            <p className="text-sm text-github-muted">{t('settings.trendsUnavailable')}</p>
          )}
          <p className="text-sm text-github-muted">{t('settings.statsEnabledHelp')}</p>
          <div className="space-y-2 text-sm text-github-muted">
            <p>
              {tPlural('settings.trackedRepos', trendStatus?.tracked ?? 0)}
            </p>
            <p>
              {t('settings.lastSync', {
                time: trendStatus?.lastSyncAt
                  ? formatRelativeTime(trendStatus.lastSyncAt, lang)
                  : '—',
              })}
            </p>
          </div>
          {trendsAvailable && !hasExistingToken && (
            <p className="text-sm text-yellow-400" role="status">
              {t('settings.trendsTokenHint')}
            </p>
          )}
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">{t('settings.rateLimits')}</h2>
          <div className="space-y-2 text-sm text-github-muted">
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>{t('settings.unauthenticated')}</span>
              <span className="text-github-text">
                {t('settings.requestsPerHour', { count: formatDecimal(60, lang) })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>{t('settings.withPat')}</span>
              <span className="text-github-text">
                {t('settings.requestsPerHour', { count: formatDecimal(5000, lang) })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t('settings.withGitHubApp')}</span>
              <span className="text-github-text">
                {t('settings.requestsPerHour', { count: formatDecimal(15000, lang) })}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Settings
