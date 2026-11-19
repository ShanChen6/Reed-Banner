// Cẩm nang (/cam-nang): luật chi tiết chuyển từ trang giới thiệu khi thiết kế lại 19/11/2026 (Shan duyệt): điểm nhấn
// luật chơi, bảng bảy loại ô, nội tại tám nghề, bộ chọn hệ cho Đinh Bộ Lĩnh và hệ số khắc chế. Số liệu đọc thẳng từ @/core.

import type { Metadata } from "next";
import Link from "next/link";
import { PROFESSIONS, STARTER_COMPANIONS, TILE_KINDS, type SpecialGrade } from "@/core";
import { ELEMENT_DAMAGE } from "@/core/battle/elements";
import { PROFESSION_NAME, SPECIAL_NAME, TILE_NAME } from "../game/battle/labels";
import { ProfessionIcon } from "../game/art/icons";
import { PassiveIcon } from "../game/art/passives";
import { Portrait } from "../game/art/portraits";
import { TileArt } from "../game/art/tiles";
import ElementPicker from "../home/ElementPicker";
import { LANDING_CHAIN, PROFESSION_PERK, PROFESSION_ROLE, TILE_GIVES } from "../home/data";
import { MobilePlayBar, PlayButton, SectionTitle, SITE_WIDTH, SiteFooter, SiteHeader } from "../home/SiteChrome";

export const metadata: Metadata = {
  title: "Cẩm nang · Cờ Lau",
  description: "Luật chơi chi tiết của Cờ Lau: bảy loại ô, ô đặc biệt, Nộ, nội tại tám nghề, kỹ năng từng hệ và hệ số khắc chế.",
};

/**
 * Điểm nhấn luật chơi. Ảnh vẽ riêng ở public/art/highlights/<mã>.webp (prompt docs/06-art/prompts/icon-diem-nhan.md), không
 * dùng lại hình quân cờ (Shan 20/11/2026).
 */
const FEATURES: readonly { art: React.ReactNode; title: string; body: string }[] = [
  { art: <Highlight code="special" />, title: "Ô đặc biệt", body: "Ghép chữ L, chữ T hay thẳng 5 để tạo ô bản yếu và bản mạnh, nổ tung cả vùng." },
  { art: <Highlight code="rage" />, title: "Nộ và bị động", body: "Trống trận và đòn nhận vào tích Nộ. Đầy 100, bị động theo hệ của thủ lĩnh bùng phát trong 3 lượt." },
  { art: <Highlight code="morale" />, title: "Lương thực, sĩ khí", body: "Lương tụt mỗi lượt. No thì đánh mạnh hơn, đói thì yếu đi, cạn thì mất máu." },
  { art: <Highlight code="energy" />, title: "Năng lượng và kỹ năng", body: "Ô âm dương cho năng lượng. Mỗi lượt được dùng tối đa một kỹ năng trước khi đổi ô." },
  { art: <Highlight code="gear" />, title: "Trang bị 5 phẩm", body: "9 ô trang bị, phẩm Trắng tới Cam. Đủ bộ được thưởng; ghép 3 món cùng bậc để nâng bậc, cường hóa tới +5." },
  { art: <Highlight code="ai" />, title: "AI Tianwu", body: "Từ Dễ tới Ác mộng. AI chỉ thấy những gì bạn thấy và chịu cùng luật, không ăn gian." },
];

/** Ảnh điểm nhấn (192 px, tấm bảng ngọc viền vàng). */
function Highlight({ code }: { code: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/highlights/${code}.webp`} alt="" aria-hidden className="size-14" loading="lazy" decoding="async" />;
}

const SPECIAL_GRADES: readonly SpecialGrade[] = ["weak", "strong"];

const pct = (n: number) => `×${String(n).replace(".", ",")}`;

export default function GuidePage() {
  const companion = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id);
  return (
    <div className="demo-bg min-h-dvh bg-[var(--background)] text-on-wood">
      <SiteHeader />
      <main id="content" className="pt-10">
        <SectionTitle kicker="Cẩm nang" title="Cẩm nang chiến trận" sub="Luật chung của các chế độ đánh trận ghép ô (Thao Luyện, Bình Loạn, Giao Tranh, các tháp, Trấn Ải, Nhật Lệnh, Quần Hùng, Viễn Chinh). Chế độ giải đố và mọi chế độ khác có màn Hướng dẫn riêng ngay trong game." />

        {/* Đánh trận ghép ô: ba bước một lượt, mỗi bước một hình minh họa thật của game. */}
        <section id="how-to-play" aria-labelledby="how-title" className="scroll-mt-16 px-4 py-10">
          <SectionTitle id="how-title" kicker="Cách chơi" title="Ba bước một lượt" sub="Mỗi lượt có 30 giây. Đánh sai không bị phạt, nước đổi không ghép được chỉ bị trả lại." />
          <ol className={`mx-auto grid gap-5 lg:grid-cols-3 ${SITE_WIDTH}`}>
            <li className="flex flex-col gap-4 rounded-2xl fx-panel p-6">
              <StepHead n="I" title="Đổi ô, ghép từ ba" />
              <div aria-hidden className="flex items-center justify-center gap-1.5 rounded-xl bg-black/25 p-4">
                {(["kiem", "kiem", "tim", "kiem"] as const).map((k, i) => (
                  <TileArt key={i} kind={k} className={`size-12 ${i === 2 ? "ring-2 ring-frame-gold-hi rounded-md" : ""}`} />
                ))}
                <span className="mx-1 text-2xl text-frame-gold">⇄</span>
                <TileArt kind="kiem" special="strong" className="tile-strong size-12" />
              </div>
              <p className="text-sm leading-relaxed text-on-wood-soft">
                Đổi chỗ hai ô kề nhau để ghép ba ô cùng loại trở lên. Mỗi loại ô cho một thứ:{" "}
                {TILE_KINDS.slice(0, 4).map((k) => TILE_NAME[k].toLowerCase()).join(", ")}… Ghép bốn, năm ô tạo ô đặc biệt và thêm lượt.
              </p>
            </li>
            <li className="flex flex-col gap-4 rounded-2xl fx-panel p-6">
              <StepHead n="II" title="Tích Nộ, tung kỹ năng" />
              <div aria-hidden className="flex flex-col gap-2.5 rounded-xl bg-black/25 p-4">
                <Meter label="Năng lượng" value={80} tone="from-sky-700 to-sky-300" />
                <Meter label="Nộ" value={100} tone="from-frame-bronze to-frame-gold-hi" />
                <div className="flex items-center gap-2 text-sm">
                  <TileArt kind="amDuong" className="size-8" />
                  <span>Ô âm dương cho năng lượng; trống trận và đòn nhận vào tích Nộ.</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-wood-soft">
                Mỗi tướng có sáu kỹ năng. Trước khi đổi ô được dùng một kỹ năng; đầy Nộ thì bị động theo hệ của thủ lĩnh bùng phát ba lượt.
              </p>
            </li>
            <li className="flex flex-col gap-4 rounded-2xl fx-panel-hi p-6">
              <StepHead n="III" title="Đồng đội phản ứng thành chuỗi" />
              <ol aria-label="Ví dụ một chuỗi Hợp Kích" className="flex flex-col gap-1.5 rounded-xl bg-black/25 p-3">
                {LANDING_CHAIN.map((s, i) => {
                  const c = companion(s.who);
                  return (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <Portrait id={s.who} element={c?.element ?? "moc"} profession={c?.profession ?? "tuongSi"} className="size-9 shrink-0" />
                      {s.passive && <PassiveIcon id={s.passive} name={s.what} className="size-7 shrink-0" />}
                      <span className="min-w-0">
                        <b>{s.name}</b> {s.what} <span className="text-on-wood-soft">· {s.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="text-sm leading-relaxed text-on-wood-soft">
                Một kỹ năng phát tín hiệu (gây mất máu, phá giáp, khống chế…), bị động của đồng đội bắt tín hiệu và đánh tiếp. Ghép đội
                hợp nhau ở{" "}
                <Link href="/game/combos" className="text-frame-gold underline underline-offset-2 hover:brightness-125">
                  Hợp Kích
                </Link>
                .
              </p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="g-rules" className="px-4 py-10">
          <h2 id="g-rules" className="sr-only">Điểm nhấn luật chơi</h2>
          <ul className={`mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${SITE_WIDTH}`}>
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-2xl fx-panel p-5">
                <span className="shrink-0">{f.art}</span>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-wood-soft">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="g-tiles" className="px-4 py-10">
          <SectionTitle id="g-tiles" kicker="Bàn cờ" title="Bảy loại ô" sub="Ô thường, bản yếu (chữ L, chữ T) và bản mạnh (thẳng 5)." />
          <div className={`mx-auto overflow-x-auto rounded-2xl fx-panel ${SITE_WIDTH}`}>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-kicker text-on-wood-soft">
                <tr>
                  <th className="px-4 py-3">Ô</th>
                  <th className="px-4 py-3">Ghép được</th>
                  {SPECIAL_GRADES.map((g) => (
                    <th key={g} className="px-4 py-3">{g === "weak" ? "Bản yếu" : "Bản mạnh"}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TILE_KINDS.map((k) => (
                  <tr key={k} className="border-t border-frame-line-soft">
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 font-semibold">
                        <TileArt kind={k} className="size-10" />
                        {TILE_NAME[k]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-wood-soft">{TILE_GIVES[k]}</td>
                    {SPECIAL_GRADES.map((g) => (
                      <td key={g} className="px-4 py-2">
                        <span className="flex items-center gap-2 text-on-wood-soft">
                          <TileArt kind={k} special={g} className={`size-10 ${g === "strong" ? "tile-strong" : ""}`} />
                          {SPECIAL_NAME[g][k]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-center text-xs text-on-wood-soft/80 md:hidden">Vuốt ngang để xem hết bảng.</p>
        </section>

        <section aria-labelledby="g-prof" className="px-4 py-10">
          <SectionTitle id="g-prof" kicker="Nghề" title={`${PROFESSIONS.length} nghề, nội tại riêng`} sub="Nội tại nghề luôn có hiệu lực, cộng thêm sáu kỹ năng và bốn bị động của từng tướng." />
          <ul className={`mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${SITE_WIDTH}`}>
            {PROFESSIONS.map((p) => (
              <li key={p} className="flex flex-col gap-2 rounded-2xl fx-panel p-5">
                <span className="flex items-center gap-2 font-serif text-lg font-bold">
                  <ProfessionIcon profession={p} className="size-7" />
                  {PROFESSION_NAME[p]}
                </span>
                <p className="text-sm text-frame-gold">{PROFESSION_ROLE[p]}</p>
                <p className="text-sm text-on-wood-soft">Nội tại: {PROFESSION_PERK[p]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="elements" aria-labelledby="g-el" className="scroll-mt-16 px-4 py-10">
          <SectionTitle id="g-el" kicker="7 nguyên tố" title="Đổi hệ, đổi lối đánh" sub="Chủ tướng đổi nguyên tố trước mỗi trận, kéo theo bị động và cả bộ 6 kỹ năng." />
          <div className={`mx-auto ${SITE_WIDTH}`}>
            <ElementPicker />
          </div>
          <ul className={`mx-auto mt-8 grid gap-4 md:grid-cols-3 ${SITE_WIDTH}`}>
            {[
              { k: "Khắc", v: pct(ELEMENT_DAMAGE.counter), body: "Đánh vào hệ mình khắc, sát thương tăng một phần tư." },
              { k: "Tương sinh", v: pct(ELEMENT_DAMAGE.generate), body: "Đánh vào hệ mình sinh ra, sát thương nhỉnh hơn một chút." },
              { k: "Bị khắc", v: pct(ELEMENT_DAMAGE.countered), body: "Đánh vào hệ khắc mình, sát thương giảm một phần tư." },
            ].map((c) => (
              <li key={c.k} className="rounded-2xl fx-panel p-5">
                <p className="text-kicker text-on-wood-soft">{c.k}</p>
                <p className="fx-gilt-text font-serif text-3xl font-black">{c.v}</p>
                <p className="mt-1 text-sm text-on-wood-soft">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-4 pb-20 pt-6 text-center">
          <PlayButton className="text-base">Vào trận thử</PlayButton>
        </section>
      </main>
      <SiteFooter />
      <MobilePlayBar />
    </div>
  );
}

function StepHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="fx-gilt-text font-serif text-4xl font-black">{n}</span>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-on-wood-soft">{label}</span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/50">
        <span className={`block h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="w-10 text-right tabular-nums">{value}</span>
    </div>
  );
}
