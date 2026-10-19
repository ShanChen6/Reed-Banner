import type { Metadata } from "next";
import { ELEMENTS, TILE_KINDS } from "@/core";
import { ELEMENT_NAME, SPECIAL_NAME, TILE_NAME } from "../labels";
import { ElementIcon, FoodIcon, LeaderFlag, ShieldIcon } from "./icons";
import { TILE_COLOR, TileArt } from "./tiles";

export const metadata: Metadata = {
  title: "Bộ hình · Cờ Lau",
  description: "Toàn bộ hình ô cờ, ô đặc biệt và biểu tượng nguyên tố của Cờ Lau.",
  robots: { index: false },
};

/** Bảng xem nhanh mọi hình SVG của /demo, để duyệt art mà không phải chờ ô đặc biệt xuất hiện trong trận. */
export default function ArtPage() {
  return (
    <main className="demo-bg min-h-dvh bg-[#17110e] p-4 text-stone-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <LeaderFlag className="size-7" /> Bộ hình Cờ Lau
        </h1>

        <section className="space-y-2">
          <h2 className="font-semibold">Ô cờ: thường, bản yếu (chữ L/T), bản mạnh (thẳng 5)</h2>
          <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-x-4 gap-y-2 text-sm">
            <span />
            <span className="opacity-60">Thường</span>
            <span className="opacity-60">Bản yếu</span>
            <span className="opacity-60">Bản mạnh</span>
            {TILE_KINDS.map((k) => (
              <div key={k} className="contents">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-sm" style={{ background: TILE_COLOR[k] }} />
                  {TILE_NAME[k]}
                </span>
                <figure className="flex items-center gap-2">
                  <TileArt kind={k} className="size-14" />
                  <TileArt kind={k} className="size-10" />
                </figure>
                <figure className="flex items-center gap-2">
                  <TileArt kind={k} special="weak" className="size-14" />
                  <figcaption className="text-xs opacity-70">{SPECIAL_NAME.weak[k]}</figcaption>
                </figure>
                <figure className="flex items-center gap-2">
                  <TileArt kind={k} special="strong" className="tile-strong size-14" />
                  <figcaption className="text-xs opacity-70">{SPECIAL_NAME.strong[k]}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Nguyên tố</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {ELEMENTS.map((e) => (
              <span key={e} className="flex items-center gap-2">
                <ElementIcon element={e} className="size-10" />
                <ElementIcon element={e} className="size-4" />
                {ELEMENT_NAME[e]}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Biểu tượng giao diện</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <LeaderFlag className="size-8" /> Cờ lau (thủ lĩnh)
            </span>
            <span className="flex items-center gap-2">
              <FoodIcon className="size-8" /> Lương thực
            </span>
            <span className="flex items-center gap-2">
              <ShieldIcon className="size-8" /> Khiên
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
