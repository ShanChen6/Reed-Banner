"use client";

// Thanh "Bắt đầu / Tiếp tục" ở đầu tab Bản đồ: chỉ đúng một việc nên làm tiếp, nút to nổi bật (Shan yêu cầu 07/11/2026: người mới
// không phải đoán phải bấm tab Nhiệm vụ hay chọn cứ điểm). Logic chọn nhiệm vụ ở startMission.ts.

import { Button } from "@/components/ui";
import type { StartTarget } from "./startMission";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;

const COPY = {
  start: { kicker: "Hành trình khởi đầu", button: "Bắt đầu nhiệm vụ" },
  resume: { kicker: "Nhiệm vụ đang dở", button: "Tiếp tục nhiệm vụ" },
  next: { kicker: "Nhiệm vụ kế tiếp", button: "Vào nhiệm vụ" },
} as const;

/** Bốn bước cho người mới, giọng hào sảng như phần còn lại của Chiến trường. */
const GUIDE = [
  [
    "Nghe chuyện, chọn lời",
    "Mỗi nhiệm vụ mở bằng một đoạn kể. Chọn lời đáp theo ý bạn; lời đáp đổi cách kể, kết cục không đổi.",
  ],
  [
    "Chọn người ra trận",
    "Trước trận, chọn hai tướng đi cùng, đặt nghề và hệ cho Đinh Bộ Lĩnh (đổi là lưu luôn), nhớ mang đủ lương.",
  ],
  [
    "Thắng trận, mở đường",
    "Thắng trận là mở đường tới nhiệm vụ kế tiếp trên bản đồ. Thua thì chỉnh lại đội hình rồi đánh lại.",
  ],
  [
    "Gặp sứ quân, tái đấu",
    "Mở được sứ quân nào thì thẻ Tái đấu cho bạn thử sức lại với sứ quân ấy, ở nhiều bậc khó khác nhau.",
  ],
] as const;

function Guide() {
  return (
    <details className="atlas-callout group px-4 py-2 text-caption">
      <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 font-semibold text-on-wood focus-visible:outline-2 focus-visible:outline-frame-gold-hi pointer-coarse:min-h-11">
        <span>Lần đầu ra trận? Xem cách chơi</span>
        <span aria-hidden className="transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <ol className="mt-2 grid gap-2 pb-1 sm:grid-cols-2">
        {GUIDE.map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-frame-gold font-serif font-bold text-frame-gold-hi"
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold text-on-wood">{title}</span>
              {body}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export default function StartBar({
  target,
  onOpen,
}: {
  target: StartTarget;
  onOpen: (id: StartTarget["id"]) => void;
}) {
  const c = COPY[target.kind];
  return (
    <div className="flex flex-col gap-2">
      <section
        aria-label={c.kicker}
        className="atlas-callout atlas-callout-primary flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-kicker text-frame-gold-hi">{c.kicker}</p>
          <h2 className="truncate font-serif text-xl font-bold text-title-on-wood sm:text-2xl">
            {target.title}
          </h2>
          <p className="text-caption text-on-wood-soft">
            Chương {ROMAN[target.chapter]} · {target.chapterTitle} ·{" "}
            {target.place}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => onOpen(target.id)}
          className="min-h-12 w-full shrink-0 whitespace-nowrap sm:w-auto sm:px-8"
        >
          {c.button} ›
        </Button>
      </section>
      {target.kind === "start" && <Guide />}
    </div>
  );
}
