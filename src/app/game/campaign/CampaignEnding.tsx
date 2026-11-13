"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { useAudio } from "../audio/AudioProvider";


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
  const { playMusic } = useAudio();
  // Kết cục: nhạc riêng, trả nhạc bản đồ khi đóng.
  useEffect(() => {
    playMusic("ending", 1200);
    return () => playMusic("atlas", 1200);
  }, [playMusic]);
  const ledger = campaignWorldLedger(campaign.factions);
  const total = CAMPAIGN_CHAPTERS.reduce((n, c) => n + c.missions.length, 0);
  const sources = Object.entries(SOURCE_TITLE) as [
    HistoricalReferenceId,
    string,
  ][];
  return (
    <section
      aria-labelledby="campaign-ending-title"
      className="flex flex-col gap-3 rounded-xl border-2 border-frame-gold bg-gradient-to-b from-wood/80 to-wood-lo/50 p-4 text-sm"
    >
      <header>
        <p className="text-kicker text-frame-gold">
          Bình Loạn hoàn thành · {campaign.completed.length}/{total} nhiệm vụ
        </p>
        <h2
          id="campaign-ending-title"
          className="text-xl font-black text-title-on-wood"
        >
          Đại Cồ Việt, kinh đô Hoa Lư, năm 968
        </h2>
        <p className="text-on-wood-soft">
          Kết thúc đã lưu trên hồ sơ. Xem lại đại lễ vẫn được, nhưng không nhận
          thưởng lần nữa.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="font-semibold text-frame-gold">Biên niên Bình Loạn</h3>
          <ol className="mt-1 flex flex-col gap-1">
            {CAMPAIGN_CHAPTERS.map((c) => {
              const done = chapterStatus(campaign, c).filter(
                (m) => m.status === "completed",
              ).length;
              return (
                <li key={c.chapter} className="text-on-wood">
                  <span className="font-semibold text-on-wood">
                    Chương {ROMAN[c.chapter]} · {c.title}
                  </span>{" "}
                  <span className="text-caption text-on-wood-soft">
                    {done}/{c.missions.length}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <h3 className="font-semibold text-frame-gold">Sổ thế cục 12 vùng</h3>
          <p className="mt-1 text-on-wood">
            {ledger.resolved.alliance} liên minh · {ledger.resolved.submission}{" "}
            theo về · {ledger.resolved.military} đánh dẹp ·{" "}
            {ledger.resolved.uncertain} tan rã hoặc còn tranh luận
          </p>
          <h3 className="mt-2 font-semibold text-frame-gold">Tướng quân theo về</h3>
          <p className="mt-1 text-on-wood">
            {campaign.unlockedHeroes
              .map((id) => companionById(id)?.name ?? id)
              .join(", ") || "Chưa có"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-frame-gold">Mốc không thuộc lễ 968</h3>
        <ul className="mt-1 list-disc pl-5 text-on-wood-soft">
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

      <details className="rounded-md border border-info/30 bg-info/5 p-2">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-info">
          Nguồn và ghi công
        </summary>
        <ul className="mt-1 flex flex-col gap-0.5 text-caption text-on-wood-soft">
          {sources.map(([id, title]) => (
            <li key={id}>
              <span className="text-on-wood-soft/80">{id}</span> · {title}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-caption text-on-wood-soft">
          Cờ Lau, trò chơi nhỏ của ShanVerse. Lời kể là game sáng tác trên khung sử
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
