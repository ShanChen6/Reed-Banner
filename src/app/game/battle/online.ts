// Gọi API trận online (/api/battles). Server có thẩm quyền: client chỉ gửi ý định và hiển thị kết quả.

import { profileActionPayload } from "@/core";
import type {
  ArenaMember,
  BattleEvent,
  BattleRewards,
  CampaignResult,
  RaidResult,
  RaidTier,
  TowerResult,
  SurvivalResult,
  DailyScore,
  FighterConfig,
  MatchAction,
  GearItem,
  BattleState,
  Difficulty,
  Element,
  LevelUp,
  MatchView,
  Profession,
  Profile,
  ProfileAction,
} from "@/core";

export interface OnlineResponse {
  readonly id?: string;
  readonly view?: MatchView;
  readonly events?: readonly BattleEvent[];
  readonly error?: string;
  /** Phần thưởng đã cộng vào hồ sơ trên server, chỉ có ở response làm trận kết thúc. */
  readonly outcome?: {
    readonly rewards: BattleRewards;
    readonly levelUps: readonly LevelUp[];
    readonly drop: GearItem | null;
    readonly soldFor: number;
    readonly campaign?: CampaignResult;
    readonly raid?: RaidResult;
    readonly tower?: TowerResult;
    readonly survival?: SurvivalResult;
    readonly daily?: {
      readonly score: DailyScore;
      readonly rank: number | null;
    };
    readonly arena?: ArenaResult;
  };
  /** Giờ server lúc trả lời (ms). */
  readonly now: number;
}

/** Trận online đang chơi dở, để tải lại trang vẫn tiếp tục được. */
export const ONLINE_BATTLE_KEY = "coLau.online.battle";

/**
 * View của server không có luồng ngẫu nhiên; gán 0 để dùng chung giao diện với bản offline. Client chỉ
 * dùng trạng thái này để hiển thị và kiểm tra trước nước đi, không bao giờ để sinh ô thật.
 */
export function toBattleState(view: MatchView): BattleState {
  return { ...view.battle, boardRng: 0, aiRng: 0 } as BattleState;
}

async function call(url: string, init?: RequestInit): Promise<OnlineResponse> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });
    return (await res.json()) as OnlineResponse;
  } catch {
    return { error: "network", now: Date.now() };
  }
}

export function createOnline(input: {
  mode: "1v1" | "3v3";
  element: Element;
  profession: Profession;
  companions: readonly string[];
  difficulty: Difficulty;
  /** Màn chiến dịch; server lấy thể thức, độ khó và đối thủ theo màn. */
  stage?: string;
  /** Đánh trùm: bậc trùm ở màn `stage`. */
  raid?: RaidTier;
  /** Leo tháp: đánh tầng kế tiếp. */
  tower?: true;
  /** Sinh tồn: bắt đầu lượt chơi mới. */
  survival?: true;
  /** Thử thách hằng ngày: đề của hôm nay. */
  daily?: true;
  /** Đấu trường: đánh đối thủ thứ mấy trong các đối thủ đang bày. */
  arena?: number;
}): Promise<OnlineResponse> {
  return call("/api/battles", { method: "POST", body: JSON.stringify(input) });
}

export function fetchOnline(id: string): Promise<OnlineResponse> {
  return call(`/api/battles/${encodeURIComponent(id)}`);
}

export function actOnline(
  id: string,
  seq: number,
  action: MatchAction,
): Promise<OnlineResponse> {
  return call(`/api/battles/${encodeURIComponent(id)}/actions`, {
    method: "POST",
    body: JSON.stringify({ seq, action }),
  });
}

/** Đề thử thách hôm nay, lượt của mình và bảng xếp hạng (GET /api/daily). */
export interface DailyResponse {
  readonly day?: string;
  readonly setup?: {
    readonly team: readonly FighterConfig[];
    readonly foes: readonly FighterConfig[];
    readonly stage: string;
    readonly difficulty: Difficulty;
  };
  readonly mine?: {
    readonly matchId: string;
    readonly result: DailyScore | null;
    readonly rank: number | null;
  } | null;
  readonly top?: readonly {
    readonly rank: number;
    readonly name: string;
    readonly mine: boolean;
    readonly score: DailyScore;
  }[];
  readonly error?: string;
}

export async function fetchDaily(): Promise<DailyResponse> {
  try {
    const res = await fetch("/api/daily", { cache: "no-store" });
    return (await res.json()) as DailyResponse;
  } catch {
    return { error: "network" };
  }
}

/** Kết quả đấu trường kèm phần thưởng cuối trận. */
export interface ArenaResult {
  readonly won: boolean;
  readonly opponent: string;
  readonly delta: number;
  readonly rating: number | null;
  readonly gold: number;
}

/** Trang đấu trường (GET/POST /api/arena). */
export interface ArenaResponse {
  readonly rating?: number;
  readonly rank?: number | null;
  readonly wins?: number;
  readonly losses?: number;
  readonly defenseWins?: number;
  readonly defenseLosses?: number;
  readonly attacksLeft?: number;
  readonly attacksPerDay?: number;
  readonly defense?: {
    readonly members: readonly ArenaMember[];
    readonly power: number;
  } | null;
  readonly offers?: readonly {
    readonly name: string;
    readonly rating: number;
    readonly members: readonly ArenaMember[];
    readonly power: number;
    readonly bot: boolean;
  }[];
  readonly error?: string;
}

/** Xem đấu trường; `action` đặt lại đội phòng thủ hoặc đổi đối thủ. */
export async function fetchArena(
  action?: "defend" | "refresh",
): Promise<ArenaResponse> {
  try {
    const res = await fetch("/api/arena", {
      cache: "no-store",
      ...(action
        ? {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action }),
          }
        : {}),
    });
    return (await res.json()) as ArenaResponse;
  } catch {
    return { error: "network" };
  }
}

export interface ProfileResponse {
  readonly profile?: Profile;
  readonly version?: number;
  readonly error?: string;
}

async function callProfile(init?: RequestInit): Promise<ProfileResponse> {
  try {
    const res = await fetch("/api/profile", {
      ...init,
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });
    return (await res.json()) as ProfileResponse;
  } catch {
    return { error: "network" };
  }
}

/** Hồ sơ tiến trình lưu trên server. */
export function fetchProfile(): Promise<ProfileResponse> {
  return callProfile();
}

/** Gửi một thao tác (nâng kỹ năng, mua nhân vật, trang bị…); server kiểm tra luật và trả hồ sơ mới. */
export function sendProfileAction(
  action: ProfileAction,
): Promise<ProfileResponse> {
  return callProfile({ method: "POST", body: JSON.stringify({ action: profileActionPayload(action) }) });
}

export const ONLINE_ERROR_TEXT: Record<string, string> = {
  network: "Mất kết nối tới server, thử lại",
  notFound: "Không tìm thấy trận",
  conflict: "Trận vừa được cập nhật ở nơi khác, đã tải lại",
  staleSeq: "Bàn cờ đã đổi (hết giờ?), đã tải lại",
  badRequest: "Yêu cầu không hợp lệ",
  dailyDone: "Hôm nay bạn đã đánh thử thách ngày rồi",
  arenaLimit: "Hôm nay bạn đã hết lượt đấu trường",
  arenaGone: "Đối thủ này không còn, hãy chọn đối thủ khác",
};
