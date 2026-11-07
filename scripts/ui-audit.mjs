// Kiểm kê responsive tự động (docs/reports/ui-audit-2026-11-07/README.md, bước 6).
//
//   node scripts/ui-audit.mjs [--base http://localhost:3000] [--register] [--shots <thư mục>] [--only menu,shop] [--widths 360,1280] [--detail]
//
// Đo từng màn ở 360/768/1280/1920px: tràn ngang và lỗi JS (thất bại, thoát mã 1), vùng chạm dưới 44px trên màn cảm ứng
// và chữ dưới 13px (cảnh báo). Cần Playwright + Chromium (không nằm trong dependencies của dự án):
//   pnpm dlx playwright install chromium   rồi chạy với NODE_PATH trỏ tới nơi cài, hoặc dùng bản đã cài sẵn trong môi trường.
// `--register` tự đăng ký một tài khoản tạm (chỉ dùng được trên bản dev dùng kho trong bộ nhớ) để vào các màn cần đăng nhập.
// Tài khoản thật: truyền qua biến môi trường AUDIT_USER và AUDIT_PASS, không bao giờ qua dòng lệnh hay file.

import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Thiếu Playwright. Cài: pnpm dlx playwright install chromium (hoặc đặt NODE_PATH tới bản đã có).");
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = opt("--base", "http://localhost:3000").replace(/\/$/, "");
const SHOTS = opt("--shots", "");
const ONLY = opt("--only", "").split(",").filter(Boolean);
const REGISTER = args.includes("--register");
const DETAIL = args.includes("--detail");
const WIDTHS = opt("--widths", "").split(",").filter(Boolean).map(Number);
// `--mock <file.json>`: chặn các lời gọi API ở trình duyệt và trả dữ liệu giả nhiều (hồ sơ đầy đủ tướng, kho 200 món,
// bảng xếp hạng 50 dòng…) để đo màn khi có nhiều dữ liệu. Tệp là JSON { profile, boards, destiny, ttk, arena, daily, honors }
// theo đúng hình dạng phản hồi của server; không đụng tới server hay cơ sở dữ liệu.
const MOCK = opt("--mock", "");

const ROUTES = [
  ["menu", ""], ["practice", "practice"], ["campaign", "campaign"], ["barracks", "profile"], ["shop", "shop"],
  ["quests", "quests"], ["leaderboard", "leaderboard"], ["daily", "daily"], ["survival", "survival"], ["arena", "arena"],
  ["trial", "trial"], ["destiny", "destiny"], ["formation", "formation"], ["tam-tuong-ky", "tam-tuong-ky"],
  ["expedition", "expedition"], ["clear-path", "clear-path"], ["account", "account"],
].filter(([name]) => ONLY.length === 0 || ONLY.includes(name));
const VIEWPORTS = [
  { w: 360, h: 800, touch: true }, { w: 768, h: 1024, touch: true }, { w: 1280, h: 800, touch: false }, { w: 1920, h: 1080, touch: false },
].filter((v) => WIDTHS.length === 0 || WIDTHS.includes(v.w));

/** Chạy trong trang: đo tràn ngang, vùng chạm nhỏ, chữ nhỏ. */
function measure() {
  const vw = window.innerWidth;
  const visible = (e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !e.closest("nextjs-portal,[hidden],[aria-hidden='true'],.sr-only");
  };
  const name = (e) => `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""} "${(e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24)}"`;
  const over = [];
  for (const e of document.querySelectorAll("body *")) {
    if (!visible(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.right <= vw + 1 || getComputedStyle(e).position === "fixed") continue;
    let p = e.parentElement;
    let clipped = false;
    while (p && p !== document.body) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= vw + 1) { clipped = true; break; }
      p = p.parentElement;
    }
    if (!clipped) over.push(name(e));
  }
  const taps = [];
  for (const e of document.querySelectorAll("button,a[href],[role=tab],[role=radio],[role=button],input:not([type=hidden]),select,summary")) {
    if (!visible(e) || e.classList.contains("ui-link") || e.closest("[role=grid]")) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 43.5 || r.height < 43.5) taps.push(`${name(e)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  const small = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || !visible(el) || el.closest("svg,script,style")) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12.9) small.push(`${name(el)} ${size}px`);
  }
  return { overflowX: document.documentElement.scrollWidth > vw + 1, over, taps, small, height: document.documentElement.scrollHeight };
}

const browser = await chromium.launch();
const rows = [];
let failed = false;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.touch, isMobile: vp.touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 100)));

  if (MOCK) {
    const bundle = JSON.parse(readFileSync(MOCK, "utf8"));
    const reply = (pattern, body) =>
      page.route(pattern, (route) => (route.request().method() === "GET" ? route.fulfill({ json: body() }) : route.continue()));
    await reply(/\/api\/profile(\?|$)/, () => ({ profile: bundle.profile }));
    await reply(/\/api\/leaderboard\?/, () => ({ board: "survival", season: "current", ...bundle.boards }));
    await reply(/\/api\/destiny\/leaderboard/, () => bundle.destiny);
    await reply(/\/api\/tam-tuong-ky\/board/, () => bundle.ttk);
    await reply(/\/api\/arena(\?|$)/, () => bundle.arena);
    await reply(/\/api\/daily(\?|$)/, () => bundle.daily);
    await reply(/\/api\/honors(\?|$)/, () => bundle.honors);
  }

  if (REGISTER || process.env.AUDIT_USER) {
    const user = process.env.AUDIT_USER ?? `audit${vp.w}${Math.random().toString(36).slice(2, 6)}`;
    const pass = process.env.AUDIT_PASS ?? `Audit-${Math.random().toString(36).slice(2, 10)}A1`;
    if (process.env.AUDIT_USER) {
      await page.goto(`${BASE}/game/login`, { waitUntil: "networkidle" });
      await page.fill("input[name=username]", user);
      await page.fill("input[name=password]", pass);
    } else {
      await page.goto(`${BASE}/game/register`, { waitUntil: "networkidle" });
      await page.fill("input[name=username]", user);
      await page.fill("input[name=password]", pass);
      await page.fill("input[name=confirm]", pass);
    }
    await Promise.all([page.waitForURL(/\/game(?!\/(login|register))/, { timeout: 15000 }).catch(() => {}), page.locator("form button[type=submit], form button").first().click()]);
  }

  for (const [name, route] of ROUTES) {
    errors.length = 0;
    try {
      await page.goto(`${BASE}/game/${route}`, { waitUntil: "networkidle", timeout: 40000 });
      await page.waitForTimeout(400);
      const m = await page.evaluate(measure);
      if (SHOTS) {
        mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: `${SHOTS}/${name}-${vp.w}.png`, fullPage: true });
      }
      const hard = m.overflowX || errors.length > 0;
      if (hard) failed = true;
      rows.push({ name, w: vp.w, h: m.height, over: m.overflowX ? m.over.length || 1 : 0, taps: vp.touch ? m.taps.length : "-", small: m.small.length, errs: errors.length, ex: m.overflowX ? m.over.slice(0, 2).join("; ") : "", detail: { taps: vp.touch ? m.taps : [], small: m.small } });
    } catch (e) {
      failed = true;
      rows.push({ name, w: vp.w, h: 0, over: "-", taps: "-", small: "-", errs: 1, ex: String(e).slice(0, 60) });
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`${"màn".padEnd(14)} ${"w".padStart(5)} ${"cao".padStart(6)} ${"tràn".padStart(5)} ${"chạm<44".padStart(8)} ${"chữ<13".padStart(7)} ${"lỗi".padStart(4)}`);
for (const r of rows) console.log(`${r.name.padEnd(14)} ${String(r.w).padStart(5)} ${String(r.h).padStart(6)} ${String(r.over).padStart(5)} ${String(r.taps).padStart(8)} ${String(r.small).padStart(7)} ${String(r.errs).padStart(4)} ${r.ex}`);
console.log(failed ? "\nTHẤT BẠI: có tràn ngang hoặc lỗi JS." : "\nĐạt: không tràn ngang, không lỗi JS.");
if (DETAIL) {
  for (const r of rows) {
    const uniq = (list) => [...new Set(list)].slice(0, 6);
    if (r.detail?.taps.length) console.log(`\n[${r.name} ${r.w}] vùng chạm <44px:\n  ${uniq(r.detail.taps).join("\n  ")}`);
    if (r.detail?.small.length) console.log(`\n[${r.name} ${r.w}] chữ <13px:\n  ${uniq(r.detail.small).join("\n  ")}`);
  }
}
process.exit(failed ? 1 : 0);
