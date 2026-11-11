// 站点的字标和圆环标记：页面用 Wordmark 画站名（size 是高度，单位像素），RingMark 是小标记，转起来就是加载动画。
// 图形是“潮线 + 星标”：一条向右上扬的浪，波峰处嵌一枚四角星。
import { SITE } from "../site.ts";

export function StarMark({ className = "", size = 24, title }: { className?: string; size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} aria-label={title}>
      <path d="M3 17.5c3.2 0 4.2-6 8.5-6s5.3 4 9.5 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16.5 3l1.3 3.4 3.4 1.3-3.4 1.3L16.5 12l-1.3-3.4-3.4-1.3 3.4-1.3z" className="fill-amber" />
    </svg>
  );
}

export function Wordmark({ size = 24, className = "", title = SITE.name }: { size?: number; className?: string; title?: string }) {
  return (
    <span className={`inline-flex items-center font-black leading-none tracking-[-0.03em] ${className}`} style={{ fontSize: Math.round(size * 0.92) }} aria-label={title} role="img">
      <StarMark size={Math.round(size * 0.56)} className="mr-[0.26em] shrink-0 overflow-visible" />
      <span aria-hidden="true">{SITE.name}</span>
    </span>
  );
}

/** A ring with a dot; spinning, it is the loader. */
export function RingMark({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g style={spinning ? { transformOrigin: "12px 12px", animation: "spin-slow 1.1s linear infinite" } : undefined}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="42 15" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
