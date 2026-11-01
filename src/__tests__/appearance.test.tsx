import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAppearance } from '../hooks/useAppearance'
import {
  getPreferencesSnapshot,
  reloadPreferences,
  savePreferences,
} from '../lib/userPreferences'

function accentVariable(): string {
  return document.documentElement.style.getPropertyValue('--github-accent-rgb').trim()
}

beforeEach(() => {
  localStorage.clear()
  reloadPreferences()
  document.documentElement.style.removeProperty('--github-accent-rgb')
  document.documentElement.classList.remove('density-compact')
})

describe('appearance preferences', () => {
  it('defaults to blue accent and comfortable density', () => {
    expect(getPreferencesSnapshot().accent).toBe('blue')
    expect(getPreferencesSnapshot().density).toBe('comfortable')

    const { result } = renderHook(() => useAppearance())
    expect(result.current.accent).toBe('blue')
    expect(result.current.density).toBe('comfortable')
    expect(accentVariable()).toBe('88 166 255')
    expect(document.documentElement.classList.contains('density-compact')).toBe(false)
  })

  it('applies and persists accent changes', () => {
    const { result } = renderHook(() => useAppearance())

    act(() => result.current.setAccent('amber'))

    expect(result.current.accent).toBe('amber')
    expect(accentVariable()).toBe('210 153 34')
    expect(getPreferencesSnapshot().accent).toBe('amber')

    reloadPreferences()
    expect(getPreferencesSnapshot().accent).toBe('amber')
  })

  it('applies and persists compact density', () => {
    const { result } = renderHook(() => useAppearance())

    act(() => result.current.setDensity('compact'))

    expect(document.documentElement.classList.contains('density-compact')).toBe(true)
    expect(getPreferencesSnapshot().density).toBe('compact')

    reloadPreferences()
    expect(getPreferencesSnapshot().density).toBe('compact')
  })

  it('reapplies saved appearance after a restart', () => {
    savePreferences({ accent: 'violet', density: 'compact' })
    reloadPreferences()

    renderHook(() => useAppearance())
    expect(accentVariable()).toBe('163 113 247')
    expect(document.documentElement.classList.contains('density-compact')).toBe(true)

    // Simulate a fresh webview: in-memory defaults out, storage remains.
    document.documentElement.style.removeProperty('--github-accent-rgb')
    document.documentElement.classList.remove('density-compact')
    reloadPreferences()
    renderHook(() => useAppearance())
    expect(accentVariable()).toBe('163 113 247')
    expect(document.documentElement.classList.contains('density-compact')).toBe(true)
  })

  it('falls back for invalid stored appearance values', () => {
    localStorage.setItem(
      'github_dashboard_preferences',
      JSON.stringify({ accent: 'neon', density: 'tiny' }),
    )
    reloadPreferences()
    expect(getPreferencesSnapshot().accent).toBe('blue')
    expect(getPreferencesSnapshot().density).toBe('comfortable')
  })
})
