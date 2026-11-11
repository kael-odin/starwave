// 星潮仓库层的后端：站点接口、定时采集、文章关联、站点地图与 llms.txt。
import { defineServerModule } from "@aihot/backend/modules";
import { sql } from "@aihot/backend/db";
import type { BoardPeriod } from "./shared.ts";
import { listRankings, listRepos, getRepoDetail, reposForSitemap } from "./backend/store.ts";
import { computeRankings } from "./backend/rank.ts";
import { linkArticle, syncMetadata, syncSearch, syncTrending } from "./backend/sync.ts";
import { generateRepoIntros } from "./backend/intro.ts";
import { classifyRepos } from "./backend/classify.ts";

const PERIODS: readonly BoardPeriod[] = ["daily", "weekly", "monthly", "new"];
const isPeriod = (v: unknown): v is BoardPeriod => typeof v === "string" && (PERIODS as readonly string[]).includes(v);

export const githubServer = defineServerModule({
  name: "github",
  http(app) {
    app.get("/api/site/repos", async (req, reply) => {
      const q = req.query as Record<string, string | undefined>;
      const sort = q.sort === "pushed" || q.sort === "delta" ? q.sort : "stars";
      const minStars = ["1000", "10000"].includes(q.minStars ?? "") ? Number(q.minStars) : 0;
      const payload = await listRepos({
        limit: Number(q.limit ?? 30),
        offset: Number(q.offset ?? 0),
        sort,
        language: q.language ?? null,
        topic: q.topic ?? null,
        category: q.category ?? null,
        minStars,
      });
      void reply.header("Cache-Control", "public, max-age=60, s-maxage=60");
      return payload;
    });

    app.get("/api/site/repos/:owner/:name", async (req, reply) => {
      const p = req.params as { owner: string; name: string };
      const detail = await getRepoDetail(`${p.owner}/${p.name}`);
      if (!detail) return reply.code(404).send({ error: "not_found" });
      void reply.header("Cache-Control", "public, max-age=120, s-maxage=120");
      return detail;
    });

    app.get("/api/site/trending", async (req, reply) => {
      const q = req.query as Record<string, string | undefined>;
      const period = isPeriod(q.period) ? q.period : "weekly";
      const payload = await listRankings(period, Number(q.limit ?? 30));
      void reply.header("Cache-Control", "public, max-age=120, s-maxage=120");
      return payload;
    });
  },
  schedules: [
    { name: "github.trending", cron: "17 * * * *", run: () => syncTrending() },
    { name: "github.search", cron: "10 4 * * *", run: () => syncSearch() },
    { name: "github.metadata", cron: "10 3 * * *", run: () => syncMetadata() },
    { name: "github.rankings", cron: "10 5 * * *", run: () => computeRankings() },
    { name: "github.classify", cron: "25 5 * * *", run: () => classifyRepos() },
    { name: "github.repo-intro", cron: "40 5 * * *", run: () => generateRepoIntros(40) },
  ],
  models: {
    repoIntro: { label: "仓库介绍（头部仓库的一句话中文判断、上手与风险）", env: "REPO_INTRO_MODEL", purposes: ["repo_intro"] },
  },
  on: {
    articleChanged: async (change, tx) => {
      await linkArticle(change.id, tx);
    },
  },
  sitemap: {
    entries: async () => {
      const repos = await reposForSitemap();
      return repos.map((r) => ({
        loc: `/repos/${r.owner}/${r.name}`,
        lastmod: r.updated_at ? new Date(r.updated_at) : null,
        changefreq: "daily",
        priority: 0.5,
      }));
    },
  },
  llms: () => ({
    pages: [
      "- [仓库库](/repos): 已收录的开源仓库，按 star、最近更新或 7 天星速排序",
      "- [星榜](/trending): 日/周/月/新星榜，每条附排名理由",
    ],
  }),
  retention: async (now) => {
    // 社区信号保留 90 天；榜单保留 2 年。
    const signals = await sql`DELETE FROM repo_signals WHERE captured_at < ${new Date(now.getTime() - 90 * 86_400_000)}`;
    const rankings = await sql`DELETE FROM repo_rankings WHERE as_of < ${new Date(now.getTime() - 730 * 86_400_000)}::date`;
    return { module: "github", signals: signals.count, rankings: rankings.count };
  },
});
