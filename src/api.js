// Thin async layer over the GitHub public REST API (no key, 60 req/hr per IP).
import { mapRepo, mapRepoSearch, mapUser, mapUserSearch } from './lib/github.js';

const BASE = 'https://api.github.com';
const HEADERS = { Accept: 'application/vnd.github+json' };

async function request(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (res.status === 403) {
    const reset = res.headers.get('x-ratelimit-reset');
    const when = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub rate limit reached for this IP. It resets around ${when}.`);
  }
  if (res.status === 404) throw new Error('Not found on GitHub.');
  if (!res.ok) throw new Error(`GitHub returned ${res.status}.`);
  return res.json();
}

export async function searchRepos(query, page = 1) {
  const q = encodeURIComponent(query);
  return mapRepoSearch(await request(`/search/repositories?q=${q}&per_page=12&page=${page}`));
}

export async function searchUsers(query, page = 1) {
  const q = encodeURIComponent(query);
  return mapUserSearch(await request(`/search/users?q=${q}&per_page=12&page=${page}`));
}

export async function getUser(login) {
  return mapUser(await request(`/users/${encodeURIComponent(login)}`));
}

export async function getUserRepos(login) {
  const items = await request(`/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated`);
  return (Array.isArray(items) ? items : []).map(mapRepo);
}
