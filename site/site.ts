// 星潮 Starwave 的站点身份和读者看得到的文案。换成自己的行业时，先改这个文件。
// 网页和后端都读它；改完重新构建（docker compose up -d --build）即可生效。
// 域名不在这里：部署时用环境变量 SITE_URL 设置。

import type { Founder } from "@aihot/contracts/site-config";

/**
 * 日报、周报、月报什么时候出（北京时间，HH:mm）：日报收这个时间之前的 24 小时，周报在每个自然周之后的周一出，
 * 月报在每月 1 日出。排程、成刊时间窗口、缺期告警和所有提到时间的文案都读它。
 */
export const EDITION_TIMES = { daily: "21:00", weekly: "10:00", monthly: "10:30" };

/** “每天 08:00”“每周一 10:00”“每月 1 日 10:30”：写进句子里的出刊时间。 */
export const EDITION_WHEN = {
  daily: `每天 ${EDITION_TIMES.daily}`,
  weekly: `每周一 ${EDITION_TIMES.weekly}`,
  monthly: `每月 1 日 ${EDITION_TIMES.monthly}`,
};

export const SITE = {
  /** 站名：导航、页面标题、分享图、RSS、MCP、后台都用它。 */
  name: "星潮",
  /**
   * 行业词：拼进默认说法里，比如“开源日报”“开源动态”。
   */
  subject: "开源",
  /** 首页的完整标题（浏览器标签、搜索结果）。 */
  homeTitle: "星潮 Starwave — GitHub 与开源动态 · 每日精选与星榜",
  /** 主题目录页（/topics）的标题。 */
  topicsTitle: "开源主题：项目、方向与生态的最新动态",
  /** 反馈表单输入框里的示例。 */
  feedbackExample: "例如：某个仓库的星速看起来不对，或者我想追一个还没收录的项目……",
  /** 反馈页标题下面的一句话。 */
  feedbackLead: "发现 bug、想追的仓库、看不顺眼的地方，都可以告诉我们。",
  /** 反馈表单邮箱框里的提示。 */
  feedbackEmailHint: "留下邮箱，我们可以回信联系你",
  /** 一句话介绍：搜索引擎、分享卡片、RSS、llms.txt 会用。 */
  description: `从 GitHub 与全球开源社区里挑出值得上手的项目、版本发布和维护者故事，每个仓库有持续档案，${EDITION_WHEN.daily} 出一份日报。`,
  /** llms.txt 里一句话介绍下面的一段详细介绍（选填）。 */
  llmsIntro: "星潮关注开源项目本身：它解决什么问题、现在值不值得试、上手成本和风险是什么。榜单按星速、社区讨论、编辑判断和活跃度综合排序，所有数字标明时间窗口。",
  /** 一行小字：分享图、海报下方。 */
  tagline: "看见开源的下一次浪潮",
  /** 搜索引擎读到的关键词（首页结构化数据）。 */
  keywords: ["开源资讯", "GitHub 趋势", "开源项目", "开发者工具", "GitHub 星榜", "开源新闻"] as string[],
  /**
   * 搜索引擎站长平台的网站验证（选填）：meta 名 → 平台给的验证码，放在首页的 head 里。
   */
  siteVerification: {} as Record<string, string>,
  /** 网站开始收录的年份（结构化数据的时间范围，选填）。 */
  since: "2026",
  /** 界面语言（HTML lang、og:locale）。 */
  locale: "zh-CN",
  /** 默认域名，只在没设置 SITE_URL 时使用。 */
  defaultUrl: "http://localhost:3000",
  /** 标准图标以外的根目录图标，site/brand/ 里的文件名（选填）。 */
  rootIcons: [] as string[],
  /**
   * MCP 工具名的前缀（小写字母、数字、下划线），工具会叫 starwave_get_latest、starwave_search……
   * 已经有人接入后就不要再改。
   */
  mcpPrefix: "starwave",
  /**
   * 公开接口（MCP、OpenAPI、llms.txt）的版本号，只升不降。
   */
  interfaceVersion: "4.0.0",
  /** 对外联系邮箱（选填）：llms.txt 和给 Agent 的使用说明里会写。 */
  contactEmail: null as string | null,
  /** 关于页底部的一行小字（选填）。 */
  footerNote: "由 AIHOT 开源框架驱动",
  /** 中国大陆网站的 ICP 备案号（选填）。 */
  icp: null as string | null,
  /** 中国大陆网站的公安备案信息（选填）。 */
  psb: null as string | null,
  /** 源码的 GitHub 仓库地址（选填）。 */
  github: null as string | null,
  /** 页脚的“由 X 驱动”（选填）：默认链回上游 AIHOT，不想要就写 null。 */
  poweredBy: { name: "AIHOT", url: "https://aihot.news" } as { name: string; url: string } | null,
  /** 结构化数据里的网站运营者（搜索引擎用）。 */
  organization: {
    name: "星潮 Starwave",
    /** 创始人（选填）。 */
    founder: null as Founder | null,
  },
  /** 抓取信源时报上的名字和版本（User-Agent 里用），不要冒用别的站。 */
  crawlerName: "StarwaveBot/1.0",
} as const;

/** 使用规则和隐私说明两页（正文在 pages/ 里）。 */
export const POLICY = {
  terms: {
    /** 页面名：导航、页脚、页面标题都用它。 */
    name: "使用规则",
    description: "星潮网页、RSS、公开 API 与 MCP 的使用规则。",
    /** llms.txt 里对这一页的一句说明（选填）。 */
    covers: null as string | null,
    /** Agent 接入页的 RSS、API 两栏各自提醒的使用规则（选填）。 */
    notes: null as null | { rss: string; api: string },
    /**
     * 讲清哪些用途要先取得授权的话（选填）。
     */
    license: null as null | { llms: string; agent: string },
    /**
     * 公开 API、RSS 和 OpenAPI 文件声明使用规则的响应头（选填）。
     */
    headers: null as null | Record<string, string>,
  },
  privacy: {
    description: "星潮如何处理浏览器本地数据、反馈资料与访问日志。",
    /** llms.txt 里对这一页的一句说明（选填）。 */
    covers: null as string | null,
  },
  /**
   * X 帖子本身的文字和图片算不算全文：算的话，只在这篇允许站内全文时显示。
   */
  xPostIsFullText: true,
} as const;

/** 导航（电脑侧栏、手机底栏、“我的”页）。 */
export const NAV = {
  /**
   * 不放进导航的引擎入口，目前只支持热点榜（"/hot"）和主题（"/topics"）。
   */
  hidden: [] as Array<"/hot" | "/topics">,
};

/** 条目卡片和详情页上的几处说法和显示。 */
export const ITEM_COPY = {
  /** 模型写的那句理由叫什么：卡片、详情页、Markdown 导出、给 Agent 的回答和群推送都用它。 */
  reasonLabel: "入选理由",
  /** 读者在网页和分享图上看不看得到 AI 评分。 */
  showScore: true,
};

/** 关于页的一张二维码卡片。 */
interface ContactCard {
  kind: string;
  title: string;
  note: string;
  /** 站外链接过的根目录文件名（选填），比如 qr-wechat.jpg。 */
  alias?: string;
}

/** 关于页的文案。数字来自站内实时统计，不用写在这里。 */
export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  /** 页面描述（搜索结果、分享卡片）。 */
  description: `关于 ${SITE.name}：${SITE.description}`,
  /** 大标题：第一行正常颜色，第二行强调色。 */
  headline: ["开源每天都有新动静，", "值得上手的，只有几个。"] as [string, string],
  /** 标题下面的一段话。{sources} 会换成实时的信源数。 */
  lead: `${SITE.name} 替你盯着{sources}个信源：抓取、归并、评分、精选，${EDITION_WHEN.daily} 出一份日报。免费，不用注册。`,
  sourcesFallback: "二十几",
  /** 信源河动画下面的四个环节。 */
  steps: {
    collect: "GitHub Blog、项目 Release、HN、Lobsters 和中文社区都在看；更新越勤的源看得越勤，最快 15 分钟看一次。",
    store: "抓到的都存下来，同一个仓库的报道和版本归到一张档案里；星速、榜单和日报都从这里长出来。",
    select: `模型先看是不是开源项目、发布或生态变化，再写中文标题、摘要和${ITEM_COPY.reasonLabel}；营销稿、合集和刷星进不来。`,
    publish: `${EDITION_WHEN.daily} 出日报，${EDITION_WHEN.weekly} 出周报，${EDITION_WHEN.monthly} 出月报；星榜每天更新。`,
  },
  /**
   * 作者块（选填），null 就不显示。
   */
  maker: null as null | {
    name: string;
    avatarSourceId?: string | null;
    greeting: string[];
    wechat?: ContactCard;
    feishu?: ContactCard;
  },
  /** 页面底部的版权与下架说明，中间接“反馈页”的链接。 */
  copyright: [`${SITE.name} 是聚合摘要和阅读索引，原文版权归各来源所有。如果你是来源方，希望更正、下架或调整展示方式，可以通过`, "联系我们。"] as [string, string],
  /** 页面底部“使用规则”链接的锚点 id（选填）。 */
  termsAnchor: null as string | null,
} as const;

/** 后台页面上给管理员的提示（选填）。 */
export const ADMIN = {
  /** “反馈”页标题下的一行。 */
  feedbackNote: null as string | null,
  /** 确认框里补的一句本站规定：封禁反馈来源时。 */
  banNote: null as string | null,
  /** 确认框里补的一句本站规定：调整付费服务的请求上限时。 */
  budgetNote: null as string | null,
};

/** Agent 接入页的示例。 */
export const AGENT = {
  /** MCP 工具表里“搜索”一行：能搜什么、可以怎么问。 */
  search: { scope: "按项目、语言、标签或组织搜最近 7 天", ask: "最近一周有没有值得试的本地优先工具？" },
};

/** 日报、周报、月报版面上的说法。 */
export const REPORTS = {
  /** 报头下面的出版者一行。 */
  imprint: SITE.name.toUpperCase(),
  /** 报头旁边的一个词。 */
  motto: SITE.subject as string,
  /** 每种报告页面的描述（搜索结果、分享卡片）。 */
  descriptions: {
    daily: `${SITE.name} ${subjectAfter(`${EDITION_WHEN.daily}（北京时间）发布的`, "精编日报")}`,
    weekly: subjectAfter("每周", "综合回顾"),
    monthly: subjectAfter("每月", "盘点"),
  },
  /** 一期里的一条怎么称呼。 */
  entry: { measure: "件", noun: "动态" },
  /** 报头上其余几个数字后面的说法。 */
  metricUnits: { sourcesCount: "个来源", firstPartyEvents: "件一手发布", selectedCount: "条精选", reportsCovered: "期日报" },
  /** 报告分享图上“共几条”的说法。 */
  shareUnit: "件动态",
  /** 日报时段内有资料经过评判、但没有新大事时的标题与导语。 */
  quiet: { title: "今日安静，没有新的开源动态", paragraph: `${subjectAfter("北京时间 {start} 至 {end}，没有新的", "动态")}。` },
};

/** 运维告警（只发给站长）里随部署而变的几处说法。 */
export const ALERTS = {
  /** 多少分钟没有收录新文章就告警“网站停止收录新内容”（最多一天）。 */
  quietMinutes: 360,
  /** 编辑信源一直抓取成功、只是没有新文章时，多少分钟才告警（最多一天）。 */
  quietWhileFetchingMinutes: 720,
  /** 同一条告警里，“没有”后面补一句平时的收录量；null 就不写。 */
  usualFlow: null as string | null,
  /** worker 停了的告警里，怎么看它的日志。 */
  workerLogs: "看 worker 的日志（docker compose logs worker）",
};

/** 后台新建信源时的默认设置。 */
export const SOURCE_DEFAULTS = {
  /** 站内展示全文；false 时只显示摘要和原文链接。 */
  siteFulltext: false,
};

/**
 * 社区站的信源（填信源 id）：算热度时按发帖的账号计。
 */
export const COMMUNITY_FEEDS: { dev: string[]; hn: string[] } = {
  dev: [],
  hn: [],
};

/** 各页分享图（/og/pages/*.png）上的文字。 */
export const CARDS: Record<string, { kicker: string; title: string; subtitle: string; accent?: "hot" | "amber" }> = {
  site: { kicker: subjectAfter("每日", "精选"), title: SITE.tagline, subtitle: SITE.description },
  all: { kicker: subjectAfter("全部", "动态"), title: "所有信源的最新动态，一站看完", subtitle: "按时间汇总各信源的最新动态，可按类别与标签筛选。" },
  hot: { kicker: "热点榜", title: "过去 48 小时，开源圈在讨论什么", subtitle: "热度指数、趋势与组成热度的公开来源。", accent: "hot" },
  daily: { kicker: withSubject("日报"), title: subjectAfter(`每天 ${spokenTime(EDITION_TIMES.daily)}，一份读得完的`, "日报"), subtitle: `${subjectAfter("前一天值得关注的", "动态")}。` },
  weekly: { kicker: withSubject("周报"), title: `一周${REPORTS.entry.noun}，一次看清`, subtitle: "本周的主线、重要发布与值得回看的讨论。" },
  monthly: { kicker: withSubject("月报"), title: "一个月的变化", subtitle: "月度主线与关键事件回顾。" },
  about: { kicker: "关于", title: `关于 ${SITE.name}`, subtitle: SITE.description },
  terms: { kicker: "使用规则", title: `${SITE.name} 使用规则`, subtitle: "网页、API、RSS 与 MCP 的使用范围。" },
  privacy: { kicker: "隐私说明", title: `${SITE.name} 隐私说明`, subtitle: "访问日志、浏览器本地数据与反馈资料的处理方式。" },
  changelog: { kicker: "更新日志", title: `${SITE.name} 更新日志`, subtitle: "功能更新、优化、公告与下线记录。" },
  feedback: { kicker: "反馈", title: "告诉我们哪里可以更好", subtitle: "内容、功能、接入，或来源方的更正与下架请求。" },
  agent: { kicker: "Agent 接入", title: `把 ${SITE.name} 接进你的 Agent`, subtitle: "MCP、RSS、API 三种方式，匿名只读，无需 API Key。" },
};

/** 公开接口的访问约定里随部署而变的几处。 */
export const ACCESS = {
  /** 同一 IP 每分钟大约能请求多少次。 */
  ratePerMinute: null as number | null,
  /** 请写程序同步数据的人报上的 User-Agent（选填）。 */
  userAgent: null as string | null,
};

/** 这个部署自己的几处安排（选填）。 */
export const DEPLOYMENT = {
  /** 凭据分组文件默认放在哪个目录。 */
  credentialsDir: null as string | null,
  /** 凭据分组的文件名（选填）。 */
  credentialFiles: {} as Partial<Record<string, string>>,
  /** 这个部署额外要求的凭据。 */
  requiredSecrets: [] as const,
  /** 线上 api 收到的 Host（选填）。 */
  originHost: null as string | null,
  /** 反向代理把没登录的后台访问转去登录时，用哪个请求头带上原来的地址（选填）。 */
  loginReturnHeader: null as string | null,
  /**
   * 图片代理从原站取图的流量上限。
   */
  imageUpstreamBudget: null as null | { mbPerMinute: number; gbPerDay: number },
  /**
   * 已实测应由服务器直接连接、不走出网代理的域名（选填）。
   */
  directFetchHosts: [] as string[],
  /**
   * 精选评测（scripts/eval-selection.ts）不带参数时用的金标集。
   */
  selectionGold: null as null | { file: string; sample: number; split: string; sweep: [number, number] },
};

/** RSS 订阅源的说明里随站点而变的说法。 */
export const FEED_COPY = {
  /** “全部动态”源的说明里，还写明不含的内容（选填）。 */
  allLeavesOut: [] as string[],
};

/**
 * 公开接口（API、RSS、MCP）里和网页不同的类别（选填）。上线后不要改。
 */
export const PUBLIC_CATEGORIES = {
  merge: {},
  feedLabels: {},
} as const;

/** “开源日报”这类说法：行业词和名词之间，英文词加空格，中文词不加。 */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}

/** “按主题看开源”“往期开源日报”这类说法。 */
export function subjectAfter(text: string, noun?: string): string {
  const gap = /^[A-Za-z0-9]/.test(SITE.subject) ? " " : "";
  return `${text}${gap}${noun ? withSubject(noun) : SITE.subject}`;
}

/** “8 点”“10 点 30 分”：口语里的 HH:mm。 */
function spokenTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  return `${hour} 点${minute ? ` ${minute} 分` : ""}`;
}

/**
 * 入口页在搜索结果里的标题：读者会搜的词放前面，页面自动在最后接上“ · 站名”（首页用 SITE.homeTitle）。
 */
export const SEO_TITLES = {
  /** 热点榜（/hot）。 */
  hot: `${withSubject("热点榜")}：今日热门事件排行`,
  /** 全部动态（/all），不含搜索和筛选结果。 */
  all: `${subjectAfter("最新", "动态")}：实时更新`,
  /** Agent 接入页（/agent）。 */
  agent: `${withSubject("资讯")} API、MCP 与 RSS：接进你的 Agent`,
  /** 关于页（/about）的完整标题，已含站名。 */
  about: `关于 ${SITE.name}：${SITE.tagline}`,
  /** 日报、周报、月报的最新一期；date 是这一期的日期。 */
  latestReport: (kind: "daily" | "weekly" | "monthly", date: string): string =>
    ({ daily: `${withSubject("日报")}：${subjectAfter("每日", "新闻")}（${date}）`, weekly: `${withSubject("周报")}：一周大事回顾（${date}）`, monthly: `${withSubject("月报")}：${date} 大事回顾` })[kind],
  /** 主题页第一页：公司搜“最新消息”，方向和内容类型搜“最新进展”。 */
  topic: (name: string, group: "company" | "field" | "genre", updated: string | null): string =>
    `${name} ${group === "company" ? "最新消息与动态" : "最新动态与进展"}${updated ? `（${updated}更新）` : ""}`,
};
