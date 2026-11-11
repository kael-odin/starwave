// 仓库层对网页与 API 暴露的形状。纯类型，不导入数据库或 Node 模块，网页端也能安全引用。

export type BoardPeriod = "daily" | "weekly" | "monthly" | "new";

export interface RepoCard {
  fullName: string;
  owner: string;
  name: string;
  htmlUrl: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  license: string | null;
  topics: string[];
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  pushedAt: string | null;
  createdAt: string | null;
  archived: boolean;
  isFork: boolean;
  avatarUrl: string | null;
  /** 星潮的内容分类 key（9 类之一）；null 表示还没有归上。 */
  category: string | null;
  /** 7 天 star 增量；没有足够快照时为 null。 */
  starDelta7d: number | null;
  /** 30 天 star 增量；没有足够快照时为 null。 */
  starDelta30d: number | null;
  /** 最近 30 天的星史，按日期升序；只有有快照的日子。 */
  spark: number[];
}

export interface Facet {
  key: string;
  n: number;
}

export interface RepoListResponse {
  repos: RepoCard[];
  total: number;
  sort: "stars" | "pushed" | "delta";
  language: string | null;
  topic: string | null;
  category: string | null;
  minStars: number;
  /** 全库分面：分类（含 other）与语言 Top 10，供分层筛选。 */
  categories: Facet[];
  languages: Facet[];
}

export interface RepoDetailResponse {
  repo: RepoCard;
  verdict: string | null;
  useCases: string | null;
  requirements: string | null;
  risks: string | null;
  mentions: Array<{
    articleId: string;
    title: string;
    summary: string | null;
    url: string;
    publishedAt: string | null;
    score: number | null;
  }>;
  similar: RepoCard[];
}

export interface RankRow {
  rank: number;
  repo: RepoCard;
  score: number;
  starDelta: number | null;
  reason: string;
}

export interface TrendingResponse {
  period: BoardPeriod;
  asOf: string | null;
  rows: RankRow[];
  note: string;
}
