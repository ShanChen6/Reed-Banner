// Quét chữ hiển thị (chuỗi có dấu tiếng Việt và mọi chữ JSX) trong src/app theo quy ước
// "Văn phong giao diện" ở docs/00-overview/thuat-ngu.md: chặn tên chế độ cũ, từ tiếng Anh,
// "Tianwu" trong trận, "nhé", "nhân vật kèm", "đăng nhập". Chú thích và tên mã không bị quét.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

const ROOTS = ["src/app", "src/core/progress"];
/** Trang xem thử nội bộ, không phải giao diện người chơi. */
const SKIP_DIRS = ["src/app/demo"];
const VIETNAMESE = /[À-ỹĐđ]/;

interface Text { readonly file: string; readonly line: number; readonly text: string }

function files(dir: string): string[] {
  if (SKIP_DIRS.includes(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

function texts(file: string): Text[] {
  const src = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: Text[] = [];
  const push = (node: ts.Node, text: string, always = false) => {
    if (always ? /\p{L}/u.test(text) : VIETNAMESE.test(text)) out.push({ file, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, text });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) push(node, node.text);
    else if (ts.isTemplateExpression(node)) push(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" "));
    else if (ts.isJsxText(node)) push(node, node.text.replace(/\s+/g, " "), true);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

const ALL = ROOTS.flatMap(files).flatMap(texts);

interface Rule { readonly name: string; readonly pattern: RegExp; readonly allow?: (t: Text) => boolean }

const RULES: readonly Rule[] = [
  { name: "tên chế độ cũ", pattern: /chiến dịch|thử thách ngày|đấu trường|(?<!\p{L})sinh tồn(?!\p{L})|Song Tháp|Tháp Vận Mệnh/iu,
    // "Sinh tồn" là nhãn thể loại (kicker) cố định của thẻ Trấn Ải.
    allow: (t) => t.text === "Sinh tồn" },
  { name: "từ tiếng Anh", pattern: /(?<![\p{L}\d])(server|online|offline|buffs?|debuffs?|boss|build|preview|match-3|click|mini game)(?![\p{L}\d])/iu },
  { name: "HP/ATK/DEF", pattern: /(?<![\p{L}\d])(HP|ATK|DEF)(?![\p{L}\d])/u },
  // "Tab" viết hoa là tên phím; "tab" thường là thẻ trình duyệt.
  { name: "tab", pattern: /(?<![\p{L}\d])tab(?![\p{L}\d])/u },
  { name: "Tianwu trong trận", pattern: /Tianwu/,
    allow: (t) => t.file === join("src/app/page.tsx") || t.file.startsWith(join("src/app/home")) },
  { name: "nhé", pattern: /(?<!\p{L})nhé(?!\p{L})/u },
  { name: "nhân vật kèm", pattern: /nhân vật kèm/iu },
  // Đăng nhập gọi là "trình danh"; chỉ giữ từ cũ trong ngoặc của nhãn "Danh hiệu (tên đăng nhập)".
  { name: "đăng nhập", pattern: /(?<!tên )đăng nhập/iu },
];

describe("văn phong giao diện", () => {
  it("quét được chữ hiển thị", () => assert.ok(ALL.length > 1000));
  for (const rule of RULES) {
    it(`không có ${rule.name}`, () => {
      const hits = ALL.filter((t) => rule.pattern.test(t.text) && !rule.allow?.(t));
      assert.deepEqual(hits.map((t) => `${t.file}:${t.line} ${t.text.slice(0, 80)}`), []);
    });
  }
});
