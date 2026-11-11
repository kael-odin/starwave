【开源领域翻译与用词规则 — 本平台面向中文开发者，严格遵守】

1. 歧义默认值：以下词在中文有非技术歧义，**一律按开源/开发语境翻译**：
   - Repo / repository = 仓库（不译“储存库”“宝库”）
   - Star / stars = 星标（GitHub 的收藏；不译“星星”“明星”）
   - Fork = 复刻（名词/动词都可用“复刻”；首次出现可写 fork）
   - Issue = 议题（不译“问题”“发行”）
   - Pull Request / PR = 拉取请求（首次出现可保留 PR）
   - Release = 版本发布（不译“释放”）
   - License = 许可证（不译“执照”）
   - Maintainer = 维护者
   - Contributor = 贡献者
   - Commit = 提交
   - Branch = 分支
   - Merge = 合并
   - Build = 构建
   - Deploy = 部署
   - Self-hosted = 自托管
   - Local-first = 本地优先
   - Open weights = 开放权重
   - Open source = 开源；Source-available = 源码可见（两者不可混用）
   - Supply chain = 供应链
   - SBOM = 软件物料清单（首次出现可括注 SBOM）
   - Copyleft = copyleft（保留英文；可括注“传染性开源许可”）
   - Vendor lock-in = 供应商锁定

2. 以下专有名词**一律保留英文原文**，不翻译不加中文括注：
   - 平台与组织：GitHub / GitLab / Hugging Face / Microsoft / Google / Meta / Vercel / Cloudflare / Supabase / Ollama / n8n / JetBrains / Mozilla / Canonical / Red Hat / CNCF / Apache / Linux Foundation / Rust Foundation / Deno / Zed / Neovim / Node.js / Python
   - 项目与产品名：React / Next.js / Vue / Svelte / PyTorch / Kubernetes / Docker / Terraform / Deno / Bun / Vite / Postgres / SQLite / Redis / nginx / Caddy
   - 语言与运行时：Rust / Go / TypeScript / JavaScript / Python / Zig / C++ / WASM
   - 技术缩写：API / SDK / CLI / IDE / CI / CD / JSON / YAML / SQL / HTTP / HTTPS / WASM / GPU / CPU / MCP / RAG / LLM / SBOM / SSO / OAuth / JWT / WebSocket / SSE / gRPC
   - 许可证标识：MIT / Apache-2.0 / GPL-3.0 / AGPL-3.0 / BSD-3-Clause / MPL-2.0 / BSL-1.1 / Unlicense；不要翻译成中文名，不要改写大小写
   - 版本号与 tag：v2.1.159 / 3.50.0 / 0.99.1 / release-2026-11；一字不改，不把 v2 写成“第二代”

3. 中国组织**优先用官方中文名**（首次出现可双标）：
   - 微软 / 谷歌 / 红帽 / Linux 基金会 / 云原生计算基金会 / 开源中国 / 阿里巴巴 / 腾讯 / 字节跳动 / 华为 / 深度求索（DeepSeek）
   - 没有通行中文名的组织保留英文，不要生造译名

4. 代码 / 命令 / URL / 文件名 / 数字单位 **一字不改**保留：
   - 反引号代码 `code` 不翻译
   - 命令如 `npm install`、`cargo build`、`git rebase` 不译
   - URL、仓库路径 owner/name 原样
   - 数字+单位：1.2k stars / 24.1k / 3.5x speedup / 128 MB / 99.9% / 7 天 +4,218 stars
   - 金额、参数量、比例、区间必须保留原文的阿拉伯数字和单位

5. “开源”不等于“免费”：不要因为项目开源就写“免费使用”；license 有商用/再分发限制时必须在摘要里保留。不要把 source-available 写成 open source。
