/** RB-062..075: canonical 30/10/2026 kit, release remains gated in rules.ts. */
import type { SkillDef, SkillStep } from './skills';
const damage = (atk:number, pierce?:number):SkillStep => ({type:'damage',atk,...(pierce===undefined?{}:{pierce})});
const effect = (effect:'defDown'|'atkDown'|'defUp'|'shield'|'burn'|'poison'|'freeze'|'silence',value:number,turns:number|null=2,to:'targets'|'self'|'team'='targets',chance?:number):SkillStep => ({type:'effect',effect,value,turns,to,...(effect==='shield'?{ofMaxHp:true}:{}),...(['burn','poison'].includes(effect)?{ofAtk:true}:{}),...(chance===undefined?{}:{chance})});
const energy = (amount:number,to:'targets'|'self'='targets'):SkillStep => ({type:'energy',amount,to});
export const EXPANSION_ROLE_SKILLS:readonly SkillDef[] = [
 {id:'role_xaThu_dinhDiem',name:'Định Điểm',profession:'xaThu',slot:1,cost:30,target:'enemy',steps:[damage(1.6,0.1)]},
 {id:'role_xaThu_phaGiap',name:'Phá Giáp',profession:'xaThu',slot:3,cost:45,target:'enemy',steps:[damage(1.9,0.25),effect('defDown',0.15)]},
 {id:'role_xaThu_tapKich',name:'Tập Kích',profession:'xaThu',slot:5,cost:60,target:'allEnemies',steps:[damage(0.75),{type:'destroy',area:{random:3}}]},
 {id:'role_satThu_thuaHu',name:'Thừa Hư',profession:'satThu',slot:1,cost:30,target:'enemy',steps:[damage(1.65),{type:'energy',to:'self',amount:5,requiresHpDamage:true}]},
 {id:'role_satThu_doatKhi',name:'Đoạt Khí',profession:'satThu',slot:3,cost:45,target:'enemy',steps:[damage(1.9,0.2),energy(-10)]},
 {id:'role_satThu_truyMenh',name:'Truy Mệnh',profession:'satThu',slot:5,cost:65,target:'enemy',steps:[{type:'damage',atk:2.35,execute:{threshold:0.35,multiplier:1.3}}]},
];
const personal=(id:string,name:string,character:string,cost:number,steps:readonly SkillStep[],target:'enemy'|'allEnemies'='enemy'):SkillDef=>({id,name,character,cost,steps,target,slot:4,ultimate:true,characterKind:'ultimate'});
export const EXPANSION_CHARACTER_SKILLS:readonly SkillDef[] = [
 personal('rb_bnl_thietNoPhaThanh','Thiết Nỏ Phá Thành','bachNoLang',95,[damage(2.7,0.45),effect('defDown',0.2),{type:'destroy',area:{line:4}}]),
 personal('rb_tlx_lucTienTroiDuong','Lục Tiễn Trói Đường','thanhLamXa',90,[damage(1.95),effect('defDown',0.25),{type:'heal',to:'team',ratio:0.06}]),
 personal('rb064_lieuDiepToaGiang','Liễu Diệp Tỏa Giang','lamGiangPhiDiep',95,[damage(2.05),effect('freeze',0,1,'targets',0.35),energy(-15)]),
 personal('rb065_xichLuanLietTran','Xích Luân Liệt Trận','xichDiemLuan',100,[damage(1.15),effect('burn',0.12),{type:'destroy',area:{square:3}}],'allEnemies'),
 personal('rb066_tranSonHoTran','Trấn Sơn Hộ Trận','tranSonThach',95,[damage(1.55),effect('atkDown',0.2),effect('shield',0.1,2,'team')]),
 personal('rb067_loiChamTuocKhi','Lôi Châm Tước Khí','loiMinhXa',100,[damage(2.1),energy(-35),effect('silence',0,1,'targets',0.35)]),
 personal('rb068_phongLangNhieuTran','Phong Lăng Nhiễu Trận','tatPhongLang',95,[damage(0.85),effect('atkDown',0.15),{type:'whirl',turns:2,auto:true}],'allEnemies'),
 personal('rb069_ultimate','Thiết Ấn Đoạt Mệnh','bachPhongDao',95,[damage(2.55,0.35),effect('defDown',0.15)]),
 personal('rb070_ultimate','Độc Ảnh Tiềm Châm','docAnh',90,[damage(1.65),effect('poison',0.12)]),
 personal('rb071_ultimate','Hàn Giang Tàng Nhận','hanGiangKhach',95,[damage(2.1),energy(-20),effect('atkDown',0.15)]),
 personal('rb072_ultimate','Xích Dạ Song Sát','xichDa',100,[damage(1.15),{type:'damage',atk:1.15,execute:{threshold:0.35,multiplier:1.3}}]),
 personal('rb073_ultimate','Địa Phục Liệt Trảo','diaAn',95,[damage(2.05),effect('defDown',0.2),effect('defUp',0.15,2,'self')]),
 personal('rb074_ultimate','Bạo Vũ Lê Hoa','loiAnh',100,[damage(0.75),damage(0.75),damage(0.75),energy(-20)]),
 personal('rb075_ultimate','Vô Thanh Đoạt Phách','voAnh',100,[damage(2.1),energy(-25),effect('silence',0,1,'targets',0.35)]),
];
