"use client";

import { useEffect } from "react";
import { Alert, Button, Select, choiceVariants } from "@/components/ui";
import { useAudio } from "../audio/AudioProvider";

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
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { SkillIcon } from "../art/skills";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { useState } from "react";
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
  const { play: playSound } = useAudio();
  // Báo trước đợt kế: một tiếng cảnh báo khi màn nghỉ hiện ra.
  useEffect(() => playSound("survival.warn"), [playSound]);
  if (!preview || !next) {
    return (
      <section
        role="alert"
        className="fixed inset-2 z-40 m-auto flex max-h-[90dvh] max-w-3xl flex-col justify-center gap-4 overflow-y-auto rounded-xl border border-danger/70 bg-wood-lo/[.98] p-4 text-on-wood shadow-2xl sm:p-6"
      >
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
      </section>
    );
  }
  return <SurvivalBreakReady {...props} preview={preview} next={next} />;
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
  const leaderFighter = preview?.fighters.find(
    (fighter) => fighter.id === "dinhBoLinh",
  );
  const [draftActiveIds, setDraftActiveIds] = useState<string[]>(() => [
    ...originalActiveIds,
  ]);
  const [draftProfession, setDraftProfession] = useState<Profession>(
    () => preview?.leaderBuildBasis?.profession ?? leaderFighter?.profession ?? "tuongSi",
  );
  const [draftElement, setDraftElement] = useState<Element>(
    () => preview.leaderBuildBasis?.element ?? leaderFighter?.element ?? "moc",
  );
  const [draftReviveId, setDraftReviveId] = useState<string | undefined>();
  const paidReviveId = preview.canPayRevive && !preview.autoReviveId
    ? draftReviveId
    : undefined;
  const leaderPreview =
    preview.leaderBuildBasis
      ? previewLeaderBuild(
          preview.leaderBuildBasis,
          draftProfession,
          draftElement,
        )
      : null;
  const lineupValid = validTacticalLineup(
    draftActiveIds,
    originalActiveIds,
    preview.fighters,
    paidReviveId,
  );
  const leaderSkills = leaderPreview
    ? characterSkills(draftProfession, draftElement).map((skill) => ({
        skill,
        unlocked:
          skill.slot === undefined ||
          (preview.leaderBuildBasis?.progress.level ?? 1) >=
            (MAIN_SLOT_UNLOCK[skill.slot] ?? 1),
      }))
    : [];
  const leaderSkillLevel = (slot: number | undefined) =>
    preview.leaderBuildBasis?.progress.skillLevels[`o${slot ?? 0}`] ?? 1;
  const hasDraftChanges =
    draftActiveIds.some((id, index) => id !== originalActiveIds[index]) ||
    draftProfession !==
      (preview.leaderBuildBasis?.profession ?? leaderFighter?.profession) ||
    draftElement !==
      (preview.leaderBuildBasis?.element ?? leaderFighter?.element) ||
    draftReviveId !== undefined;

  const downed = preview.fighters.filter((fighter) => fighter.hpAfterRecovery === 0);
  const autoRevive = preview.fighters.find(
    (fighter) => fighter.id === preview.autoReviveId,
  );
  const fightersById = new Map(preview.fighters.map((fighter) => [fighter.id, fighter]));
  const livingReserveIds = preview.reserveIds.filter(
    (id) => {
      const fighter = fightersById.get(id);
      return fighter !== undefined && availableNextWave(fighter, paidReviveId);
    },
  );
  const currentProfession =
    preview.leaderBuildBasis?.profession ?? leaderFighter?.profession ?? "tuongSi";
  const currentElement =
    preview.leaderBuildBasis?.element ?? leaderFighter?.element ?? "moc";
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
  const livingReserveRemains = preview.fighters.some(
    (fighter) =>
      !draftActiveIds.includes(fighter.id) &&
      availableNextWave(fighter, paidReviveId),
  );
  const slotOptions = (slot: 1 | 2) => {
    const selectedId = draftActiveIds[slot];
    const choices = [
      ...new Set([
        originalActiveIds[1],
        originalActiveIds[2],
        ...livingReserveIds,
      ]),
    ].filter(
      (id): id is string =>
        typeof id === "string" &&
        id !== draftActiveIds[slot === 1 ? 2 : 1],
    );
    return choices.map((id) => {
      const fighter = fightersById.get(id);
      const mayKeepDowned =
        id === selectedId &&
        originalActiveIds[slot] === id &&
        !livingReserveRemains;
      return (
        <option
          key={id}
          value={id}
          disabled={!fighter || (!availableNextWave(fighter, paidReviveId) && !mayKeepDowned)}
        >
          {fighter?.name ?? id}
          {fighter?.hpAfterRecovery === 0
            ? availableNextWave(fighter, paidReviveId) ? " · sẽ hồi sinh" : " · đã gục"
            : ""}
        </option>
      );
    });
  };

  return (
    <section
      aria-labelledby="survival-break-title"
      className="fixed inset-x-2 bottom-2 z-40 m-auto flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-4 overflow-y-auto rounded-xl border border-frame-gold/70 bg-wood-lo/[.98] p-3 text-on-wood shadow-2xl sm:inset-4 sm:w-auto sm:p-5 lg:inset-8"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-frame-line-soft pb-3">
        <div>
          <p className="text-kicker text-jade">
            Nghỉ giữa các đợt · Có thể tiếp tục sau khi tải lại
          </p>
          <h2 id="survival-break-title" className="text-xl font-black text-title-on-wood sm:text-2xl">
            Đã thắng đợt {survival.wave}
          </h2>
          <p className="text-sm text-on-wood-soft">
            Đợt tiếp theo: {next.wave}
            {next.boss && (
              <span className="ml-2 inline-flex rounded-full bg-lacquer px-2 py-0.5 text-caption font-bold uppercase text-on-wood">
                Cảnh báo trùm
              </span>
            )}
          </p>
        </div>
        <div className="ui-frame-inset px-3 py-2 text-sm text-on-wood">
          <p>Lương hiện tại: <strong>{preview.foodCurrent}</strong></p>
          <p>Sau tiếp tế: <strong className="text-jade">{preview.foodAfterSupply}</strong></p>
          {preview.foodAfterPaidRevive !== null && (
            <p>Sau hồi sinh: <strong>{preview.foodAfterPaidRevive}</strong></p>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <section aria-labelledby="survival-force-title">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="survival-force-title" className="font-bold text-frame-gold">
                Quân lực · máu sau hồi phục
              </h3>
              <p className="text-caption text-on-wood-soft">
                Máu hiển thị là bản xem trước do máy chủ tính; năng lượng giữ nguyên.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {preview.fighters.map((fighter) => {
                const isDown = fighter.hpAfterRecovery === 0;
                const status = isDown
                  ? fighter.autoRevive
                    ? `Sẽ tự hồi sinh khi vào đợt ${next.wave}`
                    : fighter.roundsUntilAutoRevive !== null &&
                        fighter.roundsUntilAutoRevive > 0
                      ? `Chờ hồi sinh · còn ${fighter.roundsUntilAutoRevive} đợt`
                      : "Đủ điều kiện · chờ lượt hồi sinh"
                  : fighter.revivedAtWave !== null
                    ? `Đã hồi sinh ở đợt ${fighter.revivedAtWave}`
                    : "Còn sống";
                const hpWidth =
                  fighter.maxHp > 0
                    ? Math.min(100, (fighter.hpAfterRecovery / fighter.maxHp) * 100)
                    : 0;
                return (
                  <li
                    key={fighter.id}
                    className={`min-w-0 rounded-lg border p-2 ${
                      isDown
                        ? "border-danger/40 bg-danger-surface"
                        : "border-frame-line-soft bg-wood-inset"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Portrait
                        id={fighter.id}
                        element={fighter.element}
                        profession={fighter.profession}
                        className={`size-11 shrink-0 ${isDown ? "grayscale opacity-60" : ""}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="truncate text-sm font-bold text-on-wood">{fighter.name}</p>
                          <span className={`text-caption font-semibold ${isDown ? "text-danger" : "text-jade"}`}>
                            {status}
                          </span>
                        </div>
                        <p className="flex flex-wrap items-center gap-1 text-caption text-on-wood-soft">
                          {fighter.location === "active" ? "Ra trận" : "Dự bị"}
                          <ElementIcon element={fighter.element} className="size-3.5" />
                          {ELEMENT_NAME[fighter.element]}
                          <ProfessionIcon profession={fighter.profession} className="size-3.5" />
                          {PROFESSION_NAME[fighter.profession]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between gap-2 text-caption text-on-wood-soft">
                        <span>Máu</span>
                        <span className={isDown ? "text-danger" : "text-on-wood"}>
                          {fighter.hpBeforeRecovery} → {fighter.hpAfterRecovery}/{fighter.maxHp}
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-wood-inset"
                        role="meter"
                        aria-label={`Máu dự kiến của ${fighter.name}`}
                        aria-valuemin={0}
                        aria-valuemax={fighter.maxHp}
                        aria-valuenow={fighter.hpAfterRecovery}
                      >
                        <div
                          className={`h-full ${isDown ? "bg-danger" : "bg-jade"}`}
                          style={{ width: `${hpWidth}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-caption text-on-wood-soft">
                        Năng lượng: {fighter.energy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            aria-labelledby="survival-tactics-title"
            className="ui-frame-inset p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 id="survival-tactics-title" className="font-bold text-frame-gold">
                  Chuẩn bị chiến thuật
                </h3>
                <p className="text-caption text-on-wood-soft">
                  Bản nháp chỉ thay đổi trên màn hình; máy chủ chỉ áp dụng khi xác nhận vào đợt.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={pending || !hasDraftChanges}
                onClick={() => {
                  setDraftActiveIds([...originalActiveIds]);
                  setDraftProfession(currentProfession);
                  setDraftElement(currentElement);
                  setDraftReviveId(undefined);
                }}
                className="min-h-10 pointer-coarse:min-h-11"
              >
                Hoàn tác bản nháp
              </Button>
            </div>

            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-bold text-on-wood">
                  Đội hình đợt tiếp theo
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {([1, 2] as const).map((slot) => {
                    const id = draftActiveIds[slot] ?? "";
                    const fighter = fightersById.get(id);
                    return (
                      <label key={slot} className="flex min-w-0 items-center gap-2 ui-frame-inset p-2">
                        {fighter && (
                          <Portrait
                            id={fighter.id}
                            element={fighter.element}
                            profession={fighter.profession}
                            className="size-10 shrink-0"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-caption text-on-wood-soft">
                            Phó tướng {slot} · {fighter?.hpAfterRecovery ?? 0}/{fighter?.maxHp ?? 0} máu
                          </span>
                          <Select
                            aria-label={`Chọn phó tướng vị trí ${slot}`}
                            disabled={pending}
                            value={id}
                            onChange={(event) =>
                              setDraftActiveIds((ids) => {
                                const updated = [...ids];
                                updated[slot] = event.target.value;
                                return updated;
                              })
                            }
                            className="min-h-10 pointer-coarse:min-h-11 w-full text-sm"
                          >
                            {slotOptions(slot)}
                          </Select>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p
                  role={lineupValid ? "status" : "alert"}
                  className={`mt-2 text-caption ${lineupValid ? "text-jade" : "text-danger"}`}
                >
                  {lineupValid
                    ? "Đội hình hợp lệ · Đinh Bộ Lĩnh giữ vị trí thủ lĩnh."
                    : "Đội hình chưa hợp lệ: cần đủ hai đồng đội sống; tướng gục chỉ được giữ nguyên vị trí khi không còn dự bị sống."}
                </p>
                <p className="mt-2 text-caption font-semibold text-on-wood-soft">
                  Dự bị sau khi xác nhận:
                </p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {preview.fighters
                    .filter((fighter) => !draftActiveIds.includes(fighter.id))
                    .map((fighter) => (
                      <li key={fighter.id} className="flex items-center gap-1 rounded bg-wood-inset px-2 py-1 text-caption text-on-wood">
                        <Portrait
                          id={fighter.id}
                          element={fighter.element}
                          profession={fighter.profession}
                          className="size-7"
                        />
                        <span>{fighter.name}</span>
                        <span className={fighter.hpAfterRecovery === 0 ? "text-danger" : "text-jade"}>
                          {fighter.hpAfterRecovery === 0 ? "Gục" : `${fighter.hpAfterRecovery}/${fighter.maxHp} máu`}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-bold text-on-wood">
                  Cấu hình Đinh Bộ Lĩnh
                </h4>
                {preview.leaderBuildBasis && leaderPreview ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-caption text-on-wood-soft">
                        Nghề
                        <Select
                          aria-label="Nghề Đinh Bộ Lĩnh"
                          disabled={pending}
                          value={draftProfession}
                          onChange={(event) =>
                            setDraftProfession(event.target.value as Profession)
                          }
                          className="mt-1 min-h-10 pointer-coarse:min-h-11 w-full text-sm"
                        >
                          {PROFESSIONS.map((profession) => (
                            <option key={profession} value={profession}>
                              {PROFESSION_NAME[profession]}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className="text-caption text-on-wood-soft">
                        Nguyên tố
                        <Select
                          aria-label="Nguyên tố Đinh Bộ Lĩnh"
                          disabled={pending}
                          value={draftElement}
                          onChange={(event) =>
                            setDraftElement(event.target.value as Element)
                          }
                          className="mt-1 min-h-10 pointer-coarse:min-h-11 w-full text-sm"
                        >
                          {ELEMENTS.map((element) => (
                            <option key={element} value={element}>
                              {ELEMENT_NAME[element]}
                            </option>
                          ))}
                        </Select>
                      </label>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-caption text-on-wood-soft">
                      <Portrait
                        id="dinhBoLinh"
                        element={draftElement}
                        profession={draftProfession}
                        className="size-11"
                      />
                      <span>
                        Máu {preview.leaderBuildBasis.hp}/{preview.leaderBuildBasis.maxHp}
                        {" → "}
                        {leaderPreview.hp}/{leaderPreview.config.maxHp}
                        {" · "}
                        Công {leaderPreview.config.atk} · Thủ {leaderPreview.config.def}
                      </span>
                    </div>
                    <p className="mt-1 text-caption text-on-wood-soft">
                      Hiện tại: {PROFESSION_NAME[currentProfession]} · {ELEMENT_NAME[currentElement]}
                      {" → "}
                      Bản nháp: {PROFESSION_NAME[draftProfession]} · {ELEMENT_NAME[draftElement]}
                    </p>
                    <p className="mt-1 text-caption text-on-wood-soft">
                      Máu được chuyển theo tỷ lệ {Math.round(preview.leaderBuildBasis.hpRatio * 100)}%; thay đổi nghề/hệ không sửa hồ sơ.
                    </p>
                    <div className="mt-2">
                      <p className="mb-1 text-caption font-semibold text-on-wood-soft">
                        Kỹ năng dự kiến · cấp {preview.leaderBuildBasis.progress.level}
                      </p>
                      <ul className="grid gap-1 sm:grid-cols-2">
                        {leaderSkills.map(({ skill, unlocked }) => (
                          <li
                            key={skill.id}
                            className={`flex min-w-0 items-center gap-2 rounded px-2 py-1 ${unlocked ? "bg-wood-inset" : "bg-wood-inset/50 opacity-55"}`}
                          >
                            <SkillIcon
                              def={scaleSkill(
                                skill,
                                leaderSkillLevel(skill.slot),
                              )}
                              className="size-8 shrink-0"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-caption font-semibold text-on-wood">
                                {skill.name}
                              </span>
                              <span className="block text-caption text-on-wood-soft">
                                {unlocked
                                  ? `Đã mở · cấp kỹ năng ${leaderSkillLevel(skill.slot)}`
                                  : `Mở ở cấp ${MAIN_SLOT_UNLOCK[skill.slot ?? 0] ?? 1}`}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p role="status" className="ui-frame-inset p-2 text-caption text-on-wood-soft">
                    Bản lưu này thiếu dữ liệu tiến trình để xem trước cấu hình. Cấu hình hiện tại được giữ nguyên.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="survival-enemy-title" className="ui-frame-inset p-3">
            <h3 id="survival-enemy-title" className="font-bold text-frame-gold">
              Đối thủ đợt {next.wave} · cấp {next.level}
            </h3>
            {next.boss && (
              <p className="my-1 text-sm font-bold text-danger">
                Đợt trùm — đội hình có sứ quân thủ lĩnh.
              </p>
            )}
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {next.foes.map((foe) => (
                <li key={foe.id} className="flex min-w-0 items-center gap-2 ui-frame-inset p-2">
                  <Portrait
                    id={foe.id}
                    element={foe.element}
                    profession={foe.profession}
                    className="size-10 shrink-0"
                  />
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
          </section>
        </div>

        <aside className="ui-frame-inset flex flex-col gap-3 p-3">
          <h3 className="font-bold text-frame-gold">Hồi sinh</h3>
          {autoRevive ? (
            <Alert tone="success">
              <strong className="block">{autoRevive.name} sẽ tự hồi sinh.</strong>
              Máu hồi sinh và việc áp dụng được máy chủ xử lý khi bạn vào đợt kế.
            </Alert>
          ) : downed.length === 0 ? (
            <Alert tone="success">
              Không có tướng gục; hiện không cần hồi sinh.
            </Alert>
          ) : (
            <>
              <p className="text-sm text-on-wood-soft">
                Chọn một tướng gục để hồi sinh khi xác nhận vào đợt kế. Chi phí:{" "}
                <strong>{preview.reviveCost} lương</strong>.
              </p>
              {!preview.canPayRevive && (
                <Alert tone="warning">
                  Không đủ lương sau tiếp tế để trả phí hồi sinh.
                </Alert>
              )}
              <div className="flex flex-col gap-2">
                {downed.map((fighter) => (
                  <button
                    key={fighter.id}
                    type="button"
                    disabled={pending || !preview.canPayRevive}
                    aria-pressed={draftReviveId === fighter.id}
                    onClick={() =>
                      setDraftReviveId((current) =>
                        current === fighter.id ? undefined : fighter.id,
                      )
                    }
                    className={choiceVariants({ className: "min-h-11 justify-center" })}
                  >
                    Hồi sinh {fighter.name} · {preview.reviveCost} lương
                    {fighter.location === "reserve" ? " · dự bị" : ""}
                    {draftReviveId === fighter.id ? " · đã chọn" : ""}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && (
            <Alert>Máy chủ báo lỗi: {error}</Alert>
          )}
          {pending && (
            <p role="status" className="text-sm text-frame-gold">
              Đang chờ máy chủ xác nhận…
            </p>
          )}
          <div className="mt-auto flex flex-col gap-2 border-t border-frame-line-soft pt-3">
            <Button variant="primary"
              type="button"
              disabled={pending || !lineupValid}
              onClick={() => onNext(action)}
              className="min-h-11"
            >
              {pending ? "Đang xử lý…" : `Xác nhận và vào đợt ${next.wave}`}
            </Button>
            <Button variant="secondary"
              type="button"
              disabled={pending}
              onClick={onEnd}
              className="min-h-11 text-sm"
            >
              Dừng Trấn Ải · ghi {survival.cleared} đợt
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
