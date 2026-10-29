/**
 * Dữ liệu dựng hình động nhân vật trên sân khấu trận. Tọa độ theo hệ của file PSD gốc (1024×1024); ảnh
 * từng lớp nằm ở public/art/characters/<thư mục>/<lớp>.webp và được thu nhỏ theo `texScale` cho nhẹ.
 * Cách tách lớp và dựng khớp: docs/06-art/ke-hoach-do-hoa.md mục 4.4.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PartBox extends Point {
  readonly w: number;
  readonly h: number;
}

/** Các lớp của bộ xương pháp sư, xếp từ dưới lên trên. */
export const MAGE_PARTS = [
  "backhair",
  "legs",
  "bottom",
  "boots",
  "top",
  "neck",
  "armL",
  "armR",
  "ribbon",
  "waterL",
  "waterR",
  "gourd",
  "head",
  "eyeL",
  "eyeR",
] as const;

export type MagePart = (typeof MAGE_PARTS)[number];

/** Khớp xoay của bộ xương pháp sư. `gourd`: điểm hồ lô lắc trong tay. */
export type MageJoint =
  | "upper"
  | "armL"
  | "armR"
  | "waterL"
  | "waterR"
  | "gourd"
  | "head"
  | "eyeL"
  | "eyeR";

export interface MageRig {
  readonly skeleton: "mage";
  /** Thư mục ảnh dưới /art/characters/. */
  readonly dir: string;
  /** Tỉ lệ ảnh lớp so với tọa độ gốc (0.5: ảnh bằng nửa kích thước PSD). */
  readonly texScale: number;
  /** Điểm giữa hai bàn chân: chỗ đặt nhân vật xuống sân. */
  readonly foot: Point;
  /** Chiều cao nhân vật trong hệ tọa độ gốc, để co về cỡ ô trên sân. */
  readonly height: number;
  readonly parts: Readonly<Record<MagePart, PartBox>>;
  readonly joints: Readonly<Record<MageJoint, Point>>;
  /** Màu hạt và vòng sóng khi thi triển. */
  readonly fxColor: number;
}

/** Gió uốn một lớp vải (lưới): càng xa đầu buộc càng bay nhiều. */
export interface Wind {
  readonly axis: "x" | "y";
  /** Vị trí (0..1) dọc theo trục bắt đầu chịu gió. */
  readonly start: number;
  readonly amp: number;
  readonly freq: number;
  readonly k: number;
  readonly phase: number;
  /** Lượn theo chiều dọc thay vì ngang (dải lụa, áo choàng bay ngang). */
  readonly vertical?: boolean;
  /** Đầu buộc ở cuối trục (bên phải hoặc bên dưới) thay vì đầu trục. */
  readonly reverse?: boolean;
}

/** Lớp cố định của bộ xương tướng sĩ. Kiếm và tay cầm kiếm cùng xoay quanh vai. */
export type WarriorPart = "body" | "armR" | "sword" | "arm" | "head";

export interface WarriorRig {
  readonly skeleton: "warrior";
  /** Nhịp vũ khí riêng; bỏ trống giữ nhát chém của các tướng sĩ cũ. */
  readonly weapon?: "spear" | "fan" | "gourd" | "staff";
  /** Điểm cầm để hồ lô lắc nhẹ trong tay, cùng hệ tọa độ ảnh nguồn. */
  readonly grip?: Point;
  /** Tay áo dài uốn theo gió trong cùng khớp với tay cầm quạt. */
  readonly sleeveWind?: Wind;
  readonly dir: string;
  readonly texScale: number;
  readonly foot: Point;
  readonly height: number;
  readonly parts: Readonly<Record<WarriorPart, PartBox>>;
  /**
   * Lớp vải bay theo gió. `behind`: vẽ sau thân (áo choàng, dải buộc tóc), còn lại vẽ ngay trên thân; `onWeapon`: buộc
   * trên vũ khí (lá cờ lệnh), xoay theo tay cầm và vẽ ngay sau vũ khí.
   */
  readonly cloth: readonly { readonly name: string; readonly box: PartBox; readonly wind: Wind; readonly behind?: boolean; readonly overArms?: boolean; readonly onWeapon?: boolean }[];
  /** Lớp phủ lên tay cầm kiếm (giáp vai, tay áo) để che chỗ nối ở vai. */
  readonly covers: readonly { readonly name: string; readonly box: PartBox }[];
  /** shoulder: vai tay cầm kiếm (cả tay và kiếm xoay quanh đây); elbowR: khuỷu tay không; neck: cổ. */
  readonly joints: Readonly<Record<"shoulder" | "elbowR" | "neck", Point>>;
  /** Chuôi và mũi kiếm lúc đứng yên, để đặt hào quang dọc lưỡi. */
  readonly blade: readonly [Point, Point];
  readonly fxColor: number;
  /** Tâm quả cầu đầu trượng: đốm sáng riêng nhấp nháy theo tay. */
  readonly orb?: Point;
  /**
   * Hiệu ứng lúc đòn trúng vẽ trên cả sân: `lightning` phóng sét tới đối thủ, tuyệt chiêu giáng sét xuống cả đội;
   * `earthWard` và `leafBloom` chỉ ở tuyệt chiêu, dựng khiên mặt trống đồng hoặc nở vòng lá hồi sinh quanh từng đồng đội;
   * `armorPierce` chỉ ở tuyệt chiêu, phóng mũi sáng xuyên giáp tới đối thủ đứng đầu; `supplyDrain` chỉ ở tuyệt
   * chiêu, phủ sương băng lên cả đội đối thủ và hút hạt sáng từ họ về người tung chiêu; `waterPillar` chỉ ở tuyệt
   * chiêu, phun cột nước rồi đóng băng dưới chân từng đối thủ; `flameWall` chỉ ở tuyệt chiêu, dựng tường lửa
   * quanh chính mình và bén lửa lên từng đối thủ; `groundSlam` chỉ ở tuyệt chiêu, nứt đất dưới chân đối thủ đứng
   * đầu và dựng khiên mặt trống trước cả đội mình; `mountainCrush` chỉ ở tuyệt chiêu, nứt đất dưới chân đối thủ đứng
   * đầu và dựng khiên mặt trống đồng trước chính mình; `needleVolley` chỉ ở tuyệt chiêu, bắn tỏa kim bạc tới từng đối thủ;
   * `steelBulwark` chỉ ở tuyệt chiêu, dựng tường thép trước mặt chính mình; `silverGrace` chỉ ở tuyệt chiêu, rải kim
   * bạc và vòng sáng hồi máu quanh từng đồng đội; `coinScatter` chỉ ở tuyệt chiêu, tung tiền vàng khỏi đối thủ đứng
   * đầu kèm ấn câm lặng; `ironFormation` chỉ ở tuyệt chiêu, khiên nứt trên từng đối thủ và mũi tên vàng ở từng đồng
   * đội; `bambooSap` chỉ ở tuyệt chiêu, chém lá trúc lên đối thủ đứng đầu và hút sinh khí về chính mình;
   * `thornBind` chỉ ở tuyệt chiêu, dây gai quấn từng đối thủ và hút sinh khí về chính mình; `rootGuard` chỉ ở tuyệt
   * chiêu, vòng lá hồi phục quanh cả đội và khiên mặt trống trước chính mình; `poisonMist` chỉ ở tuyệt chiêu, sương độc
   * quanh từng đối thủ và vòng lá hồi phục quanh đội mình; `groveWard` chỉ ở tuyệt chiêu, vòng lá và khiên mặt trống quanh
   * từng đồng đội; `frostSpear` chỉ ở tuyệt chiêu, cột nước đóng băng dưới chân đối thủ đứng đầu; `tideBulwark` chỉ ở
   * tuyệt chiêu, khiên mặt trống trước từng đồng đội và cột băng dưới chân từng đối thủ; `springDew` chỉ ở tuyệt chiêu, vòng cam lộ hồi phục quanh từng đồng
   * đội và cột băng dưới chân từng đối thủ; `tideMist` chỉ ở tuyệt chiêu, sương nước quanh từng đối thủ và hạt năng
   * lượng bay về chính mình; `tideSiege` chỉ ở tuyệt chiêu, cột băng dưới chân và vết nứt trên từng đối thủ; `fireRain` chỉ ở
   * tuyệt chiêu, cầu lửa rơi xuống và lửa bén trên từng đối thủ; `flameCleave` chỉ ở tuyệt chiêu, nhát chém lửa và lửa
   * bén trên đối thủ đứng đầu; `emberMend` chỉ ở tuyệt chiêu, vòng than hồng hồi phục và mũi tên vàng quanh
   * từng đồng đội; `granaryBlaze` chỉ ở tuyệt chiêu, khói kho lương và lửa bén quanh từng đối thủ; `fireChain` chỉ ở
   * tuyệt chiêu, tên lửa nảy lần lượt qua từng đối thủ và lửa bén lên họ; `earthSurge` chỉ ở tuyệt chiêu, địa mạch chạy
   * ngầm tới chân từng đối thủ rồi trồi đá nhọn, khiên mặt trống trước từng đồng đội; `tauntRoar` chỉ ở tuyệt chiêu,
   * khiên mặt trống trước từng đồng đội, vòng gai đá quanh chính mình và ấn khiêu khích trên đầu từng đối thủ;
   * `earthMend` chỉ ở tuyệt chiêu, vòng lá thuốc màu đất hồi phục rồi khiên mặt trống quanh từng đồng đội;
   * `roadSever` chỉ ở tuyệt chiêu, địa mạch cắt đường tới chân từng đối thủ và bụi đất cuộn quanh họ; `stoneBastion`
   * chỉ ở tuyệt chiêu, tám cột đá mọc quanh chân, khiên mặt trống và mũi tên vàng ở từng đồng đội; `thunderCleave` chỉ ở
   * tuyệt chiêu, ba nhát chém sét liền vào đối thủ đứng đầu, khiên nứt và đốm năng lượng bật khỏi người họ; `heavenStrike` đánh thường và ra chiêu phóng sét từ quả cầu tới
   * đối thủ đứng đầu, tuyệt chiêu mây giông tụ rồi cột sét lớn giáng xuống người đó, đốm năng lượng bật khỏi thân; `thunderAegis` chỉ ở
   * tuyệt chiêu, vòng sấm tỏa quanh chân và khiên mặt trống trước chính mình, sét chạy tới từng đối thủ kèm ấn khiêu khích
   * trên đầu và đốm năng lượng bật khỏi thân họ; `thunderMend` chỉ ở tuyệt chiêu, chùm kim tím từ tay tới từng đồng đội
   * rồi vòng sáng tím hồi phục quanh họ; `stormSeal` chỉ ở tuyệt chiêu, sét giáng xuống đối thủ đứng đầu, mây giông
   * câm lặng phủ quanh họ và năng lượng bay về chính mình; `thunderRout` chỉ ở tuyệt chiêu, sét giáng lần lượt xuống
   * từng đối thủ và khiên giáp họ nứt vỡ; `galeSlash` chỉ ở tuyệt chiêu, ba lưỡi gió chém qua đối thủ đứng đầu, lốc
   * cuốn quanh chân họ và luồng gió đưa năng lượng tới từng đồng đội; `galeVortex` đánh thường và ra chiêu phóng tia
   * gió từ quả cầu tới đối thủ đứng đầu, tuyệt chiêu gọi lốc cuốn quanh từng đối thủ; `galeBulwark` chỉ ở tuyệt chiêu,
   * lốc gió quanh chính mình, khiên mặt trống trước từng đồng đội và luồng gió đưa năng lượng tới họ; `galeMend` chỉ ở
   * tuyệt chiêu, vòng gió trắng xanh hồi phục quanh từng đồng đội và luồng gió đưa năng lượng tới họ; `galeRift` chỉ ở
   * tuyệt chiêu, lốc cuốn quanh từng đối thủ và năng lượng bay khỏi họ về chính mình; `galeRout` chỉ ở tuyệt chiêu, lốc
   * cuốn và khiên nứt trên từng đối thủ, luồng gió đưa năng lượng tới từng đồng đội; `boltBreach` chỉ ở tuyệt chiêu,
   * tên nỏ xuyên tới đối thủ đứng đầu và khiên giáp họ nứt vỡ; `thicketShot` chỉ ở tuyệt chiêu, mũi tên xuyên tới đối
   * thủ đứng đầu, khiên giáp họ nứt và vòng lá hồi phục quanh từng đồng đội; `willowTide` chỉ ở tuyệt chiêu, phi tiêu
   * lao tới đối thủ đứng đầu và cột nước đông băng dưới chân họ; `flameDisc` chỉ ở tuyệt chiêu, phi luân lửa nảy qua
   * từng đối thủ và lửa bén lên họ; `stoneGuard` chỉ ở tuyệt chiêu, đá lao tới đối thủ đứng đầu, khiên giáp họ nứt và
   * khiên mặt trống trước từng đồng đội; `voltNeedle` chỉ ở tuyệt chiêu, lôi châm lao tới đối thủ đứng đầu, mây giông
   * câm lặng phủ quanh họ và năng lượng bay về chính mình; `silkGale` chỉ ở tuyệt chiêu, lốc cuốn và khiên nứt trên từng
   * đối thủ.
   */
  readonly strikeFx?:
    | "lightning"
    | "earthWard"
    | "leafBloom"
    | "armorPierce"
    | "supplyDrain"
    | "waterPillar"
    | "flameWall"
    | "groundSlam"
    | "mountainCrush"
    | "needleVolley"
    | "steelBulwark"
    | "silverGrace"
    | "coinScatter"
    | "ironFormation"
    | "bambooSap"
    | "thornBind"
    | "rootGuard"
    | "poisonMist"
    | "groveWard"
    | "frostSpear"
    | "tideBulwark"
    | "springDew"
    | "tideMist"
    | "tideSiege"
    | "fireRain"
    | "flameCleave"
    | "emberMend"
    | "granaryBlaze"
    | "fireChain"
    | "earthSurge"
    | "tauntRoar"
    | "earthMend"
    | "roadSever"
    | "stoneBastion"
    | "thunderCleave"
    | "heavenStrike"
    | "thunderAegis"
    | "thunderMend"
    | "stormSeal"
    | "thunderRout"
    | "galeSlash"
    | "galeVortex"
    | "galeBulwark"
    | "galeMend"
    | "galeRift"
    | "galeRout"
    | "boltBreach"
    | "thicketShot"
    | "willowTide"
    | "flameDisc"
    | "stoneGuard"
    | "voltNeedle"
    | "silkGale";
  /** Khiên trên tay không cầm vũ khí: góc (radian) nâng khiên khi vào thế, đỡ đòn, được tăng (ứng với `raise` = 1). */
  readonly shieldRaise?: number;
  readonly poses?: Readonly<Partial<Record<PoseKind, PoseArt>>>;
  /** Tranh bị hạ gục: hết máu thì hình động mờ dần sang tranh này. */
  readonly down?: Omit<PoseArt, "burst">;
}

/**
 * Tranh tư thế vẽ riêng (đánh thường, ra chiêu, tuyệt chiêu): game thay hình động bằng tranh này trong khoảnh khắc ra
 * đòn. Tọa độ theo ảnh gốc của tranh; ảnh xuất ra đã cắt sát và thu nhỏ theo texScale của rig.
 */
export interface PoseArt {
  readonly name: string;
  /** Tranh có thể thu nhỏ hơn các mảnh rig; tọa độ vẫn theo ảnh nguồn. */
  readonly texScale?: number;
  /** Góc trên trái của phần đã cắt trong ảnh gốc. */
  readonly origin: Point;
  /** Điểm trong tranh đặt trùng chân nhân vật đứng (giữa hai bàn chân, mặt đất). */
  readonly anchor: Point;
  /** Phóng ảnh gốc của tranh về cỡ người trong rig (so theo khóa thắt lưng). */
  readonly scale: number;
  /** Chỗ tóe tia sáng lúc trúng đòn. */
  readonly burst: Point;
}

/** `attack`: tranh đánh thường, thay nhát chém của hình động nếu nhân vật có. */
export type PoseKind = "attack" | "cast" | "ultimate";

export type Rig = MageRig | WarriorRig;

/** Lớp ảnh của một bộ xương. */
export function partsOf(rig: Rig): readonly string[] {
  return rig.skeleton === "mage"
    ? MAGE_PARTS
    : [
        "body",
        "armR",
        "sword",
        "arm",
        "head",
        ...rig.cloth.map((c) => c.name),
        ...rig.covers.map((c) => c.name),
        ...Object.values(rig.poses ?? {}).map((p) => p.name),
        ...(rig.down ? [rig.down.name] : []),
      ];
}

/**
 * Đào Lam, pháp sư hệ Thủy (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn) thay bản thử Đ0 tách bằng
 * live2dlayer. Ảnh đứng tách lớp bằng code: trượng cầu nước cùng nắm tay xoay quanh cổ tay, cầu nước sáng riêng; bàn
 * tay buông và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DAO_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dao-lam",
  texScale: 0.5,
  foot: { x: 560, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 63, y: 6, w: 923, h: 1521 },
    armR: { x: 785, y: 640, w: 54, h: 116 },
    sword: { x: 162, y: 346, w: 159, h: 390 },
    arm: { x: 232, y: 545, w: 74, h: 81 },
    head: { x: 490, y: 40, w: 151, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 270, y: 590 },
    elbowR: { x: 800, y: 660 },
    neck: { x: 560, y: 235 },
  },
  blade: [{ x: 255, y: 580 }, { x: 200, y: 385 }],
  orb: { x: 200, y: 385 },
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Hạ trượng chĩa cầu nước tới (đánh thường), giơ trượng xòe tay (ra chiêu), thế tấn đẩy chưởng kéo trượng ngang (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 20, y: 9 },
      anchor: { x: 630, y: 1515 }, scale: 1, burst: { x: 940, y: 605 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 17, y: 9 },
      anchor: { x: 630, y: 1515 }, scale: 1, burst: { x: 845, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 6, y: 61 },
      anchor: { x: 560, y: 1425 }, scale: 1.05, burst: { x: 965, y: 365 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 6, y: 45 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Trần Cương, tướng sĩ hệ Kim. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp bằng code, lưỡi đao
 * tách bằng GrabCut, phần thân sau lưỡi vá theo màu áo; ba tranh ra đòn thay cho nhát chém của hình động.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRAN_CUONG: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-cuong",
  texScale: 0.5,
  foot: { x: 530, y: 1508 },
  height: 1518,
  parts: {
    body: { x: 56, y: 7, w: 912, h: 1518 },
    armR: { x: 716, y: 538, w: 123, h: 288 },
    sword: { x: 57, y: 661, w: 845, h: 628 },
    arm: { x: 122, y: 346, w: 225, h: 484 },
    head: { x: 418, y: 10, w: 210, h: 239 },
  },
  cloth: [
    { name: "ribbon", box: { x: 299, y: 93, w: 147, h: 133 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.7, k: 3.6, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [{ name: "pauldron", box: { x: 223, y: 262, w: 168, h: 103 } }],
  joints: {
    shoulder: { x: 282, y: 358 },
    elbowR: { x: 775, y: 555 },
    neck: { x: 530, y: 240 },
  },
  blade: [{ x: 290, y: 860 }, { x: 905, y: 1288 }],
  fxColor: 0xffd27a,
  // Ba tranh ra đòn: chém ngang thấp (đánh thường), chém vươn (ra chiêu), giơ đao bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 1 / 3, origin: { x: 18, y: 10 },
      anchor: { x: 660, y: 1100 }, scale: 1.06, burst: { x: 1355, y: 1000 } },
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 31, y: 7 },
      anchor: { x: 620, y: 1100 }, scale: 1, burst: { x: 1382, y: 555 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 10, y: 5 },
      anchor: { x: 640, y: 1190 }, scale: 1.1, burst: { x: 1273, y: 482 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 8, y: 40 },
    anchor: { x: 780, y: 940 }, scale: 1 },
};

/**
 * Đinh Bộ Lĩnh, nhân vật chính, bản tướng quân. Ảnh Shan gửi đã có nền trong suốt; tách lớp bằng code như
 * Trần Cương. Áo choàng và dải buộc tóc bay theo gió từ phía vai và búi tóc. Hệ tọa độ: ảnh 1024×1536.
 */
const DINH_BO_LINH: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-bo-linh",
  texScale: 0.5,
  foot: { x: 600, y: 1492 },
  height: 1500,
  parts: {
    body: { x: 17, y: 1, w: 958, h: 1516 },
    armR: { x: 830, y: 524, w: 135, h: 300 },
    sword: { x: 17, y: 586, w: 469, h: 784 },
    arm: { x: 312, y: 495, w: 163, h: 304 },
    head: { x: 545, y: 8, w: 183, h: 260 },
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 298, y: 67, w: 281, h: 256 },
      wind: { axis: "x", start: 0.2, amp: 14, freq: 1.8, k: 4.5, phase: 0.3, vertical: true, reverse: true },
      behind: true,
    },
    {
      name: "cape",
      box: { x: 56, y: 387, w: 340, h: 624 },
      wind: { axis: "x", start: 0.15, amp: 16, freq: 1.2, k: 3.2, phase: 1.4, vertical: true, reverse: true },
      behind: true,
    },
    {
      name: "sash",
      box: { x: 640, y: 610, w: 84, h: 405 },
      wind: { axis: "y", start: 0.15, amp: 5, freq: 1.3, k: 2.6, phase: 2.1 },
    },
  ],
  covers: [{ name: "sleeve", box: { x: 384, y: 380, w: 122, h: 126 } }],
  joints: {
    shoulder: { x: 430, y: 470 },
    elbowR: { x: 855, y: 555 },
    neck: { x: 630, y: 262 },
  },
  blade: [
    { x: 300, y: 815 },
    { x: 30, y: 1360 },
  ],
  fxColor: 0xffc46b,
  // Hai tranh tư thế Shan gửi, nền tách bằng rembg (isnet-anime).
  poses: {
    cast: {
      name: "pose-cast",
      origin: { x: 0, y: 11 },
      anchor: { x: 670, y: 1005 },
      scale: 1.17,
      burst: { x: 1520, y: 240 },
    },
    ultimate: {
      name: "pose-ultimate",
      origin: { x: 0, y: 55 },
      anchor: { x: 735, y: 1530 },
      scale: 1.02,
      burst: { x: 1050, y: 1460 },
    },
  },
  // Nền ô vuông vẽ sẵn tách bằng rembg; cỡ so theo khóa thắt lưng (73 px đứng, 85 px nằm).
  down: {
    name: "pose-down",
    origin: { x: 10, y: 42 },
    anchor: { x: 850, y: 865 },
    scale: 0.86,
  },
};

/** Nguyễn Bặc, tướng sĩ Hỏa. Mảnh vá từ ảnh phẳng; tọa độ ráp 1024×1536. */
const NGUYEN_BAC: WarriorRig = {
  skeleton: "warrior",
  dir: "nguyenBac",
  texScale: 0.5,
  foot: { x: 620, y: 1518 },
  height: 1518,
  parts: {
    body: { x: 235, y: 178, w: 774, h: 1344 },
    head: { x: 488, y: 3, w: 230, h: 280 },
    arm: { x: 259, y: 446, w: 200, h: 358 },
    armR: { x: 821, y: 486, w: 162, h: 342 },
    sword: { x: 18, y: 614, w: 412, h: 740 },
  },
  joints: {
    shoulder: { x: 411, y: 470 },
    elbowR: { x: 850, y: 525 },
    neck: { x: 598, y: 245 },
  },
  cloth: [
    { name: "cape", box: { x: 41, y: 466, w: 316, h: 682 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.2, k: 3.2, phase: 1.4, reverse: true, vertical: true } },
    { name: "ribbon", box: { x: 253, y: 99, w: 264, h: 282 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.8, k: 4.5, phase: 0.3, reverse: true, vertical: true } },
    { name: "sash", box: { x: 604, y: 579, w: 152, h: 576 },
      wind: { axis: "y", start: 0.25, amp: 2, freq: 1.3, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "shoulder", box: { x: 335, y: 264, w: 146, h: 242 } }],
  blade: [{ x: 295, y: 825 }, { x: 20, y: 1350 }],
  fxColor: 0xff783d,
  down: {
    name: "pose-ko", texScale: 1 / 3,
    origin: { x: 9, y: 63 }, anchor: { x: 850, y: 980 },
    scale: 1,
  },
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 13, y: 6 }, anchor: { x: 810, y: 1020 }, scale: 1.25, burst: { x: 1500, y: 245 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 13, y: 10 }, anchor: { x: 650, y: 1006 }, scale: 1.25, burst: { x: 1500, y: 30 } },
  },
};

/** Đinh Điền, binh lính hệ Thổ. Tọa độ giữ nguyên theo ảnh nguồn 1024×1536. */
const DINH_DIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "dinh-dien",
  texScale: 0.5,
  foot: { x: 560, y: 1508 },
  height: 1510,
  parts: {
    body: { x: 206, y: 65, w: 808, h: 1447 },
    armR: { x: 711, y: 439, w: 304, h: 562 },
    sword: { x: 44, y: 3, w: 246, h: 1418 },
    arm: { x: 164, y: 490, w: 198, h: 188 },
    head: { x: 402, y: 65, w: 276, h: 252 }
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 285, y: 181, w: 122, h: 146 },
      wind: { axis: "x", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 0.0, reverse: true, vertical: true },
      behind: true
    },
    {
      name: "sash",
      box: { x: 350, y: 623, w: 188, h: 268 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 0.7 }
    },
    {
      name: "plume",
      box: { x: 587, y: 704, w: 252, h: 330 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.4, k: 2.6, phase: 1.4 },
      overArms: true
    }
  ],
  covers: [
    {
      name: "sleeve",
      box: { x: 258, y: 400, w: 118, h: 158 }
    }
  ],
  joints: {
    shoulder: { x: 331, y: 518 },
    elbowR: { x: 767, y: 489 },
    neck: { x: 529, y: 301 }
  },
  blade: [
    { x: 180, y: 240 },
    { x: 145, y: 4 }
  ],
  fxColor: 0xd9ad65,
  poses: {
    cast: {
      origin: { x: 75, y: 13 },
      scale: 0.95,
      texScale: 1 / 3,
      name: "pose-cast",
      anchor: { x: 615, y: 1005 },
      burst: { x: 1510, y: 244 }
    },
    ultimate: {
      origin: { x: 35, y: 11 },
      scale: 0.95,
      texScale: 1 / 3,
      name: "pose-ultimate",
      anchor: { x: 803, y: 1000 },
      burst: { x: 1380, y: 750 }
    }
  },
  down: {
    origin: { x: 127, y: 5 },
    scale: 0.95,
    texScale: 1 / 3,
    name: "pose-down",
    anchor: { x: 725, y: 1004 }
  }
};

/** Lưu Cơ, mưu sĩ hệ Kim. Dùng khớp vai của rig tướng sĩ với nhịp phẩy quạt riêng. */
const LUU_CO: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  sleeveWind: { axis: "y", start: 0.38, amp: 4, freq: 1.3, k: 2.7, phase: 0.3 },
  dir: "luu-co",
  texScale: 0.5,
  foot: { x: 611, y: 1505 },
  height: 1502,
  parts: {
    body: { x: 76, y: 10, w: 900, h: 1502 },
    armR: { x: 752, y: 423, w: 216, h: 645 },
    sword: { x: 19, y: 275, w: 351, h: 456 },
    arm: { x: 93, y: 373, w: 396, h: 598 },
    head: { x: 468, y: 10, w: 212, h: 244 },
  },
  cloth: [
    { name: "ribbon", box: { x: 259, y: 123, w: 273, h: 160 }, wind: { axis: "x", start: 0.2, amp: 4, freq: 1.5, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "sash", box: { x: 218, y: 696, w: 298, h: 363 }, wind: { axis: "y", start: 0.18, amp: 3, freq: 1.2, k: 2.8, phase: 1.3 } },
    { name: "apron", box: { x: 506, y: 798, w: 74, h: 563 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 347, y: 263, w: 162, h: 152 } }],
  joints: {
    shoulder: { x: 436, y: 392 },
    elbowR: { x: 775, y: 470 },
    neck: { x: 599, y: 243 },
  },
  blade: [{ x: 276, y: 558 }, { x: 140, y: 335 }],
  fxColor: 0xf0cf8a,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 10, y: 30 }, anchor: { x: 620, y: 1513 }, scale: 1, burst: { x: 150, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 8, y: 13 }, anchor: { x: 565, y: 1510 }, scale: 1, burst: { x: 947, y: 80 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 40, y: 37 }, anchor: { x: 850, y: 1007 }, scale: 1 },
};

/** Trịnh Tú, y sư hệ Mộc. Khớp trong ảnh nguồn 1024×1536, hồ lô có điểm cầm riêng. */
const TRINH_TU: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 167, y: 414 },
  dir: "trinh-tu",
  texScale: 0.5,
  foot: { x: 583, y: 1510 },
  height: 1509,
  parts: {
    body: { x: 263, y: 15, w: 691, h: 1509 },
    armR: { x: 795, y: 483, w: 174, h: 347 },
    sword: { x: 60, y: 276, w: 228, h: 394 },
    arm: { x: 124, y: 366, w: 314, h: 177 },
    head: { x: 553, y: 15, w: 177, h: 219 },
  },
  cloth: [
    { name: "ribbon", box: { x: 348, y: 70, w: 207, h: 194 }, wind: { axis: "x", start: 0.18, amp: 4, freq: 1.6, k: 3.0, phase: 0.2, reverse: true, vertical: true }, behind: true },
    { name: "cape", box: { x: 106, y: 740, w: 327, h: 384 }, wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.3 }, behind: true },
    { name: "apron", box: { x: 354, y: 631, w: 263, h: 444 }, wind: { axis: "y", start: 0.2, amp: 2, freq: 1.4, k: 2.6, phase: 2.1 } },
  ],
  covers: [
    { name: "sleeve", box: { x: 331, y: 356, w: 111, h: 92 } },
    { name: "sleeveR", box: { x: 786, y: 488, w: 127, h: 102 } },
  ],
  joints: {
    shoulder: { x: 416, y: 399 },
    elbowR: { x: 849, y: 557 },
    neck: { x: 613, y: 232 },
  },
  blade: [{ x: 167, y: 414 }, { x: 157, y: 285 }],
  fxColor: 0x9bd777,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 43, y: 45 }, anchor: { x: 690, y: 1508 }, scale: 1, burst: { x: 170, y: 165 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 12, y: 57 }, anchor: { x: 680, y: 1508 }, scale: 1, burst: { x: 220, y: 225 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 23, y: 36 }, anchor: { x: 920, y: 1000 }, scale: 1 },
};

/** Lê Hoàn, quân sư hệ Lôi. Cờ lệnh và tay trái dùng nhịp đẩy của giáo; hai tà áo cùng dải buộc tóc bay phía sau. */
const LE_HOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-hoan",
  texScale: 0.5,
  foot: { x: 650, y: 1513 },
  height: 1505,
  parts: {
    body: { x: 10, y: 9, w: 960, h: 1506 },
    armR: { x: 744, y: 370, w: 266, h: 300 },
    sword: { x: 51, y: 8, w: 484, h: 762 },
    arm: { x: 190, y: 340, w: 415, h: 340 },
    head: { x: 552, y: 9, w: 215, h: 226 },
  },
  cloth: [
    {
      name: "ribbon",
      box: { x: 527, y: 83, w: 97, h: 146 },
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.6, k: 3, phase: 0.2, reverse: true, vertical: true },
      behind: true,
    },
    {
      name: "cape",
      box: { x: 9, y: 535, w: 495, h: 704 },
      wind: { axis: "y", start: 0.18, amp: 4, freq: 1.2, k: 2.8, phase: 1.1 },
      behind: true,
    },
    {
      name: "capeR",
      box: { x: 695, y: 432, w: 293, h: 786 },
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.35, k: 2.7, phase: 2 },
      behind: true,
    },
  ],
  covers: [
    { name: "sleeve", box: { x: 409, y: 245, w: 196, h: 175 } },
    { name: "sleeveR", box: { x: 690, y: 225, w: 216, h: 230 } },
  ],
  joints: {
    shoulder: { x: 520, y: 330 },
    elbowR: { x: 820, y: 420 },
    neck: { x: 650, y: 220 },
  },
  blade: [{ x: 235, y: 470 }, { x: 145, y: 12 }],
  fxColor: 0xb98cff,
  poses: {
    cast: {
      name: "pose-cast",
      texScale: 1 / 3,
      origin: { x: 0, y: 0 },
      anchor: { x: 640, y: 1495 },
      scale: 1,
      burst: { x: 55, y: 25 },
    },
    ultimate: {
      name: "pose-ultimate",
      texScale: 1 / 3,
      origin: { x: 0, y: 0 },
      anchor: { x: 620, y: 1505 },
      scale: 1,
      burst: { x: 985, y: 380 },
    },
  },
  down: {
    name: "pose-down",
    texScale: 1 / 3,
    origin: { x: 11, y: 10 },
    anchor: { x: 800, y: 1005 },
    scale: 0.8,
  },
};

/** Đinh Liễn, pháp sư hệ Thủy. Tọa độ theo tranh 1024×1536; nâng pháp trượng nhẹ từ vai. */
const DINH_LIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dinh-lien",
  texScale: 0.5,
  foot: { x: 625, y: 1508 },
  height: 1513,
  parts: {
    body: { x: 251, y: 10, w: 770, h: 1513 },
    armR: { x: 820, y: 518, w: 193, h: 101 },
    sword: { x: 33, y: 91, w: 245, h: 445 },
    arm: { x: 5, y: 314, w: 488, h: 556 },
    head: { x: 546, y: 10, w: 203, h: 217 },
  },
  cloth: [
    { name: "ribbon", box: { x: 272, y: 81, w: 318, h: 204 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 5, freq: 1.6, k: 2.8, phase: 0.3, vertical: true, reverse: true } },
    { name: "cape", box: { x: 10, y: 588, w: 553, h: 669 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.2 } },
    { name: "sash", box: { x: 461, y: 551, w: 196, h: 268 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.35, k: 2.8, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 400, y: 223, w: 138, h: 140 } }],
  joints: {
    shoulder: { x: 465, y: 330 },
    elbowR: { x: 846, y: 550 },
    neck: { x: 645, y: 211 },
  },
  blade: [{ x: 193, y: 369 }, { x: 95, y: 155 }],
  fxColor: 0x9fe3ff,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 0, y: 66 },
      anchor: { x: 555, y: 1465 }, scale: 1, burst: { x: 920, y: 174 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 11, y: 10 },
      anchor: { x: 620, y: 1505 }, scale: 1, burst: { x: 450, y: 75 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 12, y: 12 },
    anchor: { x: 930, y: 945 }, scale: 0.88 },
};

/** Trần Lãm, quân sư hệ Thủy. Cờ lệnh đẩy nhẹ; tọa độ theo tranh 1024×1536. */
const TRAN_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "tran-lam",
  texScale: 0.5,
  foot: { x: 610, y: 1508 },
  height: 1505,
  parts: {
    body: { x: 27, y: 43, w: 980, h: 1472 },
    armR: { x: 817, y: 435, w: 190, h: 222 },
    sword: { x: 15, y: 12, w: 332, h: 1393 },
    arm: { x: 256, y: 502, w: 115, h: 133 },
    head: { x: 457, y: 43, w: 225, h: 305 },
  },
  cloth: [
    { name: "ribbon", box: { x: 321, y: 86, w: 187, h: 182 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.6, k: 2.8, phase: 0.3, vertical: true, reverse: true } },
    { name: "sash", box: { x: 505, y: 575, w: 88, h: 368 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.3, k: 2.6, phase: 1.4 } },
  ],
  covers: [{ name: "sleeve", box: { x: 296, y: 344, w: 148, h: 197 } }],
  joints: {
    shoulder: { x: 365, y: 505 },
    elbowR: { x: 825, y: 545 },
    neck: { x: 554, y: 270 },
  },
  blade: [{ x: 300, y: 550 }, { x: 287, y: 18 }],
  fxColor: 0x7fcaff,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 13, y: 3 },
      anchor: { x: 650, y: 1510 }, scale: 1, burst: { x: 100, y: 50 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 7, y: 18 },
      anchor: { x: 645, y: 1510 }, scale: 1, burst: { x: 960, y: 220 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 36, y: 99 },
    anchor: { x: 955, y: 910 }, scale: 1 },
};

/** Phạm Bạch Hổ, tướng sĩ hệ Hỏa. Tách lớp từ tranh 1024×1536, áo choàng lông hổ bay sau tay đao. */
const PHAM_BACH_HO: WarriorRig = {
  skeleton: "warrior",
  dir: "pham-bach-ho",
  texScale: 0.5,
  foot: { x: 650, y: 1510 },
  height: 1511,
  parts: {
    body: { x: 93, y: 10, w: 929, h: 1511 },
    armR: { x: 819, y: 403, w: 146, h: 222 },
    sword: { x: 3, y: 580, w: 481, h: 757 },
    arm: { x: 272, y: 382, w: 234, h: 385 },
    head: { x: 573, y: 10, w: 206, h: 226 },
  },
  cloth: [
    { name: "ribbon", box: { x: 219, y: 62, w: 433, h: 306 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.6, k: 3, phase: 0.3, vertical: true, reverse: true } },
    { name: "cape", box: { x: 151, y: 312, w: 415, h: 844 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 4, freq: 1.2, k: 2.8, phase: 1.4 } },
    { name: "apron", box: { x: 315, y: 850, w: 321, h: 193 },
      wind: { axis: "y", start: 0.3, amp: 2, freq: 1.35, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 353, y: 301, w: 183, h: 126 } }],
  joints: {
    shoulder: { x: 440, y: 400 },
    elbowR: { x: 905, y: 450 },
    neck: { x: 685, y: 207 },
  },
  blade: [{ x: 315, y: 780 }, { x: 10, y: 1330 }],
  fxColor: 0xff913f,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 29, y: 67 },
      anchor: { x: 710, y: 1006 }, scale: 1.12, burst: { x: 1500, y: 90 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 37, y: 9 },
      anchor: { x: 800, y: 1010 }, scale: 1, burst: { x: 1440, y: 430 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 21, y: 61 },
    anchor: { x: 910, y: 965 }, scale: 1 },
};

/** Ngô Xương Xí, mưu sĩ hệ Kim. Quạt lông và tay áo dùng nhịp phẩy nhẹ, tọa độ tranh 1024×1536. */
const NGO_XUONG_XI: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  sleeveWind: { axis: "y", start: 0.4, amp: 2, freq: 1.3, k: 2.7, phase: 0.4 },
  dir: "ngo-xuong-xi",
  texScale: 0.5,
  foot: { x: 610, y: 1510 },
  height: 1513,
  parts: {
    body: { x: 37, y: 11, w: 977, h: 1513 },
    armR: { x: 813, y: 502, w: 118, h: 117 },
    sword: { x: 15, y: 87, w: 358, h: 450 },
    arm: { x: 140, y: 331, w: 434, h: 503 },
    head: { x: 575, y: 11, w: 190, h: 205 },
  },
  cloth: [
    { name: "ribbon", box: { x: 408, y: 105, w: 211, h: 204 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 4, freq: 1.5, k: 3, phase: 0.3, vertical: true, reverse: true } },
    { name: "train", box: { x: 27, y: 826, w: 327, h: 341 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 3, freq: 1.2, k: 2.8, phase: 1.4 } },
    { name: "sash", box: { x: 563, y: 674, w: 88, h: 190 },
      wind: { axis: "y", start: 0.2, amp: 2, freq: 1.35, k: 2.6, phase: 2.1 } },
  ],
  covers: [{ name: "sleeve", box: { x: 400, y: 280, w: 195, h: 122 } }],
  joints: {
    shoulder: { x: 520, y: 365 },
    elbowR: { x: 881, y: 546 },
    neck: { x: 686, y: 200 },
  },
  blade: [{ x: 324, y: 385 }, { x: 130, y: 160 }],
  fxColor: 0xf1d28c,
  poses: {
    cast: { name: "pose-cast", texScale: 1 / 3, origin: { x: 11, y: 10 },
      anchor: { x: 610, y: 1510 }, scale: 1, burst: { x: 190, y: 230 } },
    ultimate: { name: "pose-ultimate", texScale: 1 / 3, origin: { x: 11, y: 34 },
      anchor: { x: 595, y: 1485 }, scale: 1.02, burst: { x: 965, y: 365 } },
  },
  down: { name: "pose-down", texScale: 1 / 3, origin: { x: 13, y: 13 },
    anchor: { x: 940, y: 985 }, scale: 1 },
};

/**
 * Kiều Công Hãn, sứ quân Phong Châu, pháp sư hệ Lôi. Bộ tranh Shan gửi 24/10: ảnh đứng tách lớp bằng code (trượng
 * cùng bàn tay cầm, bàn tay vươn, đầu, dải khăn), phần thân sau trượng vá bằng inpaint. Tranh đánh thường và tuyệt
 * chiêu có nền ca-rô vẽ sẵn, đã tách nền bằng code. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_CONG_HAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "kieu-cong-han",
  texScale: 0.5,
  foot: { x: 560, y: 1476 },
  height: 1390,
  parts: {
    body: { x: 55, y: 79, w: 959, h: 1409 },
    armR: { x: 812, y: 149, w: 194, h: 230 },
    sword: { x: 104, y: 140, w: 183, h: 661 },
    arm: { x: 196, y: 440, w: 107, h: 155 },
    head: { x: 454, y: 90, w: 174, h: 217 },
  },
  cloth: [
    { name: "ribbon", box: { x: 57, y: 210, w: 279, h: 184 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3.2, phase: 0.5, vertical: true, reverse: true } },
  ],
  covers: [],
  // Tay và trượng xoay quanh cổ tay, chỗ ống tay áo che.
  joints: {
    shoulder: { x: 262, y: 575 },
    elbowR: { x: 840, y: 350 },
    neck: { x: 545, y: 290 },
  },
  blade: [{ x: 240, y: 470 }, { x: 226, y: 199 }],
  orb: { x: 226, y: 199 },
  strikeFx: "lightning",
  fxColor: 0xb98cff,
  // Đẩy trượng phóng sét (đánh thường), thế tấn vung trượng (ra chiêu), giơ trượng qua đầu gọi sét (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 36, y: 10 },
      anchor: { x: 640, y: 1185 }, scale: 1, burst: { x: 1238, y: 368 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 8, y: 9 },
      anchor: { x: 735, y: 1170 }, scale: 1, burst: { x: 62, y: 72 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 16, y: 5 },
      anchor: { x: 490, y: 1505 }, scale: 1.05, burst: { x: 812, y: 62 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 21, y: 67 },
    anchor: { x: 760, y: 960 }, scale: 0.9 },
};

/**
 * Nguyễn Khoan, sứ quân Tam Đái, binh lính hệ Thổ. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp
 * bằng code. Giáo cùng nắm tay xoay quanh cổ tay; khiên mây là lớp tay không, nâng lên khi vào thế và đỡ đòn,
 * phần thân sau khiên vá bằng ảnh đối xứng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_KHOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-khoan",
  texScale: 0.5,
  foot: { x: 560, y: 1480 },
  height: 1375,
  parts: {
    body: { x: 144, y: 110, w: 799, h: 1380 },
    armR: { x: 700, y: 435, w: 290, h: 524 },
    sword: { x: 53, y: 9, w: 100, h: 1489 },
    arm: { x: 82, y: 543, w: 97, h: 112 },
    head: { x: 392, y: 113, w: 187, h: 236 },
  },
  cloth: [
    { name: "ribbon", box: { x: 247, y: 205, w: 154, h: 136 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.5, k: 3, phase: 0.8, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 165, y: 600 },
    elbowR: { x: 722, y: 650 },
    neck: { x: 500, y: 330 },
  },
  blade: [{ x: 128, y: 600 }, { x: 122, y: 12 }],
  shieldRaise: -0.35,
  strikeFx: "earthWard",
  fxColor: 0xa5772f,
  // Đâm giáo sau khiên (đánh thường), giơ giáo qua đầu trấn thủ (tuyệt chiêu); ra chiêu dùng nhịp đẩy giáo.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 4, y: 6 },
      anchor: { x: 640, y: 1145 }, scale: 1, burst: { x: 1300, y: 145 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 18, y: 10 },
      anchor: { x: 650, y: 1185 }, scale: 1, burst: { x: 1290, y: 320 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 0, y: 16 },
    anchor: { x: 640, y: 930 }, scale: 0.9 },
};

/**
 * Kiều Thuận, sứ quân Hồi Hồ, y sư hệ Mộc. Bộ tranh Shan gửi 24/10 (nền đã trong suốt): ảnh đứng tách lớp bằng
 * code. Bàn tay cầm hồ lô xoay quanh cổ tay, hồ lô treo dây lắc quanh nắm tay; bàn tay phải, đầu và dải khăn
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_THUAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 150, y: 205 },
  dir: "kieu-thuan",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 49, y: 0, w: 927, h: 1536 },
    armR: { x: 892, y: 679, w: 116, h: 154 },
    sword: { x: 19, y: 168, w: 182, h: 460 },
    arm: { x: 108, y: 175, w: 163, h: 181 },
    head: { x: 558, y: 12, w: 165, h: 251 },
  },
  cloth: [
    { name: "ribbon", box: { x: 270, y: 101, w: 291, h: 160 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.6, k: 3, phase: 0.6, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 315 },
    elbowR: { x: 910, y: 705 },
    neck: { x: 640, y: 245 },
  },
  blade: [{ x: 150, y: 205 }, { x: 110, y: 470 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Hồ lô buông thấp kết ấn (đánh thường), ôm hồ lô mở tay (ra chiêu), thế tấn rộng vươn tay về đồng minh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 62, y: 10 },
      anchor: { x: 680, y: 1165 }, scale: 1.05, burst: { x: 910, y: 340 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 15, y: 5 },
      anchor: { x: 430, y: 1500 }, scale: 1, burst: { x: 930, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 17, y: 2 },
      anchor: { x: 665, y: 1170 }, scale: 1.05, burst: { x: 620, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 16, y: 75 },
    anchor: { x: 800, y: 930 }, scale: 0.9 },
};

/**
 * Lý Khuê, sứ quân Siêu Loại, tướng sĩ hệ Kim. Bộ tranh Shan gửi 24/10 (nền đã trong suốt, trừ tranh phong thái
 * có nền ca-rô vẽ sẵn đã tách bằng code): ảnh đứng tách lớp bằng code. Cẳng tay và kiếm đồng xoay quanh khuỷu,
 * phần thân sau lưỡi kiếm vá bằng inpaint. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LY_KHUE: WarriorRig = {
  skeleton: "warrior",
  dir: "ly-khue",
  texScale: 0.5,
  foot: { x: 600, y: 1500 },
  height: 1495,
  parts: {
    body: { x: 10, y: 3, w: 1014, h: 1525 },
    armR: { x: 895, y: 557, w: 110, h: 264 },
    sword: { x: 184, y: 634, w: 624, h: 592 },
    arm: { x: 255, y: 506, w: 171, h: 290 },
    head: { x: 610, y: 11, w: 172, h: 252 },
  },
  cloth: [
    { name: "ribbon", box: { x: 148, y: 85, w: 473, h: 326 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 8, freq: 1.5, k: 3.2, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 350, y: 545 },
    elbowR: { x: 930, y: 590 },
    neck: { x: 715, y: 250 },
  },
  blade: [{ x: 380, y: 800 }, { x: 772, y: 1190 }],
  strikeFx: "armorPierce",
  fxColor: 0x9ea4ad,
  // Thế thủ thấp chém chéo (đánh thường), đâm vươn tay (ra chiêu), lao người đâm xuyên giáp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 16, y: 3 },
      anchor: { x: 730, y: 1175 }, scale: 1.05, burst: { x: 1150, y: 1000 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 16, y: 7 },
      anchor: { x: 640, y: 985 }, scale: 1.15, burst: { x: 1505, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 6, y: 13 },
      anchor: { x: 620, y: 960 }, scale: 1.15, burst: { x: 1505, y: 400 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 6, y: 73 },
    anchor: { x: 780, y: 950 }, scale: 0.9 },
};

/**
 * Nguyễn Thủ Tiệp, sứ quân Tiên Du, mưu sĩ hệ Thủy. Bộ tranh Shan gửi 24/10 (ảnh đứng và tranh đánh thường nền
 * trong suốt sẵn; ra chiêu, tuyệt chiêu, tranh gục và tranh phong thái có nền ca-rô vẽ sẵn, đã tách bằng code).
 * Ảnh đứng tách lớp bằng code: bàn tay cầm quạt lông phẩy quanh cổ tay, bàn tay kết ấn, đầu và dải khăn tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_THU_TIEP: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "nguyen-thu-tiep",
  texScale: 0.5,
  foot: { x: 650, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 27, y: 10, w: 982, h: 1510 },
    armR: { x: 768, y: 232, w: 111, h: 147 },
    sword: { x: 11, y: 108, w: 338, h: 583 },
    arm: { x: 252, y: 345, w: 87, h: 88 },
    head: { x: 568, y: 10, w: 160, h: 259 },
  },
  cloth: [
    { name: "ribbon", box: { x: 345, y: 140, w: 226, h: 189 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 0.7, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 318, y: 395 },
    elbowR: { x: 850, y: 360 },
    neck: { x: 660, y: 262 },
  },
  blade: [{ x: 280, y: 370 }, { x: 120, y: 230 }],
  strikeFx: "supplyDrain",
  fxColor: 0x2f7fc1,
  // Vung quạt thế tấn (đánh thường), thu quạt sát người tay kia đánh lạc hướng (ra chiêu), chỉ tay về tuyến lương
  // đối phương, quạt giữ ngang hông (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 2 },
      anchor: { x: 760, y: 1170 }, scale: 1.05, burst: { x: 130, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 11, y: 2 },
      anchor: { x: 530, y: 1170 }, scale: 1.05, burst: { x: 1080, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 11, y: 5 },
      anchor: { x: 600, y: 1170 }, scale: 1.05, burst: { x: 1170, y: 255 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 21 },
    anchor: { x: 800, y: 940 }, scale: 0.9 },
};

/**
 * Lữ Đường, sứ quân Tế Giang, pháp sư hệ Thủy. Bộ tranh Shan gửi 24/10 (nền trong suốt sẵn, trừ tranh tuyệt chiêu
 * và tranh phong thái có nền ca-rô vẽ sẵn, đã tách bằng code). Không có ảnh đứng khổ dọc nên rig tách từ tranh thế
 * tấn 1312×1199: trượng cầu nước cùng nắm tay xoay quanh cổ tay, cầu nước sáng riêng; bàn tay xòe, đầu và dải khăn
 * tách riêng. Hệ tọa độ: ảnh đứng 1312×1199.
 */
const LU_DUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "lu-duong",
  texScale: 0.5,
  foot: { x: 710, y: 1180 },
  height: 1180,
  parts: {
    body: { x: 34, y: 3, w: 1277, h: 1194 },
    armR: { x: 1142, y: 202, w: 137, h: 119 },
    sword: { x: 45, y: 25, w: 441, h: 758 },
    arm: { x: 272, y: 398, w: 81, h: 85 },
    head: { x: 705, y: 19, w: 118, h: 212 },
  },
  cloth: [
    { name: "ribbon", box: { x: 470, y: 45, w: 231, h: 166 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 0.9, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 330, y: 440 },
    elbowR: { x: 1150, y: 265 },
    neck: { x: 760, y: 220 },
  },
  blade: [{ x: 300, y: 440 }, { x: 135, y: 100 }],
  orb: { x: 135, y: 100 },
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Chĩa trượng thẳng tới (đánh thường), dựng trượng đẩy ấn (ra chiêu), vung trượng ngang chỉ thế nước (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 41, y: 33 },
      anchor: { x: 680, y: 1150 }, scale: 1.05, burst: { x: 1240, y: 150 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 8, y: 3 },
      anchor: { x: 650, y: 1165 }, scale: 1, burst: { x: 1166, y: 146 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 95 },
      anchor: { x: 670, y: 1090 }, scale: 1.12, burst: { x: 66, y: 204 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 15, y: 63 },
    anchor: { x: 1000, y: 870 }, scale: 0.85 },
};

/**
 * Nguyễn Siêu, sứ quân Tây Phù Liệt, binh lính hệ Hỏa. Bộ tranh Shan gửi 24/10 (nền trong suốt sẵn, trừ tranh gục
 * và tranh phong thái cạnh cột cờ có nền ca-rô vẽ sẵn, tách bằng code). Ảnh đứng tách lớp như Nguyễn Khoan: giáo
 * có cờ đuôi nheo cùng nắm tay xoay quanh cổ tay, khiên mây là lớp tay không nâng lên khi vào thế và đỡ đòn.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_SIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-sieu",
  texScale: 0.5,
  foot: { x: 530, y: 1490 },
  height: 1340,
  parts: {
    body: { x: 151, y: 172, w: 786, h: 1351 },
    armR: { x: 760, y: 515, w: 253, h: 566 },
    sword: { x: 66, y: 8, w: 242, h: 1480 },
    arm: { x: 184, y: 598, w: 101, h: 119 },
    head: { x: 480, y: 172, w: 195, h: 231 },
  },
  cloth: [
    { name: "ribbon", box: { x: 288, y: 260, w: 209, h: 180 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3, phase: 1.1, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 655 },
    elbowR: { x: 790, y: 640 },
    neck: { x: 560, y: 395 },
  },
  blade: [{ x: 230, y: 650 }, { x: 282, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Đâm giáo sau khiên (đánh thường), thế thủ giơ khiên trấn lũy (tuyệt chiêu); ra chiêu dùng nhịp đẩy giáo.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 17, y: 14 },
      anchor: { x: 680, y: 955 }, scale: 1.1, burst: { x: 1495, y: 110 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 99, y: 2 },
      anchor: { x: 680, y: 1120 }, scale: 1.1, burst: { x: 1120, y: 510 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 87 },
    anchor: { x: 760, y: 900 }, scale: 0.9 },
};

/**
 * Đỗ Cảnh Thạc, sứ quân Đỗ Động (trùm chiến dịch), tướng sĩ hệ Thổ. Bộ tranh Shan gửi 24/10 (ảnh đứng nền trong
 * suốt sẵn; bốn tranh ra đòn, tranh gục và tranh phong thái trên thuyền có nền ca-rô vẽ sẵn, tách bằng code). Ảnh
 * đứng tách lớp bằng code: cẳng tay bọc giáp cùng chùy vuông xoay quanh khuỷu theo nhịp chém, cẳng tay trái, đầu và
 * dải khăn tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DO_CANH_THAC: WarriorRig = {
  skeleton: "warrior",
  dir: "do-canh-thac",
  texScale: 0.5,
  foot: { x: 630, y: 1480 },
  height: 1440,
  parts: {
    body: { x: 11, y: 18, w: 997, h: 1500 },
    armR: { x: 866, y: 598, w: 148, h: 281 },
    sword: { x: 19, y: 351, w: 407, h: 1045 },
    arm: { x: 168, y: 500, w: 211, h: 323 },
    head: { x: 578, y: 48, w: 162, h: 219 },
  },
  cloth: [
    { name: "ribbon", box: { x: 345, y: 79, w: 244, h: 127 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.5, k: 3, phase: 1.3, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 525 },
    elbowR: { x: 890, y: 615 },
    neck: { x: 660, y: 262 },
  },
  blade: [{ x: 240, y: 780 }, { x: 240, y: 1200 }],
  strikeFx: "groundSlam",
  fxColor: 0xa5772f,
  // Quét chùy thấp hai tay (đánh thường), một tay vung chùy ngang (ra chiêu), giơ chùy qua vai bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 22, y: 29 },
      anchor: { x: 650, y: 1150 }, scale: 1.2, burst: { x: 1152, y: 948 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 4, y: 3 },
      anchor: { x: 850, y: 965 }, scale: 1.25, burst: { x: 154, y: 461 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 33, y: 3 },
      anchor: { x: 715, y: 1130 }, scale: 1.2, burst: { x: 219, y: 204 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 11, y: 17 },
    anchor: { x: 850, y: 880 }, scale: 0.9 },
};

/**
 * Chu Ngân, pháp sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 24/10 (ảnh đứng, đánh thường, ra chiêu nền trong
 * suốt sẵn; tuyệt chiêu, tranh gục và tranh phong thái bên voi có nền ca-rô vẽ sẵn, tách bằng code). Tranh đánh
 * thường vẽ quay sang trái nên được lật ngang cho cùng hướng các tranh khác. Ảnh đứng tách lớp: trượng đồng ba chuông
 * cùng nắm tay xoay quanh cổ tay, cầu bạc sáng riêng; bàn tay bắt ấn và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CHU_NGAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "chu-ngan",
  texScale: 0.5,
  foot: { x: 600, y: 1505 },
  height: 1480,
  parts: {
    body: { x: 7, y: 24, w: 1011, h: 1502 },
    armR: { x: 710, y: 343, w: 109, h: 120 },
    sword: { x: 84, y: 6, w: 250, h: 1511 },
    arm: { x: 170, y: 478, w: 86, h: 95 },
    head: { x: 524, y: 24, w: 180, h: 279 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 528 },
    elbowR: { x: 800, y: 440 },
    neck: { x: 625, y: 295 },
  },
  blade: [{ x: 215, y: 520 }, { x: 120, y: 60 }],
  orb: { x: 120, y: 60 },
  strikeFx: "needleVolley",
  fxColor: 0x9ea4ad,
  // Chĩa trượng tới (đánh thường), dựng trượng xòe tay bắt ấn (ra chiêu), hai tay đẩy trượng hướng ống kim (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 11, y: 11 },
      anchor: { x: 540, y: 985 }, scale: 1.25, burst: { x: 1468, y: 85 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 7, y: 9 },
      anchor: { x: 510, y: 1490 }, scale: 1, burst: { x: 930, y: 384 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 67, y: 11 },
      anchor: { x: 730, y: 960 }, scale: 1.25, burst: { x: 1450, y: 77 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 51 },
    anchor: { x: 820, y: 900 }, scale: 0.9 },
};

/**
 * Cao Kiên, binh lính hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (ảnh đứng, ra chiêu, đánh thường nền trong
 * suốt sẵn; tuyệt chiêu và tranh gục có nền ca-rô vẽ sẵn, tách bằng code). Tranh đánh thường vẽ mũi giáo chĩa sang
 * trái nên được lật ngang cho đâm về phía đối thủ. Ảnh đứng tách lớp như Nguyễn Khoan: giáo cùng nắm tay xoay quanh
 * cổ tay, khiên mây nâng lên khi vào thế và đỡ đòn, đầu và dải khăn tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CAO_KIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "cao-kien",
  texScale: 0.5,
  foot: { x: 560, y: 1470 },
  height: 1330,
  parts: {
    body: { x: 63, y: 144, w: 906, h: 1377 },
    armR: { x: 681, y: 538, w: 327, h: 538 },
    sword: { x: 47, y: 9, w: 216, h: 1466 },
    arm: { x: 92, y: 868, w: 108, h: 153 },
    head: { x: 405, y: 144, w: 177, h: 212 },
  },
  cloth: [
    { name: "ribbon", box: { x: 330, y: 227, w: 101, h: 139 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 6, freq: 1.6, k: 3, phase: 0.2, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 145, y: 945 },
    elbowR: { x: 700, y: 700 },
    neck: { x: 535, y: 352 },
  },
  blade: [{ x: 150, y: 940 }, { x: 210, y: 15 }],
  shieldRaise: -0.35,
  strikeFx: "steelBulwark",
  fxColor: 0x9ea4ad,
  // Đâm giáo (đánh thường), giơ khiên thế thủ (ra chiêu), núp sau khiên giáo chĩa thấp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 14, y: 17 },
      anchor: { x: 656, y: 965 }, scale: 1.35, burst: { x: 1485, y: 179 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 177, y: 7 },
      anchor: { x: 805, y: 1075 }, scale: 1.3, burst: { x: 1168, y: 405 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 28, y: 15 },
      anchor: { x: 900, y: 970 }, scale: 1.35, burst: { x: 1271, y: 452 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 25, y: 86 },
    anchor: { x: 820, y: 880 }, scale: 0.9 },
};

/**
 * Châu Ngọc, y sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: bàn tay cầm hồ lô sứ xoay quanh cổ tay, hồ lô lắc nhẹ quanh nắm tay; bàn tay buông và đầu tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CHAU_NGOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 465, y: 560 },
  dir: "chau-ngoc",
  texScale: 0.5,
  foot: { x: 450, y: 1480 },
  height: 1470,
  parts: {
    body: { x: 129, y: 19, w: 678, h: 1496 },
    armR: { x: 783, y: 675, w: 67, h: 116 },
    sword: { x: 431, y: 485, w: 98, h: 141 },
    arm: { x: 372, y: 510, w: 119, h: 81 },
    head: { x: 425, y: 55, w: 176, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 385, y: 545 },
    elbowR: { x: 800, y: 690 },
    neck: { x: 510, y: 250 },
  },
  blade: [{ x: 465, y: 560 }, { x: 480, y: 500 }],
  strikeFx: "silverGrace",
  fxColor: 0x9ea4ad,
  // Gạt tay đỡ, hồ lô giữ bên hông (đánh thường), đưa hồ lô ra trao thuốc (ra chiêu), rút kim châm (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 208, y: 3 },
      anchor: { x: 600, y: 1490 }, scale: 1, burst: { x: 880, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 184, y: 9 },
      anchor: { x: 560, y: 1490 }, scale: 1, burst: { x: 880, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 10 },
      anchor: { x: 600, y: 1480 }, scale: 1, burst: { x: 700, y: 430 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 7, y: 51 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Tô Kim, mưu sĩ hệ Kim (tướng khởi đầu). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * quạt lông đen cùng nắm tay phẩy quanh cổ tay theo nhịp quạt, bàn tay chống hông, đầu và đuôi khăn đen tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TO_KIM: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "to-kim",
  texScale: 0.5,
  foot: { x: 540, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 186, y: 10, w: 709, h: 1514 },
    armR: { x: 645, y: 585, w: 101, h: 126 },
    sword: { x: 94, y: 221, w: 312, h: 390 },
    arm: { x: 255, y: 478, w: 64, h: 98 },
    head: { x: 465, y: 11, w: 160, h: 252 },
  },
  cloth: [
    { name: "ribbon", box: { x: 370, y: 102, w: 121, h: 229 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 5, freq: 1.4, k: 2.8, phase: 0.6 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 540 },
    elbowR: { x: 665, y: 610 },
    neck: { x: 560, y: 255 },
  },
  blade: [{ x: 280, y: 500 }, { x: 180, y: 300 }],
  strikeFx: "coinScatter",
  fxColor: 0x9ea4ad,
  // Phẩy quạt thấp ra sau (đánh thường), chỉ tay quạt kề ngực (ra chiêu), thế tấn rộng chỉ tay quạt giơ cao (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 8, y: 8 },
      anchor: { x: 640, y: 1480 }, scale: 1, burst: { x: 90, y: 620 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 2, y: 8 },
      anchor: { x: 400, y: 1480 }, scale: 1, burst: { x: 1006, y: 300 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 1, y: 8 },
      anchor: { x: 510, y: 1490 }, scale: 1, burst: { x: 1012, y: 270 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 23 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Nghiêm Thiết, quân sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn; tranh ra chiêu gửi trùng
 * tranh đánh thường nên ra chiêu dùng nhịp đẩy cờ của rig). Tranh đánh thường vẽ cờ chĩa sang trái nên được lật ngang.
 * Ảnh đứng tách lớp bằng code: cờ lệnh cùng nắm tay xoay quanh cổ tay theo nhịp giáo như Lê Hoàn, bàn tay cầm thẻ tre
 * và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGHIEM_THIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nghiem-thiet",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1400,
  parts: {
    body: { x: 207, y: 113, w: 798, h: 1409 },
    armR: { x: 745, y: 650, w: 181, h: 225 },
    sword: { x: 25, y: 1, w: 354, h: 1495 },
    arm: { x: 301, y: 568, w: 105, h: 88 },
    head: { x: 521, y: 113, w: 147, h: 223 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 360, y: 610 },
    elbowR: { x: 790, y: 700 },
    neck: { x: 590, y: 330 },
  },
  blade: [{ x: 362, y: 600 }, { x: 362, y: 20 }],
  strikeFx: "ironFormation",
  fxColor: 0x9ea4ad,
  // Chĩa cờ lệnh về phía đối thủ (đánh thường), giơ cao cờ đẩy thẻ tre ra lệnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 0, y: 145 },
      anchor: { x: 308, y: 1450 }, scale: 1, burst: { x: 994, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 26, y: 4 },
      anchor: { x: 450, y: 1480 }, scale: 1, burst: { x: 930, y: 560 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 34, y: 48 },
    anchor: { x: 1000, y: 820 }, scale: 0.85 },
};

/**
 * Lâm Tùng, tướng sĩ hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: cẳng tay xăm tùng cùng kiếm thẳng xoay quanh khuỷu theo nhịp chém, bàn tay trái, đầu và dải khăn xanh tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LAM_TUNG: WarriorRig = {
  skeleton: "warrior",
  dir: "lam-tung",
  texScale: 0.5,
  foot: { x: 590, y: 1500 },
  height: 1500,
  parts: {
    body: { x: 336, y: 0, w: 635, h: 1525 },
    armR: { x: 785, y: 750, w: 100, h: 131 },
    sword: { x: 12, y: 699, w: 389, h: 623 },
    arm: { x: 282, y: 540, w: 114, h: 291 },
    head: { x: 560, y: 36, w: 143, h: 200 },
  },
  cloth: [
    { name: "ribbon", box: { x: 455, y: 23, w: 141, h: 162 }, behind: true,
      wind: { axis: "x", start: 0.15, amp: 7, freq: 1.6, k: 3, phase: 0.3, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 340, y: 560 },
    elbowR: { x: 800, y: 770 },
    neck: { x: 625, y: 230 },
  },
  blade: [{ x: 300, y: 800 }, { x: 20, y: 1300 }],
  strikeFx: "bambooSap",
  fxColor: 0x4f9a4a,
  // Đâm kiếm thẳng (đánh thường), thế tấn chĩa kiếm chéo lên (ra chiêu), giơ kiếm qua đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 5 },
      anchor: { x: 460, y: 985 }, scale: 1.35, burst: { x: 1500, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 161, y: 11 },
      anchor: { x: 780, y: 985 }, scale: 1.35, burst: { x: 1290, y: 20 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 259, y: 12 },
      anchor: { x: 850, y: 985 }, scale: 1.35, burst: { x: 940, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 57, y: 139 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/**
 * Đàm Thảo, pháp sư hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: trượng dây leo cùng nắm tay xoay quanh cổ tay, cầu ngọc
 * xanh sáng riêng; bàn tay phải và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DAM_THAO: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dam-thao",
  texScale: 0.5,
  foot: { x: 520, y: 1500 },
  height: 1450,
  parts: {
    body: { x: 281, y: 67, w: 684, h: 1455 },
    armR: { x: 773, y: 730, w: 58, h: 79 },
    sword: { x: 87, y: 6, w: 232, h: 1476 },
    arm: { x: 192, y: 478, w: 91, h: 88 },
    head: { x: 420, y: 70, w: 201, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 520 },
    elbowR: { x: 790, y: 745 },
    neck: { x: 520, y: 265 },
  },
  blade: [{ x: 215, y: 510 }, { x: 200, y: 90 }],
  orb: { x: 200, y: 90 },
  strikeFx: "thornBind",
  fxColor: 0x4f9a4a,
  // Quét trượng ngang về phía đối thủ (đánh thường), dựng trượng xòe tay (ra chiêu), thế tấn giơ trượng chéo (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 104, y: 10 },
      anchor: { x: 680, y: 985 }, scale: 1.35, burst: { x: 1390, y: 712 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 40, y: 9 },
      anchor: { x: 575, y: 1460 }, scale: 1.05, burst: { x: 805, y: 350 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 7, y: 2 },
      anchor: { x: 700, y: 1160 }, scale: 1.25, burst: { x: 1190, y: 212 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 77 },
    anchor: { x: 820, y: 900 }, scale: 0.85 },
};

/**
 * Hoàng Mộc, binh lính hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Nguyễn Khoan: giáo tre cùng nắm tay xoay quanh cổ tay, khiên mây lá trúc cùng cẳng tay là lớp tay không,
 * nâng lên khi vào thế và đỡ đòn; đầu đội nón lá tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HOANG_MOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "hoang-moc",
  texScale: 0.5,
  foot: { x: 520, y: 1450 },
  height: 1300,
  parts: {
    body: { x: 248, y: 150, w: 586, h: 1334 },
    armR: { x: 685, y: 604, w: 297, h: 462 },
    sword: { x: 174, y: 8, w: 72, h: 1431 },
    arm: { x: 163, y: 506, w: 93, h: 105 },
    head: { x: 362, y: 150, w: 319, h: 251 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 210, y: 560 },
    elbowR: { x: 720, y: 650 },
    neck: { x: 500, y: 390 },
  },
  blade: [{ x: 210, y: 560 }, { x: 205, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "rootGuard",
  fxColor: 0x4f9a4a,
  // Đâm giáo tre (đánh thường), giơ khiên che người (ra chiêu), thụp thấp núp sau khiên giữ thành (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 18, y: 11 },
      anchor: { x: 770, y: 960 }, scale: 1.3, burst: { x: 1500, y: 212 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 78, y: 16 },
      anchor: { x: 600, y: 1440 }, scale: 1.05, burst: { x: 842, y: 637 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 76, y: 12 },
      anchor: { x: 600, y: 1420 }, scale: 1.1, burst: { x: 802, y: 787 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 47, y: 118 },
    anchor: { x: 760, y: 880 }, scale: 0.9 },
};

/**
 * Lục Diệp, y sư hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * bàn tay cầm hồ lô xoay quanh cổ tay, hồ lô đan mây lắc quanh nắm tay như các y sư khác; bàn tay buông và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LUC_DIEP: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 205, y: 400 },
  dir: "luc-diep",
  texScale: 0.5,
  foot: { x: 520, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 275, y: 9, w: 622, h: 1515 },
    armR: { x: 771, y: 685, w: 66, h: 97 },
    sword: { x: 136, y: 298, w: 189, h: 283 },
    arm: { x: 170, y: 365, w: 121, h: 91 },
    head: { x: 417, y: 10, w: 224, h: 231 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 280, y: 420 },
    elbowR: { x: 790, y: 700 },
    neck: { x: 530, y: 230 },
  },
  blade: [{ x: 205, y: 400 }, { x: 200, y: 330 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Đẩy chưởng, hồ lô giữ bên hông (đánh thường), mở nắp hồ lô (ra chiêu), nâng hồ lô trao thuốc cho đồng đội (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 60, y: 20 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 690, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 62, y: 15 },
      anchor: { x: 500, y: 1505 }, scale: 1, burst: { x: 650, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 25, y: 7 },
      anchor: { x: 590, y: 1490 }, scale: 1, burst: { x: 900, y: 450 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 61 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Nhan Trúc, mưu sĩ hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: quạt nan lá trúc cùng nắm tay phẩy theo nhịp quạt, bàn tay buông và đầu tách riêng. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const NHAN_TRUC: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "nhan-truc",
  texScale: 0.5,
  foot: { x: 540, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 255, y: 9, w: 686, h: 1513 },
    armR: { x: 685, y: 695, w: 66, h: 96 },
    sword: { x: 146, y: 192, w: 228, h: 525 },
    arm: { x: 196, y: 400, w: 73, h: 86 },
    head: { x: 451, y: 12, w: 174, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 255, y: 450 },
    elbowR: { x: 700, y: 710 },
    neck: { x: 545, y: 250 },
  },
  blade: [{ x: 230, y: 440 }, { x: 260, y: 260 }],
  strikeFx: "poisonMist",
  fxColor: 0x4f9a4a,
  // Phẩy quạt thấp chống hông (đánh thường), chỉ tay giơ quạt (ra chiêu), đẩy chưởng giơ quạt (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 41, y: 12 },
      anchor: { x: 580, y: 1490 }, scale: 1, burst: { x: 120, y: 820 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 33, y: 12 },
      anchor: { x: 500, y: 1510 }, scale: 1, burst: { x: 990, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 3, y: 12 },
      anchor: { x: 560, y: 1495 }, scale: 1, burst: { x: 975, y: 350 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 10, y: 4 },
    anchor: { x: 800, y: 950 }, scale: 0.85 },
};

/**
 * Sầm Tuệ, quân sư hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * cờ đuôi nheo cán tre cùng nắm tay xoay quanh cổ tay theo nhịp giáo như Lê Hoàn, bàn tay cầm thẻ tre và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const SAM_TUE: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "sam-tue",
  texScale: 0.5,
  foot: { x: 620, y: 1500 },
  height: 1400,
  parts: {
    body: { x: 326, y: 110, w: 657, h: 1407 },
    armR: { x: 745, y: 735, w: 172, h: 161 },
    sword: { x: 21, y: 3, w: 443, h: 1478 },
    arm: { x: 357, y: 460, w: 84, h: 96 },
    head: { x: 490, y: 111, w: 191, h: 235 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 410, y: 510 },
    elbowR: { x: 770, y: 760 },
    neck: { x: 590, y: 340 },
  },
  blade: [{ x: 395, y: 500 }, { x: 362, y: 10 }],
  strikeFx: "groveWard",
  fxColor: 0x4f9a4a,
  // Hạ cờ chĩa ngang (đánh thường), dựng cờ ôm thẻ tre (ra chiêu), thế tấn vung cờ chéo ra lệnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 23, y: 8 },
      anchor: { x: 940, y: 1000 }, scale: 1.3, burst: { x: 50, y: 100 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 10, y: 3 },
      anchor: { x: 680, y: 1505 }, scale: 1, burst: { x: 760, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 42, y: 9 },
      anchor: { x: 860, y: 1115 }, scale: 1.2, burst: { x: 1230, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 67 },
    anchor: { x: 900, y: 900 }, scale: 0.85 },
};

/**
 * Hồ Lãng, tướng sĩ hệ Thủy (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: giáo cùng nắm tay xoay quanh cổ tay theo nhịp đẩy giáo, bàn tay trái, đầu và dải buộc tóc xanh tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ho-lang",
  texScale: 0.5,
  foot: { x: 540, y: 1500 },
  height: 1410,
  parts: {
    body: { x: 282, y: 95, w: 553, h: 1431 },
    armR: { x: 761, y: 755, w: 78, h: 120 },
    sword: { x: 210, y: 4, w: 65, h: 1492 },
    arm: { x: 209, y: 512, w: 102, h: 103 },
    head: { x: 500, y: 100, w: 156, h: 211 },
  },
  cloth: [
    { name: "ribbon", box: { x: 440, y: 155, w: 62, h: 96 }, behind: true,
      wind: { axis: "y", start: 0.2, amp: 5, freq: 1.6, k: 2.8, phase: 0.4 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 560 },
    elbowR: { x: 780, y: 770 },
    neck: { x: 575, y: 300 },
  },
  blade: [{ x: 245, y: 560 }, { x: 256, y: 10 }],
  strikeFx: "frostSpear",
  fxColor: 0x2f7fc1,
  // Đâm giáo ngang tầm ngực (đánh thường), thế tấn hất giáo chéo lên (ra chiêu), tấn rộng kéo giáo ngang hông (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 23, y: 15 },
      anchor: { x: 600, y: 990 }, scale: 1.05, burst: { x: 1515, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 35, y: 30 },
      anchor: { x: 640, y: 960 }, scale: 1.05, burst: { x: 1515, y: 45 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 14, y: 41 },
      anchor: { x: 720, y: 955 }, scale: 1.05, burst: { x: 1525, y: 465 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 125 },
    anchor: { x: 760, y: 880 }, scale: 0.9 },
};

/**
 * Kha Sơn, tướng sĩ hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Đỗ Cảnh Thạc: cẳng tay bọc da cùng rìu đồng khắc hoa văn trống đồng xoay quanh khuỷu theo nhịp chém, cẳng tay
 * buông và đầu tách riêng. Tranh đứng vuốt chuỗi hạt làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KHA_SON: WarriorRig = {
  skeleton: "warrior",
  dir: "kha-son",
  texScale: 0.5,
  foot: { x: 620, y: 1500 },
  height: 1495,
  parts: {
    body: { x: 269, y: 2, w: 746, h: 1506 },
    armR: { x: 849, y: 563, w: 159, h: 304 },
    sword: { x: 11, y: 588, w: 392, h: 733 },
    arm: { x: 228, y: 540, w: 175, h: 296 },
    head: { x: 538, y: 2, w: 187, h: 257 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 552 },
    elbowR: { x: 895, y: 612 },
    neck: { x: 640, y: 240 },
  },
  blade: [{ x: 300, y: 775 }, { x: 90, y: 1180 }],
  strikeFx: "mountainCrush",
  fxColor: 0xc8963c,
  // Bước tới kéo rìu (đánh thường), hai tay ghì cán rìu thủ thế (ra chiêu), vung rìu qua vai chuẩn bị bổ (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 11, y: 76 },
      anchor: { x: 613, y: 1466 }, scale: 1, burst: { x: 110, y: 1150 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 24, y: 7 },
      anchor: { x: 414, y: 1515 }, scale: 1, burst: { x: 900, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 20, y: 31 },
      anchor: { x: 407, y: 1460 }, scale: 1, burst: { x: 885, y: 165 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 10, y: 6 },
    anchor: { x: 720, y: 900 }, scale: 0.85 },
};

/**
 * Thái Hà, binh lính hệ Thủy (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Nguyễn Khoan: chĩa ba cùng nắm tay xoay quanh cổ tay, khiên mây cùng cẳng tay nâng lên khi vào thế và đỡ
 * đòn, đầu và đuôi khăn xanh tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const THAI_HA: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "thai-ha",
  texScale: 0.5,
  foot: { x: 540, y: 1490 },
  height: 1360,
  parts: {
    body: { x: 197, y: 140, w: 683, h: 1381 },
    armR: { x: 739, y: 537, w: 245, h: 464 },
    sword: { x: 126, y: 6, w: 95, h: 1462 },
    arm: { x: 138, y: 471, w: 91, h: 115 },
    head: { x: 471, y: 140, w: 171, h: 196 },
  },
  cloth: [
    { name: "ribbon", box: { x: 375, y: 263, w: 80, h: 77 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 5, freq: 1.6, k: 3, phase: 0.2, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 200, y: 525 },
    elbowR: { x: 765, y: 600 },
    neck: { x: 560, y: 330 },
  },
  blade: [{ x: 175, y: 520 }, { x: 175, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "tideBulwark",
  fxColor: 0x2f7fc1,
  // Đâm chĩa ba ngang (đánh thường), giơ khiên che người (ra chiêu), lao tới núp khiên đâm chéo (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 17 },
      anchor: { x: 600, y: 1000 }, scale: 1.1, burst: { x: 1515, y: 270 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 35, y: 6 },
      anchor: { x: 560, y: 1510 }, scale: 0.9, burst: { x: 830, y: 650 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 42, y: 8 },
      anchor: { x: 700, y: 1010 }, scale: 1.1, burst: { x: 1470, y: 70 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 13, y: 64 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/**
 * Mai Thanh, y sư hệ Thủy (tướng khởi đầu). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code:
 * bàn tay xách hồ lô sứ xoay quanh cổ tay, hồ lô lắc quanh nắm tay như các y sư khác; bàn tay buông và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const MAI_THANH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 265, y: 530 },
  dir: "mai-thanh",
  texScale: 0.5,
  foot: { x: 590, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 291, y: 10, w: 566, h: 1507 },
    armR: { x: 714, y: 685, w: 57, h: 84 },
    sword: { x: 204, y: 520, w: 162, h: 341 },
    arm: { x: 215, y: 485, w: 110, h: 68 },
    head: { x: 470, y: 25, w: 152, h: 238 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 520 },
    elbowR: { x: 735, y: 705 },
    neck: { x: 545, y: 255 },
  },
  blade: [{ x: 265, y: 530 }, { x: 270, y: 700 }],
  strikeFx: "springDew",
  fxColor: 0x2f7fc1,
  // Đẩy chưởng, hồ lô xách bên hông (đánh thường), ôm hồ lô mở nắp (ra chiêu), nâng hồ lô rót cam lộ (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 153, y: 11 },
      anchor: { x: 600, y: 1500 }, scale: 1, burst: { x: 830, y: 265 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 129, y: 12 },
      anchor: { x: 575, y: 1505 }, scale: 1, burst: { x: 360, y: 265 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 46, y: 11 },
      anchor: { x: 540, y: 1505 }, scale: 1, burst: { x: 215, y: 285 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 41, y: 50 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Quách Ẩn, mưu sĩ hệ Thủy (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: quạt giấy sóng nước cùng nắm tay phẩy theo nhịp quạt, bàn tay buông và đầu tách riêng. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const QUACH_AN: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "quach-an",
  texScale: 0.5,
  foot: { x: 525, y: 1515 },
  height: 1510,
  parts: {
    body: { x: 225, y: 5, w: 688, h: 1522 },
    armR: { x: 732, y: 638, w: 68, h: 157 },
    sword: { x: 100, y: 487, w: 198, h: 317 },
    arm: { x: 280, y: 565, w: 68, h: 97 },
    head: { x: 482, y: 5, w: 181, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 590 },
    elbowR: { x: 760, y: 650 },
    neck: { x: 575, y: 235 },
  },
  blade: [{ x: 290, y: 620 }, { x: 130, y: 560 }],
  strikeFx: "tideMist",
  fxColor: 0x2f7fc1,
  // Phẩy quạt thấp bên hông (đánh thường), che quạt chỉ tay (ra chiêu), che quạt xòe chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 41, y: 10 },
      anchor: { x: 525, y: 1515 }, scale: 1, burst: { x: 110, y: 640 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 37, y: 6 },
      anchor: { x: 470, y: 1515 }, scale: 1, burst: { x: 1005, y: 340 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 46, y: 6 },
      anchor: { x: 430, y: 1510 }, scale: 1, burst: { x: 955, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 29, y: 46 },
    anchor: { x: 760, y: 960 }, scale: 0.85 },
};

/**
 * Vi Triều, quân sư hệ Thủy (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Tranh đánh thường vẽ cờ
 * chĩa sang trái nên được lật ngang như Nghiêm Thiết. Ảnh đứng tách lớp bằng code: cờ lệnh sóng nước cùng nắm tay
 * xoay quanh cổ tay theo nhịp giáo, bàn tay cầm thẻ tre và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const VI_TRIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "vi-trieu",
  texScale: 0.5,
  foot: { x: 620, y: 1505 },
  height: 1330,
  parts: {
    body: { x: 283, y: 192, w: 708, h: 1328 },
    armR: { x: 778, y: 794, w: 165, h: 194 },
    sword: { x: 5, y: 4, w: 425, h: 1513 },
    arm: { x: 350, y: 546, w: 70, h: 82 },
    head: { x: 531, y: 192, w: 156, h: 247 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 405, y: 605 },
    elbowR: { x: 850, y: 805 },
    neck: { x: 610, y: 400 },
  },
  blade: [{ x: 385, y: 590 }, { x: 378, y: 20 }],
  strikeFx: "tideSiege",
  fxColor: 0x2f7fc1,
  // Chĩa cờ lệnh về phía đối thủ (đánh thường), ôm thẻ tre trước ngực (ra chiêu), quét cờ thấp giơ thẻ tre ra lệnh
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 39, y: 9 },
      anchor: { x: 515, y: 1005 }, scale: 1, burst: { x: 1500, y: 155 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 8, y: 5 },
      anchor: { x: 610, y: 1510 }, scale: 1, burst: { x: 720, y: 620 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 43, y: 8 },
      anchor: { x: 640, y: 1000 }, scale: 0.95, burst: { x: 1180, y: 230 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 37, y: 61 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/**
 * Hà Vân, pháp sư hệ Hỏa (tướng khởi đầu). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Đào Lam: trượng cầu lửa cùng nắm tay xoay quanh cổ tay, cầu lửa sáng riêng; bàn tay buông và đầu tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HA_VAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "ha-van",
  texScale: 0.5,
  foot: { x: 520, y: 1515 },
  height: 1500,
  parts: {
    body: { x: 157, y: 1, w: 797, h: 1528 },
    armR: { x: 746, y: 628, w: 69, h: 168 },
    sword: { x: 100, y: 389, w: 142, h: 333 },
    arm: { x: 168, y: 570, w: 101, h: 65 },
    head: { x: 428, y: 10, w: 195, h: 227 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 600 },
    elbowR: { x: 775, y: 645 },
    neck: { x: 530, y: 220 },
  },
  blade: [{ x: 205, y: 600 }, { x: 160, y: 455 }],
  orb: { x: 160, y: 455 },
  strikeFx: "fireRain",
  fxColor: 0xd9502a,
  // Chĩa trượng cầu lửa tới (đánh thường), hạ trượng xòe tay (ra chiêu), giơ cao trượng chỉ tay gọi mưa lửa (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 30, y: 0 },
      anchor: { x: 630, y: 1510 }, scale: 1, burst: { x: 170, y: 270 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 18, y: 3 },
      anchor: { x: 640, y: 1510 }, scale: 1, burst: { x: 750, y: 320 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 12, y: 7 },
      anchor: { x: 460, y: 1505 }, scale: 1, burst: { x: 1010, y: 350 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 7, y: 6 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Tôn Diệm, quân sư hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Vi Triều: cán cờ lệnh cùng nắm tay xoay quanh cổ tay theo nhịp giáo, lá cờ tách riêng bay theo gió trên cán; bàn
 * tay cầm bó thẻ tre và đầu tách riêng. Tranh gác chân lên khối gỗ làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TON_DIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ton-diem",
  texScale: 0.5,
  foot: { x: 620, y: 1515 },
  height: 1400,
  parts: {
    body: { x: 294, y: 130, w: 643, h: 1399 },
    armR: { x: 722, y: 687, w: 155, h: 197 },
    sword: { x: 289, y: 6, w: 38, h: 1469 },
    arm: { x: 275, y: 480, w: 64, h: 93 },
    head: { x: 451, y: 130, w: 194, h: 211 },
  },
  cloth: [
    { name: "flag", box: { x: 14, y: 45, w: 280, h: 477 }, onWeapon: true,
      wind: { axis: "x", start: 0.1, amp: 14, freq: 1.6, k: 4, phase: 0.3, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 308, y: 518 },
    elbowR: { x: 765, y: 768 },
    neck: { x: 560, y: 330 },
  },
  blade: [{ x: 308, y: 470 }, { x: 308, y: 20 }],
  strikeFx: "fireChain",
  fxColor: 0xe0602a,
  // Chĩa cán cờ ngang đâm tới (đánh thường), giơ bó thẻ tre truyền lệnh (ra chiêu), giơ cao cờ chỉ huy phát hỏa công
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 35, y: 12 },
      anchor: { x: 1060, y: 1000 }, scale: 1.4, burst: { x: 1495, y: 505 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 19, y: 7 },
      anchor: { x: 650, y: 1500 }, scale: 1, burst: { x: 833, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 23, y: 4 },
      anchor: { x: 600, y: 1505 }, scale: 1.1, burst: { x: 395, y: 40 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 54, y: 12 },
    anchor: { x: 850, y: 900 }, scale: 0.85 },
};

/**
 * Lý Liệt, tướng sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Hồ Lãng: đại đao (cả dải vải đỏ buộc cán) cùng nắm tay xoay quanh cổ tay theo nhịp giáo, bàn tay phải và đầu
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LY_LIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ly-liet",
  texScale: 0.5,
  foot: { x: 610, y: 1510 },
  height: 1410,
  parts: {
    body: { x: 300, y: 102, w: 550, h: 1414 },
    armR: { x: 713, y: 778, w: 84, h: 104 },
    sword: { x: 203, y: 8, w: 127, h: 1456 },
    arm: { x: 217, y: 543, w: 86, h: 108 },
    head: { x: 373, y: 102, w: 260, h: 248 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 295, y: 600 },
    elbowR: { x: 755, y: 795 },
    neck: { x: 540, y: 330 },
  },
  blade: [{ x: 250, y: 600 }, { x: 270, y: 20 }],
  strikeFx: "flameCleave",
  fxColor: 0xd9502a,
  // Tấn rộng đâm đại đao ngang (đánh thường), hất đao chéo lên (ra chiêu), hai tay ghì đao chém chéo (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 26, y: 5 },
      anchor: { x: 710, y: 1000 }, scale: 1.03, burst: { x: 1510, y: 410 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 16, y: 14 },
      anchor: { x: 770, y: 1005 }, scale: 0.9, burst: { x: 1505, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 54, y: 25 },
      anchor: { x: 750, y: 990 }, scale: 1, burst: { x: 1500, y: 60 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 12, y: 34 },
    anchor: { x: 760, y: 880 }, scale: 0.9 },
};

/**
 * Trương Viêm, binh lính hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Thái Hà: kích cùng nắm tay xoay quanh cổ tay, khiên mây cùng bàn tay nâng lên khi vào thế và đỡ đòn, đầu
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRUONG_VIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "truong-viem",
  texScale: 0.5,
  foot: { x: 550, y: 1500 },
  height: 1340,
  parts: {
    body: { x: 175, y: 167, w: 653, h: 1336 },
    armR: { x: 705, y: 562, w: 282, h: 520 },
    sword: { x: 123, y: 3, w: 134, h: 1423 },
    arm: { x: 197, y: 513, w: 96, h: 96 },
    head: { x: 373, y: 167, w: 211, h: 191 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 600 },
    elbowR: { x: 760, y: 640 },
    neck: { x: 515, y: 340 },
  },
  blade: [{ x: 240, y: 560 }, { x: 235, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Đâm kích ngang núp khiên (đánh thường), tấn rộng đẩy khiên ra (ra chiêu), hạ thấp người ghì khiên che thân (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 21, y: 11 },
      anchor: { x: 535, y: 995 }, scale: 1.1, burst: { x: 1525, y: 215 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 299, y: 2 },
      anchor: { x: 800, y: 1000 }, scale: 1.1, burst: { x: 1130, y: 350 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 347, y: 4 },
      anchor: { x: 875, y: 995 }, scale: 1.1, burst: { x: 1030, y: 560 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 19, y: 99 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/**
 * Hồng Đan, y sư hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 26/10 (nền trong suốt sẵn), tranh tuyệt chiêu gửi bổ sung
 * sau. Ảnh đứng tách lớp bằng code như Mai Thanh: bàn tay xách hồ lô xoay quanh cổ tay, hồ lô lắc quanh nắm tay; bàn tay
 * buông và đầu tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HONG_DAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 290, y: 690 },
  dir: "hong-dan",
  texScale: 0.5,
  foot: { x: 560, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 284, y: 10, w: 541, h: 1510 },
    armR: { x: 735, y: 697, w: 54, h: 92 },
    sword: { x: 199, y: 642, w: 164, h: 257 },
    arm: { x: 252, y: 662, w: 76, h: 84 },
    head: { x: 390, y: 10, w: 217, h: 194 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 680 },
    elbowR: { x: 758, y: 712 },
    neck: { x: 520, y: 195 },
  },
  blade: [{ x: 290, y: 690 }, { x: 270, y: 850 }],
  strikeFx: "emberMend",
  fxColor: 0xd9502a,
  // Phẩy tay rắc thuốc, hồ lô xách thấp (đánh thường), ôm hồ lô mở nút (ra chiêu), hai tay nâng hồ lô trao thuốc cho cả
  // đội (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 145, y: 12 },
      anchor: { x: 590, y: 1510 }, scale: 1, burst: { x: 430, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 137, y: 15 },
      anchor: { x: 585, y: 1515 }, scale: 1, burst: { x: 680, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 43, y: 11 },
      anchor: { x: 535, y: 1510 }, scale: 1, burst: { x: 850, y: 350 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 39, y: 38 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Ninh Hỏa, mưu sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Quách Ẩn: quạt lá cháy mép cùng nắm tay phẩy theo nhịp quạt, bàn tay buông và đầu tách riêng. Tranh ngồi thử
 * hộp mồi lửa làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NINH_HOA: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "ninh-hoa",
  texScale: 0.5,
  foot: { x: 600, y: 1515 },
  height: 1510,
  parts: {
    body: { x: 266, y: 6, w: 657, h: 1522 },
    armR: { x: 769, y: 662, w: 67, h: 142 },
    sword: { x: 16, y: 310, w: 254, h: 297 },
    arm: { x: 187, y: 497, w: 104, h: 78 },
    head: { x: 484, y: 6, w: 186, h: 228 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 280, y: 545 },
    elbowR: { x: 800, y: 675 },
    neck: { x: 590, y: 215 },
  },
  blade: [{ x: 240, y: 590 }, { x: 120, y: 350 }],
  strikeFx: "granaryBlaze",
  fxColor: 0xe0602a,
  // Phẩy quạt (đánh thường), quạt hạ thấp tay chỉ đường (ra chiêu), giơ quạt chỉ lối sai dẫn địch vào kho lửa (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 12, y: 6 },
      anchor: { x: 640, y: 1505 }, scale: 1, burst: { x: 115, y: 640 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 7, y: 8 },
      anchor: { x: 580, y: 1500 }, scale: 1, burst: { x: 1010, y: 250 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 90, y: 8 },
      anchor: { x: 550, y: 1515 }, scale: 1, burst: { x: 1005, y: 246 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 46, y: 148 },
    anchor: { x: 780, y: 900 }, scale: 0.85 },
};

/**
 * Doãn Nham, pháp sư hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn, khổ 1374×1145, ảnh đứng
 * phóng ×1.32 vào khung 1024×1536). Ảnh đứng tách lớp bằng code như Đàm Thảo: trượng đầu đá cùng nắm tay xoay quanh cổ
 * tay, viên hổ phách trên đầu trượng sáng riêng; bàn tay buông và đầu tách riêng. Tranh ngồi xổm chống trượng làm tranh
 * phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DOAN_NHAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "doan-nham",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1485,
  parts: {
    body: { x: 108, y: 24, w: 902, h: 1484 },
    armR: { x: 822, y: 768, w: 99, h: 144 },
    sword: { x: 12, y: 12, w: 173, h: 1483 },
    arm: { x: 30, y: 495, w: 120, h: 127 },
    head: { x: 400, y: 20, w: 252, h: 270 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 140, y: 560 },
    elbowR: { x: 860, y: 785 },
    neck: { x: 545, y: 265 },
  },
  blade: [{ x: 85, y: 560 }, { x: 100, y: 130 }],
  orb: { x: 100, y: 130 },
  strikeFx: "earthSurge",
  fxColor: 0xd8902e,
  // Đâm trượng ngang về phía đối thủ (đánh thường), chống trượng xòe tay trấn (ra chiêu), tấn thấp nện đầu trượng xuống
  // đất (tuyệt chiêu). Tranh nguồn cùng tỉ lệ ảnh đứng gốc nên phóng ×1.32.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 63, y: 12 },
      anchor: { x: 635, y: 1130 }, scale: 1.32, burst: { x: 1245, y: 420 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 325, y: 4 },
      anchor: { x: 735, y: 1125 }, scale: 1.32, burst: { x: 1030, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 101, y: 9 },
      anchor: { x: 620, y: 1070 }, scale: 1.32, burst: { x: 1200, y: 980 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 47, y: 20 },
    anchor: { x: 800, y: 880 }, scale: 1.12 },
};

/**
 * Lê Thạch, binh lính hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Hoàng Mộc: giáo cùng nắm tay xoay quanh cổ tay, khiên mây núm đồng cùng cẳng tay là lớp tay không, nâng lên khi vào
 * thế và đỡ đòn; đầu đội nón lá và dải thắt lưng đỏ tách riêng. Chỗ cán giáo đè lên cẳng tay được vá màu hai bên. Tranh
 * gác chân lên gốc cây làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LE_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-thach",
  texScale: 0.5,
  foot: { x: 570, y: 1500 },
  height: 1400,
  parts: {
    body: { x: 176, y: 105, w: 666, h: 1419 },
    armR: { x: 677, y: 501, w: 253, h: 442 },
    sword: { x: 186, y: 3, w: 68, h: 1433 },
    arm: { x: 179, y: 437, w: 75, h: 98 },
    head: { x: 360, y: 105, w: 313, h: 198 },
  },
  cloth: [
    { name: "sash", box: { x: 543, y: 681, w: 90, h: 334 },
      wind: { axis: "y", start: 0.15, amp: 3, freq: 1.4, k: 2.6, phase: 0.6 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 218, y: 505 },
    elbowR: { x: 722, y: 612 },
    neck: { x: 535, y: 298 },
  },
  blade: [{ x: 218, y: 505 }, { x: 219, y: 10 }],
  shieldRaise: -0.35,
  strikeFx: "tauntRoar",
  fxColor: 0xc8963c,
  // Đâm giáo ngang tầm ngực (đánh thường), đẩy khiên ra trước chặn đường (ra chiêu), tấn thấp ôm khiên tròn trấn giữ
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 8, y: 160 },
      anchor: { x: 420, y: 1350 }, scale: 1, burst: { x: 1012, y: 397 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 51, y: 16 },
      anchor: { x: 510, y: 1420 }, scale: 0.88, burst: { x: 900, y: 472 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 41, y: 16 },
      anchor: { x: 525, y: 1428 }, scale: 0.8, burst: { x: 825, y: 675 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 318 },
    anchor: { x: 560, y: 1150 }, scale: 1 },
};

/**
 * Bế Liên, y sư hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Hồng Đan: bàn tay đặt trên quả bầu nậm lớn cùng bầu nậm xoay quanh cổ tay (chỗ bầu che thân được vá màu), cẳng tay
 * buông bên phải và đầu quấn khăn tách riêng. Tranh tay vuốt vòng bạc làm tranh phong thái. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const BE_LIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 318, y: 592 },
  dir: "be-lien",
  texScale: 0.5,
  foot: { x: 520, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 233, y: 2, w: 533, h: 1528 },
    armR: { x: 680, y: 578, w: 113, h: 254 },
    sword: { x: 232, y: 490, w: 225, h: 340 },
    arm: { x: 288, y: 580, w: 106, h: 126 },
    head: { x: 392, y: 0, w: 229, h: 241 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 318, y: 592 },
    elbowR: { x: 712, y: 582 },
    neck: { x: 530, y: 232 },
  },
  blade: [{ x: 318, y: 592 }, { x: 340, y: 820 }],
  strikeFx: "earthMend",
  fxColor: 0xd4a94e,
  // Đẩy chưởng ra trước (đánh thường), nhón viên thuốc khỏi lọ nhỏ (ra chiêu), xòe tay trao sinh khí cho cả đội
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 124, y: 9 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 930, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 204, y: 10 },
      anchor: { x: 570, y: 1480 }, scale: 1, burst: { x: 615, y: 345 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 110, y: 12 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 930, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 36, y: 19 },
    anchor: { x: 800, y: 990 }, scale: 0.8 },
};

/**
 * Mã Nhạc, mưu sĩ hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Ninh Hỏa: quạt nan vuông cùng nắm tay phẩy theo nhịp quạt quanh cổ tay, bàn tay buông và đầu quấn khăn tách riêng, chỗ
 * cổ tay trong ống tay áo được vá màu lót áo. Tranh cúi xem ấn gỗ làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const MA_NHAC: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "ma-nhac",
  texScale: 0.5,
  foot: { x: 620, y: 1512 },
  height: 1505,
  parts: {
    body: { x: 224, y: 7, w: 755, h: 1511 },
    armR: { x: 824, y: 736, w: 92, h: 153 },
    sword: { x: 24, y: 238, w: 244, h: 325 },
    arm: { x: 137, y: 447, w: 131, h: 116 },
    head: { x: 462, y: 4, w: 246, h: 238 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 252, y: 530 },
    elbowR: { x: 868, y: 748 },
    neck: { x: 585, y: 225 },
  },
  blade: [{ x: 205, y: 540 }, { x: 130, y: 260 }],
  strikeFx: "roadSever",
  fxColor: 0xc8923a,
  // Quạt nan quét thấp (đánh thường), giơ quạt chỉ tay vạch đường (ra chiêu), lật ngang quạt xòe tay chặn đường lương
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 32, y: 11 },
      anchor: { x: 600, y: 1500 }, scale: 1, burst: { x: 140, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 17, y: 7 },
      anchor: { x: 500, y: 1470 }, scale: 1, burst: { x: 1000, y: 312 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 14, y: 7 },
      anchor: { x: 520, y: 1470 }, scale: 1, burst: { x: 960, y: 232 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 8, y: 304 },
    anchor: { x: 600, y: 1180 }, scale: 0.85 },
};

/**
 * Tạ Thạch, quân sư hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Tôn Diệm: cán cờ lệnh cùng nắm tay xoay quanh cổ tay theo nhịp giáo, lá cờ vàng tách riêng bay theo gió trên cán;
 * bàn tay cầm bó thẻ tre và đầu tách riêng, chỗ bó thẻ che cổ tay áo vá màu. Tranh cúi cắm cờ trận làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TA_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ta-thach",
  texScale: 0.5,
  foot: { x: 538, y: 1512 },
  height: 1510,
  parts: {
    body: { x: 170, y: 3, w: 732, h: 1514 },
    armR: { x: 837, y: 419, w: 172, h: 242 },
    sword: { x: 42, y: 76, w: 128, h: 686 },
    arm: { x: 79, y: 516, w: 91, h: 121 },
    head: { x: 451, y: 3, w: 225, h: 260 },
  },
  cloth: [
    { name: "flag", box: { x: 73, y: 94, w: 202, h: 399 }, onWeapon: true,
      wind: { axis: "x", start: 0.12, amp: 12, freq: 1.5, k: 4, phase: 0.6, vertical: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 163, y: 578 },
    elbowR: { x: 872, y: 598 },
    neck: { x: 560, y: 236 },
  },
  blade: [{ x: 150, y: 520 }, { x: 60, y: 90 }],
  strikeFx: "stoneBastion",
  fxColor: 0xd09a48,
  // Vung cờ lệnh ra sau, đưa bó thẻ tre tới (đánh thường), giơ cao cờ truyền lệnh (ra chiêu), vung cờ bày bát trận
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 11, y: 4 },
      anchor: { x: 608, y: 1486 }, scale: 1, burst: { x: 905, y: 790 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 127, y: 9 },
      anchor: { x: 585, y: 1488 }, scale: 1, burst: { x: 232, y: 190 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 10, y: 12 },
      anchor: { x: 540, y: 1470 }, scale: 1, burst: { x: 135, y: 230 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 108 },
    anchor: { x: 820, y: 860 }, scale: 0.9 },
};

/**
 * Tống Tấn, tướng sĩ hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Kha Sơn: cẳng tay bọc da cùng trường kiếm buông chéo xoay quanh khuỷu theo nhịp chém, cẳng tay buông và đầu tách
 * riêng, đuôi dải buộc tóc tím bay sau đầu. Tranh chống kiếm đứng nghỉ làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TONG_TAN: WarriorRig = {
  skeleton: "warrior",
  dir: "tong-tan",
  texScale: 0.5,
  foot: { x: 620, y: 1510 },
  height: 1510,
  parts: {
    body: { x: 373, y: 4, w: 628, h: 1518 },
    armR: { x: 830, y: 521, w: 110, h: 332 },
    sword: { x: 18, y: 538, w: 480, h: 900 },
    arm: { x: 368, y: 538, w: 130, h: 260 },
    head: { x: 576, y: 4, w: 198, h: 240 },
  },
  cloth: [
    { name: "ribbon", box: { x: 492, y: 90, w: 110, h: 144 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 6, freq: 1.7, k: 3.6, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 445, y: 560 },
    elbowR: { x: 868, y: 555 },
    neck: { x: 650, y: 232 },
  },
  blade: [{ x: 372, y: 830 }, { x: 40, y: 1400 }],
  strikeFx: "thunderCleave",
  fxColor: 0xb08cff,
  // Hai tay kéo kiếm chém ngang (đánh thường), hất kiếm chéo lên (ra chiêu), giơ kiếm qua đầu chuẩn bị nhát chém cuối
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 25, y: 44 },
      anchor: { x: 387, y: 1480 }, scale: 0.95, burst: { x: 990, y: 587 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 10, y: 11 },
      anchor: { x: 370, y: 1490 }, scale: 1, burst: { x: 960, y: 80 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 31, y: 14 },
      anchor: { x: 410, y: 1500 }, scale: 0.9, burst: { x: 700, y: 45 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 278 },
    anchor: { x: 560, y: 1250 }, scale: 0.9 },
};

/**
 * Vũ Lôi, pháp sư hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn, khổ 1024×1536; tranh tuyệt chiêu
 * khổ ngang 1536×1024). Ảnh đứng tách lớp bằng code như Doãn Nham: trượng đầu lồng đồng gắn quả cầu tím cùng nắm tay xoay
 * quanh cổ tay, khe trượng sau nắm tay lấp bằng đoạn trượng ngay dưới; bàn tay buông và đầu tách riêng. Tranh chống trượng
 * chống nạnh làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const VU_LOI: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "vu-loi",
  texScale: 0.5,
  foot: { x: 510, y: 1500 },
  height: 1495,
  parts: {
    body: { x: 198, y: 5, w: 771, h: 1515 },
    armR: { x: 798, y: 646, w: 76, h: 145 },
    sword: { x: 100, y: 43, w: 124, h: 1432 },
    arm: { x: 121, y: 413, w: 97, h: 95 },
    head: { x: 462, y: 8, w: 190, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 205, y: 462 },
    elbowR: { x: 818, y: 668 },
    neck: { x: 548, y: 235 },
  },
  blade: [{ x: 165, y: 460 }, { x: 160, y: 127 }],
  orb: { x: 160, y: 127 },
  strikeFx: "heavenStrike",
  fxColor: 0xb48cff,
  // Kết ấn Ngũ hành đẩy bàn tay về phía đối thủ (đánh thường), chạm đỉnh trượng gọi sét vào quả cầu (ra chiêu), giơ ngang
  // trượng qua đầu gọi thiên lôi (tuyệt chiêu). Cỡ người so theo khóa thắt lưng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 154, y: 7 },
      anchor: { x: 560, y: 1490 }, scale: 1.05, burst: { x: 770, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 96, y: 25 },
      anchor: { x: 546, y: 1472 }, scale: 1.05, burst: { x: 270, y: 95 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 195, y: 10 },
      anchor: { x: 827, y: 998 }, scale: 1.28, burst: { x: 1230, y: 50 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 8, y: 189 },
    anchor: { x: 700, y: 1150 }, scale: 1.2 },
};

/**
 * Ông Chấn, binh lính hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn; tranh gục và tranh chỉnh khăn
 * khổ 1172×1342). Ảnh đứng tách lớp bằng code như Lê Thạch: giáo cùng nắm tay xoay quanh cổ tay (đoạn cán sau nắm tay lấp
 * bằng đoạn cán ngay trên), khiên mây viền đồng là lớp tay không nâng lên khi vào thế và đỡ đòn (mép tay áo dưới vành
 * khiên được kéo dài), đầu quấn khăn tím tách riêng, đuôi khăn bay sau đầu. Tranh chỉnh khăn tựa giáo làm tranh phong
 * thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const ONG_CHAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ong-chan",
  texScale: 0.5,
  foot: { x: 540, y: 1483 },
  height: 1350,
  parts: {
    body: { x: 56, y: 131, w: 968, h: 1353 },
    armR: { x: 670, y: 295, w: 337, h: 456 },
    sword: { x: 69, y: 32, w: 91, h: 1262 },
    arm: { x: 66, y: 497, w: 95, h: 125 },
    head: { x: 399, y: 131, w: 228, h: 228 },
  },
  cloth: [
    { name: "scarf", box: { x: 290, y: 232, w: 125, h: 115 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 5, freq: 1.6, k: 3.2, phase: 0.4, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 112, y: 560 },
    elbowR: { x: 690, y: 450 },
    neck: { x: 520, y: 325 },
  },
  blade: [{ x: 112, y: 560 }, { x: 114, y: 40 }],
  shieldRaise: -0.35,
  strikeFx: "thunderAegis",
  fxColor: 0xb48cff,
  // Đâm giáo ngang núp khiên (đánh thường), đứng thẳng dựng giáo (ra chiêu), hạ mũi giáo, tấn rộng đẩy khiên ra trước
  // trấn giữ (tuyệt chiêu). Cỡ người so theo khoảng đỉnh khăn tới nút thắt lưng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 25, y: 170 },
      anchor: { x: 520, y: 1404 }, scale: 1.03, burst: { x: 1015, y: 646 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 131, y: 22 },
      anchor: { x: 547, y: 1506 }, scale: 1, burst: { x: 181, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 31, y: 28 },
      anchor: { x: 542, y: 1488 }, scale: 1.03, burst: { x: 895, y: 568 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 19, y: 288 },
    anchor: { x: 600, y: 1130 }, scale: 0.9 },
};

/**
 * Tiêu Minh, y sư hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Bế Liên: bàn tay nắm dây cùng đôi hồ lô tím xoay quanh cổ tay (chỗ hồ lô che vạt áo được vá màu), cẳng tay buông bên
 * phải và đầu tách riêng. Tranh ngồi chạm ống kim làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TIEU_MINH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 335, y: 610 },
  dir: "tieu-minh",
  texScale: 0.5,
  foot: { x: 480, y: 1490 },
  height: 1520,
  parts: {
    body: { x: 263, y: 0, w: 626, h: 1535 },
    armR: { x: 672, y: 466, w: 215, h: 262 },
    sword: { x: 292, y: 659, w: 156, h: 159 },
    arm: { x: 322, y: 587, w: 109, h: 80 },
    head: { x: 366, y: 0, w: 281, h: 215 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 610 },
    elbowR: { x: 705, y: 480 },
    neck: { x: 530, y: 200 },
  },
  blade: [{ x: 335, y: 610 }, { x: 380, y: 800 }],
  strikeFx: "thunderMend",
  fxColor: 0xb48cff,
  // Đẩy chưởng ra trước (đánh thường), nâng đôi hồ lô trước ngực (ra chiêu), nhón kim châm sắp phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 99, y: 17 },
      anchor: { x: 510, y: 1480 }, scale: 1, burst: { x: 925, y: 270 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 71, y: 8 },
      anchor: { x: 510, y: 1480 }, scale: 1, burst: { x: 525, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 66, y: 10 },
      anchor: { x: 520, y: 1480 }, scale: 0.95, burst: { x: 765, y: 265 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 45, y: 3 },
    anchor: { x: 760, y: 985 }, scale: 0.82 },
};

/**
 * Từ Kinh, mưu sĩ hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn), kèm ảnh phong thái. Ảnh đứng
 * tách lớp bằng code như Nhan Trúc: quạt sắt khép cùng nắm tay phẩy theo nhịp quạt, bàn tay buông và đầu tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TU_KINH: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "tu-kinh",
  texScale: 0.5,
  foot: { x: 580, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 224, y: 15, w: 740, h: 1509 },
    armR: { x: 760, y: 682, w: 75, h: 137 },
    sword: { x: 47, y: 584, w: 217, h: 130 },
    arm: { x: 168, y: 622, w: 95, h: 84 },
    head: { x: 427, y: 15, w: 192, h: 229 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 245, y: 650 },
    elbowR: { x: 785, y: 700 },
    neck: { x: 545, y: 205 },
  },
  blade: [{ x: 215, y: 665 }, { x: 60, y: 600 }],
  strikeFx: "stormSeal",
  fxColor: 0xb48cff,
  // Chĩa quạt sắt về phía đối thủ (đánh thường), thủ thế quạt ngang hông (ra chiêu), giơ quạt xòe tay đoạt khí (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 90, y: 8 },
      anchor: { x: 520, y: 1505 }, scale: 1, burst: { x: 960, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 42, y: 20 },
      anchor: { x: 545, y: 1480 }, scale: 1, burst: { x: 370, y: 610 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 148, y: 11 },
      anchor: { x: 515, y: 1500 }, scale: 1, burst: { x: 985, y: 450 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 29, y: 58 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Mạc Vân, quân sư hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Vi Triều: cờ lệnh tím cùng nắm tay xoay quanh cổ tay theo nhịp giáo, bàn tay cầm thẻ tre và đầu tách riêng. Tranh
 * đánh thường và tuyệt chiêu vẽ người nhỏ trong khung ngang nên phóng lên cho bằng hình đứng. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const MAC_VAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "mac-van",
  texScale: 0.5,
  foot: { x: 640, y: 1505 },
  height: 1400,
  parts: {
    body: { x: 303, y: 120, w: 681, h: 1402 },
    armR: { x: 785, y: 532, w: 172, h: 168 },
    sword: { x: 88, y: 3, w: 258, h: 1508 },
    arm: { x: 252, y: 494, w: 65, h: 65 },
    head: { x: 497, y: 120, w: 172, h: 201 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 525 },
    elbowR: { x: 800, y: 640 },
    neck: { x: 590, y: 310 },
  },
  blade: [{ x: 285, y: 525 }, { x: 258, y: 20 }],
  strikeFx: "thunderRout",
  fxColor: 0xb48cff,
  // Chĩa cờ lệnh ngang về phía đối thủ (đánh thường), giơ thẻ tre ra lệnh (ra chiêu), quét cờ chéo trao thẻ tre (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 50, y: 14 },
      anchor: { x: 760, y: 1000 }, scale: 1.38, burst: { x: 1490, y: 385 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 42, y: 5 },
      anchor: { x: 630, y: 1505 }, scale: 1, burst: { x: 875, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 21, y: 12 },
      anchor: { x: 660, y: 1170 }, scale: 1.28, burst: { x: 1270, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 31, y: 80 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Hứa Lăng, tướng sĩ hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: đao cong (cả tua xanh) cùng nắm tay xoay quanh cổ tay theo nhịp chém, bàn tay phải và đầu tách riêng, dải khăn
 * xanh buộc tóc bay theo gió sau lưng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HUA_LANG: WarriorRig = {
  skeleton: "warrior",
  dir: "hua-lang",
  texScale: 0.5,
  foot: { x: 730, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 340, y: 9, w: 647, h: 1506 },
    armR: { x: 852, y: 698, w: 63, h: 127 },
    sword: { x: 8, y: 657, w: 463, h: 442 },
    arm: { x: 358, y: 688, w: 91, h: 95 },
    head: { x: 560, y: 35, w: 166, h: 204 },
  },
  cloth: [
    { name: "ribbon", box: { x: 231, y: 86, w: 329, h: 593 }, behind: true,
      wind: { axis: "y", start: 0.1, amp: 8, freq: 1.4, k: 2.6, phase: 0.3 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 410, y: 720 },
    elbowR: { x: 875, y: 705 },
    neck: { x: 640, y: 225 },
  },
  blade: [{ x: 405, y: 735 }, { x: 20, y: 1085 }],
  strikeFx: "galeSlash",
  fxColor: 0x2e9e90,
  // Tấn rộng đưa đao ngang chém tới (đánh thường), vươn tay giơ đao chém xuống (ra chiêu), xoay người vung đao sau đầu
  // rồi bổ (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 10, y: 5 },
      anchor: { x: 540, y: 1500 }, scale: 1, burst: { x: 1010, y: 630 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 6, y: 10 },
      anchor: { x: 500, y: 1515 }, scale: 1, burst: { x: 1010, y: 25 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 45, y: 8 },
      anchor: { x: 690, y: 1165 }, scale: 1, burst: { x: 785, y: 15 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 9, y: 11 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Liễu Yên, pháp sư hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code: trượng trúc dài (cả cầu ngọc và chùm lông vũ) cùng nắm tay xoay quanh cổ tay, bàn tay buông và đầu tách riêng.
 * Tranh đánh thường vẽ người nhỏ trong khung ngang nên phóng lên cho bằng hình đứng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LIEU_YEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "lieu-yen",
  texScale: 0.5,
  foot: { x: 560, y: 1500 },
  height: 1420,
  parts: {
    body: { x: 236, y: 78, w: 776, h: 1426 },
    armR: { x: 745, y: 716, w: 65, h: 116 },
    sword: { x: 58, y: 10, w: 281, h: 1438 },
    arm: { x: 180, y: 375, w: 67, h: 95 },
    head: { x: 466, y: 82, w: 160, h: 194 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 235, y: 450 },
    elbowR: { x: 765, y: 730 },
    neck: { x: 545, y: 265 },
  },
  blade: [{ x: 212, y: 420 }, { x: 196, y: 45 }],
  orb: { x: 196, y: 45 },
  strikeFx: "galeVortex",
  fxColor: 0x2e9e90,
  // Đẩy trượng ngang chĩa cầu ngọc tới (đánh thường), dựng trượng xòe tay (ra chiêu), nghiêng trượng vươn tay gọi lốc
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 41, y: 8 },
      anchor: { x: 640, y: 1005 }, scale: 1.4, burst: { x: 1505, y: 155 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 57, y: 10 },
      anchor: { x: 575, y: 1500 }, scale: 1, burst: { x: 820, y: 630 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 0, y: 11 },
      anchor: { x: 780, y: 1495 }, scale: 1.07, burst: { x: 1015, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 20, y: 9 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Mạnh Tường, binh lính hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Trương Viêm: giáo cùng nắm tay xoay quanh cổ tay, khiên mây cùng cẳng tay nâng lên khi vào thế và đỡ đòn, đầu
 * và đuôi khăn xanh tách riêng. Tranh đánh thường vẽ người nhỏ trong khung ngang nên phóng lên cho bằng hình đứng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const MANH_TUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "manh-tuong",
  texScale: 0.5,
  foot: { x: 590, y: 1505 },
  height: 1340,
  parts: {
    body: { x: 165, y: 162, w: 731, h: 1345 },
    armR: { x: 688, y: 402, w: 265, h: 577 },
    sword: { x: 108, y: 6, w: 143, h: 1428 },
    arm: { x: 111, y: 452, w: 81, h: 101 },
    head: { x: 423, y: 162, w: 189, h: 187 },
  },
  cloth: [
    { name: "ribbon", box: { x: 264, y: 271, w: 186, h: 155 }, behind: true,
      wind: { axis: "x", start: 0.2, amp: 5, freq: 1.6, k: 3, phase: 0.2, vertical: true, reverse: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 180, y: 505 },
    elbowR: { x: 712, y: 615 },
    neck: { x: 540, y: 335 },
  },
  blade: [{ x: 152, y: 500 }, { x: 128, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "galeBulwark",
  fxColor: 0x2e9e90,
  // Tấn rộng núp khiên đâm giáo ngang (đánh thường), đẩy khiên ra trước (ra chiêu), hạ thấp người ghì khiên che thân
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 28, y: 20 },
      anchor: { x: 500, y: 1000 }, scale: 1.28, burst: { x: 1515, y: 175 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 127, y: 18 },
      anchor: { x: 550, y: 1500 }, scale: 1, burst: { x: 900, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 114, y: 12 },
      anchor: { x: 620, y: 1485 }, scale: 1, burst: { x: 780, y: 760 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 9, y: 54 },
    anchor: { x: 800, y: 900 }, scale: 0.9 },
};

/**
 * Bạch Sương, y sư hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code
 * như Mai Thanh: bàn tay xách hồ lô ngọc trắng xoay quanh cổ tay, hồ lô lắc quanh nắm tay; bàn tay buông và đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const BACH_SUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 255, y: 625 },
  dir: "bach-suong",
  texScale: 0.5,
  foot: { x: 530, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 282, y: 16, w: 638, h: 1508 },
    armR: { x: 740, y: 697, w: 58, h: 119 },
    sword: { x: 210, y: 624, w: 153, h: 412 },
    arm: { x: 208, y: 568, w: 95, h: 77 },
    head: { x: 407, y: 16, w: 216, h: 266 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 600 },
    elbowR: { x: 755, y: 712 },
    neck: { x: 540, y: 255 },
  },
  blade: [{ x: 255, y: 625 }, { x: 290, y: 880 }],
  strikeFx: "galeMend",
  fxColor: 0x2e9e90,
  // Tấn thấp đẩy chưởng, hồ lô xách bên hông (đánh thường), ôm hồ lô mở nút (ra chiêu), vươn tay ban gió lành cho cả đội
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 103, y: 17 },
      anchor: { x: 570, y: 1490 }, scale: 1, burst: { x: 700, y: 420 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 228, y: 5 },
      anchor: { x: 515, y: 1505 }, scale: 1, burst: { x: 660, y: 280 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 109, y: 14 },
      anchor: { x: 470, y: 1505 }, scale: 1, burst: { x: 990, y: 380 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 2, y: 209 },
    anchor: { x: 520, y: 1300 }, scale: 0.9 },
};

/**
 * Bùi Phiêu, mưu sĩ hệ Phong (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Nhan Trúc: quạt lông trắng cùng nắm tay phẩy theo nhịp quạt, bàn tay buông và đầu (cả khăn xanh) tách riêng.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const BUI_PHIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "bui-phieu",
  texScale: 0.5,
  foot: { x: 710, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 260, y: 10, w: 726, h: 1509 },
    armR: { x: 836, y: 685, w: 76, h: 135 },
    sword: { x: 13, y: 161, w: 328, h: 370 },
    arm: { x: 238, y: 410, w: 109, h: 89 },
    head: { x: 470, y: 13, w: 277, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 475 },
    elbowR: { x: 870, y: 700 },
    neck: { x: 620, y: 190 },
  },
  blade: [{ x: 290, y: 455 }, { x: 120, y: 260 }],
  strikeFx: "galeRift",
  fxColor: 0x2e9e90,
  // Phẩy quạt lông thấp quét ngang (đánh thường), giơ quạt chỉ tay về phía đối thủ (ra chiêu), tấn rộng giơ quạt xòe tay
  // gọi gió (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 18, y: 11 },
      anchor: { x: 715, y: 1505 }, scale: 1, burst: { x: 80, y: 900 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 56, y: 8 },
      anchor: { x: 555, y: 1505 }, scale: 1, burst: { x: 1000, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 43, y: 17 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 1010, y: 370 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 16, y: 171 },
    anchor: { x: 800, y: 850 }, scale: 0.85 },
};

/**
 * Phùng Phong, quân sư hệ Phong (tướng khởi đầu). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
 * code như Vi Triều: cờ lệnh mây gió cùng nắm tay xoay quanh cổ tay theo nhịp giáo, bàn tay cầm thẻ tre và đầu (cả khăn
 * xanh) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const PHUNG_PHONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "phung-phong",
  texScale: 0.5,
  foot: { x: 670, y: 1505 },
  height: 1300,
  parts: {
    body: { x: 341, y: 210, w: 654, h: 1299 },
    armR: { x: 688, y: 498, w: 95, h: 193 },
    sword: { x: 40, y: 23, w: 380, h: 1457 },
    arm: { x: 336, y: 578, w: 73, h: 85 },
    head: { x: 452, y: 210, w: 245, h: 211 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 372, y: 615 },
    elbowR: { x: 735, y: 640 },
    neck: { x: 600, y: 400 },
  },
  blade: [{ x: 375, y: 620 }, { x: 330, y: 40 }],
  strikeFx: "galeRout",
  fxColor: 0x2e9e90,
  // Chĩa cờ lệnh ngang về phía đối thủ (đánh thường), dựng cờ đưa thẻ tre ra lệnh (ra chiêu), quét cờ chéo giơ cao thẻ
  // tre (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 9, y: 170 },
      anchor: { x: 350, y: 1478 }, scale: 1, burst: { x: 1010, y: 290 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 23, y: 12 },
      anchor: { x: 620, y: 1495 }, scale: 1, burst: { x: 950, y: 680 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 18, y: 47 },
      anchor: { x: 490, y: 1500 }, scale: 0.93, burst: { x: 860, y: 240 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 2, y: 79 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Bạch Nỏ Lang, xạ thủ hệ Kim (RB-062, nghề Xạ thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 29/10 (nền trong suốt sẵn). Nỏ ôm ngang ngực bằng hai tay nên nỏ cùng bàn tay đỡ phía trước là một lớp xoay quanh nắm
 * tay cầm báng; ống tên bên hông lắc nhẹ thay bàn tay buông; đầu (cả đuôi khăn) tách riêng. Phần giáp ngực sau nỏ được vá
 * nhưng luôn bị nỏ che. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const BACH_NO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "bach-no-lang",
  texScale: 0.5,
  foot: { x: 420, y: 1510 },
  height: 1500,
  parts: {
    body: { x: 36, y: 12, w: 748, h: 1511 },
    armR: { x: 528, y: 598, w: 137, h: 316 },
    sword: { x: 205, y: 338, w: 802, h: 250 },
    arm: { x: 268, y: 426, w: 131, h: 102 },
    head: { x: 279, y: 12, w: 211, h: 263 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 330, y: 470 },
    elbowR: { x: 560, y: 625 },
    neck: { x: 420, y: 250 },
  },
  blade: [{ x: 330, y: 470 }, { x: 960, y: 455 }],
  strikeFx: "boltBreach",
  fxColor: 0x9ea4ad,
  // Đá tống ngắn, ôm nỏ ngang ngực không bắn (đánh thường), đứng trụ áp má ngắm (ra chiêu), quỳ một gối ghì nỏ phóng tên
  // phá thành (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 6, y: 12 },
      anchor: { x: 220, y: 1490 }, scale: 1, burst: { x: 1010, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 14, y: 10 },
      anchor: { x: 440, y: 1505 }, scale: 1, burst: { x: 975, y: 460 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 43, y: 7 },
      anchor: { x: 780, y: 1005 }, scale: 1.05, burst: { x: 1480, y: 370 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 20, y: 15 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Thanh Lâm Xạ, xạ thủ hệ Mộc (RB-063, nghề Xạ thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: cung tre dài (cả dây) cùng bàn tay cầm cung xoay quanh cổ tay
 * như trượng, bàn tay chạm giỏ tên và đầu tách riêng; bím tóc, giỏ tên ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const THANH_LAM_XA: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "thanh-lam-xa",
  texScale: 0.5,
  foot: { x: 420, y: 1500 },
  height: 1420,
  parts: {
    body: { x: 256, y: 85, w: 527, h: 1423 },
    armR: { x: 298, y: 752, w: 71, h: 77 },
    sword: { x: 652, y: 16, w: 228, h: 1416 },
    arm: { x: 763, y: 621, w: 101, h: 102 },
    head: { x: 398, y: 86, w: 183, h: 215 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 790, y: 670 },
    elbowR: { x: 330, y: 765 },
    neck: { x: 500, y: 285 },
  },
  blade: [{ x: 815, y: 665 }, { x: 854, y: 20 }],
  strikeFx: "thicketShot",
  fxColor: 0x4f9a4a,
  // Lách người quét chân, cung tre giữ dọc không kéo (đánh thường), đứng tĩnh kéo tên ngang vai (ra chiêu), hạ thấp người
  // kéo cung chéo ép lối (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 50, y: 6 },
      anchor: { x: 520, y: 1490 }, scale: 1, burst: { x: 780, y: 700 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 135, y: 6 },
      anchor: { x: 440, y: 1505 }, scale: 1, burst: { x: 1000, y: 395 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 10, y: 7 },
      anchor: { x: 560, y: 975 }, scale: 1.1, burst: { x: 1525, y: 460 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 95, y: 19 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Lam Giang Phi Diệp, xạ thủ hệ Thủy (RB-064, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 30/10; tranh tuyệt chiêu có nền ca-rô in sẵn nên tách nền bằng code, giữ lưỡi phi tiêu thép trong viền đen. Ảnh đứng
 * tách lớp bằng code: phi tiêu lá liễu cùng nắm tay vung như kiếm ngắn, bàn tay giữ ống tiêu và đầu (cả dải buộc tóc)
 * tách riêng. Hệ tọa độ: ảnh đứng 1086×1448.
 */
const LAM_GIANG_PHI_DIEP: WarriorRig = {
  skeleton: "warrior",
  dir: "lam-giang-phi-diep",
  texScale: 0.5,
  foot: { x: 560, y: 1405 },
  height: 1400,
  parts: {
    body: { x: 272, y: 9, w: 547, h: 1406 },
    armR: { x: 720, y: 563, w: 77, h: 112 },
    sword: { x: 312, y: 755, w: 47, h: 146 },
    arm: { x: 286, y: 682, w: 82, h: 87 },
    head: { x: 390, y: 10, w: 270, h: 217 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 325, y: 715 },
    elbowR: { x: 735, y: 585 },
    neck: { x: 560, y: 215 },
  },
  blade: [{ x: 330, y: 740 }, { x: 337, y: 900 }],
  strikeFx: "willowTide",
  fxColor: 0x2f7fc1,
  // Bước ngang thúc gối, phi tiêu thu sát hông (đánh thường), chùng gối nghiêng thân kéo tiêu ngang thấp (ra chiêu), xoay hông
  // đưa tiêu lên chéo ngang vai sắp phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 115, y: 13 },
      anchor: { x: 540, y: 1424 }, scale: 1, burst: { x: 1040, y: 640 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 201, y: 14 },
      anchor: { x: 765, y: 1000 }, scale: 1, burst: { x: 1440, y: 450 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 51, y: 35 },
      anchor: { x: 620, y: 1495 }, scale: 0.88, burst: { x: 990, y: 640 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 22, y: 3 },
    anchor: { x: 800, y: 900 }, scale: 0.85 },
};

/**
 * Xích Diệm Luân, xạ thủ hệ Hỏa (RB-065, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10 (nền
 * trong suốt sẵn). Ảnh đứng tách lớp bằng code: phi luân vành kín cùng nắm tay vung như kiếm ngắn, bàn tay chống hông và
 * đầu (cả dải buộc tóc) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const XICH_DIEM_LUAN: WarriorRig = {
  skeleton: "warrior",
  dir: "xich-diem-luan",
  texScale: 0.5,
  foot: { x: 590, y: 1505 },
  height: 1490,
  parts: {
    body: { x: 211, y: 18, w: 758, h: 1493 },
    armR: { x: 650, y: 482, w: 150, h: 133 },
    sword: { x: 70, y: 739, w: 296, h: 334 },
    arm: { x: 182, y: 690, w: 107, h: 100 },
    head: { x: 383, y: 19, w: 282, h: 234 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 235, y: 720 },
    elbowR: { x: 760, y: 515 },
    neck: { x: 560, y: 240 },
  },
  blade: [{ x: 235, y: 730 }, { x: 215, y: 1070 }],
  strikeFx: "flameDisc",
  fxColor: 0xd9502a,
  // Tung cước, vòng thu sát hông (đánh thường), thế chân rộng vung vòng ngang hông ra sau (ra chiêu), xoay thân dựng vòng
  // trên vai chuẩn bị phóng chéo (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 6, y: 9 },
      anchor: { x: 430, y: 1515 }, scale: 1, burst: { x: 930, y: 290 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 7, y: 3 },
      anchor: { x: 790, y: 1180 }, scale: 1, burst: { x: 1290, y: 370 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 19, y: 0 },
      anchor: { x: 690, y: 1175 }, scale: 1, burst: { x: 1290, y: 390 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 2, y: 0 },
    anchor: { x: 680, y: 1150 }, scale: 0.85 },
};

/**
 * Trấn Sơn Thạch, xạ thủ hệ Thổ (RB-066, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10 (nền
 * trong suốt sẵn). Ảnh đứng tách lớp bằng code: phi hoàng thạch cùng nắm tay vung như kiếm ngắn, bàn tay trái và đầu tách
 * riêng. Tranh tư thế vẽ người nhỏ hơn hình đứng nên phóng nhẹ. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRAN_SON_THACH: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-son-thach",
  texScale: 0.5,
  foot: { x: 540, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 93, y: 0, w: 865, h: 1514 },
    armR: { x: 839, y: 690, w: 97, h: 162 },
    sword: { x: 204, y: 758, w: 38, h: 45 },
    arm: { x: 107, y: 688, w: 116, h: 126 },
    head: { x: 364, y: 3, w: 284, h: 218 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 150, y: 710 },
    elbowR: { x: 870, y: 705 },
    neck: { x: 520, y: 205 },
  },
  blade: [{ x: 185, y: 760 }, { x: 240, y: 798 }],
  strikeFx: "stoneGuard",
  fxColor: 0xc8963c,
  // Bước tới đấm tay trái, tay phải giữ đá thu về (đánh thường), chùng gối vung đá về sau ngang thấp (ra chiêu), trụ sâu
  // đưa đá trên vai ném mạnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 30, y: 7 },
      anchor: { x: 550, y: 1420 }, scale: 1.06, burst: { x: 1070, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 9, y: 0 },
      anchor: { x: 560, y: 1415 }, scale: 1.05, burst: { x: 1080, y: 590 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 33, y: 12 },
      anchor: { x: 720, y: 1170 }, scale: 1.05, burst: { x: 1300, y: 600 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 1, y: 4 },
    anchor: { x: 660, y: 1100 }, scale: 0.85 },
};

/**
 * Lôi Minh Xạ, xạ thủ hệ Lôi (RB-067, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10 (nền
 * trong suốt sẵn). Ảnh đứng tách lớp bằng code: lôi châm cùng nắm tay giơ cao vung như kiếm ngắn, bàn tay chống hông và
 * đầu (cả dải buộc tóc tím) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LOI_MINH_XA: WarriorRig = {
  skeleton: "warrior",
  dir: "loi-minh-xa",
  texScale: 0.5,
  foot: { x: 530, y: 1505 },
  height: 1500,
  parts: {
    body: { x: 142, y: 0, w: 786, h: 1515 },
    armR: { x: 712, y: 620, w: 79, h: 101 },
    sword: { x: 243, y: 94, w: 67, h: 129 },
    arm: { x: 193, y: 209, w: 79, h: 128 },
    head: { x: 302, y: 5, w: 409, h: 263 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 230, y: 320 },
    elbowR: { x: 760, y: 640 },
    neck: { x: 560, y: 240 },
  },
  blade: [{ x: 250, y: 220 }, { x: 305, y: 100 }],
  strikeFx: "voltNeedle",
  fxColor: 0xb48cff,
  // Bước chéo gạt tay trái, châm thu thấp (đánh thường), đứng chắc đưa châm ngang má (ra chiêu), chùng người kéo châm cao
  // qua vai sau (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 3, y: 3 },
      anchor: { x: 690, y: 1180 }, scale: 1, burst: { x: 1240, y: 340 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 0, y: 0 },
      anchor: { x: 515, y: 1500 }, scale: 1, burst: { x: 780, y: 240 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 11, y: 17 },
      anchor: { x: 660, y: 1170 }, scale: 1, burst: { x: 1280, y: 680 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 9, y: 10 },
    anchor: { x: 700, y: 1120 }, scale: 0.85 },
};

/**
 * Tật Phong Lăng, xạ thủ hệ Phong (RB-068, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10
 * (nền trong suốt sẵn). Ảnh đứng hai tay nâng dải lụa thành vòng nên vòng lụa giữa ở lại thân; đầu lụa rủ bên trái cùng bàn
 * tay trái lắc nhẹ quanh cổ tay như hồ lô của y sư, cổ tay áo phải và đầu tách riêng. Tranh tư thế vẽ người nhỏ hơn hình
 * đứng nên phóng 1.1. Hệ tọa độ: ảnh đứng 1086×1448.
 */
const TAT_PHONG_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 285, y: 530 },
  dir: "tat-phong-lang",
  texScale: 0.5,
  foot: { x: 460, y: 1430 },
  height: 1420,
  parts: {
    body: { x: 171, y: 8, w: 877, h: 1430 },
    armR: { x: 762, y: 447, w: 129, h: 46 },
    sword: { x: 208, y: 520, w: 131, h: 471 },
    arm: { x: 240, y: 450, w: 67, h: 111 },
    head: { x: 433, y: 8, w: 190, h: 232 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 275, y: 465 },
    elbowR: { x: 775, y: 470 },
    neck: { x: 545, y: 225 },
  },
  blade: [{ x: 285, y: 530 }, { x: 270, y: 970 }],
  strikeFx: "silkGale",
  fxColor: 0x2e9e90,
  // Đá quét, gom lụa cạnh hông (đánh thường), bước tới quét lụa ngang hông (ra chiêu), xoay rộng nâng lụa thành cung lớn trên
  // đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 14, y: 6 },
      anchor: { x: 276, y: 1185 }, scale: 1.1, burst: { x: 1290, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 61, y: 8 },
      anchor: { x: 600, y: 1170 }, scale: 1.1, burst: { x: 1240, y: 700 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 8, y: 8 },
      anchor: { x: 650, y: 1170 }, scale: 1.1, burst: { x: 1300, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 14, y: 8 },
    anchor: { x: 660, y: 1150 }, scale: 0.85 },
};

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
  dinhBoLinh: DINH_BO_LINH,
  nguyenBac: NGUYEN_BAC,
  dinhDien: DINH_DIEN,
  luuCo: LUU_CO,
  trinhTu: TRINH_TU,
  leHoan: LE_HOAN,
  dinhLien: DINH_LIEN,
  tranLam: TRAN_LAM,
  phamBachHo: PHAM_BACH_HO,
  ngoXuongXi: NGO_XUONG_XI,
  kieuCongHan: KIEU_CONG_HAN,
  nguyenKhoan: NGUYEN_KHOAN,
  kieuThuan: KIEU_THUAN,
  lyKhue: LY_KHUE,
  nguyenThuTiep: NGUYEN_THU_TIEP,
  luDuong: LU_DUONG,
  nguyenSieu: NGUYEN_SIEU,
  doCanhThac: DO_CANH_THAC,
  chuNgan: CHU_NGAN,
  caoKien: CAO_KIEN,
  chauNgoc: CHAU_NGOC,
  toKim: TO_KIM,
  nghiemThiet: NGHIEM_THIET,
  lamTung: LAM_TUNG,
  damThao: DAM_THAO,
  hoangMoc: HOANG_MOC,
  lucDiep: LUC_DIEP,
  nhanTruc: NHAN_TRUC,
  samTue: SAM_TUE,
  hoLang: HO_LANG,
  khaSon: KHA_SON,
  thaiHa: THAI_HA,
  maiThanh: MAI_THANH,
  quachAn: QUACH_AN,
  viTrieu: VI_TRIEU,
  haVan: HA_VAN,
  tonDiem: TON_DIEM,
  lyLiet: LY_LIET,
  truongViem: TRUONG_VIEM,
  hongDan: HONG_DAN,
  ninhHoa: NINH_HOA,
  doanNham: DOAN_NHAM,
  leThach: LE_THACH,
  beLien: BE_LIEN,
  maNhac: MA_NHAC,
  taThach: TA_THACH,
  tongTan: TONG_TAN,
  vuLoi: VU_LOI,
  ongChan: ONG_CHAN,
  tieuMinh: TIEU_MINH,
  tuKinh: TU_KINH,
  macVan: MAC_VAN,
  huaLang: HUA_LANG,
  lieuYen: LIEU_YEN,
  manhTuong: MANH_TUONG,
  bachSuong: BACH_SUONG,
  buiPhieu: BUI_PHIEU,
  phungPhong: PHUNG_PHONG,
  bachNoLang: BACH_NO_LANG,
  thanhLamXa: THANH_LAM_XA,
  lamGiangPhiDiep: LAM_GIANG_PHI_DIEP,
  xichDiemLuan: XICH_DIEM_LUAN,
  tranSonThach: TRAN_SON_THACH,
  loiMinhXa: LOI_MINH_XA,
  tatPhongLang: TAT_PHONG_LANG,
};

export function rigOf(id: string): Rig | null {
  return RIGS[id] ?? null;
}

export function rigIds(): readonly string[] {
  return Object.keys(RIGS);
}

/** Đường dẫn ảnh của một lớp. */
export function partUrl(rig: Rig, part: string): string {
  return `/art/characters/${rig.dir}/${part}.webp`;
}
