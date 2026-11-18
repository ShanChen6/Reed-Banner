"use client";

// Phối Hợp (Shan 19/11/2026): ghép ba tướng quân (Đinh Bộ Lĩnh và hai tướng kèm) để xem kỹ năng của người này mở được bị
// động nào của người kia. Lưới chọn tướng xếp theo số liên kết tướng đó thêm vào đội, nên cũng là gợi ý đồng đội.
// Chỉ đọc danh mục kỹ năng, bị động trong @/core (links.ts); không đổi đội hình thật (đổi ở Doanh Trại).

import { useMemo, useState } from "react";
import { CHASE_PASSIVES, COMBO_PASSIVES, MAIN_ID, PLAYABLE_COMPANIONS, withComboPassive, type FighterConfig } from "@/core";
import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { ChoiceChip, buttonVariants } from "@/components/ui";
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
import { comboLinks, comboMember, crossLinksWith, type ComboLink, type ComboMember } from "./links";

const passiveName = (p: PassiveRef) => (p.kind === "combo" ? COMBO_PASSIVES[p.id].name : CHASE_PASSIVES[p.id].name);
const passiveText = (p: PassiveRef) => (p.kind === "combo" ? COMBO_PASSIVES[p.id].description : CHASE_PASSIVES[p.id].description);

export default function CombosScreen() {
  const { profile, loadError } = useProfile();
  const [picks, setPicks] = useState<readonly (string | null)[]>([null, null]);
  const [slot, setSlot] = useState<0 | 1>(0);
  const [ownedOnly, setOwnedOnly] = useState(true);

  const owned = useMemo(() => new Set(profile ? ownedIds(profile) : []), [profile]);
  /** Cấu hình trận của mọi tướng: tướng đã có lấy theo hồ sơ, tướng chưa có lấy cấu hình gốc trong danh sách. */
  const configs = useMemo(() => {
    const map = new Map<string, FighterConfig>();
    if (!profile) return map;
    map.set(MAIN_ID, withComboPassive(fighterOf(profile, MAIN_ID, false)));
    for (const c of PLAYABLE_COMPANIONS) map.set(c.id, withComboPassive(owned.has(c.id) ? fighterOf(profile, c.id, false) : c));
    return map;
  }, [profile, owned]);

  const team: ComboMember[] = useMemo(
    () => [MAIN_ID, ...picks].flatMap((id) => (id && configs.has(id) ? [comboMember(id, configs.get(id)!)] : [])),
    [picks, configs],
  );
  const links = useMemo(() => comboLinks(team), [team]);
  const cross = links.filter((l) => l.from !== l.to);

  // Gợi ý: số liên kết chéo mỗi tướng thêm vào đội hiện có (bỏ người đang ở ô đang chọn).
  const base = useMemo(() => team.filter((m) => m.id !== picks[slot]), [team, picks, slot]);
  const candidates = useMemo(() => {
    if (!profile) return [];
    return PLAYABLE_COMPANIONS.filter((c) => !picks.includes(c.id) || picks[slot] === c.id)
      .map((c) => {
        const cfg = configs.get(c.id)!;
        return { id: c.id, name: c.name, element: cfg.element, profession: cfg.profession, score: crossLinksWith(base, comboMember(c.id, cfg)), owned: owned.has(c.id) };
      })
      .sort((a, b) => b.score - a.score || Number(b.owned) - Number(a.owned) || a.name.localeCompare(b.name, "vi"));
  }, [profile, picks, slot, base, configs, owned]);

  if (!profile)
    return (
      <ModeScreen label="Phối Hợp">
        <p className="py-24 text-center text-on-wood-soft">{loadError ? "Chưa mở được hồ sơ. Xin tải lại trang." : "Đang tải…"}</p>
      </ModeScreen>
    );

  const pick = (id: string) => {
    setPicks((p) => {
      const next = [...p];
      next[slot] = id;
      return next;
    });
    if (slot === 0 && picks[1] === null) setSlot(1);
  };

  return (
    <ModeScreen label="Phối Hợp" card>
      <ModeBanner
        title="Phối Hợp"
        kicker="Kết hợp tướng quân"
        description="Ghép ba tướng để xem chiêu của người này mở bị động nào của người kia. Tướng hợp đội nhất xếp đầu lưới chọn."
        art="/art/home/arena.webp"
        stats={[
          { label: "Liên kết chéo", value: cross.length },
          { label: "Tự phối", value: links.length - cross.length },
        ]}
      />

      <section aria-label="Đội phối hợp" className="grid gap-3 sm:grid-cols-3">
        {[MAIN_ID, picks[0], picks[1]].map((id, i) => {
          const m = id ? team.find((t) => t.id === id) : undefined;
          const active = i > 0 && slot === i - 1;
          const body = m ? (
            <>
              <Portrait id={m.id} element={m.fighter.element} profession={m.fighter.profession} className="size-14 shrink-0" />
              <span className="min-w-0 text-left">
                <span className="block truncate font-serif font-bold text-title-on-wood">{m.name}</span>
                <span className="flex items-center gap-1 text-caption text-on-wood-soft">
                  <ElementIcon element={m.fighter.element} className="size-4" /> {ELEMENT_NAME[m.fighter.element]} · <ProfessionIcon profession={m.fighter.profession} className="size-4" /> {PROFESSION_NAME[m.fighter.profession]}
                </span>
                <span className="block text-caption text-frame-gold">{i === 0 ? "Chủ tướng" : active ? "Đang chọn ô này" : "Bấm để đổi"}</span>
              </span>
            </>
          ) : (
            <span className="w-full text-center text-on-wood-soft">{active ? "Chọn tướng ở lưới bên dưới" : "Ô trống · bấm để chọn"}</span>
          );
          const cls = cn("ui-frame-inset flex min-h-20 items-center gap-3 rounded-xl p-3", active && "ring-2 ring-frame-gold");
          return i === 0 ? (
            <div key="main" className={cls}>{body}</div>
          ) : (
            <button key={i} type="button" aria-pressed={active} aria-label={`Ô đồng đội ${i}${m ? `: ${m.name}` : ""}`} onClick={() => setSlot((i - 1) as 0 | 1)} className={cls}>
              {body}
            </button>
          );
        })}
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Số ở góc thẻ là số liên kết chéo tướng đó thêm vào đội.">Chọn đồng đội {slot + 1}</SectionTitle>
          <HeroGrid
            label="Chọn tướng phối hợp"
            items={candidates}
            selected={picks[slot] ?? null}
            onSelect={pick}
            pageSize={12}
            badge={(id) => {
              const c = candidates.find((x) => x.id === id);
              return c && c.score > 0 ? <span className="rounded-full bg-jade px-1.5 text-caption font-bold text-white">+{c.score}</span> : null;
            }}
            extraFilter={{
              node: (
                <div role="group" aria-label="Phạm vi tướng" className="flex flex-wrap gap-2">
                  <ChoiceChip selected={ownedOnly} onClick={() => setOwnedOnly(true)}>Tướng đã có</ChoiceChip>
                  <ChoiceChip selected={!ownedOnly} onClick={() => setOwnedOnly(false)}>Mọi tướng</ChoiceChip>
                </div>
              ),
              matches: (id) => !ownedOnly || owned.has(id),
            }}
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
              <span className="font-semibold text-title-on-wood">{team[l.from]!.name}</span> · {l.skill.name}
              <span className="mx-1 text-frame-gold" aria-label="mở">→</span>
              <span className="font-semibold text-title-on-wood">{team[l.to]!.name}</span> · {passiveName(l.passive)}
            </p>
            <p className="text-caption text-on-wood-soft">
              {l.signals.map((s) => SIGNAL_NAME[s]).join(", ")} · {passiveText(l.passive)}
            </p>
          </div>
          <PassiveIcon id={l.passive.id} name={passiveName(l.passive)} className="size-9 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
