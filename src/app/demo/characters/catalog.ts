import { stat } from "node:fs/promises";
import path from "node:path";
import { ALL_COMPANIONS, mainCharacter, type Element, type GameProfession } from "@/core";
import { portraitUrl } from "@/app/game/art/portrait-data";
import { partsOf, partUrl, rigIds, rigOf } from "@/app/game/stage/rigs";
import type { CharacterPreview, PreviewFile } from "./types";

/**
 * Nhân vật đã có bộ hình nhưng chưa có trong roster vì nghề chưa mở trong trận (Cung thủ, Sát thủ): trang xem thử vẫn
 * dựng hình động để duyệt tranh, không đưa vào shop hay trận đấu.
 */
const PREVIEW_ONLY: Readonly<Record<string, { readonly name: string; readonly element: Element; readonly profession: GameProfession }>> = {
  bachNoLang: { name: "Bạch Nỏ Lang", element: "kim", profession: "cungThu" },
  thanhLamXa: { name: "Thanh Lâm Xạ", element: "moc", profession: "cungThu" },
  lamGiangPhiDiep: { name: "Lam Giang Phi Diệp", element: "thuy", profession: "cungThu" },
  xichDiemLuan: { name: "Xích Diệm Luân", element: "hoa", profession: "cungThu" },
};

/** Chỉ đọc file tĩnh lúc dựng trang; trình duyệt không cần API hay hồ sơ. */
export async function characterCatalog(): Promise<CharacterPreview[]> {
  const roster = [mainCharacter("moc"), ...ALL_COMPANIONS];
  return Promise.all(rigIds().map(async (id) => {
    const rig = rigOf(id)!;
    const character = roster.find((c) => c.id === id) ?? PREVIEW_ONLY[id];
    if (!character) throw new Error(`${id} có rig nhưng không có trong roster`);
    const file = async (url: string | null): Promise<PreviewFile | null> => {
      if (!url) return null;
      try {
        const info = await stat(path.join(process.cwd(), "public", url));
        return { url, name: path.basename(url), bytes: info.size };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    };
    const layers = await Promise.all(partsOf(rig).map((name) => file(partUrl(rig, name))));
    if (layers.some((f) => !f)) throw new Error(`Thiếu lớp ảnh của ${id}`);
    const [portrait, standing, style] = await Promise.all([
      file(portraitUrl(id)), file(partUrl(rig, "standing")), file(partUrl(rig, "style")),
    ]);
    const attack = rig.skeleton === "warrior" ? rig.poses?.attack : undefined;
    const cast = rig.skeleton === "warrior" ? rig.poses?.cast : undefined;
    const ultimate = rig.skeleton === "warrior" ? rig.poses?.ultimate : undefined;
    const defeat = rig.skeleton === "warrior" ? rig.down : undefined;
    const files = [...layers, portrait, standing, style].filter((f): f is PreviewFile => f !== null);
    return {
      id, name: character.name, element: character.element, profession: character.profession, previewOnly: id in PREVIEW_ONLY,
      files, rigBytes: layers.reduce((sum, f) => sum + f!.bytes, 0),
      assets: [
        { kind: "portrait", label: "Avatar", file: portrait },
        { kind: "standing", label: "Ảnh đứng", file: standing },
        { kind: "attack", label: "Đánh thường", file: attack ? await file(partUrl(rig, attack.name)) : null },
        { kind: "cast", label: "Ra chiêu", file: cast ? await file(partUrl(rig, cast.name)) : null },
        { kind: "ultimate", label: "Tuyệt chiêu", file: ultimate ? await file(partUrl(rig, ultimate.name)) : null },
        { kind: "defeat", label: "Bị hạ gục", file: defeat ? await file(partUrl(rig, defeat.name)) : null },
        { kind: "style", label: "Phong thái", file: style },
      ],
    };
  }));
}
