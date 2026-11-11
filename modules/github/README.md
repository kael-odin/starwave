# modules/github · 仓库层与星榜

星潮自己的模块：把 AIHOT 的“文章流”接上“仓库档案”和“星榜”。框架不导入这个模块，只读 `site/modules/` 的三份清单。

## 能做什么

| 地址 | 内容 |
|---|---|
| `/repos` | 仓库库：按 star、7 天星速、最近更新排序 |
| `/repos/:owner/:name` | 仓库档案：星史、编辑判断、上手/风险、相关报道、相似仓库 |
| `/trending?period=daily\|weekly\|monthly\|new` | 日/周/月/新星榜，每条有排名理由 |
| `/api/site/repos` | 列表接口（`sort`、`language`、`topic`、`limit`、`offset`） |
| `/api/site/repos/:owner/:name` | 详情接口 |
| `/api/site/trending` | 榜单接口（`period`、`limit`） |

## 数据

| 表 | 用途 |
|---|---|
| `repos` | 仓库主档 |
| `repo_snapshots` | 每日 stars/forks/issues，算增量与画星史 |
| `repo_mentions` | 文章 ↔ 仓库 |
| `repo_rankings` | 每个榜单日的排名、分数、理由 |
| `repo_editorial` | 人工/模型写的判断、上手、风险 |
| `repo_sync_state` | 每个采集任务的上次运行与错误 |

迁移在 `migrations/`，从 `1001_` 起；每个文件一条在线安全语句。

## 采集

| 任务 | cron（Asia/Shanghai） | 做什么 |
|---|---|---|
| `github.trending` | 每小时 :17 | 抓 daily/weekly Trending，写仓库与当日快照 |
| `github.search` | 每天 04:10 | Search API 找新仓库（180 天内、stars ≥100） |
| `github.metadata` | 每天 03:10 | 刷新 tracked / 近 30 天出现过的仓库 |
| `github.rankings` | 每天 05:10 | 计算日/周/月/新星榜 |

`GITHUB_TOKEN` 可选：没有 token 时每小时 60 次，程序会放慢请求；有 token 是 5000 次/小时。 Trending 页面本身不需要 token。

## 星榜

```
score = 0.40 × 星速 + 0.20 × 社区 + 0.25 × 编辑 + 0.15 × 活跃 - 惩罚
```

- 星速：`log1p(star_delta)` 的百分位；首次快照用 Trending 的 “stars today/week” 兜底。
- 社区/编辑：v0 先给中性 50；接入 HN/Lobsters 信号与文章评分后替换。
- 活跃：最近 push 越近越高。
- 惩罚：archived −30；无 license −10；新仓库 star/fork 异常 −20。

## 文章关联

`articleChanged` 钩子在文章发布/更新时读 `articles.url/title/body_text`，用正则找 `github.com/owner/repo`（排除 topics/search/login 等保留路径），建立 `repo_mentions`。仓库元数据随后由每日任务补齐。

## 已知限制

- `repo_signals`（HN/Lobsters 原始信号）和英文列（`verdict_en` 等）还没建，等对应功能落地时加迁移。
- 首次收录的仓库没有 7 天历史，`starDelta7d` 为 null；48 小时后才稳定。
- 没有后台仓库管理页；跟踪清单先用 `tracked` 布尔值和 SQL/种子维护。
- 上游测试的部分 fixtures 仍按 AI 行业分类写；模块自己的测试在 `tests/` 里新增。

## 下一步

1. HN Algolia / Lobsters 采集，写 `repo_signals`，替换社区中性分。
2. 用精选文章评分替换编辑中性分。
3. 后台 `/admin/repos`：跟踪、编辑判断、合并重复仓库。
4. `/api/v1/repos` 公开接口与 MCP 工具。
5. 英文 `verdict_en`、`reason_en` 与 `/en/repos`。
