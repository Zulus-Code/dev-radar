import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { useFilters } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'

function createWrapper(initialEntries: string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  }
}

describe('useFilters URL parsing', () => {
  it('falls back to the default time range for invalid values', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?timeRange=year']),
    })
    expect(result.current.filters.timeRange).toBe('week')
  })

  it('falls back to all for invalid license types', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?licenseType=EVIL']),
    })
    expect(result.current.filters.licenseType).toBe('all')
  })

  it('accepts known specific licenses and pseudo values', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?licenseType=MIT']),
    })
    expect(result.current.filters.licenseType).toBe('MIT')

    const { result: openSource } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?licenseType=open_source']),
    })
    expect(openSource.current.filters.licenseType).toBe('open_source')
  })

  it('normalizes invalid minStars to zero', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?minStars=abc']),
    })
    expect(result.current.filters.minStars).toBe(0)

    const { result: negative } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?minStars=-5']),
    })
    expect(negative.current.filters.minStars).toBe(0)
  })

  it('reads max stars, creation age and good-first-issues', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?maxStars=500&createdDays=90&gfi=true']),
    })
    expect(result.current.filters.maxStars).toBe(500)
    expect(result.current.filters.createdWithinDays).toBe(90)
    expect(result.current.filters.goodFirstIssues).toBe(true)
  })

  it('normalizes invalid max stars and creation age to zero', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?maxStars=abc&createdDays=-5&gfi=yes']),
    })
    expect(result.current.filters.maxStars).toBe(0)
    expect(result.current.filters.createdWithinDays).toBe(0)
    expect(result.current.filters.goodFirstIssues).toBe(false)
  })

  it('drops unknown developer filters', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?developerFilters=bogus&developerFilters=ai_related']),
    })
    expect(result.current.filters.developerFilters).toEqual(['ai_related'])
  })
  it('canonicalizes list params for stable cache keys', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?language=Go&language=Ada&topics=z&topics=a&topics=z']),
    })
    expect(result.current.filters.language).toEqual(['Ada', 'Go'])
    expect(result.current.filters.topics).toEqual(['a', 'z'])
  })

  it('falls back for invalid readme language', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?readmeLanguage=klingon']),
    })
    expect(result.current.filters.readmeLanguage).toBe('all')
  })

  it('resetFilters clears filters but preserves sort and order', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: createWrapper(['/?keyword=react&sort=forks&order=asc&minStars=100']),
    })
    act(() => {
      result.current.resetFilters()
    })
    expect(result.current.filters.keyword).toBe('')
    expect(result.current.filters.minStars).toBe(0)
    expect(result.current.activeFilterCount).toBe(0)
  })
})

describe('useSort URL parsing', () => {
  it('falls back to the default field for invalid sort values', () => {
    const { result } = renderHook(() => useSort(), {
      wrapper: createWrapper(['/?sort=bogus']),
    })
    expect(result.current.sort.field).toBe('stars')
  })

  it('falls back to desc for invalid order values', () => {
    const { result } = renderHook(() => useSort(), {
      wrapper: createWrapper(['/?order=sideways']),
    })
    expect(result.current.sort.order).toBe('desc')
  })

  it('preserves sort and order after filters are reset', () => {
    const { result } = renderHook(
      () => ({ filters: useFilters(), sort: useSort() }),
      { wrapper: createWrapper(['/?keyword=x&sort=forks&order=asc']) },
    )
    act(() => {
      result.current.filters.resetFilters()
    })
    expect(result.current.sort.sort.field).toBe('forks')
    expect(result.current.sort.sort.order).toBe('asc')
  })
})
