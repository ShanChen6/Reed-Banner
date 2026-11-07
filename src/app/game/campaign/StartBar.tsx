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

export default function StartBar({ target, onOpen }: { target: StartTarget; onOpen: (id: StartTarget["id"]) => void }) {
  const c = COPY[target.kind];
  return (
    <section
      aria-label={c.kicker}
      className="flex flex-col gap-3 rounded-xl border-2 border-frame-gold bg-wood-inset px-4 py-3 shadow-[0_0_24px_-8px_var(--frame-gold-hi)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-kicker text-frame-gold-hi">{c.kicker}</p>
        <h2 className="truncate font-serif text-xl font-bold text-title-on-wood sm:text-2xl">{target.title}</h2>
        <p className="text-caption text-on-wood-soft">
          Chương {ROMAN[target.chapter]} · {target.chapterTitle} · {target.place}
        </p>
      </div>
      <Button size="lg" onClick={() => onOpen(target.id)} className="min-h-12 w-full shrink-0 whitespace-nowrap sm:w-auto sm:px-8">
        {c.button} ›
      </Button>
    </section>
  );
}
