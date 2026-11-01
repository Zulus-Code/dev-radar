import { useContext } from 'react'
import { I18nContext } from '../lib/i18n'
import type { I18nContextValue } from '../lib/i18n'

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
