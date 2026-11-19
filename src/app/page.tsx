// Trang giới thiệu (/), thiết kế lại 19/11/2026 theo đề xuất Shan duyệt: gọn khoảng sáu màn hình, mỗi mục một ý.
// Mở đầu (tranh trống đồng, bàn cờ tự chơi, số liệu thật) → Đinh Bộ Lĩnh qua ba thời (giữ nguyên khung cũ, Shan chốt) → Chế độ chơi →
// Thế giới → Hỏi đáp → lời mời cuối. Trang chủ nói chung cho cả 14 chế độ (Shan 20/11/2026); luật đánh trận ghép ô (ba bước một
// lượt, chuỗi Hợp Kích, bảng ô, nghề, hệ) ở /cam-nang.

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import {
  ALL_COMPANIONS,
  BOARD_COLS,
  createRng,
  elementRelation,
  ELEMENTS,
  generateBoard,
  PROFESSIONS,
  STANDARD_WEIGHTS,
  STARTER_COMPANIONS,
  WARLORD_COMPANIONS,
  type Tile,
} from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "./game/battle/labels";
import { ELEMENT_COLOR, ElementIcon, ProfessionIcon } from "./game/art/icons";
import { Logo } from "./game/art/logo";
import { Portrait } from "./game/art/portraits";
import { ModeIcon, type ModeIconKind } from "./game/art/mode-icons";
import { BoardCrest } from "./game/art/tiles";
import { expeditionFlag, tamTuongKyEnabled, towerFeatureFlags, type TowerFeatureFlags } from "@/server/featureFlags";
import { ELEMENT_TRAIT, FAQ, PROFESSION_ROLE } from "./home/data";
import DrumFace from "./home/DrumFace";
import HeroBoard from "./home/HeroBoard";
import { Embers, GiltCorners } from "./home/Ornaments";
import { FinalCta, MobilePlayBar, PlayButton, SectionTitle, SITE_BG, SITE_FRAME, SITE_WIDTH, SiteFooter, SiteHeader } from "./home/SiteChrome";
import { OrnateFrame } from "@/components/game-ui";
import { NumberWords } from "./home/words";

/** Bàn cờ mở đầu: sinh cố định theo seed nên server và client luôn giống nhau. */
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

type ModeFlag = keyof TowerFeatureFlags | "expedition" | "tamTuongKy";

interface LandingMode {
  readonly slug: ModeIconKind;
  readonly name: string;
  readonly kicker: string;
  readonly body: string;
  /** Tranh thẻ (public/art/...). */
  readonly art: string;
  /** Chế độ bật bằng biến môi trường lúc build; tắt thì thẻ ghi "Sắp có". */
  readonly flag?: ModeFlag;
  /** Chơi được ngay không cần tài khoản. */
  readonly guest?: boolean;
}

/** Các chế độ đang có trong màn chơi /game (cùng danh sách với MenuScene), chia hai nhóm như Chiến Trường. */
const MODE_GROUPS: readonly { readonly title: string; readonly sub: string; readonly modes: readonly LandingMode[] }[] = [
  {
    title: "Chiến trận",
    sub: "Ghép ô để đánh: luyện tay, theo cốt truyện, leo tháp, giữ ải, đấu người.",
    modes: [
      { slug: "practice", name: "Thao Luyện", kicker: "Luyện tay", art: "/art/home/thao-luyen.webp", guest: true, body: "Vào trận ngay, không cần mạng, 3vs3 đấu Tianwu với đội cấp tối đa." },
      { slug: "campaign", name: "Bình Loạn", kicker: "Cốt truyện", art: "/art/home/campaign.webp", body: "Sáu chương dẹp loạn mười hai sứ quân, tướng lịch sử gia nhập, rồi Tái đấu sứ quân ở ba bậc." },
      { slug: "play", name: "Giao Tranh", kicker: "Trực tuyến", art: "/art/home/giao-tranh.webp", body: "Trận trực tuyến có đồng hồ ba mươi giây, nhận vàng, kinh nghiệm và chiến lợi phẩm." },
      { slug: "trial", name: "Tháp Thí Luyện", kicker: "Leo tháp", art: "/art/home/trial.webp", flag: "trial", body: "Một trăm tầng cố định chia mười chặng, tự chọn đội theo luật riêng từng tầng." },
      { slug: "destiny", name: "Tháp Thiên Mệnh", kicker: "Leo tháp", art: "/art/home/destiny.webp", flag: "destiny", body: "Khóa đội hình theo chu kỳ, giữ máu và lương xuyên tầng." },
      { slug: "survival", name: "Trấn Ải", kicker: "Sinh tồn", art: "/art/home/survival.webp", body: "Một bàn cờ, đối thủ kéo đến theo đợt, nghỉ giữa đợt để tính tiếp." },
      { slug: "daily", name: "Nhật Lệnh", kicker: "Mỗi ngày", art: "/art/home/daily.webp", body: "Một đề chung cho mọi người, mỗi ngày một lần, có bảng công trạng." },
      { slug: "arena", name: "Quần Hùng", kicker: "Đấu người", art: "/art/home/arena.webp", body: "Đánh đội phòng thủ của hào kiệt khác, leo điểm mỗi ngày." },
      { slug: "expedition", name: "Viễn Chinh", kicker: "Hành quân", art: "/art/home/vien-chinh.webp", flag: "expedition", body: "Chia quân hai đạo trên sa bàn, hành quân qua từng chặng rồi giáp công phá thành." },
    ],
  },
  {
    title: "Binh pháp và giải đố",
    sub: "Không cần phản xạ: bày trận, dò bẫy, học sử, ghép tướng. Phần lớn chơi được ngay không cần tài khoản.",
    modes: [
      { slug: "formation", name: "Trận Đồ", kicker: "Binh pháp", art: "/art/home/tran-do.webp", guest: true, body: "Xếp quân theo nghề, theo hệ cho khớp luật từng ô, mở dần bản đồ trận." },
      { slug: "clear-path", name: "Khai Lộ", kicker: "Giải đố", art: "/art/home/khai-lo.webp", guest: true, body: "Chạm để phá cả khối quân cùng hệ, gom khối to lấy điểm và mở đường xuyên bàn." },
      { slug: "scout", name: "Do Thám", kicker: "Giải đố", art: "/art/home/do-tham.webp", guest: true, body: "Dò từng ô trên sa bàn, đọc số để tránh bẫy chông, cắm cờ lau đánh dấu." },
      { slug: "maze", name: "Sử Lộ", kicker: "Học sử", art: "/art/home/su-lo.webp", guest: true, body: "Đổ xúc xắc đi qua mê cung các thời kỳ, đáp đúng câu sử để mở cổng." },
      { slug: "tam-tuong-ky", name: "Tầm Tướng Ký", kicker: "Ghép tướng", art: "/art/home/tam-tuong-ky.webp", flag: "tamTuongKy", body: "Ghép bảy hệ thành nguyên liệu, lần ra chân dung các danh tướng." },
    ],
  },
];

const DBL_ERAS = [
  { src: "/art/splash/dinh-bo-linh-nien-thieu.webp", w: 570, title: "Thiếu niên", note: "Cờ lau tập trận bên sông Hoàng Long." },
  { src: "/art/splash/dinh-bo-linh-tuong-quan.webp", w: 569, title: "Tướng quân", note: "Hình trong trận: áo choàng bay, chém kiếm." },
  { src: "/art/splash/dinh-bo-linh-hoang-de.webp", w: 597, title: "Hoàng đế", note: "Đinh Tiên Hoàng, dựng nước Đại Cồ Việt." },
] as const;

export default function Home() {
  const board = heroBoard();
  const flags: Record<ModeFlag, boolean> = { ...towerFeatureFlags(), expedition: expeditionFlag(), tamTuongKy: tamTuongKyEnabled() };
  const modeCount = MODE_GROUPS.reduce((n, g) => n + g.modes.length, 0);
  // Số liệu đếm thẳng từ dữ liệu game, không viết tay.
  const facts = [
    { n: modeCount, label: "chế độ chơi" },
    { n: ALL_COMPANIONS.length + 1, label: "tướng quân" },
    { n: PROFESSIONS.length, label: "nghề" },
    { n: ELEMENTS.length, label: "hệ" },
  ];
  return (
    <div className={SITE_BG}>
      <SiteHeader />

      <main id="content">
        {/* Mở đầu: tranh trời trống đồng làm nền, mặt trống xoay chậm đè đúng trống trong tranh, bàn cờ tự chơi. */}
        <section className="relative overflow-hidden border-b border-frame-gold/20">
          <div aria-hidden className="pointer-events-none absolute inset-0 [container-type:size]">
            <div className="hero-art absolute left-1/2 top-1/2 aspect-[1916/821] -translate-x-1/2 -translate-y-1/2">
              <Image src="/art/hero/troi-trong-dong.webp" alt="" fill priority sizes="(min-width: 768px) 100vw, 250vw" className="object-cover" />
              <div className="absolute left-[50.9%] top-[48%] w-[47%] -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen">
                <DrumFace className="drum-spin h-auto w-full" />
              </div>
              <div className="hero-star absolute left-[50.9%] top-[48%] aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </div>
          </div>
          <div aria-hidden className="hero-shade pointer-events-none absolute inset-0" />
          <Embers />
          <div className={`relative mx-auto grid items-center gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:py-20 ${SITE_WIDTH}`}>
            <div>
              <h1 className="-mx-4 -mt-6 max-w-[520px] md:-mx-8">
                <Logo priority className="h-auto w-full" />
                <span className="sr-only">Cờ Lau: Loạn mười hai sứ quân</span>
              </h1>
              <p className="mt-3 max-w-lg font-serif text-2xl leading-snug font-bold text-title-on-wood md:text-3xl">
                Phất cờ lau, dẹp loạn mười hai sứ quân.
              </p>
              <p className="mt-3 max-w-md text-lg text-on-wood-soft">
                Game chiến thuật ghép ô theo lượt giữa thời loạn thế kỷ thứ mười. Dẫn Đinh Bộ Lĩnh cùng các tướng quân đánh trận,
                bày binh, dò bẫy, đọc sử, từng bước thu non sông về một mối.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <PlayButton className="text-base">Chơi ngay · không cần tài khoản</PlayButton>
                <a
                  href="#modes"
                  className="fx-btn-ghost inline-flex items-center rounded-lg px-5 py-2.5 font-semibold text-title-on-wood transition hover:brightness-125"
                >
                  Xem các chế độ
                </a>
              </div>
              <dl className="mt-8 grid max-w-lg grid-cols-4 gap-2 border-t border-frame-gold/25 pt-5">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="sr-only">{f.label}</dt>
                    <dd className="flex flex-col">
                      <span className="fx-gilt-text font-serif text-3xl font-black tabular-nums">{f.n}</span>
                      <span className="text-sm text-on-wood-soft">{f.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm text-on-wood-soft/80">Chạy ngay trên trình duyệt · Máy tính và điện thoại xoay ngang · Miễn phí</p>
            </div>

            <div className="relative mb-14 ml-8 md:mb-12 md:ml-6">
              <div className="fx-frame relative rounded-xl p-2">
                <GiltCorners size="size-10 md:size-14" skip="bottomLeft" />
                <BoardCrest className="pointer-events-none absolute left-1/2 top-0 z-10 h-9 w-44 -translate-x-1/2 -translate-y-[62%] md:h-12 md:w-60" />
                <HeroBoard cells={board} />
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
        <section id="hero-story" className="scroll-mt-20 px-4 py-6 md:py-8">
          <OrnateFrame level="raised" className={SITE_FRAME}>
          <SectionTitle kicker="Chủ tướng" title="Đinh Bộ Lĩnh qua ba thời" sub="Từ cậu bé chăn trâu cầm cờ lau, thành vị tướng dẹp loạn sứ quân, rồi lên ngôi hoàng đế." />
          <ul className={`mx-auto grid grid-cols-3 gap-3 md:gap-6 lg:gap-8 ${SITE_WIDTH}`}>
            {DBL_ERAS.map((e) => (
              <li key={e.src} className="flex flex-col items-center justify-end rounded-2xl fx-panel-hi p-2 text-center md:p-4">
                <Image src={e.src} alt={`Đinh Bộ Lĩnh ${e.title}`} width={e.w} height={900} sizes="(min-width: 1536px) 500px, (min-width: 768px) 380px, 30vw" className="h-auto w-full drop-shadow-[0_12px_20px_color-mix(in_srgb,var(--black)_67%,transparent)]" />
                <p className="mt-2 font-serif text-base font-bold md:text-lg">{e.title}</p>
                <p className="hidden text-xs text-on-wood-soft sm:block">{e.note}</p>
              </li>
            ))}
          </ul>
          </OrnateFrame>
        </section>

        <section id="modes" aria-labelledby="modes-title" className="scroll-mt-20 px-4 py-6 md:py-8">
          <OrnateFrame level="raised" className={SITE_FRAME}>
          <SectionTitle
            id="modes-title"
            kicker="Chế độ chơi"
            title="Mười bốn cách ra trận"
            sub="Chơi ngay với thân phận lữ khách, tiến trình gắn với trình duyệt. Trình danh để giữ tiến trình trên mọi máy."
          />
          <div className="mx-auto flex max-w-6xl 2xl:max-w-[96rem] flex-col gap-12">
            {MODE_GROUPS.map((group) => (
              <section key={group.title} aria-labelledby={`modes-${group.modes[0]!.slug}`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-frame-gold/25 pb-3">
                  <h3 id={`modes-${group.modes[0]!.slug}`} className="fx-gilt-text font-serif text-2xl font-black">{group.title}</h3>
                  <p className="max-w-xl text-sm text-on-wood-soft">{group.sub}</p>
                </div>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.modes.map((m) => {
                    const open = !m.flag || flags[m.flag];
                    const body = (
                      <>
                        <span className="relative block aspect-[16/7] overflow-hidden rounded-t-2xl">
                          <Image
                            src={m.art}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                            className={`object-cover transition duration-500 ${open ? "group-hover:scale-105" : "grayscale"}`}
                          />
                          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                          <span className="absolute top-3 right-3 flex gap-1.5">
                            {m.guest && open && <Badge className="bg-black/55 backdrop-blur-sm">Không cần tài khoản</Badge>}
                            {!open && <Badge className="bg-black/55 uppercase tracking-wider backdrop-blur-sm">Sắp có</Badge>}
                          </span>
                        </span>
                        <span className="relative -mt-9 flex items-end gap-3 px-5">
                          <ModeIcon kind={m.slug} className="size-16 shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]" />
                          <span className="flex min-w-0 flex-col pb-1">
                            <span className="text-kicker text-frame-gold">{m.kicker}</span>
                            <span className="font-serif text-xl leading-tight font-bold">{m.name}</span>
                          </span>
                        </span>
                        <span className="mt-3 flex-1 px-5 text-sm text-on-wood-soft">{m.body}</span>
                        {open && <span className="mt-3 px-5 pb-5 text-sm font-semibold text-[var(--primary)] group-hover:brightness-125">Vào chơi ›</span>}
                        {!open && <span className="pb-5" />}
                      </>
                    );
                    return (
                      <li key={m.slug}>
                        {open ? (
                          <Link
                            href={`/game/${m.slug}`}
                            className={`group flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:brightness-110 ${m.slug === "practice" ? "fx-panel-hi" : "fx-panel"}`}
                          >
                            {body}
                          </Link>
                        ) : (
                          <div aria-disabled="true" className="flex h-full flex-col overflow-hidden rounded-2xl fx-panel opacity-75">
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          </OrnateFrame>
        </section>

        {/* Thế giới: mười hai sứ quân, các nghề và hệ trong một khối gọn (chủ tướng ba thời có mục riêng ở trên). */}
        <section id="world" aria-labelledby="world-title" className="scroll-mt-20 px-4 py-6 md:py-8">
          <OrnateFrame level="raised" className={SITE_FRAME}>
          <SectionTitle
            id="world-title"
            kicker="Thế giới"
            title="Thời loạn mười hai sứ quân"
            sub="Thế kỷ thứ mười, đất nước chia cắt. Cậu bé chăn trâu cờ lau ở Hoa Lư lớn lên thành vị tướng dẹp loạn, rồi lên ngôi Đinh Tiên Hoàng."
          />
          <div className={`mx-auto ${SITE_WIDTH}`}>
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl fx-panel p-5">
                <h3 className="font-serif text-lg font-bold">Mười hai sứ quân</h3>
                <p className="mt-1 text-sm text-on-wood-soft">Đánh dẹp hoặc thu phục ở Bình Loạn; sứ quân đã thắng có thể chiêu mộ về đội.</p>
                <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 xl:grid-cols-12">
                  {WARLORD_COMPANIONS.map(({ fighter: f }) => (
                    <li key={f.id} className="flex flex-col items-center gap-1 text-center">
                      <Portrait id={f.id} element={f.element} profession={f.profession} className="size-14 xl:size-16" />
                      <span className="text-xs leading-tight text-on-wood-soft">{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Nghề: lưới thẻ, mỗi thẻ icon lớn, tên và vai trò. */}
            <h3 className="mt-10 mb-4 font-serif text-xl font-bold">{NumberWords(PROFESSIONS.length)} nghề, mỗi nghề một vai</h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PROFESSIONS.map((p) => (
                <li key={p} className="flex items-center gap-3 rounded-2xl fx-panel p-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-black/30 ring-1 ring-frame-gold/40">
                    <ProfessionIcon profession={p} className="size-9" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-lg font-bold">{PROFESSION_NAME[p]}</span>
                    <span className="block text-sm leading-snug text-on-wood-soft">{PROFESSION_ROLE[p]}</span>
                  </span>
                </li>
              ))}
            </ul>
            {/* Hệ: bảy thẻ, mỗi thẻ viền màu của hệ, tính cách và hệ nó khắc. */}
            <div className="mt-10 mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-serif text-xl font-bold">{NumberWords(ELEMENTS.length)} hệ, tương khắc tương sinh</h3>
              <Link href="/cam-nang#elements" className="text-sm text-frame-gold underline underline-offset-2 hover:brightness-125">
                Xem kỹ năng từng hệ ở Cẩm nang ›
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {ELEMENTS.map((e) => {
                const counters = ELEMENTS.filter((o) => elementRelation(e, o) === "counter");
                return (
                  <li key={e} className="flex flex-col items-center gap-2 rounded-2xl fx-panel border-t-4 p-4 text-center" style={{ borderTopColor: ELEMENT_COLOR[e] }}>
                    <ElementIcon element={e} className="size-12" />
                    <span className="font-serif text-lg font-bold">{ELEMENT_NAME[e]}</span>
                    <span className="text-sm leading-snug text-on-wood-soft">{ELEMENT_TRAIT[e].role}</span>
                    <span className="mt-auto flex flex-wrap items-center justify-center gap-1 text-xs text-on-wood-soft">
                      Khắc
                      {counters.map((o) => (
                        <span key={o} className="inline-flex items-center gap-0.5 font-semibold text-on-wood">
                          <ElementIcon element={o} className="size-3.5" />
                          {ELEMENT_NAME[o]}
                        </span>
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          </OrnateFrame>
        </section>

        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 px-4 py-6 md:py-8">
          <OrnateFrame level="raised" className={SITE_FRAME}>
          <SectionTitle id="faq-title" kicker="Hỏi đáp" title="Câu hỏi thường gặp" />
          <div className={`mx-auto grid items-start gap-3 lg:grid-cols-2 ${SITE_WIDTH}`}>
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
          </OrnateFrame>
        </section>

        <FinalCta
          title="Phất cờ lau, ra trận"
          body="Chọn một chế độ và vào ngay trên trình duyệt, không cần tài khoản. Mỗi chế độ có màn Hướng dẫn riêng trước khi chơi."
          cta="Chơi ngay"
          secondary={{ href: "/cam-nang", label: "Đọc Cẩm nang" }}
        />
      </main>

      <SiteFooter />
      <MobilePlayBar />
    </div>
  );
}

