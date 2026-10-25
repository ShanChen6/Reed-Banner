// Dữ liệu cho trình phát thoại từng câu (Campaign V2 UI-01). Chỉ đọc lời kể có sẵn trong missionCopy, không có
// kho thoại riêng. Khóa mỗi câu `missionId:section:index` ổn định để sau này gắn giọng đọc. Hàm thuần, test được.

import {
  ALL_COMPANIONS,
  CAMPAIGN_RECRUITS,
  WARLORD_RECORDS,
  companionById,
  type Element,
  type Profession,
  type StoryBeat,
} from "@/core";

export const MAIN_SPEAKER = "Đinh Bộ Lĩnh";

/** Người phía Hoa Lư: đứng bên trái khung thoại; mọi người khác đứng bên phải. */
const OUR_SIDE = new Set<string>([
  MAIN_SPEAKER,
  "Sứ giả Hoa Lư",
  ...CAMPAIGN_RECRUITS.map((r) => r.name),
]);

export type DialogueSide = "left" | "right";

export const speakerSide = (speaker: string): DialogueSide =>
  OUR_SIDE.has(speaker) ? "left" : "right";

/** Một đoạn liền nhau trong cùng một lần phát (cảnh dựng, lời dẫn, lời đáp…). */
export interface DialogueSegment {
  readonly section: string;
  readonly beats: readonly StoryBeat[];
  /** Cảnh dựng mở màn: khung riêng, luôn là lời game. */
  readonly cinematic?: boolean;
}

export interface DialogueLine {
  readonly key: string;
  readonly section: string;
  readonly index: number;
  readonly beat: StoryBeat;
  readonly cinematic: boolean;
}

export function dialogueLines(
  missionId: string,
  segments: readonly DialogueSegment[],
): DialogueLine[] {
  return segments.flatMap((s) =>
    s.beats.map((beat, index) => ({
      key: `${missionId}:${s.section}:${index}`,
      section: s.section,
      index,
      beat,
      cinematic: !!s.cinematic,
    })),
  );
}

export interface SpeakerLook {
  readonly id: string;
  readonly element: Element;
  readonly profession: Profession;
}

/**
 * Chân dung theo tên người nói: nhân vật có trong danh sách (kể cả sứ quân gọi theo tước hiệu, ví dụ Trần Minh
 * Công) dùng chân dung của họ; người không tên (người đưa tin, lính già) không có chân dung.
 */
export function speakerLook(speaker: string): SpeakerLook | null {
  const byName = ALL_COMPANIONS.find((c) => c.name === speaker);
  const record = WARLORD_RECORDS.find(
    (w) => w.name === speaker || w.title === speaker,
  );
  const c = byName ?? (record ? companionById(record.faction) : undefined);
  return c ? { id: c.id, element: c.element, profession: c.profession } : null;
}

/** Người nói gần nhất mỗi bên tính đến câu `upTo`: hai chân dung đứng hai bên khung thoại. */
export function stageSpeakers(
  lines: readonly DialogueLine[],
  upTo: number,
): Record<DialogueSide, string | null> {
  const out: Record<DialogueSide, string | null> = { left: null, right: null };
  for (let i = 0; i <= upTo && i < lines.length; i++) {
    const s = lines[i]!.beat.speaker;
    if (s) out[speakerSide(s)] = s;
  }
  // Chưa ai lên tiếng bên trái thì Đinh Bộ Lĩnh vẫn đứng đó: người chơi luôn thấy nhân vật của mình.
  if (!out.left && lines.some((l) => l.beat.speaker)) out.left = MAIN_SPEAKER;
  return out;
}

/** Câu xa nhất đã đọc của mỗi lần phát, để "Bỏ qua thoại đã xem" và Nhật ký chỉ có những câu đã đọc. */
export type ViewedMap = Readonly<Record<string, number>>;

export function markViewed(
  map: ViewedMap,
  sequence: string,
  index: number,
): ViewedMap {
  return (map[sequence] ?? -1) >= index ? map : { ...map, [sequence]: index };
}
