import { Link, useLoaderData } from "react-router";
import { cachedPage, loadOr404, pageHeaders } from "@aihot/web/lib/api.server";
import { pageMeta } from "@aihot/web/lib/seo";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import type { RepoListResponse } from "@starwave/github/shared";
import { RepoRow } from "../components.tsx";

export { pageHeaders as headers };

const SORTS = [
  { key: "stars", label: "最多 star" },
  { key: "delta", label: "7 天星速" },
  { key: "pushed", label: "最近更新" },
] as const;

const STAR_LEVELS = [
  { key: "", label: "全部" },
  { key: "1000", label: "1k+" },
  { key: "10000", label: "10k+" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])),
  other: "未分类",
};

export async function loader({ request }: { request: Request }) {
  const q = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  const sort = q.get("sort");
  params.set("sort", sort === "pushed" || sort === "delta" ? sort : "stars");
  params.set("limit", "60");
  const language = q.get("language");
  const topic = q.get("topic");
  const category = q.get("category");
  const minStars = q.get("minStars");
  if (language) params.set("language", language);
  if (topic) params.set("topic", topic);
  if (category) params.set("category", category);
  if (minStars === "1000" || minStars === "10000") params.set("minStars", minStars);
  return cachedPage(60, { data: await loadOr404<RepoListResponse>(`/api/site/repos?${params}`, { signal: request.signal }) });
}

export function meta() {
  return pageMeta({
    title: "仓库库：值得上手的开源项目",
    description: "星潮收录的开源仓库，按分类、语言、星速和 star 规模分层浏览；每个仓库有档案、星史和相关报道。",
    path: "/repos",
  });
}

function href(current: RepoListResponse, patch: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  const sort = patch.sort ?? (current.sort === "stars" ? undefined : current.sort);
  const category = patch.category ?? (current.category ?? undefined);
  const language = patch.language ?? (current.language ?? undefined);
  const minStars = patch.minStars ?? (current.minStars ? String(current.minStars) : undefined);
  if (sort) q.set("sort", sort);
  if (category) q.set("category", category);
  if (language) q.set("language", language);
  if (minStars) q.set("minStars", minStars);
  const s = q.toString();
  return `/repos${s ? `?${s}` : ""}`;
}

function Chip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`rounded-full border px-3 py-1 text-[12.5px] ${active ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-3 hover:border-line-strong"}`}>
      {children}
    </Link>
  );
}

export default function ReposPage() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-[26px] font-bold leading-tight text-ink">值得上手的开源项目</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-3">
          共 {data.total.toLocaleString("en-US")} 个仓库。分类来自仓库描述、topics 和关联报道；介绍由模型生成，数字以 GitHub 为准。
        </p>
      </header>

      <nav className="mb-3 flex flex-wrap gap-2">
        <Chip to={href(data, { category: undefined })} active={!data.category}>全部</Chip>
        {data.categories.map((c) => (
          <Chip key={c.key} to={href(data, { category: c.key === "other" ? "other" : c.key })} active={data.category === c.key}>
            {CATEGORY_LABELS[c.key] ?? c.key}
            <span className="ml-1 font-mono text-[11px] opacity-70">{c.n}</span>
          </Chip>
        ))}
      </nav>

      <nav className="mb-3 flex flex-wrap gap-2">
        <Chip to={href(data, { minStars: undefined })} active={!data.minStars}>全部规模</Chip>
        <Chip to={href(data, { minStars: "1000" })} active={data.minStars === 1000}>1k+ stars</Chip>
        <Chip to={href(data, { minStars: "10000" })} active={data.minStars === 10000}>10k+ stars</Chip>
        {data.languages.map((l) => (
          <Chip key={l.key} to={href(data, { language: data.language === l.key ? undefined : l.key })} active={data.language === l.key}>
            {l.key}
            <span className="ml-1 font-mono text-[11px] opacity-70">{l.n}</span>
          </Chip>
        ))}
      </nav>

      <nav className="mb-4 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <Chip key={s.key} to={href(data, { sort: s.key === "stars" ? undefined : s.key })} active={data.sort === s.key}>
            {s.label}
          </Chip>
        ))}
      </nav>

      <div className="rounded-panel border border-line bg-surface">
        {data.repos.length === 0
          ? <p className="px-4 py-10 text-center text-[13px] text-ink-3">这个组合下还没有仓库。换一个分类或规模，或等下一次 Trending 抓取。</p>
          : data.repos.map((repo) => <RepoRow key={repo.fullName} repo={repo} />)}
      </div>
    </div>
  );
}
