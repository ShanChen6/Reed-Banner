"use client";

// Cột "Bày trận" của nhiệm vụ có trận ở Bình Loạn: mục tiêu, một dòng thông tin trận, đối thủ, ba ô đội (chủ tướng và
// hai phó tướng), lương và nút Xuất quân. Máy tính: cột phải dính khi cuộn cạnh phần cốt truyện. Điện thoại: nằm dưới
// cốt truyện, nút Xuất quân dính đáy màn. Bấm ô chủ tướng mới mở chọn nghề/hệ, bấm ô phó tướng mới mở bộ chọn người.

import { useState } from "react";
import { Button, choiceVariants } from "@/components/ui";
import LeaderBuild from "../profile/LeaderBuild";
import CompanionPicker from "./CompanionPicker";
import {
  CAMPAIGN_FOOD_MAX,
  FOOD_PRICE,
  MAIN_ID,
  campaignBattleAdvice,
  campaignBattleScenario,
  campaignEncounter,
  campaignEncounterFoes,
  campaignPhaseLabels,
  campaignScenarioByNode,
  campaignSurviveTurns,
  campaignTerrain,
  companionById,
  loadoutOf,
  missionCopy,
  ownsCompanion,
  type CampaignMissionId,
  type Element,
  type Profession,
  type Profile,
  type ProfileAction,
} from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import {
  DIFFICULTY_NAME,
  ELEMENT_NAME,
  PROFESSION_NAME,
  gearText,
} from "../battle/labels";

export interface BattleChoice {
  readonly element: Element;
  readonly profession: Profession;
  readonly team: readonly string[];
}

type Open = "leader" | "team" | null;

function Chip({ children, tone }: { children: React.ReactNode; tone?: "good" | "bad" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption ${
        tone === "bad"
          ? "border-danger/50 text-danger"
          : tone === "good"
            ? "border-jade/50 text-jade"
            : "border-frame-line-soft text-on-wood"
      }`}
    >
      {children}
    </span>
  );
}

export default function BattlePrep({
  profile,
  nodeId,
  busy,
  resumeId,
  needChoice,
  onAction,
  onStart,
  onResume,
}: {
  profile: Profile;
  nodeId: CampaignMissionId;
  busy: boolean;
  resumeId: string | null;
  /** Chưa chọn lời kế: vẫn bày trận được nhưng chưa xuất quân. */
  needChoice: boolean;
  onAction: (a: ProfileAction) => void;
  onStart: (choice: BattleChoice) => void;
  onResume: () => void;
}) {
  const [element, setElement] = useState<Element>(profile.element);
  const [profession, setProfession] = useState<Profession>(profile.profession);
  const [open, setOpen] = useState<Open>(null);
  // Đội 3vs3: hai người đi cùng, chọn trong số nhân vật đã có (kể cả người mới gia nhập). Server kiểm lại.
  const owned = Object.keys(profile.companions).filter((id) =>
    ownsCompanion(profile, id),
  );
  const [team, setTeam] = useState<readonly string[]>(() => {
    const kept = profile.team.filter((id) => owned.includes(id));
    return kept.length === 2 ? kept : owned.slice(0, 2);
  });
  const toggleTeam = (id: string) =>
    setTeam((t) =>
      t.includes(id)
        ? t.filter((x) => x !== id)
        : t.length < 2
          ? [...t, id]
          : t,
    );
  const weapon = loadoutOf(profile, MAIN_ID).weapons[profession];
  // Công thành nhiều trận: phase kế tiếp do server ghi trong hồ sơ.
  const phase = profile.campaign.siegePhases[nodeId] ?? 0;
  const labels = campaignPhaseLabels(nodeId);
  const objective = campaignScenarioByNode(nodeId)?.phases[phase]?.objective;
  const bossHp = profile.campaign.phaseBossHp[nodeId];
  const advice = campaignBattleAdvice(
    { ...profile, element, profession },
    nodeId,
    phase,
  );
  const scenario = campaignBattleScenario(nodeId);
  const encounter = campaignEncounter(nodeId, phase);
  const foes = campaignEncounterFoes(nodeId, phase);
  const copy = missionCopy(nodeId);
  const turns = campaignSurviveTurns(nodeId, phase);
  const stage = objective?.type === "breakSiege" ? objective.stage : undefined;
  const terrain = campaignTerrain(nodeId);
  if (!advice || !scenario || !encounter || !foes) return null;
  const counters = advice.counterElements.includes(element);
  const weak = advice.weakElements.includes(element);
  const missing = Math.max(0, advice.suggestedFood - advice.food);
  const teamReady = advice.mode === "1v1" || team.length === 2;
  const replay = profile.campaign.completed.includes(nodeId);
  const toggle = (o: Exclude<Open, null>) => setOpen((v) => (v === o ? null : o));
  const slot = (on: boolean) =>
    choiceVariants({
      className: `w-full justify-start gap-2 px-2 py-1.5 text-left font-normal ${on ? "!border-frame-gold-hi" : ""}`,
    });

  return (
    <div className="flex flex-col gap-3 text-sm">
      <h3 className="ui-title-on-wood text-base">Bày trận</h3>
      {replay && (
        <p className="text-caption text-info">
          Đánh lại: chỉ nhận thưởng trận thường và có thể ghi số lượt tốt hơn.
          Thưởng nhiệm vụ, thế cục sứ quân và lựa chọn đã ghi không đổi.
        </p>
      )}
      {labels.length > 1 && (
        <ol className="flex flex-wrap gap-1 text-caption" aria-label="Các giai đoạn">
          {labels.map((label, i) => (
            <li
              key={label}
              aria-current={i === phase ? "step" : undefined}
              title={label}
              className={`rounded border px-2 py-0.5 ${
                i < phase
                  ? "border-jade/50 bg-jade/15 text-jade"
                  : i === phase
                    ? "border-frame-gold bg-frame-gold/25 font-semibold text-on-wood"
                    : "border-frame-line-soft bg-wood-inset text-on-wood-soft"
              }`}
            >
              {i < phase ? "✓ " : ""}
              {i + 1}/{labels.length}
              {i === phase ? ` · ${label}` : ""}
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-md border border-frame-line bg-frame-gold/10 p-2 text-title-on-wood">
        <p className="font-semibold">Mục tiêu</p>
        <p>
          {stage === "escort"
            ? `Giữ đoàn lương ${turns} lượt của bạn hoặc hạ hết toán chặn đường.`
            : stage === "breach"
              ? `${labels[phase] ?? "Phá lũy"}: hạ hết quân giữ đường để mở lối vào thành.`
              : objective?.type === "bossPhases" && objective.hpThreshold
                ? `Đẩy ${foes[0]?.name} xuống còn ${Math.round(objective.hpThreshold * 100)}% máu. Trận dừng ở đó và chuyển sang giai đoạn sau; máu đã mất không hồi lại.`
                : objective?.type === "bossPhases" && labels.length > 1
                  ? `Hạ ${foes[0]?.name}${bossHp ? `, vào trận với ${Math.round(bossHp * 100)}% máu còn lại từ giai đoạn trước` : ""}, cùng hai tùy tướng.`
                  : turns
                    ? `Cầm cự ${turns} lượt của bạn hoặc hạ ${scenario.mode === "3v3" ? "hết đối thủ" : "thủ lĩnh"}.`
                    : copy?.objective}
        </p>
        {(labels.length > 1 || terrain || encounter.foeFood !== undefined || stage === "escort") && (
          <details className="mt-1 text-caption text-frame-gold/80">
            <summary className="cursor-pointer pointer-coarse:py-2">Luật trận này</summary>
            {stage === "escort" && (
              <p className="mt-1">
                Tình tiết phục vụ gameplay: đoàn lương và toán chặn đường do game sáng
                tác; sử không chép trận nào trên đường tiếp viện.
              </p>
            )}
            {labels.length > 1 && (
              <p className="mt-1">
                Mỗi giai đoạn là một trận. Qua giai đoạn chưa hoàn thành nhiệm vụ; thua thì
                đánh lại đúng giai đoạn đó. Lương còn lại mang sang giai đoạn sau.
              </p>
            )}
            {terrain && (
              <p className="mt-1">
                {terrain.name}: {terrain.summary}. Địa hình do game dựng, không phải sơ
                đồ một trận có sử chép.
              </p>
            )}
            {encounter.foeFood !== undefined && (
              <p className="mt-1">
                Đối thủ vào trận với {encounter.foeFood} lương (luật game). Mang đủ lương
                để không đói giữa trận.
              </p>
            )}
          </details>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Thông tin trận">
        <Chip>{scenario.mode === "3v3" ? "3vs3" : "1vs1"}</Chip>
        <Chip>{DIFFICULTY_NAME[scenario.difficulty]}</Chip>
        <Chip>Đối thủ cấp {encounter.level}</Chip>
        <Chip tone={advice.underLevel ? "bad" : "good"}>
          Gợi ý cấp {advice.recommendedLevel}
        </Chip>
      </div>

      <section aria-label="Đối thủ">
        <p className="mb-1 text-caption font-semibold text-on-wood-soft">Đối thủ</p>
        <ul className="grid grid-cols-3 gap-1.5">
          {foes.map((f, i) => (
            <li
              key={f.id}
              className="ui-frame-inset flex flex-col items-center gap-0.5 p-1.5 text-center text-caption"
              title={
                encounter.foes[i]?.hero
                  ? "Sứ quân có tên trong sử · trận do game dựng"
                  : "Nhân vật hư cấu"
              }
            >
              <Portrait
                id={f.id}
                element={f.element}
                profession={f.profession}
                className="size-10"
              />
              <span className="line-clamp-2 font-semibold leading-tight">{f.name}</span>
              <span className="flex items-center gap-1 text-on-wood-soft">
                <ElementIcon element={f.element} className="size-3.5" />
                <ProfessionIcon profession={f.profession} className="size-3.5" />
                {encounter.foes[i]?.hero && <span className="text-frame-gold">· sử</span>}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-caption text-on-wood-soft">
          Thủ lĩnh hệ {ELEMENT_NAME[advice.leaderElement]}; hệ{" "}
          {advice.counterElements.map((e) => ELEMENT_NAME[e]).join(", ")} khắc được.
        </p>
      </section>

      <section aria-label="Đội ra trận" className="flex flex-col gap-1.5">
        <p className="text-caption font-semibold text-on-wood-soft" id={`team-${nodeId}`}>
          Đội ra trận
          {advice.mode === "3v3" && ` (phó tướng ${team.length}/2)`}
        </p>
        <button
          type="button"
          aria-expanded={open === "leader"}
          onClick={() => toggle("leader")}
          className={slot(open === "leader")}
        >
          <Portrait id={MAIN_ID} element={element} profession={profession} className="size-9 shrink-0" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate font-semibold">Đinh Bộ Lĩnh · chủ tướng</span>
            <span className="flex items-center gap-1 text-caption opacity-80">
              <ElementIcon element={element} className="size-3.5" />
              {ELEMENT_NAME[element]} ·
              <ProfessionIcon profession={profession} className="size-3.5" />
              {PROFESSION_NAME[profession]}
            </span>
          </span>
          <span
            className={`text-caption ${counters ? "text-jade" : weak ? "text-danger" : "text-on-wood-soft"}`}
          >
            {counters ? "★ khắc" : weak ? "bị khắc" : ""}
          </span>
        </button>
        {open === "leader" && (
          <div className="ui-frame-inset p-2">
            <LeaderBuild
              element={element}
              profession={profession}
              onChange={(b) => {
                setElement(b.element);
                setProfession(b.profession);
                // Lưu ngay vào hồ sơ để mọi chế độ khác cũng dùng lựa chọn này, khỏi sang Doanh Trại.
                onAction({ type: "chooseLeader", ...b });
              }}
              marks={advice.counterElements}
              hint={`Đổi tại đây là lưu luôn cho mọi chế độ. Vũ khí nghề ${PROFESSION_NAME[profession]}: ${weapon ? gearText(weapon) : "chưa trang bị (mặc ở Doanh Trại)"}.`}
            />
          </div>
        )}
        {advice.mode === "3v3" && (
          <>
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1].map((i) => {
                const id = team[i];
                const c = id ? companionById(id) : undefined;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-expanded={open === "team"}
                    onClick={() => toggle("team")}
                    className={slot(open === "team")}
                  >
                    {c ? (
                      <>
                        <Portrait id={c.id} element={c.element} profession={c.profession} className="size-9 shrink-0" />
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate font-semibold">
                            {c.name}
                            {advice.counterElements.includes(c.element) && <span className="text-jade"> ★</span>}
                          </span>
                          <span className="flex items-center gap-1 text-caption opacity-80">
                            <ElementIcon element={c.element} className="size-3.5" />
                            <ProfessionIcon profession={c.profession} className="size-3.5" />
                            phó tướng
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="text-on-wood-soft">+ Chọn phó tướng</span>
                    )}
                  </button>
                );
              })}
            </div>
            {open === "team" && (
              <div className="ui-frame-inset p-2">
                <CompanionPicker
                  owned={owned}
                  team={team}
                  marks={advice.counterElements}
                  onToggle={toggleTeam}
                  labelId={`team-${nodeId}`}
                  pageSize={6}
                  narrow
                />
              </div>
            )}
          </>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2" aria-label="Lương mang theo">
        <Chip tone={advice.lowFood ? "bad" : undefined}>
          Lương {advice.food}/{CAMPAIGN_FOOD_MAX} · gợi ý từ {advice.suggestedFood}
        </Chip>
        {advice.lowFood && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={busy || profile.gold < missing * FOOD_PRICE}
            onClick={() => onAction({ type: "buyFood", amount: missing })}
          >
            Mua {missing} lương ({missing * FOOD_PRICE} vàng)
          </Button>
        )}
      </div>
      {advice.lowFood && (
        <p className="-mt-2 text-caption text-danger">Thiếu {missing} lương: quân đói sẽ đánh yếu hơn.</p>
      )}

      {advice.underLevel && (
        <p className="text-caption text-danger">
          Đinh Bộ Lĩnh mới cấp {advice.playerLevel}, thấp hơn cấp gợi ý{" "}
          {advice.recommendedLevel}. Vẫn xuất quân được; thua thì giữ nguyên tiến độ.
        </p>
      )}

      {/* Điện thoại: dính đáy màn để lúc đọc cốt truyện vẫn thấy nút; từ lg nằm cuối cột Bày trận. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-frame-line bg-[color-mix(in_srgb,var(--wood-lo,#1c120b)_94%,transparent)] px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {resumeId ? (
          <Button
            variant="ornate"
            type="button"
            disabled={busy}
            onClick={onResume}
            className="w-full tracking-wider uppercase"
          >
            Tiếp tục trận
          </Button>
        ) : (
          <Button
            variant="ornate"
            type="button"
            disabled={busy || !teamReady || needChoice}
            onClick={() => onStart({ element, profession, team })}
            className="w-full tracking-wider uppercase"
          >
            {needChoice
              ? "Chọn lời kế trước"
              : !teamReady
                ? "Chọn đủ 2 phó tướng"
                : busy
                  ? "Đang xuất quân…"
                  : phase > 0
                    ? `Vào giai đoạn ${phase + 1}/${labels.length}`
                    : replay
                      ? "Đánh lại"
                      : "Xuất quân"}
          </Button>
        )}
      </div>
    </div>
  );
}
