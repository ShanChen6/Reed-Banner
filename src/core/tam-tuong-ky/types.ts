// Kiểu dữ liệu catalog Tầm Tướng Ký. Luật: docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md.

import type { Element, Profession } from "../battle";

export type NodeId = string;
export type RecipeId = string;

export type NodeKind = "element" | "material" | "knowledge" | "character";

/** Bậc tướng; số lần ghép tối thiểu lịch sử > đặc biệt > thường (Design Freeze A-11, P-5). */
export type HeroTier = "thuong" | "dacBiet" | "lichSu";

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
  /** Chỉ tướng. */
  readonly characterId?: string;
  readonly tier?: HeroTier;
  /** Chỉ tướng lịch sử: mã nguồn trong `HISTORY_SOURCES` (Campaign). */
  readonly historySourceIds?: readonly string[];
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

export interface Pack {
  readonly id: string;
  readonly nameVi: string;
  readonly contentVersion: number;
  /** `draft` chưa được phát hành; engine production chỉ dùng `published`. */
  readonly status: "draft" | "published";
  readonly nodes: readonly CatalogNode[];
  readonly recipes: readonly Recipe[];
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
  | "tierOrder"
  | "missingHistorySource"
  | "starterMismatch"
  | "missingPortrait"
  | "tierRange"
  | "elementPlusProfession"
  | "unusedStarter";

export interface CatalogIssue {
  readonly severity: "error" | "warning";
  readonly code: IssueCode;
  readonly message: string;
  readonly ref?: string;
}
