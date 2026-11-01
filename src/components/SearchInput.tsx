import { useState, useEffect, useRef } from 'react'
import { SearchIcon } from './Icons'
import { useI18n } from '../hooks/useI18n'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

function SearchInput({ value, onChange }: SearchInputProps) {
  const { t } = useI18n()
  const [inputValue, setInputValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  if (value !== prevValue) {
    setPrevValue(value)
    setInputValue(value)
  }

  useEffect(() => {
    if (inputValue === value) return
    timerRef.current = setTimeout(() => onChangeRef.current(inputValue), 400)
    return () => clearTimeout(timerRef.current)
  }, [inputValue, value])

  return (
    <div className="relative">
      <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-github-muted" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={t('search.placeholder')}
        className="w-full pl-10 pr-4 py-2 bg-github-darker border border-github-border rounded-lg text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
        aria-label={t('search.aria')}
      />
    </div>
  )
}

export default SearchInput
