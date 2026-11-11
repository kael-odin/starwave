// 仓库的确定性分类：不调模型，用描述/主题关键词把仓库归入星潮的 9 个内容分类。
// 规则按优先级打分，命中多个取最高分；都不命中为 null，等元数据补齐或文章关联后再归。
import { sql, type Db } from "@aihot/backend/db";

export interface ClassifyInput {
  name?: string | null;
  description?: string | null;
  topics?: readonly string[] | null;
}

/** 每类一组关键词；按顺序即优先级（并列时取先者）。 */
const RULES: ReadonlyArray<{ category: string; words: RegExp }> = [
  { category: "security", words: /\b(security|vulnerab|cve|exploit|malware|secret|password|auth|encrypt|sbom|supply[- ]?chain|pentest|firewall)\b|安全|漏洞|密码|加密|供应链/i },
  { category: "ai-oss", words: /\b(llm|llms|agent|agents|rag|mcp|embedding|prompt|inference|fine[- ]?tun|gpt|claude|gemini|llama|qwen|mistral|transformer|diffusion|stable[- ]?diffusion|whisper|ocr|vision|speech|tts|asr|chatbot|copilot|sdl)\b|大模型|智能体|推理|嵌入|多模态/i },
  { category: "infra", words: /\b(kubernetes|k8s|docker|container|orchestr|runtime|database|postgres|mysql|sqlite|redis|cache|queue|message|proxy|gateway|server|reverse|devops|ci\/cd|observab|monitor|telemetry|tracing|logging|storage|wasm|webassembly|edge|serverless|cloud|network|vpn|dns|load[- ]?balanc)\b|数据库|容器|网关|可观测|消息队列|运行时|自托管/i },
  { category: "data", words: /\b(data|dataset|etl|elt|pipeline|analytics|vector|scrap|crawl|spider|bi|dashboard|chart(s)?|notebook|sql)\b|数据|爬虫|分析|向量/i },
  { category: "web-design", words: /\b(ui|ux|css|react|vue|svelte|solid|angular|frontend|front[- ]?end|component|design|icon|font|typograph|animation|wireframe|mockup|figma|tailwind)\b|前端|界面|设计|组件库/i },
  { category: "dev-tool", words: /\b(cli|editor|ide|terminal|shell|debug|lint|formatter|format|build|bundler|compiler|transpil|sdk|plugin|extension|productiv|git|diff|grep|search|notes?|markdown|pdf|screenshot|automation|workflow|template|boilerplate|starter|scaffold)\b|工具|编辑器|终端|命令行|插件|效率|笔记|自动化/i },
  { category: "community", words: /\b(funding|sponsor|foundation|governance|maintainer|contributor|license)\b|基金会|治理|维护者|许可证/i },
];

/** 归入星潮的分类 key；都不命中给 null。 */
export function classifyRepo(input: ClassifyInput): string | null {
  const text = [input.name, input.description, ...(input.topics ?? [])].filter(Boolean).join(" \n ");
  if (!text.trim()) return null;
  let best: { category: string; score: number } | null = null;
  for (const rule of RULES) {
    const matches = text.match(new RegExp(rule.words.source, "gi"))?.length ?? 0;
    if (matches > 0 && (!best || matches > best.score)) best = { category: rule.category, score: matches };
  }
  return best?.category ?? null;
}

/**
 * 给还没有分类的仓库补分类：
 * 1. 先继承关联精选文章的分类（多数票）；
 * 2. 再按描述/主题关键词归。
 */
export async function classifyRepos(db: Db = sql): Promise<{ inherited: number; keyword: number }> {
  const inheritedRows = await db<{ id: number }[]>`
    WITH modes AS (
      SELECT m.repo_id, p.category, count(*) AS n,
             row_number() OVER (PARTITION BY m.repo_id ORDER BY count(*) DESC, p.category) AS rn
      FROM repo_mentions m
      JOIN publications p ON p.article_id = m.article_id
      WHERE p.visibility = 'public' AND p.selected AND p.category IS NOT NULL
      GROUP BY m.repo_id, p.category
    )
    UPDATE repos r SET category = modes.category
    FROM modes WHERE modes.rn = 1 AND modes.repo_id = r.id AND r.category IS NULL
    RETURNING r.id
  `;
  const rest = await db<{ id: number; name: string; description: string | null; topics: string[] }[]>`
    SELECT id, name, description, topics FROM repos WHERE category IS NULL
  `;
  let keyword = 0;
  for (const repo of rest) {
    const category = classifyRepo({ name: repo.name, description: repo.description, topics: repo.topics });
    if (!category) continue;
    await db`UPDATE repos SET category = ${category} WHERE id = ${repo.id}`;
    keyword += 1;
  }
  return { inherited: inheritedRows.length, keyword };
}
