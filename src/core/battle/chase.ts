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
    readonly activeOnly?: boolean;
    readonly selfSource?: boolean;
    readonly selfRecipient?: boolean;
    readonly attackerRecipient?: boolean;
    readonly receiverOnly?: boolean;
    readonly shieldTurns?: number | null;
}
function passive(id: string, name: string, triggers: readonly ComboSignalKind[], effect: ChaseEffect, value: number, description: string, alliesOnly = false): ChasePassiveDef {
    return { id, name, triggers, effect, value, description, alliesOnly };
}
export const CHASE_PASSIVES = {
    marksmanPrepared: {...passive('marksmanPrepared', 'Chờ thời phá giáp', ['armorBroken'], 'damage', 0.4, 'Đồng đội phá giáp hữu hiệu: truy kích đúng mục tiêu bằng 40% ATK; tối đa một lần mỗi hành động.', true), activeOnly: true},
    assassinPrepared: {...passive('assassinPrepared', 'Chờ thời khống chế', ['controlled'], 'damage', 0.45, 'Đồng đội khống chế thành công: truy kích đúng mục tiêu bằng 45% ATK; tối đa một lần mỗi hành động.', true), activeOnly: true},
    rb_bnl_passive: {...passive('rb_bnl_passive', 'Nỏ thành bền bỉ', ['armorBroken'], 'armor', 0.08, 'Đồng đội phá giáp: giảm DEF mục tiêu 8% trong 1 lượt; không cộng dồn với giảm DEF mạnh hơn.', true), activeOnly: true},
    rb_tlx_passive: {...passive('rb_tlx_passive', 'Rễ hộ người', ['healed'], 'shield', 0.04, 'Đồng đội hồi HP thực: cấp Khiên bằng 4% HP tối đa người vừa được hồi, tới khi hết; theo Tinh thần người nhận.', true), activeOnly: true, shieldTurns: null},
    rb064_canhGioi: {...passive('rb064_canhGioi', 'Cảnh giới bến sông', ['controlled'], 'energy', 7, 'Đồng đội khống chế thành công: bản thân nhận 7 năng lượng; một lần mỗi hành động.', true), activeOnly: true, selfRecipient: true},
    rb065_hoaCot: {...passive('rb065_hoaCot', 'Hỏa cốt truy kích', ['armorBroken'], 'damage', 0.35, 'Đồng đội phá giáp: truy kích mục tiêu bằng 35% ATK; một lần mỗi hành động.', true), activeOnly: true},
    rb066_kienThu: {...passive('rb066_kienThu', 'Sơn trấn kiên thủ', ['shieldAbsorbed'], 'damage', 0.3, 'Khiên đồng minh đỡ đòn chủ động: phản kích đúng người tấn công bằng 30% ATK; bỏ qua khi không xác định được nguồn.', false), activeOnly: true, attackerRecipient: true},
    rb067_chopThoiCo: {...passive('rb067_chopThoiCo', 'Chớp thời cơ', ['skillDamage'], 'drain', 5, 'Kỹ năng chủ động bản thân gây mất HP thật: trừ mục tiêu 5 năng lượng; một lần mỗi hành động.', false), activeOnly: true, selfSource: true},
    rb068_hoiNhip: {...passive('rb068_hoiNhip', 'Thuận gió hồi nhịp', ['dispelled'], 'energy', 6, 'Đồng đội xua tan buff địch hữu hiệu: bản thân nhận 6 năng lượng; một lần mỗi hành động.', true), activeOnly: true, selfRecipient: true},
    rb069_passive: {...passive('rb069_passive', 'Ấn khuyết quyết tâm', ['armorBroken'], 'damage', 0.25, 'Đồng đội phá giáp: truy kích mục tiêu bằng 25% ATK; một lần mỗi hành động.', true), activeOnly: true},
    rb070_passive: {...passive('rb070_passive', 'Lâm ảnh tiếp nhịp', ['controlled'], 'energy', 6, 'Đồng đội khống chế thành công: bản thân nhận 6 năng lượng; một lần mỗi hành động.', true), activeOnly: true, selfRecipient: true},
    rb071_passive: {...passive('rb071_passive', 'Tĩnh thủy hồi tức', ['controlled'], 'energy', 5, 'Đồng đội khống chế thành công: bản thân nhận 5 năng lượng; một lần mỗi hành động.', true), activeOnly: true, selfRecipient: true},
    rb072_passive: {...passive('rb072_passive', 'Dạ tập thừa hư', ['controlled'], 'damage', 0.3, 'Đồng đội khống chế thành công: truy kích mục tiêu bằng 30% ATK; một lần mỗi hành động.', true), activeOnly: true},
    rb073_passive: {...passive('rb073_passive', 'Phục địa phản kích', ['shieldAbsorbed'], 'damage', 0.3, 'Khiên bản thân đỡ đòn chủ động: phản kích đúng người tấn công bằng 30% ATK; bỏ qua khi không xác định được nguồn.', false), activeOnly: true, attackerRecipient: true, receiverOnly: true},
    rb074_passive: {...passive('rb074_passive', 'Tàn vũ hồi nhịp', ['skillDamage'], 'energy', 4, 'Kỹ năng chủ động bản thân gây mất HP thật: nhận 4 năng lượng; toàn chuỗi nhiều hit chỉ nhận một lần.', false), activeOnly: true, selfSource: true, selfRecipient: true},
    rb075_passive: {...passive('rb075_passive', 'Dư âm tiếp vận', ['dispelled'], 'energy', 6, 'Đồng đội xua tan buff địch hữu hiệu: bản thân nhận 6 năng lượng; một lần mỗi hành động.', true), activeOnly: true, selfRecipient: true},
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
const ROLE_CHASE: Record<Profession, ChasePassiveId> = { xaThu:'marksmanPrepared', satThu:'assassinPrepared', tuongSi: 'martial', phapSu: 'arcane', binhLinh: 'guardian', ySu: 'medic', muuSi: 'strategist', quanSu: 'commander' };
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
