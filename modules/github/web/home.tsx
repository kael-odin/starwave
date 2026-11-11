// 首页的「星潮速览」：左边本周星榜 Top 5，右边仓库分类条形。数据从站点接口取，加载失败整块退场。
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { RepoListResponse, TrendingResponse } from "@starwave/github/shared";
import { ScoreBar, categoryLabel } from "./components.tsx";
import { BarList, Panel } from "./visuals.tsx";

const fmt = (n: number | null) => (n === null ? "—" : `+${n.toLocaleString("en-US")}`);

export default function HomeOverview() {
  const [trend, setTrend] = useState<TrendingResponse | null>(null);
  const [repos, setRepos] = useState<RepoListResponse | null>(null);
  const [grown, setGrown] = useState(false);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    // 组件卸载时中止请求：signal 挂到两个 fetch 上，AbortError 不落 dead。
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      fetch("/api/site/trending?period=weekly&limit=5", { signal }).then((r) => (r.ok ? r.json() as Promise<TrendingResponse> : Promise.reject(r.status))),
      fetch("/api/site/repos?limit=1", { signal }).then((r) => (r.ok ? r.json() as Promise<RepoListResponse> : Promise.reject(r.status))),
    ]).then(([t, r]) => { setTrend(t); setRepos(r); }).catch(() => { if (!signal.aborted) setDead(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!trend) return;
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [trend]);

  if (dead || (!trend && !repos)) return dead ? null : <OverviewSkeleton />;
  const asOf = trend?.asOf ? trend.asOf.slice(5, 10).replace("-", "/") : "";
  const bars = (repos?.categories ?? []).slice(0, 6).map((c) => ({ label: categoryLabel(c.key) ?? c.key, value: c.n, href: `/repos?category=${c.key}` }));

  return (
    <section className="mb-2 grid gap-3 lg:grid-cols-[3fr_2fr]">
      <Panel title="本周星榜" meta={asOf ? `weekly · ${asOf}` : "weekly"}>
        {trend && trend.rows.length > 0 ? (
          <div>
            {trend.rows.map((r) => (
              <div key={r.repo.fullName} className="border-b border-line-soft px-4 py-2.5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 shrink-0 font-mono text-[12px] ${r.rank <= 3 ? "text-amber" : "text-ink-4"}`}>{String(r.rank).padStart(2, "0")}</span>
                  <Link to={`/repos/${r.repo.owner}/${r.repo.name}`} className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold text-ink hover:text-accent">
                    {r.repo.fullName}
                  </Link>
                  <span className="shrink-0 font-mono text-[11.5px] text-hot">{fmt(r.starDelta)}</span>
                  <div className="w-20 shrink-0"><ScoreBar score={r.score} /></div>
                </div>
                <p className="ml-9 mt-0.5 truncate text-[12px] text-ink-3">{r.reason}</p>
              </div>
            ))}
            <div className="px-4 pb-3 pt-2">
              <Link to="/trending" className="text-[12px] text-accent hover:underline">完整星榜 →</Link>
            </div>
          </div>
        ) : (
          <p className="px-4 py-6 text-[12.5px] text-ink-3">还没有足够的快照。等 Trending 抓取和次日快照后，这里会出现本周涨得最快的仓库。</p>
        )}
      </Panel>

      <Panel title="仓库分类" meta={repos ? `${repos.total} 个仓库` : undefined}>
        {bars.length > 0 ? (
          <>
            <div className="py-1.5"><BarList rows={bars} grown={grown} /></div>
            <div className="border-t border-line-soft px-4 py-2.5">
              <Link to="/repos" className="text-[12px] text-accent hover:underline">进入仓库库，按分类 / 语言 / 规模浏览 →</Link>
            </div>
          </>
        ) : (
          <p className="px-4 py-6 text-[12.5px] text-ink-3">仓库还在收集中。</p>
        )}
      </Panel>
    </section>
  );
}

function OverviewSkeleton() {
  return (
    <section className="mb-2 grid gap-3 lg:grid-cols-[3fr_2fr]" aria-hidden="true">
      {[3, 2].map((rows, i) => (
        <div key={i} className="rounded-panel border border-line bg-surface">
          <div className="border-b border-line-soft px-4 py-3">
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-well" />
          </div>
          {Array.from({ length: rows }, (_, k) => (
            <div key={k} className="border-b border-line-soft px-4 py-3 last:border-0">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-well" />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
