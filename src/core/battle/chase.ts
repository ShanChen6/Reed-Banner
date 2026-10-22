/** Four-passive loadout: one prepared profession opportunity plus three immediate chase reactions. */
import type { Profession } from './rules';
import type { Element } from './elements';
import type { FighterConfig } from './state';
import type { ComboSignalKind } from './combos';
export type ChaseEffect = 'damage' | 'heal' | 'shield' | 'armor' | 'drain' | 'energy';
export interface ChasePassiveDef {
    readonly id: string;
    readonly name: string;
    readonly triggers: readonly ComboSignalKind[];
    readonly effect: ChaseEffect;
    readonly value: number;
    readonly description: string;
    readonly alliesOnly?: boolean;
}
function passive(id: string, name: string, triggers: readonly ComboSignalKind[], effect: ChaseEffect, value: number, description: string, alliesOnly = false): ChasePassiveDef {
    return { id, name, triggers, effect, value, description, alliesOnly };
}
export const CHASE_PASSIVES = {
    martial: passive('martial', 'Liên trảm', ['armorBroken'], 'damage', 0.55, 'Đồng đội phá giáp: truy kích mục tiêu bằng 55% ATK.', true),
    arcane: passive('arcane', 'Chú kích', ['controlled'], 'damage', 0.5, 'Đồng đội khống chế: truy kích mục tiêu bằng 50% ATK.', true),
    guardian: passive('guardian', 'Tiếp phòng', ['healed'], 'shield', 0.06, 'Đồng đội hồi HP thực: cấp Khiên bằng 6% HP tối đa người vừa được hồi.', true),
    medic: passive('medic', 'Cứu viện', ['skillDamage'], 'heal', 0.05, 'Đồng đội gây mất HP bằng kỹ năng: hồi người bị thương nặng nhất 5% HP tối đa.', true),
    strategist: passive('strategist', 'Thừa hư', ['dispelled'], 'drain', 8, 'Đồng đội xua tan: trừ thêm 8 năng lượng mục tiêu.', true),
    commander: passive('commander', 'Tiếp lệnh', ['healed'], 'energy', 8, 'Đồng đội hồi HP thực: cấp người vừa được hồi 8 năng lượng.', true),
    kim1: passive('kim1', 'Kim phá', ['skillDamage'], 'armor', 0.1, 'Kỹ năng gây mất HP: giảm DEF mục tiêu 10% trong 1 lượt.'),
    kim2: passive('kim2', 'Kim truy', ['armorBroken'], 'damage', 0.35, 'Phá giáp thành công: truy kích bằng 35% ATK.'),
    moc1: passive('moc1', 'Mộc sinh', ['skillDamage'], 'heal', 0.04, 'Kỹ năng gây mất HP: hồi người bị thương nặng nhất 4% HP tối đa.'),
    moc2: passive('moc2', 'Mộc hộ', ['healed'], 'shield', 0.04, 'Hồi HP thực: cấp Khiên bằng 4% HP tối đa người được hồi.'),
    thuy1: passive('thuy1', 'Thủy tiếp', ['controlled'], 'heal', 0.05, 'Khống chế thành công: hồi người bị thương nặng nhất 5% HP tối đa.'),
    thuy2: passive('thuy2', 'Thủy dẫn', ['healed'], 'energy', 6, 'Hồi HP thực: cấp người được hồi 6 năng lượng.'),
    hoa1: passive('hoa1', 'Hỏa truy', ['armorBroken'], 'damage', 0.4, 'Phá giáp thành công: truy kích bằng 40% ATK.'),
    hoa2: passive('hoa2', 'Hỏa phá', ['skillDamage'], 'armor', 0.12, 'Kỹ năng gây mất HP: giảm DEF mục tiêu 12% trong 1 lượt.'),
    tho1: passive('tho1', 'Thổ hộ', ['healed'], 'shield', 0.05, 'Hồi HP thực: cấp Khiên bằng 5% HP tối đa người được hồi.'),
    tho2: passive('tho2', 'Thổ chấn', ['shieldAbsorbed'], 'damage', 0.35, 'Khiên đồng đội thực sự đỡ đòn: truy kích một địch bằng 35% ATK.'),
    loi1: passive('loi1', 'Lôi truy', ['controlled'], 'damage', 0.45, 'Khống chế thành công: truy kích bằng 45% ATK.'),
    loi2: passive('loi2', 'Lôi đoạt', ['skillDamage'], 'drain', 6, 'Kỹ năng gây mất HP: trừ mục tiêu 6 năng lượng.'),
    phong1: passive('phong1', 'Phong tiếp', ['dispelled'], 'damage', 0.4, 'Xua tan thành công: truy kích bằng 40% ATK.'),
    phong2: passive('phong2', 'Phong dẫn', ['skillDamage'], 'energy', 5, 'Kỹ năng gây mất HP: cấp người tạo tín hiệu 5 năng lượng.'),
} satisfies Record<string, ChasePassiveDef>;
export type ChasePassiveId = keyof typeof CHASE_PASSIVES;
const ROLE_CHASE: Record<Profession, ChasePassiveId> = { tuongSi: 'martial', phapSu: 'arcane', binhLinh: 'guardian', ySu: 'medic', muuSi: 'strategist', quanSu: 'commander' };
const ELEMENT_CHASE: Record<Element, readonly [
    ChasePassiveId,
    ChasePassiveId
]> = { kim: ['kim1', 'kim2'], moc: ['moc1', 'moc2'], thuy: ['thuy1', 'thuy2'], hoa: ['hoa1', 'hoa2'], tho: ['tho1', 'tho2'], loi: ['loi1', 'loi2'], phong: ['phong1', 'phong2'] };
export function chasePassives(f: Pick<FighterConfig, 'profession' | 'element' | 'chasePassives'>): readonly ChasePassiveId[] {
    return f.chasePassives ?? [ROLE_CHASE[f.profession], ...ELEMENT_CHASE[f.element]];
}
export const CHASE_LIMITS = { maxReactions: 12, maxDepth: 4 } as const;
export interface ChaseEvent {
    readonly type: 'chase';
    readonly side: 0 | 1;
    readonly fighter: number;
    readonly passive: ChasePassiveId;
    readonly source: {
        side: 0 | 1;
        fighter: number;
    };
    readonly target: {
        side: 0 | 1;
        fighter: number;
    };
    readonly action: number;
    readonly depth: number;
}

/** Audit-only boundaries and rejected trigger candidates; never consumed by gameplay. */
export interface ChaseAuditEvent {
 readonly type: 'chaseAudit';
 readonly stage: 'candidate' | 'end' | 'limit';
 readonly reason: string;
 readonly side: 0 | 1;
 readonly fighter: number;
 readonly passive?: ChasePassiveId;
 readonly signal: ComboSignalKind;
 readonly action: number;
 readonly depth: number;
}
