import type { Repository, GraphQLRepositoryEnrichment, EnrichmentFields } from '../types/github'
import type { DeveloperFilter } from '../hooks/useFilters'
import { translate, translatePlural } from './i18n'
import type { Lang, PluralKey, TranslationKey } from './i18n'

type BadgeLabel =
  | { key: TranslationKey }
  | { pluralKey: PluralKey; count: number }

interface BadgeSpec {
  label: BadgeLabel
  icon: string
  color: string
}

interface EvaluatedFilter {
  matches: boolean
  badge?: BadgeSpec
}

interface DeveloperFilterResult {
  matches: boolean
  badge?: { label: string; icon: string; color: string }
}

const FILTER_ENRICHMENT_FIELDS: Record<DeveloperFilter, EnrichmentFields> = {
  beginner_friendly: {},
  good_first_issue: { goodFirstIssues: true },
  actively_maintained: { contributors: true, recentCommits: true },
  solo_maintained: { contributors: true },
  production_ready: {},
  ai_related: {},
  indie_project: { contributors: true },
  new_exploding: {},
  low_competition: {},
  enterprise_grade: { contributors: true, releases: true },
}

export function requiredEnrichmentFields(
  developerFilters: DeveloperFilter[] | undefined,
  readmeLanguage: 'all' | 'english' | undefined,
): EnrichmentFields {
  const fields: EnrichmentFields = {}
  if (readmeLanguage === 'english') {
    fields.readme = true
  }
  developerFilters?.forEach((filter) => {
    Object.assign(fields, FILTER_ENRICHMENT_FIELDS[filter])
  })
  return fields
}

export function requiresTokenFor(filter: DeveloperFilter): boolean {
  const fields = FILTER_ENRICHMENT_FIELDS[filter]
  return Object.values(fields).some(Boolean)
}

function renderLabel(lang: Lang, label: BadgeLabel): string {
  return 'pluralKey' in label
    ? translatePlural(lang, label.pluralKey, label.count)
    : translate(lang, label.key)
}

export function evaluateDeveloperFilter(
  filter: DeveloperFilter,
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
  lang: Lang = 'en',
): DeveloperFilterResult {
  const result = evaluate(filter, repo, enrichment)
  return {
    matches: result.matches,
    badge: result.badge && {
      label: renderLabel(lang, result.badge.label),
      icon: result.badge.icon,
      color: result.badge.color,
    },
  }
}

function evaluate(
  filter: DeveloperFilter,
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  switch (filter) {
    case 'beginner_friendly':
      return evaluateBeginnerFriendly(repo)
      case 'good_first_issue':
      return evaluateGoodFirstIssue(repo, enrichment)
      case 'actively_maintained':
      return evaluateActivelyMaintained(repo, enrichment)
      case 'solo_maintained':
      return evaluateSoloMaintained(repo, enrichment)
      case 'production_ready':
      return evaluateProductionReady(repo)
      case 'ai_related':
      return evaluateAIRelated(repo)
      case 'indie_project':
      return evaluateIndieProject(repo, enrichment)
      case 'new_exploding':
      return evaluateNewExploding(repo)
      case 'low_competition':
      return evaluateLowCompetition(repo)
      case 'enterprise_grade':
      return evaluateEnterpriseGrade(repo, enrichment)
    default:
      return { matches: true }
  }
}

function evaluateBeginnerFriendly(
  repo: Repository,
): EvaluatedFilter {
  const hasBeginnerTopics = repo.topics.some((t) =>
    ['beginner-friendly', 'tutorial', 'learning', 'education', 'examples', 'good-first-issue', 'beginner'].includes(t),
  )
  const lowComplexity = repo.stars < 10000 && repo.forks < 2000
  const hasOpenIssues = repo.openIssues > 0

  const matches = hasBeginnerTopics || (lowComplexity && hasOpenIssues)

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.beginnerFriendly' }, icon: '🌱', color: 'text-green-400' } : undefined,
  }
}

function evaluateGoodFirstIssue(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  const goodFirstIssues = enrichment?.goodFirstIssueCount ?? 0
  const hasGoodFirstTopic = repo.topics.some((t) =>
    ['good-first-issue', 'beginner-friendly', 'hacktoberfest'].includes(t),
  )
  const hasOpenIssues = repo.openIssues > 2

  const matches = goodFirstIssues > 0 || hasGoodFirstTopic || hasOpenIssues

  return {
    matches,
    badge: goodFirstIssues > 0
      ? { label: { pluralKey: 'devBadge.goodFirstIssues', count: goodFirstIssues }, icon: '🎯', color: 'text-blue-400' }
      : matches
        ? { label: { key: 'devBadge.hasOpenIssues' }, icon: '🎯', color: 'text-blue-400' }
        : undefined,
  }
}

function evaluateActivelyMaintained(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  const daysSincePush = Math.floor(
    (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const contributorCount = enrichment?.contributorCount ?? 0
  const recentCommitCount = enrichment?.recentCommitCount ?? 0

  const matches = daysSincePush <= 30 && (contributorCount >= 1 || recentCommitCount >= 1 || daysSincePush <= 7)

  return {
    matches,
    badge: matches
      ? { label: { key: daysSincePush <= 7 ? 'devBadge.activeThisWeek' : 'devBadge.activeThisMonth' }, icon: '🔧', color: 'text-yellow-400' }
      : undefined,
  }
}

function evaluateSoloMaintained(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  const contributorCount = enrichment?.contributorCount ?? 1
  const matches = contributorCount <= 3 && repo.stars > 50 && repo.stars < 5000

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.soloSmallTeam' }, icon: '👤', color: 'text-purple-400' } : undefined,
  }
}

function evaluateProductionReady(
  repo: Repository,
): EvaluatedFilter {
  const isStable = repo.stars > 500 && repo.forks > 50
  const hasLicense = repo.license !== null
  const hasTopics = repo.topics.length > 0

  const matches = hasLicense && (isStable || hasTopics)

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.productionReady' }, icon: '🚀', color: 'text-emerald-400' } : undefined,
  }
}

function evaluateAIRelated(
  repo: Repository,
): EvaluatedFilter {
  const aiTopics = repo.topics.filter((t) =>
    [
      'machine-learning',
      'artificial-intelligence',
      'deep-learning',
      'neural-network',
      'nlp',
      'computer-vision',
      'llm',
      'transformer',
      'ai',
      'ml',
      'generative-ai',
      'rag',
      'chatgpt',
      'openai',
    ].includes(t),
  )
  const aiDescription =
    repo.description &&
    /machine learning|artificial intelligence|neural network|deep learning|llm|transformer|gpt|ai\s|ai\b|ml\s|ml\b|chatbot|agent/gi.test(
      repo.description,
    )

  const matches = aiTopics.length > 0 || !!aiDescription

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.aiRelated' }, icon: '🤖', color: 'text-cyan-400' } : undefined,
  }
}

function evaluateIndieProject(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  const indieTopics = repo.topics.filter((t) =>
    ['indie', 'creative', 'art', 'game', 'music', 'pixel', 'fun', 'experimental', 'toy', 'hobby', 'personal'].includes(t),
  )
  const smallProject = repo.stars < 5000 && repo.forks < 500
  const contributorCount = enrichment?.contributorCount ?? 1
  const isSolo = contributorCount <= 3

  const matches = (indieTopics.length > 0 && smallProject) || (smallProject && isSolo)

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.indieProject' }, icon: '🎨', color: 'text-pink-400' } : undefined,
  }
}

function evaluateNewExploding(
  repo: Repository,
): EvaluatedFilter {
  const repoAge = Math.floor(
    (Date.now() - new Date(repo.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const isNew = repoAge <= 180
  const hasSomeStars = repo.stars > 50

  const matches = isNew && hasSomeStars

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.recentlyCreated' }, icon: '💥', color: 'text-orange-400' } : undefined,
  }
}

function evaluateLowCompetition(
  repo: Repository,
): EvaluatedFilter {
  const matches = repo.license !== null

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.lowCompetition' }, icon: '💎', color: 'text-indigo-400' } : undefined,
  }
}

function evaluateEnterpriseGrade(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): EvaluatedFilter {
  const enterpriseTopics = repo.topics.filter((t) =>
    [
      'enterprise',
      'microservices',
      'cloud-native',
      'kubernetes',
      'docker',
      'api',
      'saas',
      'platform',
      'infrastructure',
      'devops',
    ].includes(t),
  )
  const isLarge = repo.stars > 1000 && repo.forks > 200
  const hasManyContributors = (enrichment?.contributorCount ?? 0) > 5
  const hasReleases = (enrichment?.releaseCount ?? 0) > 2

  const matches =
    (enterpriseTopics.length > 0 && isLarge) ||
    (hasManyContributors && hasReleases) ||
    (isLarge && repo.topics.length > 3)

  return {
    matches,
    badge: matches ? { label: { key: 'devBadge.enterpriseGrade' }, icon: '🏢', color: 'text-slate-400' } : undefined,
  }
}
