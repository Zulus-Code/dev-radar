import { beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DICTIONARIES,
  LANGUAGE_STORAGE_KEY,
  resolveInitialLang,
  translate,
  translatePlural,
} from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import { I18nProvider } from '../components/I18nProvider'
import { useI18n } from '../hooks/useI18n'
import { formatNumber, formatRelativeTime } from '../lib/utils'

const RU = DICTIONARIES.ru as Record<string, string>
const EN = DICTIONARIES.en as Record<string, string>

beforeEach(() => {
  localStorage.clear()
})

describe('dictionaries', () => {
  it('has exactly the same keys in ru and en', () => {
    const ruKeys = Object.keys(RU).sort()
    const enKeys = Object.keys(EN).sort()
    expect(ruKeys.filter((key) => !EN[key])).toEqual([])
    expect(enKeys.filter((key) => !RU[key])).toEqual([])
    expect(ruKeys).toEqual(enKeys)
  })

  it('has no empty translations', () => {
    for (const key of Object.keys(EN)) {
      expect(EN[key], `en:${key}`).not.toBe('')
      expect(RU[key], `ru:${key}`).not.toBe('')
    }
  })

  it('keeps interpolation placeholders identical across languages', () => {
    const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort()
    for (const key of Object.keys(EN)) {
      expect(placeholders(RU[key]), key).toEqual(placeholders(EN[key]))
    }
  })
})

describe('interpolation', () => {
  it('substitutes named params', () => {
    expect(translate('en', 'filters.removeTopic', { topic: 'react' })).toBe('Remove topic react')
    expect(translate('ru', 'filters.removeTopic', { topic: 'react' })).toBe('Удалить тему react')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'panel.close', {})).toBe('Close {title} panel')
  })
})

describe('plural forms', () => {
  it('picks ru plural categories for 1, 2, 5, 11 and 21', () => {
    expect(translatePlural('ru', 'collections.count', 1)).toBe('1 коллекция')
    expect(translatePlural('ru', 'collections.count', 2)).toBe('2 коллекции')
    expect(translatePlural('ru', 'collections.count', 5)).toBe('5 коллекций')
    expect(translatePlural('ru', 'collections.count', 11)).toBe('11 коллекций')
    expect(translatePlural('ru', 'collections.count', 21)).toBe('21 коллекция')
  })

  it('picks en plural categories', () => {
    expect(translatePlural('en', 'collections.count', 1)).toBe('1 collection')
    expect(translatePlural('en', 'collections.count', 2)).toBe('2 collections')
    expect(translatePlural('en', 'collections.count', 5)).toBe('5 collections')
  })

  it('interpolates extra params alongside the count', () => {
    expect(translatePlural('ru', 'collections.repoMeta', 3, { date: '01.02.2025' })).toBe(
      '3 репозитория · Обновлено 01.02.2025',
    )
  })
})

describe('initial language', () => {
  it('follows a Russian OS locale', () => {
    expect(resolveInitialLang('ru-RU')).toBe('ru')
    expect(resolveInitialLang('ru')).toBe('ru')
  })

  it('falls back to English for other locales', () => {
    expect(resolveInitialLang('en-US')).toBe('en')
    expect(resolveInitialLang('de-DE')).toBe('en')
  })

  it('prefers the stored choice over the OS locale', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru')
    expect(resolveInitialLang('en-US')).toBe('ru')
  })

  it('ignores an invalid stored value', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(resolveInitialLang('ru-RU')).toBe('ru')
  })
})

function Probe() {
  const { lang, setLang, t, tPlural } = useI18n()
  return createElement(
    'div',
    null,
    createElement('span', { 'data-testid': 'lang' }, lang),
    createElement('span', { 'data-testid': 'title' }, t('filters.title')),
    createElement('span', { 'data-testid': 'plural' }, tPlural('collections.count', 5)),
    createElement('button', { onClick: () => setLang('ru') }, 'switch-ru'),
  )
}

describe('I18nProvider', () => {
  it('renders English by default and switches to Russian instantly', async () => {
    render(createElement(I18nProvider, null, createElement(Probe)))

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('title')).toHaveTextContent('Filters')
    expect(screen.getByTestId('plural')).toHaveTextContent('5 collections')

    await userEvent.click(screen.getByRole('button', { name: 'switch-ru' }))

    expect(screen.getByTestId('lang')).toHaveTextContent('ru')
    expect(screen.getByTestId('title')).toHaveTextContent('Фильтры')
    expect(screen.getByTestId('plural')).toHaveTextContent('5 коллекций')
  })

  it('persists the choice and syncs <html lang>', async () => {
    render(createElement(I18nProvider, null, createElement(Probe)))
    await userEvent.click(screen.getByRole('button', { name: 'switch-ru' }))

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru')
    expect(document.documentElement.lang).toBe('ru')
  })

  it('starts in the stored language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru')
    render(createElement(I18nProvider, null, createElement(Probe)))
    expect(screen.getByTestId('title')).toHaveTextContent('Фильтры')
  })
})

describe('locale-aware formatting', () => {
  it('formats compact numbers per language', () => {
    expect(formatNumber(1500, 'en')).toBe('1.5k')
    expect(formatNumber(1500, 'ru')).toMatch(/^1,5\sтыс\.$/)
    expect(formatNumber(500, 'en')).toBe('500')
  })

  it('formats relative time per language', () => {
    const lang: Lang = 'ru'
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeHoursAgo, lang)).toContain('назад')
    expect(formatRelativeTime(threeHoursAgo, 'en')).toContain('ago')
  })
})
