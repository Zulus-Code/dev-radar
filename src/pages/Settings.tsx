import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { getToken, setGitHubToken, clearGitHubToken } from '../lib/authStore'
import { validateToken } from '../lib/github'
import { SunIcon, MoonIcon, BackArrowIcon } from '../components/Icons'
import { openExternal } from '../lib/openExternal'

function Settings() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [hasExistingToken, setHasExistingToken] = useState(() => getToken() !== null)
  const { theme, toggleTheme } = useTheme()

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
          setTokenError(
            'Invalid token — GitHub rejected it (401 Bad credentials). Check for typos or expired tokens.',
          )
        } else if (result.status !== undefined) {
          setTokenError(`GitHub could not validate this token (HTTP ${result.status}).`)
        } else {
          setTokenError('Could not reach GitHub to validate the token. Check your connection and try again.')
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
            aria-label="Back to home"
          >
            <BackArrowIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-github-text">Settings</h1>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">GitHub Personal Access Token</h2>
          <p className="text-sm text-github-muted">
            Add a PAT to increase your API rate limit from 60 to 5,000 requests per hour
            (Core API), and from 10 to 30 requests per minute (Search API).
            Generate one at{' '}
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
              placeholder={hasExistingToken ? 'Token saved — enter a new one to replace it' : 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              className="flex-1 px-4 py-2 bg-github-dark border border-github-border rounded-lg text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
              aria-label="GitHub Personal Access Token"
            />
            <button
              onClick={handleSave}
              disabled={isValidating}
              className="px-6 py-2 bg-github-green text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating…' : 'Save'}
            </button>
          </div>
          {saved && <p className="text-sm text-green-400">Token saved successfully!</p>}
          {tokenError && (
            <p className="text-sm text-red-400" role="alert">
              {tokenError}
            </p>
          )}
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">About Rate Limits</h2>
          <div className="space-y-2 text-sm text-github-muted">
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>Unauthenticated</span>
              <span className="text-github-text">60 requests/hour</span>
            </div>
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>With Personal Access Token</span>
              <span className="text-github-text">5,000 requests/hour</span>
            </div>
            <div className="flex justify-between py-2">
              <span>With GitHub App</span>
              <span className="text-github-text">15,000 requests/hour</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Settings
