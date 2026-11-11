# 星潮 Starwave · 部署选项

## 结论

**Vercel 不能直接跑整套星潮。** AIHOT 不是静态站，也不是一个 Next.js 应用：

- `api`：Fastify 常驻进程，处理站点接口、RSS、MCP、后台、图片代理
- `worker`：pg-boss 常驻进程，每分钟调度采集、评分、归组、日报、告警
- `db`：PostgreSQL，存文章、事件、报告、仓库快照
- `web`：React Router SSR 常驻 Node 进程

Vercel 的 Serverless/Functions 没有常驻 worker；Vercel Cron 也不适合每分钟轮询 pg-boss。把 worker 改成 Serverless 等于重写引擎，不建议。

## 四种可行路径

| 方案 | 适合 | 成本 | 工作量 | 备注 |
|---|---|---|---|---|
| **Cloudflare Tunnel + 本机 Docker** | 现在就想给朋友看 | ¥0 | 10 分钟 | 电脑要开着；适合预览，不适合 7×24 正式站 |
| **VPS 2C4G + Docker Compose** | 正式公开 | ¥50–100/月 | 1–2 小时 | 推荐；Caddy 自动 HTTPS，worker 常驻 |
| **Railway / Render / Fly** | 不想管服务器 | $10–25/月 | 1 小时 | 支持 Docker + 常驻 worker；托管 Postgres 另算 |
| **Vercel 只托管前端** | 以后做英文站/落地页 | ¥0–20/月 | 2–3 天 | API + worker + DB 仍需 VPS；SSR 适配、跨域 Cookie、缓存都要改 |

## 推荐顺序

### 1. 现在：本机 Docker + Cloudflare Tunnel

```bash
# 本机站点已跑在 http://localhost:3000
cloudflared tunnel --url http://localhost:3000
```

得到 `https://xxx.trycloudflare.com`，可直接发给别人预览。临时隧道每次重启换地址；正式域名用命名隧道。

注意：

- 电脑关机/睡眠 = 站点停更
- `.env` 里 `SITE_URL` 改成隧道地址后重启 web，RSS/分享图/MCP 的链接才正确
- 不要把 `db`、`api` 端口暴露到公网

### 2. 正式：VPS + Docker Compose

```bash
# 新机安装 Docker + compose
git clone <your-repo> starwave
cd starwave
cp .env.example .env      # 填模型 key、ADMIN_PASSWORD、POSTGRES_PASSWORD、GITHUB_TOKEN
docker compose up -d --build

# 有域名时
# .env: SITE_DOMAIN=starwave.example.com, TRUST_PROXY=true
docker compose --profile https up -d --build
```

把 `db`、`data` volume 做每日备份；`docker compose logs -f worker` 看采集。

### 3. 如果坚持 Vercel

只能这样拆：

```text
Vercel: apps/web (SSR)  ──HTTP──>  VPS/Railway: api + worker + Postgres
```

需要额外做：

- 给 `apps/web` 做 Vercel React Router 适配（当前是自定义 Node server）
- `API_BASE_URL` 指向公网 API，处理 CORS / Cookie / 可信代理
- API 和 worker 仍然要一台常驻机器
- 两套部署的日志、回滚、缓存分别维护

**不建议在第一期做。** 同样工作量放到 VPS 上，当天就能上线。

## 当前本机状态

- 站点：http://localhost:3000
- 后台：http://localhost:3000/admin（密码在 `.env` 的 `ADMIN_PASSWORD`）
- 采集：24 个启用信源，23 个正常
- 内容：244 篇入库、241 篇分析、34 条精选
- 仓库：Trending 日/周榜已入库，`/repos`、`/trending` 可访问
- 模型：OpenCode Zen `deepseek-v4.1-flash`，需要 `x-opencode-session` 头；已通过 `LLM_EXTRA_HEADERS` 配置

## 已知待办

- 4 个中文/官方源（Deno Blog、V2EX、机器之心、InfoQ）返回 HTML 不是 RSS，已停用；Deno 改用 releases feed
- 首轮内容里有 12 条闭源/营销/游戏演示，已人工撤下；提示词已收紧，下一轮生效
- 日报要等 08:00 或下一次 `reports.compose`；首日可手动补
- 公网前先改 `SITE_URL`，并确认 `EGRESS_PROXY_URL` 在服务器上可用
