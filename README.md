<!-- markdownlint-disable MD013 MD060 -->

# GitHub Dashboard

## Stop hunting for cool repos. Start discovering them.

Filter GitHub's trending landscape by language, license, stars, topics, and more. Bookmark gems, organize collections, ignore noise. All client-side — your data stays yours.

![GitHub Dashboard screenshot](./public/Screenshot%20from%202026-05-09%2010-37-26.png)

[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 6](https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 7](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Query 5](https://img.shields.io/badge/TanStack_Query_5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![GitHub REST + GraphQL](https://img.shields.io/badge/GitHub_REST_%2B_GraphQL-181717?style=for-the-badge&logo=github&logoColor=white)](https://docs.github.com/en/rest)
[![Created with OpenCode](https://raw.githubusercontent.com/openchamber/openchamber/main/docs/references/badges/created-with-opencode.svg)](https://opencode.ai)

---

## Features

### 📈 Trending Feed

Discover repositories updated in the last **24 hours**, **7 days**, or
**30 days** sorted by stars — no GitHub trending page needed.

- ⏱️ Time range selector: **Today** / **This Week** / **This Month**
- > ⏱️ 30 days is the upper limit because GitHub has no official trending API.
  > Beyond a month, `pushed:>YYYY-MM-DD stars:>50 sort:stars` returns the
  > all-time most-starred repos (React, Vue, etc.) every time — the "trending"
  > signal disappears. Shorter windows surface repos actively gaining traction.
- ♾️ Infinite scroll pagination via `IntersectionObserver`, with a manual
  "Load more" fallback when many pages get filtered out client-side
- 📱 Fully responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### ✨ Sorting

| Sort                     | Description                         |
|--------------------------|-------------------------------------|
| ⭐ **Most Starred**       | Descending by stargazer count       |
| 🍴 **Most Forked**        | Descending by fork count            |
| 🕐 **Recently Updated**   | Last push date descending           |
| ✨ **Best Match**         | GitHub relevance ranking            |

### 🔍 Filters

| Filter          | How it works                                          |
|-----------------|-------------------------------------------------------|
| **Language**    | Multi-select from curated list, maps to API query     |
| **License**     | Dropdown: All, Open Source Only, No License, or specific (MIT, Apache-2.0, GPL-3.0, etc.) |
| **Topic tags**  | Free-text chip input → `topic:<tag>` in query         |
| **Min Stars**   | Number input in sort bar — filter by minimum star count |
| **Archived**    | Show/hide archived repos (hidden by default)          |
| **Forks**       | Show/hide forked repos (hidden by default)            |
| **README Lang** | All Languages / English Only (client-side detection, requires PAT) |

### 🧠 Developer-Centric Filters

Ten purpose-built filters applied client-side for detection that
GitHub search qualifiers can't express:

| Filter                | Icon | What it finds                               |
|-----------------------|------|---------------------------------------------|
| **Beginner-friendly** | 🌱   | Low complexity, learning-oriented            |
| **Good First Issue**  | 🎯   | Repos with labeled good-first-issues         |
| **Actively Maintained**| 🔧  | Recent commits, active contributors          |
| **Solo Project**      | 👤   | Single/small-team maintained                 |
| **Production Ready**  | 🚀   | Stable, licensed, widely used                |
| **AI/ML**             | 🤖   | Machine learning, LLMs, neural networks      |
| **Indie Project**     | 🎨   | Small, creative, independent projects        |
| **New & Exploding**   | 💥   | Recently created projects with stars           |
| **Low Competition**   | 💎   | Undiscovered gems with quality signals       |
| **Enterprise**        | 🏢   | Large-scale, cloud-native, infrastructure    |

### 👤 Personalization

All data stored in `localStorage` — no backend required.

- 🔖 **Bookmarks** — save repos for later with one click
- 📂 **Collections** — organize repos into custom groups
- 👁️ **Followed Topics** — recommendations based on followed topics
- 🚫 **Ignore List** — hide repos matching unwanted topics/languages
- 🔗 **Shareable URLs** — every filter/sort combo is uniquely bookmarkable

### 🎨 UI & Accessibility

- 🌙 **Dark mode by default** with light toggle (persisted, respects
  system preference)
- 🗂️ **Collapsible sidebar** with all filters — hamburger menu on mobile, sticky on desktop
- ⌨️ Full keyboard navigation and ARIA labels
- 🪟 Accessible modal panels — `role="dialog"`, Escape to close, focus moves into the dialog
- 💀 Skeleton loading states (never a blank screen)
- ⚠️ Error states with retry buttons and rate-limit countdowns
- 🗳️ Empty states with reset-filters CTAs

---

## Tech Stack

| Layer             | Choice                                                  |
|-------------------|---------------------------------------------------------|
| **Framework**     | React 19 + Vite 7                                       |
| **Language**      | TypeScript 6                                            |
| **Styling**       | Tailwind CSS 3                                          |
| **Data Fetching** | TanStack Query 5 with infinite scroll                   |
| **Routing**       | React Router 7                                          |
| **Dates**         | date-fns 4                                              |
| **Testing**       | Vitest 4 + React Testing Library + MSW 2                |
| **Linting**       | ESLint 10 with typescript-eslint                        |

---

## Project Structure

```text
src/
├── App.tsx                      # Route table with lazy-loaded pages
├── components/
│   ├── Icons.tsx                  # SVG icon components
│   ├── Panel.tsx                  # Reusable accessible modal panel
│   ├── RepoCard.tsx               # Individual repo display card
│   ├── RepoGrid.tsx               # Grid layout with infinite scroll
│   ├── FilterSidebar.tsx          # Collapsible sidebar with all filters
│   ├── SearchInput.tsx            # Debounced keyword search
│   ├── MinStarsInput.tsx          # Debounced minimum-stars input
│   ├── LanguageBadge.tsx          # Color-coded language indicator
│   ├── LicenseBadge.tsx           # Open source / proprietary badge
│   ├── LicenseLegend.tsx          # License legend panel
│   ├── BookmarksPanel.tsx         # Saved repos modal
│   ├── CollectionsPanel.tsx       # Collection manager modal
│   ├── FollowedTopicsManager.tsx  # Topic following modal
│   └── IgnoreListManager.tsx      # Ignore list modal
├── hooks/
│   ├── useAuth.ts                 # React binding for auth revision store
│   ├── useClickOutside.ts         # Detect clicks outside an element
│   ├── useRepos.ts                # TanStack Query infinite data hook
│   ├── useFilters.ts              # URL-synced, validated filter state
│   ├── useSort.ts                 # URL-synced, validated sort state
│   ├── usePersonalization.ts      # Preference store hooks + selectors
│   └── useTheme.ts                # Dark/light mode hook
├── lib/
│   ├── authStore.ts               # PAT store with cross-tab sync
│   ├── github.ts                  # REST + GraphQL API client
│   ├── utils.ts                   # Formatting helpers
│   ├── constants.ts               # Options, licenses, dev filters
│   ├── developerFilters.ts        # Client-side filter evaluation
│   ├── languageColors.ts          # Language dot color map
│   ├── licenseLegend.ts           # Open source license guide
│   ├── readmeLanguage.ts          # English README detection
│   └── userPreferences.ts         # Preference store + CRUD
├── pages/
│   ├── Home.tsx                   # Main trending feed
│   └── Settings.tsx               # PAT input, preferences
├── types/
│   └── github.ts                  # API response types
├── __mocks__/
│   └── handlers.ts                # MSW handlers for testing
└── __tests__/                     # Unit + component tests
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 9

### Install

```bash
git clone https://github.com/plamen5rov/github-dashboard.git
cd github-dashboard
npm install
```

### Development

```bash
npm run dev
```

Opens at <http://localhost:5173>.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

---

## GitHub API & Authentication

The app uses both **REST** (search) and **GraphQL** (enrichment) APIs. Most features work without authentication, but providing a GitHub Personal Access Token unlocks the full experience.

![Settings page](./public/Screenshot%20from%202026-05-09%2011-11-24.png)

### What a PAT unlocks

| Without PAT                          | With PAT                                          |
|--------------------------------------|---------------------------------------------------|
| 60 requests/hour (Core API)          | 5,000 requests/hour (Core API)                   |
| 10 requests/minute (Search API)      | 30 requests/minute (Search API)                  |
| Basic search results only            | Enriched repo data (PR/issue counts, languages)  |
| No README language detection         | English README detection enabled                  |

### How to get one

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)** (or Fine-grained tokens)
2. Give it a name, set expiration, and select **"Only select repositories"** (or no repo access — the token only reads public data)
3. No scopes needed for public data; add `Metadata: Read` if prompted
4. Copy the token and paste it in the app's **Settings** page (`/settings`) — it is validated against GitHub before saving, so invalid or expired tokens are rejected immediately

The token is stored in **`localStorage`** and sent **only** to GitHub API endpoints.

> ⚠️ Never commit tokens to source control. `.env.local` is gitignored.

---

## Testing

167 tests covering store logic, URL validation, query building, pagination,
component rendering, filter logic, and language detection.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run a single test file
npx vitest run src/__tests__/utils.test.ts

# Type-check without emitting
npm run typecheck

# Lint
npm run lint
```

### Test stack

| Tool                    | Purpose                  |
|-------------------------|--------------------------|
| **Vitest 4**            | Test runner              |
| **React Testing Library**| Component testing       |
| **MSW 2**               | API mocking (REST + GQL) |
| **jsdom**               | DOM environment          |

---

## Scripts

| Command                    | Action                     |
|----------------------------|----------------------------|
| `npm run dev`              | Start dev server           |
| `npm run build`            | Type-check + build         |
| `npm run preview`          | Preview production build   |
| `npm test`                 | Run all tests              |
| `npm run test:watch`       | Tests in watch mode        |
| `npm run typecheck`        | TypeScript type check      |
| `npm run lint`             | ESLint                     |

---

## Support This Project ⭐

If you find GitHub Dashboard useful, consider giving it a star on GitHub — it helps others discover it.

[![Star this repo](https://img.shields.io/github/stars/plamen5rov/github-dashboard?style=for-the-badge&logo=github&logoColor=white&label=Star%20this%20repo&color=FFD700)](https://github.com/plamen5rov/github-dashboard)

## Star History

[![Star History Chart](https://api.star-history.com/chart?repos=plamen5rov/github-dashboard&type=timeline&logscale&legend=top-left)](https://www.star-history.com/#plamen5rov/github-dashboard&timeline)

---

## License

MIT
