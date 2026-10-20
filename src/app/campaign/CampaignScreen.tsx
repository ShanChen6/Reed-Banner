"use client";

// Bản đồ chiến dịch: danh sách màn (đã qua, đang mở, còn khóa), chi tiết màn đang chọn với đối thủ và luật
// màn, thanh lương mang sang và doanh trại đổi vàng lấy lương. Mọi luật ở @/core, server kiểm tra lại.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CAMPAIGN,
  CAMPAIGN_FOOD_MAX,
  CAMPAIGN_FOOD_MIN,
  companionById,
  FOOD_PRICE,
  isRaidStage,
  raidSetup,
  recommendedLevel,
  signatureOf,
  stageFoes,
  stageUnlocked,
  type CampaignStage,
  type Profile,
  type ProfileAction,
  type RaidTier,
} from "@/core";
import { ElementIcon } from "../demo/art/icons";
import { Portrait } from "../demo/art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../demo/labels";
import {
  createOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  sendProfileAction,
} from "../demo/online";
import { PROFILE_ERROR } from "../demo/ProgressPanel";
import CampaignMap from "./CampaignMap";
import RaidPanel from "./RaidPanel";

const FOOD_PACKS = [10, 30] as const;

function StageDetail({
  stage,
  profile,
  busy,
  onStart,
}: {
  stage: CampaignStage;
  profile: Profile;
  busy: boolean;
  onStart: () => void;
}) {
  const foes = stageFoes(stage);
  const cleared = profile.campaign.cleared.includes(stage.id);
  const recommended = recommendedLevel(stage);
  const under = profile.main.level < recommended;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs tracking-widest text-amber-300/80 uppercase">
          {stage.place} · {stage.region}
        </p>
        <h2 className="text-xl font-bold text-amber-100">{stage.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-300 italic">
          {stage.story}
        </p>
      </div>
      <figure className="flex items-start gap-2 rounded-md bg-black/25 p-2">
        <Portrait
          id={stage.foes[0]!.id}
          element={stage.foes[0]!.element}
          profession={stage.foes[0]!.profession}
          className="size-10 shrink-0"
        />
        <blockquote className="text-sm text-amber-50">
          <span className="font-semibold text-amber-300">
            {stage.foes[0]!.name}:
          </span>{" "}
          “{stage.lines.before}”
        </blockquote>
      </figure>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-md bg-black/25 p-2 text-sm sm:grid-cols-4">
        <dt className="text-stone-400">Thể thức</dt>
        <dd className="font-semibold">
          {stage.mode === "3v3" ? "3vs3" : "1vs1"}
        </dd>
        <dt className="text-stone-400">Độ khó</dt>
        <dd className="font-semibold">{DIFFICULTY_NAME[stage.difficulty]}</dd>
        <dt className="text-stone-400">Cấp đối thủ</dt>
        <dd className="font-semibold">{stage.level}</dd>
        <dt className="text-stone-400">Cấp gợi ý</dt>
        <dd
          className={`font-semibold ${under ? "text-rose-400" : "text-emerald-400"}`}
        >
          {recommended}
        </dd>
        <dt className="text-stone-400">Thưởng lần đầu</dt>
        <dd className="font-semibold text-amber-300">
          {cleared ? "Đã nhận" : `+${stage.firstClearGold} vàng`}
        </dd>
      </dl>
      {stage.joins && (
        <p className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-sm text-emerald-100">
          <Portrait
            id={stage.joins}
            element={companionById(stage.joins)!.element}
            profession={companionById(stage.joins)!.profession}
            className="size-8 shrink-0"
          />
          <span>
            <span className="font-semibold">
              {Object.hasOwn(profile.companions, stage.joins)
                ? "Đã gia nhập: "
                : "Qua màn để chiêu mộ: "}
              {companionById(stage.joins)!.name}
            </span>{" "}
            · {stage.joinStory}
          </span>
        </p>
      )}
      {stage.rule && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-sm text-amber-100">
          ⚑ {stage.rule}
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-3">
        {foes.map((f, i) => (
          <li
            key={f.id}
            className="flex items-center gap-2 rounded-lg bg-black/30 p-2"
          >
            <Portrait
              id={f.id}
              element={f.element}
              profession={f.profession}
              className="size-12 shrink-0"
            />
            <div className="min-w-0 text-xs">
              <p className="truncate text-sm font-semibold">{f.name}</p>
              {stage.foes[i]!.title && (
                <p className="truncate text-amber-200/80">
                  {stage.foes[i]!.title}
                </p>
              )}
              <p className="flex items-center gap-1 text-stone-300">
                <ElementIcon element={f.element} className="size-3.5" />{" "}
                {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]}
              </p>
              <p className="text-stone-400">
                {stage.foes[i]!.hero
                  ? `Sứ quân · ${f.skills?.length ?? 0} kỹ năng`
                  : "Tùy tướng"}
                {signatureOf(f.id) && (
                  <span className="block text-amber-200">
                    Chiêu riêng: {signatureOf(f.id)!.name}
                  </span>
                )}
                {stage.boss && i === 0 && (
                  <span className="text-rose-400"> · Trùm</span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onStart}
          className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
        >
          {busy ? "Đang xuất quân…" : cleared ? "Đánh lại" : "Xuất quân"}
        </button>
        {under && (
          <span className="text-sm text-rose-300">
            Đinh Bộ Lĩnh mới cấp {profile.main.level}; đánh trận thường lên cấp{" "}
            {recommended} sẽ dễ hơn.
          </span>
        )}
        {stage.mode === "3v3" && (
          <span className="text-xs text-stone-400">
            Ra trận cùng đội đã chọn ở trang Hồ sơ.
          </span>
        )}
      </div>
    </div>
  );
}

export default function CampaignScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-stone-300">
          {loadError
            ? "Không tải được hồ sơ, thử tải lại trang."
            : "Đang tải chiến dịch…"}
        </p>
      </Shell>
    );
  }

  const nextOpen = CAMPAIGN.find(
    (s) =>
      !profile.campaign.cleared.includes(s.id) &&
      stageUnlocked(profile.campaign, s.id),
  );
  const stage =
    CAMPAIGN.find((s) => s.id === picked) ??
    nextOpen ??
    CAMPAIGN[CAMPAIGN.length - 1]!;
  const food = profile.campaign.food;
  const done = profile.campaign.cleared.length;

  const act = async (a: ProfileAction) => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    setMessage(
      r.error
        ? (PROFILE_ERROR[r.error as keyof typeof PROFILE_ERROR] ?? r.error)
        : null,
    );
  };

  const start = async (raid?: RaidTier) => {
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: stage.mode,
      element: profile.element,
      profession: profile.profession,
      companions: stage.mode === "3v3" ? profile.team : [],
      difficulty: raid ? raidSetup(stage, raid).difficulty : stage.difficulty,
      stage: stage.id,
      ...(raid ? { raid } : {}),
    });
    if (!res.id) {
      setBusy(false);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì /play không tự tiếp tục; người chơi vẫn bấm Tiếp tục ở đó được.
    }
    router.push("/play?resume=1");
  };

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            Chương 1
          </p>
          <h1 className="text-2xl font-black text-amber-100">
            Cờ lau dẹp loạn
          </h1>
          <p className="text-sm text-stone-400">
            Đã qua {done}/{CAMPAIGN.length} màn · Đinh Bộ Lĩnh cấp{" "}
            {profile.main.level} · {profile.gold} vàng
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/profile"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Hồ sơ
          </Link>
          <Link
            href="/play"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Trận thường
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-3">
          <CampaignMap
            campaign={profile.campaign}
            selected={stage.id}
            onSelect={setPicked}
          />
          <ol className="flex flex-col gap-1.5" aria-label="Các màn">
            {CAMPAIGN.map((s, i) => {
              const cleared = profile.campaign.cleared.includes(s.id);
              const open = stageUnlocked(profile.campaign, s.id);
              const leader = s.foes[0]!;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={!open}
                    aria-current={stage.id === s.id}
                    onClick={() => setPicked(s.id)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition ${
                      stage.id === s.id
                        ? "border-amber-300 bg-amber-500/20"
                        : "border-white/10 bg-black/25 hover:bg-black/40"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        cleared
                          ? "bg-emerald-600 text-white"
                          : open
                            ? "bg-amber-500 text-stone-950"
                            : "bg-stone-700 text-stone-300"
                      }`}
                    >
                      {cleared ? "✓" : open ? i + 1 : "🔒"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {s.title}
                      </span>
                      <span className="block truncate text-xs text-stone-400">
                        {leader.hero ? leader.name : s.place} · cấp {s.level}
                      </span>
                    </span>
                    <ElementIcon
                      element={leader.element}
                      className="size-4 shrink-0"
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 shadow-[inset_0_0_24px_#0009]">
            <StageDetail
              stage={stage}
              profile={profile}
              busy={busy}
              onStart={() => void start()}
            />
          </div>

          {isRaidStage(stage) && (
            <div className="rounded-xl border-2 border-[#7a2c1d] bg-[#2a1719]/90 p-4 shadow-[inset_0_0_24px_#0009]">
              <RaidPanel
                stage={stage}
                profile={profile}
                busy={busy}
                onStart={(tier) => void start(tier)}
              />
            </div>
          )}

          <div className="rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 text-sm">
            <h2 className="mb-2 font-bold text-amber-200">Doanh trại</h2>
            <div className="flex items-center gap-2">
              <span aria-hidden>🍙</span>
              <div
                className="relative h-4 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/40"
                role="meter"
                aria-label="Lương mang vào trận"
                aria-valuenow={food}
                aria-valuemin={CAMPAIGN_FOOD_MIN}
                aria-valuemax={CAMPAIGN_FOOD_MAX}
              >
                <div
                  className="h-full bg-gradient-to-b from-lime-300 to-lime-700"
                  style={{ width: `${food}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold [text-shadow:0_1px_1px_#000]">
                  {food}/{CAMPAIGN_FOOD_MAX} lương
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-400">
              Lương còn lại sau mỗi trận chiến dịch được mang sang trận sau
              (luôn trong khoảng {CAMPAIGN_FOOD_MIN}–{CAMPAIGN_FOOD_MAX}). Đổi
              vàng lấy lương: {FOOD_PRICE} vàng mỗi điểm.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {FOOD_PACKS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={
                    busy ||
                    food >= CAMPAIGN_FOOD_MAX ||
                    profile.gold < n * FOOD_PRICE
                  }
                  onClick={() => void act({ type: "buyFood", amount: n })}
                  className="rounded bg-amber-500 px-3 py-1 font-semibold text-stone-950 disabled:opacity-35"
                >
                  +{n} lương ({n * FOOD_PRICE} vàng)
                </button>
              ))}
              {message && <span className="text-rose-400">{message}</span>}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#4a2418_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
