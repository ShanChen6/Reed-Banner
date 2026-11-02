// Tải sẵn chân dung các quân có thể xuất hiện trong một ván.
//
// Chân dung là ảnh WebP (khoảng 16 KB mỗi ảnh) nạp trong thẻ SVG <image>: trình duyệt chỉ tải khi quân xuất hiện lần đầu, nên ô nền
// và huy hiệu hiện ngay còn gương mặt trễ 1–2 giây (nhất là ở mạng chậm hoặc ảnh chưa có trong cache). Nạp trước mọi người đại diện
// của các cặp nghề–hệ trong bộ luật khi vào màn chơi thì quân sau đó hiện đủ ngay.

import { CATALOG, type Ruleset } from "@/core/binh-phap";
import { portraitUrl } from "../art/portrait-data";

const started = new Set<string>();

/** Địa chỉ ảnh chân dung của mọi quân có thể ra trong bộ luật này. */
export function portraitUrlsFor(rules: Pick<Ruleset, "professions" | "elements" | "fusions">): string[] {
  const ids = new Set<string>();
  for (const e of CATALOG) if (rules.professions.includes(e.profession) && rules.elements.includes(e.element)) ids.add(e.characterId);
  for (const f of rules.fusions) ids.add(f.characterId);
  return [...ids].flatMap((id) => portraitUrl(id) ?? []);
}

/** Bắt đầu tải (và giải mã) ảnh; mỗi địa chỉ chỉ tải một lần trong phiên. An toàn khi chạy ở server (không làm gì). */
export function preloadPortraits(rules: Pick<Ruleset, "professions" | "elements" | "fusions">): void {
  if (typeof Image === "undefined") return;
  for (const url of portraitUrlsFor(rules)) {
    if (started.has(url)) continue;
    started.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    void img.decode?.().catch(() => undefined);
  }
}
