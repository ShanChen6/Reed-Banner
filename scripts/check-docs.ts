/**
 * Kiểm tra tài liệu (DOC-03): link tương đối, anchor, một tiêu đề `#`, nhãn trạng thái,
 * docs/MOVED.md và đường dẫn docs/*.md nhắc trong code. Quy định: docs/00-overview/quy-dinh-tai-lieu.md.
 * Chạy: pnpm docs:check
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const STATUSES = ["DRAFT", "APPROVED", "FROZEN", "IMPLEMENTED", "DEFERRED", "SUPERSEDED", "ARCHIVED", "AUDIT"] as const;

export interface Issue {
  file: string;
  line: number;
  message: string;
}

/** Anchor kiểu GitHub: chữ thường, bỏ dấu câu (giữ chữ có dấu tiếng Việt), khoảng trắng thành `-`. */
export function slugify(heading: string): string {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

/** Các dòng ngoài khối code ```; trả về [số dòng, nội dung]. */
function proseLines(text: string): [number, string][] {
  const out: [number, string][] = [];
  let inCode = false;
  text.split("\n").forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inCode = !inCode;
      return;
    }
    if (!inCode) out.push([i + 1, line]);
  });
  return out;
}

export function collectAnchors(text: string): Set<string> {
  const anchors = new Set<string>();
  const seen = new Map<string, number>();
  for (const [, line] of proseLines(text)) {
    for (const m of line.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) anchors.add(m[1]!.toLowerCase());
    const h = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!h) continue;
    const base = slugify(h[1]!);
    const n = seen.get(base);
    seen.set(base, n === undefined ? 0 : n + 1);
    anchors.add(n === undefined ? base : `${base}-${n + 1}`);
  }
  return anchors;
}

export function extractLinks(text: string): { line: number; url: string }[] {
  const links: { line: number; url: string }[] = [];
  for (const [line, content] of proseLines(text)) {
    const noCode = content.replace(/`[^`]*`/g, "");
    for (const m of noCode.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)) {
      const url = m[1]!;
      if (!/^(https?:|mailto:)/.test(url)) links.push({ line, url });
    }
  }
  return links;
}

export function checkDocs(root: string): Issue[] {
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const read = (f: string) => readFileSync(path.join(root, f), "utf8");
  const exists = (f: string) => existsSync(path.join(root, f));
  const issues: Issue[] = [];
  const anchorCache = new Map<string, Set<string>>();
  const anchorsOf = (f: string) => {
    if (!anchorCache.has(f)) anchorCache.set(f, collectAnchors(read(f)));
    return anchorCache.get(f)!;
  };

  const docs = git("ls-files", "*.md").filter((f) => exists(f));
  for (const file of docs) {
    const text = read(file);
    for (const { line, url } of extractLinks(text)) {
      const [rawPath, anchor] = url.split("#");
      const target = rawPath ? path.normalize(path.join(path.dirname(file), decodeURIComponent(rawPath))) : file;
      if (rawPath && !exists(target)) {
        issues.push({ file, line, message: `link tới file không tồn tại: ${url}` });
        continue;
      }
      if (anchor && target.endsWith(".md") && !statSync(path.join(root, target)).isDirectory() && !anchorsOf(target).has(decodeURIComponent(anchor).toLowerCase())) {
        issues.push({ file, line, message: `anchor không tồn tại: ${url}` });
      }
    }
    if (!file.startsWith("docs/")) continue;
    const h1 = proseLines(text).filter(([, l]) => /^# /.test(l));
    if (h1.length !== 1) issues.push({ file, line: h1[1]?.[0] ?? 1, message: `cần đúng một tiêu đề "#", đang có ${h1.length}` });
    for (const [line, content] of proseLines(text)) {
      const s = content.match(/^>\s*Trạng thái:\s*\*\*([^*]+)\*\*/);
      if (!s) continue;
      const word = s[1]!.trim().split(/[\s/—-]/)[0] ?? "";
      if (!(STATUSES as readonly string[]).includes(word)) {
        issues.push({ file, line, message: `trạng thái "${word}" không thuộc ${STATUSES.join(", ")}` });
      }
    }
  }

  if (exists("docs/MOVED.md")) {
    for (const [line, content] of proseLines(read("docs/MOVED.md"))) {
      const m = content.match(/^\| `(docs\/[^`]+)` \| \[`(docs\/[^`]+)`\]/);
      if (!m) continue;
      const [, oldPath, newPath] = m as unknown as [string, string, string];
      if (exists(oldPath)) issues.push({ file: "docs/MOVED.md", line, message: `đường dẫn cũ vẫn còn file: ${oldPath}` });
      if (!exists(newPath)) issues.push({ file: "docs/MOVED.md", line, message: `đường dẫn mới không tồn tại: ${newPath}` });
    }
  }

  const code = git("ls-files", "src", "scripts", "tests", "*.mjs", "*.ts").filter((f) => /\.(ts|tsx|mjs|cjs|js)$/.test(f) && exists(f));
  for (const file of new Set(code)) {
    read(file)
      .split("\n")
      .forEach((content, i) => {
        for (const m of content.matchAll(/\bdocs\/[\w./-]+?\.md\b/g)) {
          if (!exists(m[0])) issues.push({ file, line: i + 1, message: `nhắc tới tài liệu không tồn tại: ${m[0]} (tra docs/MOVED.md)` });
        }
      });
  }
  return issues;
}

if (process.argv[1]?.endsWith("check-docs.ts")) {
  const issues = checkDocs(process.cwd());
  for (const i of issues) console.error(`${i.file}:${i.line}  ${i.message}`);
  if (issues.length) {
    console.error(`\n${issues.length} lỗi tài liệu. Quy định: docs/00-overview/quy-dinh-tai-lieu.md`);
    process.exit(1);
  }
  console.log("Tài liệu hợp lệ: link, anchor, tiêu đề, trạng thái, MOVED.md và đường dẫn trong code.");
}
