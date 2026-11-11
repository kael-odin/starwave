// 星潮 Starwave 的行业包：开源项目的分类体系、标签词表、组织名录和身份词典。
// 模型按这里的词表打标签，主题页按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题；guide 告诉结构抽取模型这一类收什么、和相邻类别的边界在哪。
 * commentary 标出评论类（观点、复盘）：日报写过的事又有评论类后续报道时，只占一行快讯。
 * tagColor 是飞书推送卡片里跟在标题后面的小标签颜色。
 */
export const CATEGORIES = [
  {
    key: "new-release",
    tagColor: "indigo",
    label: "新项目",
    feedLabel: "新项目与发布",
    section: "新项目与发布",
    guide: "新仓库、首次公开发布、重大版本、breaking change、从闭源转为开源。常规小版本、只改文档或依赖升级不算。",
  },
  {
    key: "dev-tool",
    tagColor: "turquoise",
    label: "开发工具",
    feedLabel: "开发工具",
    section: "工具与基础设施",
    guide: "读者用来写代码、调试、部署、管理项目的工具：CLI、编辑器、IDE、终端、SDK、构建工具、效率工具、插件。产品本身是闭源的开发工具也收，但优先开源。",
  },
  {
    key: "ai-oss",
    tagColor: "violet",
    label: "AI 开源",
    feedLabel: "AI 开源",
    section: "AI 开源",
    guide: "开放权重、推理/训练代码、Agent 框架、RAG、多模态、MCP、本地模型运行、评测工具。闭源模型发布、纯跑分、纯 API 价格变化不收。",
  },
  {
    key: "infra",
    tagColor: "orange",
    label: "基础设施",
    feedLabel: "基础设施",
    section: "工具与基础设施",
    guide: "数据库、运行时、容器、云原生、DevOps、可观测性、消息队列、存储引擎、网络与代理。公司融资归社区与商业，不归这里。",
  },
  {
    key: "web-design",
    tagColor: "green",
    label: "前端与设计",
    feedLabel: "前端与设计",
    section: "工具与基础设施",
    guide: "前端框架、UI 库、设计工具、低代码、图形/可视化、字体与图标、跨端框架。后端 API 和数据库不归这里。",
  },
  {
    key: "data",
    tagColor: "blue",
    label: "数据与存储",
    feedLabel: "数据与存储",
    section: "工具与基础设施",
    guide: "数据工具、分析、ETL、向量库、数据集、存储格式、备份恢复、数据可视化。数据库引擎本身归基础设施。",
  },
  {
    key: "security",
    tagColor: "red",
    label: "安全与供应链",
    feedLabel: "安全与供应链",
    section: "安全与供应链",
    guide: "漏洞、SBOM、依赖安全、许可证风险、供应链攻击、隐私工具、密钥管理。泛安全观点归观点与复盘。",
  },
  {
    key: "community",
    tagColor: "yellow",
    label: "社区与商业",
    feedLabel: "社区与商业",
    section: "社区与商业",
    guide: "维护者故事、治理、基金会、融资并购、许可证变更、公司开源战略、人事变动、社区争议。产品发布归新项目或开发工具。",
  },
  {
    key: "opinion",
    tagColor: "purple",
    label: "观点与复盘",
    feedLabel: "观点与复盘",
    section: "观点与复盘",
    guide: "作者的解释、判断、预测、访谈、工程复盘、开源生态评论。重点是观点和可迁移经验，不是转述新闻。",
    commentary: true,
  },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 最受关注的一类发布：日报报头的“N 个新项目”按它数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "new-release", tag: "新项目", unit: "个新项目" };

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["github", "git", "gitlab", "api", "cli", "sdk", "ide", "oss", "pr", "ci", "cd", "json", "yaml", "sql", "http", "https", "wasm", "gpu", "cpu", "ui", "ux", "db", "mcp", "repo"];

/**
 * 内容理解一步给每篇资料判的“内容类型”。评分提示词按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["new_repo", "release", "dev_tool", "ai_tool", "infra", "security_event", "community_event", "opinion_analysis", "tutorial_explainer", "benchmark"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "新项目", "版本发布", "开发工具", "AI 工具", "基础设施", "前端/设计", "数据/存储", "安全/供应链",
  "社区/商业", "观点/复盘", "教程/实践", "评测/基准", "其他",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "Agent", "MCP", "RAG", "推理", "本地优先", "自托管", "CLI", "编辑器", "终端", "插件", "跨平台",
  "自动化", "数据库", "容器", "可观测性", "设计工具", "低代码", "供应链", "性能", "开发者体验", "中文文档",
] as const;

/** 可选的实体标签（组织、基金会、平台）。 */
export const ENTITY_TAGS = [
  "GitHub", "GitLab", "Hugging Face", "OpenAI", "Anthropic", "Microsoft", "Google", "Meta", "Vercel", "Cloudflare", "Supabase",
  "Ollama", "n8n", "JetBrains", "Mozilla", "Canonical", "Red Hat", "CNCF", "Apache", "Linux Foundation",
  "Rust Foundation", "Deno", "Zed", "Neovim", "Node.js", "Python",
] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  开源: "新项目", 仓库: "新项目", repo: "新项目", repos: "新项目", "open-source": "新项目", opensource: "新项目",
  发布: "版本发布", release: "版本发布", 版本: "版本发布", breaking: "版本发布",
  工具: "开发工具", "developer tool": "开发工具", devtool: "开发工具", ide: "开发工具", sdk: "开发工具",
  ai: "AI 工具", 模型: "AI 工具", llm: "AI 工具",
  基础设施: "基础设施", infra: "基础设施", devops: "基础设施", 云原生: "基础设施", kubernetes: "基础设施", k8s: "基础设施",
  前端: "前端/设计", 设计: "前端/设计", ui: "前端/设计", css: "前端/设计", react: "前端/设计",
  数据: "数据/存储", 存储: "数据/存储", database: "数据/存储", db: "数据/存储", etl: "数据/存储",
  安全: "安全/供应链", security: "安全/供应链", 供应链: "安全/供应链", license: "安全/供应链", 许可证: "安全/供应链", sbom: "安全/供应链",
  融资: "社区/商业", funding: "社区/商业", 收购: "社区/商业", acquisition: "社区/商业", 治理: "社区/商业", governance: "社区/商业", 基金会: "社区/商业",
  教程: "教程/实践", tutorial: "教程/实践", 指南: "教程/实践", guide: "教程/实践", 实践: "教程/实践",
  观点: "观点/复盘", opinion: "观点/复盘", 复盘: "观点/复盘", retrospective: "观点/复盘", 趋势: "观点/复盘",
  评测: "评测/基准", benchmark: "评测/基准", 基准: "评测/基准",
  "non-ai": "其他", 其他工具: "其他",
};

// ── 组织与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 组织主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是组织发消息时开头用的名字；otherNames 是其他称呼。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  github: { name: "GitHub", displayTag: "GitHub", aliases: ["GitHub", "GitHub Inc.", "github.com"], orgNames: ["GitHub"], otherNames: ["GitHub Blog", "GitHub Changelog", "GitHub Engineering"] },
  gitlab: { name: "GitLab", displayTag: "GitLab", aliases: ["GitLab", "GitLab Inc."], orgNames: ["GitLab"], otherNames: ["GitLab Blog"] },
  openai: { name: "OpenAI", displayTag: "OpenAI", aliases: ["OpenAI", "ChatGPT", "Codex", "OpenAI Cookbook"], orgNames: ["OpenAI"], otherNames: ["OpenAI Developers"] },
  anthropic: { name: "Anthropic", displayTag: "Anthropic", aliases: ["Anthropic", "Claude", "Claude Code", "Anthropic Cookbook"], orgNames: ["Anthropic"], otherNames: ["Anthropic Engineering"] },
  "hugging-face": { name: "Hugging Face", displayTag: "Hugging Face", aliases: ["Hugging Face", "HuggingFace", "HF"], orgNames: ["Hugging Face"], otherNames: ["HF Blog"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "GitHub Copilot", "VS Code", "Visual Studio Code"], orgNames: ["Microsoft", "微软"], otherNames: ["Microsoft Research", "Microsoft Open Source"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "谷歌", "Google Open Source", "Chromium"], orgNames: ["Google", "谷歌"], otherNames: ["Google Developers", "Google Open Source Blog"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Facebook", "React", "PyTorch"], orgNames: ["Meta", "Facebook"], otherNames: ["Meta Open Source"] },
  vercel: { name: "Vercel", displayTag: "Vercel", aliases: ["Vercel", "Next.js"], orgNames: ["Vercel"], otherNames: ["Vercel Blog"] },
  cloudflare: { name: "Cloudflare", displayTag: "Cloudflare", aliases: ["Cloudflare", "Cloudflare Workers"], orgNames: ["Cloudflare"], otherNames: ["Cloudflare Blog"] },
  supabase: { name: "Supabase", displayTag: "Supabase", aliases: ["Supabase"], orgNames: ["Supabase"], otherNames: [] },
  ollama: { name: "Ollama", displayTag: "Ollama", aliases: ["Ollama"], orgNames: ["Ollama"], otherNames: [] },
  n8n: { name: "n8n", displayTag: "n8n", aliases: ["n8n"], orgNames: ["n8n"], otherNames: [] },
  jetbrains: { name: "JetBrains", displayTag: "JetBrains", aliases: ["JetBrains", "IntelliJ", "Kotlin"], orgNames: ["JetBrains"], otherNames: ["JetBrains Blog"] },
  mozilla: { name: "Mozilla", displayTag: "Mozilla", aliases: ["Mozilla", "Firefox"], orgNames: ["Mozilla"], otherNames: ["Mozilla Blog"] },
  canonical: { name: "Canonical", displayTag: "Canonical", aliases: ["Canonical", "Ubuntu"], orgNames: ["Canonical"], otherNames: [] },
  "red-hat": { name: "Red Hat", displayTag: "Red Hat", aliases: ["Red Hat", "红帽"], orgNames: ["Red Hat", "红帽"], otherNames: [] },
  cncf: { name: "CNCF", displayTag: "CNCF", aliases: ["CNCF", "Cloud Native Computing Foundation", "云原生计算基金会"], orgNames: ["CNCF"], otherNames: [] },
  apache: { name: "Apache", displayTag: "Apache", aliases: ["Apache", "Apache Software Foundation", "ASF"], orgNames: ["Apache Software Foundation", "ASF", "Apache"], otherNames: [] },
  "linux-foundation": { name: "Linux Foundation", displayTag: "Linux Foundation", aliases: ["Linux Foundation", "Linux 基金会", "Linus Torvalds"], orgNames: ["Linux Foundation", "Linux 基金会"], otherNames: [] },
  "rust-foundation": { name: "Rust Foundation", displayTag: "Rust Foundation", aliases: ["Rust Foundation", "Rust"], orgNames: ["Rust Foundation", "Rust Project"], otherNames: ["Rust Blog"] },
  denoland: { name: "Deno", displayTag: "Deno", aliases: ["Deno", "Deno Land"], orgNames: ["Deno"], otherNames: ["Deno Blog"] },
  "zed-industries": { name: "Zed", displayTag: "Zed", aliases: ["Zed", "Zed Industries"], orgNames: ["Zed", "Zed Industries"], otherNames: ["Zed Blog"] },
  neovim: { name: "Neovim", displayTag: "Neovim", aliases: ["Neovim", "nvim"], orgNames: ["Neovim"], otherNames: [] },
  nodejs: { name: "Node.js", displayTag: "Node.js", aliases: ["Node.js", "Node", "Nodejs"], orgNames: ["Node.js", "Node.js Foundation"], otherNames: ["Node.js Blog"] },
  python: { name: "Python", displayTag: "Python", aliases: ["Python", "Python Software Foundation", "PSF", "CPython"], orgNames: ["Python Software Foundation", "PSF", "Python"], otherNames: ["Python Insider"] },
};

/**
 * 身份词典：摘要和标题里出现的组织，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止张冠李戴）。
 * 开源站主要防“把 A 项目的发布写成 B 组织”的情况。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "github", name: "GitHub", patterns: [/github|github\.blog/i] },
  { id: "gitlab", name: "GitLab", patterns: [/gitlab/i] },
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bcodex\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i] },
  { id: "hugging-face", name: "Hugging Face", patterns: [/hugging\s?face|\bhf\b/i] },
  { id: "microsoft", name: "Microsoft", patterns: [/microsoft|微软|github copilot|vs code|visual studio code/i] },
  { id: "google", name: "Google", patterns: [/google|谷歌|chromium/i] },
  { id: "meta", name: "Meta", patterns: [/\bmeta\b|facebook|\breact\b|pytorch/i] },
  { id: "vercel", name: "Vercel", patterns: [/vercel|next\.js/i] },
  { id: "cloudflare", name: "Cloudflare", patterns: [/cloudflare/i] },
  { id: "supabase", name: "Supabase", patterns: [/supabase/i] },
  { id: "ollama", name: "Ollama", patterns: [/\bollama\b/i] },
  { id: "n8n", name: "n8n", patterns: [/\bn8n\b/i] },
  { id: "jetbrains", name: "JetBrains", patterns: [/jetbrains|intellij|kotlin/i] },
  { id: "mozilla", name: "Mozilla", patterns: [/mozilla|firefox/i] },
  { id: "canonical", name: "Canonical", patterns: [/canonical|ubuntu/i] },
  { id: "red-hat", name: "Red Hat", patterns: [/red\s?hat|红帽/i] },
  { id: "cncf", name: "CNCF", patterns: [/\bcncf\b|cloud native computing foundation|云原生计算基金会/i] },
  { id: "apache", name: "Apache", patterns: [/apache|\basf\b/i] },
  { id: "linux-foundation", name: "Linux Foundation", patterns: [/linux foundation|linux 基金会/i] },
  { id: "rust-foundation", name: "Rust Foundation", patterns: [/rust foundation|rust project|\brust\b/i] },
  { id: "denoland", name: "Deno", patterns: [/\bdeno\b/i] },
  { id: "zed-industries", name: "Zed", patterns: [/\bzed\b/i] },
  { id: "neovim", name: "Neovim", patterns: [/\bneovim\b|\bnvim\b/i] },
  { id: "nodejs", name: "Node.js", patterns: [/node\.?js/i] },
  { id: "python", name: "Python", patterns: [/python|\bpsf\b|cpython/i] },
];

/** 这些域名上的文章，发布方就是对应的组织（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "github", domains: ["github.blog"] },
  { entityId: "gitlab", domains: ["about.gitlab.com"] },
  { entityId: "openai", domains: ["openai.com", "cookbook.openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "hugging-face", domains: ["huggingface.co"] },
  { entityId: "microsoft", domains: ["microsoft.com", "devblogs.microsoft.com", "code.visualstudio.com"] },
  { entityId: "google", domains: ["opensource.google", "developers.googleblog.com", "blog.google"] },
  { entityId: "meta", domains: ["engineering.fb.com", "ai.meta.com"] },
  { entityId: "vercel", domains: ["vercel.com"] },
  { entityId: "cloudflare", domains: ["blog.cloudflare.com", "cloudflare.com"] },
  { entityId: "supabase", domains: ["supabase.com"] },
  { entityId: "ollama", domains: ["ollama.com"] },
  { entityId: "n8n", domains: ["n8n.io"] },
  { entityId: "jetbrains", domains: ["jetbrains.com", "blog.jetbrains.com"] },
  { entityId: "mozilla", domains: ["blog.mozilla.org", "hacks.mozilla.org"] },
  { entityId: "canonical", domains: ["canonical.com", "ubuntu.com"] },
  { entityId: "red-hat", domains: ["redhat.com"] },
  { entityId: "cncf", domains: ["cncf.io"] },
  { entityId: "apache", domains: ["apache.org"] },
  { entityId: "linux-foundation", domains: ["linuxfoundation.org"] },
  { entityId: "rust-foundation", domains: ["blog.rust-lang.org", "rust-lang.org"] },
  { entityId: "denoland", domains: ["deno.com"] },
  { entityId: "zed-industries", domains: ["zed.dev"] },
  { entityId: "nodejs", domains: ["nodejs.org"] },
  { entityId: "python", domains: ["python.org", "pythoninsider.blogspot.com"] },
];

/** 原文里的这些写法也算提到了对应组织。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "github", pattern: /@github\b/i },
  { entityId: "hugging-face", pattern: /@huggingface\b/i },
  { entityId: "vercel", pattern: /@vercel\b/i },
];
