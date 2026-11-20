"use client";

// Hợp Kích (Shan 19/11/2026, trước gọi Phối Hợp): ghép ba tướng quân bất kỳ (đội 3vs3 có thể không có Đinh Bộ Lĩnh) để xem kỹ năng của người
// này mở được bị động nào của người kia. Đinh Bộ Lĩnh chọn hệ, nghề ngay trong ô của ông (chỉ để tính, không đổi hồ sơ). Lưới chọn tướng xếp theo số liên kết tướng đó thêm vào đội, nên cũng là gợi ý đồng đội.
// Chỉ đọc danh mục kỹ năng, bị động trong @/core (links.ts); không đổi đội hình thật (đổi ở Doanh Trại).

import { useMemo, useState } from "react";
import {
  CHASE_PASSIVES,
  COMBO_PASSIVES,
  MAIN_ID,
  PLAYABLE_COMPANIONS,
  withComboPassive,
  type Element,
  type FighterConfig,
  type Profession,
  type SkillDef,
} from "@/core";
import { ModeBanner, ModeLoading, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { buttonVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { PassiveIcon } from "../art/passives";
import { Portrait } from "../art/portraits";
import { SkillIcon } from "../art/skills";
import HeroGrid from "../arena/HeroGrid";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { SIGNAL_NAME, type PassiveRef } from "../battle/SkillDetails";
import { fighterOf } from "../profile/HeroDetail";
import { ownedIds } from "../profile/roster";
import { useProfile } from "../profile/useProfile";
import { SceneLink } from "../SceneContext";
import { bestChains, comboLinks, groupChains, comboMember, crossLinksWith, type ComboChain, type ComboLink, type ComboMember } from "./links";

const passiveName = (p: PassiveRef) => (p.kind === "combo" ? COMBO_PASSIVES[p.id].name : CHASE_PASSIVES[p.id].name);
const passiveText = (p: PassiveRef) => (p.kind === "combo" ? COMBO_PASSIVES[p.id].description : CHASE_PASSIVES[p.id].description);

export default function CombosScreen() {
  const { profile, loadError } = useProfile();
  const [picks, setPicks] = useState<readonly (string | null)[]>([null, null, null]);
  const [slot, setSlot] = useState<0 | 1 | 2>(0);
  /** Hệ, nghề Đinh Bộ Lĩnh dùng để tính trên trang; mặc định theo hồ sơ. */
  const [build, setBuild] = useState<{ element: Element; profession: Profession } | null>(null);
  const leader = build ?? (profile ? { element: profile.element, profession: profile.profession } : null);

  const owned = useMemo(() => new Set(profile ? ownedIds(profile) : []), [profile]);
  /** Cấu hình trận của mọi tướng: tướng đã có lấy theo hồ sơ, tướng chưa có lấy cấu hình gốc trong danh sách. */
  const configs = useMemo(() => {
    const map = new Map<string, FighterConfig>();
    if (!profile) return map;
    // Bỏ bị động cũ theo nghề hồ sơ để withComboPassive dựng lại theo hệ, nghề đang chọn trên trang.
    map.set(MAIN_ID, withComboPassive({ ...fighterOf(profile, MAIN_ID, false), ...leader!, comboPassive: undefined, chasePassives: undefined }));
    for (const c of PLAYABLE_COMPANIONS) map.set(c.id, withComboPassive(owned.has(c.id) ? fighterOf(profile, c.id, false) : c));
    return map;
  }, [profile, owned, leader?.element, leader?.profession]); // eslint-disable-line react-hooks/exhaustive-deps

  const team: ComboMember[] = useMemo(
    () => picks.flatMap((id) => (id && configs.has(id) ? [comboMember(id, configs.get(id)!)] : [])),
    [picks, configs],
  );
  const links = useMemo(() => comboLinks(team), [team]);
  const cross = links.filter((l) => l.from !== l.to);
  const chains = useMemo(() => bestChains(team, Infinity), [team]);

  // Gợi ý: số liên kết chéo mỗi tướng thêm vào đội hiện có (bỏ người đang ở ô đang chọn).
  const base = useMemo(() => team.filter((m) => m.id !== picks[slot]), [team, picks, slot]);
  const candidates = useMemo(() => {
    if (!profile) return [];
    return [MAIN_ID, ...PLAYABLE_COMPANIONS.map((c) => c.id)]
      .filter((id) => !picks.includes(id) || picks[slot] === id)
      .map((id) => {
        const cfg = configs.get(id)!;
        return { id, name: cfg.name, element: cfg.element, profession: cfg.profession, anyBuild: id === MAIN_ID, score: crossLinksWith(base, comboMember(id, cfg)), owned: owned.has(id) };
      })
      .sort((a, b) => b.score - a.score || Number(b.owned) - Number(a.owned) || a.name.localeCompare(b.name, "vi"));
  }, [profile, picks, slot, base, configs, owned]);

  if (!profile)
    return (
      <ModeScreen label="Hợp Kích">
        <ModeLoading error={loadError ? "Chưa mở được hồ sơ. Xin tải lại trang." : null} label="Đang tải Hợp Kích…" />
      </ModeScreen>
    );

  /** Đinh Bộ Lĩnh đổi được hệ, nghề: bấm ông khi đang lọc một hệ hay nghề thì lấy luôn hệ, nghề đó làm bộ của ông. */
  const pick = (id: string, filter: { readonly element: Element | "all"; readonly profession: Profession | "all" }) => {
    if (id === MAIN_ID && leader)
      setBuild({ element: filter.element === "all" ? leader.element : filter.element, profession: filter.profession === "all" ? leader.profession : filter.profession });
    setPicks((p) => {
      const next = [...p];
      next[slot] = id;
      return next;
    });
    const empty = [0, 1, 2].find((i) => i !== slot && picks[i] === null);
    if (empty !== undefined) setSlot(empty as 0 | 1 | 2);
  };
  // Chọn nhanh ba tướng ngẫu nhiên trong mọi tướng.
  const randomTeam = () => {
    const pool = [MAIN_ID, ...PLAYABLE_COMPANIONS.map((c) => c.id)];
    const chosen: string[] = [];
    while (chosen.length < Math.min(3, pool.length)) {
      const id = pool[Math.floor(Math.random() * pool.length)]!;
      if (!chosen.includes(id)) chosen.push(id);
    }
    setPicks([chosen[0] ?? null, chosen[1] ?? null, chosen[2] ?? null]);
  };

  return (
    <ModeScreen label="Hợp Kích" card>
      <ModeBanner
        title="Hợp Kích"
        kicker="Kết hợp tướng quân"
        description="Ghép ba tướng để xem chiêu của người này mở bị động nào của người kia. Tướng hợp đội nhất xếp đầu lưới chọn."
        art="/art/home/arena.webp"
        stats={[
          { label: "Liên kết chéo", value: cross.length },
          { label: "Chuỗi dài nhất", value: chains[0] ? `${chains[0].steps.length} bước` : "–" },
        ]}
      />

      <section aria-label="Đội phối hợp" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-on-wood-soft">Bấm một ô rồi chọn tướng ở lưới bên dưới. Đội 3vs3 không bắt buộc có Đinh Bộ Lĩnh.</p>
          <div className="flex gap-2">
            <button type="button" onClick={randomTeam} className={buttonVariants({ variant: "secondary", size: "sm" })}>Ngẫu nhiên</button>
            <button type="button" onClick={() => { setPicks([null, null, null]); setSlot(0); }} className={buttonVariants({ variant: "ghost", size: "sm" })}>Xóa đội</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {picks.map((id, i) => {
            const m = id ? team.find((t) => t.id === id) : undefined;
            const active = slot === i;
            return (
              <div key={i} className={cn("ui-frame-inset flex flex-col gap-2 rounded-xl p-3", active && "ring-2 ring-frame-gold")}>
                <button type="button" aria-pressed={active} aria-label={`Ô tướng ${i + 1}${m ? `: ${m.name}` : ""}`} onClick={() => setSlot(i as 0 | 1 | 2)} className="flex min-h-14 items-center gap-3 text-left">
                  {m ? (
                    <>
                      <Portrait id={m.id} element={m.fighter.element} profession={m.fighter.profession} className="size-14 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate font-serif font-bold text-title-on-wood">{m.name}</span>
                        <span className="flex items-center gap-1 text-caption text-on-wood-soft">
                          <ElementIcon element={m.fighter.element} className="size-4" /> {ELEMENT_NAME[m.fighter.element]}, <ProfessionIcon profession={m.fighter.profession} className="size-4" /> {PROFESSION_NAME[m.fighter.profession]}
                        </span>
                        <span className="block text-caption text-frame-gold">{active ? "Đang chọn ô này" : "Bấm để đổi"}</span>
                      </span>
                    </>
                  ) : (
                    <span className="w-full text-center text-on-wood-soft">{active ? `Tướng ${i + 1}: chọn ở lưới bên dưới` : `Tướng ${i + 1}: bấm để chọn`}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Tướng có nhiều liên kết với đội đang chọn xếp lên trước. Đinh Bộ Lĩnh hiện ở mọi bộ lọc; bấm ông khi đang lọc hệ, nghề thì ông mang đúng hệ, nghề đó.">Chọn tướng {slot + 1}</SectionTitle>
          <HeroGrid
            label="Chọn tướng phối hợp"
            items={candidates}
            selected={picks[slot] ?? null}
            onSelect={pick}
            pageSize={12}
          />
        </OrnateFrame>

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Chiêu phát tín hiệu khi có tác dụng thực (phá giáp, khống chế, hồi máu…); bị động của đồng đội bắt tín hiệu để truy kích.">
            Liên kết trong đội
          </SectionTitle>
          {team.length < 2 ? (
            <p className="text-sm text-on-wood-soft">Chọn ít nhất một đồng đội để xem liên kết.</p>
          ) : (
            <>
              <PairMatrix team={team} links={links} />
              <ChainList key={team.map((m) => m.id).join()} team={team} chains={chains} />
              <h3 className="font-serif text-lg font-bold text-title-on-wood">Liên kết theo cặp</h3>
              <PairGroups team={team} links={cross} />
              {links.length > cross.length && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold text-on-wood pointer-coarse:py-3">Tự phối: {links.length - cross.length} liên kết trong cùng một người</summary>
                  <LinkList team={team} links={links.filter((l) => l.from === l.to)} />
                </details>
              )}
            </>
          )}
          <p className="text-caption text-on-wood-soft">
            Đây là ước lượng theo danh mục chiêu; trong trận cần tác dụng thực mới phát tín hiệu. Đổi đội ra trận ở{" "}
            <SceneLink scene="PROFILE" className="ui-link text-frame-gold underline underline-offset-2">Doanh Trại</SceneLink>.
          </p>
        </OrnateFrame>
      </div>
      <p className="text-center">
        <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary" })}>Về Doanh Trại</SceneLink>
      </p>
    </ModeScreen>
  );
}

/** Bảng ba người: hàng là người phát tín hiệu, cột là người phản ứng, ô là số liên kết. */
function PairMatrix({ team, links }: { team: readonly ComboMember[]; links: readonly ComboLink[] }) {
  return (
    <table className="w-full text-center text-sm tabular-nums">
      <caption className="sr-only">Số liên kết theo người phát tín hiệu (hàng) và người phản ứng (cột)</caption>
      <thead>
        <tr className="text-caption text-on-wood-soft">
          <th className="p-1 text-left font-normal">Phát → nhận</th>
          {team.map((m) => (
            <th key={m.id} scope="col" className="p-1 font-semibold">{m.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {team.map((a, i) => (
          <tr key={a.id} className="border-t border-frame-line-soft">
            <th scope="row" className="p-1 text-left font-semibold">{a.name}</th>
            {team.map((b, j) => {
              const n = links.filter((l) => l.from === i && l.to === j).length;
              return (
                <td key={b.id} className={cn("p-1", i === j ? "text-on-wood-soft" : n > 0 ? "font-bold text-jade" : "text-on-wood-soft")}>
                  {i === j ? (n ? `(${n})` : "–") : n}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Liên kết gom theo cặp người phát → người nhận; mỗi cặp một mục thu gọn, tóm tắt hiện số liên kết và các bị động mở. */
function PairGroups({ team, links }: { team: readonly ComboMember[]; links: readonly ComboLink[] }) {
  if (links.length === 0) return <p className="text-sm text-on-wood-soft">Đội này chưa có liên kết chéo. Thử đồng đội có số xanh ở lưới chọn.</p>;
  const pairs = new Map<string, ComboLink[]>();
  for (const l of links) pairs.set(`${l.from}-${l.to}`, [...(pairs.get(`${l.from}-${l.to}`) ?? []), l]);
  return (
    <div className="flex flex-col gap-2">
      {[...pairs.values()].map((group) => {
        const { from, to } = group[0]!;
        const opened = [...new Map(group.map((l) => [l.passive.id, l.passive])).values()];
        return (
          <details key={`${from}-${to}`} className="rounded-lg border border-frame-line-soft bg-black/15 px-3 py-2">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 pointer-coarse:py-2">
              <span className="font-semibold text-title-on-wood">{team[from]!.name}</span>
              <span className="text-frame-gold" aria-label="mở bị động của">→</span>
              <span className="font-semibold text-title-on-wood">{team[to]!.name}</span>
              <span className="rounded-full bg-jade/20 px-2 text-caption font-bold text-jade">{group.length} liên kết</span>
              <span className="ml-auto flex gap-1" aria-hidden>
                {opened.map((p) => (
                  <PassiveIcon key={p.id} id={p.id} name={passiveName(p)} className="size-6" />
                ))}
              </span>
            </summary>
            <div className="mt-2">
              <LinkList team={team} links={group} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

function LinkList({ team, links }: { team: readonly ComboMember[]; links: readonly ComboLink[] }) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Danh sách liên kết">
      {links.map((l, k) => (
        <li key={k} className="flex items-start gap-2 rounded-lg border border-frame-line-soft bg-black/15 p-2 text-sm">
          <SkillIcon def={l.skill} className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="leading-snug">
              <span className="font-semibold text-title-on-wood">{team[l.from]!.name}</span>, {l.skill.name}
              <span className="mx-1 text-frame-gold" aria-label="mở">→</span>
              <span className="font-semibold text-title-on-wood">{team[l.to]!.name}</span>, {passiveName(l.passive)}
            </p>
            <p className="text-caption text-on-wood-soft">
              {l.signals.map((s) => SIGNAL_NAME[s]).join(", ")}, {passiveText(l.passive)}
            </p>
          </div>
          <PassiveIcon id={l.passive.id} name={passiveName(l.passive)} className="size-9 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Chuỗi phản ứng: kỹ năng mở bị động của một người, bị động đó phát tiếp tín hiệu mở bị động người kế, tối đa 4 bước
 * (luật bộ máy). Chuỗi cùng dây bị động gộp làm một, chiêu mở xếp theo người; chia trang để khung không dài ra khi đội có
 * nhiều chuỗi (Shan 20/11/2026).
 */
const CHAIN_PAGE = 3;

function ChainList({ team, chains }: { team: readonly ComboMember[]; chains: readonly ComboChain[] }) {
  const groups = useMemo(() => groupChains(chains), [chains]);
  const paged = usePagedItems(groups, CHAIN_PAGE);
  return (
    <section aria-labelledby="hk-chains" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 id="hk-chains" className="font-serif text-lg font-bold text-title-on-wood">Chuỗi phản ứng</h3>
        {groups.length > 0 && (
          <span className="text-caption text-on-wood-soft">
            {groups.length} dây, {chains.length} chiêu mở
          </span>
        )}
      </div>
      {groups.length === 0 ? (
        <p className="text-sm text-on-wood-soft">Đội này chưa nối được chuỗi từ ba bước trở lên.</p>
      ) : (
        <>
          <ol {...paged.listProps} className="flex flex-col gap-2">
            {paged.pageItems.map((g) => {
              const total = g.openers.reduce((n, o) => n + o.skills.length, 0);
              return (
                <li key={g.steps.map((s) => `${s.fighter}${s.passive.id}${s.signal}`).join("-")} className="flex flex-col gap-2 rounded-lg border border-frame-line-soft bg-black/15 p-2">
                  <p className="text-caption text-on-wood-soft">
                    <span className="font-semibold text-frame-gold">Chuỗi {g.steps.length + 1} bước</span>, mở từ {total} chiêu
                  </p>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Chiêu mở chuỗi">
                    {g.openers.map((o) => (
                      <ChainOpenerChip key={o.from} who={team[o.from]!.name} skills={o.skills} />
                    ))}
                  </ul>
                  <ol className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-1.5" aria-label="Các bước phản ứng">
                    {g.steps.map((st, i) => (
                      <li key={i} className="flex flex-col gap-0.5">
                        <span className="text-caption leading-tight text-frame-gold">
                          <span aria-hidden>↳ </span>bắt {SIGNAL_NAME[st.signal]}
                        </span>
                        <ChainNode icon={<PassiveIcon id={st.passive.id} name={passiveName(st.passive)} className="size-8" />} who={team[st.fighter]!.name} what={passiveName(st.passive)} />
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ol>
          <PageControls paged={paged} label="Trang chuỗi phản ứng" />
        </>
      )}
    </section>
  );
}

/** Chiêu mở của một người: chồng tối đa ba biểu tượng, tên chiêu đầy đủ ở dòng dưới. */
function ChainOpenerChip({ who, skills }: { who: string; skills: readonly SkillDef[] }) {
  return (
    <li className="flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-frame-line-soft bg-wood-inset px-1.5 py-1">
      <span className="flex shrink-0 -space-x-3">
        {skills.slice(0, 3).map((s) => (
          <SkillIcon key={s.id} def={s} className="size-8 rounded-md ring-1 ring-black/40" />
        ))}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-caption font-semibold text-title-on-wood">
          {who} <span className="font-normal text-on-wood-soft">· {skills.length} chiêu</span>
        </span>
        <span className="text-caption text-on-wood-soft">{skills.map((s) => s.name).join(", ")}</span>
      </span>
    </li>
  );
}

function ChainNode({ icon, who, what }: { icon: React.ReactNode; who: string; what: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-frame-line-soft bg-wood-inset px-1.5 py-1">
      {icon}
      <span className="flex flex-col leading-tight">
        <span className="text-caption font-semibold text-title-on-wood">{what}</span>
        <span className="text-caption text-on-wood-soft">{who}</span>
      </span>
    </span>
  );
}
