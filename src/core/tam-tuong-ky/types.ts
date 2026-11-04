// Kiểu dữ liệu catalog Tầm Tướng Ký. Luật: docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md.

import type { Element, Profession } from "../battle";

export type NodeId = string;
export type RecipeId = string;

export type NodeKind = "element" | "material" | "knowledge" | "character";

/** Bậc tướng; số lần ghép tối thiểu cố định theo bậc: thường 7, đặc biệt 9, lịch sử 12 (Design Freeze A-11, P-5). */
export type HeroTier = "thuong" | "dacBiet" | "lichSu";

/**
 * Thứ mà công thức của một tướng được phép dựa vào (Shan, 04/11/2026): không dựa vào art nhân vật (vũ khí, trang phục,
 * phụ kiện) vì art sẽ đổi. `title`, `place` của tướng lịch sử cần nguồn sử.
 */
export type AnchorKind = "title" | "place" | "campaign" | "skill" | "lore";

export interface HeroAnchor {
  readonly kind: AnchorKind;
  readonly text: string;
}

/** Nghề và hệ mà một node “vai trò” biểu thị; tướng đặc biệt dung hợp dùng `hybrid`. Validator đối chiếu với roster. */
export interface RoleHint {
  readonly profession?: Profession;
  readonly element?: Element;
  readonly hybrid?: boolean;
}

/** Lời dẫn chế độ Hạng (Shan, 04/11/2026): mô tả tướng đề cử thay cho tên và chân dung. Không được chứa tên tướng. */
export interface HeroClue {
  readonly kind: "text" | "image";
  readonly text: string;
  /** Chỉ `image`: mã ảnh trong kho asset, khi có. */
  readonly imageRef?: string;
}

export interface CatalogNode {
  readonly id: NodeId;
  readonly kind: NodeKind;
  readonly nameVi: string;
  /** Nhóm cho gợi ý mức 1. */
  readonly hintGroup?: string;
  /** Chỉ starter: hệ tương ứng trong `ELEMENTS`. */
  readonly element?: Element;
  /** Chỉ tri thức: nghề mà tri thức này gợi tới, để validator cảnh báo công thức “Hệ + Nghề”. */
  readonly professionHint?: Profession;
  /** Node vai trò (nghề × hệ) dùng trong công thức cuối của tướng. */
  readonly role?: RoleHint;
  /** Chỉ tướng. */
  readonly characterId?: string;
  readonly tier?: HeroTier;
  /** Chỉ tướng lịch sử: mã nguồn trong `HISTORY_SOURCES` (Campaign). */
  readonly historySourceIds?: readonly string[];
  /** Chỉ tướng: gói nội dung (`pack-1`, `pack-2`…), để Tướng Lục chia mục khi gộp nhiều gói. */
  readonly pack?: string;
  /** Chỉ tướng: những gì công thức dựa vào (không có art). */
  readonly anchors?: readonly HeroAnchor[];
  /** Chỉ tướng: lời dẫn chế độ Hạng. */
  readonly clue?: HeroClue;
  /** Lý do biểu trưng, dùng cho audit và mô tả; không phải tiểu sử. */
  readonly note?: string;
}

/** Công thức có thứ tự: `first` ở ô trước, `second` ở ô sau (A-4). */
export interface Recipe {
  readonly id: RecipeId;
  readonly first: NodeId;
  readonly second: NodeId;
  readonly result: NodeId;
  /** Vì sao hai thứ này ra kết quả đó, đọc hiểu được. */
  readonly reason: string;
}

/** Thành tựu theo bộ tướng (A-13, P-20): đủ mọi tướng trong `heroIds` thì nhận vàng + huy hiệu một lần. */
export interface AchievementSet {
  readonly id: string;
  /** Tên thành tựu, cũng là tên huy hiệu. */
  readonly title: string;
  readonly gold: number;
  readonly heroIds: readonly NodeId[];
}

export interface Pack {
  readonly id: string;
  readonly nameVi: string;
  readonly contentVersion: number;
  /** `draft` chưa được phát hành; engine production chỉ dùng `published`. */
  readonly status: "draft" | "published";
  readonly nodes: readonly CatalogNode[];
  readonly recipes: readonly Recipe[];
  readonly achievementSets?: readonly AchievementSet[];
}

/** Thông tin tướng lấy từ roster, không chép vào catalog. */
export interface CharacterInfo {
  readonly profession: Profession;
  readonly element: Element;
  readonly tier: HeroTier;
}

export interface CatalogDeps {
  readonly character: (characterId: string) => CharacterInfo | undefined;
  readonly hasHistorySource: (sourceId: string) => boolean;
  /** Không có thì bỏ qua kiểm chân dung (ảnh nằm ở tầng app). */
  readonly hasPortrait?: (characterId: string) => boolean;
}

export type IssueCode =
  | "duplicateId"
  | "duplicateKey"
  | "mirrorSameResult"
  | "missingReference"
  | "selfResult"
  | "starterResult"
  | "unreachable"
  | "cycle"
  | "heroAsInput"
  | "heroRecipeCount"
  | "unknownCharacter"
  | "duplicateCharacter"
  | "tierMismatch"
  | "tierCombines"
  | "missingHistorySource"
  | "starterMismatch"
  | "missingPortrait"
  | "elementPlusProfession"
  | "unusedStarter"
  | "badAchievementSet"
  | "missingAnchor"
  | "roleMismatch"
  | "missingClue"
  | "clueSpoils";

export interface CatalogIssue {
  readonly severity: "error" | "warning";
  readonly code: IssueCode;
  readonly message: string;
  readonly ref?: string;
}
