import type { Metadata } from "next";
import Link from "next/link";
import { ELEMENTS, GEAR_SLOTS, mainCharacter, mainSkills, PROFESSIONS, professionSkills, STARTER_COMPANIONS, TIERS, TILE_KINDS } from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME, SLOT_NAME, SPECIAL_NAME, TIER_COLOR_NAME, TILE_NAME } from "@/app/game/battle/labels";
import { GearIcon } from "@/app/game/art/gear";
import { ElementIcon, FoodIcon, LeaderFlag, ProfessionIcon, ShieldIcon } from "@/app/game/art/icons";
import { Portrait } from "@/app/game/art/portraits";
import { SkillIcon } from "@/app/game/art/skills";
import { TILE_COLOR, TileArt } from "@/app/game/art/tiles";

export const metadata: Metadata = {
  title: "Bộ hình · Cờ Lau",
  description: "Toàn bộ hình ô cờ, nhân vật, kỹ năng, trang bị và biểu tượng của Cờ Lau.",
  robots: { index: false },
};

const ROSTER = [mainCharacter("moc"), ...STARTER_COMPANIONS];
const SKILL_ELEMENTS = ELEMENTS.filter((e) => mainSkills(e).length > 0);

/** Bảng xem nhanh mọi hình SVG của /demo, để duyệt art mà không phải chờ ô đặc biệt xuất hiện trong trận. */
export default function ArtPage() {
  return (
    <main className="demo-bg min-h-dvh bg-[#17110e] p-4 text-stone-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/demo/characters" className="text-sm text-amber-300 underline">Xem thử nhân vật có hình động →</Link>
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
          <h2 className="font-semibold">Nghề</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {PROFESSIONS.map((p) => (
              <span key={p} className="flex items-center gap-2">
                <ProfessionIcon profession={p} className="size-10" />
                <ProfessionIcon profession={p} className="size-4" />
                {PROFESSION_NAME[p]}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Nhân vật</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {ROSTER.map((f) => (
              <figure key={f.id} className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-2">
                  <Portrait id={f.id} element={f.element} profession={f.profession} className="size-20" />
                  <Portrait id={f.id} element={f.element} profession={f.profession} className="size-8" />
                </div>
                <figcaption className="text-center text-xs">
                  {f.name}
                  <br />
                  <span className="opacity-60">
                    {PROFESSION_NAME[f.profession]} · {ELEMENT_NAME[f.element]}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs opacity-70">Đinh Bộ Lĩnh đổi màu khung và đai áo theo hệ đã chọn:</p>
          <div className="flex flex-wrap gap-2">
            {ELEMENTS.map((e) => (
              <Portrait key={e} id="dinhBoLinh" element={e} profession="tuongSi" className="size-12" />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Kỹ năng nhân vật chính (ô 1–6, ô 5 là tuyệt chiêu)</h2>
          <div className="space-y-3">
            {SKILL_ELEMENTS.map((e) => (
              <div key={e} className="flex flex-wrap items-start gap-3">
                <span className="flex w-16 items-center gap-1 pt-3 text-sm">
                  <ElementIcon element={e} className="size-4" />
                  {ELEMENT_NAME[e]}
                </span>
                {mainSkills(e).map((d) => (
                  <figure key={d.id} className="flex w-20 flex-col items-center gap-1">
                    <SkillIcon def={d} className="size-12" />
                    <figcaption className="text-center text-[11px] leading-tight opacity-80">{d.name}</figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Chiêu nghề</h2>
          <div className="space-y-3">
            {PROFESSIONS.map((p) => (
              <div key={p} className="flex flex-wrap items-start gap-3">
                <span className="w-16 pt-3 text-sm">{PROFESSION_NAME[p]}</span>
                {professionSkills(p).map((d) => (
                  <figure key={d.id} className="flex w-20 flex-col items-center gap-1">
                    <SkillIcon def={d} className="size-12" />
                    <figcaption className="text-center text-[11px] leading-tight opacity-80">{d.name}</figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs opacity-70">
            Dấu góc: mũi tên xanh tăng chỉ số, mũi tên đỏ giảm chỉ số đối thủ, ba chấm vàng cả đội, ba chấm trên nền đỏ
            đánh cả đội đối thủ, tim hồi máu, khiên, sao gỡ hiệu ứng xấu, tia sét năng lượng, lửa thiêu đốt, bông tuyết
            đóng băng, mũi tên vòng phản đòn.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Trang bị: 9 ô theo phẩm (hệ Mộc)</h2>
          <div className="grid grid-cols-[auto_repeat(9,minmax(0,1fr))] items-center gap-2 text-xs">
            <span />
            {GEAR_SLOTS.map((s) => (
              <span key={s} className="text-center opacity-70">
                {SLOT_NAME[s]}
              </span>
            ))}
            {TIERS.map((t) => (
              <div key={t} className="contents">
                <span>{TIER_COLOR_NAME[t]}</span>
                {GEAR_SLOTS.map((s) => (
                  <GearIcon key={s} slot={s} element="moc" tier={t} className="mx-auto size-12" />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Vũ khí theo nghề và màu theo nguyên tố</h2>
          <div className="flex flex-wrap gap-3 text-xs">
            {PROFESSIONS.map((p) => (
              <figure key={p} className="flex flex-col items-center gap-1">
                <GearIcon slot="vuKhi" profession={p} element="moc" tier={3} className="size-14" />
                <figcaption className="opacity-80">{PROFESSION_NAME[p]}</figcaption>
              </figure>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ELEMENTS.map((e) => (
              <span key={e} className="flex items-center gap-1 text-xs">
                <GearIcon slot="ngocBoi" element={e} tier={4} className="size-10" />
                <GearIcon slot="gioiChi" element={e} tier={4} className="size-10" />
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
