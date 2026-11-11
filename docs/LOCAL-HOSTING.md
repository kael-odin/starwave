# 星潮 Starwave · 本地 Docker 长期运行手册

## 1. 可以一直跑在本机吗

**可以。** `docker-compose.yml` 就是生产形态：Postgres 17 + setup + api + worker + web，全部 `restart: unless-stopped`。只要机器开着、Docker Desktop 在运行，采集、评分、日报就会持续。

需要接受：

| 事项 | 影响 | 建议 |
|---|---|---|
| 电脑关机/睡眠 | 站点停更、日报缺期 | 用常开小主机/NAS/旧笔记本；电源策略设为不睡眠 |
| 家庭网络 | 外网访问需要隧道或端口转发 | Cloudflare Tunnel（推荐） |
| 单盘故障 | 数据丢失 | 每日 `pg_dump` + `.env` + 配置备份到另一块盘/云 |
| Windows 更新重启 | 短暂停机 | Docker Desktop 开机自启；`restart: unless-stopped` 会自动拉起 |
| 上行带宽 | 图片代理慢 | 图片有缓存；必要时限制 `IMGPROXY_UPSTREAM_*` |

## 2. 前置

- Docker Desktop（Windows）已安装并运行
- Node.js ≥ 24.22.1（只用 `scripts/init-env.ts`，也可手工写 `.env`）
- 模型 API Key（DeepSeek / 千问 / 智谱，任意 OpenAI 兼容）
- GitHub Token（可选，5000 请求/小时；只读 public repo 即可）

## 3. 首次启动

```bash
cd D:/Github-Star/starwave
node scripts/init-env.ts --llm-key <你的模型 API Key>
```

它会生成 `.env`，填好随机密钥。然后编辑 `.env`：

```dotenv
SITE_URL=http://localhost:3000
ADMIN_PASSWORD=<至少 12 位，自己设>
POSTGRES_PASSWORD=<随机>
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=<key>
LLM_MODEL=deepseek-flash
LLM_EXTRA_JSON={"thinking":{"type":"disabled"}}
GITHUB_TOKEN=<可选，ghp_...>
```

启动：

```bash
docker compose up -d --build
```

首次会：

1. 启动 Postgres
2. `setup` 执行迁移 + 导入 `industry/sources.json`
3. 启动 api / worker / web
4. worker 开始按频率采集

访问：

- 站点：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`
- 健康检查：`docker compose ps`

查看日志：

```bash
docker compose logs -f worker
docker compose logs -f api
docker compose logs -f web
```

## 4. 日常运维

### 4.1 看状态

```bash
docker compose ps
docker compose logs --tail=200 worker
```

后台“运行”页看：采集失败、模型失败、预算、日报缺期。

### 4.2 更新

```bash
cd D:/Github-Star/starwave
git pull upstream main        # 合并 AIHOT 更新（如果有冲突按 FORK-NOTES 处理）
docker compose up -d --build
```

只改文案/提示词时也要 `--build`，因为镜像里打包了 `site/` 和 `industry/`。

### 4.3 备份

数据库：

```bash
docker compose exec -T db pg_dump -U aihot aihot | gzip > backup-$(date +%F).sql.gz
```

要备份的还有：

- `.env`（密钥）
- `site/`、`industry/`、`modules/`（配置与代码）
- Docker volumes：`starwave_db`、`starwave_data`

建议每天凌晨自动备份到另一块盘或云存储；AIHOT 自带 S3 兼容备份（`.env` 里 `DB_BACKUP_STORE_*`）。

### 4.4 恢复

```bash
gunzip -c backup-2026-11-10.sql.gz | docker compose exec -T db psql -U aihot aihot
```

### 4.5 清理

```bash
docker compose down            # 停止，保留数据
docker compose down -v         # 停止并删除数据（危险）
docker image prune -f          # 清理旧镜像
```

## 5. 公网访问

### 5.1 Cloudflare Tunnel（推荐）

临时预览：

```bash
cloudflared tunnel --url http://localhost:3000
```

正式：

1. 域名接入 Cloudflare
2. `cloudflared tunnel create starwave`
3. 配置 `config.yml` 指向 `http://localhost:3000`
4. `cloudflared tunnel route dns starwave starwave.example.com`
5. 用 `cloudflared service install` 注册为 Windows 服务

优点：不用开端口、自动 HTTPS、可加 Access 保护后台。
注意：`SITE_URL` 改成正式域名；`TRUST_PROXY=true`；`MCP_ALLOWED_HOSTS` 加域名。

### 5.2 端口转发 + Caddy

有公网 IP 时：

```bash
# .env
SITE_DOMAIN=starwave.example.com
TRUST_PROXY=true

docker compose --profile https up -d --build
```

路由器把 80/443 转发到本机；Caddy 自动申请证书。

### 5.3 国内服务器

需要 ICP 备案；海外服务器无备案但延迟高。图片代理和 RSS 抓取可能需要 `EGRESS_PROXY_URL`。

## 6. 安全

- 不要暴露 Postgres 5432、api 3001 到公网；compose 默认只映射 web 3000。
- `ADMIN_PASSWORD` 至少 12 位；不要用默认值。
- `INGEST_TOKEN` 不填就关闭外部推送接口；要用就设 ≥16 位随机串。
- Cloudflare Tunnel 可给 `/admin` 加 Access 邮箱验证。
- 定期 `docker compose pull` 更新 Postgres 基础镜像（大版本升级前备份）。

## 7. 故障排查

| 现象 | 检查 |
|---|---|
| 首页 502 | `docker compose ps`，api/web 是否启动；`docker compose logs api` |
| 没有新内容 | 后台“信源”页看失败原因；`COLLECT_ENABLED` 是否为 true |
| 模型全失败 | `.env` 的 `LLM_*`；余额；`LLM_REASONING_TOKENS` |
| 日报没出 | worker 日志；`EDITION_TIMES`；时区（Asia/Shanghai） |
| 图片 403/503 | 图片代理预算；原站防盗链；`IMGPROXY_UPSTREAM_*` |
| GitHub 429 | `GITHUB_TOKEN` 是否配置；降低 Trending 频率 |
| 磁盘满 | `docker system df`；清理旧镜像/日志；备份后清 `repo_snapshots` 旧数据 |

## 8. 从本地迁到 VPS

1. 新机装 Docker + compose
2. 拉代码、复制 `.env`
3. `docker compose up -d --build` 让 setup 建库
4. 导入备份：`gunzip -c backup.sql.gz | docker compose exec -T db psql -U aihot aihot`
5. 配域名/Caddy 或 Tunnel
6. 改 `SITE_URL`，重启 web
7. 观察 24 小时，再关本地

## 9. 成本控制

- 模型：后台“设置 → 付费请求上限”设每日上限；先跑 3 天看实际消耗。
- 采集：信源越少越省；先 15–20 个，稳定后再加。
- 图片：限制 `IMGPROXY_UPSTREAM_GB_PER_DAY`。
- GitHub：有 token 足够；没有 token 每小时 60 次，Trending 每小时 2 次也能跑，但 metadata 要降频。
