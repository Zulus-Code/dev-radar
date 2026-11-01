import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { StarDelta } from '../lib/trends'
import {
  getStarDeltas,
  getTrendsRevision,
  isTauri,
  subscribeTrends,
} from '../lib/trendsStore'

export function useTrendsRevision(): number {
  return useSyncExternalStore(subscribeTrends, getTrendsRevision, getTrendsRevision)
}

const EMPTY: Map<number, StarDelta> = new Map()

/**
 * Star deltas for the repos on screen. Outside Tauri (web build, jsdom) it
 * stays empty, so every consumer degrades to «no history».
 */
export function useTrendDeltas(repoIds: number[]): Map<number, StarDelta> {
  const revision = useTrendsRevision()
  const idsKey = useMemo(() => repoIds.join(','), [repoIds])
  const [deltas, setDeltas] = useState<Map<number, StarDelta>>(EMPTY)

  useEffect(() => {
    if (!isTauri() || !idsKey) return
    let cancelled = false
    void getStarDeltas(idsKey.split(',').map(Number)).then((result) => {
      if (!cancelled) setDeltas(result)
    })
    return () => {
      cancelled = true
    }
  }, [idsKey, revision])

  return deltas
}
