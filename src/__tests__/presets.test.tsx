import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { DEFAULT_FILTERS, useFilters } from '../hooks/useFilters'
import type { FilterState } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'
import {
  BUILT_IN_PRESETS,
  MAX_PRESETS,
  MAX_PRESET_NAME_LENGTH,
  buildPresetParams,
} from '../lib/presets'
import {
  addUserPreset,
  deleteUserPreset,
  getPresetsSnapshot,
  reloadPresets,
} from '../lib/userPreferences'

let uuidCounter = 0

function stateFromParams(params: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/?${params}`]}>{children}</MemoryRouter>
  )
  return renderHook(() => ({ filters: useFilters().filters, sort: useSort().sort }), {
    wrapper,
  }).result.current
}

beforeEach(() => {
  localStorage.clear()
  reloadPresets()
  uuidCounter = 0
  vi.stubGlobal('crypto', {
    randomUUID: () => `preset-${++uuidCounter}`,
  })
})

describe('built-in presets', () => {
  it('lists the three built-ins in order with their canonical params', () => {
    expect(BUILT_IN_PRESETS.map((preset) => preset.nameKey)).toEqual([
      'preset.youngProject',
      'preset.goodFirstIssue',
      'preset.noStarLeader',
    ])
    expect(BUILT_IN_PRESETS.map((preset) => preset.params)).toEqual([
      'createdDays=90&minStars=10&maxStars=500&sort=updated&order=desc',
      'gfi=true&minStars=10&maxStars=2000&sort=stars&order=desc',
      'timeRange=month&minStars=50&maxStars=2000&sort=stars&order=desc',
    ])
  })

  it('applies the young-project preset to filters and sort', () => {
    const state = stateFromParams(BUILT_IN_PRESETS[0].params)
    expect(state.filters.createdWithinDays).toBe(90)
    expect(state.filters.minStars).toBe(10)
    expect(state.filters.maxStars).toBe(500)
    expect(state.filters.timeRange).toBe('week')
    expect(state.sort).toEqual({ field: 'updated', order: 'desc' })
  })

  it('applies the good-first-issue preset', () => {
    const state = stateFromParams(BUILT_IN_PRESETS[1].params)
    expect(state.filters.goodFirstIssues).toBe(true)
    expect(state.filters.minStars).toBe(10)
    expect(state.filters.maxStars).toBe(2000)
    expect(state.sort).toEqual({ field: 'stars', order: 'desc' })
  })

  it('applies the no-star-leader preset with the month window', () => {
    const state = stateFromParams(BUILT_IN_PRESETS[2].params)
    expect(state.filters.timeRange).toBe('month')
    expect(state.filters.minStars).toBe(50)
    expect(state.filters.maxStars).toBe(2000)
    expect(state.sort).toEqual({ field: 'stars', order: 'desc' })
  })
})

describe('user presets', () => {
  it('round-trips filters and sort through localStorage', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      timeRange: 'month',
      language: ['Rust'],
      licenseType: 'MIT',
      minStars: 20,
      maxStars: 1500,
      createdWithinDays: 30,
      goodFirstIssues: true,
      topics: ['cli'],
      includeForks: true,
      keyword: 'tui',
      developerFilters: ['ai_related'],
    }
    const sort = { field: 'forks', order: 'asc' } as const
    const params = buildPresetParams(filters, sort)

    const saved = addUserPreset('  My stack  ', params)
    expect(saved?.name).toBe('My stack')
    expect(saved?.params).toBe(params)

    reloadPresets()
    const stored = getPresetsSnapshot()
    expect(stored).toHaveLength(1)

    const state = stateFromParams(stored[0].params)
    expect(state.filters).toEqual(filters)
    expect(state.sort).toEqual(sort)
  })

  it('trims names to 40 characters', () => {
    const saved = addUserPreset(`  ${'x'.repeat(60)}  `, 'minStars=5')
    expect(saved?.name).toHaveLength(MAX_PRESET_NAME_LENGTH)
    expect(saved?.name).toBe('x'.repeat(MAX_PRESET_NAME_LENGTH))
  })

  it('rejects empty names', () => {
    expect(addUserPreset('   ', 'minStars=5')).toBeNull()
    expect(getPresetsSnapshot()).toHaveLength(0)
  })

  it('allows duplicate names but keeps unique ids', () => {
    addUserPreset('Same', 'minStars=5')
    addUserPreset('Same', 'minStars=10')
    const stored = getPresetsSnapshot()
    expect(stored).toHaveLength(2)
    expect(stored[0].id).not.toBe(stored[1].id)
  })

  it('caps the list at 20 presets', () => {
    for (let i = 0; i < MAX_PRESETS; i++) {
      expect(addUserPreset(`Preset ${i}`, 'minStars=5')).not.toBeNull()
    }
    expect(addUserPreset('One too many', 'minStars=5')).toBeNull()
    reloadPresets()
    expect(getPresetsSnapshot()).toHaveLength(MAX_PRESETS)
  })

  it('deletes a preset and persists the removal', () => {
    const saved = addUserPreset('Temporary', 'minStars=5')
    expect(saved).not.toBeNull()
    deleteUserPreset(saved!.id)
    reloadPresets()
    expect(getPresetsSnapshot()).toHaveLength(0)
  })

  it('drops malformed rows instead of failing the whole list', () => {
    localStorage.setItem(
      'dev_radar_presets',
      JSON.stringify([
        { id: 1, name: 'bad id', params: '' },
        { id: 'ok-id', name: '   ', params: '' },
        { id: 'good-id', name: '  Fine  ', params: 'minStars=5' },
      ]),
    )
    reloadPresets()
    expect(getPresetsSnapshot()).toEqual([
      { id: 'good-id', name: 'Fine', params: 'minStars=5', builtIn: false },
    ])
  })
})
