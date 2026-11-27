"use client";

import { useState } from "react";
import { OrnateFrame } from "@/components/game-ui";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { cn } from "@/lib/cn";

import {
  ELEMENTS,
  MAIN_SLOT_UNLOCK,
  PROFESSIONS,
  characterSkills,
  scaleSkill,
  type Element,
  type Profession,
  type SurvivalAction,
  type SurvivalView,
} from "@/core";
import { CounterStar } from "../art/CounterStar";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { SkillIcon } from "../art/skills";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  availableNextWave,
  buildSurvivalNextWaveAction,
  previewLeaderBuild,
  validTacticalLineup,
} from "./tactical-preview";

type SurvivalBreakScreenProps = {
  survival: SurvivalView;
  pending: boolean;
  error?: string | null;
  onRefresh: () => void;
  onNext: (action: SurvivalAction) => void;
  onEnd: () => void;
};

export default function SurvivalBreakScreen(props: SurvivalBreakScreenProps) {
  const { survival, pending, error, onRefresh } = props;
  const preview = survival.break;
  const next = survival.next;
  if (!preview || !next) {
    return (
      <OrnateFrame role="alert" className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-title-on-wood">Chưa nhận được tin lúc nghỉ giữa đợt</h2>
        <p className="text-sm text-on-wood-soft">
          Máy chủ chưa gửi bản xem trước đội hình, hồi phục và lương. Không thể tự tính thay hoặc tự bắt đầu đợt kế.
        </p>
        {error && <Alert>{error}</Alert>}
        <Button variant="primary"
          type="button"
          disabled={pending}
          onClick={onRefresh}
          className="min-h-11"
        >
          {pending ? "Đang tải dữ liệu…" : "Tải lại dữ liệu nghỉ"}
        </Button>
      </OrnateFrame>
    );
  }
  return <SurvivalBreakReady {...props} preview={preview} next={next} />;
}

type BreakFighter = NonNullable<SurvivalView["break"]>["fighters"][number];

function fighterStatus(fighter: BreakFighter, nextWave: number, paidReviveId?: string): string {
  if (fighter.hpAfterRecovery > 0)
    return fighter.revivedAtWave !== null ? `Đã hồi sinh ở đợt ${fighter.revivedAtWave}` : "Còn sống";
  if (fighter.id === paidReviveId) return `Hồi sinh khi vào đợt ${nextWave}`;
  if (fighter.autoRevive) return `Sẽ tự hồi sinh khi vào đợt ${nextWave}`;
  if (fighter.roundsUntilAutoRevive !== null && fighter.roundsUntilAutoRevive > 0)
    return `Chờ hồi sinh, còn ${fighter.roundsUntilAutoRevive} đợt`;
  return "Đủ điều kiện, chờ lượt hồi sinh";
}

function HpMeter({ fighter }: { fighter: BreakFighter }) {
  const isDown = fighter.hpAfterRecovery === 0;
  const width = fighter.maxHp > 0 ? Math.min(100, (fighter.hpAfterRecovery / fighter.maxHp) * 100) : 0;
  return (
    <div className="mt-1.5">
      <div className="mb-0.5 flex justify-between gap-2 text-caption text-on-wood-soft">
        <span>Năng lượng: {fighter.energy}</span>
        <span className={isDown ? "text-danger" : "text-on-wood"}>
          {fighter.hpBeforeRecovery} → {fighter.hpAfterRecovery}/{fighter.maxHp}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-black/40"
        role="meter"
        aria-label={`Máu dự kiến của ${fighter.name}`}
        aria-valuemin={0}
        aria-valuemax={fighter.maxHp}
        aria-valuenow={fighter.hpAfterRecovery}
      >
        <div className={`h-full ${isDown ? "bg-danger" : "bg-jade"}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SurvivalBreakReady({
  survival,
  pending,
  error,
  onNext,
  onEnd,
  preview,
  next,
}: SurvivalBreakScreenProps & {
  preview: NonNullable<SurvivalView["break"]>;
  next: NonNullable<SurvivalView["next"]>;
}) {
  const originalActiveIds = preview.activeIds;
  const leaderFighter = preview.fighters.find((fighter) => fighter.id === "dinhBoLinh");
  const currentProfession =
    preview.leaderBuildBasis?.profession ?? leaderFighter?.profession ?? "tuongSi";
  const currentElement =
    preview.leaderBuildBasis?.element ?? leaderFighter?.element ?? "moc";
  const [draftActiveIds, setDraftActiveIds] = useState<string[]>(() => [...originalActiveIds]);
  const [draftProfession, setDraftProfession] = useState<Profession>(currentProfession);
  const [draftElement, setDraftElement] = useState<Element>(currentElement);
  const [draftReviveId, setDraftReviveId] = useState<string | undefined>();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const paidReviveId = preview.canPayRevive && !preview.autoReviveId ? draftReviveId : undefined;
  const leaderPreview = preview.leaderBuildBasis
    ? previewLeaderBuild(preview.leaderBuildBasis, draftProfession, draftElement)
    : null;
  const lineupValid = validTacticalLineup(draftActiveIds, originalActiveIds, preview.fighters, paidReviveId);
  const leaderSkills = leaderPreview
    ? characterSkills(draftProfession, draftElement).map((skill) => ({
        skill,
        unlocked:
          skill.slot === undefined ||
          (preview.leaderBuildBasis?.progress.level ?? 1) >= (MAIN_SLOT_UNLOCK[skill.slot] ?? 1),
      }))
    : [];
  const leaderSkillLevel = (slot: number | undefined) =>
    preview.leaderBuildBasis?.progress.skillLevels[`o${slot ?? 0}`] ?? 1;
  const hasDraftChanges =
    draftActiveIds.some((id, index) => id !== originalActiveIds[index]) ||
    draftProfession !== currentProfession ||
    draftElement !== currentElement ||
    draftReviveId !== undefined;

  const downed = preview.fighters.filter((fighter) => fighter.hpAfterRecovery === 0);
  const autoRevive = preview.fighters.find((fighter) => fighter.id === preview.autoReviveId);
  const action = buildSurvivalNextWaveAction(
    {
      activeIds: draftActiveIds,
      profession: draftProfession,
      element: draftElement,
      ...(paidReviveId ? { reviveId: paidReviveId } : {}),
    },
    originalActiveIds,
    currentProfession,
    currentElement,
  );
  const picked = draftActiveIds.slice(1).filter(Boolean).length;
  const companions = preview.fighters.filter((fighter) => fighter.id !== "dinhBoLinh");

  /** Bật/tắt một đồng đội ra trận; người ra trận cũ quay lại đúng ô cũ nếu ô đó trống. */
  const toggleActive = (id: string) =>
    setDraftActiveIds((ids) => {
      const updated = [...ids];
      const at = updated.indexOf(id);
      if (at > 0) {
        updated[at] = "";
        return updated;
      }
      const home = originalActiveIds.indexOf(id);
      const slot = home > 0 && !updated[home] ? home : updated.findIndex((value, index) => index > 0 && !value);
      if (slot <= 0) return ids;
      updated[slot] = id;
      return updated;
    });

  const lineupMessage = lineupValid
    ? "Đội hình hợp lệ, Đinh Bộ Lĩnh giữ vị trí thủ lĩnh."
    : picked < 2
      ? `Chọn thêm ${2 - picked} đồng đội ra trận.`
      : "Đội hình chưa hợp lệ: cần đủ hai đồng đội sống; tướng gục chỉ được giữ nguyên vị trí khi không còn dự bị sống.";

  return (
    <section aria-labelledby="survival-break-title" className="flex flex-col gap-4">
      <OrnateFrame className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-kicker text-jade">Nghỉ giữa các đợt, tiến độ đã lưu, rời trang lúc nào cũng được</p>
          <h2 id="survival-break-title" className="text-xl font-black text-title-on-wood sm:text-2xl">
            Đã thắng đợt {survival.wave}, chuẩn bị đợt {next.wave}
          </h2>
          <p className="text-sm text-on-wood-soft">
            Đã vượt {survival.cleared} đợt, đợt {next.wave} có {next.foes.length} đối thủ cấp {next.level}
            {next.boss && (
              <span className="ml-2 inline-flex rounded-full bg-lacquer px-2 py-0.5 text-caption font-bold uppercase text-on-wood">
                Cảnh báo trùm
              </span>
            )}
          </p>
        </div>
        <dl className="ui-frame-inset grid grid-cols-[auto_auto] gap-x-3 px-3 py-2 text-sm">
          <dt className="text-on-wood-soft">Lương hiện tại</dt>
          <dd className="text-right font-bold">{preview.foodCurrent}</dd>
          <dt className="text-on-wood-soft">Sau tiếp tế</dt>
          <dd className="text-right font-bold text-jade">{preview.foodAfterSupply}</dd>
          {preview.foodAfterPaidRevive !== null && (
            <>
              <dt className="text-on-wood-soft">Sau hồi sinh</dt>
              <dd className="text-right font-bold">{preview.foodAfterPaidRevive}</dd>
            </>
          )}
        </dl>
      </OrnateFrame>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <OrnateFrame as="section" aria-labelledby="survival-force-title">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="survival-force-title" className="font-bold text-frame-gold">
                  Đội hình đợt {next.wave}, ra trận {picked}/2
                </h3>
                <p className="text-caption text-on-wood-soft">
                  Bấm thẻ tướng để đưa ra trận hoặc về dự bị. Máu là bản xem trước sau hồi phục.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {leaderFighter && (
                  <li className="min-w-0 rounded-lg border border-frame-gold/50 bg-wood-inset p-2">
                    <div className="flex items-center gap-2">
                      <Portrait id="dinhBoLinh" element={draftElement} profession={draftProfession} className="size-11 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="flex min-w-0 items-center gap-1 text-sm font-bold text-on-wood">
                          <span className="truncate">{leaderFighter.name}</span>
                          <CounterStar element={draftElement} foes={next.foes} />
                        </p>
                        <p className="text-caption font-semibold text-frame-gold">
                          Thủ lĩnh, {fighterStatus(leaderFighter, next.wave)}
                        </p>
                      </div>
                    </div>
                    <HpMeter fighter={leaderFighter} />
                  </li>
                )}
                {companions.map((fighter) => {
                  const isDown = fighter.hpAfterRecovery === 0;
                  const active = draftActiveIds.includes(fighter.id);
                  const canPick = availableNextWave(fighter, paidReviveId) || originalActiveIds.includes(fighter.id);
                  const full = picked >= 2;
                  return (
                    <li key={fighter.id} className="min-w-0">
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={`${fighter.name}: ${active ? "đang ra trận, bấm để về dự bị" : "dự bị, bấm để ra trận"}`}
                        disabled={pending || (!active && (!canPick || full))}
                        onClick={() => toggleActive(fighter.id)}
                        className={cn(
                          "block w-full rounded-lg border p-2 text-left transition-colors disabled:cursor-not-allowed",
                          active ? "border-jade bg-success-surface/40" : isDown ? "border-danger/40 bg-danger-surface" : "border-frame-line-soft bg-wood-inset hover:border-frame-gold/60",
                          !active && (!canPick || full) && "opacity-70",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Portrait
                            id={fighter.id}
                            element={fighter.element}
                            profession={fighter.profession}
                            className={`size-11 shrink-0 ${isDown && fighter.id !== paidReviveId ? "grayscale opacity-60" : ""}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2">
                              <span className="flex min-w-0 items-center gap-1 text-sm font-bold text-on-wood">
                                <span className="truncate">{fighter.name}</span>
                                <CounterStar element={fighter.element} foes={next.foes} />
                              </span>
                              <span className={cn("rounded-lg px-1.5 text-caption font-bold", active ? "bg-jade/20 text-jade" : "bg-black/30 text-on-wood-soft")}>
                                {active ? "Ra trận" : "Dự bị"}
                              </span>
                            </span>
                            <span className={`block text-caption font-semibold ${isDown ? "text-danger" : "text-jade"}`}>
                              {fighterStatus(fighter, next.wave, paidReviveId)}
                            </span>
                            <span className="flex flex-wrap items-center gap-1 text-caption text-on-wood-soft">
                              <ElementIcon element={fighter.element} className="size-3.5" />
                              {ELEMENT_NAME[fighter.element]}
                              <ProfessionIcon profession={fighter.profession} className="size-3.5" />
                              {PROFESSION_NAME[fighter.profession]}
                            </span>
                          </span>
                        </span>
                        <HpMeter fighter={fighter} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p role={lineupValid ? "status" : "alert"} className={`mt-2 text-caption ${lineupValid ? "text-jade" : "text-danger"}`}>
                {lineupMessage}
              </p>
            </OrnateFrame>

            <OrnateFrame as="section" aria-labelledby="survival-leader-title">
              <h3 id="survival-leader-title" className="font-bold text-frame-gold">Cấu hình Đinh Bộ Lĩnh</h3>
              {preview.leaderBuildBasis && leaderPreview ? (
                <>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nghề Đinh Bộ Lĩnh">
                      <span className="w-14 shrink-0 text-caption text-on-wood-soft">Nghề</span>
                      {PROFESSIONS.map((profession) => (
                        <ChoiceChip key={profession} selected={draftProfession === profession} disabled={pending}
                          onClick={() => setDraftProfession(profession)} className="gap-1">
                          <ProfessionIcon profession={profession} className="size-4" />
                          {PROFESSION_NAME[profession]}
                        </ChoiceChip>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nguyên tố Đinh Bộ Lĩnh">
                      <span className="w-14 shrink-0 text-caption text-on-wood-soft">Hệ</span>
                      {ELEMENTS.map((element) => (
                        <ChoiceChip key={element} selected={draftElement === element} disabled={pending}
                          onClick={() => setDraftElement(element)} className="gap-1">
                          <ElementIcon element={element} className="size-4" />
                          {ELEMENT_NAME[element]}
                        </ChoiceChip>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-caption text-on-wood-soft">
                    Máu {preview.leaderBuildBasis.hp}/{preview.leaderBuildBasis.maxHp}
                    {" → "}
                    <strong className="text-on-wood">{leaderPreview.hp}/{leaderPreview.config.maxHp}</strong>
                    {", "}Công {leaderPreview.config.atk}, Thủ {leaderPreview.config.def}
                    {", "}Hiện tại: {PROFESSION_NAME[currentProfession]}, {ELEMENT_NAME[currentElement]}
                  </p>
                  <p className="mt-1 text-caption text-on-wood-soft">
                    Máu giữ theo tỷ lệ {Math.round(preview.leaderBuildBasis.hpRatio * 100)}%; đổi nghề/hệ ở đây không sửa hồ sơ.
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-caption font-semibold text-on-wood">
                      Kỹ năng dự kiến, cấp {preview.leaderBuildBasis.progress.level}
                    </summary>
                    <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                      {leaderSkills.map(({ skill, unlocked }) => (
                        <li key={skill.id} className={`flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 ${unlocked ? "bg-wood-inset" : "bg-wood-inset/50 opacity-55"}`}>
                          <SkillIcon def={scaleSkill(skill, leaderSkillLevel(skill.slot))} className="size-8 shrink-0" />
                          <span className="min-w-0">
                            <span className="block truncate text-caption font-semibold text-on-wood">{skill.name}</span>
                            <span className="block text-caption text-on-wood-soft">
                              {unlocked ? `Đã mở, cấp kỹ năng ${leaderSkillLevel(skill.slot)}` : `Mở ở cấp ${MAIN_SLOT_UNLOCK[skill.slot ?? 0] ?? 1}`}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              ) : (
                <p role="status" className="mt-1 text-caption text-on-wood-soft">
                  Bản lưu này thiếu dữ liệu tiến trình để xem trước cấu hình. Cấu hình hiện tại được giữ nguyên.
                </p>
              )}
            </OrnateFrame>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <OrnateFrame className="flex flex-col gap-2">
              {error && <Alert>Máy chủ báo lỗi: {error}</Alert>}
              {pending && <p role="status" className="text-sm text-frame-gold">Đang chờ máy chủ xác nhận…</p>}
              {confirmEnd ? (
                <>
                  <p className="text-sm">
                    <strong>Dừng hẳn lượt chơi?</strong> Ghi {survival.cleared} đợt vào bảng; lượt sau phải đánh lại từ đợt 1.
                  </p>
                  <Button disabled={pending} onClick={onEnd} className="min-h-11">Dừng – ghi {survival.cleared} đợt</Button>
                  <Button variant="secondary" disabled={pending} onClick={() => setConfirmEnd(false)} className="min-h-11">Giữ lượt chơi</Button>
                </>
              ) : (
                <>
                  <Button variant="primary" type="button" disabled={pending || !lineupValid} onClick={() => onNext(action)} className="min-h-11 max-lg:hidden">
                    {pending ? "Đang xử lý…" : `Xác nhận và vào đợt ${next.wave}`}
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" type="button" disabled={pending || !hasDraftChanges}
                      onClick={() => {
                        setDraftActiveIds([...originalActiveIds]);
                        setDraftProfession(currentProfession);
                        setDraftElement(currentElement);
                        setDraftReviveId(undefined);
                      }}
                      className="min-h-11 flex-1">
                      Hoàn tác bản nháp
                    </Button>
                    <Button variant="secondary" size="sm" type="button" disabled={pending} onClick={() => setConfirmEnd(true)} className="min-h-11 flex-1">
                      Dừng Trấn Ải
                    </Button>
                  </div>
                </>
              )}
            </OrnateFrame>
            <OrnateFrame as="section" aria-labelledby="survival-enemy-title">
              <h3 id="survival-enemy-title" className="font-bold text-frame-gold">
                Đối thủ đợt {next.wave}, cấp {next.level}
              </h3>
              {next.boss && <p className="my-1 text-sm font-bold text-danger">Đợt trùm — đội hình có sứ quân thủ lĩnh.</p>}
              <ul className="mt-2 flex flex-col gap-2">
                {next.foes.map((foe) => (
                  <li key={foe.id} className="flex min-w-0 items-center gap-2">
                    <Portrait id={foe.id} element={foe.element} profession={foe.profession} className="size-10 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-wood">{foe.name}</p>
                      <p className="flex items-center gap-1 text-caption text-on-wood-soft">
                        <ElementIcon element={foe.element} className="size-3.5" />
                        {ELEMENT_NAME[foe.element]}
                        <ProfessionIcon profession={foe.profession} className="size-3.5" />
                        {PROFESSION_NAME[foe.profession]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </OrnateFrame>

            <OrnateFrame as="section" aria-labelledby="survival-revive-title" className="flex flex-col gap-2">
              <h3 id="survival-revive-title" className="font-bold text-frame-gold">Hồi sinh</h3>
              {autoRevive ? (
                <Alert tone="success">
                  <strong className="block">{autoRevive.name} sẽ tự hồi sinh.</strong>
                  Máu hồi sinh và việc áp dụng được máy chủ xử lý khi bạn vào đợt kế.
                </Alert>
              ) : downed.length === 0 ? (
                <p className="text-sm text-jade">Không có tướng gục; hiện không cần hồi sinh.</p>
              ) : (
                <>
                  <p className="text-sm text-on-wood-soft">
                    Trả <strong>{preview.reviveCost} lương</strong> để một tướng gục đứng dậy ngay khi vào đợt kế.
                  </p>
                  {!preview.canPayRevive && <Alert tone="warning">Không đủ lương sau tiếp tế để trả phí hồi sinh.</Alert>}
                  {downed.map((fighter) => (
                    <ChoiceChip
                      key={fighter.id}
                      size="md"
                      selected={draftReviveId === fighter.id}
                      disabled={pending || !preview.canPayRevive}
                      onClick={() => setDraftReviveId((current) => (current === fighter.id ? undefined : fighter.id))}
                    >
                      Hồi sinh {fighter.name}, {preview.reviveCost} lương
                      {fighter.location === "reserve" ? ", dự bị" : ""}
                    </ChoiceChip>
                  ))}
                </>
              )}
            </OrnateFrame>
          </aside>
        </div>
      {/* Điện thoại: nút vào đợt luôn trong tầm tay khi cuộn qua đội hình. */}
      {!confirmEnd && (
        <div className="sticky bottom-2 z-10 lg:hidden">
          <Button variant="primary" type="button" fullWidth disabled={pending || !lineupValid} onClick={() => onNext(action)} className="min-h-12 shadow-2xl">
            {pending ? "Đang xử lý…" : `Xác nhận và vào đợt ${next.wave}`}
          </Button>
        </div>
      )}
    </section>
  );
}
