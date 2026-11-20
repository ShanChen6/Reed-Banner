// Quét chữ hiển thị (chuỗi có dấu tiếng Việt và mọi chữ JSX) trong src/app theo quy ước
// "Văn phong giao diện" ở docs/00-overview/thuat-ngu.md: chặn tên chế độ cũ, từ tiếng Anh,
// "Tianwu" trong trận, "nhé", "nhân vật kèm", "đăng nhập", "bảng xếp hạng", "phần thưởng", "túi đồ", "người chơi", "...". Chú thích và tên mã không bị quét.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

const ROOTS = ["src/app", "src/core/progress"];
/** Phạm vi rộng cho các luật về chữ: mọi chuỗi có dấu tiếng Việt trong app, core và server (cốt truyện, câu hỏi, tên lữ khách). */
const WIDE_ROOTS = ["src/app", "src/core", "src/server"];
const VIETNAMESE = /[À-ỹĐđ]/;

interface Text { readonly file: string; readonly line: number; readonly text: string }

function files(dir: string): string[] {
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
const WIDE = WIDE_ROOTS.flatMap(files).flatMap(texts);

interface Rule { readonly name: string; readonly pattern: RegExp; readonly allow?: (t: Text) => boolean; readonly wide?: boolean }

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
  // Shan 18/11/2026: bảng xếp hạng gọi là "công trạng", phần thưởng là "ban thưởng"; túi trang bị là "kho đồ".
  { name: "bảng xếp hạng", pattern: /bảng xếp hạng|(?<![\p{L}\d])BXH(?![\p{L}\d])/iu },
  { name: "phần thưởng", pattern: /phần thưởng/iu },
  { name: "túi đồ", pattern: /túi đồ/iu },
  { name: "người chơi", pattern: /người chơi/iu },
  { name: "ba dấu chấm", pattern: /\.\.\./ },
  // Rà soát 19/11/2026 (docs/00-overview/thuat-ngu.md mục Văn phong giao diện), quét cả core và server.
  // Kiểu dấu cũ ở vần mở oa, oe, uy cuối tiếng: hòa, hóa, khỏe, thủy, tùy (không hoà, hoá, khoẻ, thuỷ, tuỳ).
  { name: "kiểu dấu mới", pattern: /(?<![qQ])(?:[oO][àáảãạ]|[oO][èéẻẽẹ]|[uU][ỳýỷỹỵ])(?!\p{L})/u, wide: true },
  // Ngoặc kép thẳng trong mẫu HTML (thuộc tính) là mã, không phải chữ.
  { name: "ngoặc kép thẳng", pattern: /"[^"]+"/, wide: true, allow: (t) => t.text.includes("<") },
  { name: "chỉ số Công, Thủ viết thường", pattern: /(?:%|\d) ?(?:công|thủ)(?!\p{L})/u, wide: true },
  { name: "từ tiếng Anh (mở rộng)", pattern: /(?<![\p{L}\d])(?:EXP|XP|slot|active|level|item|combo)(?![\p{L}\d])/u, wide: true,
    allow: (t) => t.file.includes(join("core", "tower", "puzzleValidator")) },
  // Người chưa ghi danh là "lữ khách"; tên riêng có chữ Khách (Hàn Giang Khách, Thích khách) được giữ.
  { name: "khách (thay bằng lữ khách)", pattern: /(?<!\p{L}|[Ll]ữ |Giang |Thích )[Kk]hách(?! giang hồ)(?!\p{L})/u, wide: true },
  // Câu báo lỗi: điều xảy ra + việc nên làm, dùng "Xin…", không "hãy thử lại", không "Có lỗi xảy ra".
  // Shan 20/11/2026: phân cách bằng dấu phẩy hoặc gạch ngang "–", không dùng dấu chấm giữa "·".
  { name: "dấu chấm giữa phân cách", pattern: /·/u, wide: true },
  { name: "câu báo lỗi lệch giọng", pattern: /[,.] hãy thử lại\.|Có lỗi xảy ra|Mất kết nối tới máy chủ/u, wide: true },
];

describe("văn phong giao diện", () => {
  it("quét được chữ hiển thị", () => assert.ok(ALL.length > 1000));
  for (const rule of RULES) {
    it(`không có ${rule.name}`, () => {
      const hits = (rule.wide ? WIDE : ALL).filter((t) => rule.pattern.test(t.text) && !rule.allow?.(t));
      assert.deepEqual(hits.map((t) => `${t.file}:${t.line} ${t.text.slice(0, 80)}`), []);
    });
  }
});
