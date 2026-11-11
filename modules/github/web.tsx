import { defineWebModule } from "@aihot/web/modules";
import { IconFlame, IconGrid } from "../../apps/web/app/components/icons.tsx";

/** 侧栏“探索”分组、手机底栏的两个入口。 */
export const githubWeb = defineWebModule({
  name: "github",
  home: () => import("./web/home.tsx"),
  sidebar: {
    section: "探索",
    items: [
      { to: "/repos", label: "仓库", icon: IconGrid },
      { to: "/trending", label: "星榜", icon: IconFlame },
    ],
  },
  tabs: [
    { key: "repos", to: "/repos", label: "仓库", icon: IconGrid },
    { key: "trending", to: "/trending", label: "星榜", icon: IconFlame },
  ],
});
