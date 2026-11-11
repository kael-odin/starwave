import { Link, useLoaderData } from "react-router";
import { cachedPage, loadOr404, pageHeaders } from "@aihot/web/lib/api.server";
import { pageMeta } from "@aihot/web/lib/seo";
import type { BoardPeriod, TrendingResponse } from "@starwave/github/shared";
import { RankList } from "../components.tsx";
import { Callout } from "../visuals.tsx";

export { pageHeaders as headers };

const TABS: Array<{ key: BoardPeriod; label: string }> = [
  { key: "daily", label: "日榜" },
  { key: "weekly", label: "周榜" },
  { key: "monthly", label: "月榜" },
  { key: "new", label: "新星榜" },
];

export async function loader({ request }: { request: Request }) {
  const q = new URL(request.url).searchParams;
  const raw = q.get("period");
  const period: BoardPeriod = raw === "daily" || raw === "monthly" || raw === "new" ? raw : "weekly";
  return cachedPage(120, { data: await loadOr404<TrendingResponse>(`/api/site/trending?period=${period}`, { signal: request.signal }) });
}

export function meta() {
  return pageMeta({
    title: "星榜：本周涨得最快的开源项目",
    description: "星潮的日/周/月/新星榜，按星速、社区讨论、编辑判断和活跃度综合排序；每条附排名理由。",
    path: "/trending",
  });
}

export default function TrendingPage() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6">
      <header className="mb-4">
        <h1 className="text-[26px] font-bold leading-tight text-ink">本周涨得最快的开源项目</h1>
        <Callout className="mt-3">{data.note}</Callout>
      </header>
      <nav className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.key} to={`/trending?period=${t.key}`} className={`rounded-full border px-3 py-1 text-[12.5px] ${data.period === t.key ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-3 hover:border-line-strong"}`}>
            {t.label}
          </Link>
        ))}
        {data.asOf && <span className="ml-auto self-center text-[11.5px] text-ink-4">统计截至 {data.asOf.slice(0, 10)}</span>}
      </nav>
      {data.rows.length === 0
        ? <p className="rounded-panel border border-line bg-surface px-4 py-10 text-center text-[13px] text-ink-3">还没有足够的快照。等第一次 Trending 抓取和次日快照后再来看。</p>
        : <RankList rows={data.rows} />}
      <Callout tone="warn" className="mt-4 text-[12px]">
        为什么不是按总 star 排：总 star 只会让老仓库一直赢。星潮看增量，并按仓库年龄做温和归一；社区与编辑信号目前是中性值，接入后会替换。
      </Callout>
    </div>
  );
}
