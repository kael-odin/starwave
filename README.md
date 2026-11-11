# 星潮 Starwave

> **看见开源的下一次浪潮。**
> Open source, before it trends.

星潮是一个中文优先的 GitHub / 开源新闻站。它每天扫 GitHub 与全球开源社区，用公开的编辑标准筛出真正值得上手的项目、版本发布、维护者故事和生态变化；每个仓库有持续档案，每周有星榜。

- 不是 GitHub Trending 的中文镜像：Trending 只说明“有人在 star”，星潮回答“值不值得看、怎么试、有什么坑”。
- 不是泛 AI 新闻站：只关心开源项目、开发者工具、基础设施、供应链和社区。
- 不是黑盒推荐：评分维度、提示词、入选门槛、榜单算法全部写在仓库里。

## 现在是什么状态

**规划与地基阶段（P0）。** 引擎来自 [AIHOT](https://github.com/KKKKhazix/AIHOT)（MIT），已完成：

- 产品方案、数据模型、内容标准、视觉方向、双语方案、本地托管文档
- 星潮品牌配置、Logo/图标、深浅色 token、报头字
- 9 个开源分类、27 个实测信源、48 个主题
- `modules/github` 仓库层骨架：Trending/Search/元数据采集、星榜、三张页面
- 验证：`npm run typecheck`、`npm run build -w @aihot/web`、 migrations + architecture tests 21 项、真实 Trending 解析、模块 SQL 冒烟

还不能直接上线；还差 `.env`、首次 Docker 启动、真实精选校准。按 [`docs/ROADMAP.md`](docs/ROADMAP.md) 推进。

## 文档

| 文档 | 内容 |
|---|---|
| [`docs/STARWAVE-PLAN.md`](docs/STARWAVE-PLAN.md) | 产品定位、信息架构、内容生产线、榜单、成本、风险 |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) | 仓库表结构、GitHub 采集、星榜算法 |
| [`docs/CONTENT.md`](docs/CONTENT.md) | 编辑宪章、分类标签、评分权重、写作规范 |
| [`docs/DESIGN.md`](docs/DESIGN.md) | 视觉系统、色板、组件、页面线框 |
| [`docs/I18N.md`](docs/I18N.md) | 中英双语实现 |
| [`docs/LOCAL-HOSTING.md`](docs/LOCAL-HOSTING.md) | 本地 Docker 长期运行、备份、公网访问 |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | P0–P4 任务与验收 |
| [`docs/FORK-NOTES.md`](docs/FORK-NOTES.md) | 与上游 AIHOT 的关系、合并策略 |

## 快速启动

需要 Docker、Node.js ≥ 24.22.1、一个 OpenAI 兼容的模型 API Key。

```bash
cd starwave
node scripts/init-env.ts --llm-key <你的模型 API Key>
# 编辑 .env：ADMIN_PASSWORD、POSTGRES_PASSWORD、GITHUB_TOKEN（可选）
docker compose up -d --build
```

- 站点：http://localhost:3000
- 后台：http://localhost:3000/admin
- 日志：`docker compose logs -f worker`

首次启动会迁移数据库并导入 `industry/sources.json` 里的示范信源。

## 目录

```text
apps/            api · worker · web（继承 AIHOT）
packages/        backend · contracts（继承 AIHOT）
site/            星潮的站名、文案、品牌、模型选择
industry/        开源分类、标签、信源、提示词、门槛
modules/github/  仓库档案、星榜、GitHub 采集（星潮新增）
docs/            星潮文档 + 上游文档
database/        引擎迁移
```

## 原则

- 来源可追溯：每条精选链接原文，默认只展示摘要。
- 数字可验证：stars、版本、license 必须来自原文或 GitHub API，并标明时间窗口。
- 规则公开：提示词、门槛、榜单权重都在仓库里。
- 不冒用：本项目和 GitHub 没有隶属关系；不使用 GitHub Logo 暗示官方。

## 许可

引擎与代码沿用 AIHOT 的 MIT 许可，见 [`LICENSE`](LICENSE)、[`NOTICE`](NOTICE)。星潮自己的文档与品牌资产同样以 MIT 发布，品牌名与 Logo 除外。

上游 README：[`docs/UPSTREAM-README.md`](docs/UPSTREAM-README.md)。
