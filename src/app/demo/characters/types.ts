import type { Element, Profession } from "@/core";

export interface PreviewFile {
  readonly url: string;
  readonly name: string;
  readonly bytes: number;
}

export interface CharacterPreview {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly files: readonly PreviewFile[];
  readonly rigBytes: number;
  readonly assets: readonly {
    readonly kind: "portrait" | "standing" | "attack" | "cast" | "ultimate" | "defeat";
    readonly label: string;
    readonly file: PreviewFile | null;
  }[];
}
