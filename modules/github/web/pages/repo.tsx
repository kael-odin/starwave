import { Link, useLoaderData } from "react-router";
import type { ReactNode } from "react";
import { cachedPage, loadOr404, pageHeaders } from "@aihot/web/lib/api.server";
import { pageMeta } from "@aihot/web/lib/seo";
import type { RepoDetailResponse } from "@starwave/github/shared";
import { fmt, Sparkline, Delta, categoryLabel } from "../components.tsx";
import { StarMark } from "../../../../site/brand/Logo.tsx";

export { pageHeaders as headers };

export async function loader({ params, request }: { params: { owner?: string; name?: string }; request: Request }) {
  const owner = params.owner ?? "";
  const name = params.name ?? "";
  return cachedPage(120, { data: await loadOr404<RepoDetailResponse>(`/api/site/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, { signal: request.signal }) });
}

export function meta({ loaderData }: { loaderData?: { data?: RepoDetailResponse } }) {
  const repo = loaderData?.data?.repo;
  return pageMeta({
    title: repo ? `${repo.fullName}：${repo.description ?? "仓库档案"}` : "仓库档案",
    description: repo?.description ?? "星潮的开源仓库档案：星史、上手信息、风险与相关报道。",
    path: repo ? `/repos/${repo.owner}/${repo.name}` : "/repos",
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[14px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function RepoPage() {
  const { data } = useLoaderData<typeof loader>();
  const { repo } = data;
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6">
      <nav className="mb-4 text-[12px] text-ink-4">
        <Link to="/repos" className="hover:text-accent">仓库库</Link>
        <span className="mx-1.5">/</span>
        <span className="font-mono text-ink-3">{repo.fullName}</span>
      </nav>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-mono text-[26px] font-bold leading-tight text-ink">{repo.fullName}</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">{repo.description ?? "这个仓库还没有填写描述。"}</p>
          </div>
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 hover:border-accent hover:text-accent">GitHub ↗</a>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12.5px] text-ink-3">
          {repo.category && <span className="rounded-mark bg-accent-soft px-1.5 py-0.5 font-sans text-accent">{categoryLabel(repo.category)}</span>}
          <span>★ {fmt(repo.stars)}</span>
          <span>7d <Delta n={repo.starDelta7d} /></span>
          <span>30d <Delta n={repo.starDelta30d} /></span>
          {repo.language && <span>{repo.language}</span>}
          {repo.license && <span>{repo.license}</span>}
          {repo.pushedAt && <span>更新于 {repo.pushedAt.slice(0, 10)}</span>}
        </div>
        <div className="mt-4 flex items-center gap-3 text-hot">
          <Sparkline values={repo.spark} className="h-10 w-[180px]" />
          <span className="text-[11px] text-ink-4">30 天星史</span>
        </div>
      </header>

      {data.verdict && (
        <div className="mt-5 flex items-start gap-3 rounded-panel bg-accent-softer px-4 py-3.5">
          <StarMark size={20} className="mt-1 shrink-0 text-accent" />
          <p className="text-[17px] leading-relaxed text-ink">{data.verdict}</p>
        </div>
      )}

      {(data.useCases || data.requirements || data.risks) && (
        <div className="mt-5 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-3">
          {data.useCases && (
            <div className="bg-surface px-4 py-3">
              <h3 className="text-[12px] font-semibold text-accent">它能做什么</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{data.useCases}</p>
            </div>
          )}
          {data.requirements && (
            <div className="bg-surface px-4 py-3">
              <h3 className="text-[12px] font-semibold text-accent">上手</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{data.requirements}</p>
            </div>
          )}
          {data.risks && (
            <div className="bg-surface px-4 py-3">
              <h3 className="text-[12px] font-semibold text-hot">风险</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{data.risks}</p>
            </div>
          )}
        </div>
      )}

      <Section title={`相关报道（${data.mentions.length}）`}>
        {data.mentions.length === 0
          ? <p className="text-[12.5px] text-ink-4">还没有精选报道提到这个仓库。</p>
          : <div className="rounded-panel border border-line bg-surface">
              {data.mentions.map((m) => (
                <Link key={m.articleId} to={`/items/${m.articleId}`} className="block border-b border-line-soft px-3 py-3 last:border-0 hover:bg-accent-softer">
                  <span className="block text-[13.5px] font-medium leading-snug text-ink">{m.title}</span>
                  {m.summary && <span className="mt-1 line-clamp-2 block text-[12.5px] leading-relaxed text-ink-3">{m.summary}</span>}
                  <span className="mt-1 block text-[11.5px] text-ink-4">{m.publishedAt?.slice(0, 10) ?? ""}{m.score ? ` · ${m.score} 分` : ""}</span>
                </Link>
              ))}
            </div>}
      </Section>

      <Section title="相似仓库">
        <div className="grid gap-2 sm:grid-cols-2">
          {data.similar.map((r) => (
            <Link key={r.fullName} to={`/repos/${r.owner}/${r.name}`} className="rounded-card border border-line bg-surface px-3 py-2.5 hover:border-accent">
              <span className="block font-mono text-[13px] font-semibold text-ink">{r.fullName}</span>
              <span className="mt-0.5 line-clamp-1 block text-[12px] text-ink-3">{r.description ?? "—"}</span>
              <span className="mt-1 block font-mono text-[11px] text-ink-4">★ {fmt(r.stars)} · {r.language ?? "—"}</span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
