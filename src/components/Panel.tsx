import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { CloseIcon } from './Icons'
import { useI18n } from '../hooks/useI18n'

interface PanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxW?: string
  maxH?: string
  footer?: ReactNode
  headerExtra?: ReactNode
}

function Panel({
  isOpen,
  onClose,
  title,
  children,
  maxW = 'max-w-4xl',
  maxH = 'max-h-[85vh]',
  footer,
  headerExtra,
}: PanelProps) {
  const { t } = useI18n()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${maxW} ${maxH} bg-github-darker border border-github-border rounded-xl shadow-2xl overflow-hidden flex flex-col focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-github-border">
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="text-lg font-semibold text-github-text">
              {title}
            </h2>
            {headerExtra}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
            aria-label={t('panel.close', { title })}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && <div className="p-4 border-t border-github-border">{footer}</div>}
      </div>
    </div>
  )
}

export default Panel
