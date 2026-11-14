"use client";

// Màn cấm chọn công khai của Đấu người 3vs3 xếp hạng: hai phe thấy mọi lượt cấm và chọn, tới lượt mình thì cấm một tướng (hoặc
// một hệ, nghề của Đinh Bộ Lĩnh) hoặc chọn tướng của mình. Máy chủ giữ đồng hồ và tự cấm, tự chọn thay khi hết giờ.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ELEMENTS, MAIN_ID, PROFESSIONS, type DraftBan, type Element, type Profession } from "@/core";
import type { PvpDraftView } from "@/server/pvpDraft";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { FrameInset, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

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
  network: "Mất kết nối tới máy chủ, hãy kiểm tra mạng.",
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
  conflict: "Máy chủ đang bận, hãy thử lại.",
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
    setMessage(ERROR_TEXT[String(r.data.error)] ?? "Có lỗi xảy ra, hãy thử lại.");
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

  const doBan = () => {
    const [kind, value] = banPick.split(":");
    if (!kind || !value) return;
    const ban: DraftBan = kind === "hero" ? { kind: "hero", id: value } : kind === "element" ? { kind: "element", value: value as Element } : { kind: "profession", value: value as Profession };
    void send({ type: "ban", ban }).then((ok) => ok && setBanPick(""));
  };

  const doPick = () => {
    if (!chosen) return;
    void send({
      type: "pick",
      hero: chosen.id,
      ...(chosen.id === MAIN_ID ? { element: build.element ?? chosen.element, profession: build.profession ?? chosen.profession } : {}),
    }).then((ok) => ok && setHeroPick(null));
  };

  return (
    <OrnateFrame level="raised" className="flex flex-col gap-4">
      <SectionTitle description="Phe có điểm cao hơn cấm trước, phe có điểm thấp hơn chọn trước. Mỗi phe cấm 3 lần. Đinh Bộ Lĩnh chỉ bị cấm theo hệ hoặc nghề, và cả trận chỉ một người được chọn.">
        Cấm chọn tướng
      </SectionTitle>
      {message && <Alert role="alert">{message}</Alert>}
      <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-2">
        {view.turn ? (
          <p className="text-on-wood">
            {view.turn.mine ? "Đến lượt bạn " : `Lượt của ${view.turn.name} (${sideName(view.turn.side)}) `}
            {view.turn.kind === "ban" ? "cấm" : "chọn"} · còn {remain} giây
          </p>
        ) : view.prep ? (
          <p className="text-on-wood">Chuẩn bị trận · còn {Math.max(0, Math.ceil((view.prep.deadline - (clockNow + offset)) / 1000))} giây</p>
        ) : (
          <p className="text-on-wood">Đang dựng trận…</p>
        )}
        <ol className="flex gap-1" aria-label="Tiến trình">
          {view.steps.map((s, i) => (
            <li
              key={i}
              title={`${s.kind === "ban" ? "Cấm" : "Chọn"} · ${s.name}`}
              className={`h-2.5 w-5 rounded-full ${s.current ? "bg-title-on-wood" : s.done ? "bg-on-wood-soft" : "bg-wood-inset"} ${s.kind === "pick" ? "ring-1 ring-frame-line" : ""}`}
            />
          ))}
        </ol>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {([view.mySide, (1 - view.mySide) as 0 | 1] as const).map((side) => (
          <FrameInset key={side} className="flex flex-col gap-2">
            <p className="font-bold text-title-on-wood">{sideName(side)}</p>
            <p className="text-sm text-on-wood-soft">
              {view.humans.filter((h) => h.side === side).map((h) => (h.mine ? `${h.name} (bạn)` : h.name)).join(", ")}
            </p>
            <div>
              <p className="text-caption text-on-wood-soft">Đã cấm</p>
              <p className="text-on-wood">
                {view.bans.filter((b) => b.side === side).map((b) => `${banLabel(b)}${b.auto ? " (máy cấm)" : ""}`).join(" · ") || "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-caption text-on-wood-soft">Đã chọn</p>
              <ul className="text-on-wood">
                {view.picks
                  .filter((p) => p.side === side)
                  .map((p) => (
                    <li key={p.owner}>
                      {p.name}: {p.hero.name} · cấp {p.hero.level} · {PROFESSION_NAME[p.hero.profession as keyof typeof PROFESSION_NAME] ?? p.hero.profession} · {ELEMENT_NAME[p.hero.element]}
                    </li>
                  ))}
                {!view.picks.some((p) => p.side === side) && <li>Chưa có</li>}
              </ul>
            </div>
          </FrameInset>
        ))}
      </div>
      {mine && view.turn?.kind === "ban" && (
        <div className="flex flex-wrap items-end gap-3" role="group" aria-label="Cấm">
          <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
            Cấm
            <select className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood" value={banPick} onChange={(e) => setBanPick(e.target.value)}>
              <option value="">Chọn mục cần cấm</option>
              <optgroup label="Tướng">
                {view.roster.map((h) => (
                  <option key={h.id} value={`hero:${h.id}`}>
                    {h.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hệ của Đinh Bộ Lĩnh">
                {ELEMENTS.filter((e) => !view.bans.some((b) => b.kind === "element" && b.value === e)).map((e) => (
                  <option key={e} value={`element:${e}`}>
                    Hệ {ELEMENT_NAME[e]}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Nghề của Đinh Bộ Lĩnh">
                {PROFESSIONS.filter((p) => !view.bans.some((b) => b.kind === "profession" && b.value === p)).map((p) => (
                  <option key={p} value={`profession:${p}`}>
                    Nghề {PROFESSION_NAME[p as keyof typeof PROFESSION_NAME] ?? p}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <Button disabled={busy || !banPick} onClick={doBan}>
            Cấm
          </Button>
        </div>
      )}
      {mine && view.turn?.kind === "pick" && (
        <div className="flex flex-col gap-3" role="group" aria-label="Chọn tướng">
          <div className="flex flex-wrap gap-2">
            {choices.map((c) => (
              <ChoiceChip key={c.hero.id} selected={heroPick === c.hero.id} size="sm" disabled={busy || c.error !== null} onClick={() => setHeroPick(c.hero.id)}>
                {c.hero.name} · cấp {c.hero.level}
                {c.error === "banned" ? " (bị cấm)" : c.error === "heroTaken" ? " (phe đã có)" : c.error === "dblTaken" ? " (đã có người chọn)" : ""}
              </ChoiceChip>
            ))}
          </div>
          {chosen?.id === MAIN_ID && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
                Nghề
                <select
                  className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                  value={build.profession ?? chosen.profession}
                  onChange={(e) => setBuild((b) => ({ ...b, profession: e.target.value as Profession }))}
                >
                  {PROFESSIONS.filter((p) => !view.bans.some((b) => b.kind === "profession" && b.value === p)).map((p) => (
                    <option key={p} value={p}>
                      {PROFESSION_NAME[p as keyof typeof PROFESSION_NAME] ?? p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
                Hệ
                <select
                  className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                  value={build.element ?? chosen.element}
                  onChange={(e) => setBuild((b) => ({ ...b, element: e.target.value as Element }))}
                >
                  {ELEMENTS.filter((x) => !view.bans.some((b) => b.kind === "element" && b.value === x)).map((x) => (
                    <option key={x} value={x}>
                      {ELEMENT_NAME[x]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div>
            <Button disabled={busy || !chosen} onClick={doPick}>
              Chọn tướng này
            </Button>
          </div>
        </div>
      )}
      {view.prep && (
        <div className="flex flex-col gap-3" role="group" aria-label="Chuẩn bị">
          <p className="text-sm text-on-wood-soft">
            Vị trí 1 đánh đầu tiên khi tới lượt phe. Đội trưởng ({view.prep.captainName}) xếp vị trí cho cả phe. Trận lấy cấp và trang bị theo hồ sơ lúc hết giờ chuẩn bị: bạn có thể đổi trang bị trong lúc chờ.
          </p>
          <ol className="flex flex-col gap-2">
            {view.prep.lineup.map((slot, i) => (
              <li key={i}>
                <FrameInset className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-on-wood">
                    Vị trí {i + 1}: {slot.hero.name} · cấp {slot.hero.level} · {PROFESSION_NAME[slot.hero.profession as keyof typeof PROFESSION_NAME] ?? slot.hero.profession} · {ELEMENT_NAME[slot.hero.element]}
                    {" "}
                    <span className="text-on-wood-soft">({slot.mine ? "bạn" : (slot.name ?? "máy điều khiển")})</span>
                  </p>
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
          <p className="text-sm text-on-wood-soft">Phe đối thủ: {view.prep.foes.map((f) => f.hero.name).sort().join(", ")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={busy || view.prep.youReady} onClick={() => void send({ type: "ready" })}>
              {view.prep.youReady ? "Đã sẵn sàng" : "Sẵn sàng"}
            </Button>
            <a className="text-title-on-wood underline" href="/game/profile" target="_blank" rel="noopener noreferrer">
              Mở Doanh Trại để đổi trang bị (cửa sổ mới)
            </a>
            <p className="text-sm text-on-wood-soft">Đã sẵn sàng: {view.prep.readyNames.join(", ") || "chưa ai"}</p>
          </div>
        </div>
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
