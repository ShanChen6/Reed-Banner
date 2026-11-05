"use client";

// Nhiệm vụ phụ mở nhân vật đặc biệt (Đinh Ngọc, Trần Vũ Phong): hiện sau khi qua chương Chiến dịch, ba bước nối
// tiếp. Server đếm tiến độ khi trận kết thúc; bước 3 mở trận 3vs3 với chính nhân vật.

import { useState } from "react";
import {
  companionById,
  SPECIAL_DIVERSE_WINS,
  SPECIAL_FINAL_DIFFICULTY,
  SPECIAL_QUESTS,
  specialQuestOpen,
  specialQuestProgress,
  type Profile,
  type SpecialQuestDef,
} from "@/core";
import { Alert, Button } from "@/components/ui";
import { FrameInset, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Portrait } from "../art/portraits";
import { createOnline, ONLINE_BATTLE_KEY, ONLINE_ERROR_TEXT } from "../battle/online";
import { useScene } from "../SceneContext";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];

export default function SpecialQuestsPanel({ profile }: { profile: Profile }) {
  const { go } = useScene();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const start = async (def: SpecialQuestDef) => {
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: profile.element,
      profession: profile.profession,
      companions: profile.team,
      difficulty: SPECIAL_FINAL_DIFFICULTY,
      specialQuest: def.id,
    });
    if (!res.id) {
      setBusy(false);
      setMessage(ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận");
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì vẫn vào trận; tải lại trang thì bấm Tiếp tục ở màn trận.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description="Làm đủ ba bước để nhân vật gia nhập đội ở cấp 1. Không bán ở cửa hàng.">
        Nhiệm vụ phụ: nhân vật đặc biệt
      </SectionTitle>
      {message && <Alert>{message}</Alert>}
      <div className="grid gap-3 md:grid-cols-2">
        {SPECIAL_QUESTS.map((def) => {
          const base = companionById(def.id)!;
          const open = specialQuestOpen(profile, def.id);
          const q = specialQuestProgress(profile, def.id);
          return (
            <FrameInset key={def.id} role="group" className="flex gap-3 text-sm" aria-label={def.title}>
              <Portrait
                id={def.id}
                element={base.element}
                profession={base.profession}
                className={`size-16 shrink-0 ${open ? "" : "opacity-40 grayscale"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-title-on-wood">
                  {open ? base.name : "???"} · {def.title}
                </p>
                {!open ? (
                  <p className="mt-1 text-caption text-on-wood-soft">Qua hết Chương {ROMAN[def.chapter]} Bình Loạn để mở.</p>
                ) : q.step === 3 ? (
                  <p className="mt-1 text-caption text-jade">Đã gia nhập đội.</p>
                ) : (
                  <>
                    <p className="mt-1 text-caption text-on-wood-soft">{def.intro}</p>
                    <ol className="mt-2 flex flex-col gap-1 text-caption">
                      {def.steps.map((text, i) => {
                        const done = q.step > i;
                        const current = q.step === i;
                        return (
                          <li
                            key={i}
                            className={done ? "text-jade" : current ? "text-title-on-wood" : "text-ash"}
                          >
                            {done ? "✓" : `${i + 1}.`} {text}
                            {current && i === 0 && (
                              <span className="ml-1 tabular-nums text-frame-gold">({q.wins}/{SPECIAL_DIVERSE_WINS})</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    {q.step === 2 && (
                      <div className="mt-2 flex flex-col gap-2">
                        <p className="text-caption italic text-title-on-wood">{base.name}: “{def.lines.before}”</p>
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => void start(def)} className="self-start">
                          Vào trận (3vs3, Khó)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </FrameInset>
          );
        })}
      </div>
    </OrnateFrame>
  );
}
