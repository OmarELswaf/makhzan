// Pure mapping and ranking helpers for Makhzan.
// Every function takes plain API-shaped objects and returns plain view models,
// so the whole module is unit-testable with node:test and fixtures.

export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
};

export function languageColor(lang) {
  return LANGUAGE_COLORS[lang] || '#8b98b8';
}

export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function timeAgo(iso, now = Date.now()) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'unknown';
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function mapRepo(r) {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    url: r.html_url,
    description: r.description || '',
    language: r.language || null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    watchers: r.watchers_count ?? 0,
    openIssues: r.open_issues_count ?? 0,
    updatedAt: r.updated_at || r.pushed_at || null,
    updatedLabel: timeAgo(r.updated_at || r.pushed_at),
    topics: Array.isArray(r.topics) ? r.topics.slice(0, 5) : [],
    fork: Boolean(r.fork),
    archived: Boolean(r.archived),
    license: r.license?.spdx_id || null,
  };
}

export function mapUser(u) {
  return {
    id: u.id,
    login: u.login,
    url: u.html_url,
    avatar: u.avatar_url,
    name: u.name || null,
    bio: u.bio || null,
    company: u.company || null,
    location: u.location || null,
    blog: u.blog || null,
    followers: u.followers ?? null,
    following: u.following ?? null,
    publicRepos: u.public_repos ?? null,
    type: u.type || 'User',
  };
}

export function mapRepoSearch(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return {
    total: payload?.total_count ?? items.length,
    repos: items.map(mapRepo),
  };
}

export function mapUserSearch(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return {
    total: payload?.total_count ?? items.length,
    users: items.map(mapUser),
  };
}

export const SORTS = {
  stars: (a, b) => b.stars - a.stars,
  forks: (a, b) => b.forks - a.forks,
  updated: (a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0),
  name: (a, b) => a.name.localeCompare(b.name),
};

export function sortRepos(repos, key = 'stars') {
  const cmp = SORTS[key] || SORTS.stars;
  return [...repos].sort(cmp);
}

export function languagesOf(repos) {
  const counts = new Map();
  for (const r of repos) {
    if (!r.language) continue;
    counts.set(r.language, (counts.get(r.language) || 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: total ? Math.round((count / total) * 1000) / 10 : 0,
      color: languageColor(name),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
