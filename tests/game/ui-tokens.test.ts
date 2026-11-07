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

// Quy tắc cỡ chữ (theme.md): chữ đọc và điều khiển ≥ 13px (`text-caption`). Ngoại lệ duy nhất là chữ phủ lên biểu tượng
// (huy hiệu `absolute` trên icon) tối thiểu 11px.
const SMALL = /(?<![\w-])(?:[a-z-]+:)*(?:text-xs|text-\[(?:9|10|12)px\]|text-\[0\.[0-7]\d*rem\])(?![\w-])/g;
const OVERLAY_ONLY = /(?<![\w-])(?:[a-z-]+:)*text-\[11px\](?![\w-])/g;
const OVERLAY_FILES = new Set(["src/app/game/art/passives.tsx"]);

test("chữ trong màn game không nhỏ hơn 13px, trừ huy hiệu phủ lên biểu tượng", () => {
  const found: string[] = [];
  for (const file of ROOTS.flatMap(files)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(SMALL)) found.push(`${file}:${i + 1} ${m[0]}`);
        if (!line.includes("absolute") && !OVERLAY_FILES.has(file)) for (const m of line.matchAll(OVERLAY_ONLY)) found.push(`${file}:${i + 1} ${m[0]}`);
      });
  }
  assert.deepEqual(found, [], `Dùng text-caption (13px) thay cho chữ nhỏ:\n${found.join("\n")}`);
});

// CSS cũng không viết #hex: mọi màu là token trong src/styles/theme.css (và color.css); màu độ trong suốt dùng
// color-mix(in srgb, var(--token) N%, transparent). Hai tệp token là nơi duy nhất được khai mã màu.
const CSS_TOKEN_FILES = new Set(["src/styles/theme.css", "src/styles/color.css"]);

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? cssFiles(path) : path.endsWith(".css") ? [path] : [];
  });
}

test("CSS không viết mã #hex ngoài tệp token", () => {
  const found: string[] = [];
  for (const file of cssFiles("src")) {
    if (CSS_TOKEN_FILES.has(file)) continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) found.push(`${file}:${i + 1} ${m[0]}`);
      });
  }
  assert.deepEqual(found, [], `Dùng token (theme.css) thay cho mã hex:\n${found.join("\n")}`);
});
