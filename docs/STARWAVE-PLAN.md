# 星潮 Starwave · 产品与技术方案

> 一句话：**看见开源的下一次浪潮。**
> 英文：**Open source, before it trends.**
>
> 星潮是一个中文优先的 GitHub / 开源新闻站。它每天扫 GitHub 与全球开源社区，用公开的编辑标准筛出真正值得上手的项目、版本发布、维护者故事和生态变化；每个仓库有持续档案，每周有星榜，未来把周榜做成 B 站式口播节目。

- 文档版本：v0.1（2026-11-10）
- 基线：AIHOT `9a7f5bd`（MIT）
- 仓库：`D:\Github-Star\starwave`
- 第一期范围：纯图文，不做视频节目；本地 Docker 长期运行；中文为主，英文做界面双语 + 精选条目英文标题摘要

---

## 1. 定位

### 1.1 它是什么

星潮不是 GitHub Trending 的中文镜像，也不是泛 AI 新闻站。它解决三个问题：

1. **信息太多**：Trending、HN、Reddit、Release、公众号每天几百条，读者没有时间逐条看。
2. **榜单没有解释**：Trending 只告诉你“涨得快”，不告诉你“解决什么问题、值不值得上手、有什么坑”。
3. **新闻没有档案**：一个仓库被报道一次就结束了，读者看不到它的星史、维护状态、许可证变化和后续进展。

星潮的答案是：**编辑精选 + 中文解释 + 仓库档案 + 可验证的趋势榜**。

### 1.2 目标读者

- 中文开发者、独立开发者、技术负责人
- 想找工具的产品经理、设计师、创业者
- 开源爱好者、维护者、DevRel
- 英文读者（第二期，`/en`）

### 1.3 非目标

- 不做代码托管、Issue 跟踪、包管理
- 不做全量 GitHub 数据库
- 不做纯 AI 模型发布/跑分新闻（除非与开源权重、工具链、部署直接相关）
- 不做“震惊体”流量号；不做未经核实的 star 数、性能、融资数字
- 第一期不做用户账号、评论、投稿后台

### 1.4 与参考 UP 主的关系

参考视频《十月第三周 Github 开源热榜》（Oraink灵砚，187 秒，5 个仓库）证明了这个形态成立：

- 一周 5 个仓库，每个 30–45 秒
- 一句话钩子 + 能做什么 + 一个具体亮点 + 链接
- 章节时间轴，信息密度高，不废话

星潮第一期把这个形态**文字化、结构化、可检索**：每个仓库有档案页、每个榜单条目有入选理由、每篇报道有中文摘要。视频节目是同一套内容的另一种出口，不是另一套内容。

---

## 2. 信息架构（第一期）

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 | 今日精选、本周星榜 Top 5、新星榜、分类入口、日报入口 |
| `/all` | 全部动态 | 全部信源，按时间/分类/标签筛选，支持搜索 |
| `/hot` | 热点事件 | 按事件聚合的热度榜（48h） |
| `/repos` | 仓库库 | 已收录仓库，按语言/标签/星速/更新时间筛选 |
| `/repos/:owner/:name` | 仓库档案 | 星史曲线、简介、上手、风险、相关报道、相似仓库 |
| `/trending` | 星榜 | 日榜 / 周榜 / 月榜 / 新星榜，附入选理由 |
| `/topics` | 主题 | 方向、形态、组织三类主题 |
| `/topics/:slug` | 主题页 | 按标签/实体聚合 |
| `/daily` `/weekly` `/monthly` | 日报/周报/月报 | 继承 AIHOT 的报告引擎 |
| `/about` `/agent` `/changelog` `/feedback` | 关于/Agent/更新/反馈 | 继承并改写文案 |
| `/admin` | 后台 | 信源、模型、内容诊断、仓库跟踪、榜单权重 |
| `/en/*` | 英文站 | 第二期，核心页面 + 英文标题摘要 |

---

## 3. 内容生产线

### 3.1 六步主流程（继承 AIHOT）

```
信源采集 → 判重/正文 → 预筛 → 两次独立评分 → 内容理解（中英标题摘要）
→ 结构化（类别/标签/仓库）→ 事件归组 → 发布 → 日报/周报/月报
```

每一步的提示词都在 `industry/prompts/`，入选门槛在 `industry/selection.ts`，全部可改。

### 3.2 开源特有层

在 AIHOT 之上加一层 **仓库信号**，它不直接等于新闻：

| 信号 | 来源 | 用途 |
|---|---|---|
| GitHub Trending | `github.com/trending` 日/周榜 | 星榜候选、仓库发现 |
| GitHub Search | REST Search API | 新仓库、快速增长仓库 |
| Releases | `releases.atom` / REST | 版本发布新闻候选 |
| Repo metadata | REST `/repos/{owner}/{repo}` | 星数、fork、license、语言、活跃度 |
| 社区讨论 | HN / Lobsters / Reddit | 热度信号、选题线索 |
| 文章提及 | 正文中的 `github.com/owner/repo` | 把新闻和仓库档案连起来 |

**原则**：Trending 只说明“有人在 star”，不自动成为精选。一个仓库要进精选，仍要走编辑评分；星榜是独立产品，不是新闻流。

---

## 4. 仓库数据层

### 4.1 为什么需要

AIHOT 的文章模型是“一条资料 → 一个事件”。星潮需要“一个仓库 → 一条时间线”。仓库是长期实体，文章是它的证据。

### 4.2 表结构（详见 `docs/DATA-MODEL.md`）

- `repos`：仓库主档（owner/name、描述、语言、license、topics、stars、创建/推送时间、archived、fork）
- `repo_snapshots`：每日快照（stars/forks/issues），用来算增速和画曲线
- `repo_mentions`：文章 ↔ 仓库，角色（subject/mention）、来源（URL/模型）
- `repo_rankings`：榜单结果（period、as_of、rank、score、star_delta、reason）
- `repo_editorial`：编辑判断（中文/英文一句话、适用场景、上手门槛、风险）

### 4.3 收录规则

自动收录：
- Trending 日/周榜出现
- 精选文章正文提到
- 手动跟踪清单（`modules/github/tracked.json`）
- Search API 命中“新仓库/快速增长”规则

不收录：
- fork、archived（除非有新闻价值）
- 空仓库、无 README、纯镜像
- 明确违规/盗版/破解/crypto 空投

### 4.4 仓库页内容

1. **头部**：`owner/name`、描述、语言、license、stars/forks、最近推送
2. **星潮指数**：7/30 日 star 增速、排名、趋势 sparkline
3. **一句话判断**：它解决什么问题，适合谁，现在值不值得看
4. **上手**：安装命令、依赖、平台、文档语言
5. **风险**：license、维护状态、issue 响应、安全公告
6. **相关报道**：精选文章、事件、版本发布
7. **相似仓库**：同语言/同标签/同主题

---

## 5. 星榜算法

### 5.1 榜单类型

- **日榜**：过去 24h 星速 + 社区信号
- **周榜**：过去 7d 星速，主榜
- **月榜**：过去 30d 星速，看持续性
- **新星榜**：创建 ≤180 天、stars ≥100、非 fork/archived

### 5.2 分数

```
score = 0.40 × 星速分
      + 0.20 × 社区信号分
      + 0.25 × 编辑分
      + 0.15 × 活跃度分
      - 惩罚项
```

- **星速分**：`log1p(star_delta)` 在候选集中的百分位；按仓库年龄做温和归一，避免老仓库基数碾压。
- **社区信号分**：HN points/comments、Lobsters、Reddit 去重后的 48h 讨论热度百分位。
- **编辑分**：该仓库相关精选文章的平均分；没有报道给 50 中性值，不惩罚。
- **活跃度分**：最近 commit、release 频率、issue/PR 响应。
- **惩罚**：archived −30；无 license −10；fork/star 异常 −20 并进人工复核；疑似刷星直接排除。

### 5.3 可解释

每个榜单条目必须显示至少一条理由：

- `7 天 +4,218 stars`
- `HN 首页 326 分 / 184 评论`
- `编辑推荐 86 分：把本地模型网关做成菜单栏应用`
- `3 天前发布 v2.0，breaking change`

没有理由的排名不上榜。

### 5.4 冷启动

第一天没有历史快照，星速用 GitHub Trending 页面自带的 “stars today / this week” 作为 fallback；同时写入首日快照。48 小时后切到自己的快照差值。

---

## 6. 信源矩阵

### 6.1 分级

| 级别 | 含义 | 例子 | 入选门槛 |
|---|---|---|---|
| T1 | 官方一手 | GitHub Blog/Changelog、GitLab、Rust/Go/Node/Python/Deno、K8s/CNCF、Hugging Face | 低 |
| T1_5 | 准官方/优质社区 | HN Show、Lobsters、Dev.to、HelloGitHub、少数派、小众软件、V2EX 分享创造 | 中 |
| T2 | 媒体/聚合 | 开源中国、InfoQ 中文、机器之心、量子位、Reddit | 高 |
| SIGNAL | 只做信号，不进精选 | GitHub Trending、Search API、Releases | 不评分 |

### 6.2 首期种子源（已实测可访问）

官方：
- `https://github.blog/feed/`
- `https://github.blog/changelog/feed/`
- `https://about.gitlab.com/atom.xml`
- `https://blog.rust-lang.org/feed.xml`
- `https://go.dev/blog/feed.atom`
- `https://nodejs.org/en/feed/blog.xml`
- `https://pythoninsider.blogspot.com/feeds/posts/default`
- `https://deno.com/blog/rss.xml`
- `https://kubernetes.io/feed.xml`
- `https://www.cncf.io/feed/`
- `https://huggingface.co/blog/feed.xml`

社区：
- `https://hnrss.org/frontpage`
- `https://hnrss.org/show`
- `https://lobste.rs/rss`
- `https://dev.to/feed/tag/opensource`
- `https://hellogithub.com/rss`
- `https://sspai.com/feed`
- `https://www.v2ex.com/feed/tab/create.xml`
- `https://www.appinn.com/feed/`
- `https://www.iplaysoft.com/feed`

中文媒体：
- `https://www.oschina.net/news/rss`
- `https://www.infoq.cn/feed`
- `https://www.qbitai.com/feed`
- `https://www.jiqizhixin.com/rss`

Release 源（按仓库逐个加，首期 15–30 个）：
- `https://github.com/neovim/neovim/releases.atom`
- `https://github.com/zed-industries/zed/releases.atom`
- `https://github.com/ollama/ollama/releases.atom`
- 其余由 `modules/github` 的 release 轮询统一处理，避免信源列表爆炸

暂不使用：
- `https://bun.sh/blog/rss.xml`（404）
- `https://www.reddit.com/r/github/.rss`（429，需 OAuth 或降频）
- Product Hunt（Cloudflare 拦截风险）

### 6.3 抓取频率

- T1：60–120 分钟
- T1_5：120–180 分钟
- T2：180–360 分钟
- Trending：每小时 1 次（日榜/周榜各一次，礼貌抓取）
- Repo metadata：每日全量、热门仓库每 6 小时
- Releases：每 6 小时，只查跟踪清单

---

## 7. 分类与标签

### 7.1 类别（网址 key 上线后不改）

| key | 名称 | 收什么 |
|---|---|---|
| `new-release` | 新项目与发布 | 新仓库、首次发布、重大版本、breaking change |
| `dev-tool` | 开发工具 | CLI、编辑器、IDE、终端、SDK、效率工具 |
| `ai-oss` | AI 开源 | 开放权重、Agent、RAG、推理、训练、多模态、MCP |
| `infra` | 基础设施 | 数据库、运行时、容器、云原生、DevOps、可观测性 |
| `web-design` | 前端与设计 | 框架、UI、设计工具、低代码、图形 |
| `data` | 数据与存储 | 数据工具、分析、ETL、向量库、存储 |
| `security` | 安全与供应链 | 漏洞、SBOM、许可证、供应链、隐私 |
| `community` | 社区与商业 | 维护者、治理、融资、基金会、许可证变更 |
| `opinion` | 观点与复盘 | 深度文章、访谈、趋势分析、工程复盘 |

### 7.2 标签

分类标签（第一个必选）：
`新项目`、`版本发布`、`开发工具`、`AI 工具`、`基础设施`、`前端/设计`、`数据/存储`、`安全/供应链`、`社区/商业`、`观点/复盘`、`教程/实践`、`评测/基准`、`其他`

主题标签：
`Agent`、`MCP`、`RAG`、`推理`、`本地优先`、`自托管`、`CLI`、`编辑器`、`终端`、`插件`、`跨平台`、`自动化`、`数据库`、`容器`、`可观测性`、`设计工具`、`低代码`、`供应链`、`性能`、`开发者体验`、`中文文档`

实体标签：
`GitHub`、`GitLab`、`Hugging Face`、`Microsoft`、`Google`、`Meta`、`Vercel`、`Cloudflare`、`Supabase`、`Ollama`、`n8n`、`JetBrains`、`Mozilla`、`Canonical`、`Red Hat`、`CNCF`、`Apache`、`Linux Foundation`

---

## 8. 精选标准

### 8.1 五个维度（0–10）

1. **实用价值**：读者今天能不能用上，解决的是不是真问题。
2. **新颖度**：新项目、新版本、新方法，还是旧闻重炒。
3. **可信度**：维护者身份、提交历史、发布纪律、license 清晰、无刷星迹象。
4. **影响力**：生态位置、采用范围、社区讨论质量。
5. **可上手**：文档、安装、平台支持、中文可读性。

### 8.2 类型权重

| 类型 | 实用 | 新颖 | 可信 | 影响 | 上手 |
|---|---:|---:|---:|---:|---:|
| `new_repo` | 3 | 3 | 1 | 1 | 2 |
| `release` | 2 | 2 | 2 | 3 | 1 |
| `dev_tool` | 3 | 2 | 2 | 1 | 2 |
| `ai_tool` | 3 | 2 | 1 | 2 | 2 |
| `infra` | 2 | 2 | 3 | 3 | 0 |
| `security_event` | 1 | 1 | 4 | 4 | 0 |
| `community_event` | 1 | 2 | 3 | 4 | 0 |
| `opinion_analysis` | 1 | 3 | 2 | 3 | 1 |
| `tutorial_explainer` | 4 | 1 | 1 | 1 | 3 |
| `benchmark` | 2 | 2 | 3 | 2 | 1 |

### 8.3 必须压住的噪声

- 营销软文、课程广告、活动报名、招聘
- “Awesome list”“Top 100”“合集”堆砌，没有单一主体
- 只改 README/加 badge 的伪更新
- 刷星、互 star、空投、crypto、破解、盗版
- AI wrapper：没有代码、没有文档、只有截图
- 旧项目改个名字重新发布
- 纯模型跑分，除非同时开放权重/推理代码/可复现工程
- 未经证实的“将开源”“即将发布”

### 8.4 标题与摘要

- 标题：`项目名：一句话说清它解决什么问题`；必要时带 owner；不用“重磅/炸裂/颠覆”。
- 摘要：答案先行。2–4 句：它是什么、这次有什么变化、适合谁、怎么试。
- 理由：一句，最多两个分句，说清“为什么现在值得看”。
- 数字：stars、版本、性能数字必须来自原文，并注明时间；不把 Trending 的 “today” 写成总量。
- 英文：`titleEn`/`summaryEn` 要像英文原生写作，不做逐字翻译。

---

## 9. 双语方案

### 9.1 范围

第一期（P1）：中文站完整。
第二期（P2）：
- `/en` 路径 + 英文 UI
- 精选条目 `titleEn` / `summaryEn`
- 仓库档案 `verdictEn` / `useCasesEn`
- 日报/周报英文页先做“Headlines”视图（英文条目 + 英文 UI），报告总述暂不翻译
- hreflang、英文 sitemap

### 9.2 实现

- UI 字典：`site/locales/zh.ts`、`site/locales/en.ts`，`t(key)` + `LocaleProvider`
- 路由：`/en` 下复制核心页面路由，复用数据加载器；英文链接统一走 `LocaleLink`
- 内容：在 `content-understanding` 同一次调用输出 `titleEn` / `summaryEn`，存 `analyses` 与 `publications`
- 回退：无英文时用 `original_title` + 原文摘要；再没有就只显示原文标题
- SEO：`<html lang>`、`hreflang`、英文 canonical、英文 sitemap

详见 `docs/I18N.md`。

---

## 10. 设计方向

详见 `docs/DESIGN.md`。

关键词：**深海纸面、星标金、数据感、编辑感**。

- 不是黑客终端绿，也不是 GitHub 紫；用暖纸底 + 深海青 + 星标金 + 信号橙。
- 签名元素：星速 sparkline、星潮指数、仓库卡片上的 `★ 12.4k · +1.2k/周`。
- 标题克制，数字用等宽；卡片信息密度高但不拥挤。
- 深色模式叫“夜航”，用于夜间阅读和视频封面。

---

## 11. 技术架构

### 11.1 继承

- `apps/api` Fastify：站点接口、公开 API、RSS、MCP、分享图
- `apps/worker`：采集、模型、归组、榜单、日报
- `apps/web` React Router 8 SSR
- `packages/backend` 业务、`packages/contracts` 类型
- `site/` 站点身份，`industry/` 行业包
- Docker Compose：db + setup + api + worker + web（+ caddy https profile）

### 11.2 新增模块 `modules/github`

- `module.ts`：页面 `/repos`、`/repos/:owner/:name`、`/trending`；API 路径
- `server.ts`：
  - HTTP：`/api/site/repos/*`、`/api/site/trending`
  - 定时：Trending 每小时、metadata 每日、rankings 每日、releases 每 6 小时
  - 钩子：`articleChanged` → 解析 GitHub URL → `repo_mentions`
  - sitemap、llms、agent abilities
- `web.tsx`：侧栏“探索”分组（仓库、星榜）、手机 tab
- `migrations/`：`1001_repos.sql` 起
- `src/`：client、sync、rank、link、pages
- `tests/`

### 11.3 数据流

```
GitHub API/Trending ─┐
RSS/网页/公众号 ─────┼→ 采集 → 文章库 → 评分/理解/结构化 → publications
                     │                                      │
                     └→ repos/snapshots ←── 文章提及 ───────┘
                                      │
                                      └→ repo_rankings → /trending、/repos、首页
```

---

## 12. 本地运行与长期托管

### 12.1 可以一直跑在本机 Docker 吗

**可以。** AIHOT 的 compose 就是生产形态：Postgres + api + worker + web 全部容器化，`restart: unless-stopped`。只要机器开着、Docker Desktop 启动，它就能一直采集、评分、出日报。

需要接受的前提：

- 电脑关机/睡眠 = 站点停更；建议用一台常开的小主机/NAS/旧笔记本，或至少设置电源策略不睡眠。
- 公网访问需要额外一层：Cloudflare Tunnel（推荐，免费、不用开端口）或路由器端口转发 + Caddy。
- 数据在 Docker volume 里，必须做备份（`pg_dump` + `.env` + `site/` 配置）。
- Windows 上 Docker Desktop 偶尔更新重启，建议配置开机自启和健康检查。

详见 `docs/LOCAL-HOSTING.md`。

### 12.2 启动

```bash
cd D:/Github-Star/starwave
node scripts/init-env.ts --llm-key <你的模型 API Key>
docker compose up -d --build
# http://localhost:3000
# 后台 http://localhost:3000/admin
```

首次启动会迁移数据库、导入示范信源、开始采集。模型默认按 DeepSeek 配置；用千问/智谱改 `.env` 的 `LLM_BASE_URL`、`LLM_MODEL`、`LLM_EXTRA_JSON`。

### 12.3 公网

- 首选 Cloudflare Tunnel：`cloudflared tunnel --url http://localhost:3000` 临时预览；正式用命名隧道绑定域名。
- 有公网 IP：`docker compose --profile https up -d`，配 `SITE_DOMAIN`。
- 国内服务器：需 ICP 备案；海外服务器无备案但延迟高。

---

## 13. 里程碑

| 阶段 | 时间 | 交付 | 验收 |
|---|---|---|---|
| P0 地基 | 第 1 周 | 仓库、品牌、分类、20+ 信源、核心提示词、本地跑通 | 首页能出 10+ 条中文精选；日报能出 |
| P1 仓库层 | 第 2 周 | `modules/github`、仓库页、星榜、文章↔仓库关联 | `/repos` 300+、`/trending` 日/周榜可解释 |
| P2 双语 | 第 3 周 | `/en`、英文 UI、精选条目英文标题摘要 | 英文首页/条目/仓库页可用，hreflang 正确 |
| P3 节目 | 第 4 周（可选） | 周榜口播稿、封面文案、B 站嵌入、章节 | 每期 5 个仓库，3 分钟稿，人工可录 |
| P4 自动化 | 第 5 周+ | AI 配音/成片、投稿、newsletter | 按需 |

> 用户已确认：第一期先纯图文，不做节目；P3 保留设计，不阻塞上线。

---

## 14. 成本估算

| 项 | 估算 |
|---|---|
| 模型 | 每天 100–200 条候选 × 3 次调用 × 2–4k tokens ≈ 1–2M tokens/天；DeepSeek/千问约 ¥2–10/天 |
| GitHub API | 免费；带 token 5000 次/小时，足够 |
| 服务器 | 本机 ¥0；VPS 2C4G 约 ¥50–100/月 |
| 域名 | ¥60–120/年 |
| B 站制作 | 人工剪辑；AI 配音/成片另算 |

预算熔断：AIHOT 自带每服务每分钟/小时/天上限，后台“设置 → 付费请求上限”。

---

## 15. 风险与合规

- **GitHub 商标**：站名不含 GitHub，不使用 GitHub Logo 暗示官方；页面注明“非 GitHub 官方产品”。
- **GitHub API/ToS**：使用官方 API、带 token、缓存、遵守速率；Trending 页面礼貌抓取，不高频。
- **版权**：默认只展示摘要 + 原文链接；全文展示需信源明确允许（`site_fulltext`）。
- **模型幻觉**：仓库名、star 数、license、版本号必须来自结构化数据或原文；提示词加反幻觉规则。
- **刷星**：榜单加异常检测和人工复核；不把 star 数当唯一标准。
- **上游合并**：`site/`、`industry/`、`modules/` 尽量隔离；核心改动记在 `docs/FORK-NOTES.md`。
- **本地托管**：备份、UPS、Docker 自启、端口安全；不要把 Postgres/API 暴露公网。

---

## 16. 验收标准（P1）

- [ ] 首页首屏 3 秒内可见今日精选和本周星榜
- [ ] 每日精选 ≥ 8 条，中文标题无空话，摘要能独立读懂
- [ ] `/repos` 收录 ≥ 300 个仓库，每个有 stars/language/license/最近更新
- [ ] `/trending` 日/周/新星榜各 ≥ 20 条，每条有理由
- [ ] 仓库页能显示 30 天星史曲线和相关报道
- [ ] 日报每天 08:00 正常出刊，缺期有告警
- [ ] RSS/API/MCP/llms.txt 可用
- [ ] 手机端可读，深浅色正常
- [ ] `npm run typecheck`、`npm test`、`node scripts/smoke.ts` 通过

---

## 17. 待用户确认

1. 域名：建议 `starwave.dev` / `starwave.news` / `starwave.cn`（先查可用性）
2. 模型：DeepSeek / 千问 / 智谱，哪家作为默认
3. 是否要“中文文档”标签和筛选（对中文读者很实用，但会增加标注成本）
4. 是否接受首期收录 300–800 个仓库（而非全量）
5. P3 节目是否要真人口播，还是 AI 配音
