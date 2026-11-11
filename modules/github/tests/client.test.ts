// 仓库 URL 解析的边界：不用数据库，纯函数测试。
import assert from "node:assert/strict";
import { test } from "node:test";
import { extractRepoNames } from "../backend/client.ts";

test("普通仓库与带点仓库名", () => {
  assert.deepEqual(extractRepoNames("见 https://github.com/vercel/next.js 和 github.com/ollama/ollama"), ["vercel/next.js", "ollama/ollama"]);
});

test("文件路径只取仓库段，不把文件当仓库", () => {
  assert.deepEqual(extractRepoNames("https://github.com/owner/repo/blob/main/src/index.ts"), ["owner/repo"]);
});

test("GitHub 自己的页面段不是 owner", () => {
  const text = [
    "https://github.com/topics/react",
    "https://github.com/orgs/vercel/repositories",
    "https://github.com/marketplace/actions/x",
    "https://github.com/trending",
    "https://github.com/security/advisories",
  ].join("\n");
  assert.deepEqual(extractRepoNames(text), []);
});

test("子域与 www：developer.github.com 不收，www.github.com 收", () => {
  assert.deepEqual(extractRepoNames("developer.github.com/v3/repos 但 www.github.com/o/r 可以"), ["o/r"]);
});

test(".git 后缀与句尾点", () => {
  assert.deepEqual(extractRepoNames("clone github.com/o/r.git。详见 github.com/o2/r2."), ["o/r", "o2/r2"]);
});
