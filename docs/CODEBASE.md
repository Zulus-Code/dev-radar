# Карта кода dev-radar

Снимок на 2026-11-01 (коммит `2a0ac2b`, ветка `feat/i18n-ru`). 7 163 строки TS/TSX,
183 теста в 14 файлах, плюс 13 строк Rust-оболочки Tauri.

## Структура

```
src/
├── main.tsx                 # точка входа: QueryClient (staleTime 5 мин), ErrorBoundary, App
├── App.tsx                  # HashRouter (нужен Tauri), 2 маршрута: / и /settings (lazy)
├── index.css                # Tailwind + CSS-переменные темы
├── pages/
│   ├── Home.tsx             # главный экран: шапка, панели, сортировка, RepoGrid (292 строки)
│   └── Settings.tsx         # ввод PAT, проверка, предпочтения
├── components/
│   ├── FilterSidebar.tsx    # все фильтры (28 строк текста)
│   ├── RepoGrid.tsx         # сетка + IntersectionObserver + «загрузить ещё»
│   ├── RepoCard.tsx         # карточка репозитория
│   ├── Panel.tsx            # доступная модалка (role=dialog, Esc, фокус)
│   ├── BookmarksPanel.tsx, CollectionsPanel.tsx,
│   │   FollowedTopicsManager.tsx, IgnoreListManager.tsx   # панели персонализации
│   ├── SearchInput.tsx, MinStarsInput.tsx   # дебаунс-инпуты
│   ├── LanguageBadge.tsx, LicenseBadge.tsx, LicenseLegend.tsx, RepoStatsRow.tsx, BadgeCount.tsx
│   └── Icons.tsx            # SVG-иконки инлайном
├── hooks/
│   ├── useFilters.ts        # состояние фильтров ↔ URL query
│   ├── useSort.ts           # сортировка ↔ URL query
│   ├── useRepos.ts          # useInfiniteQuery, дедуп по id, emptyPageStreak
│   ├── usePersonalization.ts# подписки на стор предпочтений
│   ├── useAuth.ts           # ревизия токена для инвалидации кэша
│   ├── useTheme.ts          # dark/light, localStorage 'theme'
│   └── useClickOutside.ts
├── lib/
│   ├── github.ts            # REST search + GraphQL enrichment (362 строки)
│   ├── utils.ts             # buildGitHubQuery — сборка поискового запроса
│   ├── constants.ts         # TIME_RANGES, SORT_OPTIONS, лицензии, DEVELOPER_FILTERS
│   ├── developerFilters.ts  # 10 клиентских фильтров + requiredEnrichmentFields
│   ├── authStore.ts         # PAT в localStorage 'github_token', синк между вкладками
│   ├── userPreferences.ts   # букмарки/коллекции/топики/ignore в localStorage
│   ├── readmeLanguage.ts    # эвристика «README на английском»
│   ├── openExternal.ts      # внешние ссылки: opener в Tauri, window.open в браузере
│   ├── i18n.ts              # словари ru/en, t(), плюрализация Intl.PluralRules
│   ├── licenseLegend.ts, languageColors.ts
│   └── types/…              # типы REST-ответов и нормализованной модели
├── __tests__/               # 14 файлов, 183 теста (Vitest + RTL + MSW)
```

Оболочка:

```
src-tauri/
├── Cargo.toml               # пакет `dev-radar`, lib `dev_radar_lib`
├── tauri.conf.json          # окно 1280x800, bundle deb+appimage, identifier top.zulus.devradar
├── capabilities/default.json# выданные разрешения (opener:default)
├── icons/                   # icon.png, 32/64/128/128@2x, icns, ico
└── src/main.rs, lib.rs      # точка входа + Builder с tauri_plugin_opener
```

## Поток данных

```
UI (FilterSidebar / сортировка)
   → useFilters / useSort            состояние в URL (?timeRange=week&language=go…)
   → Home.tsx                        собирает параметры
   → useRepos (TanStack infinite)    ключ кэша: [repos, options, sort, order, authRevision]
   → fetchReposWithIntelligence
        ├─ buildGitHubQuery          "pushed:>… language:go stars:>50 archived:false fork:false"
        ├─ GET /search/repositories  REST, per_page=30 (DEFAULT_PER_PAGE), пагинация
        ├─ локальная фильтрация      ignore-топики, тип лицензии
        └─ POST /graphql             обогащение: openPRs, goodFirstIssues, contributors,
                                     recentCommits, releases, README (только при наличии токена;
                                     все имена уходят одним запросом, без чанкинга)
   → developerFilters (клиентски)    фильтрация по обогащённым полям
   → RepoGrid → RepoCard
```

Кэш: `staleTime` 5 минут, `retry` 1 (4xx не ретраится), отмена запросов через `AbortSignal`
при смене фильтров.

## Хранилище (localStorage)

| Ключ | Что лежит | Где |
|---|---|---|
| `github_token` | PAT открытым текстом | `lib/authStore.ts` |
| `github_dashboard_preferences` | букмарки, коллекции, подписки, ignore-листы | `lib/userPreferences.ts` |
| `theme` | `dark`/`light` | `hooks/useTheme.ts` |
| `dev_radar_language` | `ru`/`en` | `lib/i18n.ts` |

Синхронизация между вкладками — через `storage`-событие. Серверной части нет.

## Сеть и лимиты

- REST `api.github.com`: 60/ч анонимно, 5 000/ч с токеном.
- Search API: 10/мин анонимно, 30/мин с токеном. Максимум 1 000 результатов на запрос
  (страница 11+ вернёт 422).
- GraphQL: 5 000 points/ч, батчинг до ~50 репозиториев на запрос.
- CORS открыт (`allow-origin: *`, `Authorization` разрешён в preflight) — прокси не нужен.

## Точки расширения под наши фазы

| Задача | Где менять |
|---|---|
| ~~HashRouter для Tauri~~ | ~~`src/App.tsx`~~ — сделано в Фазе 1 |
| ~~Внешние ссылки в системный браузер~~ | ~~`src/lib/openExternal.ts`~~ — сделано в Фазе 1 (4 места) |
| ~~i18n~~ | ~~новый `src/lib/i18n.ts` + 30 файлов~~ — сделано в Фазе 2 |
| Настоящие тренды | `lib/github.ts` (источник), `hooks/useRepos.ts` (сортировка), `RepoCard.tsx` (бейдж), новый слой SQLite |
| Свои пресеты фильтров | `lib/constants.ts` + `hooks/useFilters.ts` (URL-схема уже расширяемая) |
| Хранение токена вне localStorage | `lib/authStore.ts` — единственная точка чтения/записи |

## Известные дефекты и ограничения

1. ~~**Сортировка «Most Open Issues» врёт.**~~ **Исправлено в Фазе 0:** опция удалена из UI и
   из `SortField` — GitHub не умеет сортировать по числу open issues
   (`help-wanted-issues` — не то же самое).
2. ~~**Сортировка «Most Open PRs» не работает.**~~ **Исправлено в Фазе 0:** опция удалена —
   API не поддерживает такую сортировку, а клиентская ломала бы пагинацию. Счётчики PR/issues
   на карточках остались.
3. **Скрытый floor по звёздам.** При `minStars = 0` в запрос всё равно уходит `stars:>50`
   (`lib/utils.ts:88`) — репозитории с меньшим числом звёзд не покажутся никогда.
4. **`low_competition` жёстко сужает звёзды** до `100..14999` (`lib/utils.ts:84`), перебивая
   пользовательский `minStars`.
5. **Developer-фильтры и README-фильтр требуют токен.** Без PAT GraphQL-обогащение
   пропускается (`lib/github.ts:172-175`), и фильтры молча дают пустой результат.
6. **Пагинация за 1 000 результатов.** `getNextPageParam` не ограничен, страница 11+ вернёт 422 —
   пользователь увидит ошибку загрузки на пустом месте.
7. **Токен в localStorage открытым текстом.** Для SPA приемлемо, для нативного клиента —
   переносим в SQLite.
8. **Тесты и Node 26.** Node 26 притащил экспериментальный `localStorage`, который перебивает jsdom.
   Оба скрипта (`npm test`, `npm run test:watch`) подставляют `NODE_OPTIONS=--no-experimental-webstorage`,
   поэтому тесты зелёные на Node 22 и 26.
9. ~~**Нет i18n.**~~ **Исправлено в Фазе 2:** `lib/i18n.ts` (196 ключей, ru/en), переключатель в настройках, локаль для дат и чисел.
10. ~~**Нет CI.**~~ **Исправлено в Фазе 0:** `.github/workflows/ci.yml`, Node 22, lint → typecheck → test → build.

## Как запускать

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # 183 теста (флаг --no-experimental-webstorage уже в скрипте)
npm run lint
npm run typecheck
npm run build      # dist/
npm run tauri:build  # deb + AppImage в src-tauri/target/release/bundle/
```
