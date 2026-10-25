"use client";

// Trình phát thoại từng câu cho Campaign V2 (UI-01): mỗi bước một câu, chân dung người nói sáng lên, Trước/Tiếp,
// Nhật ký các câu đã đọc, bỏ qua phần đã xem. Chỉ là trình diễn: kết thúc phát không hoàn thành nhiệm vụ, không
// gọi server; việc ấy luôn qua nút xác nhận riêng của màn gọi. Không âm thanh, không ảnh nền bắt buộc.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SOURCE_TITLE, type Element, type Profession } from "@/core";
import { Portrait } from "../art/portraits";
import { BasisBadge } from "./StoryBeats";
import {
  MAIN_SPEAKER,
  backdropUrl,
  dialogueLines,
  missionBackdrop,
  markViewed,
  speakerLook,
  speakerSide,
  stageSpeakers,
  type DialogueLine,
  type DialogueSegment,
  type ViewedMap,
} from "./dialogue";

/** Câu xa nhất đã đọc của mỗi lần phát; chỉ là tiện ích hiển thị, không phải tiến độ. */
const VIEWED_KEY = "coLau.campaign.v2.dialogue";

function readViewed(): ViewedMap {
  try {
    const raw = window.localStorage.getItem(VIEWED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as ViewedMap) : {};
  } catch {
    return {};
  }
}

function writeViewed(map: ViewedMap) {
  try {
    window.localStorage.setItem(VIEWED_KEY, JSON.stringify(map));
  } catch {
    // Trình duyệt chặn lưu trữ: lần sau chỉ không bỏ qua được phần đã xem.
  }
}

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c140f] focus-visible:outline-none";
const BTN = `min-h-11 rounded-lg px-3 text-sm sm:px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

function StagePortrait({
  speaker,
  active,
  main,
  align,
}: {
  speaker: string | null;
  active: boolean;
  main: { element: Element; profession: Profession };
  align: "left" | "right";
}) {
  if (!speaker) return <div className="size-16 sm:size-20" aria-hidden />;
  const look =
    speaker === MAIN_SPEAKER
      ? { id: "dinhBoLinh", ...main }
      : speakerLook(speaker);
  return (
    <figure
      aria-hidden
      className={`dialogue-portrait flex flex-col items-center gap-1 ${align === "right" ? "items-end" : "items-start"} ${active ? "opacity-100" : "opacity-60 saturate-50"}`}
    >
      {look ? (
        <Portrait
          id={look.id}
          element={look.element}
          profession={look.profession}
          className={`size-16 sm:size-20 ${active ? "drop-shadow-[0_0_10px_#f2c14e88]" : ""}`}
        />
      ) : (
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-stone-500/60 bg-black/40 text-2xl text-stone-300 sm:size-20">
          {speaker.charAt(0).toUpperCase()}
        </span>
      )}
      <figcaption className="max-w-28 truncate rounded bg-black/55 px-1.5 text-[11px] text-stone-100">
        {speaker}
      </figcaption>
    </figure>
  );
}

function LineText({ line }: { line: DialogueLine }) {
  const { beat } = line;
  const sources = (beat.refs ?? []).filter((r) => r.startsWith("S"));
  return (
    <>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        {line.cinematic ? (
          <span className="text-[10px] tracking-widest text-amber-300/80 uppercase">
            Cảnh dựng · game sáng tác
          </span>
        ) : (
          <BasisBadge basis={beat.basis} />
        )}
        {beat.speaker && (
          <span className="text-xs text-stone-400">
            thoại hư cấu, không phải trích dẫn sử
          </span>
        )}
      </div>
      {beat.speaker && (
        <p className="text-sm font-bold text-amber-300">{beat.speaker}</p>
      )}
      <p
        className={
          beat.speaker
            ? "text-base leading-relaxed text-amber-50"
            : line.cinematic
              ? "font-serif text-base leading-relaxed text-amber-50/90 italic"
              : "text-base leading-relaxed text-stone-200 italic"
        }
      >
        {beat.speaker ? `“${beat.text}”` : beat.text}
      </p>
      {beat.refs && beat.refs.length > 0 && (
        <p className="mt-1 text-[11px] text-stone-400">
          Nguồn: {beat.refs.join(", ")}
          {sources.length > 0 &&
            ` · ${sources.map((s) => SOURCE_TITLE[s] ?? s).join("; ")}`}
        </p>
      )}
    </>
  );
}

function Backlog({
  lines,
  upTo,
  current,
  onJump,
  onClose,
}: {
  lines: readonly DialogueLine[];
  upTo: number;
  current: number;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nhật ký thoại"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-t-2xl border-2 border-[#8a6a3b] bg-[#2a1f19] text-stone-100 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h2 className="font-bold text-amber-100">Nhật ký</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={`${BTN} bg-white/10 hover:bg-white/15`}
          >
            Đóng
          </button>
        </div>
        <ol className="flex flex-col gap-2 overflow-y-auto p-3">
          {lines.slice(0, upTo + 1).map((line, i) => (
            <li key={line.key}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={i === current ? "step" : undefined}
                className={`w-full rounded-md border p-2 text-left text-sm ${FOCUS} ${
                  i === current
                    ? "border-amber-300/70 bg-amber-500/10"
                    : "border-transparent bg-black/25 hover:bg-black/40"
                }`}
              >
                <LineText line={line} />
              </button>
            </li>
          ))}
        </ol>
        <p className="border-t border-white/10 px-4 py-2 text-xs text-stone-400">
          Chỉ có những câu đã đọc. Chạm một câu để quay lại đó.
        </p>
      </div>
    </div>
  );
}

export default function DialoguePlayer({
  missionId,
  sequence,
  segments,
  main,
  finishLabel,
  onFinished,
  label,
  background,
}: {
  missionId: string;
  /** Tên lần phát (intro, outro, choice:…): cùng với missionId làm khóa nhớ phần đã đọc. */
  sequence: string;
  segments: readonly DialogueSegment[];
  /** Hệ và nghề hiện tại của Đinh Bộ Lĩnh, để chân dung khớp nhân vật người chơi. */
  main: { element: Element; profession: Profession };
  /** Nhãn nút ở câu cuối. Không có thì câu cuối chỉ dừng lại. */
  finishLabel?: string;
  /** Hết phần trình diễn. KHÔNG hoàn thành nhiệm vụ, không gửi gì lên server. */
  onFinished?: () => void;
  label?: string;
  /** Ảnh nền (đường dẫn trong public/). Mặc định theo nhiệm vụ; ảnh lỗi thì nền CSS vẫn đọc được. */
  background?: string;
}) {
  const lines = dialogueLines(missionId, segments);
  const seqKey = `${missionId}:${sequence}`;
  const last = lines.length - 1;
  const [index, setIndex] = useState(0);
  // Câu xa nhất đã đọc (kể cả các lần mở trước). Màn Chiến dịch chỉ dựng sau khi tải hồ sơ trên trình duyệt nên
  // đọc localStorage ngay khi khởi tạo được; đổi lần phát thì màn gọi đặt key mới để dựng lại.
  const [viewed, setViewed] = useState(() =>
    Math.max(0, Math.min(readViewed()[seqKey] ?? 0, last)),
  );
  const [backlog, setBacklog] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  if (lines.length === 0) return null;
  const line = lines[Math.min(index, last)]!;

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(last, i));
    setIndex(next);
    if (next > viewed) {
      setViewed(next);
      writeViewed(markViewed(readViewed(), seqKey, next));
    }
  };
  const forward = () => {
    if (index < last) goTo(index + 1);
    else onFinished?.();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Phím trên nút do nút tự xử lý; ở đây chỉ nhận khi khung thoại đang được chọn.
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      forward();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const stage = stageSpeakers(lines, index);
  const activeSide = line.beat.speaker ? speakerSide(line.beat.speaker) : null;
  const hasPortraits = !!(stage.left || stage.right);
  const canSkip = viewed > index;
  const art = background ?? backdropUrl(missionBackdrop(missionId));

  return (
    <section
      aria-label={label ?? "Thoại"}
      className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-cover bg-center p-3"
      style={{
        // Tranh nền sáng ở trên cho thấy cảnh, tối dần xuống khung chữ; ảnh chưa tải hay lỗi thì còn lớp nâu cuối.
        backgroundImage: `linear-gradient(#140d0914 0%, #140d0955 45%, #140d09e6 100%), url(${art}), radial-gradient(ellipse at top, #5b3a22 0%, #2a1b12 60%, #140d09 100%)`,
      }}
    >
      {/* Sân khấu: chừa chỗ để tranh nền hiện ra; chân dung đứng hai bên. */}
      <div className="flex min-h-24 items-end justify-between gap-2 px-1 sm:min-h-40">
        {hasPortraits && (
          <>
            <StagePortrait
              speaker={stage.left}
              active={activeSide === "left"}
              main={main}
              align="left"
            />
            <StagePortrait
              speaker={stage.right}
              active={activeSide === "right"}
              main={main}
              align="right"
            />
          </>
        )}
      </div>
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription="khung thoại"
        aria-label={`Câu ${index + 1}/${lines.length}. Enter, phím cách hoặc mũi tên phải để đọc tiếp, mũi tên trái để quay lại.`}
        onKeyDown={onKey}
        onClick={forward}
        className={`min-h-28 cursor-pointer rounded-lg border-2 p-3 ${FOCUS} ${
          line.cinematic
            ? "border-amber-500/30 bg-gradient-to-b from-black/50 to-[#3a2a1c]/60"
            : activeSide === "left"
              ? "border-amber-500/50 bg-amber-950/50"
              : activeSide === "right"
                ? "border-sky-400/40 bg-sky-950/50"
                : "border-white/10 bg-black/40"
        }`}
      >
        <div key={line.key} className="dialogue-line" aria-live="polite">
          <LineText line={line} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className={`${BTN} bg-white/10 hover:bg-white/15`}
        >
          ← Trước
        </button>
        {(index < last || finishLabel) && (
          <button
            type="button"
            onClick={forward}
            className={`${BTN} bg-amber-500 text-stone-950`}
          >
            {index < last ? "Tiếp →" : finishLabel}
          </button>
        )}
        <span className="text-xs text-stone-400" aria-hidden>
          {index + 1}/{lines.length}
        </span>
        <span className="flex-1" />
        {canSkip && (
          <button
            type="button"
            onClick={() => goTo(viewed)}
            className={`${BTN} bg-white/10 hover:bg-white/15`}
          >
            Bỏ qua thoại đã xem
          </button>
        )}
        <button
          type="button"
          onClick={() => setBacklog(true)}
          className={`${BTN} bg-white/10 hover:bg-white/15`}
        >
          Nhật ký
        </button>
      </div>
      {backlog && (
        <Backlog
          lines={lines}
          upTo={Math.max(viewed, index)}
          current={index}
          onJump={(i) => {
            goTo(i);
            setBacklog(false);
            stageRef.current?.focus();
          }}
          onClose={() => {
            setBacklog(false);
            stageRef.current?.focus();
          }}
        />
      )}
    </section>
  );
}
