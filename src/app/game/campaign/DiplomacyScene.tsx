"use client";

// Màn hội kiến cho nhiệm vụ ngoại giao (M06, M11–M13): bối cảnh hai bên, lời dẫn phát từng câu (DialoguePlayer),
// thẻ lựa chọn giọng điệu, lời đáp phát từng câu, rồi kết cục cố định (Quy phục/Liên minh) do server ghi. Lựa chọn chỉ đổi lời kể,
// không có thưởng riêng và không đổi kết cục. Mọi trạng thái hoàn thành lấy từ hồ sơ server; trình duyệt chỉ
// giữ bước đang xem (qua onMove của màn Chiến dịch).

import { useRef, useState } from "react";
import {
  campaignEventByNode,
  companionById,
  missionCopy,
  storyNodeById,
  type CampaignMissionId,
  type Profile,
} from "@/core";
import {
  completeCampaignEventOnline,
  fetchProfile,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import DialoguePlayer from "./DialoguePlayer";
import { MAIN_SPEAKER, speakerSide } from "./dialogue";
import { FACTION_STATUS_TEXT, SourceNotes, TONE_TEXT } from "./StoryBeats";

const OUTCOME_TEXT: Record<string, string> = {
  allianced: FACTION_STATUS_TEXT.allied,
  submitted: FACTION_STATUS_TEXT.submitted,
};

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c140f] focus-visible:outline-none";

export type DiplomacyPhase = "intro" | "choice";

export default function DiplomacyScene({
  profile,
  nodeId,
  phase,
  choice: viewChoice,
  onMove,
  onProfile,
}: {
  profile: Profile;
  nodeId: CampaignMissionId;
  phase: DiplomacyPhase;
  choice?: string;
  onMove: (phase: DiplomacyPhase, choice?: string) => void;
  onProfile: (p: Profile) => void;
}) {
  const node = storyNodeById(nodeId)!;
  const copy = missionCopy(nodeId)!;
  const event = campaignEventByNode(nodeId);
  const campaign = profile.campaign;
  const done = campaign.completed.includes(nodeId);
  const recorded = campaign.storyChoices[nodeId];
  const choice = done ? recorded : viewChoice;
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Giữ một eventId cho một lần trao lời: bấm lại sau lỗi mạng gửi cùng khóa, không tạo yêu cầu mới.
  const attempt = useRef<{ choice: string; eventId: string } | null>(null);
  const inFlight = useRef(false);

  const counterpartId =
    event?.faction?.faction ??
    event?.participants.find((p) => p !== "dinhBoLinh");
  const counterpart = counterpartId ? companionById(counterpartId) : undefined;
  const counterpartVoice = [
    ...copy.intro,
    ...copy.choices.flatMap((c) => c.beats),
  ]
    .map((b) => b.speaker)
    .find((s) => s && speakerSide(s) === "right");
  // Vùng theo về (Lữ Đường) không phải một cuộc quy phục trước mặt: con dấu ghi "Theo về".
  const outcome =
    event?.faction?.settlement === "regionalAccession"
      ? "Theo về"
      : event?.outcome
        ? OUTCOME_TEXT[event.outcome]
        : undefined;
  const picked = copy.choices.find((c) => c.id === choice);

  const submit = async () => {
    if (!choice || done || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    if (attempt.current?.choice !== choice)
      attempt.current = {
        choice,
        eventId: `${nodeId}-${crypto.randomUUID()}`,
      };
    const res = await completeCampaignEventOnline(
      nodeId,
      choice,
      attempt.current.eventId,
    );
    if (res.profile) onProfile(res.profile);
    if (res.error) {
      setMessage(ONLINE_ERROR_TEXT[res.error] ?? res.error);
      // Server từ chối (đã ghi ở thiết bị khác, chưa mở…): tải lại hồ sơ thật để màn hình khớp server.
      if (res.error !== "network") {
        const fresh = await fetchProfile();
        if (fresh.profile) onProfile(fresh.profile);
      }
    } else attempt.current = null;
    inFlight.current = false;
    setPending(false);
  };

  return (
    <section
      aria-labelledby={`diplomacy-${nodeId}`}
      className="flex flex-col gap-3"
    >
      <header className="rounded-lg border border-amber-500/30 bg-black/30 px-3 py-2">
        <p className="text-[11px] tracking-widest text-amber-300/90 uppercase">
          Hội kiến · {node.location.name}
          {node.location.modernRegion ? `, ${node.location.modernRegion}` : ""}
        </p>
        <h3
          id={`diplomacy-${nodeId}`}
          className="text-sm font-semibold text-amber-50"
        >
          {MAIN_SPEAKER} <span className="text-amber-300/70">⟷</span>{" "}
          {counterpart
            ? `${counterpartVoice ?? counterpart.name}${counterpartVoice && counterpartVoice !== counterpart.name ? ` (${counterpart.name})` : ""}`
            : node.title}
        </h3>
      </header>

      {outcome && (
        <p className="text-xs text-foreground-secondary">
          Không có trận, không có thanh máu. Kết cục đã cố định:{" "}
          <strong className="text-sky-200">{outcome}</strong>
          {counterpart ? ` (${counterpart.name})` : ""}. Lời đáp chỉ đổi cách
          kể; không có thưởng riêng theo lựa chọn. Server ghi kết quả vào thế
          cục sứ quân một lần.
        </p>
      )}

      {phase === "intro" ? (
        <DialoguePlayer
          key={`${nodeId}:intro`}
          missionId={nodeId}
          sequence="intro"
          label={`Hội kiến ${node.id}`}
          segments={[
            {
              section: "cinematic",
              beats: copy.cinematic ?? [],
              cinematic: true,
            },
            { section: "intro", beats: copy.intro },
          ]}
          main={profile}
          finishLabel={done ? "Xem kết cục" : "Vào hội kiến"}
          onFinished={() => onMove("choice", choice)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onMove("intro", done ? undefined : choice)}
          className={`min-h-11 self-start rounded-lg bg-white/10 px-4 text-sm hover:bg-white/15 ${FOCUS}`}
        >
          ↺ Xem lại hội kiến
        </button>
      )}
      <SourceNotes nodeId={nodeId} label="Xem chú thích sử liệu" />

      {phase === "choice" && (
        <div className="flex flex-col gap-2">
          <p
            id={`diplomacy-prompt-${nodeId}`}
            className="font-semibold text-amber-200"
          >
            {copy.prompt}
          </p>
          <div
            role="group"
            aria-labelledby={`diplomacy-prompt-${nodeId}`}
            className="grid gap-2 sm:grid-cols-2"
          >
            {copy.choices.map((c) => {
              const tone = event?.choices.find((x) => x.id === c.id)?.tone;
              const selected = choice === c.id;
              const preview = c.beats.find((b) => b.speaker) ?? c.beats[0];
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={done || pending}
                  onClick={() => onMove("choice", c.id)}
                  className={`flex min-h-14 flex-col gap-1 rounded-lg border-2 p-3 text-left transition ${FOCUS} ${
                    selected
                      ? "border-amber-300 bg-amber-500/20"
                      : "border-white/15 bg-black/35 hover:border-amber-400/60"
                  } disabled:cursor-not-allowed ${done && !selected ? "opacity-40" : ""}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-amber-50">
                      {c.label}
                    </span>
                    {tone && (
                      <span className="shrink-0 rounded border border-stone-400/50 px-1.5 py-0.5 text-[10px] text-stone-200 uppercase">
                        {TONE_TEXT[tone]}
                      </span>
                    )}
                  </span>
                  {preview && (
                    <span className="line-clamp-2 text-xs text-foreground-secondary">
                      {preview.text}
                    </span>
                  )}
                  {done && selected && (
                    <span className="text-xs text-emerald-300">
                      Lời đáp đã ghi trên server
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {picked && (
            <DialoguePlayer
              key={`${nodeId}:choice:${picked.id}`}
              missionId={nodeId}
              sequence={`choice:${picked.id}`}
              label={`Lời đáp: ${picked.label}`}
              segments={[
                { section: `choice:${picked.id}`, beats: picked.beats },
              ]}
              main={profile}
            />
          )}
          {!done && (
            <button
              type="button"
              disabled={!choice || pending}
              aria-busy={pending}
              onClick={() => void submit()}
              className={`min-h-12 self-start rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 font-bold text-amber-50 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              {pending ? "Đang ghi…" : choice ? "Trao lời" : "Chọn một lời đáp"}
            </button>
          )}
        </div>
      )}

      <div role="status" aria-live="polite" className="flex flex-col gap-2">
        {message && <p className="text-sm text-rose-300">{message}</p>}
        {done && phase === "choice" && (
          <div className="rounded-xl border-2 border-sky-400/50 bg-sky-950/40 p-3">
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="rounded border-2 border-sky-300 px-2 py-0.5 text-lg font-black tracking-widest text-sky-100 uppercase">
                {outcome ?? "Hoàn thành"}
              </span>
              {counterpart && (
                <span className="text-sm text-stone-200">
                  {counterpart.name} · ghi vào thế cục sứ quân một lần
                </span>
              )}
            </p>
            <div className="mt-2">
              <DialoguePlayer
                key={`${nodeId}:outro`}
                missionId={nodeId}
                sequence="outro"
                label={`Kết cục ${node.id}`}
                segments={[{ section: "outro", beats: copy.outro }]}
                main={profile}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
