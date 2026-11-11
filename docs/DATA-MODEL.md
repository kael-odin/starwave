# 星潮 Starwave · 数据模型与榜单

> v0 骨架只建了代码实际读写的列。下面的 `repo_signals`、`verdict_en`、`reason_en`、`readme_*` 等是规划，等对应功能落地时用新迁移加入；不要一次建空列，`tests/architecture.test.ts` 会拒绝未被代码使用的表和列。


## 1. 模块边界

仓库层放在 `modules/github/`，不修改 AIHOT 核心表（除第二期双语字段）。模块迁移文件从 `1001_` 起，避免和引擎迁移编号冲突。

## 2. 表结构

### 2.1 `repos`

```sql
CREATE TABLE repos (
  id                bigserial PRIMARY KEY,
  full_name         text NOT NULL,              -- owner/name，保留大小写
  full_name_lower   text NOT NULL UNIQUE,       -- 唯一键
  owner             text NOT NULL,
  name              text NOT NULL,
  html_url          text NOT NULL,
  description       text,
  homepage          text,
  language          text,
  license_spdx      text,
  license_name      text,
  topics            text[] NOT NULL DEFAULT '{}',
  stars             integer,
  forks             integer,
  open_issues       integer,
  subscribers       integer,
  repo_created_at   timestamptz,
  repo_pushed_at    timestamptz,
  archived          boolean NOT NULL DEFAULT false,
  is_fork           boolean NOT NULL DEFAULT false,
  default_branch    text,
  avatar_url        text,
  readme_excerpt    text,
  readme_lang       text,                       -- zh / en / other
  tracked           boolean NOT NULL DEFAULT false,
  first_seen_at     timestamptz NOT NULL DEFAULT now(),
  last_synced_at    timestamptz,
  sync_error        text
);
CREATE INDEX repos_stars_idx ON repos (stars DESC NULLS LAST);
CREATE INDEX repos_pushed_idx ON repos (repo_pushed_at DESC NULLS LAST);
CREATE INDEX repos_language_idx ON repos (language);
CREATE INDEX repos_topics_idx ON repos USING gin (topics);
```

### 2.2 `repo_snapshots`

```sql
CREATE TABLE repo_snapshots (
  repo_id       bigint NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  captured_on   date NOT NULL,                  -- 北京时间自然日
  stars         integer,
  forks         integer,
  open_issues   integer,
  star_delta    integer,                        -- 相对上一个有快照的日子
  PRIMARY KEY (repo_id, captured_on)
);
CREATE INDEX repo_snapshots_day_idx ON repo_snapshots (captured_on DESC);
```

### 2.3 `repo_mentions`

```sql
CREATE TABLE repo_mentions (
  article_id    text NOT NULL,
  repo_id       bigint NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'mention', -- subject | mention
  found_by      text NOT NULL DEFAULT 'url',     -- url | model | manual
  confidence    real NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, repo_id)
);
CREATE INDEX repo_mentions_repo_idx ON repo_mentions (repo_id);
```

`article_id` 不设外键：文章清理策略归引擎，模块只做引用。

### 2.4 `repo_rankings`

```sql
CREATE TABLE repo_rankings (
  period        text NOT NULL,                  -- daily | weekly | monthly | new
  as_of         date NOT NULL,
  rank          integer NOT NULL,
  repo_id       bigint NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  score         numeric(5,2) NOT NULL,
  star_delta    integer,
  star_score    numeric(5,2),
  community_score numeric(5,2),
  editorial_score numeric(5,2),
  activity_score  numeric(5,2),
  reason_zh     text NOT NULL,
  reason_en     text,
  computed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (period, as_of, repo_id)
);
CREATE INDEX repo_rankings_board_idx ON repo_rankings (period, as_of, rank);
```

### 2.5 `repo_editorial`

```sql
CREATE TABLE repo_editorial (
  repo_id       bigint PRIMARY KEY REFERENCES repos(id) ON DELETE CASCADE,
  verdict_zh    text,
  verdict_en    text,
  use_cases_zh  text,
  use_cases_en  text,
  risks_zh      text,
  requirements_zh text,
  curated_by    text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

### 2.6 `repo_signals`

社区信号原始表，去重后可追溯：

```sql
CREATE TABLE repo_signals (
  id            bigserial PRIMARY KEY,
  repo_id       bigint NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  source        text NOT NULL,                  -- hn | lobsters | reddit | trending
  external_id   text NOT NULL,
  url           text,
  title         text,
  points        integer,
  comments      integer,
  captured_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);
```

### 2.7 `repo_sync_state`

记录每个任务的游标、ETag、上次成功时间，避免重复抓取：

```sql
CREATE TABLE repo_sync_state (
  key           text PRIMARY KEY,               -- trending:daily | search:new | releases
  value         jsonb NOT NULL DEFAULT '{}',
  last_run_at   timestamptz,
  last_ok_at    timestamptz,
  error         text
);
```

## 3. 同步任务

| 任务 | 频率 | 做什么 | 预算 |
|---|---|---|---|
| `sync-trending` | 每小时 | 抓 daily/weekly Trending，解析仓库、star、增量 | 2 请求/小时 |
| `sync-metadata` | 每日 03:10 | 刷新 tracked + 近 30 天出现过的仓库 | 500–1500 请求/天 |
| `sync-search` | 每日 04:10 | 新仓库、快速增长仓库 | 6–12 请求/天 |
| `sync-releases` | 每 6 小时 | 跟踪清单的 releases，生成发布候选 | 100–300 请求/天 |
| `compute-rankings` | 每日 05:10 | 日/周/月/新星榜 | 本地计算 |
| `link-mentions` | 文章发布时 | 正文/URL 中的 GitHub 仓库 | 本地解析 |

GitHub API 认证后 5000 请求/小时；以上峰值远低于上限。所有请求带 `If-None-Match`，304 不计入内容变更。

## 4. GitHub 采集细节

### 4.1 Trending

- URL：`https://github.com/trending?since=daily`、`?since=weekly`
- 解析 `article.Box-row`：
  - 仓库：`h2 a` 的 `href`
  - 描述：`p`
  - 语言：`span[itemprop="programmingLanguage"]`
  - stars：`a[href$="/stargazers"]`
  - forks：`a[href$="/forks"]`
  - 增量：`span.d-inline-block.float-sm-right`（"1,234 stars today"）
- 礼貌：每小时一次，带 `User-Agent: StarwaveBot/1.0`，失败退避。

### 4.2 Search

```text
GET /search/repositories?q=created:>2026-05-01 stars:>100&sort=stars&order=desc&per_page=50
GET /search/repositories?q=pushed:>2026-11-01 stars:>500&sort=updated&order=desc&per_page=50
```

Search API 限制 30 请求/分钟；只取前 2–3 页，按 `created` 和 `pushed` 两个维度。

### 4.3 Repo metadata

```text
GET /repos/{owner}/{repo}
```

只取必要字段；`readme` 另取 `GET /repos/{owner}/{repo}/readme`（base64），截前 8KB。

### 4.4 Releases

```text
GET /repos/{owner}/{repo}/releases?per_page=3
```

只有新 tag 且满足以下之一才生成新闻候选：
- 主版本号变化
- release body ≥ 800 字符
- 仓库在跟踪清单且标记 `release_news: true`

## 5. 榜单算法

### 5.1 候选集

- 当日/周/月有快照的仓库
- 非 fork、非 archived
- stars ≥ 50（日榜）/ 100（周榜）/ 200（月榜）
- 新星榜：`repo_created_at >= now() - 180 days`

### 5.2 分量

```ts
starDelta = snapshot[asOf].stars - snapshot[asOf - window].stars
ageDays   = days(repo_created_at → asOf)
ageFactor = clamp(log10(ageDays + 10) / 2, 0.5, 2)   // 老仓库温和降权
starRaw   = log1p(max(starDelta, 0)) / ageFactor
starScore = percentileRank(starRaw) * 100

communityRaw = 0.6 * hnPointsPct + 0.25 * hnCommentsPct + 0.15 * lobstersPct
communityScore = percentileRank(communityRaw) * 100

editorialScore = avg(publication.score where repo mentioned, selected, last 60d) ?? 50

activityRaw = 0.5 * recency(pushed_at) + 0.3 * releaseCount90d + 0.2 * issueResponse
activityScore = percentileRank(activityRaw) * 100

score = 0.40 * starScore + 0.20 * communityScore
      + 0.25 * editorialScore + 0.15 * activityScore
```

### 5.3 惩罚

```ts
if (archived) score -= 30
if (!license_spdx) score -= 10
if (stars / max(forks,1) > 200 && ageDays < 30) score -= 20  // 需人工复核
if (starDelta > 0 && communityScore < 5 && ageDays < 7) score -= 10
```

最终 `clamp(score, 0, 100)`，取前 N（日 20 / 周 30 / 月 50 / 新星 30）。

### 5.4 理由生成

按优先级取第一条：

1. `7 天 +{starDelta} stars`
2. `HN 首页 {points} 分 / {comments} 评论`
3. `编辑推荐 {editorialScore} 分：{verdict}`
4. `{days} 天前发布 {tag}，{releaseNote}`

每条榜单必须写 `reason_zh`；`reason_en` 第二期生成。

## 6. 文章 ↔ 仓库关联

1. 文章 URL 是 GitHub 仓库/Release/Issue → 直接关联。
2. 正文正则：`github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)`，排除 `topics`、`search`、`login`、`marketplace` 等保留路径。
3. 标题/摘要中的 `owner/name` 形态，若仓库已存在则关联。
4. 结构化模型输出的 `subjects` 含 GitHub 仓库时，按名称匹配。
5. 每个文章最多关联 8 个仓库，按出现次数排序。

## 7. 保留与清理

- `repo_snapshots` 永久保留（每天每仓库一行，1000 仓库 × 365 天 ≈ 36 万行，可接受）。
- `repo_signals` 保留 90 天。
- `repo_rankings` 保留 2 年。
- 未被提及、未 tracked、180 天无更新的仓库，只保留主档，不参与榜单。

## 8. 索引与查询

- 仓库列表：`ORDER BY stars DESC` 或 `repo_pushed_at DESC`，按 language/topic 过滤。
- 星史：`WHERE repo_id = $1 AND captured_on >= now() - 30 days ORDER BY captured_on`。
- 榜单：`WHERE period = $1 AND as_of = $2 ORDER BY rank`。
- 相关报道：`repo_mentions JOIN publications ON article_id`，按 `timeline_at DESC`。

## 9. 测试

- Trending HTML fixture 解析（3 个仓库）
- 星速计算（含缺失快照、跨月）
- 榜单百分位（并列、空集）
- 文章 URL 解析（repo/release/issue/tree，排除保留路径）
- 关联幂等（重复发布不重复写）
