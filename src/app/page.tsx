import { Badge, buttonVariants } from "@/components/ui";
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
import { ELEMENT_NAME, PROFESSION_NAME, SPECIAL_NAME, TILE_NAME } from "./game/battle/labels";
import { ElementIcon, LeaderFlag } from "./game/art/icons";
import { Logo, LogoMark } from "./game/art/logo";
import Image from "next/image";
import { Portrait } from "./game/art/portraits";
import { ModeIcon, type ModeIconKind } from "./game/art/mode-icons";
import { BoardCrest, TileArt } from "./game/art/tiles";
import { towerFeatureFlags, type TowerFeatureFlags } from "@/server/featureFlags";
import { FAQ, PROFESSION_PERK, TILE_GIVES } from "./home/data";
import ContactBlock from "./game/ContactBlock";
import { socialLinks } from "./game/footerLinks";
import DrumFace from "./home/DrumFace";
import ElementPicker from "./home/ElementPicker";
import { Embers, GiltCorners, OrnateDivider } from "./home/Ornaments";

const NAV = [
  { href: "#how-to-play", label: "Cách chơi" },
  { href: "#elements", label: "7 hệ" },
  { href: "#roster", label: "Đội hình" },
  { href: "#modes", label: "Chế độ" },
  { href: "#faq", label: "Hỏi đáp" },
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

/** Các chế độ đang có trong màn chơi /game (cùng danh sách với MenuScene). `flag`: chế độ bật bằng biến môi trường lúc build. */
const MODES: readonly { slug: ModeIconKind; name: string; body: string; flag?: keyof TowerFeatureFlags }[] = [
  { slug: "practice", name: "Thao Luyện", body: "Vào trận ngay, không cần mạng, 3vs3 đấu Tianwu với đội cấp tối đa. Không cần tài khoản." },
  { slug: "play", name: "Giao Tranh", body: "Trận trực tuyến có đồng hồ 30 giây, nhận vàng, kinh nghiệm và chiến lợi phẩm." },
  { slug: "campaign", name: "Bình Loạn", body: "Sáu chương dẹp loạn 12 sứ quân, tướng lịch sử gia nhập, rồi Tái đấu sứ quân bị đánh dẹp ở 3 bậc." },
  { slug: "trial", name: "Tháp Thí Luyện", body: "20 tầng cố định, tự chọn đội và luật riêng từng tầng.", flag: "trial" },
  { slug: "destiny", name: "Tháp Thiên Mệnh", body: "Khóa đội hình theo chu kỳ, giữ máu và lương xuyên tầng.", flag: "destiny" },
  { slug: "survival", name: "Trấn Ải", body: "Một bàn cờ, đối thủ kéo đến theo đợt, nghỉ giữa đợt để tính tiếp." },
  { slug: "daily", name: "Nhật Lệnh", body: "Một đề chung cho mọi người, mỗi ngày một lần, có bảng xếp hạng." },
  { slug: "arena", name: "Quần Hùng", body: "Đánh đội phòng thủ của người chơi khác, leo điểm mỗi ngày." },
];


function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-kicker text-frame-gold">{kicker}</p>
      <h2 className="fx-gilt-text mt-2 text-heading">{title}</h2>
      <OrnateDivider className="mx-auto mt-4 w-56" />
      {sub && <p className="mt-4 text-on-wood-soft">{sub}</p>}
    </div>
  );
}

function PlayButton({ className = "", children = "Chơi ngay" }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link
      href="/game"
      className={buttonVariants({ variant: "ornate", className: `fx-btn uppercase tracking-wider ${className}` })}
    >
      {children}
    </Link>
  );
}

/** Ba tranh Đinh Bộ Lĩnh (public/art/splash/), kích thước gốc để next/image giữ đúng tỉ lệ. */
const DBL_ERAS = [
  { src: "/art/splash/dinh-bo-linh-nien-thieu.webp", w: 570, title: "Thiếu niên", note: "Cờ lau tập trận bên sông Hoàng Long." },
  { src: "/art/splash/dinh-bo-linh-tuong-quan.webp", w: 569, title: "Tướng quân", note: "Hình trong trận: áo choàng bay, chém kiếm." },
  { src: "/art/splash/dinh-bo-linh-hoang-de.webp", w: 597, title: "Hoàng đế", note: "Đinh Tiên Hoàng, dựng nước Đại Cồ Việt." },
] as const;

export default function Home() {
  const board = heroBoard();
  const flags = towerFeatureFlags();
  return (
    <div className="demo-bg min-h-dvh bg-[var(--background)] text-on-wood">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-wood-lo focus:p-2">
        Bỏ qua tới nội dung
      </a>

      <header className="sticky top-0 z-40 border-b border-frame-gold/40 bg-wood-lo/90 shadow-[0_8px_24px_-12px_var(--black)] backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-black">
            <LogoMark className="size-8" /> <span className="fx-gilt-text">Cờ Lau</span>
          </Link>
          <ul className="ml-auto hidden items-center gap-5 text-sm text-on-wood-soft md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-[var(--primary)]">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/game/login" className="ml-auto text-sm text-on-wood-soft hover:text-[var(--primary)] md:ml-2">
            Đăng nhập
          </Link>
          <PlayButton className="px-3 py-1.5 text-sm" />
        </nav>
      </header>

      <main id="content">
        {/* Hero: tranh trời trống đồng và chim lạc làm nền, mặt trống khắc vạch xoay chậm đè đúng lên trống trong tranh,
            tâm sao sáng nhịp, bàn cờ thật dựng bằng SVG làm hình chính. */}
        <section className="relative overflow-hidden border-b border-frame-gold/20">
          <div aria-hidden className="pointer-events-none absolute inset-0 [container-type:size]">
            {/* Khung giữ đúng tỉ lệ tranh và phủ kín phần mở đầu (như object-cover), để lớp trống xoay luôn trùng trống trong tranh. */}
            <div className="hero-art absolute left-1/2 top-1/2 aspect-[1916/821] -translate-x-1/2 -translate-y-1/2">
              <Image src="/art/hero/troi-trong-dong.webp" alt="" fill priority sizes="(min-width: 768px) 100vw, 250vw" className="object-cover" />
              <div className="absolute left-[50.9%] top-[48%] w-[47%] -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen">
                <DrumFace className="drum-spin h-auto w-full" />
              </div>
              <div className="hero-star absolute left-[50.9%] top-[48%] aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </div>
          </div>
          {/* Lớp tối phía chữ để đọc rõ; trên điện thoại chữ phủ cả bề ngang nên tối đều. */}
          <div aria-hidden className="hero-shade pointer-events-none absolute inset-0" />
          <Embers />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1.1fr] md:py-20">
            <div>
              <h1 className="-mx-4 -mt-6 max-w-[520px] md:-mx-8">
                <Logo priority className="h-auto w-full" />
              </h1>
              <p className="mt-4 max-w-md text-lg text-on-wood-soft">
                Game ghép ô chiến đấu theo lượt. Cầm cờ lau như Đinh Bộ Lĩnh thuở chăn trâu, dẫn đồng đội và dẹp loạn bằng những
                nước ghép khôn ngoan.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {NAV.slice(0, 4).map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="rounded-full border border-frame-gold/35 bg-wood-inset px-3 py-1 text-on-wood-soft hover:border-frame-gold hover:text-[var(--primary)]">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <PlayButton className="text-base">Chơi thử miễn phí</PlayButton>
                <a
                  href="#how-to-play"
                  className="fx-btn-ghost inline-flex items-center rounded-lg px-5 py-2.5 font-semibold text-title-on-wood transition hover:brightness-125"
                >
                  Chơi thế nào?
                </a>
              </div>
              <p className="mt-5 text-sm text-on-wood-soft/80">Chạy ngay trên trình duyệt · Máy tính và điện thoại xoay ngang · Không cần tài khoản</p>
            </div>

            {/* Chân dung thủ lĩnh đè lên góc dưới trái bàn cờ (tâm đúng góc khung), hai đồng đội đứng dưới mép khung, không che ô nào. */}
            <div className="relative mb-14 ml-8 md:mb-12 md:ml-6">
              <div className="fx-frame relative rounded-xl p-2">
                <GiltCorners size="size-10 md:size-14" skip="bottomLeft" />
                <BoardCrest className="pointer-events-none absolute left-1/2 top-0 z-10 h-9 w-44 -translate-x-1/2 -translate-y-[62%] md:h-12 md:w-60" />
                {/* Lòng bàn cờ như trong trận: nền đá phiến sẫm dưới ô xanh đá phiến, nút hoa đồng ở giao điểm. */}
                <div className="fx-board-well relative grid gap-0.5 overflow-hidden rounded-md p-0.5" style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))` }}>
                  {board.map((t, i) => (
                    <div key={i} className="aspect-square rounded-md">
                      {t && <TileArt kind={t.kind} special={t.special} className={`size-full ${t.special === "strong" ? "tile-strong" : ""}`} />}
                    </div>
                  ))}
                  <div
                    aria-hidden
                    className="board-knots pointer-events-none absolute inset-px"
                    style={{ backgroundSize: `calc(100% / ${BOARD_COLS}) calc(100% / ${BOARD_ROWS})` }}
                  />
                </div>
              </div>
              <Portrait
                id="dinhBoLinh"
                element="moc"
                profession="tuongSi"
                className="absolute bottom-0 left-0 z-20 size-20 -translate-x-1/2 translate-y-1/2 drop-shadow-[0_6px_10px_color-mix(in_srgb,var(--black)_80%,transparent)] md:size-28"
              />
              <div className="absolute left-12 top-full mt-2 flex gap-1.5 md:left-16">
                {STARTER_COMPANIONS.filter((c) => c.id === "haVan" || c.id === "maiThanh").map((c) => (
                  <Portrait key={c.id} id={c.id} element={c.element} profession={c.profession} className="size-10 drop-shadow-lg md:size-12" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ba thời của nhân vật chính, từ cậu bé cờ lau tới hoàng đế. */}
        <section id="hero-story" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Chủ tướng" title="Đinh Bộ Lĩnh qua ba thời" sub="Từ cậu bé chăn trâu cầm cờ lau, thành vị tướng dẹp loạn sứ quân, rồi lên ngôi hoàng đế." />
          <ul className="mx-auto grid max-w-5xl grid-cols-3 gap-3 md:gap-6">
            {DBL_ERAS.map((e) => (
              <li key={e.src} className="flex flex-col items-center justify-end rounded-2xl fx-panel-hi p-2 text-center md:p-4">
                <Image src={e.src} alt={`Đinh Bộ Lĩnh ${e.title}`} width={e.w} height={900} sizes="(min-width: 768px) 300px, 30vw" className="h-auto w-full drop-shadow-[0_12px_20px_color-mix(in_srgb,var(--black)_67%,transparent)]" />
                <p className="mt-2 font-serif text-base font-bold md:text-lg">{e.title}</p>
                <p className="hidden text-xs text-on-wood-soft sm:block">{e.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-to-play" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Cách chơi" title="Ba bước một lượt" sub="Mỗi lượt có 30 giây. Đánh sai không bị phạt, chỉ là nước đổi bị trả lại." />
          <ol className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl fx-panel p-6">
                <span className="fx-gilt-text font-serif text-4xl font-black">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-wood-soft">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 rounded-2xl fx-panel-hi p-6 text-center">
            <LeaderFlag className="size-10" />
            <p className="font-serif text-xl font-bold">Chọn hệ cho Đinh Bộ Lĩnh rồi vào trận</p>
            <p className="text-sm text-on-wood-soft">Bản chơi thử chưa bật đồng hồ 30 giây, cứ thong thả tính nước.</p>
            <PlayButton />
          </div>
        </section>

        <section className="px-4 py-16">
          <SectionTitle kicker="Điểm nhấn" title="Không chỉ là ghép ô" />
          <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-2xl fx-panel p-5">
                <TileArt kind={f.tile.kind} special={f.tile.special} className="size-12 shrink-0" />
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-wood-soft">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-4 py-16">
          <SectionTitle kicker="Bàn cờ" title="Bảy loại ô" sub="Ô thường, bản yếu (chữ L, chữ T) và bản mạnh (thẳng 5)." />
          <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl fx-panel">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-kicker text-on-wood-soft">
                <tr>
                  <th className="px-4 py-3">Ô</th>
                  <th className="px-4 py-3">Ghép được</th>
                  <th className="px-4 py-3">Bản yếu</th>
                  <th className="px-4 py-3">Bản mạnh</th>
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
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 text-on-wood-soft">
                        <TileArt kind={k} special="weak" className="size-10" />
                        {SPECIAL_NAME.weak[k]}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2 text-on-wood-soft">
                        <TileArt kind={k} special="strong" className="tile-strong size-10" />
                        {SPECIAL_NAME.strong[k]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-center text-xs text-on-wood-soft/80 md:hidden">Vuốt ngang để xem hết bảng.</p>
        </section>

        <section id="elements" className="scroll-mt-16 px-4 py-16">
          <SectionTitle
            kicker="7 nguyên tố"
            title="Đổi hệ, đổi lối đánh"
            sub={`${ELEMENTS.map((e) => ELEMENT_NAME[e]).join(", ")}. Chủ tướng đổi nguyên tố trước mỗi trận, kéo theo bị động và cả bộ 6 kỹ năng.`}
          />
          <div className="mx-auto max-w-5xl">
            <ElementPicker />
          </div>
          <ul className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { k: "Khắc", v: "×1.25", body: "Đánh vào hệ mình khắc, sát thương tăng một phần tư." },
              { k: "Tương sinh", v: "×1.1", body: "Đánh vào hệ mình sinh ra, sát thương nhỉnh hơn một chút." },
              { k: "Trang bị cùng hệ", v: "×1.5", body: "Mặc đồ đúng hệ tướng quân, chỉ số trang bị tăng một nửa." },
            ].map((c) => (
              <li key={c.k} className="rounded-2xl fx-panel p-5">
                <p className="text-kicker text-on-wood-soft">{c.k}</p>
                <p className="fx-gilt-text font-serif text-3xl font-black">{c.v}</p>
                <p className="mt-1 text-sm text-on-wood-soft">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="roster" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Đội hình" title="Thủ lĩnh và năm đồng đội" sub="Đánh 1vs1 một mình, hoặc 3vs3 cùng hai đồng đội. Chân dung hiện tại là hình tạm, sẽ thay bằng tranh vẽ." />
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <li className="flex flex-col items-center rounded-2xl fx-panel-hi p-4 text-center">
              <Portrait id="dinhBoLinh" element="moc" profession="tuongSi" className="size-20" />
              <p className="mt-2 font-bold">Đinh Bộ Lĩnh</p>
              <p className="text-xs text-[var(--primary)]">Thủ lĩnh · đổi được hệ</p>
              <p className="mt-2 text-xs text-on-wood-soft">Chọn nghề và hệ trước trận: 3 chiêu nghề, 2 chiêu hệ, 1 tuyệt chiêu và bị động thủ lĩnh.</p>
            </li>
            {STARTER_COMPANIONS.map((c) => (
              <li key={c.id} className="flex flex-col items-center rounded-2xl fx-panel p-4 text-center">
                <Portrait id={c.id} element={c.element} profession={c.profession} className="size-20" />
                <p className="mt-2 font-bold">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-on-wood-soft">
                  <ElementIcon element={c.element} className="size-3.5" />
                  {PROFESSION_NAME[c.profession]} · {ELEMENT_NAME[c.element]}
                </p>
                <p className="mt-2 text-xs text-on-wood-soft">{PROFESSION_PERK[c.profession]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="modes" className="scroll-mt-16 px-4 py-16">
          <SectionTitle
            kicker="Chế độ chơi"
            title="Từ Thao Luyện tới Bình Loạn"
            sub="Chơi bằng tài khoản khách ngay, tiến trình gắn với trình duyệt. Đăng nhập để giữ tiến trình trên mọi máy."
          />
          <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((m) => {
              const open = !m.flag || flags[m.flag];
              const body = (
                <>
                  <span className="flex items-center gap-3">
                    <ModeIcon kind={m.slug} className="size-10 shrink-0" />
                    <span className="font-serif text-xl font-bold">{m.name}</span>
                    {!open && (
                      <Badge className="ml-auto uppercase tracking-wider">Sắp có</Badge>
                    )}
                  </span>
                  <span className="mt-2 flex-1 text-sm text-on-wood-soft">{m.body}</span>
                  {open && <span className="mt-3 text-sm font-semibold text-[var(--primary)] group-hover:brightness-125">Vào chơi ›</span>}
                </>
              );
              return (
                <li key={m.slug}>
                  {open ? (
                    <Link
                      href={`/game/${m.slug}`}
                      className={`group flex h-full flex-col rounded-2xl p-5 transition hover:brightness-110 ${m.slug === "practice" ? "fx-panel-hi" : "fx-panel"}`}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div aria-disabled="true" className="flex h-full flex-col rounded-2xl fx-panel p-5 opacity-70">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-center text-sm text-on-wood-soft">
            Kèm theo:{" "}
            {[
              ["quests", "Nhiệm vụ và điểm danh"],
              ["leaderboard", "Bảng xếp hạng"],
              ["profile", "Doanh Trại, trang bị, Cửa Hàng"],
            ].map(([slug, label], i) => (
              <span key={slug}>
                {i > 0 && " · "}
                <Link href={`/game/${slug}`} className="text-on-wood-soft underline-offset-4 hover:text-[var(--primary)] hover:underline">
                  {label}
                </Link>
              </span>
            ))}
          </p>
        </section>

        <section id="faq" className="scroll-mt-16 px-4 py-16">
          <SectionTitle kicker="Hỏi đáp" title="Câu hỏi thường gặp" />
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl fx-panel px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span aria-hidden className="text-[var(--primary)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-on-wood-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 pt-6">
          <div className="fx-panel-hi relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-6 py-12 text-center">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
              <DrumFace className="h-auto w-full" />
            </div>
            <h2 className="fx-gilt-text relative text-heading">Phất cờ lau, ra trận</h2>
            <p className="relative mx-auto mt-3 max-w-md text-on-wood-soft">Một trận chơi thử chỉ mất vài phút, ngay trên trình duyệt.</p>
            <PlayButton className="relative mt-6 text-base">Chơi thử miễn phí</PlayButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-frame-gold/25 px-4 py-8 text-sm text-on-wood-soft/90">
        {/* Hai cột: trái là nhận diện, điều hướng và lưu ý (căn theo đầu thư cuộn); phải là thư cuộn liên hệ, trên điện thoại thư cuộn lên trước. */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-start lg:gap-12">
          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:pt-6">
            <div className="flex items-center gap-4">
              <LogoMark className="size-14" />
              <div>
                <p className="font-serif text-2xl font-bold text-on-wood">Cờ Lau</p>
                <p className="mt-0.5 text-base">Trò chơi nhỏ thuộc ShanVerse</p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-x-6 border-y border-frame-gold/20 py-3 text-base sm:grid-cols-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="inline-flex min-h-11 items-center hover:text-[var(--primary)]">
                    {n.label}
                  </a>
                </li>
              ))}
              {[
                { href: "/game", label: "Vào game" },
                { href: "/game/practice", label: "Thao Luyện" },
                { href: "/game/login", label: "Đăng nhập" },
                { href: "/game/register", label: "Đăng ký" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-[var(--primary)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="max-w-md leading-relaxed">
              Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
            </p>
          </div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <ContactBlock links={socialLinks()} />
          </div>
        </div>
      </footer>
    </div>
  );
}
