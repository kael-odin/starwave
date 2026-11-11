// 仓库层的读写。所有查询都走 AIHOT 的 postgres.js 连接；模块不建自己的连接池。
import { sql, type Db } from "@aihot/backend/db";
import type { BoardPeriod, RankRow, RepoCard, RepoDetailResponse, RepoListResponse, TrendingResponse } from "../shared.ts";
import type { GithubRepo, TrendingRepo } from "./client.ts";
import { classifyRepo } from "./classify.ts";

export interface RepoUpsert {
  fullName: string;
  owner: string;
  name: string;
  htmlUrl: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  licenseSpdx?: string | null;
  licenseName?: string | null;
  topics?: string[];
  stars?: number | null;
  forks?: number | null;
  openIssues?: number | null;
  subscribers?: number | null;
  createdAt?: string | null;
  pushedAt?: string | null;
  archived?: boolean;
  isFork?: boolean;
  defaultBranch?: string | null;
  avatarUrl?: string | null;
  tracked?: boolean;
  fullSync?: boolean;
}

interface RepoRow {
  full_name: string;
  owner: string;
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  license: string | null;
  topics: string[];
  stars: number | null;
  forks: number | null;
  open_issues: number | null;
  repo_pushed_at: string | Date | null;
  repo_created_at: string | Date | null;
  archived: boolean;
  is_fork: boolean;
  avatar_url: string | null;
  category: string | null;
  stars_7d: number | null;
  stars_30d: number | null;
  spark: number[] | null;
}

const iso = (v: string | Date | null): string | null => (v ? new Date(v).toISOString() : null);

function card(r: RepoRow): RepoCard {
  const spark = (r.spark ?? []).filter((n): n is number => typeof n === "number");
  return {
    fullName: r.full_name,
    owner: r.owner,
    name: r.name,
    htmlUrl: r.html_url,
    description: r.description,
    homepage: r.homepage,
    language: r.language,
    license: r.license,
    topics: r.topics ?? [],
    stars: r.stars,
    forks: r.forks,
    openIssues: r.open_issues,
    pushedAt: iso(r.repo_pushed_at),
    createdAt: iso(r.repo_created_at),
    archived: r.archived,
    isFork: r.is_fork,
    avatarUrl: r.avatar_url,
    category: r.category,
    starDelta7d: r.stars_7d !== null && r.stars !== null ? r.stars - r.stars_7d : null,
    starDelta30d: r.stars_30d !== null && r.stars !== null ? r.stars - r.stars_30d : null,
    spark,
  };
}

const CARD_COLUMNS = sql`
  r.full_name, r.owner, r.name, r.html_url, r.description, r.homepage, r.language,
  r.license_spdx AS license, r.topics, r.stars, r.forks, r.open_issues,
  r.repo_pushed_at, r.repo_created_at, r.archived, r.is_fork, r.avatar_url, r.category,
  (SELECT s.stars FROM repo_snapshots s WHERE s.repo_id = r.id AND s.captured_on <= CURRENT_DATE - 7 ORDER BY s.captured_on DESC LIMIT 1) AS stars_7d,
  (SELECT s.stars FROM repo_snapshots s WHERE s.repo_id = r.id AND s.captured_on <= CURRENT_DATE - 30 ORDER BY s.captured_on DESC LIMIT 1) AS stars_30d,
  COALESCE((SELECT array_agg(s.stars ORDER BY s.captured_on) FROM repo_snapshots s WHERE s.repo_id = r.id AND s.captured_on >= CURRENT_DATE - 30), '{}') AS spark
`;

export async function upsertRepo(input: RepoUpsert, db: Db = sql): Promise<number> {
  const lower = input.fullName.toLowerCase();
  const rows = await db<{ id: number }[]>`
    INSERT INTO repos (
      full_name, full_name_lower, owner, name, html_url, description, homepage, language,
      license_spdx, license_name, topics, stars, forks, open_issues, subscribers,
      repo_created_at, repo_pushed_at, archived, is_fork, default_branch, avatar_url, tracked,
      last_synced_at
    ) VALUES (
      ${input.fullName}, ${lower}, ${input.owner}, ${input.name}, ${input.htmlUrl},
      ${input.description ?? null}, ${input.homepage ?? null}, ${input.language ?? null},
      ${input.licenseSpdx ?? null}, ${input.licenseName ?? null}, ${input.topics ?? []},
      ${input.stars ?? null}, ${input.forks ?? null}, ${input.openIssues ?? null}, ${input.subscribers ?? null},
      ${input.createdAt ?? null}, ${input.pushedAt ?? null}, ${input.archived ?? false}, ${input.isFork ?? false},
      ${input.defaultBranch ?? null}, ${input.avatarUrl ?? null}, ${input.tracked ?? false},
      ${input.fullSync ? new Date() : null}
    )
    ON CONFLICT (full_name_lower) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      owner = EXCLUDED.owner,
      name = EXCLUDED.name,
      html_url = EXCLUDED.html_url,
      description = COALESCE(EXCLUDED.description, repos.description),
      homepage = COALESCE(EXCLUDED.homepage, repos.homepage),
      language = COALESCE(EXCLUDED.language, repos.language),
      license_spdx = COALESCE(EXCLUDED.license_spdx, repos.license_spdx),
      license_name = COALESCE(EXCLUDED.license_name, repos.license_name),
      topics = CASE WHEN cardinality(EXCLUDED.topics) > 0 THEN EXCLUDED.topics ELSE repos.topics END,
      stars = COALESCE(EXCLUDED.stars, repos.stars),
      forks = COALESCE(EXCLUDED.forks, repos.forks),
      open_issues = COALESCE(EXCLUDED.open_issues, repos.open_issues),
      subscribers = COALESCE(EXCLUDED.subscribers, repos.subscribers),
      repo_created_at = COALESCE(EXCLUDED.repo_created_at, repos.repo_created_at),
      repo_pushed_at = COALESCE(EXCLUDED.repo_pushed_at, repos.repo_pushed_at),
      archived = EXCLUDED.archived OR repos.archived,
      is_fork = EXCLUDED.is_fork OR repos.is_fork,
      default_branch = COALESCE(EXCLUDED.default_branch, repos.default_branch),
      avatar_url = COALESCE(EXCLUDED.avatar_url, repos.avatar_url),
      tracked = EXCLUDED.tracked OR repos.tracked,
      last_synced_at = COALESCE(EXCLUDED.last_synced_at, repos.last_synced_at),
      sync_error = NULL
    RETURNING id
  `;
  return rows[0]!.id;
}

export async function saveSnapshot(repoId: number, stars: number | null, forks: number | null, openIssues: number | null, delta: number | null, db: Db = sql): Promise<void> {
  await db`
    INSERT INTO repo_snapshots (repo_id, captured_on, stars, forks, open_issues, star_delta)
    VALUES (${repoId}, CURRENT_DATE, ${stars}, ${forks}, ${openIssues}, ${delta})
    ON CONFLICT (repo_id, captured_on) DO UPDATE SET
      stars = COALESCE(EXCLUDED.stars, repo_snapshots.stars),
      forks = COALESCE(EXCLUDED.forks, repo_snapshots.forks),
      open_issues = COALESCE(EXCLUDED.open_issues, repo_snapshots.open_issues),
      star_delta = COALESCE(EXCLUDED.star_delta, repo_snapshots.star_delta)
  `;
}

export async function upsertTrending(r: TrendingRepo, db: Db = sql): Promise<number> {
  const [owner, name] = r.fullName.split("/");
  const id = await upsertRepo({
    fullName: r.fullName,
    owner: owner!,
    name: name!,
    htmlUrl: `https://github.com/${r.fullName}`,
    description: r.description,
    language: r.language,
    stars: r.stars,
    forks: r.forks,
  }, db);
  await saveSnapshot(id, r.stars, r.forks, null, r.gained, db);
  return id;
}

export async function upsertGithub(r: GithubRepo, db: Db = sql): Promise<number> {
  const id = await upsertRepo({
    fullName: r.fullName,
    owner: r.owner,
    name: r.name,
    htmlUrl: r.htmlUrl,
    description: r.description,
    homepage: r.homepage,
    language: r.language,
    licenseSpdx: r.licenseSpdx,
    licenseName: r.licenseName,
    topics: r.topics,
    stars: r.stars,
    forks: r.forks,
    openIssues: r.openIssues,
    subscribers: r.subscribers,
    createdAt: r.createdAt,
    pushedAt: r.pushedAt,
    archived: r.archived,
    isFork: r.isFork,
    defaultBranch: r.defaultBranch,
    avatarUrl: r.avatarUrl,
    fullSync: true,
  }, db);
  await saveSnapshot(id, r.stars, r.forks, r.openIssues, null, db);
  const category = classifyRepo({ name: r.name, description: r.description, topics: r.topics });
  if (category) await db`UPDATE repos SET category = COALESCE(category, ${category}) WHERE id = ${id}`;
  return id;
}

export async function listRepos(params: { limit?: number; offset?: number; sort?: "stars" | "pushed" | "delta"; language?: string | null; topic?: string | null; category?: string | null; minStars?: number } = {}, db: Db = sql): Promise<RepoListResponse> {
  const limit = Math.min(Math.max(params.limit ?? 30, 1), 100);
  const offset = Math.max(params.offset ?? 0, 0);
  const sort = params.sort ?? "stars";
  const minStars = Math.max(params.minStars ?? 0, 0);
  const order = sort === "pushed"
    ? sql`r.repo_pushed_at DESC NULLS LAST`
    : sort === "delta"
      ? sql`COALESCE(r.stars - (SELECT s.stars FROM repo_snapshots s WHERE s.repo_id = r.id AND s.captured_on <= CURRENT_DATE - 7 ORDER BY s.captured_on DESC LIMIT 1), 0) DESC`
      : sql`r.stars DESC NULLS LAST`;
  const where = sql`WHERE NOT r.is_fork AND NOT r.archived
    AND (${params.language ?? null}::text IS NULL OR r.language = ${params.language ?? null})
    AND (${params.topic ?? null}::text IS NULL OR ${params.topic ?? null} = ANY (r.topics))
    AND (${params.category ?? null}::text IS NULL OR r.category = ${params.category ?? null})
    AND COALESCE(r.stars, 0) >= ${minStars}`;
  const rows = await db<RepoRow[]>`
    SELECT ${CARD_COLUMNS} FROM repos r ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}
  `;
  const countRows = await db<{ n: number }[]>`SELECT count(*)::int AS n FROM repos r ${where}`;
  const categories = await db<{ key: string; n: number }[]>`
    SELECT coalesce(r.category, 'other') AS key, count(*)::int AS n FROM repos r
    WHERE NOT r.is_fork AND NOT r.archived GROUP BY 1 ORDER BY 2 DESC
  `;
  const languages = await db<{ key: string; n: number }[]>`
    SELECT r.language AS key, count(*)::int AS n FROM repos r
    WHERE NOT r.is_fork AND NOT r.archived AND r.language IS NOT NULL
    GROUP BY 1 ORDER BY 2 DESC LIMIT 10
  `;
  return {
    repos: rows.map(card),
    total: countRows[0]?.n ?? rows.length,
    sort,
    language: params.language ?? null,
    topic: params.topic ?? null,
    category: params.category ?? null,
    minStars,
    categories,
    languages,
  };
}

export async function getRepoByFullName(fullName: string, db: Db = sql): Promise<RepoCard | null> {
  const rows = await db<RepoRow[]>`SELECT ${CARD_COLUMNS} FROM repos r WHERE r.full_name_lower = ${fullName.toLowerCase()} LIMIT 1`;
  const row = rows[0];
  return row ? card(row) : null;
}

export async function getRepoDetail(fullName: string, db: Db = sql): Promise<RepoDetailResponse | null> {
  const repo = await getRepoByFullName(fullName, db);
  if (!repo) return null;
  const idRows = await db<{ id: number }[]>`SELECT id FROM repos WHERE full_name_lower = ${fullName.toLowerCase()}`;
  const id = idRows[0]?.id;
  if (!id) return null;
  const editorial = (await db<{ verdict_zh: string | null; use_cases_zh: string | null; requirements_zh: string | null; risks_zh: string | null }[]>`
    SELECT verdict_zh, use_cases_zh, requirements_zh, risks_zh FROM repo_editorial WHERE repo_id = ${id}
  `)[0];
  const mentions = await db<{ article_id: string; title: string; summary: string | null; url: string; timeline_at: string | Date; score: number | null }[]>`
    SELECT p.article_id, p.title, p.summary, p.url, p.timeline_at, p.score
    FROM repo_mentions m
    JOIN publications p ON p.article_id = m.article_id
    WHERE m.repo_id = ${id} AND p.visibility = 'public'
    ORDER BY p.timeline_at DESC LIMIT 12
  `;
  const similarRows = await db<RepoRow[]>`
    SELECT ${CARD_COLUMNS} FROM repos r
    WHERE r.id <> ${id} AND NOT r.is_fork AND NOT r.archived
      AND (r.language = ${repo.language} OR r.topics && ${repo.topics}
           OR (${repo.category} IS NOT NULL AND r.category = ${repo.category}))
    ORDER BY (r.language = ${repo.language}) DESC, r.stars DESC NULLS LAST LIMIT 4
  `;
  return {
    repo,
    verdict: editorial?.verdict_zh ?? null,
    useCases: editorial?.use_cases_zh ?? null,
    requirements: editorial?.requirements_zh ?? null,
    risks: editorial?.risks_zh ?? null,
    mentions: mentions.map((m) => ({
      articleId: m.article_id,
      title: m.title,
      summary: m.summary,
      url: m.url,
      publishedAt: iso(m.timeline_at),
      score: m.score,
    })),
    similar: similarRows.map(card),
  };
}

interface RankRowDb extends RepoRow {
  rank: number;
  score: number;
  star_delta: number | null;
  reason_zh: string;
}

export async function listRankings(period: BoardPeriod, limit = 30, db: Db = sql): Promise<TrendingResponse> {
  const rows = await db<RankRowDb[]>`
    SELECT rr.rank, rr.score, rr.star_delta, rr.reason_zh, ${CARD_COLUMNS}
    FROM repo_rankings rr
    JOIN repos r ON r.id = rr.repo_id
    WHERE rr.period = ${period}
      AND rr.as_of = (SELECT max(as_of) FROM repo_rankings WHERE period = ${period})
    ORDER BY rr.rank ASC LIMIT ${limit}
  `;
  const asOf = (await db<{ as_of: string | Date | null }[]>`SELECT max(as_of) AS as_of FROM repo_rankings WHERE period = ${period}`)[0]?.as_of ?? null;
  const note: Record<BoardPeriod, string> = {
    daily: "过去 24 小时的星速与社区讨论。首次快照后 24 小时才稳定。",
    weekly: "过去 7 天的 star 增量，按仓库年龄温和归一，再叠加编辑判断与活跃度。",
    monthly: "过去 30 天的持续性，不奖励单日暴涨。",
    new: "创建不超过 180 天、stars ≥ 100 的新仓库。",
  };
  return {
    period,
    asOf: iso(asOf),
    rows: rows.map((r): RankRow => ({
      rank: r.rank,
      repo: card(r),
      score: Number(r.score),
      starDelta: r.star_delta,
      reason: r.reason_zh,
    })),
    note: note[period],
  };
}

export async function upsertMention(articleId: string, repoId: number, foundBy: "url" | "model" | "manual" = "url", db: Db = sql): Promise<void> {
  await db`
    INSERT INTO repo_mentions (article_id, repo_id, role, found_by) VALUES (${articleId}, ${repoId}, ${"mention"}, ${foundBy})
    ON CONFLICT (article_id, repo_id) DO NOTHING
  `;
}

export async function saveRanking(period: BoardPeriod, asOf: string, rank: number, repoId: number, score: number, starDelta: number | null, reason: string, parts: { star: number; community: number; editorial: number; activity: number }, db: Db = sql): Promise<void> {
  await db`
    INSERT INTO repo_rankings (period, as_of, rank, repo_id, score, star_delta, star_score, community_score, editorial_score, activity_score, reason_zh)
    VALUES (${period}, ${asOf}, ${rank}, ${repoId}, ${score}, ${starDelta}, ${parts.star}, ${parts.community}, ${parts.editorial}, ${parts.activity}, ${reason})
    ON CONFLICT (period, as_of, repo_id) DO UPDATE SET
      rank = EXCLUDED.rank, score = EXCLUDED.score, star_delta = EXCLUDED.star_delta,
      star_score = EXCLUDED.star_score, community_score = EXCLUDED.community_score,
      editorial_score = EXCLUDED.editorial_score, activity_score = EXCLUDED.activity_score,
      reason_zh = EXCLUDED.reason_zh, computed_at = now()
  `;
}

export async function trackedRepos(limit = 500, db: Db = sql): Promise<Array<{ id: number; full_name: string }>> {
  return db<{ id: number; full_name: string }[]>`
    SELECT id, full_name FROM repos
    WHERE tracked OR last_synced_at IS NULL OR last_synced_at < now() - interval '7 days'
    ORDER BY tracked DESC, stars DESC NULLS LAST LIMIT ${limit}
  `;
}

export async function markSync(key: string, ok: boolean, error: string | null, value: Record<string, unknown> = {}, db: Db = sql): Promise<void> {
  await db`
    INSERT INTO repo_sync_state (key, value, last_run_at, last_ok_at, error)
    VALUES (${key}, ${sql.json(value as never)}, now(), ${ok ? new Date() : null}, ${error})
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value, last_run_at = now(),
      last_ok_at = COALESCE(EXCLUDED.last_ok_at, repo_sync_state.last_ok_at),
      error = EXCLUDED.error
  `;
}

export async function reposForSitemap(limit = 500, db: Db = sql): Promise<Array<{ owner: string; name: string; updated_at: string | Date }>> {
  return db<Array<{ owner: string; name: string; updated_at: string | Date }>>`
    SELECT owner, name, COALESCE(repo_pushed_at, first_seen_at) AS updated_at FROM repos
    WHERE NOT archived ORDER BY stars DESC NULLS LAST LIMIT ${limit}
  `;
}
