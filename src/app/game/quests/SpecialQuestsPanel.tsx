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
import { Card } from "@/components/ui";
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
    <Card className="mb-4 flex flex-col gap-3">
      <div>
        <h2 className="font-bold text-amber-200">Nhiệm vụ phụ: nhân vật đặc biệt</h2>
        <p className="text-xs text-muted">Làm đủ ba bước để nhân vật gia nhập đội ở cấp 1. Không bán ở cửa hàng.</p>
      </div>
      {message && <p className="text-sm text-rose-400">{message}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {SPECIAL_QUESTS.map((def) => {
          const base = companionById(def.id)!;
          const open = specialQuestOpen(profile, def.id);
          const q = specialQuestProgress(profile, def.id);
          return (
            <section key={def.id} className="flex gap-3 rounded-lg bg-black/30 p-3 text-sm" aria-label={def.title}>
              <Portrait
                id={def.id}
                element={base.element}
                profession={base.profession}
                className={`size-16 shrink-0 ${open ? "" : "opacity-40 grayscale"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-100">
                  {open ? base.name : "???"} · {def.title}
                </p>
                {!open ? (
                  <p className="mt-1 text-xs text-muted">Qua hết Chương {ROMAN[def.chapter]} Bình Loạn để mở.</p>
                ) : q.step === 3 ? (
                  <p className="mt-1 text-xs text-emerald-300">Đã gia nhập đội.</p>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-foreground-secondary">{def.intro}</p>
                    <ol className="mt-2 flex flex-col gap-1 text-xs">
                      {def.steps.map((text, i) => {
                        const done = q.step > i;
                        const current = q.step === i;
                        return (
                          <li
                            key={i}
                            className={done ? "text-emerald-300" : current ? "text-amber-100" : "text-stone-500"}
                          >
                            {done ? "✓" : `${i + 1}.`} {text}
                            {current && i === 0 && (
                              <span className="ml-1 tabular-nums text-amber-300">({q.wins}/{SPECIAL_DIVERSE_WINS})</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    {q.step === 2 && (
                      <div className="mt-2 flex flex-col gap-2">
                        <p className="text-xs italic text-amber-100">{base.name}: “{def.lines.before}”</p>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void start(def)}
                          className="self-start rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-950 disabled:opacity-50"
                        >
                          Vào trận (3vs3, Khó)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
