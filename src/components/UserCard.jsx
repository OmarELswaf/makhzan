export default function UserCard({ user, onOpen }) {
  return (
    <button
      onClick={() => onOpen(user.login)}
      className="flex items-center gap-3 rounded-xl border border-line bg-panel p-4 text-left transition hover:border-accent/60"
    >
      <img src={user.avatar} alt="" className="h-12 w-12 rounded-full" loading="lazy" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{user.login}</p>
        <p className="text-xs text-slate-400">{user.type}</p>
        <p className="mt-1 text-xs text-accent">View profile →</p>
      </div>
    </button>
  );
}
