import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Settings = lazy(() => import('./pages/Settings'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-github-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-github-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-github-muted text-sm">Loading...</p>
      </div>
    </div>
  )
}

function App() {
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
