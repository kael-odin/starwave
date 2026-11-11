# 星潮 Starwave · 路线图

## 当前进度（2026-11-10）

**已完成并验证**

- 仓库基于 AIHOT `9a7f5bd`，remote 为 `upstream`
- 产品、数据模型、内容、设计、双语、本地托管、上游维护文档
- `site/site.ts` 星潮品牌；Logo/字标/图标；深浅色 token；报头字已重生成
- 9 个开源分类、24+ 组织主体、实测信源（坏的已停用）
- 核心提示词：预筛、评分、内容理解、结构化、术语、标题、归组、摘要、仓库介绍
- `modules/github`：仓库档案 + 星榜 + Trending/Search/元数据/榜单/分类/介绍任务，三张页面
- **仓库分层（2026-11-10 二轮）**：`/repos` 按分类/语言/星级三层筛选（带分面计数），82 个仓库 54 个已归类；`repo_intro` 模型步骤给头部仓库生成中文一句话判断
- **主题瘦身（2026-11-10 二轮）**：`/topics` 48 → 27 个，全部有内容，无空板块
- **三轮打磨（2026-11-10 晚）**：日报出刊改 21:00 并成功出第 1 期（5 事件 3 来源）；`/hot` 根因确认为「≥2 独立来源」门槛（139/143 事件单源，非 bug）；视觉过 craft-floor：去 kicker、判断句改星标块、星榜加分数条、上手/风险改三栏分格面板、空增量不再渲染
- 验证：typecheck、Web build、迁移、架构测试 14 项、页面 200、impeccable detect 0 findings

**未完成，按顺序**

- 信源抓取后的真实精选校准（先用 100–200 条样本）
- 社区信号（HN/Lobsters）与编辑分接入榜单；`/hot` 等多源重叠自然出现
- 仓库介绍扩大覆盖（现在只做头部，模型成本可控后放开）
- 首页与报告页的整体视觉精修（建议先跑 impeccable init 补 PRODUCT.md）
- 上游测试 fixtures 的行业词汇替换（部分测试仍按 AI 分类写）
- 英文 `/en`、节目页


## P0 地基（第 1 周）

目标：本地 Docker 跑起来，首页能出中文精选，日报能出。

- [x] 克隆 AIHOT `9a7f5bd` 到 `D:\Github-Star\starwave`，remote 命名 `upstream`
- [x] 产品方案、数据模型、内容标准、设计、双语、本地托管文档
- [ ] `site/site.ts` 改为星潮品牌与文案
- [ ] `industry/taxonomy.ts` 改为开源分类/标签/实体
- [ ] `industry/topics.json` 改为开源主题
- [ ] `industry/sources.json` 换成 20+ 首期信源
- [ ] 核心提示词改写：prefilter、selection-score、content-understanding、structure、rules-domain
- [ ] `site/brand/` Logo、图标、字标
- [ ] `.env` 配置（模型 key、SITE_URL、GITHUB_TOKEN）
- [ ] `docker compose up -d --build` 成功
- [ ] 首页 10+ 条中文精选；`/daily` 正常
- [ ] `npm run typecheck`、`npm test`、`node scripts/smoke.ts` 通过

验收：本地 `http://localhost:3000` 可读，后台能看信源抓取和评分。

## P1 仓库层（第 2 周）

目标：仓库档案 + 星榜 + 文章关联。

- [ ] `modules/github/migrations/1001_repos.sql` 建表
- [ ] GitHub client（token、ETag、rate limit、retry）
- [ ] `sync-trending`：日/周榜解析 + fixture 测试
- [ ] `sync-metadata`：tracked + 近 30 天仓库
- [ ] `sync-search`：新仓库/快速增长
- [ ] `sync-releases`：跟踪清单 release 候选
- [ ] `link-mentions`：文章 URL/正文 → 仓库
- [ ] `compute-rankings`：日/周/月/新星
- [ ] 页面 `/repos`、`/repos/:owner/:name`、`/trending`
- [ ] API `/api/site/repos/*`、`/api/site/trending`、`/api/v1/repos`、`/api/v1/trending`
- [ ] 首页接入本周星榜 Top 5
- [ ] sitemap、llms.txt、agent abilities
- [ ] 星速 sparkline、星潮指数组件
- [ ] 300+ 仓库、榜单每行有理由

验收：随便点开一个仓库，能看到星史、相关报道、上手信息、风险；榜单能解释“为什么排这里”。

## P2 双语（第 3 周）

目标：`/en` 核心页面 + 英文标题摘要。

- [ ] `site/locales/zh.ts`、`en.ts` 字典
- [ ] `LocaleProvider`、`t()`、`LocaleLink`
- [ ] 路由 `/en`、`/en/all`、`/en/items/:id`、`/en/story/:id`、`/en/daily`、`/en/weekly`、`/en/topics`、`/en/topic/:slug`、`/en/repos`、`/en/repos/:owner/:name`、`/en/trending`、`/en/about`
- [ ] `publications.title_en`、`summary_en`；`analyses.title_en`、`summary_en`
- [ ] `content-understanding.md` 输出 `titleEn`/`summaryEn`
- [ ] 英文回退：原文标题 + 原文摘要
- [ ] `hreflang`、英文 canonical、英文 sitemap
- [ ] 语言切换器（导航/我的）
- [ ] 英文 QA：20 条样本人工检查

验收：英文读者能从 `/en` 读到首页、条目、仓库页；无英文内容时正确回退。

## P3 节目（第 4 周，可选）

目标：周榜口播稿 + 封面文案 + B 站嵌入。

- [ ] `episodes`、`episode_items` 表
- [ ] `show-script.md` 提示词：30 秒冷开场、5 段口播、转场、结尾
- [ ] 生成章节时间轴、标题备选、封面文案
- [ ] 页面 `/show`、`/show/:slug`
- [ ] B 站 iframe 嵌入 + 章节跳转 + “在 B 站观看”
- [ ] 封面图生成（夜航底 + 标题 + Top5）
- [ ] 人工录制/剪辑流程文档

验收：一期 3 分钟稿，5 个仓库，每个 30–45 秒；章节可跳转。

## P4 自动化与增长（第 5 周+）

- [ ] AI 配音（edge-tts）或自动成片（Remotion/code-video）
- [ ] 读者投稿/推荐仓库
- [ ] Newsletter（每周星榜）
- [ ] 榜单 API / 徽章
- [ ] 英文周报
- [ ] 多语言（日文？）

## 里程碑时间线

```
W1  P0 地基     本地跑通、品牌、分类、信源、提示词
W2  P1 仓库层   仓库页、星榜、关联
W3  P2 双语     /en、英文标题摘要
W4  P3 节目     口播稿、封面、B 站（可选）
W5+ P4 自动化   配音/成片、投稿、newsletter
```

## 依赖与阻塞

- 模型 API Key（DeepSeek/千问/智谱）
- GitHub Token（5000 请求/小时）
- 域名（P2 前）
- B 站账号与剪辑（P3）
- 如果要公网访问：Cloudflare Tunnel 或 VPS

## 每周检查

- 精选数量与质量（抽 20 条人工复核）
- 信源失败率（后台“信源”页）
- 模型成本（后台“运行”页）
- 榜单异常（刷星、fork、archived）
- 页面性能（首页 < 200ms API，LCP < 2.5s）
