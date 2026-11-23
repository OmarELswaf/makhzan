import { formatNumber, languagesOf, sortRepos } from '../lib/github.js';
import RepoCard from './RepoCard.jsx';

export default function UserProfile({ profile, onClose }) {
  if (profile === 'loading') {
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-ink/80 backdrop-blur-sm">
        <p className="animate-pulse text-accent">Loading profile…</p>
      </div>
    );
  }
  if (profile.error) {
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-ink/80 backdrop-blur-sm" onClick={onClose}>
        <div className="rounded-xl border border-red-500/40 bg-panel p-6 text-sm text-red-300">{profile.error}</div>
      </div>
    );
  }
  const { user, repos } = profile;
  const own = repos.filter((r) => !r.fork);
  const top = sortRepos(own, 'stars').slice(0, 6);
  const langs = languagesOf(own);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-ink/85 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto my-8 w-[min(92vw,64rem)] rounded-2xl border border-line bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full border border-line" />
            <div>
              <h2 className="text-xl font-bold text-white">{user.name || user.login}</h2>
              <a href={user.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                @{user.login}
              </a>
              {user.bio && <p className="mt-1 max-w-xl text-sm text-slate-400">{user.bio}</p>}
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                {user.company && <span>🏢 {user.company}</span>}
                {user.location && <span>📍 {user.location}</span>}
                {user.followers != null && <span>👥 {formatNumber(user.followers)} followers</span>}
                {user.publicRepos != null && <span>📦 {formatNumber(user.publicRepos)} public repos</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-line px-3 py-1 text-sm text-slate-300 hover:text-white">
            ✕ Close
          </button>
        </div>

        {langs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300">Languages across own repos</h3>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-line/50">
              {langs.map((l) => (
                <span key={l.name} style={{ width: `${l.pct}%`, background: l.color }} title={`${l.name} ${l.pct}%`} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              {langs.map((l) => (
                <span key={l.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  {l.name} {l.pct}%
                </span>
              ))}
            </div>
          </div>
        )}

        <h3 className="mt-6 text-sm font-semibold text-slate-300">Top repositories by stars</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {top.map((r) => (
            <RepoCard key={r.id} repo={r} onOwner={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}
