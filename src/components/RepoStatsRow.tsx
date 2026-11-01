import { formatDecimal, formatNumber, formatRelativeTime } from '../lib/utils'
import { useI18n } from '../hooks/useI18n'
import { StarIcon, ForkIcon } from './Icons'

interface RepoStatsRowProps {
  stars: number
  forks: number
  pushedAt: string
  compact?: boolean
}

function RepoStatsRow({ stars, forks, pushedAt, compact = false }: RepoStatsRowProps) {
  const { t, lang } = useI18n()

  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-3 mt-2 text-xs' : 'gap-4 text-sm'} text-github-muted`}>
      <span className="flex items-center gap-1" title={t('repo.starsTitle', { count: formatDecimal(stars, lang) })}>
        <StarIcon />
        {formatNumber(stars, lang)}
      </span>
      <span className="flex items-center gap-1" title={t('repo.forksTitle', { count: formatDecimal(forks, lang) })}>
        <ForkIcon />
        {formatNumber(forks, lang)}
      </span>
      <span className={compact ? 'ml-auto' : 'ml-auto text-xs'} title={pushedAt}>
        {formatRelativeTime(pushedAt, lang)}
      </span>
    </div>
  )
}

export default RepoStatsRow
