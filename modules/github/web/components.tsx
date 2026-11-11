import { Link } from "react-router";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import type { RankRow, RepoCard } from "@starwave/github/shared";

export const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString("en-US"));

const CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])),
  other: "未分类",
};

export const categoryLabel = (key: string | null | undefined) => (key ? CATEGORY_LABELS[key] ?? key : null);

/** 榜单分数条：0–100 的实际分数，一条细轨道，不加装饰。 */
export function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-full overflow-hidden rounded-full bg-well">
        <span className="block h-full rounded-full bg-accent" style={{ width: `${clamped}%` }} />
      </span>
      <span className="w-10 shrink-0 text-right font-mono text-[11px] text-ink-3">{clamped.toFixed(0)}</span>
    </span>
  );
}

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) return <span className={`text-[11px] text-ink-4 ${className}`}>—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 120},${30 - ((v - min) / span) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 120 32" className={`h-8 w-[120px] overflow-visible ${className}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-hot" />
    </svg>
  );
}

export function Delta({ n }: { n: number | null }) {
  if (n === null) return <span className="text-ink-4">—</span>;
  const sign = n > 0 ? "+" : "";
  return <span className={n > 0 ? "text-hot" : "text-ink-4"}>{sign}{n.toLocaleString("en-US")}</span>;
}

export function RepoRow({ repo, rank }: { repo: RepoCard; rank?: number }) {
  return (
    <Link to={`/repos/${repo.owner}/${repo.name}`} className="group flex items-start gap-3 border-b border-line-soft px-3 py-3 last:border-0 hover:bg-accent-softer">
      {rank !== undefined && (
        <span className={`w-7 shrink-0 pt-0.5 font-mono text-[13px] ${rank <= 3 ? "text-amber" : "text-ink-4"}`}>{String(rank).padStart(2, "0")}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-[14px] font-semibold text-ink group-hover:text-accent">{repo.fullName}</span>
          <span className="text-[12px] text-ink-4">★ {fmt(repo.stars)}</span>
          {repo.starDelta7d !== null && <span className="text-[12px] text-ink-4"><Delta n={repo.starDelta7d} /> / 7d</span>}
        </span>
        {repo.description && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-ink-3">{repo.description}</span>}
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-4">
          {repo.category && <span className="rounded-mark bg-accent-soft px-1.5 py-0.5 text-accent">{categoryLabel(repo.category)}</span>}
          {repo.language && <span>{repo.language}</span>}
          {repo.license && <span>{repo.license}</span>}
          {repo.topics.slice(0, 3).map((t) => <span key={t} className="rounded-mark bg-well px-1.5 py-0.5">{t}</span>)}
        </span>
      </span>
      <Sparkline values={repo.spark} className="mt-1 shrink-0" />
    </Link>
  );
}

export function RankList({ rows }: { rows: RankRow[] }) {
  return (
    <div className="rounded-panel border border-line bg-surface">
      {rows.map((r) => (
        <div key={r.repo.fullName} className="border-b border-line-soft px-3 py-3 last:border-0">
          <RepoRow repo={r.repo} rank={r.rank} />
          <div className="ml-10 mt-1.5 flex items-center gap-3">
            <p className="min-w-0 flex-1 text-[12px] text-ink-3">{r.reason}</p>
            <div className="w-28 shrink-0"><ScoreBar score={r.score} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
