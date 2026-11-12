// Lời dẫn Chương I (M01–M03) và khung dùng chung cho các chương sau (Chương II ở chapterTwo.ts): intro, lựa chọn trình diễn, outro và ghi chú sử liệu. Mỗi đoạn mang nhãn
// nguồn theo docs/02-game-modes/campaign/history-sources.md: "recorded" chỉ dùng cho claim có trong ledger, thoại nhân
// vật luôn "fictional", truyền thuyết luôn "legend". Lựa chọn chỉ đổi lời dẫn, không đổi kết quả hay thưởng.

import {
  CAMPAIGN_CHOICE_IDS,
  campaignNodeUnlocked,
  chapterCompleted,
  type CampaignProgressV2,
} from "../progress/campaignState";
import { CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD } from "./rewards";
import { campaignEncounter } from "./encounters";
import { CHAPTER_TWO, CHAPTER_TWO_COPY } from "./chapterTwo";
import { CHAPTER_THREE, CHAPTER_THREE_COPY } from "./chapterThree";
import { CHAPTER_FOUR, CHAPTER_FOUR_COPY } from "./chapterFour";
import { CHAPTER_FIVE, CHAPTER_FIVE_COPY } from "./chapterFive";
import { CHAPTER_SIX, CHAPTER_SIX_COPY } from "./chapterSix";
import { factionResolutionOfMission } from "./factions";
import {
  isCombatStoryNode,
  storyNodeById,
  type CampaignChapter,
  type CampaignCompanionId,
  type CampaignMissionId,
  type HistoricalBasis,
  type HistoricalReferenceId,
} from "./storyNodes";

export interface StoryBeat {
  /** Không có: lời người kể. Có: thoại nhân vật, luôn `fictional`. */
  readonly speaker?: string;
  readonly text: string;
  readonly basis: HistoricalBasis;
  readonly refs?: readonly HistoricalReferenceId[];
}

export interface StoryChoiceCopy {
  readonly id: string;
  readonly label: string;
  readonly beats: readonly StoryBeat[];
}

export interface MissionCopy {
  readonly id: CampaignMissionId;
  /** Câu hỏi đặt trước lựa chọn. */
  readonly prompt: string;
  /** Cảnh dựng mở màn (khung riêng trước lời dẫn); luôn là lời game, không phải sử. */
  readonly cinematic?: readonly StoryBeat[];
  readonly intro: readonly StoryBeat[];
  readonly choices: readonly StoryChoiceCopy[];
  /** Sau khi hoàn thành (thắng trận với nhiệm vụ có trận). */
  readonly outro: readonly StoryBeat[];
  /** Chỉ nhiệm vụ có trận: khi thua. */
  readonly defeat?: readonly StoryBeat[];
  /** Mục tiêu trận, hiển thị trước khi xuất quân. */
  readonly objective?: string;
  /** Ghi chú nguồn: trích sử, lời bàn và khác biệt truyền thuyết, hiện thành khung riêng. */
  readonly sourceNotes?: readonly SourceNote[];
}

export interface SourceNote {
  readonly title: string;
  readonly beats: readonly StoryBeat[];
}

/** Khung một chương trên màn Chiến dịch. */
export interface ChapterContent {
  readonly chapter: CampaignChapter;
  readonly title: string;
  readonly question: string;
  readonly missions: readonly CampaignMissionId[];
  /** Nhiệm vụ đã có đủ nội dung. */
  readonly playable: readonly CampaignMissionId[];
  readonly region: {
    readonly name: string;
    readonly modernRegion: string;
    /** Kinh độ, vĩ độ gần đúng để khoanh vùng trên bản đồ cổ (không đo đạc). */
    readonly at: readonly [number, number];
    readonly note: string;
  };
  readonly legendVsRecord: { readonly legend: string; readonly record: string };
  readonly completeLine: string;
}

export const BASIS_LABEL: Readonly<
  Record<HistoricalBasis, { readonly name: string; readonly hint: string }>
> = {
  recorded: {
    name: "Sử chép",
    hint: "Có văn bản sử ghi lại; xem mã nguồn bên cạnh. Sử biên soạn muộn, không phải biên bản tại chỗ.",
  },
  legend: {
    name: "Truyền thuyết",
    hint: "Chuyện kể dân gian, sử sau này có chép lại nhưng không chứng minh được chi tiết.",
  },
  reconstructed: {
    name: "Game tái dựng",
    hint: "Game sắp xếp hoặc nén thời gian để dễ chơi; không phải kết luận từ nguồn.",
  },
  fictional: {
    name: "Hư cấu",
    hint: "Lời thoại, nhân vật phụ hoặc tình huống do game sáng tác.",
  },
  disputed: {
    name: "Còn tranh luận",
    hint: "Các nguồn hoặc cách đọc không thống nhất; game giữ cả hai cách.",
  },
};

/** Mã nguồn hiển thị kèm nhãn: tên ngắn của tài liệu trong ledger. */
export const SOURCE_TITLE: Readonly<
  Partial<Record<HistoricalReferenceId, string>>
> = {
  S01: "Đại Việt sử ký toàn thư, Ngô sứ quân (bản dịch trên Wikisource)",
  S02: "Đại Việt sử ký toàn thư, Hậu Ngô Vương",
  S03: "Đại Việt sử ký toàn thư, Đời Ngô",
  S04: "Việt Nam sử lược, Đinh Tiên Hoàng",
  S05: "Việt Nam sử lược, Nhà Ngô",
  S06: "Bảo tàng Lịch sử Quốc gia, 2013 (tổng thuật hiện đại)",
  S07: "Báo Ninh Bình, 2018 (có tách sử và truyền thuyết)",
  S08: "Bảo tàng Lịch sử Quốc gia, 2012: Nhà Đinh với sự nghiệp thống nhất đất nước",
};

export const CHAPTER_ONE: ChapterContent = {
  chapter: 1,
  title: "Hoa Lư dựng cờ",
  question: "Một thủ lĩnh địa phương bảo vệ người theo mình bằng cách nào?",
  missions: ["M01", "M02", "M03", "M04"],
  playable: ["M01", "M02", "M03", "M04"],
  region: {
    name: "Hoa Lư",
    modernRegion: "Ninh Bình ngày nay",
    /** Kinh độ, vĩ độ gần đúng để khoanh vùng trên bản đồ cổ (không đo đạc). */
    at: [105.88, 20.25],
    note: "Định vị truyền thống của căn cứ Hoa Lư; khoanh vùng để định hướng, không phải ranh giới lịch sử.",
  },
  /** Bảng so sánh hiện ở đầu chương. */
  legendVsRecord: {
    legend:
      "Truyền thuyết kể chuyện cờ lau thuở nhỏ. Chuyện ấy được kể lại qua nhiều đời, sử có chép nhưng không cho biết ngày tháng hay trận nào là thật.",
    record:
      "Ghi chép lịch sử cho các mốc như Ngô Quyền xưng vương năm 939, mất năm 944, và cuộc phòng thủ Hoa Lư năm 951. Đây là sử biên soạn muộn, vẫn có chỗ các bản ghi năm khác nhau.",
  },
  completeLine:
    "Hoa Lư đứng vững sau cuộc tiến quân năm 951. Chương II mở đường ra Bố Hải.",
};

/** Các chương đã có màn trên Chiến dịch, theo thứ tự. */
export const CAMPAIGN_CHAPTERS: readonly ChapterContent[] = [
  CHAPTER_ONE,
  CHAPTER_TWO,
  CHAPTER_THREE,
  CHAPTER_FOUR,
  CHAPTER_FIVE,
  CHAPTER_SIX,
];

export function chapterContentOf(
  id: CampaignMissionId,
): ChapterContent | undefined {
  return CAMPAIGN_CHAPTERS.find((c) => c.missions.includes(id));
}

const NARRATOR_GAME = "reconstructed" as const;

const COPY: readonly MissionCopy[] = [
  {
    id: "M01",
    prompt: "Ai sẽ kể cho bạn nghe chuyện cờ lau?",
    intro: [
      {
        text: "Tương truyền, thuở nhỏ Đinh Bộ Lĩnh chăn trâu ở vùng Hoa Lư, bẻ bông lau làm cờ, dàn trận cùng lũ trẻ chăn trâu trong vùng.",
        basis: "legend",
        refs: ["E12", "S04", "S07"],
      },
      {
        speaker: "Cụ già trong động",
        text: "Mỗi mùa lau trắng bãi, người già lại kể chuyện cờ lau cho con cháu nghe, kể mãi không chán.",
        basis: "fictional",
      },
      {
        text: "Đây là truyền thuyết. Nó cho ta biết người Hoa Lư nhớ về thủ lĩnh của mình ra sao, chứ không phải tư liệu ghi tại chỗ.",
        basis: "legend",
        refs: ["E12"],
      },
    ],
    choices: [
      {
        id: "listen",
        label: "Nghe Nguyễn Bặc kể",
        beats: [
          {
            speaker: "Nguyễn Bặc",
            text: "Tôi chỉ kể lại điều người trong vùng vẫn kể: cờ là bông lau, quân là đám trẻ chăn trâu. Điều đáng nhớ là cả bọn chịu đi theo một người.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "folkPainting",
        label: "Xem tranh dân gian",
        beats: [
          {
            text: "Bức tranh vẽ đứa trẻ cầm bông lau đứng giữa đám bạn chăn trâu. Đó là cách dân gian ghi nhớ, không phải hình vẽ từ thời ấy.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Truyền thuyết khép lại. Từ đây, câu chuyện bước sang những điều sử đã ghi.",
        basis: NARRATOR_GAME,
      },
    ],
  },
  {
    id: "M02",
    prompt: "Bạn muốn hỏi người đưa tin điều gì trước?",
    intro: [
      {
        text: "Năm 939, Ngô Quyền xưng vương. Năm 944, ông mất.",
        basis: "recorded",
        refs: ["E01", "S03"],
      },
      {
        text: "Ngô Quyền mất, Dương Tam Kha nắm quyền. Các bản sử gắn năm cho việc này không hoàn toàn giống nhau.",
        basis: "disputed",
        refs: ["E02", "S03", "S05"],
      },
      {
        text: "Rồi Ngô Xương Văn lật đổ Dương Tam Kha, nhà Ngô có hai vua cùng trị. Sử ghi mốc này vào năm 950 hoặc 951 tùy bản.",
        basis: "disputed",
        refs: ["E03", "S05"],
      },
      {
        speaker: "Người đưa tin",
        text: "Tin từ nơi xa đến chậm. Người trong vùng chỉ biết quyền lực đã đổi chủ, còn ruộng nương thì phải tự mình giữ lấy.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "askCoLoa",
        label: "Hỏi chuyện triều đình",
        beats: [
          {
            text: "Dòng thời gian: 939 Ngô Quyền xưng vương; 944 Ngô Quyền mất; sau đó Dương Tam Kha nắm quyền; rồi Ngô Xương Văn khôi phục nhà Ngô.",
            basis: "recorded",
            refs: ["E01", "E02", "E03", "S03", "S05"],
          },
        ],
      },
      {
        id: "askCountryside",
        label: "Hỏi chuyện làng quê",
        beats: [
          {
            speaker: "Người đưa tin",
            text: "Làng nào cũng lo đắp lũy, cất lương. Chẳng ai dám chắc nơi xa còn đủ sức che chở cho mình.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Bối cảnh đã rõ: quyền lực ở xa đổi chủ, Hoa Lư phải tự mình lo giữ lấy đất.",
        basis: NARRATOR_GAME,
      },
    ],
  },
  {
    id: "M03",
    prompt: "Trước giờ giao chiến, ai sẽ lo việc trong động?",
    objective:
      "Giữ vững đủ số lượt (hoặc hạ thủ lĩnh địch) để dân và kho lương được yên.",
    intro: [
      {
        text: "Một toán người có vũ khí, không rõ từ đâu, lần theo lối mòn vào khe núi. Dân trong động nóng ruột lo cho kho lương.",
        basis: "fictional",
      },
      {
        text: "Trận này do game sáng tác để mở đầu việc phòng bị. Sử không chép trận nào như thế, và toán quân kia không mang tên thế lực có thật.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "reassurePeople",
        label: "Nguyễn Bặc trấn an dân",
        beats: [
          {
            speaker: "Nguyễn Bặc",
            text: "Người già và trẻ nhỏ vào sâu trong động. Kho lương đã có người canh, bà con cứ yên lòng.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "fortifyPass",
        label: "Đinh Điền bố trí phòng tuyến",
        beats: [
          {
            speaker: "Đinh Điền",
            text: "Khe núi hẹp, chỉ cần giữ chắc cửa là chúng không thể tràn vào. Đắp lũy, cắm chông chặn lối vào!",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Cửa khe núi vững như đá. Hoa Lư bắt đầu lo toan phòng bị cho những ngày sắp tới.",
        basis: "fictional",
      },
    ],
    defeat: [
      {
        text: "Phòng tuyến phải lùi, nhưng dân đã kịp vào sâu trong động. Chỉnh lại đội hình, đánh lại!",
        basis: "fictional",
      },
    ],
  },
  {
    id: "M04",
    prompt: "Quân Ngô kéo tới, Hoa Lư lo điều gì trước hết?",
    objective: "Giữ vững đủ số lượt (hoặc hạ cả ba đối thủ) để Hoa Lư đứng vững.",
    intro: [
      {
        text: "Năm 951, hai vua nhà Ngô đem quân đánh Hoa Lư.",
        basis: "recorded",
        refs: ["E04", "S02", "S04"],
      },
      {
        text: "Sử chép Đinh Liễn, con trai Đinh Bộ Lĩnh, khi ấy bị quân Ngô giữ làm con tin. Sử kể tình tiết này rất nặng nề; game chỉ nhắc gián tiếp, không dựng lời thoại cho cảnh ấy.",
        basis: "recorded",
        refs: ["E04a", "S02"],
      },
      {
        text: "Đội hình hai bên, tướng đối phương và diễn biến trên bàn cờ đều do game tái dựng; không ai trong số họ là người có tên trong sử.",
        basis: "reconstructed",
      },
      {
        speaker: "Đinh Liễn",
        text: "Họ mà vào được khe núi thì người trong động hết đường lui.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "holdPass",
        label: "Giữ chặt cửa núi",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Dồn quân ra cửa núi. Họ chỉ được đến đây là cùng!",
            basis: "fictional",
          },
        ],
      },
      {
        id: "evacuatePeople",
        label: "Mở đường cho dân lui",
        beats: [
          {
            text: "Người già và trẻ nhỏ được đưa vào sâu trong núi trước; quân giữ hàng sau cùng để dân kịp lui.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Cuộc tiến quân không hạ nổi Hoa Lư và phải rút lui.",
        basis: "recorded",
        refs: ["E04", "S02", "S04"],
      },
      {
        text: "Hoa Lư đứng vững. Đây là một cuộc xung đột trong cục diện nhà Ngô, chưa phải dấu chấm hết của nhà Ngô.",
        basis: "reconstructed",
      },
    ],
    defeat: [
      {
        text: "Phòng tuyến lùi vào sâu trong núi. Chỉnh lại đội hình, đánh lại; kết cục năm 951 trong game không đổi.",
        basis: "fictional",
      },
    ],
  },
];

const ALL_COPY: readonly MissionCopy[] = [
  ...COPY,
  ...CHAPTER_TWO_COPY,
  ...CHAPTER_THREE_COPY,
  ...CHAPTER_FOUR_COPY,
  ...CHAPTER_FIVE_COPY,
  ...CHAPTER_SIX_COPY,
];

export function missionCopy(id: string): MissionCopy | undefined {
  return ALL_COPY.find((copy) => copy.id === id);
}

/** Lời kể hội kiến/kết minh không được tả như chinh phục (design-freeze mục 8, narrative-bible). */
const CONQUEST_WORDS = /đánh bại|quy phục|thử tài|hạ được|đầu hàng|chinh phạt/i;
/** Nhiệm vụ có kết cục quy phục được gọi đúng tên kết cục, nhưng vẫn không được tả như thắng trận. */
const DEFEAT_WORDS = /đánh bại|thử tài|hạ được|đầu hàng|chinh phạt/i;

/** Lỗi nội dung: lựa chọn lệch allowlist, nhãn sử chép không có mã nguồn, mã nguồn ngoài node. */
export function chapterOneCopyErrors(): string[] {
  return campaignCopyErrors();
}

export function campaignCopyErrors(): string[] {
  const errors: string[] = [];
  for (const copy of ALL_COPY) {
    const node = storyNodeById(copy.id);
    if (!node) {
      errors.push(`${copy.id}: unknown node`);
      continue;
    }
    const allowed = CAMPAIGN_CHOICE_IDS[copy.id] ?? [];
    const ids = copy.choices.map((c) => c.id);
    if (
      ids.length !== allowed.length ||
      ids.some((id) => !allowed.includes(id))
    )
      errors.push(`${copy.id}: choices differ from allowlist`);
    const story = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...(copy.defeat ?? []),
      ...copy.choices.flatMap((c) => c.beats),
    ];
    if (
      node.type === "diplomacy" ||
      node.type === "story" ||
      node.type === "preparation"
    )
      for (const beat of story)
        if (
          (factionResolutionOfMission(copy.id)?.status === "submitted"
            ? DEFEAT_WORDS
            : CONQUEST_WORDS
          ).test(beat.text)
        )
          errors.push(`${copy.id}: non-combat copy reads as conquest`);
    const beats = [
      ...story,
      ...(copy.sourceNotes ?? []).flatMap((n) => n.beats),
    ];
    for (const beat of beats) {
      if (copy.cinematic?.includes(beat) && beat.basis === "recorded")
        errors.push(`${copy.id}: cinematic must not be presented as record`);
      if (beat.speaker && beat.basis !== "fictional")
        errors.push(`${copy.id}: character voice must be fictional`);
      if (beat.basis === "recorded" && !(beat.refs && beat.refs.length > 0))
        errors.push(`${copy.id}: recorded beat without source`);
      for (const ref of beat.refs ?? [])
        if (!node.references.includes(ref))
          errors.push(`${copy.id}: reference ${ref} not in node`);
    }
  }
  return errors;
}

export type ChapterMissionStatus =
  | "completed"
  /** Server đang ghi nhiệm vụ này dở (đã xuất quân). */
  | "inProgress"
  | "open"
  | "locked"
  /** Đã mở theo server nhưng chưa có nội dung trong bản này. */
  | "comingSoon";

/** Trạng thái từng nhiệm vụ của một chương, suy ra hoàn toàn từ state server trả về. */
export function chapterStatus(
  campaign: CampaignProgressV2,
  chapter: ChapterContent,
): readonly {
  readonly id: CampaignMissionId;
  readonly status: ChapterMissionStatus;
}[] {
  return chapter.missions.map((id) => {
    const node = storyNodeById(id)!;
    let status: ChapterMissionStatus;
    if (campaign.completed.includes(id)) status = "completed";
    else if (!campaignNodeUnlocked(campaign, id)) status = "locked";
    else if (
      !missionCopy(id) ||
      (isCombatStoryNode(node) && !campaignEncounter(id))
    )
      status = "comingSoon";
    else if (campaign.inProgress.includes(id)) status = "inProgress";
    else status = "open";
    return { id, status };
  });
}

export function chapterFocus(
  campaign: CampaignProgressV2,
  chapter: ChapterContent,
): CampaignMissionId {
  const list = chapterStatus(campaign, chapter);
  return (
    list.find((m) => m.status === "inProgress")?.id ??
    list.find((m) => m.status === "open")?.id ??
    [...list].reverse().find((m) => m.status === "completed")?.id ??
    chapter.missions[0]!
  );
}

/** Chương nên mở khi vào màn: chương xa nhất còn việc đang mở hoặc đang dở. */
export function campaignFocusChapter(
  campaign: CampaignProgressV2,
): ChapterContent {
  const statuses = CAMPAIGN_CHAPTERS.map(
    (c) => [c, chapterStatus(campaign, c)] as const,
  );
  const has = (
    list: (typeof statuses)[number][1],
    status: ChapterMissionStatus,
  ) => list.some((m) => m.status === status);
  const latest = (pick: (list: (typeof statuses)[number][1]) => boolean) =>
    [...statuses].reverse().find(([, list]) => pick(list))?.[0];
  // Hai tuyến IV/V mở song song: ưu tiên nhiệm vụ đang dở, rồi tuyến đang đi dở, rồi tuyến mở sớm nhất.
  return (
    latest((list) => has(list, "inProgress")) ??
    latest((list) => has(list, "completed") && has(list, "open")) ??
    statuses.find(([, list]) => has(list, "open"))?.[0] ??
    // Không còn nhiệm vụ mở (chương sau chưa có nội dung): mở chương xa nhất đã có nhiệm vụ hoàn thành.
    latest((list) => has(list, "completed")) ??
    CHAPTER_ONE
  );
}

export interface FirstClearCelebration {
  readonly nodeId: CampaignMissionId;
  readonly missionGold: number;
  readonly chapterGold: number;
  readonly unlockedHeroes: readonly CampaignCompanionId[];
  /** Mọi phiếu thưởng được đánh dấu đã xem khi đóng màn thưởng. */
  readonly receipts: readonly string[];
}

/**
 * Màn thưởng lần đầu dựng lại từ phiếu thưởng server đã ghi (rewardReceipts), không từ response trận. Tải
 * lại trang giữa chừng vẫn thấy màn thưởng; đóng rồi thì client ghi `seen` (tiện ích riêng của người xem).
 * Chỉ hiện nhiệm vụ mới nhất chưa xem để không dồn nhiều màn khi trình duyệt chặn lưu trữ.
 */
export function pendingFirstClear(
  campaign: CampaignProgressV2,
  seen: readonly string[],
): FirstClearCelebration | null {
  const unseen = campaign.rewardReceipts.filter((r) => !seen.includes(r));
  const nodeReceipt = [...unseen].reverse().find((r) => r.startsWith("node:"));
  if (!nodeReceipt) return null;
  const node = storyNodeById(nodeReceipt.slice("node:".length));
  if (!node) return null;
  const chapterReceipt = `chapter:${node.chapter}`;
  const chapterNew =
    unseen.includes(chapterReceipt as never) &&
    chapterCompleted(campaign, node.chapter);
  const unlockedHeroes = chapterNew
    ? node.unlockedContent.flatMap((u) =>
        u.kind === "companion" && unseen.includes(`hero:${u.id}` as never)
          ? [u.id]
          : [],
      )
    : [];
  return {
    nodeId: node.id,
    missionGold: node.rewards.firstClearGold,
    chapterGold: chapterNew ? CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD : 0,
    unlockedHeroes,
    receipts: unseen,
  };
}
