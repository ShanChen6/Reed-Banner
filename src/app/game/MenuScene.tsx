"use client";

// Phân cảnh MENU (Home V2, docs/05-ui-ux/design-system/game-mode-ui-spec.md mục 14): tranh Hoa Lư làm hero với logo
// và nút Vào trận, lưới sáu chế độ dẫn bằng tranh, hàng tiện ích cuối trang. Bấm vào đâu cũng chỉ đổi phân cảnh,
// không tải lại trang. Khung, góc hoa văn và màu lấy lại từ Sử ký (lớp .campaign-atlas) để cùng một chất liệu.

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { Logo } from "./art/logo";
import { ONLINE_BATTLE_KEY } from "./battle/online";
import { AtlasCorners } from "./campaign/AtlasFrame";
import type { ShellAccount, TowerFeatures } from "./GameShell";
import type { Scene } from "./scene";
import { SceneLink } from "./SceneContext";

const HERO_ART = "/art/campaign/bg/hoalu.webp";

interface Mode {
  readonly scene: Scene;
  readonly title: string;
  readonly text: string;
  /** Tranh trong public/art/home/; chế độ sắp ra mắt chưa có tranh thì dựng tạm từ biểu tượng nghề/hệ. */
  readonly art: string;
  readonly kicker?: string;
  readonly featured?: boolean;
}

const MODES: readonly Mode[] = [
  {
    scene: "CAMPAIGN",
    title: "Bình Loạn",
    text: "Sáu chương dẹp loạn 12 sứ quân, rồi Tái đấu sứ quân đã bị đánh dẹp.",
    art: "campaign",
    kicker: "Cốt truyện chính",
    featured: true,
  },
  { scene: "TRIAL", title: "Tháp Thí Luyện", text: "20 tầng cố định, tự chọn đội và luật riêng từng tầng.", art: "trial", kicker: "Song Tháp" },
  { scene: "DESTINY", title: "Tháp Thiên Mệnh", text: "Khóa đội theo chu kỳ, giữ máu và lương xuyên tầng.", art: "destiny", kicker: "Song Tháp" },
  { scene: "SURVIVAL", title: "Trấn Ải", text: "Đối thủ kéo đến theo đợt trên cùng một bàn cờ.", art: "survival" },
  { scene: "DAILY", title: "Nhật Lệnh", text: "Một đề chung cho mọi người, mỗi ngày một lần.", art: "daily" },
  { scene: "ARENA", title: "Quần Hùng", text: "Đánh đội phòng thủ người chơi khác để lại.", art: "arena" },
];

/**
 * Chế độ Shan đã duyệt tên (26/10) nhưng chưa phát hành chính thức: thẻ "Sắp ra mắt" không bấm được. Trận Đồ đã có bản
 * chơi thử offline (không thưởng) nên bấm vào được, nhưng vẫn ở hàng này, không thành card thứ bảy của sáu chế độ live.
 * TODO: khi có scene và feature flag thì chuyển lên MODES; TODO tranh: public/art/home/vien-chinh.webp
 * (xem /mnt/project-files/art/prompts/home-thumbnail-che-do.md). Viễn Chinh chưa có cơ chế.
 */
const UPCOMING: readonly { id: "tran-do" | "tam-tuong-ky" | "vien-chinh"; title: string; text: string; art?: string; scene?: Scene }[] = [
  { id: "tran-do", title: "Trận Đồ", text: "Bày quân lệnh theo nghề và hệ để khai thông sa bàn.", art: "tran-do", scene: "FORMATION" },
  { id: "tam-tuong-ky", title: "Tầm Tướng Ký", text: "Ghép yếu tố từ bảy hệ để tìm lại chân dung danh tướng.", art: "tam-tuong-ky" },
  { id: "vien-chinh", title: "Viễn Chinh", text: "Đưa quân đi xa ngoài bờ cõi. Cơ chế đang được thiết kế." },
];


/** Tiện ích cuối trang. Hồ sơ và Tài khoản đã có trên thanh header nên không lặp lại ở đây. */
/** Chế độ online có bảng xếp hạng và thưởng: chỉ tài khoản đăng nhập vào được (server cũng chặn). */
const ONLINE_RANKED: readonly Scene[] = ["DAILY", "SURVIVAL", "ARENA", "DESTINY"];

const UTILITIES: readonly { scene: Scene; title: string; icon: UtilityIcon }[] = [
  { scene: "SHOP", title: "Cửa Hàng", icon: "shop" },
  { scene: "QUESTS", title: "Nhiệm vụ", icon: "scroll" },
  { scene: "LEADERBOARD", title: "Xếp hạng", icon: "rank" },
  { scene: "PRACTICE", title: "Thao Luyện", icon: "swords" },
];

type UtilityIcon = "scroll" | "rank" | "swords" | "shop";

function hasSavedBattle(): boolean {
  try {
    return window.localStorage.getItem(ONLINE_BATTLE_KEY) !== null;
  } catch {
    return false;
  }
}

export default function MenuScene({ account, towerFeatures }: { account: ShellAccount | null; towerFeatures: TowerFeatures }) {
  const saved = useSyncExternalStore(
    () => () => {},
    hasSavedBattle,
    () => false,
  );
  const locked = (scene: Scene) => (scene === "TRIAL" ? !towerFeatures.trial : scene === "DESTINY" ? !towerFeatures.destiny : false);

  return (
    <main className="campaign-atlas demo-bg flex flex-1 flex-col bg-[#17110e] pb-10 text-[var(--atlas-ink-on-wood)]">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 pt-4 sm:px-6 lg:gap-10 lg:px-8 lg:pt-6">
        <section aria-labelledby="home-title" className="home-hero atlas-frame relative isolate overflow-hidden">
          <Image
            src={HERO_ART}
            alt=""
            fill
            priority
            sizes="(min-width: 1480px) 1480px, 100vw"
            className="-z-10 object-cover object-[60%_45%]"
          />
          <div aria-hidden className="home-hero-shade absolute inset-0 -z-10" />
          <AtlasCorners size="size-7" />
          <div className="flex min-h-[22rem] flex-col justify-end gap-5 px-5 py-8 sm:min-h-[26rem] sm:px-10 lg:min-h-[30rem] lg:max-w-[34rem] lg:justify-center lg:px-14">
            <h1 id="home-title" className="w-56 max-w-full sm:w-72 lg:w-80">
              <Logo priority className="h-auto w-full drop-shadow-[0_6px_18px_#000]" />
            </h1>
            <p className="max-w-md font-serif text-lg leading-snug text-[var(--atlas-title)] [text-shadow:0_2px_6px_#000] sm:text-xl">
              Dẹp loạn mười hai sứ quân, dựng lại giang sơn Đại Việt.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <SceneLink scene="PLAYING" className="home-cta flex min-h-12 items-center justify-center rounded-lg px-8 font-serif text-lg font-bold tracking-[0.12em] uppercase">
                Vào trận
              </SceneLink>
              {saved && (
                <SceneLink
                  scene="PLAYING"
                  params={{ resume: "1" }}
                  className="home-secondary flex min-h-12 items-center justify-center rounded-lg px-6 font-serif font-semibold"
                >
                  Tiếp tục trận dở
                </SceneLink>
              )}
            </div>
            {!account && (
              <p className="text-sm text-[var(--atlas-ink-on-wood)]/85 [text-shadow:0_1px_3px_#000]">
                Đang chơi với tư cách khách, tiến độ gắn với trình duyệt này.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="home-modes">
          <SectionHeading id="home-modes" kicker="Chế độ chơi" title="Chọn chiến trường" />
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {MODES.map((m) => (
              <li key={m.scene}>
                <ModeCard mode={m} locked={locked(m.scene)} needsLogin={!account && ONLINE_RANKED.includes(m.scene)} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="home-soon">
          <SectionHeading id="home-soon" kicker="Sắp ra mắt" title="Đang dựng" />
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {UPCOMING.map((u) => (
              <li key={u.id}>
                <UpcomingCard mode={u} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="home-more">
          <SectionHeading id="home-more" kicker="Tiện ích" title="Doanh trại" />
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {UTILITIES.map((u) => (
              <li key={u.scene}>
                <SceneLink scene={u.scene} className="home-utility atlas-frame flex min-h-14 items-center gap-3 px-4 font-serif font-semibold">
                  <UtilityGlyph kind={u.icon} />
                  {u.title}
                  <span aria-hidden className="ml-auto text-[var(--atlas-gold)]">›</span>
                </SceneLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">{kicker}</p>
        <h2 id={id} className="atlas-title font-serif text-2xl font-bold sm:text-[1.7rem]">
          {title}
        </h2>
      </div>
      <span aria-hidden className="home-rule h-px flex-1 self-end" />
    </div>
  );
}

/** Thẻ chế độ: tranh là phần chính, tên đặt trên mép dưới tranh, một câu mô tả và trạng thái thật (mở/chưa mở). */
function ModeCard({ mode, locked, needsLogin }: { mode: Mode; locked: boolean; needsLogin: boolean }) {
  const body = (
    <>
      <div className="relative aspect-[5/2] overflow-hidden rounded-t-[0.65rem] sm:aspect-[16/9] lg:aspect-[2/1]">
        <Image
          src={`/art/home/${mode.art}.webp`}
          alt=""
          fill
          sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-300 motion-reduce:transition-none ${locked ? "grayscale-[85%] brightness-50" : "group-hover:scale-[1.03]"}`}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1d140d] via-[#1d140d]/25 to-transparent" />
        {mode.kicker && (
          <span className="home-kicker absolute top-3 left-3 rounded px-2 py-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
            {mode.kicker}
          </span>
        )}
        <h3 className="absolute right-4 bottom-2.5 left-4 font-serif text-xl font-bold text-[var(--atlas-title)] [text-shadow:0_2px_4px_#000] sm:text-2xl">
          {mode.title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-2.5 pb-4">
        <p className="text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">{mode.text}</p>
        <div className="mt-auto flex items-center justify-between gap-2 text-sm">
          {locked ? (
            <span className="flex items-center gap-1.5 text-[var(--atlas-muted)]">
              <LockGlyph /> Chưa mở · tiến trình được giữ nguyên
            </span>
          ) : (
            <>
              <span className="text-[var(--atlas-muted)]">{needsLogin ? "Cần đăng nhập" : "Đang mở"}</span>
              <span className="home-enter flex items-center gap-1 font-serif font-semibold">
                Vào <span aria-hidden>›</span>
              </span>
            </>
          )}
        </div>
      </div>
      <AtlasCorners size="size-5" />
    </>
  );
  const frame = `home-mode atlas-frame atlas-frame-wood group flex h-full flex-col ${mode.featured ? "home-mode-featured" : ""}`;
  if (locked)
    return (
      <div aria-disabled="true" className={`${frame} home-mode-locked`}>
        {body}
      </div>
    );
  return (
    <SceneLink scene={mode.scene} className={frame}>
      {body}
    </SceneLink>
  );
}

/** Thẻ chế độ sắp ra mắt: cùng khung với thẻ chế độ, không bấm được; chưa có tranh thì dùng tranh mực tạm. */
function UpcomingCard({ mode }: { mode: (typeof UPCOMING)[number] }) {
  const frame = "home-mode home-mode-soon atlas-frame atlas-frame-wood group flex h-full flex-col";
  const body = (
    <>
      <div className="home-soon-art relative aspect-[16/9] overflow-hidden rounded-t-[0.65rem] lg:aspect-[2/1]">
        {mode.art ? (
          <Image src={`/art/home/${mode.art}.webp`} alt="" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover opacity-80 sepia-[.25]" />
        ) : (
          <Image src="/art/campaign/rail-ink.webp" alt="" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover object-bottom opacity-60 sepia-[.4]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1d140d] via-[#1d140d]/20 to-transparent" />
        <span className="home-kicker absolute top-3 left-3 rounded px-2 py-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
          {mode.scene ? "Đã mở" : "Sắp ra mắt"}
        </span>
        <h3 className="absolute right-4 bottom-2.5 left-4 font-serif text-xl font-bold text-[var(--atlas-title)] [text-shadow:0_2px_4px_#000] sm:text-2xl">
          {mode.title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-2.5 pb-4">
        <p className="text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">{mode.text}</p>
        {mode.scene ? (
          <div className="mt-auto flex items-center justify-between gap-2 text-sm">
            <span className="text-[var(--atlas-muted)]">Chơi thường · có xếp hạng khi bật</span>
            <span className="home-enter flex items-center gap-1 font-serif font-semibold">Vào <span aria-hidden>›</span></span>
          </div>
        ) : (
          <span className="mt-auto flex items-center gap-1.5 text-sm text-[var(--atlas-muted)]">
            <LockGlyph /> Đang thiết kế, chưa chơi được
          </span>
        )}
      </div>
      <AtlasCorners size="size-5" />
    </>
  );
  if (mode.scene)
    return (
      <SceneLink scene={mode.scene} className={frame}>
        {body}
      </SceneLink>
    );
  return (
    <div aria-disabled="true" className={frame}>
      {body}
    </div>
  );
}

function LockGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UtilityGlyph({ kind }: { kind: UtilityIcon }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-[var(--atlas-gold)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {kind === "scroll" && <path d="M7 4h11a2 2 0 0 1 0 4H7M7 4a2 2 0 0 0 0 4v10a2 2 0 0 0 2 2h9V8M10 12h5M10 15.5h5" />}
      {kind === "rank" && <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4.5a2.5 2.5 0 0 0 3 3.2M17 6h2.5a2.5 2.5 0 0 1-3 3.2" />}
      {kind === "shop" && <path d="M4 9l1.5-5h13L20 9M4 9h16M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M5.5 12v8h13v-8M10 20v-4h4v4" />}
      {kind === "swords" && <path d="M4 4l10.5 10.5M12.5 16.5l4-4M16 16l4 4M20 4L9.5 14.5M11.5 16.5l-4-4M8 16l-4 4" />}
    </svg>
  );
}
