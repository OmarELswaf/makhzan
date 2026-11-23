import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapRepo,
  mapUser,
  mapRepoSearch,
  mapUserSearch,
  sortRepos,
  languagesOf,
  formatNumber,
  timeAgo,
  languageColor,
} from '../src/lib/github.js';

const repoFixture = {
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  html_url: 'https://github.com/facebook/react',
  description: 'The library for web and native user interfaces.',
  language: 'JavaScript',
  stargazers_count: 230000,
  forks_count: 47000,
  watchers_count: 230000,
  open_issues_count: 1000,
  updated_at: '2026-11-20T10:00:00Z',
  topics: ['react', 'ui', 'library', 'frontend', 'javascript', 'extra-dropped'],
  fork: false,
  archived: false,
  license: { spdx_id: 'MIT' },
};

test('mapRepo maps an API repo into the view model', () => {
  const r = mapRepo(repoFixture);
  assert.equal(r.name, 'react');
  assert.equal(r.fullName, 'facebook/react');
  assert.equal(r.stars, 230000);
  assert.equal(r.license, 'MIT');
  assert.equal(r.topics.length, 5, 'topics capped at 5');
  assert.equal(r.fork, false);
});

test('mapRepo tolerates missing fields', () => {
  const r = mapRepo({ id: 2, name: 'x', full_name: 'a/x', html_url: 'u' });
  assert.equal(r.stars, 0);
  assert.equal(r.language, null);
  assert.deepEqual(r.topics, []);
  assert.equal(r.description, '');
});

test('mapRepoSearch handles a search payload and empty payloads', () => {
  const s = mapRepoSearch({ total_count: 1, items: [repoFixture] });
  assert.equal(s.total, 1);
  assert.equal(s.repos[0].name, 'react');
  const empty = mapRepoSearch(undefined);
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.repos, []);
});

test('mapUser and mapUserSearch map user payloads', () => {
  const u = mapUser({ id: 7, login: 'octocat', html_url: 'u', avatar_url: 'a', followers: 12000, public_repos: 8 });
  assert.equal(u.login, 'octocat');
  assert.equal(u.followers, 12000);
  const s = mapUserSearch({ total_count: 2, items: [{ id: 1, login: 'a' }, { id: 2, login: 'b' }] });
  assert.equal(s.users.length, 2);
  assert.equal(s.total, 2);
});

test('sortRepos sorts by stars, forks, updated and name without mutating', () => {
  const repos = [
    mapRepo({ ...repoFixture, id: 1, name: 'b', stargazers_count: 5, forks_count: 9, updated_at: '2026-01-01T00:00:00Z' }),
    mapRepo({ ...repoFixture, id: 2, name: 'a', stargazers_count: 10, forks_count: 1, updated_at: '2026-06-01T00:00:00Z' }),
  ];
  assert.equal(sortRepos(repos, 'stars')[0].name, 'a');
  assert.equal(sortRepos(repos, 'forks')[0].name, 'b');
  assert.equal(sortRepos(repos, 'updated')[0].name, 'a');
  assert.equal(sortRepos(repos, 'name')[0].name, 'a');
  assert.equal(repos[0].name, 'b', 'input order unchanged');
});

test('languagesOf aggregates languages with percentages', () => {
  const langs = languagesOf([
    { language: 'TypeScript' },
    { language: 'TypeScript' },
    { language: 'Go' },
    { language: null },
  ]);
  assert.equal(langs[0].name, 'TypeScript');
  assert.equal(langs[0].count, 2);
  assert.equal(langs[0].pct, 66.7);
  assert.equal(langs[1].name, 'Go');
});

test('formatNumber compacts large counts', () => {
  assert.equal(formatNumber(999), '999');
  assert.equal(formatNumber(1500), '1.5k');
  assert.equal(formatNumber(230000), '230k');
  assert.equal(formatNumber(2400000), '2.4M');
  assert.equal(formatNumber(null), '0');
});

test('timeAgo renders relative labels', () => {
  const now = Date.parse('2026-11-23T12:00:00Z');
  assert.equal(timeAgo('2026-11-23T11:59:30Z', now), 'just now');
  assert.equal(timeAgo('2026-11-23T10:00:00Z', now), '2h ago');
  assert.equal(timeAgo('2026-10-20T12:00:00Z', now), '1mo ago');
  assert.equal(timeAgo('not-a-date', now), 'unknown');
});

test('languageColor falls back for unknown languages', () => {
  assert.equal(languageColor('Go'), '#00ADD8');
  assert.equal(languageColor('Brainfuck'), '#8b98b8');
});
