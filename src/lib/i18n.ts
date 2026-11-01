import { createContext } from 'react'

export type Lang = 'ru' | 'en'

export const LANGUAGE_STORAGE_KEY = 'dev_radar_language'

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export type TranslationParams = Record<string, string | number>

/**
 * English is the source of truth: its keys define the dictionary shape and the
 * `TranslationKey` union, so a missing or misspelled key fails typecheck.
 */
const en = {
  // App shell
  'common.loading': 'Loading...',
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.create': 'Create',
  'common.ignore': 'Ignore',
  'common.follow': 'Follow',
  'theme.switchTo': 'Switch to {mode} mode',
  'theme.dark': 'dark',
  'theme.light': 'light',

  // Home header / toolbar
  'home.openFilters': 'Open filters',
  'home.rateLimitRemaining': 'API: {remaining} remaining',
  'home.rateLimitExceeded': 'Rate limit exceeded',
  'home.bookmarks': 'Bookmarks',
  'home.collections': 'Collections',
  'home.followedTopics': 'Followed topics',
  'home.ignoreList': 'Ignore list',
  'home.settings': 'Settings',
  'home.sortBy': 'Sort by',
  'home.sortAria': 'Sort repositories by',
  'home.switchOrder': 'Switch to {order} order',
  'home.ascending': 'ascending',
  'home.descending': 'descending',
  'home.resetFilters': 'Reset filters ({count})',
  'home.openSettings': 'Open Settings',

  // Errors
  'error.auth': 'GitHub token is invalid or expired',
  'error.rateLimit': 'GitHub API rate limit exceeded',
  'error.loadRepos': 'Failed to load repositories',
  'error.authDetail':
    'GitHub rejected your saved Personal Access Token (401 Bad credentials). Update or remove it in Settings.',
  'error.resetsAt': 'Resets at {time}',
  'error.boundaryTitle': 'Something went wrong',
  'error.boundaryFallback': 'An unexpected error occurred',
  'error.reloadApp': 'Reload App',

  // Sort options
  'sort.bestMatch': 'Best Match',
  'sort.mostStarred': 'Most Starred',
  'sort.mostForked': 'Most Forked',
  'sort.recentlyUpdated': 'Recently Updated',
  'sort.growing': 'Growing',

  // Star trends (docs/TRENDS.md)
  'trend.window.week': 'past week',
  'trend.window.days.one': 'past {count} day',
  'trend.window.days.few': 'past {count} days',
  'trend.window.days.many': 'past {count} days',
  'trend.window.days.other': 'past {count} days',
  'trend.noHistory': '—',
  'trend.unit.day': '/d',
  'trend.unit.week': '/wk',
  'trend.unit.days': '/{count}d',

  // Time ranges
  'timeRange.today': 'Today',
  'timeRange.thisWeek': 'This Week',
  'timeRange.thisMonth': 'This Month',

  // Filter sidebar
  'filters.title': 'Filters',
  'filters.close': 'Close filters',
  'filters.timeRange': 'Time Range',
  'filters.language': 'Language',
  'filters.license': 'License',
  'filters.licenseAria': 'Filter by license type',
  'filters.allLicenses': 'All Licenses',
  'filters.openSourceOnly': 'Open Source Only',
  'filters.noLicenseOption': 'No License',
  'filters.specific': 'Specific',
  'filters.topics': 'Topics',
  'filters.removeTopic': 'Remove topic {topic}',
  'filters.addTopicPlaceholder': 'Add topic (Enter)',
  'filters.addTopicAria': 'Add topic filter',
  'filters.developerFilters': 'Developer Filters',
  'filters.patHint': 'More accurate with a GitHub personal access token',
  'filters.options': 'Options',
  'filters.includeArchived': 'Include archived',
  'filters.includeForks': 'Include forks',
  'filters.readme': 'README:',
  'filters.readmeAll': 'All',
  'filters.readmeEnglish': 'English',
  'filters.readmeTokenHint': 'English detection requires a GitHub personal access token.',
  'filters.resetAll': 'Reset all ({count})',

  // Filter presets
  'preset.section': 'Presets',
  'preset.youngProject': 'Young project',
  'preset.goodFirstIssue': 'Good first issue',
  'preset.noStarLeader': 'No star leader',
  'preset.save': 'Save preset',
  'preset.namePlaceholder': 'Preset name',
  'preset.nameAria': 'Preset name',
  'preset.saveAction': 'Save',
  'preset.delete': 'Delete preset {name}',
  'preset.emptyName': 'Enter a preset name',
  'preset.limitReached': 'Preset limit of 20 reached',

  // Appearance
  'appearance.heading': 'Appearance',
  'appearance.help': 'Saved on this machine and applied immediately.',
  'appearance.accent': 'Accent colour',
  'appearance.accent.blue': 'Blue',
  'appearance.accent.violet': 'Violet',
  'appearance.accent.emerald': 'Emerald',
  'appearance.accent.amber': 'Amber',
  'appearance.density': 'Density',
  'appearance.comfortable': 'Comfortable',
  'appearance.compact': 'Compact',

  // Search / min stars
  'search.placeholder': 'Search repositories...',
  'search.aria': 'Search repositories',
  'minStars.label': 'Min ⭐',

  // Licenses
  'license.openSource': 'Open Source',
  'license.noLicense': 'No License',
  'license.legendAria': 'License legend',
  'license.guideTitle': 'License guide',
  'license.guideHeading': 'Open Source License Guide',
  'license.category.permissive': 'Permissive',
  'license.category.copyleft': 'Copyleft',
  'license.category.publicDomain': 'Public Domain',
  'license.category.other': 'Other',
  'license.noLicenseNote':
    'All rights reserved by the author. You may not use, modify, or distribute.',
  'license.desc.MIT': 'Do anything, just keep the copyright notice',
  'license.desc.Apache-2.0': 'Like MIT, plus explicit patent protection',
  'license.desc.BSD-2-Clause': 'Permissive, minimal restrictions',
  'license.desc.BSD-3-Clause': 'Permissive, no endorsement without permission',
  'license.desc.ISC': 'Functionally equivalent to MIT',
  'license.desc.GPL-2.0': 'Derivative works must also be GPL-2.0',
  'license.desc.GPL-3.0': 'Derivative works must also be GPL-3.0',
  'license.desc.LGPL-2.1': 'Weaker copyleft, linking allowed',
  'license.desc.LGPL-3.0': 'Weaker copyleft, linking allowed',
  'license.desc.AGPL-3.0': 'GPL + network use triggers source distribution',
  'license.desc.MPL-2.0': 'File-level copyleft, mixed with proprietary OK',
  'license.desc.Unlicense': 'Public domain, no restrictions',
  'license.desc.CC0-1.0': 'Public domain dedication',
  'license.desc.BSL-1.0': 'Permissive, copyright notice required',
  'license.desc.Zlib': 'Permissive, modified versions must be marked',

  // Developer filters (sidebar labels)
  'devFilter.beginnerFriendly.label': 'Beginner-friendly',
  'devFilter.beginnerFriendly.description': 'Low complexity, good docs',
  'devFilter.goodFirstIssue.label': 'Good First Issue',
  'devFilter.goodFirstIssue.description': 'Has good-first-issue labels',
  'devFilter.activelyMaintained.label': 'Actively Maintained',
  'devFilter.activelyMaintained.description': 'Recent commits, active contributors',
  'devFilter.soloMaintained.label': 'Solo Project',
  'devFilter.soloMaintained.description': 'Single maintainer',
  'devFilter.productionReady.label': 'Production Ready',
  'devFilter.productionReady.description': 'Stable, well-tested, widely used',
  'devFilter.aiRelated.label': 'AI/ML',
  'devFilter.aiRelated.description': 'Artificial intelligence / machine learning',
  'devFilter.indieProject.label': 'Indie Project',
  'devFilter.indieProject.description': 'Small, creative, independent',
  'devFilter.newExploding.label': 'New & Exploding',
  'devFilter.newExploding.description': 'Recently created projects with stars',
  'devFilter.lowCompetition.label': 'Low Competition',
  'devFilter.lowCompetition.description': 'Undiscovered gems',
  'devFilter.enterpriseGrade.label': 'Enterprise',
  'devFilter.enterpriseGrade.description': 'Large-scale, robust, corporate use',

  // Developer filter badges (repo cards)
  'devBadge.beginnerFriendly': 'Beginner-friendly',
  'devBadge.goodFirstIssues.one': '{count} good first issue',
  'devBadge.goodFirstIssues.few': '{count} good first issues',
  'devBadge.goodFirstIssues.many': '{count} good first issues',
  'devBadge.goodFirstIssues.other': '{count} good first issues',
  'devBadge.hasOpenIssues': 'Has open issues',
  'devBadge.activeThisWeek': 'Active this week',
  'devBadge.activeThisMonth': 'Active this month',
  'devBadge.soloSmallTeam': 'Solo/small team',
  'devBadge.productionReady': 'Production ready',
  'devBadge.aiRelated': 'AI/ML',
  'devBadge.indieProject': 'Indie project',
  'devBadge.recentlyCreated': 'Recently created',
  'devBadge.lowCompetition': 'Low competition',
  'devBadge.enterpriseGrade': 'Enterprise grade',

  // Panels
  'panel.close': 'Close {title} panel',

  // Repo card / stats
  'repo.avatarAlt': '{login} avatar',
  'repo.addToCollection': 'Add to collection',
  'repo.inCollections': 'In collection(s)',
  'repo.noCollections': 'No collections yet',
  'repo.removeBookmark': 'Remove bookmark',
  'repo.bookmarkThis': 'Bookmark this repo',
  'repo.bookmarked': 'Bookmarked',
  'repo.bookmark': 'Bookmark',
  'repo.starsTitle': '{count} stars',
  'repo.forksTitle': '{count} forks',
  'repo.openPRsTitle': '{count} open PRs',
  'repo.openIssuesTitle': '{count} open issues',
  'repo.growthTitle': 'Star growth',

  // Repo grid
  'grid.noMatches.title': 'No matches on the loaded pages',
  'grid.noMatches.description':
    'Repositories were fetched but filtered out. Load more pages to keep searching.',
  'grid.searching': 'Searching…',
  'grid.searchMore': 'Search more repositories',
  'grid.empty.title': 'No repositories found',
  'grid.empty.description': 'Try adjusting your filters or search terms',
  'grid.loadingMore': 'Loading…',
  'grid.loadMore': 'Load more repositories',

  // Bookmarks
  'bookmarks.title': 'Bookmarks',
  'bookmarks.savedCount': '{count} saved',
  'bookmarks.empty.title': 'No bookmarks yet',
  'bookmarks.empty.description': 'Click the bookmark icon on any repo to save it here',
  'bookmarks.remove': 'Remove bookmark',
  'bookmarks.savedAt': 'Saved {time}',

  // Collections
  'collections.title': 'Collections',
  'collections.count.one': '{count} collection',
  'collections.count.few': '{count} collections',
  'collections.count.many': '{count} collections',
  'collections.count.other': '{count} collections',
  'collections.new': '+ New Collection',
  'collections.empty.title': 'No collections yet',
  'collections.empty.description':
    'Create a collection and add repos from the folder icon on any repo card',
  'collections.createHeading': 'New Collection',
  'collections.namePlaceholder': 'Collection name',
  'collections.descriptionPlaceholder': 'Description (optional)',
  'collections.delete': 'Delete collection {name}',
  'collections.emptyRepos': 'No repos yet. Click the 📁 icon on any repo card to add it here.',
  'collections.removeRepo': 'Remove {name} from collection',
  'collections.repoMeta.one': '{count} repo · Updated {date}',
  'collections.repoMeta.few': '{count} repos · Updated {date}',
  'collections.repoMeta.many': '{count} repos · Updated {date}',
  'collections.repoMeta.other': '{count} repos · Updated {date}',

  // Followed topics
  'followed.title': 'Followed Topics',
  'followed.placeholder': 'Add a topic to follow...',
  'followed.empty.title': 'No followed topics yet',
  'followed.empty.description': 'Follow topics to track them here',
  'followed.unfollow': 'Unfollow topic {topic}',

  // Ignore list
  'ignore.title': 'Ignore List',
  'ignore.topics': 'Ignored Topics',
  'ignore.topicPlaceholder': 'Add topic to ignore...',
  'ignore.noTopics': 'No ignored topics',
  'ignore.stopTopic': 'Stop ignoring topic {topic}',
  'ignore.languages': 'Ignored Languages',
  'ignore.languagePlaceholder': 'Add language to ignore...',
  'ignore.noLanguages': 'No ignored languages',
  'ignore.stopLanguage': 'Stop ignoring language {language}',

  // Settings
  'settings.title': 'Settings',
  'settings.back': 'Back to home',
  'settings.tokenHeading': 'GitHub Personal Access Token',
  'settings.tokenHelp':
    'Add a PAT to increase your API rate limit from 60 to 5,000 requests per hour (Core API), and from 10 to 30 requests per minute (Search API). Generate one at',
  'settings.tokenPlaceholderSaved': 'Token saved — enter a new one to replace it',
  'settings.save': 'Save',
  'settings.validating': 'Validating…',
  'settings.tokenSaved': 'Token saved successfully!',
  'settings.tokenInvalid':
    'Invalid token — GitHub rejected it (401 Bad credentials). Check for typos or expired tokens.',
  'settings.tokenHttpError': 'GitHub could not validate this token (HTTP {status}).',
  'settings.tokenNetworkError':
    'Could not reach GitHub to validate the token. Check your connection and try again.',
  'settings.rateLimits': 'About Rate Limits',
  'settings.unauthenticated': 'Unauthenticated',
  'settings.withPat': 'With Personal Access Token',
  'settings.withGitHubApp': 'With GitHub App',
  'settings.requestsPerHour': '{count} requests/hour',
  'settings.languageHeading': 'Language',
  'settings.languageHelp': 'Applies immediately and is remembered on this machine.',
  'settings.trendsHeading': 'Star history',
  'settings.statsEnabled': 'Collect statistics',
  'settings.statsEnabledHelp':
    'Snapshots the tracked repositories while the app runs, at most once every 6 hours; one snapshot is kept per day. Turning this off stops syncing and keeps the existing history.',
  'settings.trackedRepos.one': 'Tracking {count} repository',
  'settings.trackedRepos.few': 'Tracking {count} repositories',
  'settings.trackedRepos.many': 'Tracking {count} repositories',
  'settings.trackedRepos.other': 'Tracking {count} repositories',
  'settings.lastSync': 'Last update: {time}',
  'settings.trendsTokenHint': 'Star trends require a Personal Access Token.',
  'settings.trendsUnavailable': 'Star history is only available in the desktop app.',
} as const

export type TranslationKey = keyof typeof en

type StripPluralSuffix<K extends string> = K extends `${infer Base}.other` ? Base : never
export type PluralKey = StripPluralSuffix<Extract<TranslationKey, `${string}.other`>>

const ru: Record<TranslationKey, string> = {
  'common.loading': 'Загрузка...',
  'common.retry': 'Повторить',
  'common.cancel': 'Отмена',
  'common.create': 'Создать',
  'common.ignore': 'Игнорировать',
  'common.follow': 'Отслеживать',
  'theme.switchTo': 'Включить {mode} тему',
  'theme.dark': 'тёмную',
  'theme.light': 'светлую',

  'home.openFilters': 'Открыть фильтры',
  'home.rateLimitRemaining': 'API: осталось {remaining}',
  'home.rateLimitExceeded': 'Лимит запросов исчерпан',
  'home.bookmarks': 'Закладки',
  'home.collections': 'Коллекции',
  'home.followedTopics': 'Отслеживаемые темы',
  'home.ignoreList': 'Игнор-лист',
  'home.settings': 'Настройки',
  'home.sortBy': 'Сортировка',
  'home.sortAria': 'Сортировать репозитории по',
  'home.switchOrder': 'Сменить порядок на {order}',
  'home.ascending': 'возрастающий',
  'home.descending': 'убывающий',
  'home.resetFilters': 'Сбросить фильтры ({count})',
  'home.openSettings': 'Открыть настройки',

  'error.auth': 'Токен GitHub недействителен или истёк',
  'error.rateLimit': 'Лимит запросов GitHub API исчерпан',
  'error.loadRepos': 'Не удалось загрузить репозитории',
  'error.authDetail':
    'GitHub отклонил сохранённый Personal Access Token (401 Bad credentials). Обновите или удалите его в настройках.',
  'error.resetsAt': 'Лимит сбросится в {time}',
  'error.boundaryTitle': 'Что-то пошло не так',
  'error.boundaryFallback': 'Произошла непредвиденная ошибка',
  'error.reloadApp': 'Перезагрузить',

  'sort.bestMatch': 'Лучшее совпадение',
  'sort.mostStarred': 'По звёздам',
  'sort.mostForked': 'По форкам',
  'sort.recentlyUpdated': 'Недавно обновлённые',
  'sort.growing': 'Растущие',

  'trend.window.week': 'за неделю',
  'trend.window.days.one': 'за {count} день',
  'trend.window.days.few': 'за {count} дн.',
  'trend.window.days.many': 'за {count} дн.',
  'trend.window.days.other': 'за {count} дн.',
  'trend.noHistory': '—',
  'trend.unit.day': '/сут',
  'trend.unit.week': '/нед',
  'trend.unit.days': '/{count} дн.',

  'timeRange.today': 'Сегодня',
  'timeRange.thisWeek': 'Неделя',
  'timeRange.thisMonth': 'Месяц',

  'filters.title': 'Фильтры',
  'filters.close': 'Закрыть фильтры',
  'filters.timeRange': 'Период',
  'filters.language': 'Язык',
  'filters.license': 'Лицензия',
  'filters.licenseAria': 'Фильтр по типу лицензии',
  'filters.allLicenses': 'Все лицензии',
  'filters.openSourceOnly': 'Только open source',
  'filters.noLicenseOption': 'Без лицензии',
  'filters.specific': 'Конкретные',
  'filters.topics': 'Темы',
  'filters.removeTopic': 'Удалить тему {topic}',
  'filters.addTopicPlaceholder': 'Добавить тему (Enter)',
  'filters.addTopicAria': 'Добавить фильтр по теме',
  'filters.developerFilters': 'Фильтры для разработчиков',
  'filters.patHint': 'Точнее с Personal Access Token GitHub',
  'filters.options': 'Параметры',
  'filters.includeArchived': 'Включая архивные',
  'filters.includeForks': 'Включая форки',
  'filters.readme': 'README:',
  'filters.readmeAll': 'Любой',
  'filters.readmeEnglish': 'Английский',
  'filters.readmeTokenHint':
    'Определение английского языка требует Personal Access Token GitHub.',
  'filters.resetAll': 'Сбросить всё ({count})',

  'preset.section': 'Пресеты',
  'preset.youngProject': 'Молодой проект',
  'preset.goodFirstIssue': 'Good first issue',
  'preset.noStarLeader': 'Без звёздного лидера',
  'preset.save': 'Сохранить пресет',
  'preset.namePlaceholder': 'Название пресета',
  'preset.nameAria': 'Название пресета',
  'preset.saveAction': 'Сохранить',
  'preset.delete': 'Удалить пресет {name}',
  'preset.emptyName': 'Введите название пресета',
  'preset.limitReached': 'Достигнут лимит в 20 пресетов',

  'appearance.heading': 'Внешний вид',
  'appearance.help': 'Сохраняется на этом устройстве и применяется сразу.',
  'appearance.accent': 'Акцентный цвет',
  'appearance.accent.blue': 'Синий',
  'appearance.accent.violet': 'Фиолетовый',
  'appearance.accent.emerald': 'Изумрудный',
  'appearance.accent.amber': 'Янтарный',
  'appearance.density': 'Плотность',
  'appearance.comfortable': 'Комфортная',
  'appearance.compact': 'Компактная',

  'search.placeholder': 'Поиск репозиториев...',
  'search.aria': 'Поиск репозиториев',
  'minStars.label': 'Мин ⭐',

  'license.openSource': 'Открытый код',
  'license.noLicense': 'Без лицензии',
  'license.legendAria': 'Легенда лицензий',
  'license.guideTitle': 'Справка по лицензиям',
  'license.guideHeading': 'Справка по open source лицензиям',
  'license.category.permissive': 'Разрешительные',
  'license.category.copyleft': 'Копилефт',
  'license.category.publicDomain': 'Общественное достояние',
  'license.category.other': 'Прочие',
  'license.noLicenseNote':
    'Все права принадлежат автору. Использование, изменение и распространение запрещены.',
  'license.desc.MIT': 'Делайте что угодно, сохраняйте копирайт',
  'license.desc.Apache-2.0': 'Как MIT, плюс патентная защита',
  'license.desc.BSD-2-Clause': 'Разрешительная, минимум ограничений',
  'license.desc.BSD-3-Clause': 'Разрешительная, без использования имени без разрешения',
  'license.desc.ISC': 'Функционально эквивалентна MIT',
  'license.desc.GPL-2.0': 'Производные работы тоже под GPL-2.0',
  'license.desc.GPL-3.0': 'Производные работы тоже под GPL-3.0',
  'license.desc.LGPL-2.1': 'Слабый копилефт, линковка разрешена',
  'license.desc.LGPL-3.0': 'Слабый копилефт, линковка разрешена',
  'license.desc.AGPL-3.0': 'GPL + использование по сети требует раскрытия исходников',
  'license.desc.MPL-2.0': 'Копилефт на уровне файлов, можно смешивать с проприетарным',
  'license.desc.Unlicense': 'Общественное достояние, без ограничений',
  'license.desc.CC0-1.0': 'Отказ от прав в пользу общественного достояния',
  'license.desc.BSL-1.0': 'Разрешительная, требуется уведомление об авторских правах',
  'license.desc.Zlib': 'Разрешительная, изменённые версии нужно помечать',

  'devFilter.beginnerFriendly.label': 'Для новичков',
  'devFilter.beginnerFriendly.description': 'Простая кодовая база, хорошая документация',
  'devFilter.goodFirstIssue.label': 'Задачи для новичков',
  'devFilter.goodFirstIssue.description': 'Есть метки good-first-issue',
  'devFilter.activelyMaintained.label': 'Активно поддерживается',
  'devFilter.activelyMaintained.description': 'Свежие коммиты, активные контрибьюторы',
  'devFilter.soloMaintained.label': 'Одиночный проект',
  'devFilter.soloMaintained.description': 'Один мейнтейнер',
  'devFilter.productionReady.label': 'Готов к продакшену',
  'devFilter.productionReady.description': 'Стабильный, с тестами, широко используется',
  'devFilter.aiRelated.label': 'AI/ML',
  'devFilter.aiRelated.description': 'Искусственный интеллект и машинное обучение',
  'devFilter.indieProject.label': 'Инди-проект',
  'devFilter.indieProject.description': 'Небольшой, творческий, независимый',
  'devFilter.newExploding.label': 'Новый и взрывной',
  'devFilter.newExploding.description': 'Недавно созданные проекты со звёздами',
  'devFilter.lowCompetition.label': 'Низкая конкуренция',
  'devFilter.lowCompetition.description': 'Нераскрученные самородки',
  'devFilter.enterpriseGrade.label': 'Корпоративный',
  'devFilter.enterpriseGrade.description': 'Масштабный, надёжный, для компаний',

  'devBadge.beginnerFriendly': 'Для новичков',
  'devBadge.goodFirstIssues.one': '{count} задача для новичков',
  'devBadge.goodFirstIssues.few': '{count} задачи для новичков',
  'devBadge.goodFirstIssues.many': '{count} задач для новичков',
  'devBadge.goodFirstIssues.other': '{count} задачи для новичков',
  'devBadge.hasOpenIssues': 'Есть открытые issues',
  'devBadge.activeThisWeek': 'Активен на этой неделе',
  'devBadge.activeThisMonth': 'Активен в этом месяце',
  'devBadge.soloSmallTeam': 'Один или малая команда',
  'devBadge.productionReady': 'Готов к продакшену',
  'devBadge.aiRelated': 'AI/ML',
  'devBadge.indieProject': 'Инди-проект',
  'devBadge.recentlyCreated': 'Недавно создан',
  'devBadge.lowCompetition': 'Низкая конкуренция',
  'devBadge.enterpriseGrade': 'Корпоративный уровень',

  'panel.close': 'Закрыть панель «{title}»',

  'repo.avatarAlt': 'Аватар {login}',
  'repo.addToCollection': 'Добавить в коллекцию',
  'repo.inCollections': 'В коллекции',
  'repo.noCollections': 'Коллекций пока нет',
  'repo.removeBookmark': 'Убрать закладку',
  'repo.bookmarkThis': 'Добавить в закладки',
  'repo.bookmarked': 'В закладках',
  'repo.bookmark': 'Закладка',
  'repo.starsTitle': 'Звёзды: {count}',
  'repo.forksTitle': 'Форки: {count}',
  'repo.openPRsTitle': 'Открытые PR: {count}',
  'repo.openIssuesTitle': 'Открытые issues: {count}',
  'repo.growthTitle': 'Прирост звёзд',

  'grid.noMatches.title': 'На загруженных страницах ничего не подошло',
  'grid.noMatches.description':
    'Репозитории загружены, но отфильтрованы. Загрузите ещё страницы, чтобы продолжить поиск.',
  'grid.searching': 'Идёт поиск…',
  'grid.searchMore': 'Искать дальше',
  'grid.empty.title': 'Репозитории не найдены',
  'grid.empty.description': 'Попробуйте изменить фильтры или поисковый запрос',
  'grid.loadingMore': 'Загрузка…',
  'grid.loadMore': 'Загрузить ещё',

  'bookmarks.title': 'Закладки',
  'bookmarks.savedCount': 'Сохранено: {count}',
  'bookmarks.empty.title': 'Закладок пока нет',
  'bookmarks.empty.description':
    'Нажмите на иконку закладки у любого репозитория, чтобы сохранить его',
  'bookmarks.remove': 'Убрать закладку',
  'bookmarks.savedAt': 'Сохранено {time}',

  'collections.title': 'Коллекции',
  'collections.count.one': '{count} коллекция',
  'collections.count.few': '{count} коллекции',
  'collections.count.many': '{count} коллекций',
  'collections.count.other': '{count} коллекции',
  'collections.new': '+ Новая коллекция',
  'collections.empty.title': 'Коллекций пока нет',
  'collections.empty.description':
    'Создайте коллекцию и добавляйте репозитории через иконку папки на карточке',
  'collections.createHeading': 'Новая коллекция',
  'collections.namePlaceholder': 'Название коллекции',
  'collections.descriptionPlaceholder': 'Описание (необязательно)',
  'collections.delete': 'Удалить коллекцию {name}',
  'collections.emptyRepos':
    'Репозиториев пока нет. Нажмите на иконку 📁 на карточке репозитория.',
  'collections.removeRepo': 'Убрать {name} из коллекции',
  'collections.repoMeta.one': '{count} репозиторий · Обновлено {date}',
  'collections.repoMeta.few': '{count} репозитория · Обновлено {date}',
  'collections.repoMeta.many': '{count} репозиториев · Обновлено {date}',
  'collections.repoMeta.other': '{count} репозитория · Обновлено {date}',

  'followed.title': 'Отслеживаемые темы',
  'followed.placeholder': 'Добавить тему для отслеживания...',
  'followed.empty.title': 'Отслеживаемых тем пока нет',
  'followed.empty.description': 'Отслеживайте темы, чтобы видеть их здесь',
  'followed.unfollow': 'Перестать отслеживать тему {topic}',

  'ignore.title': 'Игнор-лист',
  'ignore.topics': 'Игнорируемые темы',
  'ignore.topicPlaceholder': 'Тема для игнорирования...',
  'ignore.noTopics': 'Нет игнорируемых тем',
  'ignore.stopTopic': 'Перестать игнорировать тему {topic}',
  'ignore.languages': 'Игнорируемые языки',
  'ignore.languagePlaceholder': 'Язык для игнорирования...',
  'ignore.noLanguages': 'Нет игнорируемых языков',
  'ignore.stopLanguage': 'Перестать игнорировать язык {language}',

  'settings.title': 'Настройки',
  'settings.back': 'Назад на главную',
  'settings.tokenHeading': 'GitHub Personal Access Token',
  'settings.tokenHelp':
    'PAT повышает лимит API с 60 до 5000 запросов в час (Core API) и с 10 до 30 запросов в минуту (Search API). Создать токен:',
  'settings.tokenPlaceholderSaved': 'Токен сохранён — введите новый, чтобы заменить',
  'settings.save': 'Сохранить',
  'settings.validating': 'Проверка…',
  'settings.tokenSaved': 'Токен сохранён!',
  'settings.tokenInvalid':
    'Недействительный токен — GitHub отклонил его (401 Bad credentials). Проверьте опечатки и срок действия.',
  'settings.tokenHttpError': 'GitHub не смог проверить токен (HTTP {status}).',
  'settings.tokenNetworkError':
    'Не удалось связаться с GitHub. Проверьте соединение и повторите.',
  'settings.rateLimits': 'О лимитах запросов',
  'settings.unauthenticated': 'Без авторизации',
  'settings.withPat': 'С Personal Access Token',
  'settings.withGitHubApp': 'С GitHub App',
  'settings.requestsPerHour': '{count} запросов/час',
  'settings.languageHeading': 'Язык интерфейса',
  'settings.languageHelp': 'Применяется сразу и запоминается на этом компьютере.',
  'settings.trendsHeading': 'История звёзд',
  'settings.statsEnabled': 'Сбор статистики',
  'settings.statsEnabledHelp':
    'Пока приложение запущено, снимает число звёзд отслеживаемых репозиториев не чаще раза в 6 часов; за день хранится один снимок. Если выключить, синхронизация остановится, а история сохранится.',
  'settings.trackedRepos.one': 'Отслеживается {count} репозиторий',
  'settings.trackedRepos.few': 'Отслеживается {count} репозитория',
  'settings.trackedRepos.many': 'Отслеживается {count} репозиториев',
  'settings.trackedRepos.other': 'Отслеживается {count} репозитория',
  'settings.lastSync': 'Последнее обновление: {time}',
  'settings.trendsTokenHint': 'Для трендов нужен Personal Access Token.',
  'settings.trendsUnavailable': 'История звёзд доступна только в настольном приложении.',
}

export const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { en, ru }

const pluralRulesCache = new Map<Lang, Intl.PluralRules>()

function pluralRules(lang: Lang): Intl.PluralRules {
  const cached = pluralRulesCache.get(lang)
  if (cached) return cached
  const rules = new Intl.PluralRules(lang)
  pluralRulesCache.set(lang, rules)
  return rules
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

export function translate(
  lang: Lang,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const template = DICTIONARIES[lang][key] ?? DICTIONARIES.en[key] ?? key
  return interpolate(template, params)
}

export function translatePlural(
  lang: Lang,
  baseKey: PluralKey,
  count: number,
  params?: TranslationParams,
): string {
  const category = pluralRules(lang).select(count)
  const dictionary = DICTIONARIES[lang] as Record<string, string | undefined>
  const englishDictionary = DICTIONARIES.en as Record<string, string | undefined>
  const template =
    dictionary[`${baseKey}.${category}`] ??
    dictionary[`${baseKey}.other`] ??
    englishDictionary[`${baseKey}.other`] ??
    baseKey
  return interpolate(template, { count, ...params })
}

export function isLang(value: unknown): value is Lang {
  return value === 'ru' || value === 'en'
}

/**
 * Resolution order: saved choice, then the OS locale. jsdom reports en-US, so
 * the default language in tests stays English.
 */
export function resolveInitialLang(navigatorLanguage?: string): Lang {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (isLang(stored)) return stored
    } catch {
      // Private-mode storage can throw; fall through to the locale.
    }
  }
  const language =
    navigatorLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : '')
  return language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist.
  }
}

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  tPlural: (baseKey: PluralKey, count: number, params?: TranslationParams) => string
}

/** English default keeps components renderable without a provider (tests, storybook). */
export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key, params) => translate('en', key, params),
  tPlural: (baseKey, count, params) => translatePlural('en', baseKey, count, params),
})
