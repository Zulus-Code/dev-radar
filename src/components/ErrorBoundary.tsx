import { Component, type ReactNode } from 'react'
import { useI18n } from '../hooks/useI18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function ErrorScreen({ error, onReload }: { error: Error | null; onReload: () => void }) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-github-dark p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-4xl font-bold text-github-accent">!</div>
        <h1 className="text-xl font-semibold text-github-text">{t('error.boundaryTitle')}</h1>
        <p className="text-sm text-github-muted">
          {error?.message || t('error.boundaryFallback')}
        </p>
        <button
          onClick={onReload}
          className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 focus:outline-none focus:ring-2 focus:ring-github-accent text-sm font-medium"
        >
          {t('error.reloadApp')}
        </button>
      </div>
    </div>
  )
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          error={this.state.error}
          onReload={() => {
            this.setState({ hasError: false, error: null })
            window.location.href = '/'
          }}
        />
      )
    }

    return this.props.children
  }
}
