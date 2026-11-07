"use client";

// Phân cảnh MENU (Home V2, docs/05-ui-ux/design-system/game-mode-ui-spec.md mục 14): tranh Hoa Lư làm hero với logo
// và nút Vào trận, lưới mười chế độ dẫn bằng tranh, hàng tiện ích cuối trang. Bấm vào đâu cũng chỉ đổi phân cảnh,
// không tải lại trang. Khung, góc hoa văn và màu lấy lại từ Sử ký (lớp .campaign-atlas) để cùng một chất liệu.

import { MODE_CONTENT_WIDTH } from "@/components/game-ui";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "./art/logo";
import { fetchProfile, ONLINE_BATTLE_KEY } from "./battle/online";
import { AtlasCorners } from "./campaign/AtlasFrame";
import type { ShellAccount, TowerFeatures } from "./GameShell";
import { heroPlan, type HeroAction } from "./heroContext";
import { MODE_TEXT } from "./modeInfo";
import type { Scene } from "./scene";
import type { Profile } from "@/core";
import { SceneLink } from "./SceneContext";

const HERO_ART = "/art/campaign/bg/hoalu.webp";

interface Mode {
  readonly scene: Scene;
  readonly title: string;
  readonly text: string;
  /** Tranh trong public/art/home/; chế độ sắp ra mắt chưa có tranh thì dựng tạm từ biểu tượng nghề/hệ. */
  /** Chưa có tranh riêng thì dùng tranh mực tạm (public/art/campaign/rail-ink.webp). */
  readonly art?: string;
  readonly kicker?: string;
  readonly featured?: boolean;
  /** Một dòng thông tin có ích thay cho "Đang mở" (cách chơi, nhịp làm mới, điều kiện). */
  readonly status: string;
  /** Động từ trên nút kêu gọi ở góc thẻ ("Leo tháp", "Giữ ải"…). */
  readonly cta: string;
  /** Dòng hiện khi chế độ đang khóa theo cờ tính năng. */
  readonly lockedText?: string;
}

// Giọng văn thẻ chế độ: câu mô tả lấy từ MODE_TEXT (modeInfo.ts), hào sảng, nhịp hai vế; tránh thuật ngữ nội bộ. Nhãn kicker theo bộ cố định: Cốt truyện, Leo tháp, Sinh tồn, Mỗi ngày, Đấu người, Binh pháp, Giải đố, Ghép tướng, Hành quân.
const MODES: readonly Mode[] = [
  {
    scene: "CAMPAIGN",
    title: "Bình Loạn",
    text: MODE_TEXT.CAMPAIGN,
    art: "campaign",
    kicker: "Cốt truyện",
    featured: true,
    status: "Sáu chương sử Việt · tái đấu sứ quân",
    cta: "Dẹp loạn",
  },
  { scene: "TRIAL", title: "Tháp Thí Luyện", text: MODE_TEXT.TRIAL, art: "trial", kicker: "Leo tháp", status: "Hai mươi tầng · thưởng Đá Cường Hóa", cta: "Leo tháp", lockedText: "Sắp khai mở · tiến trình vẫn được giữ" },
  { scene: "DESTINY", title: "Tháp Thiên Mệnh", text: MODE_TEXT.DESTINY, art: "destiny", kicker: "Leo tháp", status: "Mỗi chu kỳ một vận · tranh hạng thiên hạ", cta: "Leo tháp", lockedText: "Sắp khai mở · tiến trình vẫn được giữ" },
  { scene: "SURVIVAL", title: "Trấn Ải", text: MODE_TEXT.SURVIVAL, art: "survival", kicker: "Sinh tồn", status: "Ghi danh bảng xếp hạng mỗi tuần", cta: "Giữ ải" },
  { scene: "DAILY", title: "Nhật Lệnh", text: MODE_TEXT.DAILY, art: "daily", kicker: "Mỗi ngày", status: "Lệnh mới ban mỗi ngày", cta: "Nhận lệnh" },
  { scene: "ARENA", title: "Quần Hùng", text: MODE_TEXT.ARENA, art: "arena", kicker: "Đấu người", status: "Tranh ngôi đầu bảng mỗi tuần", cta: "Thách đấu" },
  { scene: "FORMATION", title: "Trận Đồ", text: MODE_TEXT.FORMATION, art: "tran-do", kicker: "Binh pháp", status: "Vào trận ngay · không cần tài khoản", cta: "Bày trận" },
  { scene: "KHAI_LO", title: "Khai Lộ", text: MODE_TEXT.KHAI_LO, art: "khai-lo", kicker: "Giải đố", status: "Giải đố ngay · không cần tài khoản", cta: "Giải đố" },
  { scene: "TAM_TUONG_KY", title: "Tầm Tướng Ký", text: MODE_TEXT.TAM_TUONG_KY, art: "tam-tuong-ky", kicker: "Ghép tướng", status: "Một phiếu, một lượt tìm tướng", cta: "Ghép tướng", lockedText: "Sắp khai mở" },
  { scene: "EXPEDITION", title: "Viễn Chinh", text: MODE_TEXT.EXPEDITION, art: "vien-chinh", kicker: "Hành quân", status: "Bày mưu tính kế trên sa bàn", cta: "Hành quân", lockedText: "Sắp khai mở" },
];

/**
 * Chế độ sắp ra mắt: thẻ không bấm được, hiện ở mục "Sắp ra mắt" dưới lưới chế độ. Mười chế độ hiện có đã vào MODES nên
 * danh sách này đang trống và mục tự ẩn; thêm một phần tử vào đây khi có ý tưởng mới (có `scene` thì thẻ bấm được).
 * TODO tranh: public/art/home/<id>.webp, chưa có thì thẻ dùng tranh mực tạm.
 */
const UPCOMING: readonly { id: string; title: string; text: string; art?: string; scene?: Scene; note?: string }[] = [];


/** Tiện ích cuối trang. Hồ sơ và Tài khoản đã có trên thanh header nên không lặp lại ở đây. */
/** Chế độ online có bảng xếp hạng và thưởng: chỉ tài khoản đăng nhập vào được (server cũng chặn). */
const ONLINE_RANKED: readonly Scene[] = ["DAILY", "SURVIVAL", "ARENA", "DESTINY"];

const UTILITIES: readonly { scene: Scene; title: string; icon: UtilityIcon }[] = [
  { scene: "SHOP", title: "Cửa Hàng", icon: "shop" },
  { scene: "QUESTS", title: "Nhiệm vụ", icon: "scroll" },
  { scene: "LEADERBOARD", title: "Công Trạng", icon: "rank" },
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
  // Hồ sơ người chơi (kể cả khách) để đổi nút chính theo ngữ cảnh: undefined = đang tải, null = không tải được.
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    void fetchProfile().then((r) => live && setProfile(r.profile ?? null));
    return () => {
      live = false;
    };
  }, []);
  const plan = profile === undefined ? null : heroPlan(profile, saved);
  const locked = (scene: Scene) =>
    scene === "TRIAL"
      ? !towerFeatures.trial
      : scene === "DESTINY"
        ? !towerFeatures.destiny
        : scene === "TAM_TUONG_KY"
          ? !towerFeatures.tamTuongKy
          : scene === "EXPEDITION"
            ? !towerFeatures.expedition
            : false;

  return (
    <main className="campaign-atlas ui-mode-screen flex flex-col">
      <div className={`mx-auto flex w-full flex-col gap-8 lg:gap-10 ${MODE_CONTENT_WIDTH}`}>
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
          <div className="flex min-h-[22rem] flex-col justify-end gap-5 px-5 py-8 sm:min-h-[26rem] sm:px-10 lg:min-h-[30rem] lg:max-w-[44rem] lg:justify-center lg:px-14">
            <h1 id="home-title" className="w-56 max-w-full sm:w-72 lg:w-80">
              <Logo priority className="h-auto w-full drop-shadow-[0_6px_18px_#000]" />
            </h1>
            <p className="max-w-md font-serif text-lg leading-snug text-[var(--atlas-title)] [text-shadow:0_2px_6px_#000] sm:text-xl">
              Dẹp loạn mười hai sứ quân, dựng lại giang sơn Đại Việt.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              {plan ? (
                <>
                  <HeroLink action={plan.primary} className="home-cta px-7 text-base font-bold tracking-[0.1em] uppercase sm:text-lg" />
                  {plan.secondary && <HeroLink action={plan.secondary} className="home-secondary px-6 font-semibold" />}
                </>
              ) : (
                /* Khung chờ cùng kích thước với nút chính để bố cục không nhảy khi hồ sơ tải xong. */
                <span aria-busy="true" role="status" className="home-cta flex min-h-12 animate-pulse items-center justify-center rounded-lg px-7 font-serif text-base font-bold tracking-[0.1em] whitespace-nowrap uppercase opacity-60 sm:text-lg">
                  Đang chuẩn bị…
                </span>
              )}
            </div>
            {plan?.hint && (
              <p className="max-w-md text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90 [text-shadow:0_1px_3px_#000]">{plan.hint}</p>
            )}
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
              <li key={m.scene} className={m.featured ? "sm:col-span-2 lg:col-span-3" : undefined}>
                <ModeCard mode={m} locked={locked(m.scene)} needsLogin={!account && ONLINE_RANKED.includes(m.scene)} />
              </li>
            ))}
          </ul>
        </section>

        {UPCOMING.length > 0 && (
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
        )}

        <section aria-labelledby="home-more">
          <SectionHeading id="home-more" kicker="Tiện ích" title="Quân vụ" />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

/** Nút ở hero: dạng viên chữ serif, cùng chiều cao 48px; `className` quyết định nút chính hay phụ. */
function HeroLink({ action, className }: { action: HeroAction; className: string }) {
  return (
    <SceneLink scene={action.scene} params={action.params} className={`${className} flex min-h-12 items-center justify-center rounded-lg font-serif whitespace-nowrap`}>
      {action.label}
    </SceneLink>
  );
}

function SectionHeading({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-caption font-semibold tracking-[0.25em] text-[var(--atlas-gold)] uppercase">{kicker}</p>
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
      <div className={`relative aspect-[5/2] overflow-hidden rounded-t-[0.65rem] sm:aspect-[16/9] ${mode.featured ? "lg:aspect-[5/1]" : "lg:aspect-[2/1]"}`}>
        <Image
          src={mode.art ? `/art/home/${mode.art}.webp` : "/art/campaign/rail-ink.webp"}
          alt=""
          fill
          sizes={mode.featured ? "(min-width: 1024px) 1280px, 100vw" : "(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"}
          className={`object-cover transition duration-300 motion-reduce:transition-none ${mode.art ? "" : "object-bottom opacity-70 sepia-[.4]"} ${locked ? "grayscale-[85%] brightness-50" : "group-hover:scale-[1.03]"}`}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-wood-lo via-wood-lo/25 to-transparent" />
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
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-sm">
          {locked ? (
            <span className="flex items-center gap-1.5 text-[var(--atlas-muted)]">
              <LockGlyph /> {mode.lockedText ?? "Sắp khai mở · tiến trình vẫn được giữ"}
            </span>
          ) : (
            <>
              <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[var(--atlas-muted)]">
                {needsLogin && <LockGlyph />}
                <span className="leading-tight">{needsLogin ? "Đăng nhập để ghi danh xếp hạng" : mode.status}</span>
              </span>
              <span className="home-enter flex shrink-0 items-center gap-1 rounded-full border border-frame-gold/50 bg-black/30 px-3 py-1 font-serif font-semibold transition group-hover:border-frame-gold group-hover:bg-frame-gold/20">
                {needsLogin ? "Đăng nhập" : mode.cta} <span aria-hidden>›</span>
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
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-wood-lo via-wood-lo/20 to-transparent" />
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
            <span className="text-[var(--atlas-muted)]">{mode.note ?? "Chơi thường · có xếp hạng khi bật"}</span>
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
