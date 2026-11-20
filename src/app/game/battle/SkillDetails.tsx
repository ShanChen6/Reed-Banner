// Bộ kỹ năng của một tướng quân: 6 chủ động và 4 bị động hiện cùng một khuôn thẻ (Shan 19/11/2026): biểu tượng, tên,
// nhãn ngắn (nguồn, ô, năng lượng hoặc tín hiệu kích hoạt), rồi tác dụng. Thẻ chủ động ghi tín hiệu phối hợp nó phát
// thay cho chuỗi "Có thể mở" dài; ghép với đồng đội cụ thể xem ở trang Hợp Kích. Luật chung của phản ứng gom xuống cuối. Số liệu đọc từ @/core.

import {
  CHASE_PASSIVES,
  COMBO_PASSIVES,
  chasePassives,
  skillComboOpeners,
  SKILL_SLOT_UNLOCK,
  type ChasePassiveId,
  type ComboPassiveId,
  type ComboSignalKind,
  type FighterConfig,
  type SkillDef,
} from "@/core";
import { PassiveIcon } from "../art/passives";
import { SkillIcon } from "../art/skills";
import { SKILL_TARGET_NAME, skillSourceName, skillStepTexts } from "./labels";
import { isFusion } from "./special-labels";

/** Tên tín hiệu phối hợp trên giao diện. */
export const SIGNAL_NAME: Readonly<Record<ComboSignalKind, string>> = {
  armorBroken: "Phá giáp",
  controlled: "Khống chế",
  dispelled: "Xua tan",
  skillDamage: "Gây mất máu",
  healed: "Hồi máu",
  shieldAbsorbed: "Khiên đỡ đòn",
  damageTaken: "Bị đánh mất máu",
  shieldBroken: "Vỡ Khiên",
  weakened: "Địch còn ≤50% máu",
  finishing: "Địch còn ≤30% máu",
};

export type PassiveRef = { readonly kind: "combo"; readonly id: ComboPassiveId } | { readonly kind: "chase"; readonly id: ChasePassiveId };

const passiveDef = (p: PassiveRef) => (p.kind === "combo" ? COMBO_PASSIVES[p.id] : CHASE_PASSIVES[p.id]);

/** Ai phát tín hiệu thì bị động này phản ứng: đồng đội, bản thân, hay bất kỳ ai phe mình. */
export function passiveSource(p: PassiveRef): "ally" | "self" | "any" {
  if (p.kind === "combo") return "ally";
  const d = CHASE_PASSIVES[p.id] as { alliesOnly?: boolean; selfSource?: boolean };
  return d.alliesOnly ? "ally" : d.selfSource ? "self" : "any";
}

const SOURCE_NAME = { ally: "đồng đội", self: "bản thân", any: "phe mình" } as const;

/**
 * Loại bị động theo đúng tác dụng, đặt tên một quy tắc cho mọi nghề và hệ (Shan 19/11/2026: bỏ "Nghề 1/2, Hệ 1/2"):
 * bị động Cơ hội để dành cho đòn kế của chính mình; bị động phản ứng gọi theo việc nó làm ngay.
 */
const CHASE_KIND: Readonly<Record<string, string>> = {
  damage: "Truy kích",
  armor: "Giảm Thủ",
  heal: "Hồi máu",
  shield: "Cấp Khiên",
  energy: "Tiếp năng lượng",
  drain: "Rút năng lượng",
  burn: "Thiêu đốt",
  silence: "Câm lặng",
  defUp: "Tăng Thủ",
};
export const passiveKind = (p: PassiveRef): string => (p.kind === "combo" ? "Cơ hội" : (CHASE_KIND[CHASE_PASSIVES[p.id].effect] ?? "Phản ứng"));

function Tag({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <span className={`rounded-full border px-2 py-0.5 text-caption leading-tight whitespace-nowrap ${strong ? "border-current/40 font-semibold" : "border-current/20 opacity-80"}`}>{children}</span>;
}

/** Thẻ một kỹ năng chủ động: tác dụng và các tín hiệu phối hợp chiêu phát ra (bị động nào bắt được xem ở trang Hợp Kích). */
export function ActiveSkillCard({ def, extra, dim = false }: { def: SkillDef; extra?: React.ReactNode; dim?: boolean }) {
  const emits = skillComboOpeners(def);
  return (
    <li className={`flex gap-3 rounded-lg border border-current/15 bg-black/10 p-2.5 ${dim ? "opacity-60" : ""}`}>
      <SkillIcon def={def} className="size-11 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex flex-wrap items-center gap-1.5">
          <span className="font-serif font-bold">{def.name}</span>
          <Tag strong>{skillSourceName(def)}</Tag>
          <Tag>ô {def.slot ?? "—"}</Tag>
          <Tag>{def.cost} năng lượng</Tag>
          <Tag>mở cấp {SKILL_SLOT_UNLOCK[def.slot ?? 0] ?? 1}</Tag>
        </p>
        <p className="leading-snug">
          <span className="font-semibold">{SKILL_TARGET_NAME[def.target]}:</span> {skillStepTexts(def).join(", ")}
        </p>
        {emits.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-caption">
            <span className="opacity-75">Phát tín hiệu:</span>
            {emits.map((k) => (
              <Tag key={k}>{SIGNAL_NAME[k]}</Tag>
            ))}
          </p>
        )}
        {extra}
      </div>
    </li>
  );
}

/** Thẻ một bị động, cùng khuôn với thẻ chủ động: nhãn vị trí, tín hiệu kích hoạt, ai phát tín hiệu, tác dụng. */
export function PassiveCard({ passive }: { passive: PassiveRef }) {
  const d = passiveDef(passive);
  const turnEnd = passive.kind === "chase" && "turnEnd" in CHASE_PASSIVES[passive.id];
  return (
    <li className="flex gap-3 rounded-lg border border-current/15 bg-black/10 p-2.5">
      <PassiveIcon id={passive.id} name={d.name} className="size-11 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex flex-wrap items-center gap-1.5">
          <span className="font-serif font-bold">{d.name}</span>
          <Tag strong>{passiveKind(passive)}</Tag>
          {turnEnd ? (
            <Tag>cuối lượt</Tag>
          ) : (
            <>
              {d.triggers.map((t) => (
                <Tag key={t}>{SIGNAL_NAME[t]}</Tag>
              ))}
              <Tag>từ {SOURCE_NAME[passiveSource(passive)]}</Tag>
            </>
          )}
        </p>
        <p className="leading-snug">{d.description}</p>
      </div>
    </li>
  );
}

/** Bốn bị động của một tướng theo đúng thứ tự trong trận. */
export function fighterPassives(
  fighter: Pick<FighterConfig, "profession" | "element" | "chasePassives" | "special" | "comboPassive">,
  passive?: ComboPassiveId,
): { readonly passive: PassiveRef }[] {
  const reactions = chasePassives(fighter);
  if (isFusion(fighter)) {
    const list: PassiveRef[] = reactions.map((id) => ({ kind: "chase", id }));
    if (fighter.comboPassive) list.push({ kind: "combo", id: fighter.comboPassive });
    return list.map((p) => ({ passive: p }));
  }
  return [
    ...(passive ? [{ passive: { kind: "combo", id: passive } as const }] : []),
    ...reactions.map((id) => ({ passive: { kind: "chase", id } as const })),
  ];
}

/** The prepared opportunity is profession passive1; three automatic reactions complete the loadout. Fusion characters list four fixed passives. */
export default function SkillDetails({
  skills,
  passive,
  fighter,
  paper = false,
  open = false,
  flat = false,
  extra,
}: {
  paper?: boolean;
  skills: readonly SkillDef[];
  passive?: ComboPassiveId;
  fighter?: Pick<FighterConfig, "profession" | "element" | "chasePassives" | "special" | "comboPassive">;
  /** Mở sẵn; sảnh trận để thu gọn. */
  open?: boolean;
  /** Hiện thẳng, không khung thu gọn (thẻ Kỹ năng ở Doanh Trại). */
  flat?: boolean;
  /** Nội dung thêm dưới mỗi thẻ chủ động (cấp kỹ năng và nút nâng ở Doanh Trại); `dim` làm mờ thẻ chưa mở. */
  extra?: (def: SkillDef) => { readonly node: React.ReactNode; readonly dim?: boolean } | null;
}) {
  const fusion = fighter ? isFusion(fighter) : false;
  const passives = fighter ? fighterPassives(fighter, passive) : passive ? [{ passive: { kind: "combo", id: passive } as const }] : [];
  // Luật chi tiết là nội dung đọc dài: ở sảnh dùng giấy dó chữ mực, nơi khác giữ nền hiện có (docs/05-ui-ux/design-system/theme.md).
  const box = paper ? "ui-frame--paper col-span-full w-full rounded-lg border border-frame-bronze p-3 text-sm" : "col-span-full w-full rounded-lg border border-current/15 p-3 text-sm";
  const body = (
    <>
      <h4 className="mt-3 mb-1.5 text-caption font-semibold tracking-[0.12em] uppercase opacity-80">Chủ động</h4>
      <ul className="grid gap-2 xl:grid-cols-2">
        {skills.map((s) => {
          const x = extra?.(s);
          return <ActiveSkillCard key={s.id} def={s} extra={x?.node} dim={x?.dim} />;
        })}
      </ul>
      <h4 className="mt-4 mb-1.5 text-caption font-semibold tracking-[0.12em] uppercase opacity-80">{fusion ? "Nội tại dung hợp" : "Bị động"}</h4>
      <ul className="grid gap-2 xl:grid-cols-2">
        {passives.map((p) => (
          <PassiveCard key={`${p.passive.kind}-${p.passive.id}`} passive={p.passive} />
        ))}
      </ul>
      <div className="mt-3 flex flex-col gap-1 text-caption opacity-75">
        <p>
          Kỹ năng chủ động phát tín hiệu (phá giáp, khống chế, xua tan, hồi máu, gây mất máu, khiên đỡ đòn) khi có tác dụng thực; bị động của đồng đội hoặc bản thân bắt tín hiệu đó để truy kích. Truy kích tự nối trong cùng hành động, không tốn lượt hay năng lượng; mỗi bị động tối đa một lần mỗi hành động, toàn chuỗi tối đa 12 phản ứng, sâu 4. Câm lặng, Đóng băng chặn phản ứng.
        </p>
        {fusion ? (
          <p>Tướng quân dung hợp không nhận bị động nghề mặc định, chỉ bốn nội tại này; nội tại cuối lượt vẫn chạy khi còn sống.</p>
        ) : (
          <p>Bị động Cơ hội không tự tung chiêu: đòn hợp lệ kế tiếp của chính tướng đó mới nhận thưởng; không cộng dồn, hết hạn sau hai lượt thường kế tiếp, lượt thêm không rút thời hạn. Xua tan xóa cơ hội.</p>
        )}
      </div>
    </>
  );
  if (flat) return <div className={box.replace("col-span-full ", "")}>{body}</div>;
  return (
    <details className={box} open={open}>
      <summary className="cursor-pointer font-semibold pointer-coarse:py-3.5">
        Bộ {skills.length} chủ động, {passives.length} {fusion ? "nội tại dung hợp" : "bị động"}
      </summary>
      {body}
    </details>
  );
}
