import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// Khóa quy tắc "không thêm màu viết tay" (docs/05-ui-ux/design-system/theme.md): màn game và component dùng token
// (bg-wood-*, text-on-wood, bg-danger-surface, bg-stat-hp...), không dùng bảng màu Tailwind thô hay #hex trong className.
// Ngoại lệ có chủ đích: nút đăng nhập Google/GitHub theo nhận diện thương hiệu.

const ROOTS = ["src/app/game", "src/components"];
const ALLOW = new Set(["src/app/game/auth/AuthLinks.tsx"]);
const PALETTE = "amber|stone|rose|sky|teal|emerald|slate|zinc|neutral|gray|red|blue|green|yellow|orange|violet|purple|cyan|indigo|pink|lime|fuchsia";
const RAW = new RegExp(
  `(?<![\\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|via|outline|shadow|fill|stroke)-(?:(?:${PALETTE})-\\d{2,3}|\\[#[0-9a-fA-F]{3,8}\\])`,
  "g",
);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith(".tsx") ? [path] : [];
  });
}

test("màn game và component không dùng màu Tailwind thô hoặc #hex trong className", () => {
  const found: string[] = [];
  for (const file of ROOTS.flatMap(files)) {
    if (ALLOW.has(file)) continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(RAW)) found.push(`${file}:${i + 1} ${m[0]}`);
      });
  }
  assert.deepEqual(found, [], `Dùng token thay cho màu thô:\n${found.join("\n")}`);
});
