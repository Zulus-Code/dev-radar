export interface GitHubOwner {
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubLicense {
  spdx_id: string
  name: string
  url: string | null
}

export interface GitHubRepositoryREST {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  owner: GitHubOwner
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  updated_at: string
  created_at: string
  language: string | null
  license: GitHubLicense | null
  topics: string[]
  archived: boolean
  fork: boolean
  default_branch: string
}

export interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  owner: {
    login: string
    avatarUrl: string
  }
  stars: number
  forks: number
  openIssues: number
  openPRs: number
  pushedAt: string
  updatedAt: string
  createdAt: string
  language: string | null
  languageColor: string | null
  license: {
    spdxId: string
    name: string
  } | null
  topics: string[]
  archived: boolean
  isFork: boolean
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export interface GitHubAPIError {
  message: string
  status: number
  documentation_url?: string
}

export interface GraphQLRepositoryEnrichment {
  openPRs: number
  languageColor: string | null
  goodFirstIssueCount?: number
  contributorCount?: number
  recentCommitCount?: number
  releaseCount?: number
  readmeText?: string
}

export interface EnrichmentFields {
  readme?: boolean
  goodFirstIssues?: boolean
  contributors?: boolean
  recentCommits?: boolean
  releases?: boolean
}

export interface Bookmark {
  fullName: string
  addedAt: string
  note?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  repoFullNames: string[]
  createdAt: string
  updatedAt: string
}

export type AccentColor = 'blue' | 'violet' | 'emerald' | 'amber'
export type Density = 'comfortable' | 'compact'

export interface UserPreferences {
  followedTopics: string[]
  ignoredTopics: string[]
  ignoredLanguages: string[]
  bookmarks: Bookmark[]
  collections: Collection[]
  /** Star-history collection; off stops syncing but keeps existing snapshots. */
  statsEnabled: boolean
  accent: AccentColor
  density: Density
}
