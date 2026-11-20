"use client";

// Màn cấm chọn công khai của Đấu người 3vs3 xếp hạng: hai phe thấy mọi lượt cấm và chọn, tới lượt mình thì cấm một tướng (hoặc
// một hệ, nghề của Đinh Bộ Lĩnh) hoặc chọn tướng của mình. Máy chủ giữ đồng hồ và tự cấm, tự chọn thay khi hết giờ.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ELEMENTS, MAIN_ID, PROFESSIONS, PVP_DRAFT_TURN_MS, type DraftBan, type Element, type Profession } from "@/core";
import type { PvpDraftView } from "@/server/pvpDraft";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { FrameInset, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { cn } from "@/lib/cn";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import HeroGrid from "./HeroGrid";
import LeaderBuildPicker from "./LeaderBuildPicker";

const POLL_MS = 1000;

type Json = Record<string, unknown>;

async function call(url: string, body?: unknown): Promise<{ status: number; data: Json }> {
  try {
    const res = await fetch(url, {
      ...(body === undefined ? {} : { method: "POST", body: JSON.stringify(body) }),
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });
    return { status: res.status, data: (await res.json().catch(() => ({}))) as Json };
  } catch {
    return { status: 0, data: { error: "network" } };
  }
}

const ERROR_TEXT: Record<string, string> = {
  network: "Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin kiểm tra mạng rồi thử lại.",
  notYourTurn: "Chưa đến lượt bạn.",
  draftOver: "Cấm chọn đã xong.",
  badBan: "Không cấm được mục này (đã bị cấm hoặc không hợp lệ).",
  banned: "Tướng, hệ hoặc nghề này đã bị cấm.",
  badHero: "Bạn không chọn được tướng này.",
  heroTaken: "Phe của bạn đã có tướng này.",
  dblTaken: "Đinh Bộ Lĩnh đã có người chọn trong trận này.",
  badBuild: "Nghề hoặc hệ không hợp lệ.",
  notCaptain: "Chỉ đội trưởng mới xếp được vị trí.",
  badSlot: "Vị trí không hợp lệ.",
  notPrep: "Chưa tới bước chuẩn bị.",
  conflict: "Máy chủ đang bận. Xin thử lại sau giây lát.",
  notFound: "Không tìm thấy phiên cấm chọn này.",
};

const banLabel = (b: PvpDraftView["bans"][number]) =>
  b.kind === "element" ? `Hệ ${ELEMENT_NAME[b.value as Element]}` : b.kind === "profession" ? `Nghề ${PROFESSION_NAME[b.value as keyof typeof PROFESSION_NAME] ?? b.value}` : b.name;

export default function PvpDraftScreen({ id, onMatch, onExit }: { id: string; onMatch: (matchId: string) => void; onExit: () => void }) {
  const [view, setView] = useState<PvpDraftView | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [banPick, setBanPick] = useState("");
  const [heroPick, setHeroPick] = useState<string | null>(null);
  const [build, setBuild] = useState<{ element?: Element; profession?: Profession }>({});

  const apply = useCallback((r: { status: number; data: Json }) => {
    if (r.status === 200) {
      const v = r.data.view as PvpDraftView;
      setView(v);
      setOffset(v.serverNow - Date.now());
      setMessage("");
      return true;
    }
    setMessage(ERROR_TEXT[String(r.data.error)] ?? "Có trục trặc chưa rõ. Xin thử lại.");
    return false;
  }, []);

  useEffect(() => {
    const poll = async () => apply(await call(`/api/pvp/draft/${id}`));
    void poll();
    const t = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(t);
  }, [id, apply]);

  useEffect(() => {
    const t = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  const matchId = view?.matchId ?? null;
  useEffect(() => {
    if (matchId) onMatch(matchId);
  }, [matchId, onMatch]);

  const send = async (body: Json) => {
    setBusy(true);
    const ok = apply(await call(`/api/pvp/draft/${id}`, body));
    setBusy(false);
    return ok;
  };

  const choices = useMemo(() => view?.choices ?? [], [view]);
  if (!view) return <p role="status" className="text-on-wood-soft">Đang vào phòng cấm chọn…</p>;

  const mine = view.turn?.mine ?? false;
  const remain = view.turn ? Math.max(0, Math.ceil((view.turn.deadline - (clockNow + offset)) / 1000)) : 0;
  const sideName = (side: number) => (side === view.mySide ? "Phe của bạn" : "Phe đối thủ");
  const chosen = choices.find((c) => c.hero.id === (heroPick ?? ""))?.hero ?? null;
  const bannedElements = view.bans.filter((b) => b.kind === "element").map((b) => b.value as Element);
  const bannedProfessions = view.bans.filter((b) => b.kind === "profession").map((b) => b.value as Profession);
  /** Lựa chọn còn dùng được: ưu tiên mục người chơi vừa chọn, rồi theo hồ sơ, bị cấm thì lấy mục đầu chưa bị cấm. */
  const usable = <T extends string>(wanted: T | undefined, fallback: T, all: readonly T[], banned: readonly T[]): T =>
    [wanted, fallback, ...all].find((x): x is T => x !== undefined && !banned.includes(x)) ?? fallback;
  const pickBuild = chosen?.id === MAIN_ID
    ? {
        element: usable(build.element, chosen.element, ELEMENTS, bannedElements),
        profession: usable(build.profession, chosen.profession, PROFESSIONS, bannedProfessions),
      }
    : null;
  const [banKind, banValue] = banPick.split(":");
  const banName = !banPick ? "" : banKind === "hero" ? view.roster.find((h) => h.id === banValue)?.name ?? "" : banKind === "element" ? `hệ ${ELEMENT_NAME[banValue as Element]}` : `nghề ${PROFESSION_NAME[banValue as Profession]}`;

  const doBan = () => {
    if (!banKind || !banValue) return;
    const ban: DraftBan = banKind === "hero" ? { kind: "hero", id: banValue } : banKind === "element" ? { kind: "element", value: banValue as Element } : { kind: "profession", value: banValue as Profession };
    void send({ type: "ban", ban }).then((ok) => ok && setBanPick(""));
  };

  const doPick = () => {
    if (!chosen) return;
    void send({
      type: "pick",
      hero: chosen.id,
      ...(pickBuild ? { element: pickBuild.element, profession: pickBuild.profession } : {}),
    }).then((ok) => ok && setHeroPick(null));
  };

  return (
    <OrnateFrame level="raised" className="flex flex-col gap-4">
      <SectionTitle description="Phe có điểm cao hơn cấm trước, phe có điểm thấp hơn chọn trước. Mỗi phe cấm 3 lần. Đinh Bộ Lĩnh chỉ bị cấm theo hệ hoặc nghề, và cả trận chỉ một người được chọn.">
        Cấm chọn tướng
      </SectionTitle>
      {message && <Alert role="alert">{message}</Alert>}

      <FrameInset className={cn("flex flex-col gap-2", mine && "border-frame-gold")}>
        <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-2">
          {view.turn ? (
            <p className={cn("font-bold", mine ? "text-frame-gold" : "text-on-wood")}>
              {view.turn.mine ? "Đến lượt bạn " : `Lượt của ${view.turn.name} (${sideName(view.turn.side)}) `}
              {view.turn.kind === "ban" ? "cấm" : "chọn"}
            </p>
          ) : view.prep ? (
            <p className="font-bold text-on-wood">Chuẩn bị trận</p>
          ) : (
            <p className="text-on-wood">Đang dựng trận…</p>
          )}
          {(view.turn || view.prep) && (
            <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums", (view.turn ? remain : 99) <= 5 ? "bg-danger/20 text-danger" : "bg-black/30 text-on-wood")}>
              {view.turn ? remain : Math.max(0, Math.ceil((view.prep!.deadline - (clockNow + offset)) / 1000))} giây
            </span>
          )}
        </div>
        {view.turn && (
          <div className="h-1.5 overflow-hidden rounded-full bg-black/40" aria-hidden>
            <div className={cn("h-full transition-[width]", remain <= 5 ? "bg-danger" : "bg-frame-gold")} style={{ width: `${Math.min(100, (100 * remain * 1000) / PVP_DRAFT_TURN_MS)}%` }} />
          </div>
        )}
        <ol className="flex flex-wrap gap-1" aria-label="Tiến trình cấm chọn">
          {view.steps.map((s, i) => (
            <li
              key={i}
              title={`${s.kind === "ban" ? "Cấm" : "Chọn"}, ${s.name}`}
              className={cn(
                "rounded px-1.5 py-0.5 text-caption font-semibold",
                s.current ? "bg-frame-gold text-wood-lo" : s.done ? "bg-black/30 text-on-wood-soft line-through decoration-1" : "bg-wood-inset text-on-wood-soft",
                s.side === view.mySide ? "ring-1 ring-jade/50" : "ring-1 ring-danger/40",
              )}
            >
              {s.kind === "ban" ? "Cấm" : "Chọn"}
            </li>
          ))}
        </ol>
        <p className="text-caption text-on-wood-soft">Viền xanh là lượt phe bạn, viền đỏ là lượt phe đối thủ.</p>
      </FrameInset>

      <div className="grid gap-3 md:grid-cols-2">
        {([view.mySide, (1 - view.mySide) as 0 | 1] as const).map((side) => {
          const picks = view.picks.filter((p) => p.side === side);
          const bans = view.bans.filter((b) => b.side === side);
          return (
            <FrameInset key={side} className={cn("flex flex-col gap-2", side === view.mySide ? "border-jade/40" : "border-danger/30")}>
              <div>
                <p className={cn("font-bold", side === view.mySide ? "text-jade" : "text-danger")}>{sideName(side)}</p>
                <p className="text-caption text-on-wood-soft">
                  {view.humans.filter((h) => h.side === side).map((h) => (h.mine ? `${h.name} (bạn)` : h.name)).join(", ")}
                </p>
              </div>
              <ul className="grid grid-cols-3 gap-1.5" aria-label={`Tướng đã chọn của ${sideName(side).toLowerCase()}`}>
                {[0, 1, 2].map((slot) => {
                  const p = picks[slot];
                  return (
                    <li key={slot} className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-frame-line-soft bg-black/20 p-1.5 text-center">
                      {p ? (
                        <>
                          <Portrait id={p.hero.id} element={p.hero.element} profession={p.hero.profession} className="size-11" />
                          <span className="w-full truncate text-caption font-semibold text-on-wood">{p.hero.name}</span>
                          <span className="w-full truncate text-caption text-on-wood-soft">cấp {p.hero.level}, {p.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="grid size-11 place-items-center rounded-full border border-dashed border-frame-gold/40 text-on-wood-soft">?</span>
                          <span className="text-caption text-on-wood-soft">Chưa chọn</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div>
                <p className="text-caption text-on-wood-soft">Đã cấm</p>
                {bans.length === 0 ? (
                  <p className="text-sm text-on-wood-soft">Chưa có</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {bans.map((b, i) => (
                      <li key={i} className="flex items-center gap-1 rounded bg-danger/15 px-2 py-0.5 text-caption text-on-wood">
                        {b.kind === "element" ? <ElementIcon element={b.value as Element} className="size-3.5" /> : b.kind === "profession" ? <ProfessionIcon profession={b.value as Profession} className="size-3.5" /> : null}
                        <span className="line-through decoration-danger">{banLabel(b)}</span>
                        {b.auto && <span className="text-on-wood-soft">(máy)</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FrameInset>
          );
        })}
      </div>

      {mine && view.turn?.kind === "ban" && (
        <section className="flex flex-col gap-3" aria-label="Lượt cấm của bạn">
          <h3 className="font-bold text-title-on-wood">Chọn một mục để cấm</h3>
          <div className="flex flex-col gap-2">
            <p className="text-caption text-on-wood-soft">Cấm hệ hoặc nghề của Đinh Bộ Lĩnh</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cấm hệ của Đinh Bộ Lĩnh">
              {ELEMENTS.filter((e) => !bannedElements.includes(e)).map((e) => (
                <ChoiceChip key={e} selected={banPick === `element:${e}`} disabled={busy} className="gap-1" onClick={() => setBanPick(`element:${e}`)}>
                  <ElementIcon element={e} className="size-4" />
                  Hệ {ELEMENT_NAME[e]}
                </ChoiceChip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cấm nghề của Đinh Bộ Lĩnh">
              {PROFESSIONS.filter((x) => !bannedProfessions.includes(x)).map((x) => (
                <ChoiceChip key={x} selected={banPick === `profession:${x}`} disabled={busy} className="gap-1" onClick={() => setBanPick(`profession:${x}`)}>
                  <ProfessionIcon profession={x} className="size-4" />
                  Nghề {PROFESSION_NAME[x]}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <p className="text-caption text-on-wood-soft">Hoặc cấm một tướng</p>
          <HeroGrid
            label="Tướng có thể cấm"
            items={view.roster}
            selected={banKind === "hero" ? banValue ?? null : null}
            onSelect={(heroId) => setBanPick(`hero:${heroId}`)}
            disabled={busy}
          />
          <div className="sticky bottom-2 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-wood-lo/95 p-2 shadow-lg">
            <Button disabled={busy || !banPick} onClick={doBan} className="min-h-11">
              {banPick ? `Cấm ${banName}` : "Chọn mục để cấm"}
            </Button>
            <span className="text-caption text-on-wood-soft">Còn {remain} giây; hết giờ máy cấm ngẫu nhiên.</span>
          </div>
        </section>
      )}

      {mine && view.turn?.kind === "pick" && (
        <section className="flex flex-col gap-3" aria-label="Lượt chọn của bạn">
          <h3 className="font-bold text-title-on-wood">Chọn một tướng của bạn</h3>
          <HeroGrid
            label="Tướng của bạn"
            items={choices.map((c) => ({
              ...c.hero,
              blocked: c.error === "banned" ? "Đã bị cấm" : c.error === "heroTaken" ? "Phe đã có" : c.error === "dblTaken" ? "Đã có người chọn" : c.error ? "Không chọn được" : null,
            }))}
            selected={heroPick}
            onSelect={setHeroPick}
            disabled={busy}
          />
          {chosen && pickBuild && (
            <FrameInset>
              <LeaderBuildPicker
                element={pickBuild.element}
                profession={pickBuild.profession}
                onChange={setBuild}
                bannedElements={bannedElements}
                bannedProfessions={bannedProfessions}
                disabled={busy}
                note="Hệ và nghề bị gạch là đã bị cấm. Cấp và trang bị theo Doanh Trại."
              />
            </FrameInset>
          )}
          <div className="sticky bottom-2 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-wood-lo/95 p-2 shadow-lg">
            <Button disabled={busy || !chosen} onClick={doPick} className="min-h-11">
              {chosen ? `Chọn ${chosen.name}` : "Chọn một tướng"}
            </Button>
            <span className="text-caption text-on-wood-soft">Còn {remain} giây; hết giờ máy chọn thay.</span>
          </div>
        </section>
      )}

      {view.prep && (
        <section className="flex flex-col gap-3" aria-label="Chuẩn bị">
          <p className="text-sm text-on-wood-soft">
            Vị trí 1 đánh đầu tiên khi tới lượt phe. Đội trưởng ({view.prep.captainName}) xếp vị trí cho cả phe. Trận lấy cấp và trang bị theo hồ sơ lúc hết giờ chuẩn bị: bạn có thể đổi trang bị trong lúc chờ.
          </p>
          <ol className="flex flex-col gap-2">
            {view.prep.lineup.map((slot, i) => (
              <li key={i}>
                <FrameInset className="flex flex-wrap items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-frame-gold/20 font-bold text-frame-gold">{i + 1}</span>
                  <Portrait id={slot.hero.id} element={slot.hero.element} profession={slot.hero.profession} className="size-11 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-on-wood">{slot.hero.name} <span className="font-normal text-on-wood-soft">– cấp {slot.hero.level}</span></p>
                    <p className="flex flex-wrap items-center gap-1 text-caption text-on-wood-soft">
                      <ElementIcon element={slot.hero.element} className="size-3.5" />
                      {ELEMENT_NAME[slot.hero.element]}, {PROFESSION_NAME[slot.hero.profession]}, {slot.mine ? "bạn" : (slot.name ?? "máy điều khiển")}
                    </p>
                  </div>
                  {view.prep!.captain && (
                    <span className="flex gap-2">
                      <Button size="sm" variant="secondary" disabled={busy || i === 0} aria-label={`Đưa vị trí ${i + 1} lên`} onClick={() => void send({ type: "swap", a: i, b: i - 1 })}>
                        Lên
                      </Button>
                      <Button size="sm" variant="secondary" disabled={busy || i === view.prep!.lineup.length - 1} aria-label={`Đưa vị trí ${i + 1} xuống`} onClick={() => void send({ type: "swap", a: i, b: i + 1 })}>
                        Xuống
                      </Button>
                    </span>
                  )}
                </FrameInset>
              </li>
            ))}
          </ol>
          <div>
            <p className="mb-1 text-caption text-on-wood-soft">Phe đối thủ</p>
            <ul className="flex flex-wrap gap-2">
              {[...view.prep.foes].sort((a, b) => a.hero.name.localeCompare(b.hero.name, "vi")).map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 rounded bg-black/20 px-2 py-1 text-sm text-on-wood">
                  <Portrait id={f.hero.id} element={f.hero.element} profession={f.hero.profession} className="size-8" />
                  {f.hero.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={busy || view.prep.youReady} onClick={() => void send({ type: "ready" })}>
              {view.prep.youReady ? "Đã sẵn sàng" : "Sẵn sàng"}
            </Button>
            <a className="text-title-on-wood underline" href="/game/profile" target="_blank" rel="noopener noreferrer">
              Mở Doanh Trại để đổi trang bị (cửa sổ mới)
            </a>
            <p className="text-sm text-on-wood-soft">Đã sẵn sàng: {view.prep.readyNames.join(", ") || "chưa ai"}</p>
          </div>
        </section>
      )}
      {!mine && view.turn && <p className="text-sm text-on-wood-soft">Hết giờ thì máy tự cấm ngẫu nhiên hoặc chọn thay. Cấp và trang bị theo hồ sơ của từng tướng.</p>}
      {view.status === "abandoned" && (
        <div className="flex flex-col gap-2">
          <Alert role="alert">Không dựng được trận vì một phe không có ai chọn được tướng. Mọi người đã rời hàng đợi, hãy ghép lại.</Alert>
          <Button variant="secondary" onClick={onExit}>
            Quay lại
          </Button>
        </div>
      )}
    </OrnateFrame>
  );
}
