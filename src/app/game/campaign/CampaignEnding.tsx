"use client";
import { Button } from "@/components/ui";


// Kết chiến dịch (M24 "Đại Lễ Đăng Quang năm 968"): biên niên, sổ thế cục, người đồng hành, mốc không thuộc lễ 968
// và nguồn. Chỉ hiện khi server đã ghi M24; mọi số đọc từ hồ sơ, không có thưởng hay nút nhận ở đây.

import {
  CAMPAIGN_CHAPTERS,
  SOURCE_TITLE,
  campaignWorldLedger,
  chapterStatus,
  companionById,
  type CampaignProgressV2,
  type HistoricalReferenceId,
} from "@/core";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;

export default function CampaignEnding({
  campaign,
  onReplay,
}: {
  campaign: CampaignProgressV2;
  onReplay: () => void;
}) {
  const ledger = campaignWorldLedger(campaign.factions);
  const total = CAMPAIGN_CHAPTERS.reduce((n, c) => n + c.missions.length, 0);
  const sources = Object.entries(SOURCE_TITLE) as [
    HistoricalReferenceId,
    string,
  ][];
  return (
    <section
      aria-labelledby="campaign-ending-title"
      className="flex flex-col gap-3 rounded-xl border-2 border-[var(--gold)] bg-gradient-to-b from-[#3a2a1c]/80 to-black/40 p-4 text-sm"
    >
      <header>
        <p className="text-xs tracking-widest text-amber-300/80 uppercase">
          Chiến dịch hoàn thành · {campaign.completed.length}/{total} nhiệm vụ
        </p>
        <h2
          id="campaign-ending-title"
          className="text-xl font-black text-amber-100"
        >
          Đại Cồ Việt, kinh đô Hoa Lư, năm 968
        </h2>
        <p className="text-foreground-secondary">
          Kết thúc đã lưu trên hồ sơ. Xem lại đại lễ vẫn được, nhưng không nhận
          thưởng lần nữa.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="font-semibold text-amber-200">Biên niên chiến dịch</h3>
          <ol className="mt-1 flex flex-col gap-1">
            {CAMPAIGN_CHAPTERS.map((c) => {
              const done = chapterStatus(campaign, c).filter(
                (m) => m.status === "completed",
              ).length;
              return (
                <li key={c.chapter} className="text-stone-200">
                  <span className="font-semibold text-amber-50">
                    Chương {ROMAN[c.chapter]} · {c.title}
                  </span>{" "}
                  <span className="text-xs text-muted">
                    {done}/{c.missions.length}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <h3 className="font-semibold text-amber-200">Sổ thế cục 12 vùng</h3>
          <p className="mt-1 text-stone-200">
            {ledger.resolved.alliance} liên minh · {ledger.resolved.submission}{" "}
            theo về · {ledger.resolved.military} đánh dẹp ·{" "}
            {ledger.resolved.uncertain} tan rã hoặc còn tranh luận
          </p>
          <h3 className="mt-2 font-semibold text-amber-200">Người đồng hành</h3>
          <p className="mt-1 text-stone-200">
            {campaign.unlockedHeroes
              .map((id) => companionById(id)?.name ?? id)
              .join(", ") || "Chưa có"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-amber-200">Mốc không thuộc lễ 968</h3>
        <ul className="mt-1 list-disc pl-5 text-foreground-secondary">
          <li>
            970: niên hiệu Thái Bình bắt đầu (sử chép, E11). Không dùng trong
            cảnh năm 968.
          </li>
          <li>
            Khoảng 971: một số tổng thuật kể việc đặt quan chức triều Đinh. Mốc
            này chưa có trong sổ nguồn của game, chỉ ghi để phân biệt.
          </li>
        </ul>
      </div>

      <details className="rounded-md border border-sky-400/30 bg-sky-500/5 p-2">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-sky-200">
          Nguồn và ghi công
        </summary>
        <ul className="mt-1 flex flex-col gap-0.5 text-xs text-foreground-secondary">
          {sources.map(([id, title]) => (
            <li key={id}>
              <span className="text-stone-500">{id}</span> · {title}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Cờ Lau, mini game của ShanVerse. Lời kể là game sáng tác trên khung sử
          liệu; nhãn ở từng đoạn (sử chép, game tái dựng, hư cấu, truyền thuyết,
          còn tranh luận) cho biết đoạn đó thuộc loại nào.
        </p>
      </details>

      <Button variant="primary"
        type="button"
        onClick={onReplay}
        className="self-start"
      >
        Xem lại đại lễ
      </Button>
    </section>
  );
}
