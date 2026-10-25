"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type { Puppet } from "@/app/game/stage/kit";
import type { CueKind } from "@/app/game/stage/director";
import { rigOf } from "@/app/game/stage/rigs";

const ACTIONS = [
  { kind: "idle", label: "Đứng", ms: 2000 },
  { kind: "ready", label: "Vào thế", ms: 600 },
  { kind: "attack", label: "Đánh thường", ms: 900 },
  { kind: "cast", label: "Ra chiêu", ms: 1100 },
  { kind: "ultimate", label: "Tuyệt chiêu", ms: 1800 },
  { kind: "hit", label: "Trúng đòn", ms: 600 },
  { kind: "guard", label: "Đỡ đòn", ms: 700 },
  { kind: "buff", label: "Được tăng", ms: 700 },
  { kind: "debuff", label: "Bị giảm", ms: 700 },
  { kind: "heal", label: "Hồi máu", ms: 700 },
  { kind: "ko", label: "Bị hạ gục", ms: 1300 },
  { kind: "victory", label: "Chiến thắng", ms: 2600 },
] as const;
type Action = CueKind | "idle" | "ko";
const button = "rounded-lg border border-amber-800/70 bg-stone-900 px-3 py-2 text-sm font-medium hover:bg-amber-900/40 aria-pressed:border-amber-300 aria-pressed:bg-amber-900/60 disabled:opacity-40";

export default function RigPreview({ id, size, onSnapshot }: {
  id: string;
  size: "battle" | "large";
  onSnapshot: (url: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const puppet = useRef<Puppet | null>(null);
  const layout = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Action>("idle");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = host.current;
    const rig = rigOf(id);
    if (!el || !rig) return;
    let disposed = false;
    let app: Application | null = null;
    let initialized = false;
    let observer: ResizeObserver | null = null;
    let loaded: Puppet | null = null;
    const destroy = () => {
      observer?.disconnect();
      if (app && initialized) {
        app.destroy(true, { children: true });
        initialized = false;
      }
    };
    void (async () => {
      try {
        const [{ Application }, { loadPuppet }, { lightning }, { earthWard }, { leafBloom }, { armorPierce }, { supplyDrain }, { waterPillar }, { flameWall }, { groundSlam }, { needleVolley }, { steelBulwark }, { silverGrace }, { coinScatter }, { ironFormation }, { bambooSap }] = await Promise.all([
          import("pixi.js"), import("@/app/game/stage/puppet"), import("@/app/game/stage/lightning"),
          import("@/app/game/stage/ward"), import("@/app/game/stage/bloom"), import("@/app/game/stage/pierce"),
          import("@/app/game/stage/drain"), import("@/app/game/stage/pillar"),
          import("@/app/game/stage/flame"), import("@/app/game/stage/slam"),
          import("@/app/game/stage/needle"), import("@/app/game/stage/bulwark"),
          import("@/app/game/stage/silver"), import("@/app/game/stage/coins"),
          import("@/app/game/stage/banner"), import("@/app/game/stage/sap"),
        ]);
        if (disposed) return;
        app = new Application();
        await app.init({
          backgroundAlpha: 0, antialias: true, preference: "webgl",
          resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true,
          width: el.clientWidth, height: el.clientHeight,
        });
        initialized = true;
        if (disposed) return destroy();
        app.canvas.setAttribute("aria-hidden", "true");
        el.appendChild(app.canvas);
        loaded = await loadPuppet(rig, false);
        if (disposed) {
          loaded.destroy();
          return destroy();
        }
        puppet.current = loaded;
        app.stage.addChild(loaded.view);
        const bounds = loaded.view.getLocalBounds();
        const resize = () => {
          if (!app || !loaded || disposed) return;
          const width = el.clientWidth;
          const height = el.clientHeight;
          app.renderer.resize(width, height);
          const target = el.dataset.size === "large" ? 400 : 160;
          // Chừa quãng rộng cho cả tranh ra chiêu, tuyệt chiêu và đao vung.
          const reach = rig.skeleton === "warrior" && rig.poses ? rig.height * 1.5 : bounds.width * 1.15;
          const scale = Math.min(target / rig.height, (width - 32) / reach, (height - 48) / rig.height);
          loaded.view.scale.set(scale);
          loaded.view.position.set(width / 2 - (bounds.x + bounds.width / 2) * scale, height - 24);
        };
        layout.current = resize;
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(el);
        loaded.reset();
        app.render();
        const snapshot = await app.renderer.extract.base64(loaded.view);
        if (disposed) return;
        onSnapshot(snapshot);
        // Sét hệ Lôi: không có đối thủ nên phóng tới mép phải khung, tuyệt chiêu giáng xuống ba điểm.
        const bolts = rig.skeleton === "warrior" && rig.strikeFx === "lightning" ? lightning(app.stage, rig.fxColor) : null;
        if (bolts) loaded.onStrike?.((kind, at) => {
          const width = el.clientWidth;
          const height = el.clientHeight;
          const w = el.dataset.size === "large" ? 5 : 3;
          if (kind === "ultimate") [0.74, 0.84, 0.94].forEach((k, n) => bolts.strike({ x: width * k, y: height * 0.55 }, w * 1.6, n * 0.08));
          else bolts.bolt(at, { x: width - 12, y: height * 0.55 }, kind === "cast" ? w * 1.4 : w);
        });
        // Vòm khiên đất hệ Thổ, vòng lá hệ Mộc: nở quanh chính nhân vật khi tuyệt chiêu.
        const team = rig.skeleton === "warrior" ? rig.strikeFx : undefined;
        const wards = team === "earthWard" ? earthWard(app.stage, rig.fxColor) : team === "leafBloom" ? leafBloom(app.stage, rig.fxColor)
          : team === "silverGrace" ? silverGrace(app.stage, rig.fxColor) : null;
        if (wards) loaded.onStrike?.((kind) => {
          if (kind === "ultimate" && loaded) wards.cover({ x: loaded.view.x, y: loaded.view.y }, rig.height * loaded.view.scale.y);
        });
        // Mũi sáng phá giáp hệ Kim: phóng tới mép phải khung.
        const pierce = team === "armorPierce" ? armorPierce(app.stage, rig.fxColor) : null;
        if (pierce) loaded.onStrike?.((kind, at) => {
          if (kind === "ultimate") pierce.pierce(at, { x: el.clientWidth - 24, y: at.y }, el.dataset.size === "large" ? 5 : 3);
        });
        // Đoạt lương hệ Thủy: hút hạt sáng từ mép phải khung về nhân vật.
        const drain = team === "supplyDrain" ? supplyDrain(app.stage, rig.fxColor) : null;
        if (drain) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          const me = { x: loaded.view.x, y: loaded.view.y - size * 0.55 };
          [0.25, 0.5].forEach((k, n) => drain.drain({ x: el.clientWidth - 40, y: el.clientHeight * k + size * 0.2 }, me, size, n * 0.1));
        });
        // Cột nước hệ Thủy: phun lên ở hai điểm bên phải khung.
        const pillar = team === "waterPillar" ? waterPillar(app.stage, rig.fxColor) : null;
        if (pillar) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          [0.78, 0.92].forEach((k, n) => pillar.cover({ x: el.clientWidth * k, y: loaded!.view.y }, size * 0.8, n * 0.1));
        });
        // Tường lửa hệ Hỏa: quanh nhân vật, lửa bén ở mép phải khung.
        const fire = team === "flameWall" ? flameWall(app.stage, rig.fxColor) : null;
        if (fire) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          fire.wall({ x: loaded.view.x, y: loaded.view.y }, size);
          fire.burn({ x: el.clientWidth - 40, y: loaded.view.y }, size * 0.8, 0.15);
        });
        // Đập đất hệ Thổ: nứt đất ở mép phải khung, vòm khiên quanh nhân vật.
        const slam = team === "groundSlam" ? groundSlam(app.stage, rig.fxColor) : null;
        const slamWard = slam ? earthWard(app.stage, rig.fxColor) : null;
        if (slam) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          slam.slam({ x: el.clientWidth - 60, y: loaded.view.y }, size * 0.8);
          slamWard?.cover({ x: loaded.view.x, y: loaded.view.y }, size, 0.2);
        });
        // Ngân châm hệ Kim: bắn tới ba điểm ở mép phải khung.
        const needles = team === "needleVolley" ? needleVolley(app.stage, rig.fxColor) : null;
        if (needles) loaded.onStrike?.((kind, at) => {
          if (kind !== "ultimate") return;
          const w = el.dataset.size === "large" ? 3 : 2;
          [0.35, 0.55, 0.75].forEach((k, n) => needles.volley(at, { x: el.clientWidth - 30, y: el.clientHeight * k }, w, n * 0.06));
        });
        // Tường thép hệ Kim: dựng trước mặt nhân vật.
        const bulwark = team === "steelBulwark" ? steelBulwark(app.stage, rig.fxColor) : null;
        if (bulwark) loaded.onStrike?.((kind) => {
          if (kind === "ultimate" && loaded) bulwark.raise({ x: loaded.view.x, y: loaded.view.y }, rig.height * loaded.view.scale.y, 1);
        });
        // Tiền vàng ly tán hệ Kim: bật ra ở mép phải khung.
        const coins = team === "coinScatter" ? coinScatter(app.stage, rig.fxColor) : null;
        if (coins) loaded.onStrike?.((kind) => {
          if (kind === "ultimate" && loaded) coins.scatter({ x: el.clientWidth - 60, y: el.clientHeight * 0.5 }, rig.height * loaded.view.scale.y);
        });
        // Thiết trận hệ Kim: khiên nứt ở mép phải khung, mũi tên vàng quanh nhân vật.
        const formation = team === "ironFormation" ? ironFormation(app.stage, rig.fxColor) : null;
        if (formation) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          formation.shatter({ x: el.clientWidth - 60, y: el.clientHeight * 0.5 }, size);
          formation.rally({ x: loaded.view.x, y: loaded.view.y }, size, 0.2);
        });
        // Trúc lâm hệ Mộc: chém ở mép phải khung, sinh khí bay về nhân vật.
        const sap = team === "bambooSap" ? bambooSap(app.stage, rig.fxColor) : null;
        if (sap) loaded.onStrike?.((kind) => {
          if (kind !== "ultimate" || !loaded) return;
          const size = rig.height * loaded.view.scale.y;
          sap.drain({ x: el.clientWidth - 60, y: el.clientHeight * 0.5 }, { x: loaded.view.x, y: loaded.view.y - size * 0.55 }, size);
        });
        app.ticker.add((tick) => {
          const dt = Math.min(tick.deltaMS / 1000, 0.05);
          loaded?.update(dt);
          sap?.update(dt);
          coins?.update(dt);
          formation?.update(dt);
          needles?.update(dt);
          bulwark?.update(dt);
          bolts?.update(dt);
          wards?.update(dt);
          pierce?.update(dt);
          drain?.update(dt);
          pillar?.update(dt);
          fire?.update(dt);
          slam?.update(dt);
          slamWard?.update(dt);
        });
        setReady(true);
      } catch (cause) {
        destroy();
        if (!disposed) setError(cause instanceof Error ? cause.message : "Không dựng được sân khấu");
      }
    })();
    return () => {
      disposed = true;
      if (timer.current) clearTimeout(timer.current);
      puppet.current = null;
      layout.current = null;
      destroy();
    };
  }, [id, onSnapshot]);

  useEffect(() => { layout.current?.(); }, [size]);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRunning(false);
  };
  const apply = (kind: Action) => {
    const p = puppet.current;
    if (!p) return;
    p.reset();
    if (kind === "ko") p.setDown(true);
    else if (kind !== "idle") p.play(kind);
    setActive(kind);
  };
  const sequence = () => {
    cancel();
    setRunning(true);
    const step = (index: number) => {
      const action = ACTIONS[index];
      if (!action) { setRunning(false); timer.current = null; return; }
      apply(action.kind);
      timer.current = setTimeout(() => step(index + 1), action.ms);
    };
    step(0);
  };
  return (
    <section aria-label="Thử hoạt ảnh" className="overflow-hidden rounded-2xl border border-amber-900/70 bg-black/25">
      <div className="flex items-center justify-between gap-3 border-b border-amber-900/50 px-4 py-2 text-sm">
        <span role="status" aria-live="polite">
          {error ? "Không tải được hình động" : !ready ? "Đang tải hình động…" : `${ACTIONS.find((a) => a.kind === active)!.label}${running ? " · Phát lần lượt" : ""}`}
        </span>
        <span className="text-xs text-stone-400">{size === "battle" ? "Cỡ trong trận · 160 px" : "Cỡ lớn · vừa khung"}</span>
      </div>
      <div ref={host} data-size={size} data-testid="rig-canvas" className={`relative w-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,#4a3021,transparent_70%)] ${size === "battle" ? "h-[260px]" : "h-[440px] sm:h-[520px]"}`} />
      {error && <p role="alert" className="px-4 py-2 text-sm text-rose-300">{error}</p>}
      <div className="flex flex-wrap gap-2 border-t border-amber-900/50 p-3">
        {ACTIONS.map((action) => (
          <button key={action.kind} type="button" disabled={!ready || !!error} aria-pressed={active === action.kind} data-action={action.kind}
            className={button} onClick={() => { cancel(); apply(action.kind); }}>
            {action.label}
          </button>
        ))}
        <button type="button" disabled={!ready || !!error} onClick={running ? cancel : sequence}
          className={`${button} border-amber-500 text-amber-200`}>
          {running ? "Dừng phát" : "Phát lần lượt"}
        </button>
      </div>
    </section>
  );
}
