export default function SearchBar({ query, onQuery, mode, onMode, sort, onSort, recent, loading }) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={mode === 'repos' ? 'Search repositories… react, vite, machine learning' : 'Search developers… torvalds, gaearon'}
            className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-pulse text-xs text-accent">searching…</span>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex overflow-hidden rounded-lg border border-line">
            {['repos', 'users'].map((m) => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className={`px-4 py-2 text-sm capitalize transition ${
                  mode === m ? 'bg-accent text-ink font-semibold' : 'bg-panel text-slate-300 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mode === 'repos' && (
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value)}
              className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="stars">Most stars</option>
              <option value="forks">Most forks</option>
              <option value="updated">Recently updated</option>
              <option value="name">Name A–Z</option>
            </select>
          )}
        </div>
      </div>
      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Recent:</span>
          {recent.map((r) => (
            <button
              key={r}
              onClick={() => onQuery(r)}
              className="rounded-full border border-line px-3 py-1 text-xs text-slate-300 transition hover:border-accent hover:text-accent"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
