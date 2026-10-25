"use client";

// Màn hội kiến cho nhiệm vụ ngoại giao (M06, M11–M13): bối cảnh + chân dung hai bên, lời dẫn dạng đối thoại,
// thẻ lựa chọn giọng điệu, rồi kết cục cố định (Quy phục/Liên minh) do server ghi. Lựa chọn chỉ đổi lời kể,
// không có thưởng riêng và không đổi kết cục. Mọi trạng thái hoàn thành lấy từ hồ sơ server; trình duyệt chỉ
// giữ bước đang xem (qua onMove của màn Chiến dịch).

import { useRef, useState } from "react";
import {
  CAMPAIGN_RECRUITS,
  campaignEventByNode,
  companionById,
  missionCopy,
  storyNodeById,
  type CampaignMissionId,
  type Profile,
  type StoryBeat,
} from "@/core";
import { Portrait } from "../art/portraits";
import {
  completeCampaignEventOnline,
  fetchProfile,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import {
  BasisBadge,
  Beats,
  FACTION_STATUS_TEXT,
  SourceNotes,
  TONE_TEXT,
} from "./StoryBeats";

const MAIN_SPEAKER = "Đinh Bộ Lĩnh";
/** Người phía Hoa Lư: tướng đồng hành và sứ giả của ta đứng bên trái, không bị coi là phía bên kia. */
const OUR_SIDE = new Set<string>([
  MAIN_SPEAKER,
  "Sứ giả Hoa Lư",
  ...CAMPAIGN_RECRUITS.map((r) => r.name),
]);

const OUTCOME_TEXT: Record<string, string> = {
  allianced: FACTION_STATUS_TEXT.allied,
  submitted: FACTION_STATUS_TEXT.submitted,
};

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c140f] focus-visible:outline-none";

export type DiplomacyPhase = "intro" | "choice";

/** Đối thoại: thoại Đinh Bộ Lĩnh bên trái, thoại phía bên kia bên phải, lời dẫn ở giữa. */
function Dialogue({ beats }: { beats: readonly StoryBeat[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {beats.map((b, i) => {
        if (!b.speaker)
          return (
            <li key={i} className="rounded-md bg-black/30 p-2 text-sm">
              <BasisBadge basis={b.basis} />
              <p className="mt-1 text-stone-200 italic">{b.text}</p>
              {b.refs && b.refs.length > 0 && (
                <p className="mt-1 text-[11px] text-stone-400">
                  Nguồn: {b.refs.join(", ")}
                </p>
              )}
            </li>
          );
        const ours = !!b.speaker && OUR_SIDE.has(b.speaker);
        return (
          <li
            key={i}
            className={`max-w-[92%] rounded-lg border p-2 text-sm ${
              ours
                ? "self-start border-amber-500/40 bg-amber-900/30"
                : "self-end border-sky-400/30 bg-sky-950/40"
            }`}
          >
            <p className="text-xs font-semibold text-amber-300">
              {b.speaker}{" "}
              <span className="font-normal text-stone-400">
                · thoại hư cấu, không phải trích dẫn sử
              </span>
            </p>
            <p className="mt-0.5 text-amber-50">“{b.text}”</p>
          </li>
        );
      })}
    </ul>
  );
}

function Speaker({
  name,
  title,
  children,
  align,
}: {
  name: string;
  title: string;
  children: React.ReactNode;
  align: "left" | "right";
}) {
  return (
    <figure
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      {children}
      <figcaption>
        <p className="text-sm font-bold text-amber-50">{name}</p>
        <p className="text-xs text-stone-300">{title}</p>
      </figcaption>
    </figure>
  );
}

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
    .find((s) => s && !OUR_SIDE.has(s));
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
      <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-[radial-gradient(ellipse_at_top,#5b3a22_0%,#2a1b12_55%,#140d09_100%)] p-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15 [background-image:repeating-radial-gradient(circle_at_50%_120%,#e8c37a_0_1px,transparent_1px_14px)]"
        />
        <p className="relative text-[11px] tracking-widest text-amber-300/90 uppercase">
          Hội kiến · {node.location.name}
          {node.location.modernRegion ? `, ${node.location.modernRegion}` : ""}
        </p>
        <h3 id={`diplomacy-${nodeId}`} className="sr-only">
          {node.title}
        </h3>
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <Speaker name={MAIN_SPEAKER} title="Hoa Lư" align="left">
            <Portrait
              id="dinhBoLinh"
              element={profile.element}
              profession={profile.profession}
              className="size-14 shrink-0 sm:size-16"
            />
          </Speaker>
          <span aria-hidden className="text-xl text-amber-300/70">
            ⟷
          </span>
          {counterpart && (
            <Speaker
              name={counterpartVoice ?? counterpart.name}
              title={counterpart.name}
              align="right"
            >
              <Portrait
                id={counterpart.id}
                element={counterpart.element}
                profession={counterpart.profession}
                className="size-14 shrink-0 sm:size-16"
              />
            </Speaker>
          )}
        </div>
        {copy.cinematic?.map((b, i) => (
          <p
            key={i}
            className="relative mt-3 font-serif text-sm text-amber-50/90 italic"
          >
            <span className="mr-1 text-[10px] not-italic tracking-widest text-amber-300/70 uppercase">
              Cảnh dựng ·
            </span>
            {b.text}
          </p>
        ))}
      </div>

      {outcome && (
        <p className="text-xs text-stone-300">
          Không có trận, không có thanh máu. Kết cục đã cố định:{" "}
          <strong className="text-sky-200">{outcome}</strong>
          {counterpart ? ` (${counterpart.name})` : ""}. Lời đáp chỉ đổi cách
          kể; không có thưởng riêng theo lựa chọn. Server ghi kết quả vào thế
          cục sứ quân một lần.
        </p>
      )}

      <Dialogue beats={copy.intro} />
      <SourceNotes nodeId={nodeId} label="Xem chú thích sử liệu" />

      {phase === "intro" && !done ? (
        <button
          type="button"
          onClick={() => onMove("choice", choice)}
          className={`min-h-11 self-start rounded-lg bg-amber-500 px-5 font-semibold text-stone-950 ${FOCUS}`}
        >
          Vào hội kiến
        </button>
      ) : (
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
                    <span className="line-clamp-2 text-xs text-stone-300">
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
          {picked && <Dialogue beats={picked.beats} />}
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
        {done && (
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
              <Beats beats={copy.outro} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
