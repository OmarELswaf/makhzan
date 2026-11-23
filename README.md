# Makhzan — GitHub Explorer

A fast client-side explorer for GitHub's public data: search 400M+ repositories and 100M+ developers, drill into profiles, languages and top repos. All data is **live** from the GitHub public REST API, no API key required.


## Features

- Repository search with debounced input, total-result counts and client-side sorting (stars, forks, recently updated, name)
- Developer search with profile drill-down: bio, followers, repo counts, company/location
- Profile view with a language-distribution bar computed across the user's own repos and their top repositories by stars
- Recent searches persisted in `localStorage`
- Graceful rate-limit messaging (unauthenticated API allows 60 requests/hour per IP)
- Dark, mobile-first UI

## Tech

React 18 · Vite 5 · Tailwind CSS 3 · GitHub REST API (`/search/repositories`, `/search/users`, `/users/{login}`, `/users/{login}/repos`)

## Architecture

Every API response passes through a pure mapping layer in `src/lib/github.js` (`mapRepo`, `mapUser`, `mapRepoSearch`, `mapUserSearch`, `sortRepos`, `languagesOf`, `formatNumber`, `timeAgo`). The mapping layer is fully unit-tested with `node:test` (9 tests) against real-shaped fixtures; `src/api.js` is a thin async wrapper over `fetch`.

## Run locally

```bash
npm install
npm run dev    # http://localhost:5173
npm test       # 9 unit tests
npm run build  # production build in dist/
```

## Deploy

Static build in `dist/` — deploys as-is on Vercel (Vite preset, no config needed).
