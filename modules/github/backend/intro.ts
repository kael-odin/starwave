// 仓库的中文一句话介绍：给头部仓库生成“值不值得看/试”的判断，写进 repo_editorial。
// 每天跑一批，模型额度可后台切换；失败不影响其他仓库。
import { sql, type Db } from "@aihot/backend/db";
import { chatJson } from "@aihot/backend/providers/llm";
import { modelFor } from "@aihot/backend/editorial/models";
import { promptText } from "@aihot/backend/editorial/prompts";
import { z } from "zod";
import { markSync } from "./store.ts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const IntroSchema = z.object({
  verdict: z.string().max(120).catch(""),
  use_cases: z.string().max(300).nullable().catch(null),
  requirements: z.string().max(200).nullable().catch(null),
  risks: z.string().max(200).nullable().catch(null),
});

export async function generateRepoIntros(limit = 20, db: Db = sql): Promise<{ done: number; skipped: number; failed: number }> {
  const rows = await db<{
    id: number;
    full_name: string;
    description: string | null;
    language: string | null;
    license_spdx: string | null;
    topics: string[];
    stars: number | null;
    forks: number | null;
    homepage: string | null;
    repo_pushed_at: string | Date | null;
  }[]>`
    SELECT r.id, r.full_name, r.description, r.language, r.license_spdx, r.topics, r.stars, r.forks, r.homepage, r.repo_pushed_at
    FROM repos r
    LEFT JOIN repo_editorial e ON e.repo_id = r.id
    WHERE e.repo_id IS NULL AND NOT r.is_fork AND NOT r.archived AND r.description IS NOT NULL
    ORDER BY r.stars DESC NULLS LAST
    LIMIT ${limit}
  `;
  let done = 0;
  let skipped = 0;
  let failed = 0;
  for (const repo of rows) {
    try {
      const model = await modelFor("repoIntro");
      const pushed = repo.repo_pushed_at ? new Date(repo.repo_pushed_at).toISOString().slice(0, 10) : null;
      const user = [
        `仓库全名：${repo.full_name}`,
        `描述：${repo.description ?? "（无）"}`,
        `语言：${repo.language ?? "未知"}`,
        `License：${repo.license_spdx ?? "未声明"}`,
        `Topics：${(repo.topics ?? []).join(", ") || "（无）"}`,
        `Stars：${repo.stars ?? "未知"} · Forks：${repo.forks ?? "未知"}`,
        `最近推送：${pushed ?? "未知"}`,
        `官网：${repo.homepage || "（无）"}`,
      ].join("\n");
      const res = await chatJson({
        model,
        purpose: "repo_intro",
        subject: repo.full_name,
        promptVersion: "repo-intro@1",
        system: promptText("repo-intro"),
        user,
        schema: IntroSchema,
        maxTokens: 900,
      });
      const d = res.data;
      if (!d.verdict.trim()) {
        skipped += 1;
      } else {
        await db`
          INSERT INTO repo_editorial (repo_id, verdict_zh, use_cases_zh, requirements_zh, risks_zh)
          VALUES (${repo.id}, ${d.verdict.trim()}, ${d.use_cases?.trim() || null}, ${d.requirements?.trim() || null}, ${d.risks?.trim() || null})
          ON CONFLICT (repo_id) DO UPDATE SET
            verdict_zh = EXCLUDED.verdict_zh, use_cases_zh = EXCLUDED.use_cases_zh,
            requirements_zh = EXCLUDED.requirements_zh, risks_zh = EXCLUDED.risks_zh
        `;
        done += 1;
      }
    } catch {
      failed += 1;
    }
    await sleep(400);
  }
  await markSync("repo-intro", failed === 0, failed ? `${failed} 个仓库失败` : null, { done, skipped, failed }, db);
  return { done, skipped, failed };
}
