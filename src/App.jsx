import { useCallback, useEffect, useRef, useState } from 'react';
import { searchRepos, searchUsers, getUser, getUserRepos } from './api.js';
import { sortRepos, formatNumber } from './lib/github.js';
import SearchBar from './components/SearchBar.jsx';
import RepoCard from './components/RepoCard.jsx';
import UserCard from './components/UserCard.jsx';
import UserProfile from './components/UserProfile.jsx';

const RECENT_KEY = 'makhzan:recent';

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

export default function App() {
  const [mode, setMode] = useState('repos'); // 'repos' | 'users'
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('stars');
  const [state, setState] = useState({ status: 'idle' }); // idle | loading | error | done
  const [profile, setProfile] = useState(null); // { user, repos } | 'loading'
  const [recent, setRecent] = useState(loadRecent);
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (q, m) => {
    if (!q.trim()) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const data = m === 'repos' ? await searchRepos(q) : await searchUsers(q);
      setState({ status: 'done', data, mode: m, query: q });
      setRecent((prev) => {
        const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* private mode */
        }
        return next;
      });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query, mode), 450);
    return () => clearTimeout(debounceRef.current);
  }, [query, mode, runSearch]);

  async function openProfile(login) {
    setProfile('loading');
    try {
      const [user, repos] = await Promise.all([getUser(login), getUserRepos(login)]);
      setProfile({ user, repos });
    } catch (err) {
      setProfile({ error: err.message });
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-lg">🗄️</span>
            <div>
              <h1 className="text-lg font-bold text-white">Makhzan</h1>
              <p className="text-xs text-slate-400">GitHub explorer · live public API, no key</p>
            </div>
          </div>
          <a
            className="rounded-md border border-line px-3 py-1.5 text-xs text-slate-300 transition hover:border-accent hover:text-accent"
            href="https://github.com/OmarELswaf/makhzan"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <SearchBar
          query={query}
          onQuery={setQuery}
          mode={mode}
          onMode={(m) => {
            setMode(m);
            setState({ status: 'idle' });
          }}
          sort={sort}
          onSort={setSort}
          recent={recent}
          loading={state.status === 'loading'}
        />

        {state.status === 'idle' && !profile && (
          <div className="mt-16 text-center text-slate-400">
            <p className="text-5xl">🔭</p>
            <p className="mt-4 text-lg text-slate-300">Search GitHub's 400M+ repositories or 100M+ developers.</p>
            <p className="mt-1 text-sm">Everything you see is live data from the public GitHub API.</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.message}
          </div>
        )}

        {state.status === 'done' && (
          <p className="mt-6 text-sm text-slate-400">
            {formatNumber(state.data.total)} {state.mode === 'repos' ? 'repositories' : 'developers'} matching
            <span className="text-accent"> “{state.query}”</span>
          </p>
        )}

        {state.status === 'done' && state.mode === 'repos' && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sortRepos(state.data.repos, sort).map((r) => (
              <RepoCard key={r.id} repo={r} onOwner={openProfile} />
            ))}
          </div>
        )}

        {state.status === 'done' && state.mode === 'users' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.data.users.map((u) => (
              <UserCard key={u.id} user={u} onOpen={openProfile} />
            ))}
          </div>
        )}

        {profile && (
          <UserProfile profile={profile} onClose={() => setProfile(null)} />
        )}
      </main>

      <footer className="mt-16 border-t border-line py-6 text-center text-xs text-slate-500">
        Built by Omar Elsawaf · React + Vite + Tailwind · GitHub REST API (60 req/hr per IP, unauthenticated)
      </footer>
    </div>
  );
}
