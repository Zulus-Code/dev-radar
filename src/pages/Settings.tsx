import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'
import { getToken, setGitHubToken, clearGitHubToken } from '../lib/authStore'
import { validateToken } from '../lib/github'
import { formatDecimal } from '../lib/utils'
import { SunIcon, MoonIcon, BackArrowIcon } from '../components/Icons'
import { openExternal } from '../lib/openExternal'

function Settings() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [hasExistingToken, setHasExistingToken] = useState(() => getToken() !== null)
  const { theme, toggleTheme } = useTheme()
  const { t, lang } = useI18n()

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
