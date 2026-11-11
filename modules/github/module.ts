import { defineModule } from "@aihot/contracts/modules";

/**
 * 星潮的仓库层：仓库档案（/repos）、单仓页（/repos/:owner/:name）、星榜（/trending）。
 * 页面文件在 web/pages/ 下；后端在 server.ts，数据与采集在 backend/。
 */
export const githubModule = defineModule({
  name: "github",
  pages: [
    { path: "repos", file: "web/pages/repos.tsx", id: "repos" },
    { path: "repos/:owner/:name", file: "web/pages/repo.tsx", id: "repo" },
    { path: "trending", file: "web/pages/trending.tsx", id: "trending" },
  ],
  apiPaths: [/^\/api\/site\/repos(?:\/|$)/, /^\/api\/site\/trending(?:\/|$)/],
});
