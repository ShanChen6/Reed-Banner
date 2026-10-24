import { stat } from "node:fs/promises";
import path from "node:path";
import { ALL_COMPANIONS, mainCharacter } from "@/core";
import { portraitUrl } from "@/app/game/art/portrait-data";
import { partsOf, partUrl, rigIds, rigOf } from "@/app/game/stage/rigs";
import type { CharacterPreview, PreviewFile } from "./types";

/** Chỉ đọc file tĩnh lúc dựng trang; trình duyệt không cần API hay hồ sơ. */
export async function characterCatalog(): Promise<CharacterPreview[]> {
  const roster = [mainCharacter("moc"), ...ALL_COMPANIONS];
  return Promise.all(rigIds().map(async (id) => {
    const rig = rigOf(id)!;
    const character = roster.find((c) => c.id === id)!;
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
    const [portrait, standing] = await Promise.all([
      file(portraitUrl(id)), file(partUrl(rig, "standing")),
    ]);
    const attack = rig.skeleton === "warrior" ? rig.poses?.attack : undefined;
    const cast = rig.skeleton === "warrior" ? rig.poses?.cast : undefined;
    const ultimate = rig.skeleton === "warrior" ? rig.poses?.ultimate : undefined;
    const defeat = rig.skeleton === "warrior" ? rig.down : undefined;
    const files = [...layers, portrait, standing].filter((f): f is PreviewFile => f !== null);
    return {
      id, name: character.name, element: character.element, profession: character.profession,
      files, rigBytes: layers.reduce((sum, f) => sum + f!.bytes, 0),
      assets: [
        { kind: "portrait", label: "Avatar", file: portrait },
        { kind: "standing", label: "Ảnh đứng", file: standing },
        { kind: "attack", label: "Đánh thường", file: attack ? await file(partUrl(rig, attack.name)) : null },
        { kind: "cast", label: "Ra chiêu", file: cast ? await file(partUrl(rig, cast.name)) : null },
        { kind: "ultimate", label: "Tuyệt chiêu", file: ultimate ? await file(partUrl(rig, ultimate.name)) : null },
        { kind: "defeat", label: "Bị hạ gục", file: defeat ? await file(partUrl(rig, defeat.name)) : null },
      ],
    };
  }));
}
