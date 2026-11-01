import { useState, useRef, useMemo } from 'react'
import { LICENSE_LEGEND, CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/licenseLegend'
import type { LicenseInfo } from '../lib/licenseLegend'
import { useClickOutside } from '../hooks/useClickOutside'
import { useI18n } from '../hooks/useI18n'

function LicenseLegend() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useClickOutside(panelRef, isOpen, () => setIsOpen(false))

  const grouped = useMemo(() => LICENSE_LEGEND.reduce<Record<string, LicenseInfo[]>>(
    (acc, license) => {
      const cat = license.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(license)
      return acc
    },
    {},
  ), [])

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-github-accent text-white hover:bg-github-accent/90 focus:outline-none focus:ring-2 focus:ring-github-accent transition-colors font-bold text-sm"
        aria-label={t('license.legendAria')}
        aria-expanded={isOpen}
        title={t('license.guideTitle')}
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-60 bg-github-dark border border-github-border rounded-xl shadow-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold text-github-text mb-3">
            {t('license.guideHeading')}
          </h3>

          {Object.entries(grouped).map(([category, licenses]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h4
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${CATEGORY_COLORS[category as LicenseInfo['category']]}`}
              >
                {t(CATEGORY_LABELS[category as LicenseInfo['category']])}
              </h4>
              <ul className="space-y-2">
                {licenses.map((license) => (
                  <li key={license.spdxId}>
                    <span className="text-sm font-medium text-github-text">
                      {license.spdxId}
                    </span>
                    <p className="text-xs text-github-muted mt-0.5">
                      {t(license.description)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-github-border">
            <p className="text-xs text-github-muted">
              <span className="text-github-text font-medium">{t('license.noLicense')}</span> —{' '}
              {t('license.noLicenseNote')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseLegend
