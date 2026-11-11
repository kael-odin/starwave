# 与上游 AIHOT 的关系

## 1. 基线

- 上游：`https://github.com/KKKKhazix/AIHOT`
- 基线提交：`9a7f5bd`（2026-11-10）
- 许可：MIT（保留 `LICENSE`、`NOTICE`）
- 本仓库 remote：`upstream` 指向上游；尚无自己的 `origin`

## 2. 改哪里

### 2.1 站点层（不碰引擎）

| 路径 | 改什么 |
|---|---|
| `site/site.ts` | 站名、行业词、文案、导航、出刊时间、分享图、MCP 前缀 |
| `site/brand/` | Logo、图标、字标、二维码 |
| `site/pages/` | 使用规则、隐私说明 |
| `site/public/` | robots、manifest、openapi、security.txt |
| `site/changelog.json` | 上线记录 |
| `industry/taxonomy.ts` | 分类、标签、实体、身份词典 |
| `industry/topics.json` | 主题目录 |
| `industry/sources.json` | 首期信源 |
| `industry/prompts/` | 预筛、评分、写作、结构化、归组、报告 |
| `industry/selection.ts` | 门槛、校准 |
| `industry/wording.ts` | 读者词表 |
| `modules/github/` | 仓库层、星榜、GitHub 采集 |
| `docs/` | 星潮自己的文档（`STARWAVE-PLAN.md` 等） |

### 2.2 引擎层（尽量少）

P2 双语会碰：

| 文件 | 改动 |
|---|---|
| `database/migrations/0128_publication_i18n.sql` | `analyses`/`publications` 加 `title_en`、`summary_en` |
| `packages/backend/src/editorial/analyze.ts` | `UnderstandSchema` 增加英文字段 |
| `packages/backend/src/publication/publish.ts` | 投影英文字段 |
| `packages/contracts/src/site.ts` | `ItemSummary` 增加可选英文字段 |
| `apps/web/app/routes.ts` | `/en` 路由 |
| `apps/web/app/root.tsx` | `LocaleProvider`、`<html lang>` |
| `apps/web/app/modules.ts` | `WebModule` 新增通用 `home` 插口（模块注入首页部件，框架不导入模块） |
| `apps/web/app/features/home/module-parts.ts` | 新文件：按 agent 页的 `loadParts` 模式加载模块 home 部件 |
| `apps/web/app/routes/home.tsx` | 在热点条与信息流之间渲染模块 home 部件；无模块时零输出 |
| `apps/web/app/lib/i18n.tsx` | 新增 |
| `apps/web/app/lib/seo.ts` | hreflang |

原则：能放 `site/`、`industry/`、`modules/` 的，不放引擎。

## 3. 上游合并

```bash
git fetch upstream
git log --oneline HEAD..upstream/main        # 看上游新增
git merge upstream/main
```

冲突高发区：

- `site/site.ts`（我们全改了）
- `industry/*`（我们全改了）
- `apps/web/app/routes.ts`（/en 路由）
- `packages/backend/src/editorial/analyze.ts`、`publication/publish.ts`（英文字段）
- `README.md`（我们重写了）

处理顺序：

1. 先合 `packages/`、`apps/` 的上游修复，保留我们的英文字段改动
2. 再合 `site/`、`industry/`，以我们的版本为准
3. 跑 `npm run typecheck`、`npm test`、`node scripts/smoke.ts`
4. 在 `docs/FORK-NOTES.md` 记一笔上游提交范围

## 4. 不要做的事

- 不要用 AIHOT 的名字和 Logo
- 不要把 `mcpPrefix` 改成上线后又会变的值
- 不要改已发布迁移文件；新增迁移用新编号
- 不要把 `.env`、模型 key、GitHub token 提交到仓库
- 不要删除 `LICENSE`、`NOTICE` 中的上游版权声明

## 5. 上游 README

原 `README.md` / `README.en.md` 已移到：

- `docs/UPSTREAM-README.md`
- `docs/UPSTREAM-README.en.md`

保留它们是为了查 AIHOT 的完整功能说明；星潮的入口是根目录 `README.md`。
