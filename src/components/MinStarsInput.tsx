import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../hooks/useI18n'

interface MinStarsInputProps {
  value: number
  onChange: (value: number) => void
}

function formatValue(value: number): string {
  return value === 0 ? '' : String(value)
}

function MinStarsInput({ value, onChange }: MinStarsInputProps) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(() => formatValue(value))
  const [prevValue, setPrevValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(formatValue(value))
  }

  useEffect(() => {
    if (draft === formatValue(value)) return
    timerRef.current = setTimeout(() => {
      onChangeRef.current(parseInt(draft, 10) || 0)
    }, 400)
    return () => clearTimeout(timerRef.current)
  }, [draft, value])

  return (
    <>
      <label htmlFor="min-stars" className="text-sm text-github-muted">
        {t('minStars.label')}
      </label>
      <input
        id="min-stars"
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-20 px-2 py-1.5 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
        placeholder="0"
      />
    </>
  )
}

export default MinStarsInput
