// Kiểu dữ liệu rig dùng chung cho mọi file nhân vật trong thư mục này.

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
   *
   * Hiệu ứng riêng của tướng lịch sử (chỉ ở tuyệt chiêu, theo chiêu ô 4): `fireBanner` (Nguyễn Bặc) cầu lửa giáng xuống
   * đối thủ đứng đầu, lửa bén lên họ, mũi tên vàng dâng quanh đồng đội; `earthAegis` (Đinh Điền) khiên mặt trống trước
   * từng đồng đội, sóng đất và vòng gai đá quanh chính mình; `goldEdict` (Lưu Cơ) tiền vàng bật khỏi và khiên giáp nứt
   * trên từng đối thủ; `herbGrace` (Trịnh Tú) hai đợt vòng lá nở dưới chân từng đồng đội; `royalSeal` (Đinh Liễn) cột
   * nước đông băng và ấn nứt trên từng đối thủ; `ironCharge` (Trần Cương) mũi sáng phá giáp tới đối thủ đứng đầu, giáp
   * họ vỡ; `riverGuard` (Trần Lãm) sương nước phủ từng đối thủ, cột nước trên đối thủ đứng đầu; `galeRise` (Ngô Nhật
   * Khánh) lốc cuốn và khiên nứt trên từng đối thủ; `goldPlot` (Ngô Xương Xí) mũi sáng tới đối thủ đứng đầu rồi tiền
   * vàng bật khỏi họ; `tigerClaw` (Phạm Bạch Hổ) hai nhát chém lửa bắt chéo như vuốt hổ, lửa bén lên đối thủ, mũi tên
   * vàng quanh chính mình.
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
    | "flutePulse"
    | "fireBanner"
    | "earthAegis"
    | "goldEdict"
    | "herbGrace"
    | "royalSeal"
    | "ironCharge"
    | "riverGuard"
    | "galeRise"
    | "goldPlot"
    | "tigerClaw";
  /**
   * Đinh Bộ Lĩnh đổi nghề và hệ theo người chơi: tuyệt chiêu mượn hiệu ứng và màu của nhân vật kèm cùng nghề, cùng hệ
   * (xem `rigFor`).
   */
  readonly adaptiveFx?: boolean;
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
