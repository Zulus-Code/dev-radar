import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useI18n } from './hooks/useI18n'
import { runStartupSync } from './lib/trendsSync'

const Home = lazy(() => import('./pages/Home'))
const Settings = lazy(() => import('./pages/Settings'))

function LoadingFallback() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-github-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-github-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-github-muted text-sm">{t('common.loading')}</p>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    void runStartupSync()
  }, [])

  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
