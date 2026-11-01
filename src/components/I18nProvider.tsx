import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  I18nContext,
  persistLang,
  resolveInitialLang,
  translate,
  translatePlural,
} from '../lib/i18n'
import type {
  I18nContextValue,
  Lang,
  PluralKey,
  TranslationKey,
  TranslationParams,
} from '../lib/i18n'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    persistLang(lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(lang, key, params),
    [lang],
  )

  const tPlural = useCallback(
    (baseKey: PluralKey, count: number, params?: TranslationParams) =>
      translatePlural(lang, baseKey, count, params),
    [lang],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t, tPlural }),
    [lang, setLang, t, tPlural],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
