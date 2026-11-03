"use client";

// Hồ sơ thử nghiệm cho Doanh Trại: số tướng sĩ theo `n`, cấp rải đều (nhiều người cùng cấp), túi đồ đủ loại ô và
// vài món đang mặc. Thao tác áp tại chỗ bằng applyProfileAction của @/core, không gọi server, không đọc/ghi
// localStorage, nên không đụng dữ liệu người chơi. Quá số nhân vật có thật (100) thì nhân bản thẻ để thử danh sách dài.

import { useState } from "react";
import {
  ALL_COMPANIONS,
  applyProfileAction,
  GEAR_SLOTS,
  MAIN_ID,
  newProfile,
  receiveDrop,
  totalXpFor,
  type CharacterProgress,
  type Element,
  type GearItem,
  type Profile,
  type ProfileAction,
  type Tier,
} from "@/core";
import Link from "next/link";
import Barracks from "@/app/game/profile/Barracks";
import { PROFILE_ERROR } from "@/app/game/battle/ProgressPanel";
import { rosterOf, type RosterEntry } from "@/app/game/profile/roster";
import { SceneContext, type SceneApi } from "@/app/game/SceneContext";
import { scenePath } from "@/app/game/scene";

/** Trang xem thử nằm ngoài /game: link phân cảnh (Cửa hàng…) mở trang thật bằng tải lại. */
const SCENE_API: SceneApi = {
  currentScene: "PROFILE",
  params: new URLSearchParams(),
  go: (scene, params) => window.location.assign(scenePath(scene, params)),
  goHref: (href) => window.location.assign(href),
  arrived: true,
};

const ELEMENTS_CYCLE: readonly Element[] = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"];

const at = (level: number): CharacterProgress => ({ xp: totalXpFor(level) + 7, level, skillPoints: Math.min(level - 1, 6), skillLevels: {}, branches: [] });

function fixtureProfile(n: number): Profile {
  const base = newProfile();
  const companions = ALL_COMPANIONS.slice(0, Math.max(2, n - 1));
  let p: Profile = {
    ...base,
    gold: 5000,
    main: at(12),
    companions: Object.fromEntries(companions.map((c, i) => [c.id, at(1 + ((i * 7) % 30))])),
    team: [companions[0]!.id, companions[1]!.id],
  };
  if (n === 0) return p;
  for (let i = 0; i < 36; i++) {
    const slot = GEAR_SLOTS[i % GEAR_SLOTS.length]!;
    const drop: GearItem = {
      id: "",
      slot,
      element: ELEMENTS_CYCLE[i % 7]!,
      tier: (1 + (i % 5)) as Tier,
      set: i % 2 ? "coLau" : "hoaLu",
      ...(slot === "vuKhi" ? { profession: i % 3 === 0 ? "tuongSi" : companions[0]!.profession } : {}),
    };
    p = receiveDrop(p, drop).profile;
  }
  // Ba món giống hệt để thử ghép.
  for (let i = 0; i < 3; i++) p = receiveDrop(p, { id: "", slot: "gioiChi", element: "moc", tier: 2, set: "coLau" }).profile;
  for (const [who, item] of [[MAIN_ID, "g2"], [MAIN_ID, "g3"], [companions[0]!.id, "g4"], [companions[0]!.id, "g11"]] as const) {
    const r = applyProfileAction(p, { type: "equip", character: who, item });
    if (r.ok) p = r.profile;
  }
  return p;
}

function fixtureRoster(profile: Profile, n: number): RosterEntry[] {
  const real = rosterOf(profile);
  if (n === 0) return [];
  if (n <= real.length) return real.slice(0, n);
  const out = [...real];
  for (let i = 0; out.length < n; i++) {
    const src = real[i % real.length]!;
    out.push({ ...src, key: `${src.id}#${i}`, name: `${src.name} (bản thử ${Math.floor(i / real.length) + 2})`, team: null });
  }
  return out;
}

export default function BarracksFixture({ n, sizes }: { n: number; sizes: readonly number[] }) {
  const [profile, setProfile] = useState(() => fixtureProfile(n));
  const [message, setMessage] = useState<string | null>(null);
  const roster = fixtureRoster(profile, n);
  const act = async (a: ProfileAction) => {
    const r = applyProfileAction(profile, a, Date.now());
    if (r.ok) setProfile(r.profile);
    const error = r.ok ? null : r.error;
    setMessage(error ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error) : null);
    return error;
  };
  return (
    <SceneContext value={SCENE_API}>
    <div className="flex min-h-dvh flex-col bg-[#17110e]">
      <nav aria-label="Bộ dữ liệu thử" className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm text-amber-200">
        <span className="text-stone-400">Hồ sơ thử (không lưu):</span>
        {sizes.map((s) => (
          <Link key={s} href={`/demo/barracks?n=${s}`} prefetch={false} aria-current={s === n ? "page" : undefined} className={s === n ? "font-bold underline" : "underline-offset-2 hover:underline"}>
            {s} tướng
          </Link>
        ))}
      </nav>
      <Barracks profile={profile} busy={false} message={message} onAction={act} roster={roster} />
    </div>
    </SceneContext>
  );
}
