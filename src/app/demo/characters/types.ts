import type { Element, GameProfession } from "@/core";

export interface PreviewFile {
  readonly url: string;
  readonly name: string;
  readonly bytes: number;
}

export interface CharacterPreview {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: GameProfession;
  /** Nhân vật chưa có trong roster (nghề chưa mở trong trận): chỉ xem hình ở trang này. */
  readonly previewOnly: boolean;
  /** Danh xưng thay cho tên nghề (nhân vật đặc biệt không thuộc một nghề). */
  readonly title?: string;
  readonly files: readonly PreviewFile[];
  readonly rigBytes: number;
  readonly assets: readonly {
    readonly kind: "portrait" | "standing" | "attack" | "cast" | "ultimate" | "defeat" | "style";
    readonly label: string;
    readonly file: PreviewFile | null;
  }[];
}
