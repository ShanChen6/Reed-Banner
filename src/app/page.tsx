import Link from "next/link";
import {
  BOARD_COLS,
  BOARD_ROWS,
  createRng,
  ELEMENTS,
  generateBoard,
  STANDARD_WEIGHTS,
  STARTER_COMPANIONS,
  type Tile,
  TILE_KINDS,
} from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME, SPECIAL_NAME, TILE_NAME } from "./demo/labels";
import { CloudCorner, DongSonBand, ElementIcon, LeaderFlag } from "./demo/art/icons";
import { Portrait } from "./demo/art/portraits";
import { TileArt } from "./demo/art/tiles";
import { FAQ, PROFESSION_PERK, TILE_GIVES } from "./home/data";
import ElementPicker from "./home/ElementPicker";

const NAV = [
  { href: "#gioi-thieu", label: "Cách chơi" },
  { href: "#nguyen-to", label: "7 hệ" },
  { href: "#doi-hinh", label: "Đội hình" },
  { href: "#che-do", label: "Chế độ" },
  { href: "#hoi-dap", label: "Hỏi đáp" },
];

/** Bàn cờ trang trí ở hero: sinh cố định theo seed nên server và client luôn giống nhau. */
function heroBoard(): (Tile | null)[] {
  const cells = [...generateBoard(createRng(1012), STANDARD_WEIGHTS).cells];
  const put = (row: number, col: number, special: Tile["special"]) => {
    const t = cells[row * BOARD_COLS + col];
    if (t) cells[row * BOARD_COLS + col] = { ...t, special };
  };
  put(2, 3, "strong");
  put(5, 8, "weak");
  put(6, 2, "weak");
  return cells;
}

const STEPS = [
  {
    n: "I",
    title: "Đổi ô, ghép từ 3",
    body: `Đổi chỗ hai ô kề nhau trên bàn ${BOARD_COLS}×${BOARD_ROWS} để ghép 3 ô cùng loại trở lên. Ô ghép được biến thành sát thương, máu, năng lượng hay lương thực.`,
  },
  {
    n: "II",
    title: "Tung một kỹ năng",
    body: "Trước khi đổi ô, mỗi lượt được dùng tối đa một kỹ năng bằng năng lượng tích từ ô âm dương. Đầy Nộ thì bị động của thủ lĩnh tự kích hoạt.",
  },
  {
    n: "III",
    title: "Dồn đối thủ vào thế",
    body: "Chuỗi rơi tạo ô đặc biệt và cho thêm một lượt. Giữ lương để sĩ khí hăng hái, khắc hệ để đòn đau hơn, hạ hết phe Tianwu để thắng.",
  },
];

const FEATURES: { tile: Tile; title: string; body: string }[] = [
  { tile: { kind: "kiem", special: "strong" }, title: "Ô đặc biệt", body: "Ghép chữ L, chữ T hay thẳng 5 để tạo ô bản yếu và bản mạnh, nổ tung cả vùng." },
  { tile: { kind: "trong" }, title: "Nộ và bị động", body: "Trống trận và đòn nhận vào tích Nộ. Đầy 100, bị động theo hệ bùng phát trong 3 lượt." },
  { tile: { kind: "banhChung" }, title: "Lương thực, sĩ khí", body: "Lương tụt mỗi lượt. No thì đánh mạnh hơn, đói thì yếu đi, cạn thì mất máu." },
  { tile: { kind: "amDuong" }, title: "6 nghề đồng đội", body: "Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư, mỗi nghề một nội tại riêng." },
  { tile: { kind: "vang", special: "weak" }, title: "Trang bị 5 phẩm", body: "9 ô trang bị, phẩm Trắng tới Cam. Đủ bộ được thưởng; ghép 3 món cùng bậc để nâng bậc." },
  { tile: { kind: "sach" }, title: "AI Tianwu", body: "Từ Dễ tới Ác mộng. AI chỉ thấy những gì bạn thấy và chịu cùng luật, không ăn gian." },
];

const MODES = [
  { name: "Chơi thử", body: "Offline, 3vs3 đấu Tianwu. Chọn hệ, độ khó và trang bị.", open: true },
  { name: "Thường", body: "Trận sinh ngẫu nhiên, chọn độ khó, nhận vàng và chiến lợi phẩm.", open: false },
  { name: "Chiến dịch", body: "Theo chân Đinh Bộ Lĩnh từ thuở cờ lau tập trận tới khi dẹp loạn 12 sứ quân.", open: false },
  { name: "Leo tháp", body: "Chuỗi trận khó dần, máu và lương mang sang tầng sau.", open: false },
  { name: "Sinh tồn", body: "Một bàn cờ, đối thủ kéo đến theo đợt, có báo trước đợt kế tiếp.", open: false },
];

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold)]">{kicker}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{title}</h2>
      <DongSonBand className="mx-auto mt-4 w-40" />
      {sub && <p className="mt-4 text-stone-400">{sub}</p>}
    </div>
  );
}

function PlayButton({ className = "", children = "Chơi ngay" }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link
      href="/demo"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-5 py-2.5 font-bold uppercase tracking-wider text-amber-50 shadow-[0_0_24px_-6px_#c0392b] transition hover:brightness-110 ${className}`}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  const board = heroBoard();
  return (
    <div className="demo-bg min-h-dvh bg-[var(--bg)] text-stone-100 [--bg:#17110e] [--frame:#5a1e14] [--gold:#d4a24c] [--panel:#271d18]">
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-stone-900 focus:p-2">
        Bỏ qua tới nội dung
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--gold)]/25 bg-[#17110e]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
            <LeaderFlag className="size-7" /> Cờ Lau
          </Link>
          <ul className="ml-auto hidden items-center gap-5 text-sm text-stone-300 md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-[var(--gold)]">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <PlayButton className="ml-auto px-3 py-1.5 text-sm md:ml-2" />
        </nav>
      </header>

      <main id="noi-dung">
        {/* Hero. Chưa có tranh minh họa: dùng bàn cờ thật dựng bằng SVG làm hình chính. */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#5a1e1499,transparent_60%),radial-gradient(ellipse_at_10%_90%,#d4a24c22,transparent_50%)]"
          />
          <CloudCorner className="pointer-events-none absolute left-3 top-3 size-12 opacity-60" />
          <CloudCorner className="pointer-events-none absolute bottom-3 right-3 size-12 rotate-180 opacity-60" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1.1fr] md:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--gold)]">Loạn 12 Sứ Quân · Thế kỷ X</p>
              <h1 className="mt-3 font-serif text-6xl font-black tracking-tight md:text-7xl">Cờ Lau</h1>
              <p className="mt-4 max-w-md text-lg text-stone-300">
                Game ghép ô chiến đấu theo lượt. Cầm cờ lau như Đinh Bộ Lĩnh thuở chăn trâu, dẫn đồng đội và dẹp loạn bằng những
                nước ghép khôn ngoan.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {NAV.slice(0, 4).map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="rounded-full border border-stone-700 px-3 py-1 text-stone-300 hover:border-[var(--gold)] hover:text-[var(--gold)]">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <PlayButton className="text-base">Chơi thử miễn phí</PlayButton>
                <a
                  href="#gioi-thieu"
                  className="inline-flex items-center rounded-lg border border-stone-600 px-5 py-2.5 font-semibold text-stone-200 hover:border-[var(--gold)]"
                >
                  Chơi thế nào?
                </a>
              </div>
              <p className="mt-5 text-sm text-stone-500">Chạy ngay trên trình duyệt · Máy tính và điện thoại xoay ngang · Không cần tài khoản</p>
            </div>

            <div className="relative">
              <div className="rounded-xl border-2 border-[var(--gold)] bg-[var(--frame)] p-1.5 shadow-[0_20px_60px_-15px_#000]">
                <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))` }}>
                  {board.map((t, i) => (
                    <div key={i} className="aspect-square rounded-[3px] bg-[#3a2c24]">
                      {t && <TileArt kind={t.kind} special={t.special} className={`size-full ${t.special === "strong" ? "tile-strong" : ""}`} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 flex items-end gap-1 md:-left-8">
                <Portrait id="dinhBoLinh" element="moc" profession="tuongSi" className="size-20 drop-shadow-lg md:size-24" />
                {STARTER_COMPANIONS.filter((c) => c.id === "haVan" || c.id === "maiThanh").map((c) => (
                  <Portrait key={c.id} id={c.id} element={c.element} profession={c.profession} className="size-12 drop-shadow-lg md:size-14" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="gioi-thieu" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Cách chơi" title="Ba bước một lượt" sub="Mỗi lượt có 30 giây. Đánh sai không bị phạt, chỉ là nước đổi bị trả lại." />
          <ol className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-stone-700/70 bg-[var(--panel)] p-6">
                <span className="font-serif text-4xl font-black text-[var(--gold)]">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-[var(--gold)]/40 bg-[var(--frame)]/40 p-6 text-center">
            <LeaderFlag className="size-10" />
            <p className="font-serif text-xl font-bold">Chọn hệ cho Đinh Bộ Lĩnh rồi vào trận</p>
            <p className="text-sm text-stone-400">Bản chơi thử chưa bật đồng hồ 30 giây, cứ thong thả tính nước.</p>
            <PlayButton />
          </div>
        </section>

        <section className="px-4 py-16">
          <SectionTitle kicker="Điểm nhấn" title="Không chỉ là ghép ô" />
          <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-2xl border border-stone-700/70 bg-[var(--panel)] p-5">
                <TileArt kind={f.tile.kind} special={f.tile.special} className="size-12 shrink-0" />
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-400">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-4 py-16">
          <SectionTitle kicker="Bàn cờ" title="Bảy loại ô" sub="Ô thường, bản yếu (chữ L, chữ T) và bản mạnh (thẳng 5)." />
          <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl border border-stone-700/70 bg-[var(--panel)]">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Ô</th>
                  <th className="px-4 py-3">Ghép được</th>
                  <th className="px-4 py-3">Bản yếu</th>
                  <th className="px-4 py-3">Bản mạnh</th>
                </tr>
              </thead>
              <tbody>
                {TILE_KINDS.map((k) => (
                  <tr key={k} className="border-t border-stone-800">
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 font-semibold">
                        <TileArt kind={k} className="size-9" />
                        {TILE_NAME[k]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-stone-300">{TILE_GIVES[k]}</td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 text-stone-400">
                        <TileArt kind={k} special="weak" className="size-7" />
                        {SPECIAL_NAME.weak[k]}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 text-stone-400">
                        <TileArt kind={k} special="strong" className="size-7" />
                        {SPECIAL_NAME.strong[k]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-center text-xs text-stone-500 md:hidden">Vuốt ngang để xem hết bảng.</p>
        </section>

        <section id="nguyen-to" className="scroll-mt-16 px-4 py-16">
          <SectionTitle
            kicker="7 nguyên tố"
            title="Đổi hệ, đổi lối đánh"
            sub={`${ELEMENTS.map((e) => ELEMENT_NAME[e]).join(", ")}. Nhân vật chính đổi nguyên tố trước mỗi trận, kéo theo bị động và cả bộ 6 kỹ năng.`}
          />
          <div className="mx-auto max-w-5xl">
            <ElementPicker />
          </div>
          <ul className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { k: "Khắc", v: "×1.25", body: "Đánh vào hệ mình khắc, sát thương tăng một phần tư." },
              { k: "Tương sinh", v: "×1.1", body: "Đánh vào hệ mình sinh ra, sát thương nhỉnh hơn một chút." },
              { k: "Trang bị cùng hệ", v: "×1.5", body: "Mặc đồ đúng hệ nhân vật, chỉ số trang bị tăng một nửa." },
            ].map((c) => (
              <li key={c.k} className="rounded-2xl border border-stone-700/70 bg-[var(--panel)] p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">{c.k}</p>
                <p className="font-serif text-3xl font-black text-[var(--gold)]">{c.v}</p>
                <p className="mt-1 text-sm text-stone-400">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="doi-hinh" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Đội hình" title="Thủ lĩnh và năm đồng đội" sub="Đánh 1vs1 một mình, hoặc 3vs3 cùng hai đồng đội. Chân dung hiện tại là hình tạm, sẽ thay bằng tranh vẽ." />
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <li className="flex flex-col items-center rounded-2xl border border-[var(--gold)]/60 bg-[var(--frame)]/40 p-4 text-center">
              <Portrait id="dinhBoLinh" element="moc" profession="tuongSi" className="size-20" />
              <p className="mt-2 font-bold">Đinh Bộ Lĩnh</p>
              <p className="text-xs text-[var(--gold)]">Thủ lĩnh · đổi được hệ</p>
              <p className="mt-2 text-xs text-stone-400">Chọn nghề trước trận, 7 kỹ năng theo nguyên tố.</p>
            </li>
            {STARTER_COMPANIONS.map((c) => (
              <li key={c.id} className="flex flex-col items-center rounded-2xl border border-stone-700/70 bg-[var(--panel)] p-4 text-center">
                <Portrait id={c.id} element={c.element} profession={c.profession} className="size-20" />
                <p className="mt-2 font-bold">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-stone-400">
                  <ElementIcon element={c.element} className="size-3.5" />
                  {PROFESSION_NAME[c.profession]} · {ELEMENT_NAME[c.element]}
                </p>
                <p className="mt-2 text-xs text-stone-400">{PROFESSION_PERK[c.profession]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="che-do" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Chế độ chơi" title="Từ trận thử tới chiến dịch" />
          <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MODES.map((m) => (
              <li
                key={m.name}
                className={`flex flex-col rounded-2xl border p-5 ${m.open ? "border-[var(--gold)] bg-[var(--frame)]/40" : "border-stone-700/70 bg-[var(--panel)]"}`}
              >
                <span
                  className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${m.open ? "bg-[var(--gold)] text-stone-950" : "bg-stone-800 text-stone-400"}`}
                >
                  {m.open ? "Đang mở" : "Sắp có"}
                </span>
                <h3 className="mt-3 font-serif text-xl font-bold">{m.name}</h3>
                <p className="mt-1 flex-1 text-sm text-stone-400">{m.body}</p>
                {m.open && <PlayButton className="mt-4 px-3 py-1.5 text-sm">Vào trận</PlayButton>}
              </li>
            ))}
          </ul>
        </section>

        <section id="hoi-dap" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Hỏi đáp" title="Câu hỏi thường gặp" />
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-stone-700/70 bg-[var(--panel)] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span aria-hidden className="text-[var(--gold)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 pt-6">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 border-[var(--gold)] bg-gradient-to-br from-[#5a1e14] to-[#271d18] px-6 py-12 text-center">
            <CloudCorner className="absolute left-3 top-3 size-10 opacity-70" />
            <CloudCorner className="absolute bottom-3 right-3 size-10 rotate-180 opacity-70" />
            <h2 className="font-serif text-3xl font-black md:text-4xl">Phất cờ lau, ra trận</h2>
            <p className="mx-auto mt-3 max-w-md text-stone-300">Một trận chơi thử chỉ mất vài phút, ngay trên trình duyệt.</p>
            <PlayButton className="mt-6 text-base">Chơi thử miễn phí</PlayButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--gold)]/25 px-4 py-10 text-sm text-stone-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-serif text-lg font-bold text-stone-200">
              <LeaderFlag className="size-6" /> Cờ Lau
            </p>
            <p className="mt-1">Mini game thuộc ShanVerse.</p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-[var(--gold)]">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/demo" className="hover:text-[var(--gold)]">
                Chơi thử
              </Link>
            </li>
            <li>
              <Link href="/play" className="hover:text-[var(--gold)]">
                Chơi online
              </Link>
            </li>
          </ul>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-xs">
          Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
        </p>
      </footer>
    </div>
  );
}
