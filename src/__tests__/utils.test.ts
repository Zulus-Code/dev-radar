import { describe, it, expect } from 'vitest'
import { formatNumber, formatRelativeTime, getDateForTimeRange, getDateDaysAgo, buildGitHubQuery, isOSILicense, getAPISortField } from '../lib/utils'
import { detectReadmeLanguage } from '../lib/readmeLanguage'

describe('formatNumber', () => {
  it('formats numbers under 1000 as-is', () => {
    expect(formatNumber(500)).toBe('500')
    expect(formatNumber(99)).toBe('99')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats thousands with k suffix', () => {
    expect(formatNumber(1000)).toBe('1k')
    expect(formatNumber(1500)).toBe('1.5k')
    expect(formatNumber(12400)).toBe('12.4k')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M')
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(12400000)).toBe('12.4M')
  })
})

describe('formatRelativeTime', () => {
  it('clamps future timestamps to "now" instead of "in N minutes"', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(future)).not.toContain('in ')
    expect(formatRelativeTime(future, 'ru')).not.toContain('через')
  })

  it('formats past dates with ago suffix', () => {
    const now = new Date()
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const result = formatRelativeTime(threeHoursAgo.toISOString())
    expect(result).toContain('ago')
  })

  it('formats day-based distances', () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(sevenDaysAgo.toISOString())
    expect(result).toMatch(/7 days? ago/)
  })
})

describe('getDateForTimeRange', () => {
  it('returns date 1 day ago for day range', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    const expected = yesterday.toISOString().split('T')[0]
    const result = getDateForTimeRange('day')
    expect(result).toBe(expected)
  })

  it('returns date 7 days ago for week range', () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const expected = weekAgo.toISOString().split('T')[0]
    const result = getDateForTimeRange('week')
    expect(result).toBe(expected)
  })

  it('returns date 30 days ago for month range', () => {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const expected = monthAgo.toISOString().split('T')[0]
    const result = getDateForTimeRange('month')
    expect(result).toBe(expected)
  })
})

describe('buildGitHubQuery', () => {
  it('builds basic query with time range', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('pushed:>')
    expect(query).toContain('stars:>50')
  })

  it('adds keyword to query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', keyword: 'react' })
    expect(query).toContain('react')
  })

  it('adds language filter', () => {
    const query = buildGitHubQuery({ timeRange: 'week', language: ['TypeScript'] })
    expect(query).toContain('language:TypeScript')
  })

  it('adds multiple language filters', () => {
    const query = buildGitHubQuery({ timeRange: 'week', language: ['TypeScript', 'JavaScript'] })
    expect(query).toContain('language:TypeScript')
    expect(query).toContain('language:JavaScript')
  })

  it('adds min stars filter', () => {
    const query = buildGitHubQuery({ timeRange: 'week', minStars: 1000 })
    expect(query).toContain('stars:>=1000')
    expect(query).not.toContain('stars:>50')
  })

  it('adds topic filters', () => {
    const query = buildGitHubQuery({ timeRange: 'week', topics: ['react', 'hooks'] })
    expect(query).toContain('topic:react')
    expect(query).toContain('topic:hooks')
  })

  it('excludes archived by default', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('archived:false')
  })

  it('includes archived when specified', () => {
    const query = buildGitHubQuery({ timeRange: 'week', includeArchived: true })
    expect(query).not.toContain('archived:false')
  })

  it('excludes forks by default', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('fork:false')
  })

  it('includes forks when specified', () => {
    const query = buildGitHubQuery({ timeRange: 'week', includeForks: true })
    expect(query).not.toContain('fork:false')
  })

  it('builds open source license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'open_source' })
    expect(query).not.toContain('license:')
  })

  it('builds no license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'no_license' })
    expect(query).not.toContain('license:')
  })

  it('builds specific license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'MIT' })
    expect(query).toContain('license:mit')
  })

  it('uses single range syntax for low competition filter', () => {
    const query = buildGitHubQuery({ timeRange: 'week', developerFilters: ['low_competition'] })
    expect(query).toContain('stars:100..14999')
    expect(query).not.toContain('stars:>50')
  })
})

describe('isOSILicense', () => {
  it('returns true for MIT', () => {
    expect(isOSILicense('MIT')).toBe(true)
  })

  it('returns true for Apache-2.0', () => {
    expect(isOSILicense('Apache-2.0')).toBe(true)
  })

  it('returns true for GPL-3.0', () => {
    expect(isOSILicense('GPL-3.0')).toBe(true)
  })

  it('returns false for null', () => {
    expect(isOSILicense(null)).toBe(false)
  })

  it('returns false for NOASSERTION', () => {
    expect(isOSILicense('NOASSERTION')).toBe(false)
  })

  it('returns false for Other', () => {
    expect(isOSILicense('Other')).toBe(false)
  })
})

describe('getAPISortField', () => {
  it('returns stars for stars', () => {
    expect(getAPISortField('stars')).toBe('stars')
  })

  it('returns forks for forks', () => {
    expect(getAPISortField('forks')).toBe('forks')
  })

  it('returns updated for updated', () => {
    expect(getAPISortField('updated')).toBe('updated')
  })

  it('returns undefined for best_match', () => {
    expect(getAPISortField('best_match')).toBeUndefined()
  })
})

describe('detectReadmeLanguage', () => {
  it('detects English in a typical README', () => {
    const text = `# My Project
This is a simple library for building web applications.
## Installation
npm install my-project
## Usage
import { thing } from 'my-project'
thing()
## License
MIT`
    expect(detectReadmeLanguage(text)).toBe('english')
  })

  it('detects non-English README with Chinese characters (no code)', () => {
    const text = `# 我的项目
这是一个用于构建网络应用的简单库。
## 安装
直接使用 npm 安装。
## 功能
- 快速
- 简单
- 可靠`
    expect(detectReadmeLanguage(text)).toBe('other')
  })

  it('detects non-English README with Cyrillic text (no code)', () => {
    const text = `# Мой проект
Это простая библиотека для создания веб-приложений.
## Установка
Для установки используйте пакетный менеджер.
## Возможности
- Быстро
- Просто
- Надёжно`
    expect(detectReadmeLanguage(text)).toBe('other')
  })

  it('returns other for empty or very minimal content', () => {
    expect(detectReadmeLanguage('')).toBe('other')
    expect(detectReadmeLanguage(' ')).toBe('other')
    expect(detectReadmeLanguage('#')).toBe('other')
  })

  it('detects English in minimal but identifiable English text', () => {
    expect(detectReadmeLanguage('# Project')).toBe('english')
    expect(detectReadmeLanguage('hello world')).toBe('english')
  })

  it('ignores fenced code blocks when detecting language', () => {
    const text = `# 中文README
这是一个中文项目。
## 代码示例
\`\`\`javascript
const x = 10
function hello() {
  return 'world'
}
\`\`\``
    expect(detectReadmeLanguage(text)).toBe('other')
  })

  it('detects English in README with code samples', () => {
    const text = `# My Library
A fast and lightweight utility for data processing.

## Quick Start
First, install the package:
\`\`\`
npm install my-library
\`\`\`
Then import and use it in your project.
## Features
- Simple to use
- High performance
- Well tested`
    expect(detectReadmeLanguage(text)).toBe('english')
  })

  it('handles README with URLs and markdown formatting', () => {
    const text = `# Project
Visit https://example.com for more info.
Check the [docs](https://docs.example.com) for details.
**Bold** and *italic* text.
> This is a blockquote.`
    expect(detectReadmeLanguage(text)).toBe('english')
  })
})

describe('buildGitHubQuery star bounds and new qualifiers', () => {
  it('combines min and max stars into one range qualifier', () => {
    const query = buildGitHubQuery({ timeRange: 'week', minStars: 10, maxStars: 500 })
    expect(query).toContain('stars:10..500')
    expect(query).not.toContain('stars:>=10')
    expect(query).not.toContain('stars:>50')
  })

  it('uses a zero lower bound when only max stars is set', () => {
    const query = buildGitHubQuery({ timeRange: 'week', maxStars: 2000 })
    expect(query).toContain('stars:0..2000')
  })

  it('ignores max stars that is not greater than min stars', () => {
    const equal = buildGitHubQuery({ timeRange: 'week', minStars: 500, maxStars: 500 })
    expect(equal).toContain('stars:>=500')
    expect(equal).not.toContain('..')

    const below = buildGitHubQuery({ timeRange: 'week', minStars: 500, maxStars: 100 })
    expect(below).toContain('stars:>=500')
    expect(below).not.toContain('stars:0..100')
  })

  it('keeps the default star floor when max stars is invalid', () => {
    const query = buildGitHubQuery({ timeRange: 'week', maxStars: 0 })
    expect(query).toContain('stars:>50')
    expect(query).not.toContain('..')
  })

  it('adds a creation-date qualifier for the requested age', () => {
    const query = buildGitHubQuery({ timeRange: 'week', createdWithinDays: 90 })
    expect(query).toContain(`created:>${getDateDaysAgo(90)}`)
  })

  it('omits the creation-date qualifier when age is zero', () => {
    const query = buildGitHubQuery({ timeRange: 'week', createdWithinDays: 0 })
    expect(query).not.toContain('created:')
  })

  it('adds the good-first-issues qualifier only when enabled', () => {
    expect(buildGitHubQuery({ timeRange: 'week', goodFirstIssues: true })).toContain(
      'good-first-issues:>0',
    )
    expect(buildGitHubQuery({ timeRange: 'week', goodFirstIssues: false })).not.toContain(
      'good-first-issues',
    )
  })
})
