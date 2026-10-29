// Sử ký trong game (CAMP-08.02): bản rút gọn của docs/02-game-modes/campaign/history-sources.md và warlord-matrix.md để
// người chơi kiểm chứng mốc lịch sử mà không rời game. Mô tả là lời tóm tắt của ledger, không phải trích nguyên
// văn; không có ngày tháng nào ngoài các mốc ledger đã ghi. Lớp game (trận, lựa chọn, lương, nghề/hệ) luôn tách
// riêng ở `fiction`.

import {
  campaignNodeUnlocked,
  type CampaignProgressV2,
} from "../progress/campaignState";
import {
  campaignFactionView,
  factionResolutionOf,
  type CampaignFactionId,
  type CampaignFactionResolution,
} from "./factions";
import {
  STORY_NODES,
  isCombatStoryNode,
  storyNodeById,
  type CampaignMissionId,
  type HistoricalBasis,
  type HistoricalReferenceId,
  type StoryLocation,
} from "./storyNodes";

export type HistoryConfidence = "high" | "medium" | "mediumLow" | "low";

export interface HistorySource {
  readonly id: HistoricalReferenceId;
  readonly title: string;
  /** Đơn vị lưu trữ hoặc xuất bản. */
  readonly publisher: string;
  readonly url: string;
  /** Mục, năm hoặc đoạn cần tìm trong trang (không phải số trang in). */
  readonly locator: string;
  /** Loại tài liệu: chính sử, sử tổng hợp hay tổng thuật hiện đại. */
  readonly kind: "officialHistory" | "synthesis" | "modernSummary";
  readonly limits: string;
}

export interface HistoryClaim {
  readonly id: HistoricalReferenceId;
  readonly summary: string;
  readonly basis: readonly HistoricalBasis[];
  readonly confidence: HistoryConfidence;
  /** Nguồn hỗ trợ theo ledger mục 3. */
  readonly sources: readonly HistoricalReferenceId[];
  /** Điều game không được suy ra từ mốc này. */
  readonly caveat: string;
}

export interface HistoryUnresolved {
  readonly id: HistoricalReferenceId;
  readonly question: string;
  readonly decision: string;
}

export interface WarlordRecord {
  readonly id: HistoricalReferenceId;
  readonly faction: CampaignFactionId;
  readonly name: string;
  /** Danh hiệu hoặc tên gọi ưu tiên theo S01 mục 966 (warlord-matrix mục 2). */
  readonly title: string;
  readonly aliases: readonly string[];
  /** Kết cục theo ledger, ghi đúng tầng nguồn. */
  readonly outcome: string;
  readonly outcomeBasis: readonly HistoricalBasis[];
  readonly unresolved: readonly HistoricalReferenceId[];
  readonly sources: readonly HistoricalReferenceId[];
}

const WS = "Wikisource (Wikimedia)";
const TT =
  "https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/";
const SL = "https://vi.wikisource.org/wiki/Việt_Nam_sử_lược/Quyển_I/Phần_III/";

export const HISTORY_SOURCES: readonly HistorySource[] = [
  {
    id: "S01",
    title: "Đại Việt sử ký toàn thư — Ngô sứ quân",
    publisher: `Bản dịch Mạc Bảo Thần, ${WS}`,
    url: encodeURI(`${TT}Ngô_sứ_quân`),
    locator:
      "Mục Bính Dần 966 (danh sách), mục 967 (Trần Lãm, Phạm Phòng Át), phụ chú số 2",
    kind: "officialHistory",
    limits:
      "Sử biên soạn muộn; bản web không thay bản Hán. Phụ chú là lớp nguồn khác với chính văn.",
  },
  {
    id: "S02",
    title: "Đại Việt sử ký toàn thư — Hậu Ngô Vương",
    publisher: `Bản dịch Mạc Bảo Thần, ${WS}`,
    url: encodeURI(`${TT}Hậu_Ngô_Vương`),
    locator: "Mục Tân Hợi 951, Giáp Dần 954, Ất Sửu 965",
    kind: "officialHistory",
    limits:
      "Cao về việc sử có ghi, vừa về chi tiết. Lời nói trong sử không phải biên bản nguyên văn.",
  },
  {
    id: "S03",
    title: "Đại Việt sử ký toàn thư — Đời Ngô",
    publisher: `Bản dịch Mạc Bảo Thần, ${WS}`,
    url: encodeURI(`${TT}Đời_Ngô`),
    locator: "Mục Kỷ Hợi 939, Giáp Thìn 944, Ất Tỵ 945",
    kind: "officialHistory",
    limits: "Các bản tổng thuật gắn năm chuyển quyền khác nhau.",
  },
  {
    id: "S04",
    title: "Việt Nam sử lược — Đinh Tiên Hoàng",
    publisher: `Trần Trọng Kim, ${WS}`,
    url: encodeURI(`${SL}Chương_II`),
    locator: "Mục Đinh Tiên Hoàng: đoạn 951, 968, 970",
    kind: "synthesis",
    limits: "Sử tổng hợp đầu thế kỷ XX, không phải chính sử đương thời.",
  },
  {
    id: "S05",
    title: "Việt Nam sử lược — Nhà Ngô",
    publisher: `Trần Trọng Kim, ${WS}`,
    url: encodeURI(`${SL}Chương_I`),
    locator: "Nhà Ngô; danh sách Thập nhị sứ quân",
    kind: "synthesis",
    limits: "Bản web có lỗi năm ở một đoạn; định vị Bình Kiều khác S06.",
  },
  {
    id: "S06",
    title: "Tầm nhìn chiến lược của Đinh Bộ Lĩnh",
    publisher: "Bảo tàng Lịch sử Quốc gia, 18-06-2013",
    url: "https://baotanglichsu.vn/vi/Articles/3096/14529/tam-nhin-chien-luoc-cua-djinh-bo-linh.html",
    locator: "Mục “Thứ hai”: liên kết, hàng phục, quân sự",
    kind: "modernSummary",
    limits: "Bài diễn giải hiện đại; vừa về kết cục từng người.",
  },
  {
    id: "S07",
    title: "Thân thế, vai trò của Đinh Bộ Lĩnh trong việc dẹp loạn 12 sứ quân",
    publisher: "Báo Ninh Bình, 07-03-2018",
    url: "https://baoninhbinh.org.vn/than-the-vai-tro-cua-dinh-bo-linh-trong-viec-dep-loan-12-su/d20180307085454347.htm",
    locator: "Đoạn Lã Đường; đoạn Nguyễn Khoan; truyền thuyết Bình Kiều",
    kind: "modernSummary",
    limits:
      "Có trộn sử và truyền thuyết (bài có nói rõ); không dẫn trang sử gốc cho từng kết cục.",
  },
  {
    id: "S08",
    title: "Nhà Đinh với sự nghiệp thống nhất đất nước",
    publisher: "Bảo tàng Lịch sử Quốc gia, 21-02-2012",
    url: "https://baotanglichsuquocgia.vn/vi/Articles/3096/10060/nha-djinh-voi-su-nghiep-thong-nhat-djat-nuoc.html",
    locator: "Đoạn năm 968; đoạn “Sau khi đặt quốc hiệu… 970”",
    kind: "modernSummary",
    limits: "Cao cho mốc tổng quan, vẫn là tổng thuật.",
  },
];

export const HISTORY_CLAIMS: readonly HistoryClaim[] = [
  {
    id: "E01",
    summary: "Ngô Quyền xưng vương năm 939 và mất năm 944.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S03"],
    caveat: "Không gọi Ngô Quyền là hoàng đế.",
  },
  {
    id: "E02",
    summary: "Sau khi Ngô Quyền mất, Dương Tam Kha chiếm quyền.",
    basis: ["recorded", "disputed"],
    confidence: "medium",
    sources: ["S03", "S05"],
    caveat:
      "Các nguồn gắn năm khác nhau; game không chốt ngày tháng tiếm quyền.",
  },
  {
    id: "E03",
    summary:
      "Ngô Xương Văn lật Dương Tam Kha; Hậu Ngô có Nam Tấn Vương và Thiên Sách Vương.",
    basis: ["recorded", "disputed"],
    confidence: "high",
    sources: ["S02", "S05"],
    caveat:
      "Nguồn đặt mốc ở 950 hoặc 951; Nam Tấn, Thiên Sách không phải niên hiệu.",
  },
  {
    id: "E04",
    summary: "Năm 951, hai vua Ngô đánh Hoa Lư không hạ được và rút quân.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S02", "S04"],
    caveat:
      "Diễn biến từng trận chỉ ở mức vừa; đây không phải trận chống ngoại xâm.",
  },
  {
    id: "E04a",
    summary:
      "Sử kể Đinh Liễn bị bắt làm con tin trong cuộc vây Hoa Lư năm 951.",
    basis: ["recorded"],
    confidence: "medium",
    sources: ["S02"],
    caveat: "Tình tiết do sử muộn kể lại; lời thoại thêm vào là của game.",
  },
  {
    id: "E06",
    summary: "Ngô Xương Văn mất trong trận năm 965.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S02", "S05"],
    caveat: "Địa danh của trận này không đồng nhất với tỉnh ngày nay.",
  },
  {
    id: "E07",
    summary: "Chính văn Toàn thư mục 966 chép danh sách mười hai sứ quân.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S01"],
    caveat: "Không có nghĩa mười hai thế lực cùng nổi lên năm 966.",
  },
  {
    id: "E08",
    summary:
      "Đinh Bộ Lĩnh và Đinh Liễn nương tựa Trần Lãm và được giao binh quyền.",
    basis: ["recorded", "disputed"],
    confidence: "high",
    sources: ["S01"],
    caveat:
      "Thời điểm bắt đầu còn tranh luận; đây là liên minh, không phải đánh bại Trần Lãm.",
  },
  {
    id: "E09",
    summary: "Phạm Phòng Át đem quân về hàng, sau giữ chức Thân vệ tướng quân.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S01"],
    caveat: "Không có trận quyết đấu nào trước đó được chép.",
  },
  {
    id: "E10",
    summary:
      "Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu Đại Cồ Việt và định đô ở Hoa Lư.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S04", "S08"],
    caveat: "Không gắn mọi trận riêng vào năm 968.",
  },
  {
    id: "E11",
    summary: "Niên hiệu Thái Bình bắt đầu từ năm 970.",
    basis: ["recorded"],
    confidence: "high",
    sources: ["S04", "S08"],
    caveat: "Khác mốc lên ngôi 968; không đưa vào cảnh năm 968.",
  },
  {
    id: "E12",
    summary:
      "Tương truyền thuở nhỏ Đinh Bộ Lĩnh cùng trẻ chăn trâu lấy bông lau làm cờ.",
    basis: ["legend"],
    confidence: "low",
    sources: ["S04", "S07"],
    caveat: "Truyền thuyết: không khóa ngày, trận hay lúc tuyển tướng nào.",
  },
  {
    id: "E13",
    summary:
      "Việc chấm dứt cát cứ thường được đặt vào cuối năm 967, trước mốc 968.",
    basis: ["recorded", "disputed"],
    confidence: "medium",
    sources: ["S01", "S06", "S07"],
    caveat: "Không có lịch từng trận chắc chắn; thứ tự nhiệm vụ là của game.",
  },
];

export const HISTORY_UNRESOLVED: readonly HistoryUnresolved[] = [
  {
    id: "U01",
    question:
      "Các thế lực nổi lên khi nào, và có đúng mười hai thế lực cùng lúc không.",
    decision:
      "Giữ tên gọi truyền thống, không khẳng định mười hai thế lực cùng nổi năm 966.",
  },
  {
    id: "U02",
    question: "Liên minh Trần Lãm – Đinh Bộ Lĩnh bắt đầu từ năm nào.",
    decision:
      "Không gắn năm bắt đầu; không gắn việc nhận binh quyền với một trận thử tài.",
  },
  {
    id: "U03",
    question:
      "Bình Kiều ở đâu: nguồn đặt ở Hưng Yên hoặc Thanh Hóa, phụ chú ghi chưa rõ.",
    decision: "Dùng tên Bình Kiều, không gắn tọa độ trên bản đồ.",
  },
  {
    id: "U04",
    question:
      "Danh hiệu và địa bàn của Ngô Nhật Khánh (Đường Lâm hay Giao Thủy).",
    decision:
      "Tên chính Ngô Nhật Khánh, danh hiệu Ngô Lãm Công; các tên khác chưa xác minh.",
  },
  {
    id: "U06",
    question:
      "Nguyễn Khoan tan rã và Lữ Đường theo về: chỉ tổng thuật hiện đại kể rõ.",
    decision:
      "Kể theo tổng thuật, ghi độ tin cậy vừa, không gọi là chính sử xác nhận.",
  },
  {
    id: "U07",
    question: "Ngày mất, cách chết, người chỉ huy và thứ tự từng trận.",
    decision:
      "Để trống. Trận cuối, vây lâu hay chết trận nếu có trong game là chi tiết sáng tác.",
  },
];

export const WARLORD_RECORDS: readonly WarlordRecord[] = [
  {
    id: "W01",
    faction: "tranLam",
    name: "Trần Lãm",
    title: "Trần Minh Công",
    aliases: [],
    outcome: "Liên minh: sử chép Đinh Bộ Lĩnh nương tựa và được giao quân.",
    outcomeBasis: ["recorded"],
    unresolved: ["U02"],
    sources: ["S01"],
  },
  {
    id: "W02",
    faction: "phamBachHo",
    name: "Phạm Bạch Hổ",
    title: "Phạm Phòng Át",
    aliases: [],
    outcome: "Quy phục: sử chép đem quân về hàng.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01"],
  },
  {
    id: "W03",
    faction: "ngoXuongXi",
    name: "Ngô Xương Xí",
    title: "Ngô sứ quân",
    aliases: [],
    outcome:
      "Quy phục theo tổng thuật hiện đại; chuyện khao quân uy hiếp là truyền thuyết.",
    outcomeBasis: ["recorded", "legend"],
    unresolved: ["U03"],
    sources: ["S01", "S06", "S07"],
  },
  {
    id: "W04",
    faction: "ngoNhatKhanh",
    name: "Ngô Nhật Khánh",
    title: "Ngô Lãm Công",
    aliases: [],
    outcome: "Quy phục theo tổng thuật hiện đại.",
    outcomeBasis: ["recorded"],
    unresolved: ["U04"],
    sources: ["S01", "S05", "S06"],
  },
  {
    id: "W05",
    faction: "nguyenKhoan",
    name: "Nguyễn Khoan",
    title: "Nguyễn Thái Bình",
    aliases: [],
    outcome: "Thế lực tan rã theo tổng thuật; cách và lúc tan rã chưa rõ.",
    outcomeBasis: ["recorded", "disputed"],
    unresolved: ["U06", "U07"],
    sources: ["S01", "S07"],
  },
  {
    id: "W06",
    faction: "kieuCongHan",
    name: "Kiều Công Hãn",
    title: "Kiều Tam Chế",
    aliases: ["Kiểu Công Hãn"],
    outcome: "Đánh dẹp theo tổng thuật; trận và cái chết cụ thể chưa xác nhận.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01", "S06"],
  },
  {
    id: "W07",
    faction: "kieuThuan",
    name: "Kiều Thuận",
    title: "Kiều Lệnh Công",
    aliases: ["Kiểu Thuận"],
    outcome: "Đánh dẹp theo tổng thuật; chi tiết trận chưa rõ.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01", "S06"],
  },
  {
    id: "W08",
    faction: "lyKhue",
    name: "Lý Khuê",
    title: "Lý Lãng Công",
    aliases: ["Lý Lang Công"],
    outcome:
      "Đánh dẹp theo tổng thuật; người chỉ huy và kết cục cá nhân chưa rõ.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01", "S05", "S06"],
  },
  {
    id: "W09",
    faction: "nguyenThuTiep",
    name: "Nguyễn Thủ Tiệp",
    title: "Nguyễn Lệnh Công",
    aliases: ["Nguyễn Lịnh Công"],
    outcome: "Đánh dẹp theo tổng thuật; chi tiết trận chưa rõ.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01", "S06"],
  },
  {
    id: "W10",
    faction: "luDuong",
    name: "Lữ Đường",
    title: "Lữ Tá Công",
    aliases: ["Lã Đường", "Lã Tá Công"],
    outcome: "Vùng theo về theo tổng thuật; cách kết thúc còn chưa chắc.",
    outcomeBasis: ["recorded", "disputed"],
    unresolved: ["U06", "U07"],
    sources: ["S01", "S05", "S07"],
  },
  {
    id: "W11",
    faction: "nguyenSieu",
    name: "Nguyễn Siêu",
    title: "Nguyễn Hữu Công",
    aliases: [],
    outcome:
      "Đánh dẹp theo tổng thuật; quân số, thành lũy và ngày mất chưa rõ.",
    outcomeBasis: ["recorded"],
    unresolved: ["U07"],
    sources: ["S01", "S06"],
  },
  {
    id: "W12",
    faction: "doCanhThac",
    name: "Đỗ Cảnh Thạc",
    title: "Đỗ Cảnh Công",
    aliases: [],
    outcome:
      "Đánh dẹp: sử tổng hợp ghi phá được Đỗ Động. Không có chứng cứ đây là trận cuối.",
    outcomeBasis: ["recorded", "disputed"],
    unresolved: ["U07"],
    sources: ["S01", "S04", "S06"],
  },
];

export const historySource = (id: string) =>
  HISTORY_SOURCES.find((s) => s.id === id);
export const historyClaim = (id: string) =>
  HISTORY_CLAIMS.find((c) => c.id === id);
export const historyUnresolved = (id: string) =>
  HISTORY_UNRESOLVED.find((u) => u.id === id);
export const warlordRecord = (id: string) =>
  WARLORD_RECORDS.find((w) => w.id === id || w.faction === id);

/** Lời giải thích lớp game của một nhiệm vụ: cái gì là cơ chế, không phải sử. */
function fictionNotes(nodeId: CampaignMissionId): string[] {
  const node = storyNodeById(nodeId)!;
  const notes: string[] = [];
  if (isCombatStoryNode(node))
    notes.push(
      "Trận đấu match-3, đối thủ, cấp, đội hình, nghề, hệ, kỹ năng, lương và phần thưởng là cơ chế game; không mô tả diễn biến trận thật.",
    );
  else if (node.type === "diplomacy")
    notes.push(
      "Lời hội đàm và các lựa chọn do game dựng; chỉ kết cục có nhãn nguồn mới theo sử liệu.",
    );
  else
    notes.push(
      "Cảnh dựng, lời thoại và lựa chọn do game sáng tác; lựa chọn chỉ đổi lời kể.",
    );
  notes.push(
    "Thứ tự các nhiệm vụ là của game, không phải thứ tự lịch sử đã được xác nhận.",
  );
  if (node.historicalBasis.includes("fictional"))
    notes.push("Nhân vật phụ và lời nói được gắn nhãn hư cấu là của game.");
  return notes;
}

export interface MissionHistory {
  readonly nodeId: CampaignMissionId;
  readonly basis: readonly HistoricalBasis[];
  readonly location: StoryLocation;
  readonly claims: readonly HistoryClaim[];
  readonly unresolved: readonly HistoryUnresolved[];
  readonly warlords: readonly WarlordRecord[];
  readonly sources: readonly HistorySource[];
  readonly fiction: readonly string[];
}

export function missionHistory(nodeId: CampaignMissionId): MissionHistory {
  const node = storyNodeById(nodeId)!;
  const refs = node.references;
  const warlords = refs.flatMap((r) => {
    const w = warlordRecord(r);
    return w ? [w] : [];
  });
  // Nguồn của nhiệm vụ cộng nguồn của hồ sơ sứ quân liên quan, theo thứ tự trong ledger.
  const claims = refs.flatMap((r) => {
    const c = historyClaim(r);
    return c ? [c] : [];
  });
  const sourceIds = new Set<string>([
    ...refs.filter((r) => r.startsWith("S")),
    ...claims.flatMap((c) => c.sources),
    ...warlords.flatMap((w) => w.sources),
  ]);
  return {
    nodeId,
    basis: node.historicalBasis,
    location: node.location,
    claims,
    unresolved: refs.flatMap((r) => {
      const u = historyUnresolved(r);
      return u ? [u] : [];
    }),
    warlords,
    sources: HISTORY_SOURCES.filter((s) => sourceIds.has(s.id)),
    fiction: fictionNotes(nodeId),
  };
}

/**
 * Kiểm tra dữ liệu sử ký: mọi tham chiếu E/S/U/W đều có mục, nhiệm vụ có nhãn recorded/disputed/legend đều có ghi
 * chú, nhiệm vụ recorded có ít nhất một nguồn kèm URL https.
 */
export function historyCodexErrors(): string[] {
  const errors: string[] = [];
  for (const node of STORY_NODES) {
    for (const r of node.references) {
      const known =
        historySource(r) ||
        historyClaim(r) ||
        historyUnresolved(r) ||
        warlordRecord(r);
      if (!known) errors.push(`${node.id}: ${r} chưa có trong sử ký`);
    }
    const h = missionHistory(node.id);
    const basis: readonly HistoricalBasis[] = node.historicalBasis;
    const needsNote = basis.some(
      (b) => b === "recorded" || b === "disputed" || b === "legend",
    );
    if (
      needsNote &&
      h.claims.length + h.unresolved.length + h.warlords.length === 0
    )
      errors.push(`${node.id}: thiếu ghi chú sử`);
    if (basis.includes("recorded") && h.sources.length === 0)
      errors.push(`${node.id}: recorded nhưng không có nguồn`);
    if (basis.includes("disputed") && !hasDisputed(h))
      errors.push(`${node.id}: disputed nhưng không có ghi chú tranh luận`);
  }
  for (const s of HISTORY_SOURCES)
    if (!s.url.startsWith("https://"))
      errors.push(`${s.id}: URL không an toàn`);
  return errors;
}

function hasDisputed(h: MissionHistory): boolean {
  return (
    h.unresolved.length > 0 ||
    h.claims.some((c) => c.basis.includes("disputed")) ||
    h.warlords.some(
      (w) => w.outcomeBasis.includes("disputed") || w.unresolved.length > 0,
    )
  );
}

export type WarlordCodexStage = "unknown" | "met" | "resolved";

export interface WarlordCodexEntry {
  readonly record: WarlordRecord;
  readonly resolution: CampaignFactionResolution;
  /**
   * unknown: nhiệm vụ của sứ quân chưa mở, chỉ hiện ô trống (không lộ tên, vùng hay kết cục).
   * met: nhiệm vụ đã mở, hiện tên, danh hiệu, vùng và nguồn nhận diện; chưa hiện kết cục.
   * resolved: server đã ghi kết cục, hiện kết cục theo ledger.
   */
  readonly stage: WarlordCodexStage;
  readonly location: StoryLocation;
}

/** Sứ quân ký: 12 hồ sơ, mở dần theo tiến độ do server ghi để không lộ nội dung chưa tới. */
export function warlordCodex(
  campaign: CampaignProgressV2,
): readonly WarlordCodexEntry[] {
  return WARLORD_RECORDS.map((record) => {
    const resolution = factionResolutionOf(record.faction)!;
    const view = campaignFactionView(campaign.factions, record.faction);
    const stage: WarlordCodexStage = view.resolved
      ? "resolved"
      : campaign.completed.includes(resolution.mission) ||
          campaignNodeUnlocked(campaign, resolution.mission)
        ? "met"
        : "unknown";
    return {
      record,
      resolution,
      stage,
      location: storyNodeById(resolution.mission)!.location,
    };
  });
}

const HISTORY_ERRORS = historyCodexErrors();
if (HISTORY_ERRORS.length > 0)
  throw new Error(
    `Invalid campaign history codex: ${HISTORY_ERRORS.join("; ")}`,
  );
