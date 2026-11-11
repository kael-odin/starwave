// 星榜计算：星速 40% + 社区 20% + 编辑 25% + 活跃 15%，减惩罚。社区/编辑信号先给中性 50，
// 等 HN/Reddit 采集和文章关联稳定后再接真实值。
import { sql, type Db } from "@aihot/backend/db";
import type { BoardPeriod } from "../shared.ts";
import { saveRanking } from "./store.ts";

interface Candidate {
  id: number;
  full_name: string;
  stars: number | null;
  forks: number | null;
  license_spdx: string | null;
  archived: boolean;
  is_fork: boolean;
  language: string | null;
  repo_created_at: string | Date | null;
  repo_pushed_at: string | Date | null;
  delta: number | null;
}

const BOARDS: Array<{ period: BoardPeriod; window: number; minStars: number; take: number }> = [
  { period: "daily", window: 1, minStars: 50, take: 20 },
  { period: "weekly", window: 7, minStars: 100, take: 30 },
  { period: "monthly", window: 30, minStars: 200, take: 50 },
  { period: "new", window: 30, minStars: 100, take: 30 },
];

const clamp = (n: number, lo = 0, hi = 100) => Math.min(Math.max(n, lo), hi);

/** 百分位：小于 v 的比例，并列取中位。 */
function percentile(values: number[], v: number): number {
  if (values.length === 0) return 0;
  const less = values.filter((x) => x < v).length;
  const equal = values.filter((x) => x === v).length;
  return ((less + equal / 2) / values.length) * 100;
}

function beijingDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function computeRankings(db: Db = sql): Promise<Record<string, number>> {
  const asOf = beijingDate();
  const written: Record<string, number> = {};
  for (const board of BOARDS) {
    const rows = await db<Candidate[]>`
      WITH latest AS (
        SELECT DISTINCT ON (repo_id) repo_id, stars, forks, star_delta, captured_on
        FROM repo_snapshots WHERE captured_on <= ${asOf}::date
        ORDER BY repo_id, captured_on DESC
      ), base AS (
        SELECT DISTINCT ON (repo_id) repo_id, stars
        FROM repo_snapshots WHERE captured_on <= (${asOf}::date - ${board.window}::int)
        ORDER BY repo_id, captured_on DESC
      )
      SELECT r.id, r.full_name, l.stars, COALESCE(l.forks, r.forks) AS forks, r.license_spdx, r.archived, r.is_fork,
             r.language, r.repo_created_at, r.repo_pushed_at,
             COALESCE(l.stars - b.stars, l.star_delta) AS delta
      FROM latest l
      JOIN repos r ON r.id = l.repo_id
      LEFT JOIN base b ON b.repo_id = l.repo_id
      WHERE NOT r.is_fork AND NOT r.archived
        AND COALESCE(l.stars, 0) >= ${board.minStars}
        ${board.period === "new" ? sql`AND r.repo_created_at >= (${asOf}::date - 180)` : sql``}
      ORDER BY delta DESC NULLS LAST
      LIMIT 500
    `;
    const starValues = rows.map((r) => Math.log1p(Math.max(r.delta ?? 0, 0)));
    const scored = rows.map((r) => {
      const star = percentile(starValues, Math.log1p(Math.max(r.delta ?? 0, 0)));
      const community = 50;
      const editorial = 50;
      const pushed = r.repo_pushed_at ? new Date(r.repo_pushed_at).getTime() : 0;
      const days = pushed ? Math.max(0, (Date.now() - pushed) / 86_400_000) : 365;
      const activity = clamp(100 - days * 2);
      let score = 0.4 * star + 0.2 * community + 0.25 * editorial + 0.15 * activity;
      if (r.archived) score -= 30;
      if (!r.license_spdx) score -= 10;
      const ageDays = r.repo_created_at ? (Date.now() - new Date(r.repo_created_at).getTime()) / 86_400_000 : 365;
      if ((r.stars ?? 0) > 20_000 && (r.forks ?? 0) < 100 && ageDays < 30) score -= 20;
      return { ...r, star, community, editorial, activity, score: clamp(score) };
    }).sort((a, b) => b.score - a.score).slice(0, board.take);

    await db`DELETE FROM repo_rankings WHERE period = ${board.period} AND as_of = ${asOf}::date`;
    let rank = 0;
    for (const r of scored) {
      rank += 1;
      const reason = reasonOf(board.period, r);
      await saveRanking(board.period, asOf, rank, r.id, Number(r.score.toFixed(2)), r.delta, reason, {
        star: Number(r.star.toFixed(2)),
        community: r.community,
        editorial: r.editorial,
        activity: Number(r.activity.toFixed(2)),
      }, db);
    }
    written[board.period] = rank;
  }
  return written;
}

function reasonOf(period: BoardPeriod, r: Candidate & { score: number }): string {
  if (period === "new") {
    const created = r.repo_created_at ? new Date(r.repo_created_at).toISOString().slice(0, 10) : "最近";
    return `创建于 ${created} · ${r.stars ?? 0} stars`;
  }
  if (r.delta !== null && r.delta > 0) return `${period === "daily" ? "24 小时" : period === "weekly" ? "7 天" : "30 天"} +${r.delta.toLocaleString("en-US")} stars`;
  return `${(r.stars ?? 0).toLocaleString("en-US")} stars · ${r.language ?? "未知语言"}`;
}
