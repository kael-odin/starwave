// 采集与关联：Trending 每小时、元数据每日、搜索每日、文章发布时解析 GitHub 链接。
import { sql, type Db } from "@aihot/backend/db";
import { extractRepoNames, fetchRepo, fetchTrending, searchNewRepos, hasToken } from "./client.ts";
import { markSync, trackedRepos, upsertGithub, upsertMention, upsertRepo, upsertTrending } from "./store.ts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncTrending(db: Db = sql): Promise<{ daily: number; weekly: number }> {
  let daily = 0;
  let weekly = 0;
  try {
    for (const period of ["daily", "weekly"] as const) {
      const repos = await fetchTrending(period);
      for (const repo of repos) {
        await upsertTrending(repo, db);
        if (period === "daily") daily += 1;
        else weekly += 1;
      }
      await sleep(400);
    }
    await markSync("trending", true, null, { daily, weekly }, db);
    return { daily, weekly };
  } catch (error) {
    await markSync("trending", false, String(error).slice(0, 500), { daily, weekly }, db);
    throw error;
  }
}

export async function syncMetadata(limit = 300, db: Db = sql): Promise<{ updated: number; failed: number }> {
  // 无 token 时 GitHub API 只有 60 次/小时：把预算收敛到 30 个仓库，宁可慢也不能把额度烧穿。
  const cap = hasToken() ? limit : Math.min(limit, 30);
  const repos = await trackedRepos(cap, db);
  let updated = 0;
  let failed = 0;
  for (const repo of repos) {
    try {
      const meta = await fetchRepo(repo.full_name);
      await upsertGithub(meta, db);
      updated += 1;
    } catch (error) {
      failed += 1;
      await db`UPDATE repos SET sync_error = ${String(error).slice(0, 300)} WHERE id = ${repo.id}`;
    }
    await sleep(hasToken() ? 120 : 1200);
  }
  await markSync("metadata", failed === 0, failed ? `${failed} 个仓库失败` : null, { updated, failed, cap: hasToken() ? "token" : "no-token" }, db);
  return { updated, failed };
}

export async function syncSearch(db: Db = sql): Promise<number> {
  const repos = await searchNewRepos();
  let n = 0;
  for (const repo of repos) {
    await upsertGithub(repo, db);
    n += 1;
    await sleep(hasToken() ? 120 : 1200);
  }
  await markSync("search", true, null, { found: n }, db);
  return n;
}

/** 文章发布/更新后，从 URL、标题和正文里解析 GitHub 仓库，建立关联。 */
export async function linkArticle(articleId: string, db: Db = sql): Promise<number> {
  const rows = await db<Array<{ url: string; title: string; body_text: string | null }>>`
    SELECT url, title, body_text FROM articles WHERE id = ${articleId}
  `;
  const article = rows[0];
  if (!article) return 0;
  const names = extractRepoNames(`${article.url}\n${article.title}\n${article.body_text ?? ""}`).slice(0, 8);
  let linked = 0;
  for (const fullName of names) {
    const [owner, name] = fullName.split("/");
    if (!owner || !name) continue;
    const id = await upsertRepo({
      fullName,
      owner,
      name,
      htmlUrl: `https://github.com/${fullName}`,
    }, db);
    await upsertMention(articleId, id, "url", db);
    linked += 1;
  }
  return linked;
}
