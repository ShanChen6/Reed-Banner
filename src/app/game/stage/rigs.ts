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
  /** Góc giơ vũ khí khi chiến thắng/phản ứng (rad), thay mặc định theo loại vũ khí; kiếm buông thõng cần nhỏ. */
  readonly raise?: number;
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
   * rồi vòng sáng tím hồi phục quanh họ; `thunderMarch` đánh thường và ra chiêu phóng sét
   * từ mũi kiếm, bàn tay tới đối thủ đứng đầu, tuyệt chiêu mười đạo sét chạy sát đất tới chân từng đối thủ, ấn mũi tên chỉ
   * xuống trên đầu họ và đốm năng lượng quanh từng đồng đội; `stormSeal` chỉ ở tuyệt chiêu, sét giáng xuống đối thủ đứng đầu, mây giông
   * câm lặng phủ quanh họ và năng lượng bay về chính mình; `thunderRout` chỉ ở tuyệt chiêu, sét giáng lần lượt xuống
   * từng đối thủ và khiên giáp họ nứt vỡ; `galeSlash` chỉ ở tuyệt chiêu, ba lưỡi gió chém qua đối thủ đứng đầu, lốc
   * cuốn quanh chân họ và luồng gió đưa năng lượng tới từng đồng đội; `galeVortex` đánh thường và ra chiêu phóng tia
   * gió từ quả cầu tới đối thủ đứng đầu, tuyệt chiêu gọi lốc cuốn quanh từng đối thủ; `galeBulwark` chỉ ở tuyệt chiêu,
   * lốc gió quanh chính mình, khiên mặt trống trước từng đồng đội và luồng gió đưa năng lượng tới họ; `galeMend` chỉ ở
   * tuyệt chiêu, vòng gió trắng xanh hồi phục quanh từng đồng đội và luồng gió đưa năng lượng tới họ; `galeRift` chỉ ở
   * tuyệt chiêu, lốc cuốn quanh từng đối thủ và năng lượng bay khỏi họ về chính mình; `galeRout` chỉ ở tuyệt chiêu, lốc
   * cuốn và khiên nứt trên từng đối thủ, luồng gió đưa năng lượng tới từng đồng đội; `boltBreach` chỉ ở tuyệt chiêu,
   * tên nỏ (hoặc mũi dao) xuyên tới đối thủ đứng đầu và khiên giáp họ nứt vỡ; `thicketShot` chỉ ở tuyệt chiêu, mũi tên xuyên tới đối
   * thủ đứng đầu, khiên giáp họ nứt và vòng lá hồi phục quanh từng đồng đội; `willowTide` chỉ ở tuyệt chiêu, phi tiêu
   * lao tới đối thủ đứng đầu và cột nước đông băng dưới chân họ; `flameDisc` chỉ ở tuyệt chiêu, phi luân lửa nảy qua
   * từng đối thủ và lửa bén lên họ; `stoneGuard` chỉ ở tuyệt chiêu, đá lao tới đối thủ đứng đầu, khiên giáp họ nứt và
   * khiên mặt trống trước từng đồng đội; `voltNeedle` chỉ ở tuyệt chiêu, lôi châm lao tới đối thủ đứng đầu, mây giông
   * câm lặng phủ quanh họ và năng lượng bay về chính mình; `silkGale` chỉ ở tuyệt chiêu, lốc cuốn và khiên nứt trên từng
   * đối thủ; `myriadEdge` chỉ ở tuyệt chiêu, luồng sáng từ mũi kiếm và sét giáng xuống đối thủ đứng đầu, khiên mặt
   * trống trước chính mình; `venomNeedle` chỉ ở tuyệt chiêu, kim châm lao tới đối thủ đứng đầu và sương độc cuộn quanh
   * họ; `tideBlade` chỉ ở tuyệt chiêu, mũi dao nước lao tới đối thủ đứng đầu, khiên họ nứt và năng lượng bay về chính
   * mình; `twinCleave` chỉ ở tuyệt chiêu, hai nhát chém lửa bắt chéo nhau qua đối thủ đứng đầu rồi lửa bén lên họ;
   * `earthClaw` chỉ ở tuyệt chiêu, địa mạch chạy ngầm tới chân đối thủ đứng đầu trồi đá nhọn, khiên họ nứt và khiên mặt
   * trống trước chính mình; `stormVolley` chỉ ở tuyệt chiêu, ba loạt kim tím liên tiếp tới đối thủ đứng đầu, sét giáng
   * và mây giông cuộn quanh họ; `flutePulse` chỉ ở tuyệt chiêu, sóng âm từ ống sáo tới đầu đối thủ đứng đầu và cơn lốc
   * cuốn quanh họ.
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
    | "thunderMarch"
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
    | "silkGale"
    | "myriadEdge"
    | "venomNeedle"
    | "tideBlade"
    | "twinCleave"
    | "earthClaw"
    | "stormVolley"
    | "flutePulse";
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
 * Vi Lam (tên cũ Đào Lam), pháp sư hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt
 * sẵn), thay bộ 26/10: áo lam viền hoa văn sao, dải lụa xanh buộc tóc, trượng gỗ cầu đá lam. Ảnh đứng (976×1612, giữ
 * nguyên khổ) tách lớp bằng code: trượng cùng nắm tay xoay quanh cổ tay, cầu đá sáng riêng; bàn tay buông và đầu tách
 * riêng, lòng ống tay sau cổ tay vá bằng khuếch tán màu. Tranh đứng ngắm lòng bàn tay làm tranh phong thái.
 */
const DAO_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dao-lam",
  texScale: 0.5,
  foot: { x: 500, y: 1595 },
  height: 1590,
  parts: {
    body: { x: 232, y: 0, w: 586, h: 1606 },
    armR: { x: 740, y: 715, w: 78, h: 108 },
    sword: { x: 122, y: 360, w: 140, h: 420 },
    arm: { x: 172, y: 585, w: 88, h: 88 },
    head: { x: 330, y: 0, w: 286, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 215, y: 630 },
    elbowR: { x: 765, y: 725 },
    neck: { x: 505, y: 245 },
  },
  blade: [{ x: 215, y: 630 }, { x: 155, y: 385 }],
  orb: { x: 155, y: 385 },
  strikeFx: "waterPillar",
  fxColor: 0x2f7fc1,
  // Hai tay cầm trượng chĩa cầu đá tới (đánh thường), dựng trượng xòe tay (ra chiêu), thế tấn đẩy chưởng kéo trượng ngang (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 153, y: 0 },
      anchor: { x: 510, y: 1535 }, scale: 1, burst: { x: 920, y: 590 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 105, y: 0 },
      anchor: { x: 580, y: 1530 }, scale: 1, burst: { x: 830, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 3, y: 0 },
      anchor: { x: 560, y: 1440 }, scale: 1, burst: { x: 1010, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 4, y: 8 },
    anchor: { x: 760, y: 900 }, scale: 1 },
};

/**
 * Trần Cương, tướng sĩ hệ Kim. Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ 24/10: giáp da
 * vảy đồng, khăn trắng buộc tóc, đại đao tua lau trắng. Ảnh đứng tách lớp bằng code: đao cùng nắm tay phải xoay
 * quanh cổ tay, bàn tay trái chống hông xoay quanh cổ tay, đầu kèm khăn. Phần quần và xà cạp sau lưỡi đao được vá
 * (nội suy ngang lưỡi, xà cạp chân xa lấy vân từ chân gần). Tranh đứng chống đao làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRAN_CUONG: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-cuong",
  texScale: 0.5,
  foot: { x: 480, y: 1505 },
  height: 1520,
  parts: {
    body: { x: 138, y: 5, w: 684, h: 1520 },
    armR: { x: 612, y: 572, w: 138, h: 114 },
    sword: { x: 37, y: 651, w: 700, h: 744 },
    arm: { x: 132, y: 722, w: 94, h: 120 },
    head: { x: 315, y: 5, w: 272, h: 248 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 175, y: 740 },
    elbowR: { x: 735, y: 600 },
    neck: { x: 510, y: 240 },
  },
  blade: [{ x: 270, y: 885 }, { x: 745, y: 1398 }],
  fxColor: 0xffd27a,
  // Ba tranh ra đòn: chém ngang tầm thắt lưng (đánh thường), dựng đao trước mặt (ra chiêu), giơ đao quá đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 25, y: 16 },
      anchor: { x: 650, y: 970 }, scale: 1, burst: { x: 1500, y: 470 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 81, y: 14 },
      anchor: { x: 505, y: 1490 }, scale: 1, burst: { x: 605, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 50, y: 61 },
      anchor: { x: 515, y: 1490 }, scale: 1.05, burst: { x: 950, y: 75 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 37, y: 31 },
    anchor: { x: 760, y: 900 }, scale: 1 },
};

/**
 * Đinh Bộ Lĩnh, nhân vật chính, bản tướng quân. Bộ tranh Shan gửi 31/10 (nền trong suốt sẵn), thay bộ cũ: giáp vảy đen
 * viền đồng, áo trắng, áo choàng đỏ. Ảnh đứng tách lớp bằng code: cẳng tay cầm đao cùng thanh đao xoay quanh khuỷu,
 * bàn tay đặt trên khóa thắt lưng, đầu, hai vạt áo choàng bay theo gió sau lưng (chỗ đao và cẳng tay che vạt trái được
 * vá màu). Tranh đứng chống đao làm tranh phong thái, tranh quỳ chống bao đao làm tranh gục.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DINH_BO_LINH: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-bo-linh",
  texScale: 0.5,
  foot: { x: 540, y: 1495 },
  height: 1495,
  parts: {
    body: { x: 283, y: 15, w: 711, h: 1497 },
    armR: { x: 640, y: 503, w: 164, h: 105 },
    sword: { x: 31, y: 679, w: 345, h: 670 },
    arm: { x: 268, y: 540, w: 108, h: 261 },
    head: { x: 482, y: 16, w: 158, h: 203 },
  },
  cloth: [
    {
      name: "capeL",
      box: { x: 49, y: 408, w: 332, h: 1095 },
      wind: { axis: "y", start: 0.2, amp: 12, freq: 1.2, k: 3, phase: 1.4 },
      behind: true,
    },
    {
      name: "capeR",
      box: { x: 796, y: 711, w: 199, h: 569 },
      wind: { axis: "y", start: 0.15, amp: 9, freq: 1.4, k: 2.8, phase: 0.5 },
      behind: true,
    },
  ],
  covers: [],
  joints: {
    shoulder: { x: 328, y: 556 },
    elbowR: { x: 785, y: 525 },
    neck: { x: 565, y: 205 },
  },
  blade: [
    { x: 300, y: 830 },
    { x: 35, y: 1345 },
  ],
  fxColor: 0xffc46b,
  // Chém ngang (đánh thường), đâm đao chéo lên (ra chiêu), vung đao qua đầu (tuyệt chiêu). Cỡ so theo khóa thắt lưng
  // (65 px đứng).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 30, y: 60 },
      anchor: { x: 610, y: 1470 }, scale: 1.1, burst: { x: 975, y: 575 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 3, y: 3 },
      anchor: { x: 560, y: 1475 }, scale: 1.05, burst: { x: 985, y: 30 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 9, y: 22 },
      anchor: { x: 480, y: 1480 }, scale: 1, burst: { x: 800, y: 60 } },
  },
  // Quỳ một gối, tay chống bao đao.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 83, y: 107 },
    anchor: { x: 520, y: 1400 }, scale: 0.97 },
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
    // Đánh thường: tranh Shan gửi 03/11, chém đao thấp trong thế tấn rộng (cỡ so theo thân trên).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 98, y: 15 }, anchor: { x: 670, y: 1145 }, scale: 1.2, burst: { x: 1085, y: 850 } },
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
    // Đánh thường: tranh Shan gửi 03/11, đâm giáo ngang ngực, khiên mây ép sát sườn (cỡ so theo thân trên).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 470, y: 17 }, anchor: { x: 815, y: 870 }, scale: 1.33, burst: { x: 1515, y: 262 } },
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
    // Đánh thường: tranh Shan gửi 03/11, quét quạt lông ngang người (cỡ so theo đầu).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 15, y: 87 }, anchor: { x: 565, y: 1380 }, scale: 1.05, burst: { x: 880, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 10, y: 30 }, anchor: { x: 620, y: 1513 }, scale: 1, burst: { x: 150, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 8, y: 13 }, anchor: { x: 565, y: 1510 }, scale: 1, burst: { x: 947, y: 80 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 40, y: 37 }, anchor: { x: 850, y: 1007 }, scale: 1 },
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
    // Đánh thường: tranh Shan gửi 03/11, tấn rộng ôm bầu thuốc, tay trái đẩy ra (cỡ so theo đầu).
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 81, y: 29 }, anchor: { x: 669, y: 1230 }, scale: 1.15, burst: { x: 1026, y: 382 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 43, y: 45 }, anchor: { x: 690, y: 1508 }, scale: 1, burst: { x: 170, y: 165 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 12, y: 57 }, anchor: { x: 680, y: 1508 }, scale: 1, burst: { x: 220, y: 225 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 23, y: 36 }, anchor: { x: 920, y: 1000 }, scale: 1 },
};

/**
 * Lê Hoàn, quân sư hệ Lôi. Bộ tranh Shan gửi 31/10 (nền trong suốt sẵn), thay bộ cầm cờ lệnh cũ: giáp vảy sắt viền da,
 * khăn chít trán, áo choàng đỏ sẫm, kiếm thẳng. Ảnh đứng tách lớp bằng code như Đinh Bộ Lĩnh: cẳng tay cầm kiếm cùng
 * thanh kiếm xoay quanh khuỷu, cẳng tay trái buông bên hông, đầu (chỗ cẳng tay che áo được vá màu). Đổi vũ khí nhưng giữ
 * nhịp động tác của bộ cờ lệnh cũ (nhịp giáo: đẩy tới nhẹ, không vung vòng). Tranh kéo áo choàng ngoái nhìn làm tranh
 * phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LE_HOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-hoan",
  texScale: 0.5,
  foot: { x: 560, y: 1495 },
  height: 1495,
  parts: {
    body: { x: 255, y: 5, w: 700, h: 1500 },
    armR: { x: 656, y: 520, w: 177, h: 247 },
    sword: { x: 69, y: 686, w: 296, h: 526 },
    arm: { x: 262, y: 548, w: 117, h: 259 },
    head: { x: 500, y: 9, w: 169, h: 217 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 560 },
    elbowR: { x: 790, y: 545 },
    neck: { x: 590, y: 215 },
  },
  blade: [
    { x: 280, y: 815 },
    { x: 70, y: 1210 },
  ],
  strikeFx: "thunderMarch",
  fxColor: 0xb98cff,
  // Thủ kiếm, chỉ tay về phía trước (đánh thường), xòe tay ra lệnh (ra chiêu), giơ kiếm qua đầu (tuyệt chiêu). Cỡ so
  // theo khóa thắt lưng (62 px đứng).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 5, y: 65 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 800, y: 640 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 11, y: 48 },
      anchor: { x: 450, y: 1470 }, scale: 1, burst: { x: 990, y: 240 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 51, y: 33 },
      anchor: { x: 440, y: 1480 }, scale: 1, burst: { x: 690, y: 45 } },
  },
  // Ngồi bệt, tay chống đất, kiếm rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 11, y: 226 },
    anchor: { x: 500, y: 1240 }, scale: 0.95 },
};

/**
 * Đinh Liễn, pháp sư hệ Thủy. Bộ tranh Shan gửi 03/11 (nền trong suốt sẵn) theo thiết kế mới RB-007: áo giao lĩnh chàm,
 * giáp da mỏng, vòng vải ngà cổ tay, tay cầm thủ bản gỗ đầu bịt đồng, thay bộ áo lam cầm trượng cầu cũ. Ảnh đứng tách
 * lớp bằng code: bàn tay cùng thủ bản xoay quanh cổ tay (nhịp trượng, nâng nhẹ), cẳng tay không buông bên hông, đầu;
 * chỗ thủ bản che tay áo được chép vân tay áo bên kia, chỗ cẳng tay che vạt áo được chép vân vạt áo cạnh đó. Hệ tọa độ:
 * ảnh đứng 1024×1536.
 */
const DINH_LIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dinh-lien",
  texScale: 0.5,
  foot: { x: 500, y: 1450 },
  height: 1375,
  parts: {
    body: { x: 280, y: 78, w: 433, h: 1380 },
    armR: { x: 314, y: 691, w: 90, h: 203 },
    sword: { x: 614, y: 381, w: 69, h: 318 },
    arm: { x: 614, y: 548, w: 91, h: 117 },
    head: { x: 398, y: 78, w: 171, h: 209 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 660, y: 580 },
    elbowR: { x: 345, y: 702 },
    neck: { x: 490, y: 270 },
  },
  blade: [{ x: 642, y: 690 }, { x: 658, y: 392 }],
  fxColor: 0x9fe3ff,
  // Đưa tay không ra ngang hông (đánh thường), xòe bàn tay chắn trước ngực, thủ bản ngang thắt lưng (ra chiêu), giơ
  // thủ bản cạnh thái dương và ấn tay về trước trong thế tấn (tuyệt chiêu). Cỡ so theo khoảng mắt tới cằm.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 287, y: 66 },
      anchor: { x: 475, y: 1478 }, scale: 0.97, burst: { x: 810, y: 449 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 209, y: 32 },
      anchor: { x: 470, y: 1505 }, scale: 0.95, burst: { x: 345, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 99, y: 70 },
      anchor: { x: 480, y: 1490 }, scale: 0.97, burst: { x: 752, y: 110 } },
  },
  // Ngồi bệt lệch hông, một tay chống đất, thủ bản rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 43, y: 455 },
    anchor: { x: 560, y: 1262 }, scale: 0.95 },
};

/**
 * Trần Lãm, quân sư hệ Thủy. Bộ tranh Shan gửi 03/11 (nền trong suốt sẵn) theo thiết kế mới RB-008: áo giao lĩnh nâu
 * ôliu, áo khoác cộc nâu, đai chàm, gậy gỗ hai đầu bịt đồng, thay bộ cờ lệnh cũ. Ảnh đứng tách lớp bằng code: bàn tay
 * nắm cùng cây gậy xoay quanh cổ tay (nhịp trượng, nghiêng nhẹ), bàn tay đặt trên đai, đầu; chỗ gậy che tay áo và vạt
 * áo khoác được vá bằng khuếch tán màu xung quanh. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TRAN_LAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "tran-lam",
  texScale: 0.5,
  foot: { x: 495, y: 1512 },
  height: 1495,
  parts: {
    body: { x: 88, y: 19, w: 768, h: 1503 },
    armR: { x: 547, y: 568, w: 178, h: 110 },
    sword: { x: 155, y: 345, w: 58, h: 1172 },
    arm: { x: 134, y: 462, w: 104, h: 109 },
    head: { x: 330, y: 19, w: 240, h: 259 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 160, y: 555 },
    elbowR: { x: 705, y: 605 },
    neck: { x: 470, y: 255 },
  },
  blade: [{ x: 182, y: 1490 }, { x: 188, y: 360 }],
  fxColor: 0x7fcaff,
  // Ghép theo POSE ID của prompt RB-008 v3: thế tấn rộng quét gậy ngang ngực (đánh thường); giơ gậy chéo, tay kia chỉ
  // về trước (ra chiêu); bước tới đâm gậy xuống trước, tay kia nắm trước ngực (tuyệt chiêu). Cỡ so theo bề ngang khăn đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 135, y: 44 },
      anchor: { x: 765, y: 965 }, scale: 1.2, burst: { x: 1395, y: 312 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 38, y: 18 },
      anchor: { x: 510, y: 1500 }, scale: 1.03, burst: { x: 955, y: 455 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 172, y: 11 },
      anchor: { x: 570, y: 1003 }, scale: 1.2, burst: { x: 1245, y: 700 } },
  },
  // Ngồi bệt ngả sang bên, một tay chống đất, gậy rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 36, y: 36 },
    anchor: { x: 750, y: 960 }, scale: 1.1 },
};

/**
 * Ngô Nhật Khánh (Ngô Nam công), quân sư hệ Phong. Bộ tranh Shan gửi 03/11 (nền trong suốt sẵn) theo Master RB-011:
 * áo giao lĩnh tía, áo khoác cộc nâu, khăn vai vàng nghệ, giáo có tua đỏ và cờ nhỏ, kiếm tra vỏ hông trái. Ảnh đứng
 * tách lớp bằng code: bàn tay nắm cùng cây giáo xoay quanh cổ tay, bàn tay đặt trên chuôi kiếm, đầu; chỗ bàn tay che tay
 * áo và chuôi kiếm được vá bằng khuếch tán màu xung quanh. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGO_NHAT_KHANH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ngo-nhat-khanh",
  texScale: 0.5,
  foot: { x: 500, y: 1498 },
  height: 1318,
  parts: {
    body: { x: 223, y: 179, w: 569, h: 1328 },
    armR: { x: 564, y: 706, w: 100, h: 90 },
    sword: { x: 181, y: 17, w: 117, h: 1483 },
    arm: { x: 226, y: 588, w: 79, h: 87 },
    head: { x: 320, y: 179, w: 280, h: 221 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 298, y: 630 },
    elbowR: { x: 650, y: 722 },
    neck: { x: 510, y: 385 },
  },
  blade: [{ x: 266, y: 630 }, { x: 262, y: 30 }],
  fxColor: 0x2e9e90,
  // Theo POSE ID của prompt RB-011: đâm giáo chéo thấp hai tay (đánh thường), giữ giáo dựng, hai ngón tay chỉ đường quân
  // (ra chiêu), bước tới giương giáo chéo cao làm hiệu tập hợp (tuyệt chiêu). Cỡ so theo bề ngang khăn đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 156, y: 36 },
      anchor: { x: 565, y: 995 }, scale: 1.05, burst: { x: 1395, y: 620 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 156, y: 32 },
      anchor: { x: 500, y: 1498 }, scale: 1, burst: { x: 930, y: 348 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 189, y: 29 },
      anchor: { x: 510, y: 1160 }, scale: 1.16, burst: { x: 1185, y: 33 } },
  },
  // Ngồi bệt ngả sang bên, một chân duỗi, giáo rơi nằm chéo trước mặt.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 53, y: 73 },
    anchor: { x: 850, y: 900 }, scale: 1 },
};

/**
 * Phạm Bạch Hổ, tướng sĩ hệ Hỏa. Bộ tranh Shan gửi 03/11 (nền trong suốt sẵn) theo RB-009: áo khoác cộc đỏ nâu, giáp
 * vảy, đai da và dải đỏ, đao một lưỡi cầm buông bên phải, thay bộ áo choàng lông hổ cũ. Ảnh đứng tách lớp bằng code:
 * cẳng tay cùng thanh đao xoay quanh chỗ cắt dưới khuỷu (cẳng tay không chồng lên thân nên không cần vá), bàn tay đặt
 * trên đai (vá bằng khuếch tán màu), đầu. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const PHAM_BACH_HO: WarriorRig = {
  skeleton: "warrior",
  dir: "pham-bach-ho",
  texScale: 0.5,
  foot: { x: 525, y: 1465 },
  height: 1387,
  parts: {
    body: { x: 257, y: 78, w: 547, h: 1392 },
    armR: { x: 577, y: 607, w: 117, h: 119 },
    sword: { x: 44, y: 880, w: 272, h: 434 },
    arm: { x: 225, y: 664, w: 116, h: 216 },
    head: { x: 400, y: 78, w: 220, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 300, y: 668 },
    elbowR: { x: 685, y: 630 },
    neck: { x: 515, y: 305 },
  },
  blade: [{ x: 265, y: 870 }, { x: 50, y: 1305 }],
  fxColor: 0xff913f,
  // Theo thứ tự khung của prompt RB-009: chém ngang ngang ngực (đánh thường), bước tới chém chéo xuống, tay kia mở ra sau
  // (ra chiêu), sải bước giơ đao qua vai phải (tuyệt chiêu). Cỡ so theo chiều cao đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 268, y: 25 },
      anchor: { x: 610, y: 1075 }, scale: 1, burst: { x: 1360, y: 356 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 274, y: 37 },
      anchor: { x: 650, y: 975 }, scale: 1, burst: { x: 1274, y: 802 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 97, y: 67 },
      anchor: { x: 510, y: 1380 }, scale: 1, burst: { x: 667, y: 73 } },
  },
  // Ngồi ngả nghiêng, một tay chống đất, đao rơi bên cạnh.
  down: { name: "pose-down", texScale: 0.3, origin: { x: 18, y: 76 },
    anchor: { x: 800, y: 900 }, scale: 1 },
};

/**
 * Ngô Xương Xí, sứ quân Bình Kiều, mưu sĩ hệ Kim. Bộ tranh Production vNext Shan gửi 03/11 (nền trong suốt sẵn). Ảnh
 * đứng tách lớp bằng code: quạt lông trắng cùng cán xoay quanh cổ tay phải, nắm tay cầm cán tách riêng, bàn tay trái đè
 * khóa đai tách riêng; chỗ quạt che vạt áo vá theo cột nếp vải. Tranh chỉnh mép áo choàng làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGO_XUONG_XI: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "ngo-xuong-xi",
  texScale: 0.5,
  foot: { x: 480, y: 1480 },
  height: 1393,
  parts: {
    body: { x: 219, y: 87, w: 584, h: 1403 },
    armR: { x: 553, y: 597, w: 99, h: 79 },
    sword: { x: 205, y: 777, w: 257, h: 273 },
    arm: { x: 211, y: 762, w: 125, h: 124 },
    head: { x: 434, y: 87, w: 176, h: 225 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 770 },
    elbowR: { x: 640, y: 625 },
    neck: { x: 520, y: 295 },
  },
  blade: [{ x: 262, y: 770 }, { x: 420, y: 980 }],
  fxColor: 0xf1d28c,
  // Quạt lông vạch cung chéo ngắn trước bụng (đánh thường), giữ quạt sát ngực ra hiệu hai ngón (ra chiêu), đặt quạt
  // ngang ngực như một lằn ranh, tay trái đè khóa đai (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 198, y: 71 },
      anchor: { x: 550, y: 1478 }, scale: 0.99, burst: { x: 560, y: 560 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 267, y: 69 },
      anchor: { x: 465, y: 1485 }, scale: 0.99, burst: { x: 560, y: 415 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 180, y: 74 },
      anchor: { x: 465, y: 1480 }, scale: 0.99, burst: { x: 700, y: 500 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 49, y: 130 },
    anchor: { x: 850, y: 900 }, scale: 1 },
};

/**
 * Kiều Công Hãn, sứ quân Phong Châu, pháp sư hệ Lôi. Bộ tranh Shan gửi 03/11 (nền đã trong suốt, RB-013 Production
 * v2): ảnh đứng tách lớp bằng code. Quyền trượng cùng nắm tay phải xoay quanh cổ tay (ống tay và vạt áo sau cán vá
 * lại), bàn tay trái đặt trên chuôi kiếm là lớp tay không. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_CONG_HAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "kieu-cong-han",
  texScale: 0.5,
  foot: { x: 490, y: 1500 },
  height: 1455,
  parts: {
    body: { x: 125, y: 37, w: 817, h: 1470 },
    armR: { x: 588, y: 628, w: 109, h: 95 },
    sword: { x: 108, y: 25, w: 175, h: 1470 },
    arm: { x: 158, y: 357, w: 76, h: 121 },
    head: { x: 343, y: 37, w: 257, h: 258 },
  },
  cloth: [],
  covers: [],
  // Tay và trượng xoay quanh cổ tay, chỗ ống tay áo che.
  joints: {
    shoulder: { x: 205, y: 465 },
    elbowR: { x: 685, y: 645 },
    neck: { x: 480, y: 280 },
  },
  blade: [{ x: 200, y: 410 }, { x: 194, y: 120 }],
  orb: { x: 194, y: 120 },
  strikeFx: "lightning",
  fxColor: 0xb98cff,
  // Đánh trượng chéo về trước (đánh thường), dựng trượng xòe tay trái (ra chiêu), hai tay nâng trượng qua vai (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 136, y: 23 },
      anchor: { x: 644, y: 990 }, scale: 1.25, burst: { x: 1392, y: 155 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 162, y: 142 },
      anchor: { x: 494, y: 1440 }, scale: 1.05, burst: { x: 787, y: 338 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 88, y: 36 },
      anchor: { x: 488, y: 1480 }, scale: 1.03, burst: { x: 162, y: 112 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 78, y: 165 },
    anchor: { x: 820, y: 860 }, scale: 1.13 },
};

/**
 * Nguyễn Khoan, sứ quân Tam Đái, binh lính hệ Thổ. Bộ tranh Shan gửi 03/11 (nền đã trong suốt): ảnh đứng tách lớp
 * bằng code. Giáo cùng nắm tay xoay quanh cổ tay (cẳng tay sau cán giáo vá lại); khiên mây kèm cẳng tay là lớp tay
 * không, nâng lên khi vào thế và đỡ đòn, vạt áo sau khiên nội suy theo cột. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const NGUYEN_KHOAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nguyen-khoan",
  texScale: 0.5,
  foot: { x: 505, y: 1495 },
  height: 1360,
  parts: {
    body: { x: 202, y: 139, w: 573, h: 1364 },
    armR: { x: 628, y: 524, w: 235, h: 417 },
    sword: { x: 221, y: 35, w: 65, h: 1464 },
    arm: { x: 200, y: 472, w: 74, h: 80 },
    head: { x: 400, y: 139, w: 175, h: 191 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 245, y: 540 },
    elbowR: { x: 640, y: 600 },
    neck: { x: 485, y: 320 },
  },
  blade: [{ x: 243, y: 520 }, { x: 252, y: 40 }],
  shieldRaise: -0.35,
  strikeFx: "earthWard",
  fxColor: 0xa5772f,
  // Đâm giáo qua mép khiên (đánh thường), giơ giáo thủ khiên (ra chiêu), thế tấn thấp giáo chĩa trước (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 89, y: 10 },
      anchor: { x: 575, y: 995 }, scale: 1, burst: { x: 1465, y: 175 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 183, y: 12 },
      anchor: { x: 845, y: 995 }, scale: 1.03, burst: { x: 790, y: 25 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 63, y: 43 },
      anchor: { x: 857, y: 985 }, scale: 0.97, burst: { x: 1300, y: 215 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 45, y: 117 },
    anchor: { x: 880, y: 700 }, scale: 0.9 },
};

/**
 * Kiều Thuận, sứ quân Hồi Hồ, y sư hệ Mộc. Bộ tranh Shan gửi 03/11 (nền đã trong suốt, RB-014 Production v2.1):
 * ảnh đứng tách lớp bằng code. Nắm tay phải xoay quanh cổ tay, bầu thuốc treo dây lắc quanh nắm tay (vạt áo sau
 * bầu vá bằng vân vải lấy từ dải áo ngay dưới); bàn tay trái chống hông là lớp tay không. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const KIEU_THUAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 372, y: 700 },
  dir: "kieu-thuan",
  texScale: 0.5,
  foot: { x: 500, y: 1490 },
  height: 1436,
  parts: {
    body: { x: 222, y: 54, w: 588, h: 1438 },
    armR: { x: 602, y: 558, w: 101, h: 77 },
    sword: { x: 273, y: 694, w: 125, h: 203 },
    arm: { x: 292, y: 613, w: 105, h: 93 },
    head: { x: 386, y: 54, w: 200, h: 211 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 305, y: 630 },
    elbowR: { x: 695, y: 580 },
    neck: { x: 490, y: 250 },
  },
  blade: [{ x: 372, y: 700 }, { x: 335, y: 890 }],
  strikeFx: "leafBloom",
  fxColor: 0x4f9a4a,
  // Rút kiếm ngắn phản đòn (đánh thường), tấn thấp đưa bầu thuốc tới người bị thương (ra chiêu), áp bầu lên ngực mở tay về đồng minh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 469, y: 22 },
      anchor: { x: 768, y: 985 }, scale: 1.25, burst: { x: 1000, y: 245 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 134, y: 56 },
      anchor: { x: 544, y: 975 }, scale: 1, burst: { x: 1275, y: 538 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 352, y: 20 },
      anchor: { x: 606, y: 1050 }, scale: 1.28, burst: { x: 1100, y: 212 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 54, y: 124 },
    anchor: { x: 870, y: 790 }, scale: 1.1 },
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
    // Ra chiêu: tranh Shan gửi 03/11, giơ khiên mây chắn trước, giáo chúc xuống (cỡ so theo đầu).
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 14, y: 1 },
      anchor: { x: 625, y: 1255 }, scale: 1, burst: { x: 1060, y: 250 } },
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
 * Chu Ngân, pháp sư hệ Kim (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 24/10: áo trắng vàng viền bạc, trượng vàng cầu pha lê treo ba chuông và ống kim. Ảnh đứng tách lớp bằng code: trượng
 * cùng nắm tay xoay quanh cổ tay, cầu pha lê sáng riêng; bàn tay buông và đầu tách riêng. Phần tóc, ống tay và vạt áo
 * sau trượng vá bằng nội suy ngang. Tranh đứng xem thẻ bạc làm tranh phong thái. Tranh nhiều chi tiết nên tư thế co
 * 0,34 lần để giữ ngân sách. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const CHU_NGAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "chu-ngan",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1350,
  parts: {
    body: { x: 34, y: 179, w: 950, h: 1344 },
    armR: { x: 722, y: 845, w: 76, h: 116 },
    sword: { x: 288, y: 17, w: 134, h: 1484 },
    arm: { x: 318, y: 490, w: 80, h: 86 },
    head: { x: 440, y: 179, w: 226, h: 206 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 358, y: 530 },
    elbowR: { x: 765, y: 860 },
    neck: { x: 560, y: 370 },
  },
  blade: [{ x: 358, y: 530 }, { x: 355, y: 75 }],
  orb: { x: 355, y: 75 },
  strikeFx: "needleVolley",
  fxColor: 0x9ea4ad,
  // Chĩa trượng tới (đánh thường), dựng trượng xòe tay (ra chiêu), giơ trượng cao vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.34, origin: { x: 21, y: 17 },
      anchor: { x: 260, y: 935 }, scale: 1, burst: { x: 1450, y: 228 } },
    cast: { name: "pose-cast", texScale: 0.34, origin: { x: 28, y: 12 },
      anchor: { x: 535, y: 1480 }, scale: 1, burst: { x: 985, y: 485 } },
    ultimate: { name: "pose-ultimate", texScale: 0.34, origin: { x: 10, y: 15 },
      anchor: { x: 480, y: 1490 }, scale: 1, burst: { x: 256, y: 64 } },
  },
  down: { name: "pose-down", texScale: 0.34, origin: { x: 11, y: 48 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};

/**
 * Cao Kiên, binh lính hệ Kim (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 25/10:
 * giáp vảy da đinh bạc, dây thừng chéo vai buộc túi vải, khiên mây đinh đồng. Ảnh đứng 1024×1536 tách lớp bằng code:
 * giáo dựng cùng nắm tay xoay quanh cổ tay (cổ tay sau cán vá bằng nội suy ngang), khiên mây nâng lên khi vào thế và đỡ
 * đòn (phần giáp sau khiên vá bằng mảnh giáp bên cạnh), đầu tách riêng. Shan gửi ba tranh động tác nên tranh núp khiên
 * chĩa giáo thấp dùng cho cả ra chiêu và tuyệt chiêu; tranh ngồi lau giáo làm phong thái.
 */
const CAO_KIEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "cao-kien",
  texScale: 0.5,
  foot: { x: 560, y: 1485 },
  height: 1260,
  parts: {
    body: { x: 139, y: 226, w: 754, h: 1264 },
    armR: { x: 621, y: 500, w: 272, h: 366 },
    sword: { x: 137, y: 12, w: 78, h: 1474 },
    arm: { x: 133, y: 438, w: 84, h: 96 },
    head: { x: 430, y: 226, w: 174, h: 172 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 175, y: 500 },
    elbowR: { x: 700, y: 690 },
    neck: { x: 520, y: 385 },
  },
  blade: [{ x: 175, y: 500 }, { x: 175, y: 20 }],
  shieldRaise: -0.35,
  strikeFx: "steelBulwark",
  fxColor: 0x9ea4ad,
  // Đâm giáo thẳng (đánh thường), núp sau khiên giáo chĩa thấp (ra chiêu và tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 40, y: 10 },
      anchor: { x: 620, y: 870 }, scale: 1.03, burst: { x: 1735, y: 245 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 13, y: 21 },
      anchor: { x: 965, y: 925 }, scale: 1.05, burst: { x: 1400, y: 480 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 21 },
      anchor: { x: 965, y: 925 }, scale: 1.05, burst: { x: 1400, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 60, y: 56 },
    anchor: { x: 1000, y: 870 }, scale: 0.95 },
};

/**
 * Trần Ngọc (tên cũ Châu Ngọc), y sư hệ Kim (tướng cửa hàng). Bộ tranh Shan gửi 25/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng
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
 * Tô Kim, mưu sĩ hệ Kim (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn): quạt xếp nan sắt
 * có tua, cân đồng và túi tiền đeo hông. Ảnh đứng tách lớp bằng code: quạt cùng tua và nắm tay phẩy quanh cổ tay, phần
 * áo sau quạt vá bằng chép tiếp dải viền vòng tròn theo chu kỳ hoa văn; bàn tay chống hông xoay quanh cổ tay, đầu tách
 * riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const TO_KIM: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "to-kim",
  texScale: 0.5,
  foot: { x: 460, y: 1525 },
  height: 1514,
  parts: {
    body: { x: 36, y: 11, w: 772, h: 1520 },
    armR: { x: 533, y: 573, w: 138, h: 88 },
    sword: { x: 37, y: 408, w: 386, h: 428 },
    arm: { x: 189, y: 625, w: 94, h: 72 },
    head: { x: 408, y: 11, w: 190, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 665 },
    elbowR: { x: 650, y: 600 },
    neck: { x: 515, y: 235 },
  },
  blade: [{ x: 240, y: 660 }, { x: 250, y: 420 }],
  strikeFx: "coinScatter",
  fxColor: 0x9ea4ad,
  // Bước tới vung quạt xòe về phía đối thủ (đánh thường), chĩa quạt gấp, tay kia bắt ấn hai ngón (ra chiêu), tấn rộng giơ
  // quạt cao, tay kia xòe về phía đối thủ (tuyệt chiêu). Cỡ tranh ngang ảnh đứng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 17 },
      anchor: { x: 470, y: 1520 }, scale: 1, burst: { x: 900, y: 260 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 157, y: 9 },
      anchor: { x: 465, y: 1527 }, scale: 1, burst: { x: 985, y: 390 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 9, y: 8 },
      anchor: { x: 465, y: 1528 }, scale: 1, burst: { x: 1000, y: 430 } },
  },
  // Ngồi bệt tựa tay lên gối, quạt rơi bên tay, túi tiền đổ ra vài đồng.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 52, y: 23 },
    anchor: { x: 640, y: 900 }, scale: 1 },
};

/**
 * Nghiêm Thiết, quân sư hệ Kim (tướng cửa hàng). Bộ tranh Shan vẽ lại gửi 03/11 (RB-025; nền trong suốt sẵn, riêng tranh
 * gục nền đen đã tách). Ảnh đứng tách lớp bằng code: cờ lệnh cùng nắm tay phải xoay quanh chỗ cầm theo nhịp giáo, bàn tay
 * trái ôm bó thẻ tre xoay quanh khuỷu, đầu kèm dải buộc tóc tách riêng (vải cờ dưới dải tóc đã vá). Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const NGHIEM_THIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "nghiem-thiet",
  texScale: 0.5,
  foot: { x: 545, y: 1505 },
  height: 1380,
  parts: {
    body: { x: 191, y: 166, w: 774, h: 1358 },
    armR: { x: 590, y: 510, w: 197, h: 222 },
    sword: { x: 152, y: 2, w: 408, h: 1438 },
    arm: { x: 192, y: 447, w: 75, h: 98 },
    head: { x: 401, y: 166, w: 210, h: 191 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 232, y: 495 },
    elbowR: { x: 775, y: 668 },
    neck: { x: 548, y: 340 },
  },
  blade: [{ x: 232, y: 495 }, { x: 180, y: 20 }],
  strikeFx: "ironFormation",
  fxColor: 0x9ea4ad,
  // Phất cờ ngang hông (đánh thường), dựng cờ giơ thẻ tre hô hiệu lệnh (ra chiêu), cờ chéo, thẻ tre vạch thế trận
  // (tuyệt chiêu). Cỡ so theo đầu với ảnh đứng.
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 14, y: 73 },
      anchor: { x: 570, y: 1495 }, scale: 0.95, burst: { x: 760, y: 760 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 45, y: 4 },
      anchor: { x: 490, y: 1515 }, scale: 1, burst: { x: 900, y: 555 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 20, y: 14 },
      anchor: { x: 545, y: 1505 }, scale: 1, burst: { x: 950, y: 560 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 39, y: 10 },
    anchor: { x: 760, y: 1012 }, scale: 0.85 },
};

/**
 * Lâm Tùng, tướng sĩ hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh lá, giáp mây bện cánh sen, côn gỗ lim bịt đồng (đổi nhịp vũ khí từ kiếm sang trượng). Ảnh đứng tách
 * lớp bằng code: côn cùng nắm tay phải xoay quanh cổ tay, bàn tay trái buông, đầu kèm khăn xanh. Phần ống tay sau côn
 * được vá. Tranh ngồi gốc cây gài nhành tùng làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LAM_TUNG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "lam-tung",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1504,
  parts: {
    body: { x: 202, y: 11, w: 538, h: 1504 },
    armR: { x: 661, y: 772, w: 90, h: 130 },
    sword: { x: 238, y: 234, w: 42, h: 1272 },
    arm: { x: 203, y: 588, w: 96, h: 94 },
    head: { x: 357, y: 11, w: 228, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 258, y: 600 },
    elbowR: { x: 700, y: 780 },
    neck: { x: 520, y: 225 },
  },
  blade: [{ x: 258, y: 620 }, { x: 258, y: 240 }],
  strikeFx: "bambooSap",
  fxColor: 0x4f9a4a,
  // Đâm côn thẳng (đánh thường), dựng côn trước ngực (ra chiêu), giơ côn ngang qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 26, y: 16 },
      anchor: { x: 505, y: 975 }, scale: 1, burst: { x: 1495, y: 370 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 95, y: 15 },
      anchor: { x: 530, y: 1495 }, scale: 1, burst: { x: 515, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 46, y: 94 },
      anchor: { x: 515, y: 1470 }, scale: 1.05, burst: { x: 960, y: 110 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 39, y: 18 },
    anchor: { x: 780, y: 900 }, scale: 1 },
};

/**
 * Đàm Thảo, pháp sư hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh rêu thêu bông lau, tóc tết dài, gậy cành chạc buộc nhành lá. Ảnh đứng tách lớp bằng code: gậy cùng
 * nắm tay xoay quanh cổ tay, nhành lá ở chạc gậy sáng như cầu ngọc; bàn tay cầm bím tóc và đầu tách riêng (chỗ bàn
 * tay che bím tóc vá bằng khuếch tán màu). Tranh đứng ngắm nhành lá làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DAM_THAO: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "dam-thao",
  texScale: 0.5,
  foot: { x: 420, y: 1500 },
  height: 1500,
  parts: {
    body: { x: 225, y: 9, w: 538, h: 1522 },
    armR: { x: 528, y: 448, w: 96, h: 102 },
    sword: { x: 100, y: 305, w: 142, h: 1222 },
    arm: { x: 171, y: 490, w: 92, h: 142 },
    head: { x: 403, y: 9, w: 236, h: 246 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 210, y: 545 },
    elbowR: { x: 600, y: 520 },
    neck: { x: 520, y: 240 },
  },
  blade: [{ x: 210, y: 545 }, { x: 210, y: 330 }],
  orb: { x: 210, y: 330 },
  strikeFx: "thornBind",
  fxColor: 0x4f9a4a,
  // Đâm gậy thẳng về phía đối thủ (đánh thường), chống gậy xòe tay gọi rừng (ra chiêu), giơ gậy vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 35, y: 10 },
      anchor: { x: 540, y: 985 }, scale: 1, burst: { x: 1495, y: 340 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 55, y: 15 },
      anchor: { x: 420, y: 1495 }, scale: 1, burst: { x: 909, y: 192 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 32, y: 9 },
      anchor: { x: 480, y: 1495 }, scale: 1, burst: { x: 717, y: 38 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 83, y: 28 },
    anchor: { x: 760, y: 900 }, scale: 1 },
};

/**
 * Hoàng Mộc, binh lính hệ Mộc (tướng cửa hàng). Bộ tranh Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 10/11: giáp đan cói
 * xanh, băng đô lá, nón lá đeo lưng, giỏ ống cơm lam, gậy sắt đốt tre vác vai thay liềm và khiên. Ảnh đứng 1024×1536 tách
 * lớp bằng code: gậy sắt cùng nắm tay xoay quanh cổ tay (chỗ gậy đè vai và cổ vá bằng nội suy theo pháp tuyến và khuếch
 * tán màu da), bàn tay chống hông và đầu tách riêng. Tranh ngồi thuyền ăn cơm lam làm phong thái.
 */
const HOANG_MOC: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "hoang-moc",
  texScale: 0.5,
  foot: { x: 470, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 208, y: 13, w: 572, h: 1514 },
    armR: { x: 690, y: 515, w: 74, h: 84 },
    sword: { x: 204, y: 82, w: 638, h: 278 },
    arm: { x: 236, y: 261, w: 104, h: 98 },
    head: { x: 318, y: 13, w: 288, h: 210 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 275, y: 345 },
    elbowR: { x: 750, y: 560 },
    neck: { x: 480, y: 210 },
  },
  blade: [{ x: 300, y: 320 }, { x: 830, y: 95 }],
  strikeFx: "rootGuard",
  fxColor: 0x4f9a4a,
  // Lao tới đâm gậy (đánh thường), hai tay ngang gậy thủ thế (ra chiêu), giơ gậy qua đầu xòe tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 34, y: 10 },
      anchor: { x: 430, y: 975 }, scale: 1.1, burst: { x: 1500, y: 265 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 61, y: 13 },
      anchor: { x: 470, y: 1500 }, scale: 1, burst: { x: 975, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 35, y: 45 },
      anchor: { x: 470, y: 1490 }, scale: 1.1, burst: { x: 100, y: 45 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 62, y: 21 },
    anchor: { x: 900, y: 950 }, scale: 1 },
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
 * Nhan Trúc, mưu sĩ hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 25/10: áo xanh rêu thêu lá trúc và mặt trời, bó thẻ tre đeo lưng, trâm đồng, bút lông cán sắt thay quạt nan. Ảnh đứng
 * 1024×1536 tách lớp bằng code: bút cùng nắm tay xoay quanh cổ tay (vạt áo sau cán vá theo cột, sau nắm tay vá khuếch
 * tán), bình mực treo thắt lưng đung đưa làm lớp tay không, đầu tách riêng. Tranh ghi sổ bên ngựa thồ lương làm phong
 * thái.
 */
const NHAN_TRUC: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  raise: -0.04,
  dir: "nhan-truc",
  texScale: 0.5,
  foot: { x: 490, y: 1532 },
  height: 1530,
  parts: {
    body: { x: 234, y: 2, w: 500, h: 1532 },
    armR: { x: 606, y: 662, w: 74, h: 110 },
    sword: { x: 355, y: 575, w: 406, h: 212 },
    arm: { x: 450, y: 574, w: 144, h: 80 },
    head: { x: 470, y: 2, w: 156, h: 328 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 470, y: 612 },
    elbowR: { x: 646, y: 668 },
    neck: { x: 545, y: 318 },
  },
  blade: [{ x: 590, y: 615 }, { x: 755, y: 576 }],
  strikeFx: "poisonMist",
  fxColor: 0x4f9a4a,
  // Tấn rộng đâm bút ra trước (đánh thường), dựng bút cạnh vai, tay kia đẩy chưởng (ra chiêu), vung bút qua đầu, tay
  // kia xòe ra (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 128, y: 3 },
      anchor: { x: 560, y: 1018 }, scale: 1, burst: { x: 1460, y: 238 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 150, y: 3 },
      anchor: { x: 500, y: 1531 }, scale: 1, burst: { x: 920, y: 440 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 20 },
      anchor: { x: 480, y: 1534 }, scale: 1, burst: { x: 900, y: 445 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 36, y: 10 },
    anchor: { x: 760, y: 990 }, scale: 1 },
};

/**
 * Sầm Tuệ, quân sư hệ Mộc (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: áo lục thêu sen vàng, tóc búi điểm bạc, cờ lệnh đuôi én trên cán trúc mũi giáo, ống thẻ tre. Ảnh đứng 1024×1536
 * tách lớp bằng code: cán cờ cùng lá cờ và nắm tay xoay quanh cổ tay theo nhịp giáo (vạt váy sau cán vá theo hàng),
 * bàn tay ôm ống thẻ tre và đầu tách riêng. Tranh quỳ gối nghe ngóng làm phong thái.
 */
const SAM_TUE: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "sam-tue",
  texScale: 0.5,
  foot: { x: 630, y: 1520 },
  height: 1320,
  parts: {
    body: { x: 349, y: 202, w: 538, h: 1332 },
    armR: { x: 655, y: 540, w: 122, h: 202 },
    sword: { x: 24, y: 7, w: 396, h: 1516 },
    arm: { x: 332, y: 488, w: 68, h: 106 },
    head: { x: 497, y: 202, w: 208, h: 196 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 390, y: 578 },
    elbowR: { x: 745, y: 680 },
    neck: { x: 610, y: 385 },
  },
  blade: [{ x: 372, y: 600 }, { x: 318, y: 10 }],
  strikeFx: "groveWard",
  fxColor: 0x4f9a4a,
  // Tấn thấp đâm cờ giáo, lá cờ bay sau lưng (đánh thường), giơ cao cờ lệnh tay kia chỉ hướng (ra chiêu), đâm thẳng cờ
  // giáo lá cờ bay phía trước (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 37, y: 73 },
      anchor: { x: 740, y: 968 }, scale: 1.07, burst: { x: 1490, y: 432 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 28, y: 10 },
      anchor: { x: 520, y: 1530 }, scale: 1.03, burst: { x: 990, y: 515 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 24, y: 42 },
      anchor: { x: 560, y: 985 }, scale: 1.07, burst: { x: 1500, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 74, y: 25 },
    anchor: { x: 520, y: 900 }, scale: 1.05 },
};

/**
 * Hồ Lãng, tướng sĩ hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 26/10: áo xanh sẫm vân sông, giáp da tán đinh, đinh ba đồng và lưới chài đeo hông. Ảnh đứng tách lớp bằng code: đinh
 * ba cùng nắm tay phải xoay quanh cổ tay theo nhịp đẩy giáo, bàn tay trái chống hông, đầu kèm khăn lam. Phần cẳng tay
 * sau cán được vá. Tranh ngồi mũi thuyền vá lưới làm tranh phong thái. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ho-lang",
  texScale: 0.5,
  foot: { x: 520, y: 1480 },
  height: 1385,
  parts: {
    body: { x: 222, y: 105, w: 608, h: 1386 },
    armR: { x: 568, y: 628, w: 122, h: 96 },
    sword: { x: 184, y: 10, w: 184, h: 1480 },
    arm: { x: 235, y: 380, w: 82, h: 84 },
    head: { x: 362, y: 105, w: 280, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 280, y: 440 },
    elbowR: { x: 680, y: 660 },
    neck: { x: 540, y: 320 },
  },
  blade: [{ x: 280, y: 440 }, { x: 278, y: 30 }],
  strikeFx: "frostSpear",
  fxColor: 0x2f7fc1,
  // Đâm đinh ba ngang tầm ngực (đánh thường), quăng lưới chài (ra chiêu), giơ đinh ba chỉ trời vươn tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 59, y: 95 },
      anchor: { x: 550, y: 935 }, scale: 1, burst: { x: 1495, y: 360 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 33, y: 33 },
      anchor: { x: 455, y: 1470 }, scale: 0.87, burst: { x: 880, y: 700 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 9 },
      anchor: { x: 487, y: 1478 }, scale: 1, burst: { x: 487, y: 64 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 50, y: 99 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};

/**
 * Kha Sơn, tướng sĩ hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 28/10:
 * đầu cạo trọc, áo nâu giáp vảy vuông, phủ việt lưỡi rìu đồng khắc mặt trời và mây. Ảnh đứng 1024×1536 tách lớp bằng
 * code: phủ việt dựng cùng nắm tay xoay quanh cổ tay theo nhịp bổ (tay áo sau cán vá bằng phản chiếu, vạt áo bằng nội suy
 * ngang), bàn tay buông và đầu tách riêng. Tranh hai tay ghì cán đứng làm phong thái.
 */
const KHA_SON: WarriorRig = {
  skeleton: "warrior",
  // Phủ việt cán dài dựng đứng: đi nhịp vũ khí cán dài để lúc đỡ đòn, được khiên, được tăng, chiến thắng chỉ nghiêng nhẹ,
  // không lật cả cán quanh cổ tay như kiếm.
  weapon: "spear",
  dir: "kha-son",
  texScale: 0.5,
  foot: { x: 470, y: 1510 },
  height: 1410,
  parts: {
    body: { x: 177, y: 103, w: 662, h: 1424 },
    armR: { x: 745, y: 772, w: 102, h: 164 },
    sword: { x: 94, y: 11, w: 220, h: 1506 },
    arm: { x: 238, y: 432, w: 94, h: 84 },
    head: { x: 420, y: 103, w: 220, h: 228 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 470 },
    elbowR: { x: 800, y: 790 },
    neck: { x: 520, y: 320 },
  },
  blade: [{ x: 290, y: 470 }, { x: 290, y: 20 }],
  strikeFx: "mountainCrush",
  fxColor: 0xc8963c,
  // Tấn ngang đẩy phủ việt (đánh thường), ngồi tấn ghì cán dựng (ra chiêu), vặn người bổ phủ việt chéo xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 19 },
      anchor: { x: 780, y: 990 }, scale: 1.25, burst: { x: 1440, y: 435 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 33, y: 43 },
      anchor: { x: 500, y: 1390 }, scale: 1.05, burst: { x: 440, y: 70 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 16, y: 39 },
      anchor: { x: 740, y: 1000 }, scale: 1.2, burst: { x: 1450, y: 700 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 43, y: 32 },
    anchor: { x: 900, y: 950 }, scale: 1 },
};

/**
 * Thái Hà, binh lính hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 10/11: chùy gai cán gỗ vác vai, lưới đánh cá và cuộn thừng vắt vai, áo chàm thêu sóng. Ảnh đứng 1024×1536 tách lớp
 * bằng code: chùy cùng nắm tay xoay quanh cổ tay (đoạn cán sau gáy che bằng lớp cổ áo tĩnh), bàn tay giữ thừng là tay
 * không, đầu tách riêng. Tranh ngồi vá lưới làm phong thái.
 */
const THAI_HA: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  raise: -0.05,
  dir: "thai-ha",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 205, y: 9, w: 646, h: 1518 },
    armR: { x: 645, y: 355, w: 102, h: 116 },
    sword: { x: 84, y: 144, w: 774, h: 204 },
    arm: { x: 258, y: 241, w: 112, h: 92 },
    head: { x: 384, y: 9, w: 246, h: 226 },
  },
  cloth: [],
  covers: [{ name: "collar", box: { x: 452, y: 209, w: 158, h: 74 } }],
  joints: {
    shoulder: { x: 318, y: 318 },
    elbowR: { x: 695, y: 412 },
    neck: { x: 510, y: 215 },
  },
  blade: [{ x: 318, y: 300 }, { x: 795, y: 205 }],
  strikeFx: "tideBulwark",
  fxColor: 0x2f7fc1,
  // Lao chùy ngang (đánh thường), dựng chùy trước ngực (ra chiêu), giơ chùy qua đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 143, y: 10 },
      anchor: { x: 660, y: 1005 }, scale: 1.18, burst: { x: 1330, y: 490 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 204, y: 10 },
      anchor: { x: 500, y: 1515 }, scale: 1, burst: { x: 645, y: 140 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 39, y: 9 },
      anchor: { x: 520, y: 1515 }, scale: 0.95, burst: { x: 110, y: 60 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 11 },
    anchor: { x: 760, y: 990 }, scale: 1.15 },
};

/**
 * Mai Thanh, y sư hệ Thủy (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11/2026 (ảnh chuẩn, nền trong suốt;
 * prompt ở docs/06-art/prompts/mai-thanh.md). Ảnh đứng tách lớp bằng code: hồ lô men xanh lắc quanh nắm tay, nắm tay
 * xoay quanh cổ tay; bàn tay buông và đầu tách riêng; thân đã xóa hồ lô, nắm tay và bàn tay rồi vá phần vải phía sau.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const MAI_THANH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 262, y: 790 },
  dir: "mai-thanh",
  texScale: 0.5,
  foot: { x: 445, y: 1528 },
  height: 1520,
  parts: {
    body: { x: 234, y: 7, w: 568, h: 1524 },
    armR: { x: 582, y: 652, w: 76, h: 108 },
    sword: { x: 170, y: 780, w: 152, h: 330 },
    arm: { x: 229, y: 728, w: 70, h: 100 },
    head: { x: 372, y: 7, w: 234, h: 242 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 266, y: 742 },
    elbowR: { x: 628, y: 656 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 262, y: 790 }, { x: 258, y: 1108 }],
  strikeFx: "springDew",
  fxColor: 0x2f7fc1,
  // Bước tới đẩy chưởng, hồ lô đung đưa sau lưng (đánh thường), nâng hồ lô hai tay trước ngực (ra chiêu), giơ cao hồ lô
  // một tay, tay kia ngửa ra trao (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 16, y: 15 },
      anchor: { x: 465, y: 1520 }, scale: 1, burst: { x: 940, y: 330 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 197, y: 9 },
      anchor: { x: 441, y: 1530 }, scale: 1, burst: { x: 712, y: 190 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 50, y: 16 },
      anchor: { x: 467, y: 1525 }, scale: 1, burst: { x: 225, y: 260 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 65, y: 29 },
    anchor: { x: 760, y: 970 }, scale: 0.9 },
};

/**
 * Quách Ẩn, mưu sĩ hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: ông lão chài áo chàm thêu mặt trời, nón lá và cần câu đeo lưng, trường kiếm chuôi rồng ngọc thay quạt giấy. Ảnh
 * đứng 1024×1536 tách lớp bằng code: kiếm chống đất cùng hai bàn tay chồng trên chuôi nghiêng quanh chuôi kiếm (vạt áo
 * và ống quần sau kiếm vá theo hàng), phao câu treo dây đung đưa làm lớp tay không, đầu tách riêng. Tranh ngồi đá câu
 * cá làm phong thái.
 */
const QUACH_AN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  raise: -0.03,
  dir: "quach-an",
  texScale: 0.5,
  foot: { x: 500, y: 1519 },
  height: 1503,
  parts: {
    body: { x: 226, y: 16, w: 508, h: 1504 },
    armR: { x: 252, y: 150, w: 18, h: 84 },
    sword: { x: 544, y: 626, w: 142, h: 894 },
    arm: { x: 528, y: 532, w: 156, h: 118 },
    head: { x: 470, y: 70, w: 160, h: 260 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 604, y: 630 },
    elbowR: { x: 262, y: 153 },
    neck: { x: 560, y: 320 },
  },
  blade: [{ x: 606, y: 660 }, { x: 622, y: 1500 }],
  strikeFx: "tideMist",
  fxColor: 0x2f7fc1,
  // Lao tới đâm kiếm (đánh thường), dựng kiếm trước mặt, tay kia đưa ngang (ra chiêu), tấn rộng kéo kiếm ngang hông,
  // tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 34, y: 8 },
      anchor: { x: 560, y: 1009 }, scale: 1, burst: { x: 1500, y: 355 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 111, y: 8 },
      anchor: { x: 440, y: 1527 }, scale: 1, burst: { x: 960, y: 430 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 65, y: 11 },
      anchor: { x: 640, y: 1012 }, scale: 1, burst: { x: 1330, y: 520 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 10, y: 14 },
    anchor: { x: 760, y: 1000 }, scale: 0.95 },
};

/**
 * Vi Triều, quân sư hệ Thủy (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 26/10: áo chàm thêu sao vàng, tóc búi khăn xanh, giáo trắng hai móc lưỡi liềm xanh, túi gấm đeo hông, dép cỏ. Ảnh đứng
 * 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay theo nhịp giáo (cán nằm ngoài thân nên không cần vá),
 * bàn tay buông và đầu tách riêng. Tranh ngồi trên tảng đá đặt giáo ngang gối làm phong thái.
 */
const VI_TRIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "vi-trieu",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1425,
  parts: {
    body: { x: 239, y: 85, w: 526, h: 1424 },
    armR: { x: 667, y: 719, w: 64, h: 160 },
    sword: { x: 242, y: 72, w: 86, h: 1410 },
    arm: { x: 229, y: 441, w: 72, h: 106 },
    head: { x: 361, y: 85, w: 240, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 500 },
    elbowR: { x: 700, y: 725 },
    neck: { x: 490, y: 300 },
  },
  blade: [{ x: 266, y: 500 }, { x: 266, y: 80 }],
  strikeFx: "tideSiege",
  fxColor: 0x2f7fc1,
  // Tấn thấp đâm giáo ngang (đánh thường), dựng giáo tay kia đẩy chưởng ra lệnh (ra chiêu), hét lớn đâm chếch giáo
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 30, y: 85 },
      anchor: { x: 520, y: 950 }, scale: 0.93, burst: { x: 1480, y: 410 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 130, y: 13 },
      anchor: { x: 430, y: 1500 }, scale: 1.05, burst: { x: 950, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 32, y: 36 },
      anchor: { x: 560, y: 955 }, scale: 0.93, burst: { x: 1460, y: 335 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 26, y: 26 },
    anchor: { x: 620, y: 925 }, scale: 0.95 },
};

/**
 * Hà Vân, pháp sư hệ Hỏa (tướng khởi đầu). Bộ tranh phong cách mới Shan gửi 09/11/2026 (ảnh chuẩn, nền trong suốt). Ảnh đứng
 * tách lớp bằng code: trượng ngắn và nắm tay xoay quanh cổ tay, cầu lửa sáng riêng; bàn tay buông và đầu tách riêng;
 * thân đã xóa trượng, tay và dải lụa rồi vá lại phần vải phía sau; dải lụa đỏ trên tóc là lớp riêng bay theo gió.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HA_VAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "ha-van",
  texScale: 0.5,
  foot: { x: 494, y: 1535 },
  height: 1530,
  parts: {
    body: { x: 214, y: 0, w: 563, h: 1536 },
    armR: { x: 669, y: 745, w: 61, h: 140 },
    sword: { x: 198, y: 304, w: 95, h: 447 },
    arm: { x: 204, y: 561, w: 75, h: 84 },
    head: { x: 378, y: 0, w: 211, h: 235 },
  },
  cloth: [
    { name: "ribbon", box: { x: 288, y: 62, w: 147, h: 369 }, behind: true,
      wind: { axis: "y", start: 0.12, amp: 9, freq: 1.5, k: 3.4, phase: 0.5 } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 242, y: 603 },
    elbowR: { x: 700, y: 748 },
    neck: { x: 525, y: 230 },
  },
  blade: [{ x: 242, y: 610 }, { x: 240, y: 365 }],
  orb: { x: 240, y: 365 },
  strikeFx: "fireRain",
  fxColor: 0xd9502a,
  // Chĩa trượng cầu lửa tới (đánh thường), hạ trượng xòe tay (ra chiêu), giơ cao trượng chỉ tay gọi mưa lửa (tuyệt chiêu).
  poses: {
    // Tranh gốc quay mặt sang trái; đã lật ngang tệp để nhân vật phe trái chĩa trượng về phía đối thủ (tọa độ 1024 - x).
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 45, y: 130 },
      anchor: { x: 514, y: 1444 }, scale: 1, burst: { x: 959, y: 300 } },
    // Đã lật ngang tệp để bàn tay xòe hướng về phía đối thủ (tọa độ 1024 - x cũ).
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 214, y: 1 },
      anchor: { x: 531, y: 1533 }, scale: 1, burst: { x: 809, y: 400 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 43, y: 7 },
      anchor: { x: 473, y: 1527 }, scale: 1, burst: { x: 990, y: 345 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 32, y: 208 },
    anchor: { x: 770, y: 941 }, scale: 0.85 },
};

/**
 * Tôn Diệm, quân sư hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 28/10: áo đỏ thêu mặt trời, đai cam, vạch sơn đỏ trên má, trâm hạt đỏ cài búi, giáo cán đỏ rồng đồng quấn cổ và bó
 * thẻ tre đeo hông. Ảnh đứng 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay theo nhịp giáo (cán nằm
 * ngoài thân nên không cần vá), bàn tay đặt trên bó thẻ tre và đầu tách riêng; bỏ lá cờ bay của bộ cũ. Tranh gác chân
 * lên ghế gỗ chống cằm làm phong thái.
 */
const TON_DIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ton-diem",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1415,
  parts: {
    body: { x: 251, y: 97, w: 522, h: 1416 },
    armR: { x: 540, y: 625, w: 166, h: 102 },
    sword: { x: 231, y: 13, w: 100, h: 1484 },
    arm: { x: 238, y: 479, w: 70, h: 74 },
    head: { x: 397, y: 97, w: 214, h: 234 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 296, y: 515 },
    elbowR: { x: 680, y: 665 },
    neck: { x: 540, y: 310 },
  },
  blade: [{ x: 272, y: 520 }, { x: 270, y: 15 }],
  strikeFx: "fireChain",
  fxColor: 0xe0602a,
  // Tấn thấp đâm giáo ngang (đánh thường), dựng giáo tay kia chỉ hướng (ra chiêu), hét lớn hất giáo chếch lên trời
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 30, y: 32 },
      anchor: { x: 560, y: 955 }, scale: 1.18, burst: { x: 1500, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 176, y: 11 },
      anchor: { x: 440, y: 1490 }, scale: 1, burst: { x: 960, y: 290 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 97, y: 11 },
      anchor: { x: 660, y: 985 }, scale: 1.2, burst: { x: 1410, y: 40 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 16, y: 17 },
    anchor: { x: 620, y: 900 }, scale: 1.15 },
};

/**
 * Lý Liệt, tướng sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn), thay bộ
 * 26/10: áo đỏ gạch ba vạch vuốt cam, giáp da tán đinh đồng, đao cán dài buộc dải vải đỏ. Ảnh đứng tách lớp bằng code
 * như Hồ Lãng: đao (cả dải vải) cùng nắm tay phải xoay quanh cổ tay theo nhịp giáo, bàn tay trái chống hông, đầu tách
 * riêng. Phần cẳng tay và hộ uyển sau cán được vá. Tranh vác đao trên vai làm tranh phong thái.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LY_LIET: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ly-liet",
  texScale: 0.5,
  foot: { x: 520, y: 1500 },
  height: 1270,
  parts: {
    body: { x: 263, y: 242, w: 488, h: 1272 },
    armR: { x: 595, y: 685, w: 96, h: 88 },
    sword: { x: 216, y: 7, w: 156, h: 1490 },
    arm: { x: 300, y: 460, w: 72, h: 76 },
    head: { x: 370, y: 242, w: 264, h: 208 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 500 },
    elbowR: { x: 680, y: 700 },
    neck: { x: 500, y: 435 },
  },
  blade: [{ x: 335, y: 500 }, { x: 330, y: 20 }],
  strikeFx: "flameCleave",
  fxColor: 0xd9502a,
  // Tấn rộng đâm đao ngang (đánh thường), hất đao chéo lên (ra chiêu), hai tay giơ đao qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 44, y: 116 },
      anchor: { x: 520, y: 945 }, scale: 1, burst: { x: 1500, y: 420 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 10, y: 159 },
      anchor: { x: 515, y: 1345 }, scale: 1, burst: { x: 990, y: 170 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 12, y: 8 },
      anchor: { x: 480, y: 1495 }, scale: 1, burst: { x: 990, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 36, y: 99 },
    anchor: { x: 760, y: 880 }, scale: 1 },
};

/**
 * Trương Viêm, binh lính hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 10/11: giáp vảy đỏ viền hoa văn, đuốc đeo hông, kích ba mũi cán đồng thay đao và khiên. Ảnh đứng 1024×1536 tách lớp
 * bằng code: kích cùng nắm tay xoay quanh cổ tay (cán nằm ngoài thân nên không cần vá), bàn tay chống hông là tay không,
 * đầu tách riêng. Tranh ngồi khúc gỗ cười lớn làm phong thái.
 */
const TRUONG_VIEM: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "truong-viem",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 252, y: 104, w: 542, h: 1414 },
    armR: { x: 625, y: 595, w: 122, h: 112 },
    sword: { x: 154, y: 10, w: 158, h: 1496 },
    arm: { x: 198, y: 434, w: 70, h: 94 },
    head: { x: 466, y: 104, w: 176, h: 198 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 238, y: 512 },
    elbowR: { x: 685, y: 650 },
    neck: { x: 555, y: 290 },
  },
  blade: [{ x: 232, y: 512 }, { x: 232, y: 30 }],
  strikeFx: "flameWall",
  fxColor: 0xd9502a,
  // Đâm kích thẳng (đánh thường), dựng kích trước ngực (ra chiêu), gầm lên lao kích (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 42, y: 98 },
      anchor: { x: 560, y: 965 }, scale: 1.12, burst: { x: 1500, y: 380 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 155, y: 15 },
      anchor: { x: 505, y: 1515 }, scale: 1.1, burst: { x: 510, y: 60 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 35, y: 41 },
      anchor: { x: 640, y: 1005 }, scale: 0.95, burst: { x: 1500, y: 530 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 42, y: 25 },
    anchor: { x: 860, y: 965 }, scale: 1.05 },
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
 * Ninh Hỏa, mưu sĩ hệ Hỏa (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 03/11: áo choàng đỏ viền răng cưa thêu thành lũy, búi tóc buộc dải đỏ, quạt lông vũ viền vàng có tua đỏ. Ảnh đứng
 * 1024×1536 tách lớp bằng code: quạt cùng nắm tay xoay quanh cổ tay (ngực áo sau quạt vá màu áo, chỉ lộ mép khi quạt
 * nhích), tay trái chắp sau lưng nên lớp tay không là túi gấm treo thắt lưng đung đưa, đầu tách riêng. Tranh nghiêng
 * người che quạt trước miệng làm phong thái.
 */
const NINH_HOA: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  raise: -0.08,
  dir: "ninh-hoa",
  texScale: 0.5,
  foot: { x: 500, y: 1525 },
  height: 1506,
  parts: {
    body: { x: 255, y: 19, w: 496, h: 1508 },
    armR: { x: 596, y: 684, w: 78, h: 108 },
    sword: { x: 308, y: 279, w: 232, h: 448 },
    arm: { x: 338, y: 468, w: 96, h: 86 },
    head: { x: 430, y: 19, w: 196, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 385, y: 505 },
    elbowR: { x: 632, y: 692 },
    neck: { x: 530, y: 250 },
  },
  blade: [{ x: 400, y: 470 }, { x: 425, y: 320 }],
  strikeFx: "granaryBlaze",
  fxColor: 0xe0602a,
  // Tấn rộng, quạt hạ ngang hông, hai ngón chỉ đường (đánh thường), giơ quạt cạnh đầu, tay trái đưa ngang (ra chiêu),
  // quạt che mặt, tay trái úp chưởng ra lệnh đốt kho lương (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 231, y: 4 },
      anchor: { x: 720, y: 1022 }, scale: 1, burst: { x: 1200, y: 180 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 147, y: 12 },
      anchor: { x: 470, y: 1525 }, scale: 1, burst: { x: 940, y: 640 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 174, y: 7 },
      anchor: { x: 465, y: 1527 }, scale: 1, burst: { x: 830, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 69, y: 13 },
    anchor: { x: 760, y: 1000 }, scale: 0.95 },
};

/**
 * Doãn Nham, pháp sư hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ
 * 28/10: áo nâu đất thêu dây leo, khăn cam buộc búi tóc bạc, trượng gỗ buộc đá, chuông đồng đeo cổ tay. Ảnh đứng
 * (1037×1517, giữ khổ) tách lớp bằng code: trượng cùng nắm tay xoay quanh cổ tay, khối đá đầu trượng sáng riêng; bàn
 * tay xòe và đầu tách riêng. Tranh ngồi xổm chống trượng làm tranh phong thái. Tranh ra đòn và tuyệt chiêu vẽ người
 * nhỏ hơn trong khung nên phóng ×1,3 và ×1,25.
 */
const DOAN_NHAM: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "doan-nham",
  texScale: 0.5,
  foot: { x: 540, y: 1490 },
  height: 1480,
  parts: {
    body: { x: 159, y: 13, w: 772, h: 1492 },
    armR: { x: 822, y: 240, w: 166, h: 192 },
    sword: { x: 55, y: 56, w: 148, h: 1438 },
    arm: { x: 81, y: 450, w: 132, h: 122 },
    head: { x: 334, y: 13, w: 276, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 150, y: 510 },
    elbowR: { x: 850, y: 415 },
    neck: { x: 500, y: 250 },
  },
  blade: [{ x: 150, y: 510 }, { x: 115, y: 100 }],
  orb: { x: 115, y: 100 },
  strikeFx: "earthSurge",
  fxColor: 0xd8902e,
  // Chĩa trượng đầu đá ngang về phía đối thủ (đánh thường), chống trượng xòe tay trấn (ra chiêu), tấn thấp kéo đầu đá
  // sát đất (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 89, y: 3 },
      anchor: { x: 540, y: 1125 }, scale: 1.3, burst: { x: 1240, y: 450 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 55, y: 12 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 880, y: 280 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 5 },
      anchor: { x: 585, y: 1140 }, scale: 1.25, burst: { x: 1240, y: 1030 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 31, y: 6 },
    anchor: { x: 760, y: 900 }, scale: 1.15 },
};

/**
 * Lê Thạch, binh lính hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ 09/11:
 * nón lá, áo gi lê xanh rêu thêu hoa văn, khăn đỏ thắt lưng, giáo mũi đồng tua đỏ và khiên mây cài lông trắng. Ảnh đứng
 * 1024×1536 tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay (cán giáo trước vạt áo vá bằng nội suy ngang), khiên
 * mây kèm lông trắng nâng lên khi vào thế và đỡ đòn (vạt áo sau khiên vá bằng mảnh áo bên cạnh), đầu đội nón tách riêng.
 * Tranh quỳ một gối chống giáo làm phong thái.
 */
const LE_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "le-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1505 },
  height: 1420,
  parts: {
    body: { x: 175, y: 87, w: 558, h: 1432 },
    armR: { x: 538, y: 367, w: 354, h: 618 },
    sword: { x: 207, y: 1, w: 78, h: 1504 },
    arm: { x: 180, y: 458, w: 112, h: 136 },
    head: { x: 330, y: 87, w: 300, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 525 },
    elbowR: { x: 640, y: 560 },
    neck: { x: 500, y: 330 },
  },
  blade: [{ x: 250, y: 520 }, { x: 250, y: 15 }],
  shieldRaise: -0.35,
  strikeFx: "tauntRoar",
  fxColor: 0xc8963c,
  // Tấn thấp đâm giáo ngang, khiên đeo lưng (đánh thường), dang chân đẩy khiên ra trước (ra chiêu), lao tới đâm giáo
  // dưới khiên (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 46, y: 42 },
      anchor: { x: 500, y: 960 }, scale: 1.13, burst: { x: 1460, y: 345 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 18, y: 3 },
      anchor: { x: 510, y: 1500 }, scale: 1, burst: { x: 850, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 24, y: 5 },
      anchor: { x: 650, y: 950 }, scale: 1.13, burst: { x: 1456, y: 522 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 42, y: 64 },
    anchor: { x: 800, y: 900 }, scale: 1.05 },
};

/**
 * Mã Liên (tên cũ Bế Liên), y sư hệ Thổ (tướng cửa hàng). Bộ tranh Shan gửi 28/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
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
 * Mã Nhạc, mưu sĩ hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 03/11: ông đồ hói áo vàng đất gile nâu thêu phù hiệu ba thanh, đoản kiếm chuôi đỏ giắt hông, ống thẻ tre treo dây thay
 * quạt nan. Ảnh đứng 1024×1536 tách lớp bằng code: ống thẻ tre treo dây đung đưa dưới nắm tay, nắm tay xoay quanh cổ tay
 * (vạt áo sau ống vá khuếch tán), bàn tay đặt trên chuôi kiếm là tay không, đầu tách riêng. Tranh ngồi xếp bằng trên
 * chiếu làm phong thái.
 */
const MA_NHAC: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 597, y: 600 },
  dir: "ma-nhac",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1450,
  parts: {
    body: { x: 189, y: 51, w: 532, h: 1450 },
    armR: { x: 296, y: 548, w: 108, h: 118 },
    sword: { x: 587, y: 599, w: 82, h: 298 },
    arm: { x: 582, y: 548, w: 84, h: 74 },
    head: { x: 400, y: 51, w: 216, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 645, y: 566 },
    elbowR: { x: 330, y: 562 },
    neck: { x: 510, y: 290 },
  },
  blade: [{ x: 597, y: 600 }, { x: 635, y: 890 }],
  strikeFx: "roadSever",
  fxColor: 0xc8923a,
  // Lao tới đâm đoản kiếm, tay kia cầm vỏ (đánh thường), giơ kiếm cạnh vai, hai ngón chỉ đường (ra chiêu), tấn rộng cầm
  // kiếm ngang hông, tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 68, y: 6 },
      anchor: { x: 580, y: 1014 }, scale: 1, burst: { x: 1490, y: 280 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 158, y: 30 },
      anchor: { x: 470, y: 1510 }, scale: 1, burst: { x: 960, y: 270 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 223, y: 12 },
      anchor: { x: 700, y: 1014 }, scale: 1, burst: { x: 1320, y: 200 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 35, y: 19 },
    anchor: { x: 800, y: 1000 }, scale: 1 },
};

/**
 * Tạ Thạch, quân sư hệ Thổ (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: ông lão tóc bạc búi trâm ngọc, áo nâu thêu mũi giáo vàng, gậy gỗ đỏ chuôi đồng mũi sắt, cuộn bản đồ sông nước.
 * Ảnh đứng 1024×1536 tách lớp bằng code: gậy cùng nắm tay xoay quanh cổ tay (vạt áo sau gậy vá theo hàng), bàn tay ôm
 * bản đồ và đầu tách riêng; bỏ lá cờ bay của bộ cũ. Tranh hai tay chống gậy, bản đồ đeo lưng làm phong thái.
 */
const TA_THACH: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  raise: -0.03,
  dir: "ta-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1480 },
  height: 1440,
  parts: {
    body: { x: 157, y: 45, w: 702, h: 1444 },
    armR: { x: 596, y: 605, w: 128, h: 112 },
    sword: { x: 274, y: 476, w: 72, h: 1016 },
    arm: { x: 238, y: 555, w: 120, h: 132 },
    head: { x: 355, y: 45, w: 266, h: 300 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 300, y: 620 },
    elbowR: { x: 650, y: 640 },
    neck: { x: 500, y: 320 },
  },
  blade: [{ x: 312, y: 480 }, { x: 300, y: 1490 }],
  strikeFx: "stoneBastion",
  fxColor: 0xd09a48,
  // Tấn thấp hai tay đẩy gậy tới (đánh thường), cúi đầu hai tay cắm gậy xuống đất (ra chiêu), hét lớn vung gậy qua
  // đầu bổ xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 58, y: 10 },
      anchor: { x: 540, y: 985 }, scale: 1, burst: { x: 1480, y: 415 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 147, y: 44 },
      anchor: { x: 360, y: 1440 }, scale: 1, burst: { x: 630, y: 330 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 264, y: 12 },
      anchor: { x: 710, y: 985 }, scale: 1, burst: { x: 1300, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 25, y: 10 },
    anchor: { x: 500, y: 960 }, scale: 1 },
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
 * Vũ Lôi, pháp sư hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 29/10:
 * áo tím thêu mặt trời và tia sét, khăn tím buộc búi tóc, kiếm gỗ đào khắc vân sét (vũ khí đổi từ trượng sang kiếm).
 * Ảnh đứng (983×1600, giữ khổ) tách lớp bằng code: kiếm cùng nắm tay xoay quanh cổ tay theo nhịp chém, bàn tay kết ấn
 * hai ngón và đầu tách riêng. Tranh đứng kết ấn dùng cả cho ra chiêu; tranh hai tay dựng kiếm làm tranh phong thái.
 * Cỡ người các tranh tư thế so theo chiều cao đầu.
 */
const VU_LOI: WarriorRig = {
  raise: -0.1,
  skeleton: "warrior",
  dir: "vu-loi",
  texScale: 0.5,
  foot: { x: 460, y: 1580 },
  height: 1575,
  parts: {
    body: { x: 91, y: 6, w: 682, h: 1586 },
    armR: { x: 170, y: 107, w: 108, h: 194 },
    sword: { x: 772, y: 614, w: 98, h: 950 },
    arm: { x: 772, y: 670, w: 88, h: 90 },
    head: { x: 310, y: 6, w: 228, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 815, y: 720 },
    elbowR: { x: 230, y: 290 },
    neck: { x: 440, y: 235 },
  },
  blade: [{ x: 812, y: 820 }, { x: 810, y: 1550 }],
  strikeFx: "heavenStrike",
  fxColor: 0xb48cff,
  // Đâm kiếm thẳng (đánh thường), kết ấn hai ngón gọi sét (ra chiêu), giơ kiếm qua đầu xòe tay (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 17, y: 10 },
      anchor: { x: 430, y: 1495 }, scale: 0.85, burst: { x: 1005, y: 372 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 91, y: 6 },
      anchor: { x: 460, y: 1580 }, scale: 1, burst: { x: 205, y: 105 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 62, y: 11 },
      anchor: { x: 575, y: 1335 }, scale: 1.05, burst: { x: 887, y: 24 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 7, y: 9 },
    anchor: { x: 600, y: 1200 }, scale: 0.7 },
};

/**
 * Ông Chấn, binh lính hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: áo gile tím thêu núi sét, đôi dùi trống giắt lưng, giản sắt gai xoắn thay giáo và khiên. Ảnh đứng 1024×1536 tách
 * lớp bằng code: giản cùng nắm tay xoay quanh cổ tay (giản nằm ngoài thân, đoạn cẳng tay sau chuôi để trống), nắm tay
 * buông là tay không, đầu tách riêng. Tranh gác chân lên trống làm phong thái.
 */
const ONG_CHAN: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "ong-chan",
  texScale: 0.5,
  foot: { x: 500, y: 1518 },
  height: 1430,
  parts: {
    body: { x: 193, y: 87, w: 662, h: 1436 },
    armR: { x: 745, y: 770, w: 110, h: 114 },
    sword: { x: 164, y: 8, w: 70, h: 870 },
    arm: { x: 152, y: 626, w: 92, h: 100 },
    head: { x: 415, y: 87, w: 212, h: 230 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 222, y: 668 },
    elbowR: { x: 800, y: 825 },
    neck: { x: 530, y: 300 },
  },
  blade: [{ x: 200, y: 640 }, { x: 205, y: 20 }],
  strikeFx: "thunderAegis",
  fxColor: 0xb48cff,
  // Đâm giản ngang tấn thấp (đánh thường), hai tay dựng giản trước ngực (ra chiêu), vung giản qua đầu (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 101, y: 14 },
      anchor: { x: 680, y: 1018 }, scale: 1.12, burst: { x: 1470, y: 410 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 91, y: 26 },
      anchor: { x: 505, y: 1519 }, scale: 1, burst: { x: 620, y: 40 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 40, y: 14 },
      anchor: { x: 510, y: 1508 }, scale: 1.05, burst: { x: 880, y: 25 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 21 },
    anchor: { x: 760, y: 990 }, scale: 1.1 },
};

/**
 * Tiêu Minh, y sư hệ Lôi (tướng cửa hàng). Bộ tranh Shan gửi 29/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code như
 * Mã Liên: bàn tay nắm dây cùng đôi hồ lô tím xoay quanh cổ tay (chỗ hồ lô che vạt áo được vá màu), cẳng tay buông bên
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
 * Từ Kinh, mưu sĩ hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * cũ: người dò đường tóc xoăn băng trán chàm, áo tím thêu núi sét, cuộn bản đồ đeo vai, ống bút lông giắt thắt lưng, roi
 * xích đốt sắt thay quạt. Ảnh đứng 1024×1536 tách lớp bằng code: cán roi và nắm tay xoay quanh cổ tay, dây xích treo từ
 * khoen đầu cán đung đưa (nằm ngoài thân nên không cần vá), bàn tay nắm quai đeo trước ngực là tay không, đầu tách riêng.
 * Tranh đứng trên đá chỉ đường cầm bản đồ làm phong thái.
 */
const TU_KINH: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 178, y: 380 },
  dir: "tu-kinh",
  texScale: 0.5,
  foot: { x: 520, y: 1499 },
  height: 1480,
  parts: {
    body: { x: 234, y: 20, w: 558, h: 1480 },
    armR: { x: 510, y: 350, w: 106, h: 120 },
    sword: { x: 155, y: 401, w: 46, h: 1024 },
    arm: { x: 165, y: 357, w: 140, h: 216 },
    head: { x: 440, y: 20, w: 250, h: 310 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 262, y: 505 },
    elbowR: { x: 592, y: 448 },
    neck: { x: 560, y: 315 },
  },
  blade: [{ x: 178, y: 400 }, { x: 178, y: 1400 }],
  strikeFx: "stormSeal",
  fxColor: 0xb48cff,
  // Tấn rộng quất xích thẳng ra trước (đánh thường), giơ cán roi qua đầu quay xích, tay kia đưa ngang (ra chiêu), hai tay
  // vung cán roi quét xích vòng sau lưng, miệng quát (tuyệt chiêu). Tranh ngang vẽ người nhỏ hơn nên phóng theo cỡ đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 15, y: 45 },
      anchor: { x: 450, y: 1013 }, scale: 1.15, burst: { x: 1490, y: 290 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 309, y: 7 },
      anchor: { x: 620, y: 1018 }, scale: 1.4, burst: { x: 1060, y: 370 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 84, y: 11 },
      anchor: { x: 820, y: 1013 }, scale: 1.15, burst: { x: 240, y: 850 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 53, y: 25 },
    anchor: { x: 760, y: 960 }, scale: 1.25 },
};

/**
 * Mạc Vân, quân sư hệ Lôi (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * 29/10: áo tím thêu mặt trời và sấm vàng, dây buộc tóc bện tím, tù và sừng đeo lưng, kiếm lưỡi lượn sóng trong vỏ
 * đỏ. Ảnh đứng 1024×1536 tách lớp bằng code: kiếm trong vỏ cùng bàn tay đặt trên chuôi lắc nhẹ quanh cổ tay (`raise`
 * nhỏ để vỏ kiếm không vung xa), vạt áo sau vỏ vá theo hàng; bàn tay chống hông và đầu tách riêng. Tranh đứng trên
 * tảng đá thổi tù và làm phong thái.
 */
const MAC_VAN: WarriorRig = {
  skeleton: "warrior",
  raise: 0.06,
  dir: "mac-van",
  texScale: 0.5,
  foot: { x: 470, y: 1505 },
  height: 1480,
  parts: {
    body: { x: 201, y: 36, w: 576, h: 1486 },
    armR: { x: 600, y: 590, w: 126, h: 112 },
    sword: { x: 511, y: 607, w: 220, h: 588 },
    arm: { x: 448, y: 540, w: 146, h: 90 },
    head: { x: 384, y: 36, w: 218, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 470, y: 575 },
    elbowR: { x: 700, y: 610 },
    neck: { x: 500, y: 250 },
  },
  blade: [{ x: 560, y: 700 }, { x: 712, y: 1180 }],
  strikeFx: "thunderRout",
  fxColor: 0xb48cff,
  // Lao tới đâm kiếm lượn sóng, tay kia vung ra sau (đánh thường), giơ kiếm dựng đứng thổi tù và (ra chiêu), hét lớn
  // kéo kiếm hai tay chém ngược (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 29, y: 15 },
      anchor: { x: 520, y: 985 }, scale: 1.1, burst: { x: 1490, y: 130 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 167, y: 11 },
      anchor: { x: 440, y: 1490 }, scale: 1, burst: { x: 930, y: 160 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 59, y: 11 },
      anchor: { x: 950, y: 985 }, scale: 1.12, burst: { x: 300, y: 320 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 30, y: 13 },
    anchor: { x: 700, y: 930 }, scale: 1.05 },
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
 * Liễu Yên, pháp sư hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 10/11 (nền trong suốt sẵn), thay bộ 29/10:
 * áo vải mộc thêu cổng làng, băng đô xanh, phất trần đuôi ngựa trắng thay trượng trúc. Ảnh đứng (1006×1563, giữ khổ)
 * tách lớp bằng code: cẳng tay giơ ngửa bàn tay xoay quanh khuỷu theo nhịp quạt (phất trần ôm bên hông nằm yên trong
 * thân vì đuôi lông phủ lên tay áo), chuông đồng đeo thắt lưng đung đưa quanh móc, đầu tách riêng. Tranh dựng phất trần
 * xòe tay làm ra chiêu; tranh giơ phất trần qua đầu (bản rõ hơn) làm phong thái; tranh nằm làm gục. Cỡ người các tranh
 * tư thế so theo chiều cao đầu.
 */
const LIEU_YEN: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "lieu-yen",
  texScale: 0.5,
  foot: { x: 400, y: 1545 },
  height: 1535,
  parts: {
    body: { x: 213, y: 10, w: 528, h: 1544 },
    armR: { x: 589, y: 545, w: 68, h: 204 },
    sword: { x: 671, y: 241, w: 232, h: 254 },
    arm: { x: 671, y: 420, w: 86, h: 76 },
    head: { x: 380, y: 10, w: 204, h: 266 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 712, y: 478 },
    elbowR: { x: 612, y: 556 },
    neck: { x: 500, y: 255 },
  },
  blade: [{ x: 770, y: 350 }, { x: 885, y: 258 }],
  strikeFx: "galeVortex",
  fxColor: 0x2e9e90,
  // Lướt tới quét phất trần (đánh thường), dựng phất trần xòe tay (ra chiêu), giơ phất trần qua đầu vươn tay gọi lốc
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 290, y: 8 },
      anchor: { x: 575, y: 1020 }, scale: 1.35, burst: { x: 1150, y: 250 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 73, y: 8 },
      anchor: { x: 475, y: 1545 }, scale: 1, burst: { x: 70, y: 545 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 26, y: 2 },
      anchor: { x: 510, y: 1495 }, scale: 1.15, burst: { x: 985, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 202 },
    anchor: { x: 880, y: 850 }, scale: 0.85 },
};

/**
 * Mạnh Tường, binh lính hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11 (nền trong suốt sẵn), thay bộ
 * 29/10: khăn xanh ngọc quấn đầu, giáp vảy da, giáo mũi sắt buộc dải xanh và khiên mây bầu dục nẹp chéo đồng. Ảnh đứng
 * (941×1672, giữ khổ) tách lớp bằng code: giáo cùng nắm tay xoay quanh cổ tay (cán giáo nằm ngoài thân nên không cần vá),
 * khiên mây cùng bàn tay nắm vành nâng lên khi vào thế và đỡ đòn, đầu tách riêng. Tranh tay cầm ống tre đứng tựa giáo
 * làm phong thái.
 */
const MANH_TUONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "manh-tuong",
  texScale: 0.5,
  foot: { x: 480, y: 1655 },
  height: 1470,
  parts: {
    body: { x: 106, y: 172, w: 770, h: 1494 },
    armR: { x: 688, y: 438, w: 248, h: 640 },
    sword: { x: 16, y: 6, w: 164, h: 1580 },
    arm: { x: 17, y: 482, w: 90, h: 106 },
    head: { x: 400, y: 180, w: 200, h: 240 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 95, y: 555 },
    elbowR: { x: 705, y: 650 },
    neck: { x: 500, y: 400 },
  },
  blade: [{ x: 55, y: 520 }, { x: 40, y: 30 }],
  shieldRaise: -0.35,
  strikeFx: "galeBulwark",
  fxColor: 0x2e9e90,
  // Tấn rộng núp khiên đâm giáo ngang (đánh thường), đẩy khiên ra trước (ra chiêu), hạ thấp người ghì khiên che thân
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 5, y: 2 },
      anchor: { x: 200, y: 985 }, scale: 1.15, burst: { x: 1540, y: 170 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 1, y: 0 },
      anchor: { x: 450, y: 1620 }, scale: 1, burst: { x: 850, y: 600 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 1, y: 2 },
      anchor: { x: 520, y: 1595 }, scale: 1, burst: { x: 850, y: 800 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 3, y: 1 },
    anchor: { x: 1000, y: 800 }, scale: 1 },
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
 * Bùi Phiêu, mưu sĩ hệ Phong (tướng cửa hàng). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt sẵn), thay bộ
 * cũ: thư sinh áo xanh xám tay rộng thêu cổng làng, búi tóc buộc lụa xanh, sổ da treo thắt lưng, quạt giấy nan nâu. Ảnh
 * đứng 977×1609 (giữ khổ) tách lớp bằng code: quạt cùng nắm tay và cổ tay áo trong xoay quanh cổ tay (quạt nằm ngoài thân
 * nên không cần vá), bàn tay buông bên kia tách riêng (tay áo phía sau vá màu), đầu tách riêng. Tranh tay chống cằm làm
 * phong thái.
 */
const BUI_PHIEU: WarriorRig = {
  skeleton: "warrior",
  weapon: "fan",
  dir: "bui-phieu",
  texScale: 0.5,
  foot: { x: 510, y: 1593 },
  height: 1561,
  parts: {
    body: { x: 201, y: 32, w: 748, h: 1562 },
    armR: { x: 761, y: 750, w: 70, h: 128 },
    sword: { x: 28, y: 600, w: 220, h: 284 },
    arm: { x: 139, y: 657, w: 108, h: 114 },
    head: { x: 440, y: 32, w: 220, h: 314 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 238, y: 690 },
    elbowR: { x: 785, y: 760 },
    neck: { x: 545, y: 330 },
  },
  blade: [{ x: 200, y: 720 }, { x: 70, y: 650 }],
  strikeFx: "galeRift",
  fxColor: 0x2e9e90,
  // Chĩa quạt thẳng ra trước, tay kia úp ngang hông (đánh thường), tấn rộng rút quạt ngang thắt lưng như rút kiếm (ra
  // chiêu), giơ quạt bên vai, tay kia ngửa ra quát lệnh (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 14, y: 20 },
      anchor: { x: 470, y: 1607 }, scale: 0.98, burst: { x: 940, y: 500 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 19, y: 16 },
      anchor: { x: 520, y: 1545 }, scale: 1.02, burst: { x: 290, y: 530 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 19 },
      anchor: { x: 400, y: 1662 }, scale: 0.95, burst: { x: 880, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 10, y: 40 },
    anchor: { x: 850, y: 960 }, scale: 1 },
};

/**
 * Phùng Phong, quân sư hệ Phong (tướng khởi đầu). Bộ 7 tranh phong cách mới Shan gửi 09/11 (nền trong suốt sẵn): gậy trúc
 * buộc dải vải xanh, sáo trúc giắt đai. Ảnh đứng tách lớp bằng code: gậy (cả dải vải) xoay quanh cổ tay cùng nắm tay,
 * ống tay sau gậy vá bằng phản chiếu nếp áo bên phải; bàn tay trái buông xoay quanh cổ tay trong ống tay, đầu (cả khăn)
 * tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const PHUNG_PHONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "phung-phong",
  texScale: 0.5,
  foot: { x: 480, y: 1500 },
  height: 1481,
  parts: {
    body: { x: 185, y: 19, w: 582, h: 1494 },
    armR: { x: 634, y: 722, w: 80, h: 152 },
    sword: { x: 134, y: 199, w: 140, h: 1312 },
    arm: { x: 212, y: 362, w: 80, h: 94 },
    head: { x: 343, y: 19, w: 224, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 250, y: 450 },
    elbowR: { x: 688, y: 738 },
    neck: { x: 500, y: 240 },
  },
  blade: [{ x: 241, y: 1490 }, { x: 253, y: 215 }],
  strikeFx: "galeRout",
  fxColor: 0x2e9e90,
  // Tấn thấp đâm gậy ngang về phía đối thủ (đánh thường), thổi sáo cạnh gậy dựng (ra chiêu), giơ gậy chéo trên đầu
  // xòe tay gọi gió (tuyệt chiêu). Cỡ so theo bề ngang khăn đầu.
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 153, y: 13 },
      anchor: { x: 320, y: 990 }, scale: 1.17, burst: { x: 1405, y: 275 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 69, y: 16 },
      anchor: { x: 450, y: 1495 }, scale: 1, burst: { x: 880, y: 215 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 13, y: 14 },
      anchor: { x: 260, y: 1500 }, scale: 1.27, burst: { x: 975, y: 545 } },
  },
  // Ngồi bệt chống tay, gậy và sáo rơi trước mặt.
  down: { name: "pose-down", texScale: 0.4, origin: { x: 58, y: 41 },
    anchor: { x: 600, y: 850 }, scale: 1 },
};

/**
 * Đoàn Cự (ngoại hiệu Bạch Nỏ Lang), xạ thủ hệ Kim (RB-062). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong suốt
 * sẵn), thay bộ 29/10: lão xạ thủ khăn trắng thêu cầu đá, giáp vảy xám, giáp vai da, nỏ gỗ bịt đồng, ống tên đồng bên
 * hông. Ảnh đứng 1024×1536 tách lớp bằng code: nỏ (cả dây, cò và bàn tay đỡ phía trước) xoay quanh nắm tay cầm báng,
 * ống tên lắc nhẹ thay bàn tay buông, đầu (cả đuôi khăn) tách riêng; ngực và tay áo sau nỏ, vạt áo sau ống tên vá theo
 * cột. Tranh cầm mũi tên ngắm nghía làm phong thái. Tranh tư thế vẽ người nhỏ trong khung ngang nên phóng lên.
 */
const BACH_NO_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "spear",
  dir: "bach-no-lang",
  texScale: 0.5,
  foot: { x: 420, y: 1510 },
  height: 1494,
  parts: {
    body: { x: 66, y: 22, w: 908, h: 1494 },
    armR: { x: 561, y: 620, w: 114, h: 296 },
    sword: { x: 242, y: 361, w: 706, h: 236 },
    arm: { x: 318, y: 440, w: 112, h: 90 },
    head: { x: 300, y: 22, w: 216, h: 278 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 370, y: 485 },
    elbowR: { x: 610, y: 640 },
    neck: { x: 420, y: 270 },
  },
  blade: [{ x: 370, y: 485 }, { x: 930, y: 450 }],
  strikeFx: "boltBreach",
  fxColor: 0x9ea4ad,
  // Đá tống ngang, ôm nỏ không bắn (đánh thường), đứng tấn áp má ngắm (ra chiêu), quỳ một gối ghì nỏ phóng tên phá thành
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 399, y: 8 },
      anchor: { x: 600, y: 995 }, scale: 1.3, burst: { x: 1090, y: 235 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 404, y: 8 },
      anchor: { x: 700, y: 995 }, scale: 1.3, burst: { x: 1185, y: 160 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 203, y: 4 },
      anchor: { x: 660, y: 995 }, scale: 1.05, burst: { x: 1250, y: 210 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 96, y: 4 },
    anchor: { x: 660, y: 920 }, scale: 1.15 },
};

/**
 * Quản Hiên (ngoại hiệu Thanh Lâm Xạ), xạ thủ hệ Mộc (RB-063). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 29/10: áo lục thêu mặt trời, tóc tết đuôi sam, cung tre dài, giỏ tên đan bên hông. Ảnh đứng
 * 1024×1536 tách lớp bằng code: cung tre (cả dây) cùng bàn tay cầm cung xoay quanh cổ tay như trượng (cung nằm ngoài
 * thân nên không cần vá), bàn tay buông cạnh giỏ tên và đầu tách riêng; bím tóc, giỏ tên ở lại thân. Tranh đứng một
 * chân đặt ngón tay lên môi làm phong thái. Tranh tư thế vẽ người nhỏ trong khung ngang nên phóng lên.
 */
const THANH_LAM_XA: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  raise: -0.03,
  dir: "thanh-lam-xa",
  texScale: 0.5,
  foot: { x: 430, y: 1495 },
  height: 1430,
  parts: {
    body: { x: 196, y: 67, w: 518, h: 1432 },
    armR: { x: 270, y: 740, w: 74, h: 142 },
    sword: { x: 620, y: 12, w: 170, h: 1460 },
    arm: { x: 702, y: 615, w: 88, h: 82 },
    head: { x: 335, y: 67, w: 196, h: 264 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 728, y: 660 },
    elbowR: { x: 310, y: 750 },
    neck: { x: 440, y: 300 },
  },
  blade: [{ x: 745, y: 660 }, { x: 735, y: 20 }],
  strikeFx: "thicketShot",
  fxColor: 0x4f9a4a,
  // Đứng tấn kéo căng cung bắn thẳng (đánh thường), lách người một chân co, tay xòe niệm chú (ra chiêu), hạ thấp người
  // kéo cung sát má bắn phá (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 474, y: 9 },
      anchor: { x: 680, y: 990 }, scale: 1.45, burst: { x: 1095, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 377, y: 12 },
      anchor: { x: 1120, y: 1000 }, scale: 1.3, burst: { x: 1310, y: 460 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 106, y: 3 },
      anchor: { x: 620, y: 1000 }, scale: 1.15, burst: { x: 1390, y: 410 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 146, y: 40 },
    anchor: { x: 1100, y: 960 }, scale: 1.1 },
};

/**
 * Thái Diệp (ngoại hiệu Lam Giang Phi Diệp), xạ thủ hệ Thủy (RB-064). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền
 * trong suốt sẵn), thay bộ 30/10: áo chàm thêu sóng vàng, khăn buộc tóc xanh, mặt dây vỏ sò, phi tiêu lá liễu và ống
 * tiêu da đính sò bên hông. Ảnh đứng 1024×1536 tách lớp bằng code: phi tiêu cùng nắm tay buông vung quanh cổ tay như
 * kiếm ngắn (tay và tiêu nằm ngoài thân nên không cần vá), bàn tay buông bên ống tiêu và đầu (cả dải khăn) tách riêng.
 * Tranh ngồi xổm chống cằm nhìn phi tiêu làm phong thái.
 */
const LAM_GIANG_PHI_DIEP: WarriorRig = {
  skeleton: "warrior",
  dir: "lam-giang-phi-diep",
  texScale: 0.5,
  foot: { x: 500, y: 1510 },
  height: 1490,
  parts: {
    body: { x: 229, y: 21, w: 560, h: 1504 },
    armR: { x: 715, y: 790, w: 72, h: 98 },
    sword: { x: 268, y: 873, w: 64, h: 128 },
    arm: { x: 235, y: 786, w: 100, h: 88 },
    head: { x: 300, y: 25, w: 300, h: 306 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 285, y: 795 },
    elbowR: { x: 750, y: 800 },
    neck: { x: 530, y: 300 },
  },
  blade: [{ x: 290, y: 875 }, { x: 290, y: 995 }],
  strikeFx: "willowTide",
  fxColor: 0x2f7fc1,
  // Bật nhảy co gối, phi tiêu giấu sau lưng (đánh thường), tấn rộng phi tiêu kéo sau, tay xòe đẩy chưởng (ra chiêu),
  // giơ cao phi tiêu sau đầu sắp phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 52, y: 46 },
      anchor: { x: 450, y: 1490 }, scale: 1, burst: { x: 930, y: 650 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 112, y: 16 },
      anchor: { x: 800, y: 980 }, scale: 1.1, burst: { x: 1360, y: 400 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 41, y: 23 },
      anchor: { x: 620, y: 1300 }, scale: 1.1, burst: { x: 1100, y: 500 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 82, y: 16 },
    anchor: { x: 820, y: 960 }, scale: 1 },
};

/**
 * Lý Diệm (ngoại hiệu Xích Diệm Luân), xạ thủ hệ Hỏa (RB-065). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 30/10: áo đỏ thêu vuốt lửa vàng, đai cam, dây bện đỏ buộc tóc, chùm chìa khóa đồng bên hông, vòng
 * sắt viền răng cưa vàng. Ảnh đứng 1024×1536 tách lớp bằng code: vòng sắt cùng nắm tay buông vung quanh cổ tay (vạt áo
 * sau vòng vá theo hàng), bàn tay chống hông và đầu (cả đuôi tóc) tách riêng. Tranh ngồi trên bao lúa lau vòng làm
 * phong thái.
 */
const XICH_DIEM_LUAN: WarriorRig = {
  skeleton: "warrior",
  dir: "xich-diem-luan",
  texScale: 0.5,
  foot: { x: 520, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 267, y: 9, w: 522, h: 1520 },
    armR: { x: 600, y: 550, w: 106, h: 106 },
    sword: { x: 167, y: 835, w: 246, h: 274 },
    arm: { x: 245, y: 785, w: 102, h: 106 },
    head: { x: 330, y: 10, w: 290, h: 258 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 300, y: 805 },
    elbowR: { x: 680, y: 575 },
    neck: { x: 515, y: 250 },
  },
  blade: [{ x: 290, y: 850 }, { x: 290, y: 1100 }],
  strikeFx: "flameDisc",
  fxColor: 0xd9502a,
  // Tấn rộng phóng vòng sắt bay tới (đánh thường), kéo vòng thấp sau lưng tay kia chỉ hướng (ra chiêu), giơ vòng qua đầu
  // lấy đà phóng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 99, y: 7 },
      anchor: { x: 560, y: 990 }, scale: 1.1, burst: { x: 1330, y: 210 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 106, y: 7 },
      anchor: { x: 1210, y: 985 }, scale: 1.1, burst: { x: 1440, y: 420 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 214, y: 6 },
      anchor: { x: 780, y: 1000 }, scale: 1.1, burst: { x: 1270, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 93, y: 8 },
    anchor: { x: 1100, y: 960 }, scale: 1 },
};

/**
 * Kha Thạch (ngoại hiệu Trấn Sơn Thạch), xạ thủ hệ Thổ (RB-066). Bộ tranh phong cách mới Shan gửi 11/11/2026 (nền trong
 * suốt sẵn), thay bộ 30/10: áo chần bông vàng đất thêu thẻ gỗ, áo trong nâu, đai đỏ, túi đá đan bên hông, đá phi dẹt.
 * Ảnh đứng 1024×1536 tách lớp bằng code: bàn tay cầm đá cùng viên đá vung quanh cổ tay (nằm ngoài thân nên không cần
 * vá), bàn tay chống hông và đầu tách riêng. Tranh ngồi trên tảng đá xem viên đá làm phong thái.
 */
const TRAN_SON_THACH: WarriorRig = {
  skeleton: "warrior",
  dir: "tran-son-thach",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 175, y: 9, w: 666, h: 1516 },
    armR: { x: 641, y: 660, w: 108, h: 102 },
    sword: { x: 175, y: 750, w: 108, h: 62 },
    arm: { x: 150, y: 698, w: 96, h: 128 },
    head: { x: 380, y: 10, w: 266, h: 250 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 205, y: 712 },
    elbowR: { x: 715, y: 668 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 200, y: 790 }, { x: 278, y: 760 }],
  strikeFx: "stoneGuard",
  fxColor: 0xc8963c,
  // Tấn rộng phóng đá dẹt bay tới (đánh thường), giơ đá ngang vai tay kia đẩy chưởng (ra chiêu), giơ cao đá qua đầu lấy
  // đà ném (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 139, y: 9 },
      anchor: { x: 610, y: 985 }, scale: 1.05, burst: { x: 1390, y: 170 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 239, y: 6 },
      anchor: { x: 695, y: 985 }, scale: 1.05, burst: { x: 1300, y: 260 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 235, y: 7 },
      anchor: { x: 740, y: 995 }, scale: 1.05, burst: { x: 1300, y: 480 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 62, y: 5 },
    anchor: { x: 650, y: 930 }, scale: 1 },
};

/**
 * Lương Triệt (ngoại hiệu Lôi Minh Xạ), xạ thủ hệ Lôi (RB-067, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 11/11 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: nắm tay giơ ngang vai kẹp lôi châm vung quanh cổ tay, bàn tay
 * buông bên hông lắc nhẹ, đầu (cả dải buộc tóc tím) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LOI_MINH_XA: WarriorRig = {
  skeleton: "warrior",
  dir: "loi-minh-xa",
  texScale: 0.5,
  foot: { x: 510, y: 1515 },
  height: 1505,
  parts: {
    body: { x: 206, y: 5, w: 582, h: 1522 },
    armR: { x: 712, y: 788, w: 76, h: 120 },
    sword: { x: 251, y: 229, w: 156, h: 54 },
    arm: { x: 211, y: 265, w: 108, h: 84 },
    head: { x: 321, y: 5, w: 320, h: 246 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 252, y: 338 },
    elbowR: { x: 750, y: 795 },
    neck: { x: 540, y: 235 },
  },
  blade: [{ x: 255, y: 270 }, { x: 404, y: 232 }],
  strikeFx: "voltNeedle",
  fxColor: 0xb48cff,
  // Tấn rộng phóng châm, tay kia chắn trước ngực (đánh thường), giơ châm qua đầu, tay kia đẩy chưởng (ra chiêu), kẹp hai
  // châm sau đầu lấy đà ném (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 217, y: 7 },
      anchor: { x: 630, y: 990 }, scale: 1.05, burst: { x: 1400, y: 130 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 181, y: 8 },
      anchor: { x: 700, y: 995 }, scale: 1.05, burst: { x: 1300, y: 420 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 277, y: 4 },
      anchor: { x: 690, y: 995 }, scale: 1.05, burst: { x: 1260, y: 215 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 54, y: 5 },
    anchor: { x: 680, y: 945 }, scale: 1 },
};

/**
 * Giáp Yến (ngoại hiệu Tật Phong Lăng), xạ thủ hệ Phong (RB-068, nghề chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 11/11 (nền trong suốt sẵn). Ảnh đứng hai tay cầm dải lụa võng thành vòng nên vòng lụa ở lại thân; đầu lụa rủ bên trái
 * cùng bàn tay trái lắc nhẹ quanh cổ tay như hồ lô của y sư, bàn tay phải và đầu (cả bím tóc trên) tách riêng. Hệ tọa
 * độ: ảnh đứng 1024×1536.
 */
const TAT_PHONG_LANG: WarriorRig = {
  skeleton: "warrior",
  weapon: "gourd",
  grip: { x: 210, y: 738 },
  dir: "tat-phong-lang",
  texScale: 0.5,
  foot: { x: 440, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 147, y: 11, w: 806, h: 1518 },
    armR: { x: 795, y: 526, w: 86, h: 76 },
    sword: { x: 98, y: 735, w: 146, h: 328 },
    arm: { x: 162, y: 636, w: 104, h: 106 },
    head: { x: 320, y: 11, w: 300, h: 252 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 212, y: 645 },
    elbowR: { x: 808, y: 560 },
    neck: { x: 545, y: 245 },
  },
  blade: [{ x: 210, y: 738 }, { x: 150, y: 1050 }],
  strikeFx: "silkGale",
  fxColor: 0x2e9e90,
  // Tấn trước đấm thẳng phóng lụa (đánh thường), đá ngang quét lụa bay vòng (ra chiêu), vung lụa thành cung lớn qua đầu
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 69, y: 5 },
      anchor: { x: 390, y: 995 }, scale: 1.2, burst: { x: 1300, y: 520 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 115, y: 11 },
      anchor: { x: 380, y: 995 }, scale: 1.2, burst: { x: 1050, y: 550 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 129, y: 11 },
      anchor: { x: 440, y: 1000 }, scale: 1.2, burst: { x: 1240, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 97, y: 14 },
    anchor: { x: 640, y: 950 }, scale: 1.1 },
};

/**
 * Đinh Ngọc, Vạn Tượng Hành Giả (RB-SP-001, nhân vật đặc biệt đang thiết kế, chưa có trong roster; chỉ có trên trang xem
 * thử). Bộ tranh Shan gửi 30/10 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: kiếm thẳng cùng nắm tay phải xoay
 * quanh cổ tay theo nhịp chém, bàn tay trái và đầu tách riêng; tóc dài, bao kiếm ở lại thân. Hệ tọa độ: ảnh đứng
 * 1024×1536.
 */
const DINH_NGOC: WarriorRig = {
  skeleton: "warrior",
  dir: "dinh-ngoc",
  texScale: 0.5,
  foot: { x: 500, y: 1500 },
  height: 1470,
  parts: {
    body: { x: 300, y: 27, w: 445, h: 1480 },
    armR: { x: 694, y: 690, w: 70, h: 140 },
    sword: { x: 274, y: 680, w: 160, h: 636 },
    arm: { x: 263, y: 690, w: 88, h: 147 },
    head: { x: 408, y: 30, w: 215, h: 235 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 305, y: 720 },
    elbowR: { x: 715, y: 705 },
    neck: { x: 515, y: 255 },
  },
  blade: [{ x: 330, y: 850 }, { x: 430, y: 1310 }],
  strikeFx: "myriadEdge",
  fxColor: 0x9ea4ad,
  // Đẩy chưởng trái, kiếm hạ thấp (đánh thường), tấn rộng đâm kiếm thấp về sau đẩy chưởng (ra chiêu), tấn rộng giơ kiếm sau
  // đầu dẫn lực (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 128, y: 33 },
      anchor: { x: 510, y: 1470 }, scale: 1, burst: { x: 960, y: 330 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 87, y: 8 },
      anchor: { x: 830, y: 1110 }, scale: 1, burst: { x: 1240, y: 480 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 304, y: 4 },
      anchor: { x: 810, y: 1110 }, scale: 1, burst: { x: 1170, y: 460 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 82, y: 66 },
    anchor: { x: 760, y: 920 }, scale: 0.85 },
};

/**
 * Phan Quyên (ngoại hiệu Bạch Phong Đao), sát thủ hệ Kim (RB-069, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi
 * 12/11 (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: dao găm cùng nắm tay buông bên trái xoay quanh cổ tay theo nhịp
 * chém, bàn tay phải giơ chưởng và đầu tách riêng; bao dao ở lại thân. Tuyệt chiêu dùng chung hiệu ứng xuyên giáp với
 * Bạch Nỏ Lang. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const BACH_PHONG_DAO: WarriorRig = {
  skeleton: "warrior",
  dir: "bach-phong-dao",
  texScale: 0.5,
  foot: { x: 500, y: 1520 },
  height: 1510,
  parts: {
    body: { x: 197, y: 8, w: 602, h: 1518 },
    armR: { x: 645, y: 292, w: 84, h: 154 },
    sword: { x: 185, y: 874, w: 82, h: 186 },
    arm: { x: 168, y: 772, w: 86, h: 116 },
    head: { x: 358, y: 8, w: 262, h: 254 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 220, y: 778 },
    elbowR: { x: 712, y: 435 },
    neck: { x: 520, y: 250 },
  },
  blade: [{ x: 230, y: 880 }, { x: 264, y: 1060 }],
  strikeFx: "boltBreach",
  fxColor: 0x9ea4ad,
  // Bước tới đâm dao thấp, tay kia che ngực (đánh thường), kéo dao ra sau, tay kia đẩy chưởng (ra chiêu), lao dài đâm
  // thẳng dao ngang vai (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 347, y: 10 },
      anchor: { x: 650, y: 995 }, scale: 1.15, burst: { x: 1160, y: 460 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 294, y: 7 },
      anchor: { x: 720, y: 995 }, scale: 1.15, burst: { x: 1210, y: 270 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 52, y: 16 },
      anchor: { x: 640, y: 995 }, scale: 1.05, burst: { x: 1500, y: 280 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 27, y: 72 },
    anchor: { x: 750, y: 960 }, scale: 1 },
};

/**
 * Nông Sâm (ngoại hiệu Độc Ảnh), sát thủ hệ Mộc (RB-070, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: kim châm độc cùng nắm tay phải buông thấp xoay quanh cổ tay, bàn tay
 * trái và đầu (cả khăn buộc) tách riêng; ống tre, bầu độc ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DOC_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "doc-anh",
  texScale: 0.5,
  foot: { x: 500, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 233, y: 20, w: 520, h: 1508 },
    armR: { x: 704, y: 762, w: 62, h: 134 },
    sword: { x: 283, y: 893, w: 36, h: 42 },
    arm: { x: 216, y: 762, w: 72, h: 132 },
    head: { x: 374, y: 20, w: 256, h: 226 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 255, y: 770 },
    elbowR: { x: 735, y: 770 },
    neck: { x: 520, y: 235 },
  },
  blade: [{ x: 262, y: 852 }, { x: 313, y: 934 }],
  strikeFx: "venomNeedle",
  fxColor: 0x4f9a4a,
  // Tấn dài vươn tay phóng châm (đánh thường), quỳ một gối kẹp châm ngang ngực (ra chiêu), tấn rộng giơ châm cạnh tai,
  // tay kia đẩy chưởng (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 45, y: 27 },
      anchor: { x: 640, y: 995 }, scale: 1.05, burst: { x: 1490, y: 265 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 304, y: 18 },
      anchor: { x: 760, y: 990 }, scale: 1.05, burst: { x: 575, y: 340 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 290, y: 12 },
      anchor: { x: 760, y: 990 }, scale: 1.05, burst: { x: 1270, y: 330 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 100, y: 70 },
    anchor: { x: 720, y: 950 }, scale: 1 },
};

/**
 * Âu Thu (ngoại hiệu Hàn Giang Khách), sát thủ hệ Thủy (RB-071, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan
 * gửi 12/11 (nền trong suốt sẵn). Ảnh đứng tay không (đoản đao giấu trong tay áo, chỉ hiện ở tranh tư thế): bàn tay buông
 * bên phải tách thành nắm tay + ngón (lớp "sword") xoay quanh cổ tay, bàn tay trái và đầu tách riêng; áo tơi lá ở lại
 * thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const HAN_GIANG_KHACH: WarriorRig = {
  skeleton: "warrior",
  dir: "han-giang-khach",
  texScale: 0.5,
  foot: { x: 510, y: 1520 },
  height: 1505,
  parts: {
    body: { x: 260, y: 12, w: 480, h: 1516 },
    armR: { x: 295, y: 792, w: 70, h: 112 },
    sword: { x: 676, y: 868, w: 54, h: 46 },
    arm: { x: 676, y: 788, w: 62, h: 82 },
    head: { x: 355, y: 12, w: 260, h: 244 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 705, y: 794 },
    elbowR: { x: 322, y: 798 },
    neck: { x: 550, y: 245 },
  },
  blade: [{ x: 705, y: 850 }, { x: 715, y: 905 }],
  strikeFx: "tideBlade",
  fxColor: 0x2f7fc1,
  // Tấn chéo đâm đoản đao, tay kia ngửa chưởng (đánh thường), thu đao bên hông đẩy chưởng (ra chiêu), tấn dài vung tay
  // đâm đao xuống thấp (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 342, y: 15 },
      anchor: { x: 580, y: 995 }, scale: 1.1, burst: { x: 1060, y: 300 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 304, y: 9 },
      anchor: { x: 740, y: 990 }, scale: 1.1, burst: { x: 1300, y: 250 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 93, y: 10 },
      anchor: { x: 660, y: 995 }, scale: 1.05, burst: { x: 1470, y: 630 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 27, y: 49 },
    anchor: { x: 700, y: 950 }, scale: 1 },
};

/**
 * Tiết Dạ (ngoại hiệu Xích Dạ), sát thủ hệ Hỏa (RB-072, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng hai tay buông cầm hai đao cong: đao trái cùng nắm tay xoay quanh cổ tay, nắm tay phải
 * cùng đao phải là lớp armR lắc theo nhịp, đầu tách riêng; khăn quàng, bao đao ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const XICH_DA: WarriorRig = {
  skeleton: "warrior",
  dir: "xich-da",
  texScale: 0.5,
  foot: { x: 500, y: 1515 },
  height: 1500,
  parts: {
    body: { x: 164, y: 23, w: 644, h: 1502 },
    armR: { x: 735, y: 792, w: 218, h: 498 },
    sword: { x: 71, y: 866, w: 190, h: 418 },
    arm: { x: 121, y: 751, w: 94, h: 116 },
    head: { x: 441, y: 23, w: 200, h: 212 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 165, y: 800 },
    elbowR: { x: 790, y: 800 },
    neck: { x: 550, y: 225 },
  },
  blade: [{ x: 150, y: 880 }, { x: 85, y: 1270 }],
  strikeFx: "twinCleave",
  fxColor: 0xd9502a,
  // Tấn dài vung một đao ra sau, một đao thu trước ngực (đánh thường), giơ cao một đao, đao kia chém ngang (ra chiêu),
  // bắt chéo hai đao trước ngực (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 51, y: 10 },
      anchor: { x: 700, y: 1000 }, scale: 1.15, burst: { x: 1100, y: 470 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 279, y: 7 },
      anchor: { x: 650, y: 995 }, scale: 1.15, burst: { x: 1420, y: 620 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 29, y: 12 },
      anchor: { x: 800, y: 995 }, scale: 1.15, burst: { x: 1270, y: 190 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 18, y: 11 },
    anchor: { x: 760, y: 960 }, scale: 1 },
};

/**
 * Cát Tàng (ngoại hiệu Địa Ẩn), sát thủ hệ Thổ (RB-073, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 12/11
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: móng vuốt tay phải tách khỏi bàn tay để cùng xoay quanh cổ tay, bàn
 * tay trái cùng móng vuốt và đầu (cả khăn quấn) tách riêng; dây móc ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const DIA_AN: WarriorRig = {
  skeleton: "warrior",
  dir: "dia-an",
  texScale: 0.5,
  foot: { x: 500, y: 1490 },
  height: 1460,
  parts: {
    body: { x: 170, y: 35, w: 684, h: 1460 },
    armR: { x: 745, y: 688, w: 136, h: 146 },
    sword: { x: 151, y: 739, w: 96, h: 108 },
    arm: { x: 156, y: 690, w: 144, h: 158 },
    head: { x: 400, y: 35, w: 208, h: 256 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 235, y: 700 },
    elbowR: { x: 790, y: 698 },
    neck: { x: 520, y: 280 },
  },
  blade: [{ x: 200, y: 750 }, { x: 175, y: 845 }],
  strikeFx: "earthClaw",
  fxColor: 0xc8963c,
  // Co gối đá ngang, hai tay giương vuốt (đánh thường), ngồi tấn thấp vươn vuốt tới trước (ra chiêu), tấn rộng một vuốt
  // giơ cao một vuốt chĩa xuống (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.4, origin: { x: 334, y: 9 },
      anchor: { x: 520, y: 1005 }, scale: 1.1, burst: { x: 1200, y: 440 } },
    cast: { name: "pose-cast", texScale: 0.4, origin: { x: 251, y: 18 },
      anchor: { x: 760, y: 990 }, scale: 1.1, burst: { x: 1330, y: 250 } },
    ultimate: { name: "pose-ultimate", texScale: 0.4, origin: { x: 214, y: 8 },
      anchor: { x: 640, y: 995 }, scale: 1.1, burst: { x: 1240, y: 600 } },
  },
  down: { name: "pose-down", texScale: 0.4, origin: { x: 33, y: 406 },
    anchor: { x: 760, y: 935 }, scale: 1 },
};

/**
 * Mẫn Tuyên (ngoại hiệu Lôi Ảnh), sát thủ hệ Lôi (RB-074, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: hộp phóng kim tách khỏi bàn tay phải để cùng xoay quanh cổ tay, bàn
 * tay trái và đầu (cả búi tóc, dây buộc) tách riêng; bím tóc, túi đeo ở lại thân. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const LOI_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "loi-anh",
  texScale: 0.5,
  foot: { x: 530, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 190, y: 10, w: 653, h: 1515 },
    armR: { x: 771, y: 668, w: 73, h: 104 },
    sword: { x: 291, y: 690, w: 97, h: 99 },
    arm: { x: 258, y: 645, w: 128, h: 133 },
    head: { x: 452, y: 10, w: 209, h: 206 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 290, y: 665 },
    elbowR: { x: 800, y: 690 },
    neck: { x: 570, y: 200 },
  },
  blade: [{ x: 300, y: 742 }, { x: 385, y: 742 }],
  strikeFx: "stormVolley",
  fxColor: 0xb48cff,
  // Lùi nửa bước gạt chưởng (đánh thường), giơ hộp kim sau vai đẩy chưởng tới (ra chiêu), quỳ một gối giơ hộp kim cao
  // (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 81, y: 9 },
      anchor: { x: 540, y: 1500 }, scale: 1, burst: { x: 660, y: 320 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 183, y: 10 },
      anchor: { x: 560, y: 1500 }, scale: 1, burst: { x: 272, y: 210 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 33, y: 117 },
      anchor: { x: 500, y: 1440 }, scale: 1, burst: { x: 336, y: 300 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 17, y: 139 },
    anchor: { x: 560, y: 1350 }, scale: 0.95 },
};

/**
 * Liễu Thiều (ngoại hiệu Vô Ảnh), sát thủ hệ Phong (RB-075, nghề Sát thủ chưa mở trong trận; chỉ có trên trang xem thử). Bộ tranh Shan gửi 30/10
 * (nền trong suốt sẵn). Ảnh đứng tách lớp bằng code: sáo trúc tách khỏi bàn tay phải để cùng xoay quanh cổ tay, bàn tay
 * trái và đầu (cả búi tóc) tách riêng. Hệ tọa độ: ảnh đứng 1024×1536.
 */
const VO_ANH: WarriorRig = {
  skeleton: "warrior",
  dir: "vo-anh",
  texScale: 0.5,
  foot: { x: 540, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 199, y: 11, w: 625, h: 1509 },
    armR: { x: 702, y: 658, w: 67, h: 120 },
    sword: { x: 138, y: 588, w: 326, h: 195 },
    arm: { x: 295, y: 640, w: 88, h: 101 },
    head: { x: 425, y: 15, w: 201, h: 204 },
  },
  cloth: [],
  covers: [],
  joints: {
    shoulder: { x: 335, y: 650 },
    elbowR: { x: 735, y: 672 },
    neck: { x: 540, y: 200 },
  },
  blade: [{ x: 150, y: 597 }, { x: 455, y: 772 }],
  strikeFx: "flutePulse",
  fxColor: 0x2e9e90,
  // Bước ngang thúc cùi chỏ, sáo thu bên hông (đánh thường), đứng nghiêng thổi sáo (ra chiêu), bước rộng xoay người vẫn
  // thổi sáo (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 58, y: 16 },
      anchor: { x: 620, y: 1490 }, scale: 1, burst: { x: 816, y: 310 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 150, y: 10 },
      anchor: { x: 580, y: 1500 }, scale: 1, burst: { x: 552, y: 190 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 9, y: 27 },
      anchor: { x: 560, y: 1470 }, scale: 1, burst: { x: 668, y: 222 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 9, y: 177 },
    anchor: { x: 560, y: 1350 }, scale: 0.95 },
};

/**
 * Vũ Phong (Trần Vũ Phong – Vân Du Tử), nhân vật đặc biệt dung hợp tám nghề/bảy hệ, phòng thủ Phong (đang thiết kế, chưa
 * có trong roster; chỉ có trên trang xem thử, docs/03-characters/vu-phong.md). Bộ tranh Shan gửi 02/11 (nền trong suốt
 * sẵn). Ảnh đứng tách lớp bằng code: trượng trúc cùng nắm tay phải xoay quanh cổ tay, bàn tay trái, đầu (cả dải buộc tóc)
 * và đuôi khăn bay tách riêng; thân giữ búi tóc sau lưng, hồ lô và túi. Trượng dựng xuống đất nên dùng nhịp `staff` nhẹ.
 * Hệ tọa độ: ảnh đứng 1024×1536.
 */
const VU_PHONG: WarriorRig = {
  skeleton: "warrior",
  weapon: "staff",
  dir: "vu-phong",
  texScale: 0.5,
  foot: { x: 510, y: 1500 },
  height: 1490,
  parts: {
    body: { x: 184, y: 209, w: 822, h: 1308 },
    armR: { x: 711, y: 728, w: 76, h: 124 },
    sword: { x: 187, y: 691, w: 86, h: 800 },
    arm: { x: 174, y: 584, w: 118, h: 118 },
    head: { x: 382, y: 6, w: 286, h: 260 },
  },
  cloth: [
    { name: "scarf", box: { x: 697, y: 316, w: 306, h: 198 },
      wind: { axis: "x", start: 0.12, amp: 9, freq: 1.5, k: 3.2, phase: 0.5, vertical: true } },
  ],
  covers: [],
  joints: {
    shoulder: { x: 240, y: 604 },
    elbowR: { x: 745, y: 752 },
    neck: { x: 520, y: 245 },
  },
  blade: [{ x: 245, y: 700 }, { x: 220, y: 1478 }],
  strikeFx: "galeRout",
  fxColor: 0x2e9e90,
  // Quét trượng ngang thấp, tay trái mở (đánh thường), chùng gối bước ngang dẫn mưa bằng chưởng trái, trượng chúc chéo
  // (ra chiêu ô2), tấn rộng dựng trượng chéo trên đầu dang tay trái gọi gió (tuyệt chiêu).
  poses: {
    attack: { name: "pose-attack", texScale: 0.3, origin: { x: 56, y: 74 },
      anchor: { x: 487, y: 1478 }, scale: 1, burst: { x: 930, y: 748 } },
    cast: { name: "pose-cast", texScale: 0.3, origin: { x: 22, y: 290 },
      anchor: { x: 495, y: 1296 }, scale: 0.92, burst: { x: 967, y: 622 } },
    ultimate: { name: "pose-ultimate", texScale: 0.3, origin: { x: 22, y: 0 },
      anchor: { x: 570, y: 1282 }, scale: 0.92, burst: { x: 1155, y: 385 } },
  },
  down: { name: "pose-down", texScale: 0.3, origin: { x: 32, y: 10 },
    anchor: { x: 870, y: 965 }, scale: 0.85 },
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
  ngoNhatKhanh: NGO_NHAT_KHANH,
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
  dinhNgoc: DINH_NGOC,
  vuPhong: VU_PHONG,
  bachPhongDao: BACH_PHONG_DAO,
  docAnh: DOC_ANH,
  hanGiangKhach: HAN_GIANG_KHACH,
  xichDa: XICH_DA,
  diaAn: DIA_AN,
  loiAnh: LOI_ANH,
  voAnh: VO_ANH,
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
