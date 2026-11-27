"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BottomSheet, FitPages, FrameInset, OrnateFrame, type FitUnit } from "@/components/game-ui";
import { DESKTOP_FIT_QUERY, PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { Button, choiceVariants, Tabs } from "@/components/ui";
import { ElementIcon, SuLoAidIcon } from "./art/icons";
import { TileArt } from "./art/tiles";
import { Glyph } from "./formation/pieces";
import { pieceArt } from "./tam-quan-ky/parts";
import { ReachDiagram } from "./tam-quan-ky/ReachDiagram";
import { FactionFlag, STATE_COLOR } from "./campaign/WorldMap";
import { MODE_GUIDES, type GuideIcon, type GuideItems, type GuideScene, type ModeGuide as ModeGuideData } from "./modeGuides";

const SECTIONS: readonly { readonly key: Exclude<keyof ModeGuideData, "goal" | "items" | "places">; readonly title: string }[] = [
  { key: "steps", title: "Cách chơi" },
  { key: "rules", title: "Luật cần nhớ" },
  { key: "rewards", title: "Ban thưởng" },
  { key: "tips", title: "Mẹo nhỏ" },
];

/** Icon đạo cụ trong Hướng dẫn, cùng hình với nút đạo cụ ở màn chơi. */
function GuideItemIcon({ icon }: { icon: GuideIcon }) {
  const box = "size-10 shrink-0";
  if (icon.kind === "element") return <ElementIcon element={icon.element} className={box} />;
  if (icon.kind === "suLoAid") return <SuLoAidIcon aid={icon.aid} className={box} />;
  if (icon.kind === "tile") return <TileArt kind={icon.tile} className={box} />;
  if (icon.kind === "stronghold")
    return <FactionFlag id={icon.id} color={icon.id === "hoaLu" ? STATE_COLOR.hq : STATE_COLOR.unresolved} className="h-10 w-7 shrink-0" />;
  // eslint-disable-next-line @next/next/no-img-element -- tranh quân nhỏ, cùng ảnh với sa bàn
  if (icon.kind === "tqkPiece") return <img src={pieceArt(icon.piece)} alt="" className={`${box} rounded-full`} />;
  return (
    <span className={`${box} block`}>
      <Glyph kind={icon.piece} />
    </span>
  );
}

/** Một món trong mục đạo cụ hoặc địa điểm: icon, tên, cách dùng. */
function GuideItemRow({ item, ...rest }: { item: GuideItems["list"][number] } & Record<`data-${string}`, unknown>) {
  // `rest`: dấu đo của FitPages (data-fit-unit) phải nằm trên chính thẻ li.
  return (
    <li {...rest} className="flex items-start gap-3 rounded-md border border-frame-bronze/40 bg-black/15 p-2">
      <GuideItemIcon icon={item.icon} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-title-on-wood">{item.name}</p>
        <p className="text-sm text-on-wood">{item.text}</p>
      </div>
      {item.icon.kind === "tqkPiece" && <ReachDiagram type={item.icon.piece} className="size-28 shrink-0 sm:size-32" />}
    </li>
  );
}

/** Mục đạo cụ: luật chung rồi từng món kèm icon, tên và cách dùng. */
function GuideItemsSection({ items }: { items: GuideItems }) {
  return (
    <FrameInset className="flex flex-col gap-3 p-3">
      <h3 className="text-base font-bold text-frame-gold">{items.title}</h3>
      {items.notes.length > 0 && (
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-on-wood">
          {items.notes.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <ul className="grid gap-2 sm:grid-cols-2" aria-label={items.title}>
        {items.list.map((item) => <GuideItemRow key={item.name} item={item} />)}
      </ul>
    </FrameInset>
  );
}

/** Một dòng hướng dẫn; phần phím tắt ("Bàn phím: …") ẩn trên màn cảm ứng (quy tắc điện thoại 21/11/2026). */
function GuideText({ text }: { text: string }) {
  const at = text.indexOf("Bàn phím:");
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="pointer-coarse:hidden">{text.slice(at)}</span>
    </>
  );
}

/**
 * Chế độ đã qua màn hướng dẫn trong lần vào này. Vào một chế độ từ Chiến Trường thì gặp Hướng dẫn trước (Shan chốt
 * 19/11/2026); đã bấm "Vào chơi" thì quay lại màn sau một trận vẫn ở thẻ Chơi. Về Chiến Trường thì xóa để lần vào sau
 * lại gặp Hướng dẫn. Tải lại trang cũng xóa (bộ nhớ trong phiên chạy).
 */
const entered = new Set<GuideScene>();

/** Gọi khi về Chiến Trường: lần vào chế độ tiếp theo mở Hướng dẫn trước. */
export function resetModeGuides(): void {
  entered.clear();
}

/** Chế độ còn phải mở Hướng dẫn trước không. */
export function guideFirst(scene: GuideScene): boolean {
  return !entered.has(scene);
}

/** Đánh dấu đã qua Hướng dẫn của chế độ. */
export function markGuideSeen(scene: GuideScene): void {
  entered.add(scene);
}

/** Nội dung Hướng dẫn của một chế độ: mục tiêu, các bước, luật, thưởng, mẹo. Dùng cả ở màn có thẻ riêng (Bình Loạn, Trận Đồ). */
export function ModeGuidePanel({ scene, headingId, onPlay, bare, paged }: {
  scene: GuideScene;
  headingId?: string;
  onPlay?: () => void;
  /** Không bọc khung (trong bảng trượt đáy đã có khung). */
  bare?: boolean;
  /**
   * Khung cha cao cố định (màn chế độ vừa một màn hình, Shan chốt 28/11/2026): chia Hướng dẫn thành trang trên máy
   * tính rộng, nút "Vào chơi" luôn ở đáy. Màn hẹp vẫn hiện hết.
   */
  paged?: boolean;
}) {
  const fit = useMediaQuery(DESKTOP_FIT_QUERY);
  if (paged) return <PagedGuide scene={scene} headingId={headingId} onPlay={onPlay} enabled={fit} />;
  const guide = MODE_GUIDES[scene];
  const Frame = bare ? "div" : OrnateFrame;
  return (
    <Frame className="flex flex-col gap-4" aria-labelledby={headingId}>
      <section className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-bold text-title-on-wood">
          Mục tiêu
        </h2>
        <p className="text-on-wood">{guide.goal}</p>
      </section>
      {SECTIONS.flatMap(({ key, title }) => {
        const items = guide[key];
        // Mục đạo cụ đứng ngay sau Luật cần nhớ, trước Ban thưởng.
        const after =
          key === "rules"
            ? [guide.items, guide.places].flatMap((g, i) => (g ? [<GuideItemsSection key={`items${i}`} items={g} />] : []))
            : [];
        if (items.length === 0) return after;
        const List = key === "steps" ? "ol" : "ul";
        return [
          <FrameInset key={key} className="flex flex-col gap-2 p-3">
            <h3 className="text-base font-bold text-frame-gold">{title}</h3>
            <List className={`flex flex-col gap-1.5 pl-5 text-on-wood ${key === "steps" ? "list-decimal" : "list-disc"}`}>
              {items.map((text) => (
                <li key={text}><GuideText text={text} /></li>
              ))}
            </List>
          </FrameInset>,
          ...after,
        ];
      })}
      {onPlay && (
        <Button className="min-h-11 self-center px-8" onClick={onPlay}>
          Vào chơi
        </Button>
      )}
    </Frame>
  );
}

/**
 * Hướng dẫn chia trang: mỗi dòng (bước, luật, đạo cụ) là một khối; khối cùng mục bọc chung khung, sang trang thì khung
 * lặp tiêu đề kèm chữ "tiếp". Thứ tự mục giống bản đầy đủ.
 */
function PagedGuide({ scene, headingId, onPlay, enabled }: { scene: GuideScene; headingId?: string; onPlay?: () => void; enabled: boolean }) {
  const guide = MODE_GUIDES[scene];
  const units: FitUnit[] = [
    {
      key: "goal",
      node: (
        <section className="flex flex-col gap-1">
          <h2 id={headingId} className="text-lg font-bold text-title-on-wood">Mục tiêu</h2>
          <p className="text-on-wood">{guide.goal}</p>
        </section>
      ),
    },
  ];
  const titles: Record<string, string> = {};
  for (const { key, title } of SECTIONS) {
    guide[key].forEach((text, i) => units.push({ key: `${key}${i}`, group: key, node: <li><GuideText text={text} /></li> }));
    titles[key] = title;
    if (key !== "rules") continue;
    for (const [name, items] of [["items", guide.items], ["places", guide.places]] as const) {
      if (!items) continue;
      titles[name] = items.title;
      if (items.notes.length)
        units.push({
          key: `${name}-notes`,
          group: name,
          node: (
            <li className="sm:col-span-2">
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-on-wood">
                {items.notes.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </li>
          ),
        });
      items.list.forEach((item) => units.push({ key: `${name}-${item.name}`, group: name, node: <GuideItemRow item={item} /> }));
    }
  }
  const steps = new Set<string>(["steps"]);
  const firstStep = units.findIndex((u) => u.group === "steps");
  return (
    <OrnateFrame className="flex min-h-0 flex-1 flex-col" aria-labelledby={headingId}>
      <FitPages
        className="flex-1"
        enabled={enabled}
        label="Trang Hướng dẫn"
        units={units}
        groupWrap={(group, items, continued, from) => {
          const title = `${titles[group] ?? ""}${continued ? " (tiếp)" : ""}`;
          if (group === "items" || group === "places")
            return (
              <FrameInset className="flex flex-col gap-3 p-3">
                <h3 className="text-base font-bold text-frame-gold">{title}</h3>
                <ul className="grid gap-2 sm:grid-cols-2" aria-label={titles[group]}>{items}</ul>
              </FrameInset>
            );
          const List = steps.has(group) ? "ol" : "ul";
          return (
            <FrameInset className="flex flex-col gap-2 p-3">
              <h3 className="text-base font-bold text-frame-gold">{title}</h3>
              <List start={List === "ol" ? from - firstStep + 1 : undefined}
                className={`flex flex-col gap-1.5 pl-5 text-on-wood ${List === "ol" ? "list-decimal" : "list-disc"}`}>{items}</List>
            </FrameInset>
          );
        }}
        footer={
          onPlay && (
            <Button className="mt-3 min-h-11 self-center px-8" onClick={onPlay}>
              Vào chơi
            </Button>
          )
        }
      />
    </OrnateFrame>
  );
}

/** Khóa localStorage: chế độ đã tự mở bảng Hướng dẫn trên điện thoại một lần. */
const SHEET_SEEN_KEY = "co-lau:guide-sheet-seen";

/** Đọc danh sách chế độ đã xem bảng Hướng dẫn; không đọc được bộ nhớ thì coi như đã xem (không tự mở). */
function sheetSeen(scene: GuideScene): boolean {
  try {
    return (JSON.parse(localStorage.getItem(SHEET_SEEN_KEY) ?? "[]") as string[]).includes(scene);
  } catch {
    return true;
  }
}

function markSheetSeen(scene: GuideScene): void {
  try {
    const seen = new Set<string>(JSON.parse(localStorage.getItem(SHEET_SEEN_KEY) ?? "[]") as string[]);
    seen.add(scene);
    localStorage.setItem(SHEET_SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Bộ nhớ bị chặn: lần sau lại tự mở, không sao.
  }
}

/** Nút "?" mở Hướng dẫn dạng bảng trượt đáy trên điện thoại (Shan chọn 5B, 21/11/2026). */
export function GuideSheetButton({ scene }: { scene: GuideScene }) {
  const [open, setOpen] = useState(false);
  // Lần đầu vào chế độ trên trình duyệt này thì tự mở; chỉ ghi nhớ khi người chơi đóng bảng, để màn dựng lại (đang
  // tải xong) vẫn mở tiếp chứ không chớp rồi mất.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ với localStorage sau khi gắn vào trang
    if (!sheetSeen(scene)) setOpen(true);
  }, [scene]);
  const close = () => {
    markSheetSeen(scene);
    setOpen(false);
  };
  return (
    <>
      <button type="button" aria-label="Hướng dẫn" aria-haspopup="dialog" onClick={() => setOpen(true)}
        className={choiceVariants({ className: "size-11 shrink-0 px-0 font-bold" })}>
        ?
      </button>
      <BottomSheet open={open} onClose={close} title="Hướng dẫn">
        <ModeGuidePanel scene={scene} bare onPlay={close} />
      </BottomSheet>
    </>
  );
}

/** Thẻ riêng của một màn, nằm giữa "Chơi" và "Hướng dẫn" (ví dụ bảng xếp hạng tuần của Tháp Thiên Mệnh). */
export interface ModeExtraTab {
  readonly value: string;
  readonly label: string;
  readonly content: ReactNode;
}

/**
 * Thay thẻ "Chơi" bằng nhiều thẻ chơi (ví dụ Thường / Hạng tuần của Tầm Tướng Ký, Shan 20/11/2026): chọn một thẻ thì
 * về nội dung chơi và báo `onChange`; màn tự đổi nội dung theo `value`.
 */
export interface ModePlayTabs {
  readonly items: readonly { readonly value: string; readonly label: string }[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/**
 * Thêm thẻ Hướng dẫn cho màn chế độ: hai thẻ "Chơi" và "Hướng dẫn" nằm dưới banner. Vào chế độ thì mở Hướng dẫn
 * trước (nút "Vào chơi" ở cuối), xem `guideFirst`. Thẻ Chơi giữ nguyên nội dung màn; chọn Hướng dẫn thì thay bằng
 * luật và thưởng của chế độ. Không gọi API, chuyển thẻ không mất tiến độ ván.
 * `extraTabs` chèn thẻ riêng của màn vào giữa hai thẻ đó; nội dung thẻ chỉ dựng khi được chọn.
 */
export function ModeGuideTabs({ scene, extraTabs = [], playTabs, children }: {
  scene: GuideScene;
  extraTabs?: readonly ModeExtraTab[];
  /** Nhiều thẻ chơi thay cho một thẻ "Chơi". */
  playTabs?: ModePlayTabs;
  children: ReactNode;
}) {
  // Điện thoại: không có thẻ Hướng dẫn, thay bằng nút "?" mở bảng trượt đáy (Shan chọn 5B, 21/11/2026).
  const phone = useMediaQuery(PHONE_QUERY);
  const [view, setViewState] = useState<string>(() => (guideFirst(scene) ? "guide" : "play"));
  const setView = (next: string) => {
    if (next !== "guide") markGuideSeen(scene);
    setViewState(next);
  };
  const shown = phone && view === "guide" ? "play" : view;
  const extra = extraTabs.find((tab) => tab.value === shown);
  const plays = playTabs?.items ?? [{ value: "play", label: "Chơi" }];
  const pick = (next: string) => {
    if (playTabs?.items.some((tab) => tab.value === next)) {
      setView("play");
      playTabs.onChange(next);
    } else setView(next);
  };
  return (
    <>
      <div className="flex items-center gap-2">
        <Tabs<string>
          label="Màn chế độ"
          className="flex-1 max-sm:min-w-0"
          value={shown === "play" ? (playTabs?.value ?? "play") : shown}
          onChange={pick}
          items={[
            ...plays,
            ...extraTabs.map(({ value, label }) => ({ value, label })),
            ...(phone ? [] : [{ value: "guide", label: "Hướng dẫn" }]),
          ]}
        />
        {phone && <GuideSheetButton scene={scene} />}
      </div>
      {shown === "guide" ? <ModeGuidePanel scene={scene} onPlay={() => setView("play")} /> : extra ? extra.content : children}
    </>
  );
}
