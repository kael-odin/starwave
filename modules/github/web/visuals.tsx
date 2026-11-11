// am 风格的基础视觉件：面板（标题行 + 发丝线）、横向条形、信息块。数据都是真实字段，不做装饰图。
import type { ReactNode } from "react";
import { Link } from "react-router";

/** 面板：标题在左、小字元信息在右，一条发丝线隔开内容。 */
export function Panel({ title, meta, children, className = "" }: { title: string; meta?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-panel border border-line bg-surface ${className}`}>
      <div className="flex items-baseline justify-between gap-3 border-b border-line-soft px-4 py-3">
        <h2 className="text-[14px] font-semibold leading-tight text-ink">{title}</h2>
        {meta && <span className="font-mono text-[11px] text-ink-4">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

export interface BarRow {
  label: string;
  value: number;
  href?: string;
  /** 本行填充色：默认 accent，首个可给 amber。 */
  tone?: "accent" | "amber";
}

/** 横向条形列表：真实计数，宽度按最大值归一；挂载时从 0 长出（尊重 reduced-motion）。 */
export function BarList({ rows, grown }: { rows: BarRow[]; grown: boolean }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      {rows.map((r, i) => {
        const pct = Math.max(2, Math.round((r.value / max) * 100));
        const fill = r.tone ?? (i === 0 ? "amber" : "accent");
        const body = (
          <>
            <span className="w-24 shrink-0 truncate text-[12.5px] text-ink-2">{r.label}</span>
            <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-well">
              <span
                className={`block h-full rounded-full ${fill === "amber" ? "bg-amber" : "bg-accent"} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
                style={{ width: grown ? `${pct}%` : "0%" }}
              />
            </span>
            <span className="w-9 shrink-0 text-right font-mono text-[11.5px] text-ink-3">{r.value}</span>
          </>
        );
        return r.href ? (
          <Link key={r.label} to={r.href} className="flex items-center gap-3 px-4 py-2 hover:bg-accent-softer">
            {body}
          </Link>
        ) : (
          <div key={r.label} className="flex items-center gap-3 px-4 py-2">{body}</div>
        );
      })}
    </div>
  );
}

/** 信息块：accent-softer 底，无彩边；warn 用 amber-soft。 */
export function Callout({ tone = "info", children, className = "" }: { tone?: "info" | "warn"; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-panel px-4 py-3 text-[13px] leading-relaxed text-ink-2 ${tone === "warn" ? "bg-amber-soft" : "bg-accent-softer"} ${className}`}>
      {children}
    </div>
  );
}
