import { formatNumber, languageColor } from '../lib/github.js';

export default function RepoCard({ repo, onOwner }) {
  const owner = repo.fullName.split('/')[0];
  return (
    <article className="flex flex-col rounded-xl border border-line bg-panel p-4 transition hover:border-accent/60">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button onClick={() => onOwner(owner)} className="text-xs text-slate-400 hover:text-accent">
            {owner} /
          </button>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-base font-semibold text-accent hover:underline"
          >
            {repo.name}
          </a>
        </div>
        <div className="flex shrink-0 gap-1">
          {repo.fork && <span className="rounded bg-line/60 px-1.5 py-0.5 text-[10px] text-slate-400">fork</span>}
          {repo.archived && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">archived</span>}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
        {repo.description || 'No description provided.'}
      </p>
      {repo.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {repo.topics.map((t) => (
            <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: languageColor(repo.language) }} />
            {repo.language}
          </span>
        )}
        <span title="Stars">★ {formatNumber(repo.stars)}</span>
        <span title="Forks">⑂ {formatNumber(repo.forks)}</span>
        <span className="ml-auto">{repo.updatedLabel}</span>
      </div>
    </article>
  );
}
