// GitHub 的最小客户端：Trending HTML、仓库元数据、搜索。只用公开接口 + 可选 token，遵守速率。
import { load } from "cheerio";

const UA = "StarwaveBot/1.0 (+https://github.com/; open-source news)";

export type TrendingPeriod = "daily" | "weekly";

export interface TrendingRepo {
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number | null;
  forks: number | null;
  gained: number | null;
  period: TrendingPeriod;
}

export interface GithubRepo {
  fullName: string;
  owner: string;
  name: string;
  htmlUrl: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  licenseSpdx: string | null;
  licenseName: string | null;
  topics: string[];
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  subscribers: number | null;
  createdAt: string | null;
  pushedAt: string | null;
  archived: boolean;
  isFork: boolean;
  defaultBranch: string | null;
  avatarUrl: string | null;
}

const token = () => process.env.GITHUB_TOKEN?.trim() || null;

function headers(): Record<string, string> {
  const h: Record<string, string> = { accept: "application/vnd.github+json", "user-agent": UA };
  const t = token();
  if (t) h.authorization = `Bearer ${t}`;
  return h;
}

export function hasToken(): boolean {
  return token() !== null;
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(), ...(init?.headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status} ${url}${text ? `: ${text.slice(0, 160)}` : ""}`);
  }
  return res;
}

function num(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\d+/);
  return m ? Number(m[0]) : null;
}

/** 抓 GitHub Trending 页；不执行 JS，只解析服务端 HTML。 */
export async function fetchTrending(period: TrendingPeriod): Promise<TrendingRepo[]> {
  const res = await request(`https://github.com/trending?since=${period}`, { headers: { accept: "text/html" } });
  const html = await res.text();
  const $ = load(html);
  const rows: TrendingRepo[] = [];
  $("article.Box-row").each((_, el) => {
    const anchor = $(el).find("h2 a").first();
    const href = anchor.attr("href") ?? "";
    const fullName = href.replace(/^\//, "").trim();
    if (!/^[^/]+\/[^/]+$/.test(fullName)) return;
    const gainedText = $(el).find("span.d-inline-block.float-sm-right").first().text().trim();
    rows.push({
      fullName,
      description: $(el).find("p").first().text().trim() || null,
      language: $(el).find('[itemprop="programmingLanguage"]').first().text().trim() || null,
      stars: num($(el).find('a[href$="/stargazers"]').first().text()),
      forks: num($(el).find('a[href$="/forks"]').first().text()),
      gained: num(gainedText),
      period,
    });
  });
  return rows;
}

interface ApiRepo {
  full_name: string;
  name: string;
  owner?: { login?: string; avatar_url?: string };
  html_url: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  license?: { spdx_id?: string | null; name?: string | null } | null;
  topics?: string[];
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  subscribers_count?: number;
  created_at?: string;
  pushed_at?: string;
  archived?: boolean;
  fork?: boolean;
  default_branch?: string;
}

export function toGithubRepo(r: ApiRepo): GithubRepo {
  const [owner, name] = r.full_name.split("/");
  return {
    fullName: r.full_name,
    owner: r.owner?.login ?? owner ?? "",
    name: r.name ?? name ?? "",
    htmlUrl: r.html_url,
    description: r.description ?? null,
    homepage: r.homepage ?? null,
    language: r.language ?? null,
    licenseSpdx: r.license?.spdx_id ?? null,
    licenseName: r.license?.name ?? null,
    topics: r.topics ?? [],
    stars: r.stargazers_count ?? null,
    forks: r.forks_count ?? null,
    openIssues: r.open_issues_count ?? null,
    subscribers: r.subscribers_count ?? null,
    createdAt: r.created_at ?? null,
    pushedAt: r.pushed_at ?? null,
    archived: r.archived ?? false,
    isFork: r.fork ?? false,
    defaultBranch: r.default_branch ?? null,
    avatarUrl: r.owner?.avatar_url ?? null,
  };
}

export async function fetchRepo(fullName: string): Promise<GithubRepo> {
  const res = await request(`https://api.github.com/repos/${fullName}`);
  return toGithubRepo((await res.json()) as ApiRepo);
}

/** 新仓库：最近 180 天创建、stars ≥ 100，按 stars 排。 */
export async function searchNewRepos(days = 180, minStars = 100): Promise<GithubRepo[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const q = encodeURIComponent(`created:>${since} stars:>${minStars}`);
  const res = await request(`https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`);
  const body = (await res.json()) as { items?: ApiRepo[] };
  return (body.items ?? []).map(toGithubRepo);
}

/** GitHub 自己的页面段，不是仓库 owner：URL 文本里常见，误收会造出垃圾仓库。 */
const RESERVED_SEGMENTS = new Set([
  "topics", "search", "login", "marketplace", "sponsors", "settings", "orgs", "users", "collections",
  "trending", "explore", "apps", "features", "pricing", "readme", "events", "codespaces", "about",
  "customer-stories", "security", "developer", "support", "enterprise", "join", "site", "watching",
  "notifications", "new", "importer", "account", "update", "contact",
]);

/**
 * 从任意文本中取出 GitHub 仓库全名。
 * 边界：`www.` 先归一成主域；前向断言挡住 `developer.github.com` 这类子域；带点的仓库名
 * （vercel/next.js、tj/commander.js）是合法仓库；尾随的 `.git` 后缀和句尾 `.` 都剥掉。
 */
export function extractRepoNames(text: string): string[] {
  const out = new Set<string>();
  const normalized = text.replace(/\bwww\.github\.com/g, "github.com");
  const re = /(?<![A-Za-z0-9_.-])github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g;
  for (const m of normalized.matchAll(re)) {
    const owner = m[1] ?? "";
    const name = (m[2] ?? "").replace(/\.git$/i, "").replace(/\.+$/, "");
    if (!owner || !name || RESERVED_SEGMENTS.has(owner.toLowerCase())) continue;
    out.add(`${owner}/${name}`);
  }
  return [...out];
}
