// Nội dung thẻ Hướng dẫn của từng chế độ chơi. Văn phong theo "Văn phong giao diện" ở docs/00-overview/thuat-ngu.md:
// gọi người chơi là "bạn", câu ngắn nói việc cần làm, tên chế độ và tên riêng viết hoa mọi chữ, tài nguyên viết thường giữa câu.
// Số liệu lấy từ hằng số trong src/core và luật ở docs/02-game-modes/; đổi luật thì sửa cả hai nơi.

import { ARENA_ATTACKS_PER_DAY, ARENA_WIN_GOLD } from "@/core/arena/arena";
import { DAILY_GOLD } from "@/core/daily/daily";
import { SURVIVAL_BOSS_EVERY, SURVIVAL_WAVE_GOLD } from "@/core/survival/survival";
import { TRIAL_FLOORS } from "@/core/progress/dualTowerState";
import { DT_ITEM_PICKS, DT_LEVELS } from "@/core/do-tham";
import { SL_AID_USE_MAX, SL_LEVELS, SL_START_AIDS, type SlAid } from "@/core/su-lo";
import { KL_CLEAR_BONUS_BASE, KL_CLEAR_BONUS_PER_LEVEL, KL_CLEAR_HEARTS, KL_HEIGHT, KL_KINDS, KL_START_HEARTS, KL_START_TOOLS, KL_TIMED_CLEAR_SECONDS, KL_TIMED_LEFT_SECONDS, KL_TIMED_START_SECONDS, KL_TOOL_CHARGE, KL_WIDTH } from "@/core/khai-lo/engine";
import { ELEMENTS, type Element } from "@/core/battle/elements";
import { ENERGY_PER_TILE, FOOD_PER_TILE, FOOD_START, FOOD_UPKEEP, HEAL_PER_TILE_RATIO, PASSIVE_TURNS, RAGE_PER_DRUM, SPIRIT_DECAY_START_TURN, TURN_MS } from "@/core/battle/rules";
import type { TileKind } from "@/core/board/tiles";
import { ELEMENT_NAME, TILE_NAME } from "./battle/labels";
import { DT_ITEM_INFO } from "./do-tham/items";
import { KL_TOOL_HINT, KL_TOOL_NAME } from "./khai-lo/tools";
import { EXPEDITION_REST_HEAL, EXPEDITION_SCOUT_SIGHT } from "@/core";
import { DEFEAT_RATIO, ENCOUNTERS_PER_DAY, TOLL_RATIO, TRADE_LEG_MINUTES, TRADE_PASSES_PER_DAY, TRADE_START_MONEY } from "@/core/trade";
import type { PieceType } from "@/core/tam-quan-ky";
import { BOAT_FARE, BUYOUT_RATE, DTK_GOLD, DTK_REWARDS_PER_DAY, FESTIVAL_RATE, HOLD_RATE, JAIL_BAIL, JAIL_TRIES, LEVEL_NAME, MAX_LEVEL_ON_BUY, SALARY, SCENIC_PRICE, SCENIC_RENT, SELL_RATE, START_CASH, TRIBUTE_BASE, TRIBUTE_PER_LEVEL } from "@/core/dien-trang-ky";
import type { Scene } from "./scene";

/** Các chế độ có thẻ Hướng dẫn (mười hai chế độ ở thẻ Chiến Trường và Tam Quân Kỳ ở mục Sắp ra mắt). */
export type GuideScene = Extract<
  Scene,
  | "CAMPAIGN"
  | "TRIAL"
  | "DESTINY"
  | "SURVIVAL"
  | "DAILY"
  | "ARENA"
  | "FORMATION"
  | "KHAI_LO"
  | "DO_THAM"
  | "SU_LO"
  | "TAM_TUONG_KY"
  | "EXPEDITION"
  | "TAM_QUAN_KY"
  | "VAY_THANH_KY"
  | "TRADE"
  | "DIEN_TRANG_KY"
>;

export interface ModeGuide {
  /** Một hai câu nói chế độ này để làm gì. */
  readonly goal: string;
  /** Các bước chơi theo thứ tự. */
  readonly steps: readonly string[];
  /** Luật dễ nhầm, nên đọc trước khi chơi. */
  readonly rules: readonly string[];
  /** Thưởng và bảng xếp hạng. */
  readonly rewards: readonly string[];
  /** Lời khuyên ngắn. */
  readonly tips: readonly string[];
  /** Đạo cụ (hoặc trợ giúp, quân đặc biệt) của chế độ, mỗi món kèm icon như trong màn chơi. */
  readonly items?: GuideItems;
}

/** Icon của một đạo cụ trong Hướng dẫn; ModeGuide.tsx vẽ đúng hình đang dùng ở màn chơi. */
export type GuideIcon =
  | { readonly kind: "element"; readonly element: Element }
  | { readonly kind: "suLoAid"; readonly aid: SlAid }
  | { readonly kind: "formation"; readonly piece: "wild" | "eraser" }
  | { readonly kind: "tqkPiece"; readonly piece: PieceType }
  | { readonly kind: "tile"; readonly tile: TileKind };

export interface GuideItem {
  readonly icon: GuideIcon;
  readonly name: string;
  /** Cách dùng, một câu. */
  readonly text: string;
}

export interface GuideItems {
  /** Tiêu đề mục, ví dụ "Đạo cụ" hoặc "Trợ giúp". */
  readonly title: string;
  /** Luật chung của các đạo cụ: có bao nhiêu, nạp thế nào. */
  readonly notes: readonly string[];
  readonly list: readonly GuideItem[];
}

/** Bảy đạo cụ theo hệ, xếp theo thứ tự ELEMENTS (đúng thứ tự phím 1–7 trong màn chơi). */
const elementItems = (info: (e: Element) => { name: string; text: string }): GuideItem[] =>
  ELEMENTS.map((e) => ({ icon: { kind: "element", element: e }, name: `${info(e).name} (${ELEMENT_NAME[e]})`, text: info(e).text }));

export const GUIDE_SCENES: readonly GuideScene[] = [
  "CAMPAIGN",
  "TRIAL",
  "DESTINY",
  "SURVIVAL",
  "DAILY",
  "ARENA",
  "FORMATION",
  "KHAI_LO",
  "DO_THAM",
  "SU_LO",
  "TAM_TUONG_KY",
  "EXPEDITION",
  "TAM_QUAN_KY",
  "VAY_THANH_KY",
  "TRADE",
  "DIEN_TRANG_KY",
];

/** Cách đổi ô và phím tắt trên bàn cờ trận đấu; trước đây là dòng chữ dưới bàn cờ (Shan 20/11/2026: gợi ý đưa vào Hướng dẫn). */
const BATTLE_CONTROLS =
  "Vuốt, kéo hoặc bấm hai ô kề nhau để đổi chỗ. Bàn phím: mũi tên hoặc WASD di chuyển, Enter chọn ô, 1–6 dùng kỹ năng, Tab đổi người hành động, Esc hủy.";

/** Bảy loại ô theo thứ tự hiện trên bàn cờ; số liệu khớp src/core/battle/rules.ts và docs/01-gameplay/ban-co.md. */
const TILE_ITEMS: readonly GuideItem[] = [
  { icon: { kind: "tile", tile: "kiem" }, name: TILE_NAME.kiem, text: "Đánh thường vào đối thủ đứng đối diện. Ghép càng nhiều ô, đòn càng nặng." },
  { icon: { kind: "tile", tile: "amDuong" }, name: TILE_NAME.amDuong, text: `Mỗi ô cho người đang hành động ${ENERGY_PER_TILE} năng lượng để dùng kỹ năng.` },
  { icon: { kind: "tile", tile: "banhChung" }, name: TILE_NAME.banhChung, text: `Mỗi ô cộng ${FOOD_PER_TILE} lương cho cả đội, giữ đội khỏi đói.` },
  { icon: { kind: "tile", tile: "tim" }, name: TILE_NAME.tim, text: `Mỗi ô hồi ${Math.round(HEAL_PER_TILE_RATIO * 100)}% máu tối đa cho người đang hành động.` },
  { icon: { kind: "tile", tile: "vang" }, name: TILE_NAME.vang, text: "Nhặt vàng mang ra ngoài trận, ở chế độ có tính vàng nhặt trên bàn." },
  { icon: { kind: "tile", tile: "sach" }, name: TILE_NAME.sach, text: "Nhặt kinh nghiệm cho tướng, ở chế độ có tính kinh nghiệm." },
  { icon: { kind: "tile", tile: "trong" }, name: TILE_NAME.trong, text: `Mỗi ô cộng ${RAGE_PER_DRUM} Nộ cho người đang hành động. Nộ đầy thì bị động tự bật.` },
];

/**
 * Luật nền của trận đổi ô, dùng chung cho mọi chế độ đánh trận (Bình Loạn, hai tháp, Trấn Ải, Nhật Lệnh, Quần Hùng, Viễn Chinh).
 * Người mới vào thẳng một chế độ vẫn đọc được cách đánh mà không phải mở Cẩm nang.
 */
const BATTLE_ITEMS: GuideItems = {
  title: "Cách đánh trên bàn cờ",
  notes: [
    "Bàn cờ có 12 cột, 8 hàng. Mỗi lượt bạn đổi chỗ hai ô kề nhau để xếp từ 3 ô cùng loại trở lên thành hàng ngang hoặc hàng dọc. Các ô ấy vỡ ra, có tác dụng như bảng dưới, ô phía trên rơi xuống lấp chỗ.",
    `Một lượt đi theo thứ tự: dùng tối đa một kỹ năng, rồi đổi ô một nước. Chỉ nước đổi ô mới kết thúc lượt. Mỗi lượt có ${TURN_MS / 1000} giây, dùng kỹ năng xong thì đồng hồ đặt lại; hết giờ là mất lượt nhưng không mất máu.`,
    "Đổi hai ô mà không ghép được thì ô bật về chỗ cũ, không bị phạt, nhưng đồng hồ vẫn chạy.",
    "Ghép 4 ô trở lên thì được đi thêm một lượt, mỗi nước tối đa một lượt thêm. Ô rơi xuống tự ghép tiếp (dây chuyền) cũng tính, mỗi bước dây chuyền đánh mạnh thêm 10%, tối đa 50%.",
    "Ghép chữ L hoặc chữ T tạo ô đặc biệt bản yếu, ghép thẳng 5 ô tạo bản mạnh. Ghép tiếp ô đặc biệt ấy để nổ vùng, xóa hàng, xóa cột hoặc hồi máu cả đội tùy loại ô; ô bị nổ đều được tính như ghép.",
    "Dùng kỹ năng: bấm nút kỹ năng của người đang hành động, rồi chọn đối thủ, đồng đội hoặc ô làm tâm nếu kỹ năng hỏi. Kỹ năng tốn từ 20 đến 100 năng lượng, mỗi tướng tối đa 100. Rê chuột hoặc chạm giữ nút kỹ năng để đọc tác dụng.",
    `Nộ của mỗi tướng tăng khi ghép ${TILE_NAME.trong} hoặc khi tướng mất máu. Nộ đầy 100 thì bị động theo hệ của tướng ấy tự bật trong ${PASSIVE_TURNS} lượt, không tốn năng lượng.`,
    `Đánh 3 đấu 3: người vừa ra tay phải nghỉ một lượt, máy sáng sẵn người kế tiếp, bạn chạm chân dung để đổi người khác. Đòn ${TILE_NAME.kiem} đánh vào đối thủ đứng đối diện; đối diện đã gục thì đánh người gần nhất. Đánh 1 đấu 1 thì máu mỗi bên gấp đôi.`,
    `Lương chung cả đội, bắt đầu ${FOOD_START} và tụt ${FOOD_UPKEEP} mỗi lượt của phe mình. Từ 70 trở lên đội hăng hái, đánh mạnh thêm 15%. Dưới 30 là đói: sát thương giảm 25%, năng lượng từ ${TILE_NAME.amDuong} còn một nửa. Cạn lương thì sát thương còn một nửa và mỗi lượt mất 3% máu.`,
    "Nguyên tố: đánh hệ mình khắc thì thêm 25% sát thương, đánh hệ khắc mình thì giảm 25%, đánh hệ mình sinh ra thì thêm 10%. Kim khắc Mộc, Mộc khắc Thổ và Phong, Thủy khắc Hỏa, Hỏa khắc Kim, Thổ khắc Thủy và Lôi, Lôi khắc Thủy, Phong khắc Thổ.",
    `Từ lượt ${SPIRIT_DECAY_START_TURN} của phe, Tinh thần từng tướng giảm dần: máu hồi và khiên mới nhận yếu đi, còn 20% từ lượt 44. Trận càng dài càng nên dồn sát thương thay vì chờ hồi máu.`,
    "Bàn hết nước đi thì tự xáo lại, không tính lượt. Đối thủ do máy điều khiển chịu đúng luật như bạn.",
  ],
  list: TILE_ITEMS,
};

export const MODE_GUIDES: Readonly<Record<GuideScene, ModeGuide>> = {
  DIEN_TRANG_KY: {
    goal: `Làm phú hộ thời mười hai sứ quân: đổ xúc xắc đi vòng bàn 40 ô, tậu đất, dựng nhà, thu tô người khác. Ai cũng khởi đầu ${START_CASH.toLocaleString("vi-VN")} quan; chơi tới khi chỉ còn một người chưa phá sản.`,
    steps: [
      "Chọn cách chơi: đấu sứ quân có thưởng (1–3 sứ quân máy), cùng máy (2–4 ghế, người hoặc máy) hoặc phòng mã (mời bạn bè bằng mã 6 ký tự).",
      "Chọn hệ của bạn. Hệ chỉ đổi kiểu dáng và màu nhà bạn xây, không đổi tô hay luật.",
      "Tới lượt thì bấm Đổ xúc xắc. Quân đi ngược chiều kim đồng hồ, bắt đầu từ Kinh thành Hoa Lư ở góc dưới phải.",
      `Dừng ở đất trống thì được mua, có thể dựng luôn tới ${LEVEL_NAME[MAX_LEVEL_ON_BUY]}. Dừng lại ở đất của mình thì xây thêm bậc.`,
      "Dừng ở đất người khác thì chọn nộp tô, hoặc mua lại đất đó.",
      "Bị giam ở Lao Ngục thì đầu lượt chọn đổ thử tìm đôi, hoặc nộp tiền chuộc để đi ngay.",
      "Chợ phiên, Bến Sông Đáy, Hội Cờ Lau và lúc phải bán đất: chọn ô sáng lên trên bàn. Chạm một ô bất kỳ để xem giá và tô.",
    ],
    rules: [
      `Mỗi lần đi qua Hoa Lư lĩnh ${SALARY} quan lương vòng. Đổ ra đôi được đổ thêm một lần, tối đa một lần mỗi lượt.`,
      `Năm bậc nhà: ${LEVEL_NAME.slice(1).join(", ")}. Mỗi bậc tốn nửa giá đất, riêng ${LEVEL_NAME[5]} tốn bằng giá đất và chỉ xây được khi giữ đủ hai ô của vùng (hùng cứ).`,
      `Hùng cứ cả vùng thì tô hai ô của vùng nhân ${HOLD_RATE}. Ô đang mở Hội Cờ Lau thu tô gấp ${FESTIVAL_RATE}, tới khi có người mở hội nơi khác.`,
      `Mua lại đất người khác tốn gấp ${BUYOUT_RATE} giá trị ô (đất và nhà), trả cho chủ đất, nhà giữ nguyên. ${LEVEL_NAME[5]} không ai mua lại được.`,
      `Ô riêng: Quẻ bói rút quẻ thời loạn; Thuế đinh nộp một phần mười tiền mặt; Cống nạp nộp ${TRIBUTE_BASE} quan cộng ${TRIBUTE_PER_LEVEL} quan mỗi bậc nhà; Chợ phiên mua một ô trống bất kỳ.`,
      `Bốn danh thắng (Đền Hùng, Núi Tản Viên, Chùa Dâu, Tràng An) giá ${SCENIC_PRICE} quan, không xây nhà. Tô theo số danh thắng cùng một chủ: ${SCENIC_RENT.slice(1).join(", ")} quan cho 1, 2, 3, 4 nơi. Danh thắng vẫn mua lại và mở hội được.`,
      `Góc bàn: Bến Sông Đáy trả ${BOAT_FARE} quan để tới ô bất kỳ; Hội Cờ Lau mở hội trên đất mình; Lao Ngục chỉ là ô ghé qua nếu không bị giam.`,
      `Bị giam khi rút quẻ Bị quan bắt giam. Trong ngục, mỗi lượt đổ thử một lần: ra đôi thì ra và đi luôn; hỏng ${JAIL_TRIES} lần thì mãn hạn, ra và đi theo lần đổ cuối. Nộp ${JAIL_BAIL} quan chuộc thì ra ngay đầu lượt. Bị giam vẫn thu tô bình thường.`,
      `Thiếu tiền thì bán đất lại cho triều đình được ${Math.round(SELL_RATE * 100)}% giá trị. Bán hết vẫn thiếu là phá sản: tiền còn lại về chủ nợ, đất về trống. Không đổi hay bán đất cho nhau.`,
      "Phòng mã: mỗi quyết định có 30 giây, quá giờ máy đi thay một bước; quá giờ hai lần liền thì máy đi thay luôn tới khi bạn bấm lại. Rời ván tính như phá sản.",
    ],
    rewards: [
      `Đấu sứ quân có thưởng và phòng mã: vàng theo thứ hạng trong ván. Ván 2 người: hạng nhất ${DTK_GOLD[2]![0]} vàng. Ván 3 người: ${DTK_GOLD[3]![0]} và ${DTK_GOLD[3]![1]} vàng cho hai hạng đầu. Ván 4 người: ${DTK_GOLD[4]![0]}, ${DTK_GOLD[4]![1]} và ${DTK_GOLD[4]![2]} vàng cho ba hạng đầu.`,
      `Tối đa ${DTK_REWARDS_PER_DAY} ván có vàng mỗi ngày. Chế độ này không xếp hạng theo mùa.`,
      "Ván cùng máy là giao hữu, không có vàng, không cần tài khoản.",
    ],
    tips: [
      "Gom đủ hai ô một vùng sớm: tô nhân lên và mở được Trang ấp, không ai mua lại được.",
      "Giữ ít tiền mặt phòng thuế và tô bất ngờ; bán đất chỉ được nửa giá.",
      "Mười hai sứ quân mỗi người một lối: Mãnh công mua hăng, Thủ thành giữ tiền, Mưu phá hay mua lại đất để phá thế hùng cứ.",
    ],
  },
  TRADE: {
    goal: `Làm thương nhân thời mười hai sứ quân: mua hàng nơi rẻ, chở tới nơi đắt mà bán. Ai cũng khởi đầu ${TRADE_START_MONEY.toLocaleString("vi-VN")} kim tiền ở một bến chợ ngẫu nhiên; hết tuần, ai lãi nhiều nhất đứng đầu.`,
    steps: [
      "Xem bảng giá: chọn bất kỳ điểm nào trên bản đồ để xem giá và tồn kho phiên hiện tại của chợ đó.",
      "Mua hàng ở chợ đang đứng: chạm vào thẻ hàng, nhập số lượng rồi mua. Xem khoang còn bao nhiêu chỗ.",
      `Chọn một điểm có đường nối rồi xuất hành. Mỗi chặng tốn 1 lộ phiếu, đi ${TRADE_LEG_MINUTES[1]}, ${TRADE_LEG_MINUTES[2]} hoặc ${TRADE_LEG_MINUTES[3]} phút tùy xa gần. Không cần mở game trong lúc đi.`,
      "Tới nơi thì bán hàng, mua chuyến mới, hoặc giao thương với đoàn đã gặp trên đường.",
    ],
    rules: [
      `Mỗi ngày ${TRADE_PASSES_PER_DAY} lộ phiếu, không cộng dồn sang hôm sau, không mua thêm được.`,
      "Giá đổi mỗi hai giờ, ai cũng thấy như nhau. Chỉ xem được phiên hiện tại, không xem trước phiên sau.",
      "Có 40 món hàng. Mỗi chợ bày khoảng 20 món: phần lớn bày cố định, vài món chỉ có ở một số phiên. Chợ không bày món nào thì không mua bán món đó ở đó.",
      "Kho chung cho mọi người: ai mua thì kho giảm, ai bán thì hàng vào kho. Kho thiếu thì phiên sau giá lên, kho ứ thì giá xuống; chợ ứ quá thì tạm không thu mua món đó.",
      "Bán lại tại chỗ luôn lỗ: giá thu mua chỉ bằng 90% giá bán ra.",
      "Mỗi chợ có 2 món Đặc sản, rẻ ở quê nhà, chở càng xa càng đắt. Món Hiếm là món chợ vốn không bày nhưng phiên này có ít hàng về, giá cao; mỗi phiên 1–2 món.",
      "Màu viền ô hình cho biết phẩm cấp: viền nâu là hàng thường dụng, viền ngọc là thượng phẩm, viền vàng là kỳ trân.",
      "Kỳ trân dị bảo lãi lớn nhưng ít hàng, 5 món chung một ô khoang, chở kỳ trân dễ gặp nạn hơn.",
      `Trên đường có thể gặp giặc sông, sóng dữ hay thảo khấu (tối đa ${ENCOUNTERS_PER_DAY} lần mỗi ngày). Nộp mãi lộ mất ${Math.round(TOLL_RATIO * 100)}% giá trị hàng; đánh trận ghép ô dễ, thắng giữ trọn hàng, thua mất ${Math.round(DEFEAT_RATIO * 100)}%. Không bao giờ mất đoàn.`,
      "Hai đoàn đi cùng chặng, trùng giờ ít nhất 5 phút là gặp nhau. Tới nơi, một bên ngỏ lời đổi hàng hoặc kim tiền, bên kia đồng ý mới đổi; không cần cùng vào game. Mỗi chuyến chỉ giao thương một lần, lời ngỏ tự hủy khi một bên xuất hành chặng mới.",
      "Kim tiền của người khác không hiện ở đâu, trừ lãi mùa trên bảng Công trạng.",
    ],
    rewards: [
      "Điểm mùa là kim tiền lãi so với vốn đầu mùa; hàng còn trong khoang và tiền nâng cấp không tính.",
      "Mùa đổi vào thứ Hai 0 giờ: kim tiền, khoang và cấp đoàn hàng làm lại từ đầu. Hạng cuối mùa nhận vàng và Đá Cường Hóa.",
    ],
    tips: [
      "Bán hết hàng trước khi mùa khép để lãi được tính.",
      "Đọc cột % đổi giá: chợ vừa bị mua cạn thường lên giá ở khung sau.",
      "Nâng cấp sớm thì khoang rộng và đi nhanh hơn cho cả tuần.",
    ],
  },
  VAY_THANH_KY: {
    goal: "Cờ vây trên bàn đất của bảy hệ: mỗi bên chọn một nguyên tố, quân thành quả cầu của hệ ấy, đất quanh quân đổi sắc theo hệ. Vây được nhiều đất hơn, hoặc bắt quân trước ở ván nhập môn, là thắng.",
    steps: [
      "Chọn cách chơi: luyện với sứ quân, đấu sứ quân có thưởng, hai người cùng máy hoặc đấu người bằng mã phòng.",
      "Chọn luật (Vây đất hoặc Bắt quân trước), cỡ bàn 9, 13 hoặc 19 và nguyên tố mỗi bên. Đấu sứ quân thì chọn thêm sứ quân, độ khó và bạn đi trước hay đi sau.",
      "Đấu người: một người bấm Mở phòng rồi gửi mã 6 ký tự, người kia nhập mã và bấm Vào phòng. Người mở phòng đi trước.",
      "Hai bên lần lượt đặt một quân lên một giao điểm trống (chỗ hai đường kẻ cắt nhau). Quân đã đặt không di chuyển nữa.",
      "Bấm một giao điểm trống để đặt quân. Trên điện thoại chạm một lần để xem trước, chạm lần nữa để đặt.",
      "Không còn chỗ đáng đi thì bấm Bỏ lượt. Hai bên cùng bỏ lượt thì ván dừng để đếm điểm.",
      "Khi đếm điểm, máy đánh dấu quân chết bằng gạch chéo. Bấm vào nhóm quân để sửa, rồi bấm Chốt điểm.",
    ],
    rules: [
      "Mỗi nhóm quân liền nhau (nối theo đường kẻ, không tính chéo) cần ít nhất một khí, tức giao điểm trống kề bên. Hết khí thì cả nhóm bị bắt khỏi bàn.",
      "Không được đặt quân vào chỗ hết khí, trừ khi nước ấy bắt được quân bên kia.",
      "Luật cướp (ko): vừa bị bắt một quân thì chưa được bắt lại ngay ở đúng chỗ ấy, phải đi nơi khác một nước.",
      "Vây đất: điểm là số quân trên bàn cộng đất trống chỉ quân mình bao quanh. Bên đi sau được cộng 7,5 điểm bù vì đi chậm một nước. Điểm cao hơn là thắng.",
      "Bắt quân trước: ván nhập môn bắt đầu từ thế chéo giữa bàn, ai bắt được quân trước là thắng.",
      "Nguyên tố chỉ đổi hình quân và nền đất, không đổi luật. Đất tô màu trong ván là ước lượng vùng ảnh hưởng, điểm thật chỉ tính lúc đếm.",
      "Luyện với sứ quân và hai người cùng máy được bấm Đi lại. Đấu sứ quân có thưởng và đấu người không có đi lại. Bấm Đầu hàng là thua ván.",
    ],
    rewards: [
      "Đấu sứ quân có thưởng: thắng được 20, 40 hoặc 80 vàng theo độ khó Dễ, Thường, Khó, tối đa 3 ván có vàng mỗi ngày. Ván chạy trên máy chủ, cần trình danh.",
      "Luyện với sứ quân, hai người cùng máy và đấu người là giao hữu, không có vàng.",
      "Đấu người cần trình danh; máy chủ làm trọng tài, có đồng hồ, hai bên cùng bỏ lượt thì máy chủ tự đếm điểm.",
    ],
    tips: [
      "Mới chơi thì chọn luật Bắt quân trước trên bàn 9×9, đấu sứ quân độ khó Dễ để quen cách bắt quân.",
      "Góc dễ giữ đất nhất, rồi tới cạnh, giữa bàn khó nhất. Mở ván nên đặt quân gần góc.",
      "Nhóm có hai mắt (hai khoảng trống tách rời bên trong) thì không bao giờ bị bắt.",
      "Nhóm quân của bạn chỉ còn một khí là đang bị dọa bắt: nối thêm quân để thêm khí, hoặc bỏ nhóm ấy đi nơi khác.",
      "Bàn 9×9 hợp để làm quen; bàn 19×19 ván dài, máy nghĩ lâu hơn.",
    ],
  },
  TAM_QUAN_KY: {
    goal: "Cờ tư lệnh trên sa bàn tập trận của Đinh Bộ Lĩnh: ba quân bộ, thủy và thiên mã cùng ra trận. Vây Chủ tướng bên kia đến hết đường thoát, hoặc chiếm giữ Soái trướng của họ, là thắng.",
    steps: [
      "Chọn cách chơi: luyện với sứ quân, đấu sứ quân có thưởng, hai người cùng máy hoặc đấu người 1vs1. Chọn sứ quân, độ khó, bản đồ và đồng hồ.",
      "Đấu người: một người bấm Mở phòng rồi gửi mã 6 ký tự, người kia nhập mã và bấm Vào phòng.",
      "Quân của bạn ở mép dưới sa bàn, thẻ của bạn bên trái, thẻ đối thủ bên phải (điện thoại: đối thủ trên sa bàn, bạn dưới sa bàn). Thẻ có viền vàng là bên đang tới lượt.",
      "Bấm một quân của mình. Sa bàn hiện chỗ đi được: chấm xanh là ô trống đi tới, vòng xanh là lên chung với quân mình, vòng đỏ là quân địch ăn hoặc bắn được, vòng vàng đứt nét là Thiên mã lao vào vùng cấm bay (mất cả hai quân).",
      "Bấm ô đích để đi. Ô nào có hai cách đánh (tiến vào ăn hoặc bắn tại chỗ) thì hàng nút dưới sa bàn hỏi bạn chọn.",
      "Bấm vào một chồng quân thì bảng bên trái hỏi đi quân nào: cả chồng theo luật của quân chở, hay một quân rời chồng đi riêng theo luật của nó.",
      "Bấm quân khác để đổi quân, bấm ô trống không đi được để bỏ chọn. Bàn phím: mũi tên dò ô, Enter chọn.",
      "Mỗi nước đi ra là chốt, không có đi lại. Nhật ký trận bên phải ghi đủ mọi nước của hai bên.",
    ],
    rules: [
      "Bàn có 11 cột (a đến k) và 12 hàng, quân đứng trên giao điểm. Mỗi bên 19 quân. Quân Đỏ của Bộ Lĩnh đi trước. Bản đồ chỉ đổi cảnh, đầm, sông và cầu luôn ở cùng chỗ.",
      "Địa hình: cột a và b là đầm, chỉ Chiến thuyền xuống được. Cột c là bãi lau, cả thuyền lẫn quân bộ đều đứng được. Cửa sông d6, e6, d7, e7 thuyền vào được. Quân bộ không lội qua đầm.",
      "Sông chảy giữa hàng 6 và hàng 7, có hai cầu tre ở cột f và h. Máy bắn đá, Nỏ thủ và Hỏa tiễn là quân nặng: chỉ qua sông khi đi thẳng dọc cột f hoặc h trên cầu, hoặc khi Phu cầu chở. Các quân khác qua sông chỗ nào cũng được.",
      "Ăn quân: quân thường tiến vào ô quân địch, không vượt quân cản. Quân bắn xa (Máy bắn đá, Hỏa tiễn, Thiên mã, Chiến thuyền) bắn vượt quân cản và được chọn bắn tại chỗ: quân địch mất, quân mình đứng yên. Quân không đứng được ở ô địch (như quân bộ đánh thuyền dưới đầm) thì chỉ bắn tại chỗ.",
      "Chồng quân: đi vào ô có quân mình thì lên chung nếu quân ở đó chở được. Cả chồng đi theo luật của quân chở. Quân chở bị ăn thì mất cả chồng. Soái trướng cho Chủ tướng vào trú.",
      "Vùng cấm bay: Nỏ thủ và Chiến thuyền phủ một vòng tám ô quanh mình, Hỏa tiễn phủ hai ô thẳng và một ô chéo. Thiên mã địch không bay vào hay bay qua vùng ấy; lao vào để đánh một quân trong vùng thì mất cả hai.",
      "Anh hùng: quân nào chiếu được Chủ tướng bên kia thì thành anh hùng (chấm vàng ở góc quân), quân cuối cùng còn lại ngoài Chủ tướng cũng thành anh hùng. Anh hùng đi và ăn xa thêm một ô, quân chưa đi chéo được thì nay đi chéo được, Thiên mã anh hùng bay qua vùng cấm bay không mất.",
      "Chiếu tướng: không được đi nước để Chủ tướng mình bị ăn ở nước sau. Hai Chủ tướng không được đứng đối mặt trên cùng một hàng hay một cột trống; Chủ tướng đang được chở hoặc trú trong Soái trướng thì không tính.",
      "Thắng khi Chủ tướng bên kia bị chiếu mà hết đường thoát, khi giữ ô Soái trướng bên kia đủ ba lượt của mình liên tiếp, hoặc khi bên kia hết giờ hay đầu hàng. Bên tới lượt không bị chiếu mà hết nước đi thì hòa.",
      "Không có đi lại ở mọi cách chơi: nước nào đã đi là chốt.",
    ],
    items: {
      title: "Quân và cách đi",
      notes: [
        "Hình bên cạnh mỗi quân vẽ quân thường đứng giữa sa bàn trống: chấm xanh là chỗ đi tới khi đường trống, vòng đỏ là chỗ ăn hoặc bắn được, ô xanh lam là vùng cấm bay quân ấy tạo ra. Mũi tên là đi tiếp tới khi gặp quân cản.",
        "Số trong ngoặc là số quân mỗi bên lúc khai cuộc. Đi thẳng là theo hàng hoặc cột; tám hướng là cả bốn đường chéo.",
      ],
      list: [
        { icon: { kind: "tqkPiece", piece: "c" }, name: "Chủ tướng (1)", text: "Đi thẳng bao xa cũng được khi đường trống, nhưng chỉ ăn quân ngay sát bên. Mất Chủ tướng là thua, nên mọi nước đều phải giữ Chủ tướng khỏi bị ăn. Lên được Voi chiến, Thiên mã, Chiến thuyền hoặc vào trú trong Soái trướng." },
        { icon: { kind: "tqkPiece", piece: "h" }, name: "Soái trướng (2)", text: "Đứng yên cả ván, không đi, không ăn. Chủ tướng vào trú được. Bên kia chiếm một trong hai ô Soái trướng của bạn và giữ đủ ba lượt là thắng." },
        { icon: { kind: "tqkPiece", piece: "i" }, name: "Bộ binh (2)", text: "Đi và ăn một ô thẳng. Lên được Voi chiến, Thiên mã hoặc Chiến thuyền để đi nhanh." },
        { icon: { kind: "tqkPiece", piece: "m" }, name: "Hương binh (1)", text: "Dân quen địa hình: đi và ăn một ô theo cả tám hướng. Lên được Voi chiến, Thiên mã hoặc Chiến thuyền." },
        { icon: { kind: "tqkPiece", piece: "e" }, name: "Phu cầu (2)", text: "Đi và ăn một ô thẳng. Kết bè chở một Máy bắn đá, Nỏ thủ hoặc Hỏa tiễn: cả chồng đi theo luật Phu cầu nên qua sông ở bất kỳ đâu." },
        { icon: { kind: "tqkPiece", piece: "t" }, name: "Voi chiến (2)", text: "Đi và ăn hai ô thẳng, không vượt quân cản. Trên bành chở được một Chủ tướng, Bộ binh hoặc Hương binh." },
        { icon: { kind: "tqkPiece", piece: "a" }, name: "Máy bắn đá (2)", text: "Đi ba ô theo tám hướng. Bắn xa ba ô, bắn vượt quân cản, được chọn tiến vào ăn hay bắn tại chỗ. Quân nặng: qua sông phải đi thẳng trên cầu tre hoặc nhờ Phu cầu chở." },
        { icon: { kind: "tqkPiece", piece: "g" }, name: "Nỏ thủ (2)", text: "Đi và ăn một ô thẳng. Tám ô quanh mình là vùng cấm bay, che quân mình khỏi Thiên mã địch. Quân nặng: qua sông phải đi trên cầu tre hoặc nhờ Phu cầu chở." },
        { icon: { kind: "tqkPiece", piece: "s" }, name: "Hỏa tiễn (1)", text: "Đi hai ô thẳng hoặc một ô chéo, bắn xa trong tầm ấy và bắn vượt quân cản. Vùng cấm bay rộng hai ô thẳng, một ô chéo. Quân nặng: qua sông phải đi trên cầu tre hoặc nhờ Phu cầu chở." },
        { icon: { kind: "tqkPiece", piece: "f" }, name: "Thiên mã (2)", text: "Bay bốn ô theo tám hướng, vượt qua mọi quân cản nhưng không bay vào hay qua vùng cấm bay. Ăn hoặc bắn tại chỗ trong tầm bốn ô. Lao vào đánh quân nằm trong vùng cấm bay thì mất cả hai. Chở được một Voi chiến và một Chủ tướng, Bộ binh hoặc Hương binh." },
        { icon: { kind: "tqkPiece", piece: "n" }, name: "Chiến thuyền (2)", text: "Chỉ đi trên nước (đầm, bãi lau, cửa sông), bốn ô theo tám hướng. Bắn vượt quân cản: thuyền và quân trên nước xa bốn ô, quân trên bờ xa ba ô. Tạo vùng cấm bay tám ô quanh mình. Chở một Thiên mã và một Chủ tướng, Bộ binh, Hương binh hoặc Voi chiến." },
      ],
    },
    rewards: [
      `Đấu sứ quân có thưởng: thắng được 20, 40 hoặc 80 vàng theo độ khó, tối đa 3 ván có vàng mỗi ngày. Ván chạy trên máy chủ, cần trình danh.`,
      "Luyện với sứ quân, hai người cùng máy và đấu người là giao hữu, không có vàng.",
      "Viền đỏ là quân Bộ Lĩnh, viền xanh là quân sứ quân. Chấm vàng ở góc quân là dấu anh hùng.",
    ],
    tips: [
      "Đưa Nỏ thủ lên sớm để che Thiên mã bên kia.",
      "Giữ quân che quanh Chủ tướng: Chủ tướng đi xa được nhưng chỉ ăn quân sát bên.",
      "Chiến thuyền chở Thiên mã và Voi chiến đi dọc đầm là đường vòng nhanh nhất sang đất bên kia.",
      "Quân nặng muốn qua sông nhanh thì cho lên bè Phu cầu, khỏi chen nhau ở hai cầu tre.",
      "Chiếu được Chủ tướng là quân thành anh hùng mạnh hơn hẳn, kể cả khi chưa chiếu bí.",
    ],
  },
  CAMPAIGN: {
    goal: "Cốt truyện chính của Cờ Lau. Bạn đóng vai Đinh Bộ Lĩnh, đi qua 6 chương và 24 nhiệm vụ, từ thuở nhỏ chăn trâu ở Hoa Lư, dẹp loạn 12 sứ quân đến đại lễ đăng quang năm 968. Đây là nơi nên bắt đầu nếu bạn mới vào game.",
    steps: [
      "Mở bản đồ Sử ký. Chương đang mở sáng lên, chương sau còn khóa cho tới khi bạn xong chương trước.",
      "Chọn chương rồi chọn nhiệm vụ đang mở. Nhiệm vụ đã xong có dấu hoàn thành, đánh lại được bất cứ lúc nào.",
      "Đọc lời kể. Nhiệm vụ sự kiện và ngoại giao chỉ cần chọn cách đáp, không phải đánh.",
      "Nhiệm vụ có trận thì vào màn chuẩn bị: đọc ô Mục tiêu, xem đối thủ, cấp gợi ý và lương đang có.",
      "Chọn hai phó tướng đi cùng chủ tướng Đinh Bộ Lĩnh, đổi hệ và nghề cho ông nếu muốn khắc hệ đối thủ, rồi xuất quân.",
      "Đánh trận theo luật ở mục Cách đánh trên bàn cờ bên dưới. Đạt mục tiêu là thắng nhiệm vụ.",
      "Thắng thì nhiệm vụ kế và tướng mới mở ra. Thua thì nhiệm vụ vẫn mở, bạn đổi đội rồi đánh lại.",
    ],
    rules: [
      "Mục tiêu mỗi trận khác nhau và ghi rõ ở màn chuẩn bị: có trận phải hạ hết đối thủ, có trận chỉ cần trụ đủ số lượt, có trận trùm chỉ cần đẩy xuống mức máu ghi sẵn, trận công thành đánh qua nhiều giai đoạn.",
      "Trận nhiều giai đoạn giữ giai đoạn đã qua: thua ở giai đoạn sau thì đánh lại từ giai đoạn ấy, máu trùm đã mất không hồi lại.",
      "Lương mang từ trận này sang trận sau, từ 20 đến 100 và bắt đầu ở 60. Ở màn chuẩn bị trận, 3 vàng đổi được 1 lương.",
      "Nhiệm vụ sự kiện và ngoại giao không trừ lương, không tính lượt.",
      "Mỗi đoạn lời kể có nhãn nguồn: sử ghi, dựng lại, còn tranh cãi hoặc hư cấu. Cảnh game sáng tác đều ghi rõ là hư cấu.",
      "Bình Loạn không có bảng công trạng, bạn chơi theo nhịp của mình.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      "Trận thắng cho kinh nghiệm, vàng và đồ rơi như trận thường.",
      "Lần đầu hoàn thành một nhiệm vụ hoặc một chương có thêm vàng. Đánh lại chỉ nhận thưởng trận thường.",
      "Tướng lịch sử mở theo mốc chương. Bình Loạn không phát Đá Cường Hóa.",
      "Qua các nhiệm vụ mốc, bạn mở thêm các trận tái đấu sứ quân ở mức khó hơn, có thưởng riêng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đội dưới cấp gợi ý thì nên luyện thêm ở Giao Tranh, hoặc mặc trang bị ở Doanh Trại, trước khi vào trận.",
      "Giữ lương trên 70 để cả đội hăng hái. Trước trận khó mà lương thấp, đổi vàng lấy lương ở màn chuẩn bị.",
      "Đổi hệ cho Đinh Bộ Lĩnh khắc hệ của trùm là cách dễ nhất để trận nhẹ hơn.",
    ],
  },
  TRIAL: {
    goal: `Leo ${TRIAL_FLOORS} tầng tháp cố định, mỗi tầng như một câu đố chọn đội: tầng ra luật cấm, luật bắt buộc hoặc giới hạn nghề và hệ, bạn xếp đội hợp luật rồi hạ đối thủ.`,
    steps: [
      "Chọn tầng đang mở. 100 tầng chia 10 chặng, tầng sau chỉ mở khi đã qua tầng trước.",
      "Đọc khung Luật tầng: tầng cấm gì, bắt buộc gì, đối thủ là ai và cần làm gì để thắng.",
      "Chọn 2 tướng kèm, rồi chọn hệ và nghề cho Đinh Bộ Lĩnh. Chấm xanh trên hệ và nghề là chọn vào thì đội hợp luật. Tướng bị làm mờ là không hợp luật, rê chuột để xem lý do.",
      "Đội chưa hợp luật thì nút Vào tầng bị khóa và màn ghi rõ luật nào chưa đạt.",
      "Đánh trận 3 đấu 3. Thắng thì về thẳng màn chuẩn bị của tầng kế; thua thì về lại tầng vừa đánh để đổi đội.",
    ],
    rules: [
      "Đinh Bộ Lĩnh luôn ra trận ở vị trí thủ lĩnh. Bạn đổi nghề và hệ cho ông miễn phí trước mỗi tầng; chỉ áp dụng cho trận đó.",
      "Mỗi lần vào tầng, máu và lương bắt đầu lại. Thua không mất tiến trình, không mất đá, thử lại bao nhiêu lần tùy ý.",
      "Không đổi được tướng khi trận đang đánh.",
      "Từ tầng 21 trở lên, đối thủ là tướng cửa hàng và luật ghép dần hai, ba điều.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      "Lần đầu qua mỗi tầng được Đá Cường Hóa. Đánh lại tầng đã qua không nhận thêm.",
      "Đã qua tầng 1 thì mỗi ngày quét tháp được 1 đến 12 đá, tùy tầng cao nhất đã qua. Ngày đổi lúc 0 giờ (giờ Việt Nam), lượt bỏ lỡ không cộng dồn.",
      "Đá Cường Hóa hiện chỉ tích trong tài khoản, chưa có chỗ dùng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đọc luật tầng rồi mới chọn tướng. Nếu chưa xếp đủ ba người hợp luật, hãy đổi nghề và hệ của Đinh Bộ Lĩnh.",
      "Nhớ quét tháp mỗi ngày: không phải đánh mà vẫn có đá.",
      "Kẹt ở một tầng thì quay về nâng cấp tướng rồi thử lại, tháp không chạy mất.",
    ],
  },
  DESTINY: {
    goal: "Mỗi chu kỳ tuần là một lượt leo tháp với đội hình khóa sẵn. Máu, năng lượng và lương còn lại mang sang tầng sau, nên bạn phải giữ sức cho cả chặng, thua một tầng là hết lượt leo.",
    steps: [
      "Khóa đội hình khi bắt đầu lượt leo: Đinh Bộ Lĩnh và tối đa 8 tướng. Số tầng của chu kỳ hiện ở đầu màn.",
      "Bấm một tầng ở Hành trình để xem độ khó, cấp đối thủ và mốc đá của tầng đó.",
      "Mỗi tầng chọn ba tướng ra trận từ đội hình, số còn lại là dự bị. Màn chuẩn bị ghi cấp, hệ, nghề và máu của ba đối thủ; sao xanh cạnh tên là tướng có hệ khắc ít nhất một đối thủ.",
      "Thắng tầng thì chọn một trong ba ban thưởng giữa tầng: hồi phục hoặc Phúc.",
      "Thắng tầng cuối là hoàn thành lượt leo.",
    ],
    rules: [
      "Đội hình khóa gồm Đinh Bộ Lĩnh và nhiều nhất 8 tướng, không đổi được tới hết lượt leo. Lúc khóa, máy kiểm tra trước đội hình xếp được ba người hợp luật cho mọi tầng.",
      "Đối thủ mạnh dần từ chặng Dễ tới chặng Trùm: tầng 1 cấp 1, tăng đều tới tầng 20 cấp 30, không phụ thuộc đội hình của bạn.",
      "Dự bị không tự hồi, trừ khi bạn đã chọn Phúc Hậu quân.",
      "Phúc giữ tới hết lượt leo. Chọn lại một Phúc thì cộng dồn.",
      "Thua một tầng thì lượt leo kết thúc. Kỷ lục chu kỳ và đá đã nhận vẫn giữ, bạn khóa đội hình mới để leo lại từ tầng 1.",
      "Nếu thắng tầng mà Đinh Bộ Lĩnh đã gục, bạn phải chọn Cứu viện cho ông mới lên được tầng kế. Tải lại trang không hồi miễn phí.",
      "Muốn dừng giữa chừng phải xác nhận, rồi khóa đội hình mới để leo lại từ đầu.",
      "Chu kỳ bắt đầu thứ Hai lúc 0 giờ (giờ Việt Nam) và kéo dài 7 ngày. Luật không đổi trong chu kỳ.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      "Bậc Tháp Thiên Mệnh theo tầng cao nhất từng vượt: Đồng 1, Bạc 4, Vàng 8, Bạch Kim 12, Kim Cương 16, Huyền Thoại 20. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng tuần, mỗi bậc một lần.",
      "Đá Cường Hóa khi lần đầu qua các mốc tầng và theo kỷ lục cuối chu kỳ. Chọn Phúc hoặc hồi phục giữa tầng không cho đá.",
      "Bảng công trạng riêng theo chu kỳ tuần (thẻ Công trạng tuần), có thưởng vàng theo hạng cuối kỳ cho tài khoản đã ghi danh.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đừng dồn hết sức vào các tầng đầu: tầng sau khó dần và máu không tự đầy lại.",
      "Mang nhiều tướng khác hệ khác nghề để tầng nào cũng có người khắc đối thủ, và có người thay khi tướng chính kiệt máu.",
      "Đội đang yếu máu thì chọn hồi phục; đội còn khỏe thì lấy Phúc để mạnh dần về sau.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  SURVIVAL: {
    goal: "Giữ ải trên một bàn cờ duy nhất. Đối thủ kéo đến theo từng đợt, đợt sau mạnh hơn đợt trước, và bạn xem mình trụ được bao nhiêu đợt.",
    steps: [
      "Vào ải với Đinh Bộ Lĩnh, hai tướng ra trận và tối đa hai dự bị. Đội hình khóa từ đầu.",
      "Đánh hết đối thủ của đợt. Màn hình luôn báo trước đợt kế tiếp để bạn tính trước.",
      "Giữa các đợt, bạn được đổi người ra trận với dự bị, hồi sinh tướng đã gục và tăng sức.",
      "Bấm đánh tiếp để vào đợt sau, hoặc tạm nghỉ và quay lại sau.",
      "Ba tướng ra trận cùng gục thì lượt chơi kết thúc, dù còn dự bị. Số đợt đã vượt là kết quả của bạn.",
    ],
    rules: [
      `Cứ ${SURVIVAL_BOSS_EVERY} đợt có một đợt trùm: một sứ quân dẫn hai tùy tướng.`,
      "Sau mỗi đợt thắng, tướng còn sống đang ra trận hồi 20% máu tối đa, dự bị hồi 10%, lương cộng 25 (tối đa 100).",
      "Tướng gục tự đứng dậy sau 2 đợt, hoặc bạn trả 40 lương để hồi sinh ngay ở lúc nghỉ. Mỗi lần nghỉ được một người, với 30% máu.",
      "Bàn cờ giữ nguyên qua các đợt. Năng lượng và Nộ giữ lại, hiệu ứng thì xóa.",
      "Lúc nghỉ giữa đợt, bạn có thể tạm nghỉ rồi quay lại sau, kể cả ở thiết bị khác. Tiến độ giữ tới hết mùa tuần (thứ Hai 0 giờ).",
      "Đang đánh dở một đợt mà bỏ quá 24 giờ thì không bị xử thua: lượt chơi dừng ở đợt cuối đã vượt qua.",
      "Mỗi lúc chỉ có một lượt chơi. Muốn mở lượt mới thì tiếp tục hoặc dừng lượt đang dở trước.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      `${SURVIVAL_WAVE_GOLD} vàng cho mỗi đợt vượt qua, cộng vàng và sách nhặt trên bàn cờ.`,
      "Xếp hạng theo số đợt giữ được, có bảng mùa theo tuần và thưởng vàng theo hạng cuối mùa. Số đợt lên bảng ngay khi bạn vượt qua, không cần dừng lượt chơi.",
      "Bậc theo kỷ lục số đợt: Đồng 1, Bạc 5, Vàng 10, Bạch Kim 15, Kim Cương 20, Huyền Thoại 25. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng, mỗi bậc một lần.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Xoay người giữa các đợt để tướng yếu có lúc hồi sức.",
      "Năng lượng giữ qua đợt: để dành một kỹ năng mạnh cho đợt trùm sắp tới.",
      "Mang theo một Y sư hoặc tướng biết hồi máu, ải càng dài càng cần.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  DAILY: {
    goal: "Mỗi ngày một đề chung cho mọi người. Ai cũng cầm cùng một đội, gặp cùng một đối thủ trên cùng một bàn, bạn chỉ đánh một lần để so tài cùng quần hùng.",
    steps: [
      "Điểm danh ở đầu màn để nhận vàng của ngày.",
      "Xem đề hôm nay: đội cho sẵn, hệ và nghề của Đinh Bộ Lĩnh, sứ quân đối thủ.",
      "Bấm Đánh (1 lần) rồi vào trận. Bạn đi trước.",
      "Xong ván, xem hạng của bạn trên bảng trong ngày và nhận vàng thắng hoặc thua.",
      "Làm thêm nhiệm vụ ngày ở ngay cạnh đề hôm nay để lấy vàng.",
    ],
    rules: [
      "Đề mới lúc 0 giờ (giờ Việt Nam). Mỗi người một lượt mỗi ngày, tải lại trang vẫn tiếp tục được trận đang dở.",
      "Đội cho sẵn gồm Đinh Bộ Lĩnh theo nghề và hệ của đề, cùng hai tướng. Mọi tướng cấp 10, không trang bị, nên hồ sơ của bạn không ảnh hưởng.",
      "Đối thủ là một sứ quân dẫn hai tùy tướng, đánh trên sân nhà của sứ quân, do máy điều khiển ở mức Khó.",
      "Ai đi cùng một nước thì gặp cùng ô rơi, nên đề công bằng cho mọi người.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      "Bậc Nhật Lệnh theo số ngày đã đánh: Đồng 1, Bạc 7, Vàng 20, Bạch Kim 50, Kim Cương 100, Huyền Thoại 200. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng, mỗi bậc một lần.",
      `Thắng ${DAILY_GOLD.win} vàng, thua vẫn được ${DAILY_GOLD.loss} vàng. Không có kinh nghiệm hay đồ rơi.`,
      "Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng trên, rồi tới còn nhiều máu hơn. Thua thì xếp theo sát thương đã gây.",
      "Bảng hiện 20 người đầu, có thưởng vàng theo hạng cuối ngày.",
      "Điểm danh mỗi ngày: liền 7 ngày thì vàng tăng dần, bỏ một ngày thì chuỗi về ngày 1.",
      "Nhiệm vụ ngày: đánh đủ trận, thắng, nhặt ô vàng và nhận Nhật Lệnh để lấy thêm vàng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đề chỉ chơi một lần, nên đọc kỹ đội và hệ của sứ quân trước khi bấm Đánh.",
      "Muốn lên hạng thì thắng nhanh: ít lượt hơn đứng trên. Ưu tiên nước ghép 4, ghép 5 để có lượt thêm.",
      "Dù thua vẫn có vàng và vẫn tính ngày đã đánh cho bậc Nhật Lệnh, nên ngày nào cũng ghé.",
    ],
  },
  ARENA: {
    goal: "Đấu với đội phòng thủ của người khác (Phá Doanh) hoặc đánh trực tiếp với người thật (Thư Hùng). Thắng tăng điểm hạng, thua giảm điểm hạng, tranh ngôi đầu bảng mùa.",
    steps: [
      "Chọn thẻ Phá Doanh để đánh đội phòng thủ do máy điều khiển, hoặc thẻ Thư Hùng để đánh người thật khi đang mở.",
      "Phá Doanh tự chụp đội 3 đấu 3 đang chọn ở Doanh Trại làm đội phòng thủ của bạn.",
      "Chọn một trong ba đối thủ được bày, hoặc bấm Đổi đối thủ để bày lại, miễn phí. Thẻ đối thủ ghi mạnh hơn, ngang sức hay yếu hơn bạn.",
      "Đánh trận. Điểm hạng đổi ngay sau trận.",
    ],
    rules: [
      `Phá Doanh có ${ARENA_ATTACKS_PER_DAY} lượt đánh mỗi ngày, đổi lúc 0 giờ (giờ Việt Nam).`,
      "Nâng cấp tướng hoặc đổi đội xong thì bấm Cập nhật theo đội hiện tại để đội phòng thủ theo kịp.",
      "Đội phòng thủ của bạn do máy điều khiển ở mức Khó khi người khác đến đánh.",
      "Đối thủ ưu tiên người có điểm và lực chiến gần bạn. Thiếu người thì máy tạo bóng ma luyện tập cùng cấp, 1000 điểm; càng lên cao, đánh bóng ma càng ít điểm.",
      "Trong Quần Hùng, trang bị cộng tối đa 30% Công và máu gốc theo cấp (Thủ tối đa gấp đôi), nên cấp tướng quan trọng hơn đồ.",
      "Điểm hạng bắt đầu từ 1000, tăng giảm theo sức đối thủ và không xuống dưới 0.",
      "Thư Hùng: ai cũng dùng Đinh Bộ Lĩnh, hệ thống ghép người có điểm gần bạn, mỗi lượt 30 giây.",
      "Thư Hùng: bỏ lượt liên tục là phá trận và không được tính điểm. Mất mạng được tha 3 lần mỗi ngày; mất mạng quá 90 giây thì máy điều khiển tướng của bạn.",
    ],
    items: BATTLE_ITEMS,
    rewards: [
      `Thắng Phá Doanh nhận thưởng trận thường và thêm ${ARENA_WIN_GOLD} vàng.`,
      "Bậc hạng theo điểm hạng: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Huyền Thoại. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị (từ Lục tới Cam) ở thẻ Công trạng, mỗi bậc một lần; tụt bậc không mất thưởng đã nhận.",
      "Thư Hùng có một dải bậc hạng chung cho 1vs1 và 3vs3, tính theo điểm hạng cao hơn của hai thể thức, cùng mốc và thưởng với Phá Doanh.",
      "Bảng mùa theo tuần chỉ tính các trận bạn đi đánh, không tính phòng thủ. Hạng cuối mùa có thưởng vàng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Thắng đối thủ mạnh hơn bạn được nhiều điểm hơn, thua đối thủ yếu hơn mất nhiều điểm hơn.",
      "Mới vào thì chọn đối thủ ngang sức hoặc yếu hơn để quen, rồi mới đánh đối thủ mạnh hơn.",
      "Dùng hết lượt đánh mỗi ngày: lượt không cộng dồn sang hôm sau.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  FORMATION: {
    goal: "Bày quân tướng theo nghề và hệ để khai thông toàn bộ sa bàn. Không đánh nhau: đây là trò xếp quân, mỗi ô khai thông lộ ra một mảnh bản đồ thời Loạn 12 sứ quân.",
    steps: [
      "Chọn bậc: Hướng dẫn 3×3, Thường 5×5, Khó 6×6, Đại trận (cạnh từ 7 đến 10). Mới chơi nên bắt đầu ở Hướng dẫn.",
      "Xem lệnh bài: đó là quân tướng bạn phải đặt lúc này, có một nghề và một hệ.",
      "Đặt quân vào một ô trống sát một quân đã có. Sa bàn đang trống thì đặt ở ô nào cũng được. Ô đặt được sẽ sáng lên nếu bạn bật gợi ý.",
      "Lấp kín một hàng hoặc một cột (từ 3 ô chơi được trở lên) thì quân ở đó được dọn đi, ô vẫn giữ vệt khai thông và bạn có thêm chỗ đặt.",
      "Không còn chỗ đặt quân hiện tại thì bấm Bỏ Lệnh để đổi quân khác.",
      "Khai thông hết mọi ô chơi được là thắng và hiện cả bản đồ.",
    ],
    rules: [
      "Quân mới phải cùng nghề hoặc cùng hệ với từng quân kề (trên, dưới, trái, phải). Chỉ cần một quân kề không khớp là không đặt được.",
      "Ô khai thông là ô đã từng có quân đứng. Quân bị dọn đi thì ô vẫn tính là đã khai thông.",
      "Quân tướng kế tiếp luôn có chung nghề hoặc hệ với một quân trên bàn, nhưng chưa chắc còn chỗ đặt. Lúc đó hãy Bỏ Lệnh.",
      "Bỏ Lệnh đổi sang quân khác nhưng làm ngọn lửa bùng lên một bậc, tối đa 3 bậc. Lửa đầy mà còn bỏ nữa là thua. Đặt quân thành công hạ lửa 1 bậc, dọn được hàng hoặc cột thì tắt hết.",
      "Chướng ngại (núi, rừng, đầm lầy, thành lũy) mọc ngẫu nhiên: không đặt quân được, không cần khai thông và không nối được hai quân.",
    ],
    items: {
      title: "Quân đặc biệt",
      notes: ["Thỉnh thoảng lệnh bài trao cho bạn một quân đặc biệt thay cho quân tướng."],
      list: [
        { icon: { kind: "formation", piece: "wild" }, name: "Quân Lệnh", text: "Đặt ở ô trống bất kỳ, khớp mọi quân kề." },
        { icon: { kind: "formation", piece: "eraser" }, name: "Thu Hồi", text: "Chạm vào một quân trên bàn để xóa, ô vẫn giữ vệt khai thông." },
      ],
    },
    rewards: [
      "Chơi thường không thưởng, không xếp hạng, chơi bao nhiêu ván tùy ý.",
      "Xếp hạng có thưởng ở các bậc Thường, Khó và Đại trận khi chế độ này đang mở. Bậc Hướng dẫn không xếp hạng.",
      "Bậc Trận Đồ theo số ván xếp hạng đã thắng: Đồng 1, Bạc 5, Vàng 15, Bạch Kim 30, Kim Cương 60, Huyền Thoại 100. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Chiến tích, mỗi bậc một lần.",
      "Điểm: đặt quân 10, mỗi quân kề khớp cả nghề lẫn hệ thêm 5, mỗi hàng hoặc cột dọn 50, thắng thêm 500 và thưởng theo bậc lửa còn trống.",
    ],
    tips: [
      "Bắt đầu ở bậc Hướng dẫn để quen luật khớp nghề và hệ. Ở bậc này gợi ý ô đặt được bật sẵn; bậc khác bật bằng nút tròn nhỏ có chấm sáng cạnh lệnh bài.",
      "Đặt quân ở chỗ khớp cả nghề lẫn hệ để được thêm điểm và giữ đường cho quân sau.",
      "Ưu tiên lấp hàng hoặc cột sắp đầy: dọn được thì tắt hết lửa và mở thêm chỗ trống.",
      "Đừng xây một khối đặc ở giữa: để chừa nhiều cạnh trống thì quân sau dễ có chỗ đặt.",
      "Giữ Quân Lệnh cho ô khó nhất, nơi các quân kề khác nghề khác hệ.",
    ],
  },
  KHAI_LO: {
    goal: "Giải đố trên bàn cờ quân nguyên tố. Chạm một quân để xóa cả khối cùng hệ liền nhau, gom khối to để được nhiều điểm và dọn sạch bàn cờ.",
    steps: [
      "Chọn Thường (không giới hạn thời gian, quân sót trừ tim) hoặc Cấp tốc (chạy đua với đồng hồ, quân sót trừ giây).",
      "Nhìn bàn cờ tìm khối: các quân cùng hệ đứng liền cạnh nhau. Rê chuột qua khối để xem số quân và điểm.",
      "Chạm vào một quân có ít nhất 1 quân cùng hệ liền cạnh. Cả khối biến mất, quân phía trên rơi xuống, cột trống thì các cột bên phải dồn sang trái.",
      "Dùng đạo cụ khi bí: bấm đạo cụ rồi chọn ô trên bàn.",
      "Hết khối và hết đạo cụ thì hết màn. Quân còn sót bị trừ tim (Thường) hoặc trừ giây (Cấp tốc), rồi sang màn sau.",
      `Thường: ván bắt đầu với ${KL_START_HEARTS} tim; không đủ tim đỡ số quân sót thì hết ván. Cấp tốc: hết giờ là hết ván.`,
    ],
    rules: [
      `Bàn có ${KL_WIDTH} cột và ${KL_HEIGHT} hàng. Quân lẻ không xóa được; liền cạnh không tính đường chéo. Không có quân mới rơi vào.`,
      `Mỗi màn chỉ ${KL_KINDS} hệ (đổi theo màn); màn càng sau quân càng vụn, ít khối lớn sẵn.`,
      `Thường: hết khối và hết đạo cụ thì hết màn, mỗi quân còn sót trừ 1 tim. Số quân sót nhiều hơn số tim còn lại là hết ván. Dọn sạch bàn được thêm ${KL_CLEAR_HEARTS} tim. Có thể bấm Kết thúc màn sớm (quân sót vẫn trừ tim).`,
      "Mỗi màn được hoàn tác một lần, chỉ lùi được nước vừa đi.",
      `Cấp tốc: ván bắt đầu với ${KL_TIMED_START_SECONDS} giây. Hết bàn thì sang màn mới ngay: dọn sạch được thêm ${KL_TIMED_CLEAR_SECONDS} giây, mỗi quân còn sót trừ ${KL_TIMED_LEFT_SECONDS} giây. Hết giờ là hết ván. Đồng hồ dừng khi bạn rời trang.`,
    ],
    rewards: [
      "Khối n quân được n² điểm: khối 2 quân được 4 điểm, khối 10 quân được 100 điểm. Ô số (viền vàng, nhãn ×2 hoặc ×3, từ màn 2) nhân điểm cả khối chứa nó; khối có nhiều ô số thì nhân dồn, ví dụ ×2 và ×3 thành ×6.",
      `Dọn sạch bàn: thưởng ${KL_CLEAR_BONUS_BASE} điểm cộng ${KL_CLEAR_BONUS_PER_LEVEL} điểm × số màn (cả hai chế độ). Thường: dọn sạch tự sang màn sau.`,
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng. Ván dở và điểm cao nhất mỗi chế độ lưu trên trình duyệt này.",
    ],
    tips: [
      "Trên điện thoại, chạm lần đầu để xem khối, chạm lần nữa để xóa.",
      "Điểm tăng theo bình phương số quân, nên một khối 10 quân đáng hơn năm khối 2 quân. Xóa khối nhỏ của hệ khác trước để các quân cùng hệ dồn lại thành khối lớn.",
      "Nhìn trước quân sẽ rơi: xóa khối ở dưới làm cả cột trên tụt xuống, có thể nối hoặc tách các khối.",
      "Để dành hoàn tác cho nước lỡ tay làm vỡ một khối lớn.",
      "Quân lẻ cuối màn thì dùng đạo cụ để xóa hoặc đổi hệ, đỡ mất tim.",
    ],
    items: {
      title: "Đạo cụ",
      notes: [
        `Ván bắt đầu với ${KL_START_TOOLS} đạo cụ mỗi hệ. Chạm khối hệ nào thì thanh nạp hệ đó đầy dần: đủ ${KL_TOOL_CHARGE} quân thì được thêm 1 đạo cụ của hệ ấy, tích không giới hạn.`,
        "Chỉ hiện đạo cụ của các hệ có trên bàn. Đạo cụ không cộng điểm.",
        "Bấm đạo cụ rồi chọn ô trên bàn. Phím 1–7 chọn nhanh, Esc để bỏ chọn.",
      ],
      list: elementItems((e) => ({ name: KL_TOOL_NAME[e], text: KL_TOOL_HINT[e] })),
    },
  },
  DO_THAM: {
    goal: "Dò bẫy trên sa bàn. Mở từng ô, suy ra chỗ giấu bẫy từ các con số rồi cắm cờ lau đánh dấu. Mọi bàn đều suy luận được từ đầu đến cuối, bạn không bao giờ phải đoán mò.",
    steps: [
      `Chọn bậc: Nhập môn ${DT_LEVELS.nhapMon.width}×${DT_LEVELS.nhapMon.height} với ${DT_LEVELS.nhapMon.mines} bẫy, Thường ${DT_LEVELS.thuong.width}×${DT_LEVELS.thuong.height} với ${DT_LEVELS.thuong.mines} bẫy, Khó ${DT_LEVELS.kho.width}×${DT_LEVELS.kho.height} với ${DT_LEVELS.kho.mines} bẫy.`,
      `Chọn tối đa ${DT_ITEM_PICKS} đạo cụ nguyên tố mang theo.`,
      "Mở một ô bất kỳ. Ô đầu và 8 ô quanh nó luôn an toàn, nên nước đầu không bao giờ sa bẫy.",
      "Đọc con số trên ô đã mở: đó là số bẫy ở 8 ô quanh nó (trên, dưới, trái, phải và bốn góc chéo).",
      "Ô số 1 chỉ còn đúng một ô chưa mở quanh nó thì ô ấy chắc chắn có bẫy: cắm cờ lau. Ô số đã đủ cờ thì các ô chưa mở còn lại quanh nó đều an toàn: mở ra.",
      "Lặp lại cho tới khi mở hết mọi ô an toàn. Thế là thắng.",
    ],
    rules: [
      "Số 0 không có bẫy quanh, nên tự mở lan ra các ô kề.",
      "Chuột phải hoặc chạm giữ để cắm cờ. Cờ chỉ là dấu ghi nhớ, không làm ván thắng hay thua.",
      "Bấm vào ô số đã đủ cờ thì mở nhanh các ô còn lại quanh nó; cắm sai cờ thì có thể sa bẫy.",
      "Mở trúng bẫy là thua, trừ khi Khiên đất còn.",
    ],
    rewards: [
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng. Thời gian tốt nhất của từng bậc lưu trên trình duyệt này.",
    ],
    tips: [
      "Bắt đầu từ góc nhỏ có số 1 nằm cạnh các ô đã biết: thường chỉ còn một ô để dò.",
      "Khi hai ô số chung nhau vài ô trống, so sánh số bẫy của chúng để tìm ô chắc chắn.",
      "Mẫu hay gặp: dãy 1-2-1 dọc một bức tường thì bẫy nằm dưới hai số 1, ô dưới số 2 an toàn.",
      "Chưa chắc thì đừng mở: bàn nào cũng có nước suy ra được, hãy tìm ở chỗ khác.",
      "Cất Gió mách cho lúc bí: nó luôn chỉ ra một ô suy ra được.",
    ],
    items: {
      title: "Đạo cụ",
      notes: [
        `Trước nước đầu, chọn tối đa ${DT_ITEM_PICKS} đạo cụ mang theo. Mỗi đạo cụ dùng một lần trong ván.`,
        "Đạo cụ cần chọn ô thì bấm đạo cụ trước rồi bấm ô. Chỉ dùng được sau khi đã mở ô đầu tiên.",
      ],
      list: elementItems((e) => DT_ITEM_INFO[e]),
    },
  },
  SU_LO: {
    goal: "Dẫn tướng qua mê cung lịch sử từ thời Ngô Quyền tới loạn sứ quân. Mỗi ô dừng chân là một câu hỏi sử, đáp đúng mới đứng vững, sai thì đọc sử chép rồi thử lại. Tới cổng, đánh bại quân giặc trấn giữ để thoát.",
    steps: [
      `Chọn mê cung, độ khó và hai tướng đi cùng. Dễ ${SL_LEVELS.de.cols}×${SL_LEVELS.de.rows} không sương, Thường ${SL_LEVELS.thuong.cols}×${SL_LEVELS.thuong.rows} có ${SL_LEVELS.thuong.questionSeconds} giây mỗi câu, Khó ${SL_LEVELS.kho.cols}×${SL_LEVELS.kho.rows} có ${SL_LEVELS.kho.questionSeconds} giây mỗi câu.`,
      "Đổ xúc xắc rồi chọn một ô viền vàng để tới (rê chuột vào ô để xem đường đi). Bạn được dừng sớm hơn số đã đổ.",
      "Trả lời câu hỏi ở ô vừa tới. Đúng thì cắm cờ lau, ô đó đã thông và lượt sau đi tiếp từ đây.",
      "Sai thì đọc đoạn sử chép giải thích đáp án, tướng quay về ô bắt đầu lượt, rồi đổ xúc xắc lại.",
      "Tới ô Trấn giữ cổng thì vào giao tranh: đổi ô ghép ba để hạ Thành lực. Hạ xong thì đi vào Cổng là thoát.",
      "Cuối ván xem số sao và ôn lại các câu đã trả lời sai.",
    ],
    rules: [
      "Trả lời sai thì tướng quay về ô bắt đầu lượt đó. Số lượt không giới hạn, chỉ dùng để chấm sao.",
      "Đã lên đường thì không đổi mê cung, độ khó hay tướng đi cùng được nữa. Muốn chọn lại thì bấm Đầu hàng: ván dở mất, bạn về màn chọn mê cung.",
      "Ô Lục, Vàng, Đỏ là câu dễ tới khó. Ô Đỏ đáp đúng còn mở lối tắt khóa ở ngay bên cạnh.",
      "Ô Bẫy cũng là một câu hỏi: đúng thì gỡ bẫy, sai thì dính bẫy như Phục binh, Nước lũ hay Đốt cầu. Từ bậc Thường có bẫy ẩn trông như ô Vàng.",
      "Ô Ải phải đúng hai câu liền. Không đi xuyên qua Ải và ô Trấn khi chưa thông.",
      "Đáp đúng ô Vàng được 1 Ấn sử, ô Đỏ được 2. Lộc là ô may mắn, Bia là câu đọc đoạn trích, Trấn là quân giặc giữ cổng. Lối nét đứt là lối tắt còn khóa. Từ bậc Thường, sương che các ô ở xa.",
      "Trong giao tranh, đổi hai ô kề nhau để ghép ba. Kiếm đánh mạnh nhất; trống và tim nạp Sĩ khí; sách nạp Mưu để Quân sư hiến kế; âm dương nạp Kế sách; bánh chưng cho thêm nước.",
      "Trong giao tranh, ai cũng có sức như nhau, cấp và đồ của bạn không tính. Kẻ địch không đánh lại; hết nước thì lui về, Thành lực đã mất vẫn giữ nguyên.",
    ],
    rewards: [
      "Bản chơi thử chạy ngay trên máy bạn, chưa có thưởng và bảng công trạng. Ván dở, số sao và số lượt tốt nhất lưu trên trình duyệt này. Câu hỏi đã qua lần duyệt thứ nhất, đang chờ duyệt lần hai.",
      "Thoát trong mốc lượt và sai không quá hai câu thì được ba sao.",
    ],
    tips: [
      "Mới chơi thì chọn bậc Dễ: bàn nhỏ, không sương, không đếm giờ.",
      "Đọc kỹ phần sử chép sau mỗi câu: câu sai sẽ hiện lại ở phần ôn tập cuối ván.",
      "Khi đổ số lớn, cân nhắc dừng ở ô Lục gần cổng thay vì chạy vào ô Đỏ xa.",
      "Chọn tướng đi cùng rành giai đoạn mê cung: Hỏi tướng sẽ loại thêm đáp án sai.",
      "Trong giao tranh, ghép sách để Quân sư hiến kế: đáp đúng thì Thành lực giảm mạnh.",
    ],
    items: {
      title: "Trợ giúp",
      notes: [
        `Mỗi mê cung bắt đầu với ${SL_START_AIDS.locLoi} Lọc lời, ${SL_START_AIDS.doiCau} Đổi câu, ${SL_START_AIDS.hoiTuong} Hỏi tướng và ${SL_START_AIDS.hoaToc} Hỏa tốc. Cả mê cung dùng tối đa ${SL_AID_USE_MAX} lần.`,
        "Ô Sử quan cho thêm một trợ giúp, loại bạn đang còn ít nhất. Có bẫy lấy mất một trợ giúp.",
      ],
      list: [
        { icon: { kind: "suLoAid", aid: "locLoi" }, name: "Lọc lời", text: "Bỏ hai đáp án sai của câu đang hỏi. Chỉ dùng cho câu một đáp án có từ bốn lựa chọn." },
        { icon: { kind: "suLoAid", aid: "doiCau" }, name: "Đổi câu", text: "Thay câu đang hỏi bằng một câu khác cùng độ khó." },
        { icon: { kind: "suLoAid", aid: "hoiTuong" }, name: "Hỏi tướng", text: "Nhờ một trong hai tướng đi cùng gợi ý. Tướng rành người hoặc nơi trong câu thì loại thêm một đáp án sai." },
        { icon: { kind: "suLoAid", aid: "hoaToc" }, name: "Hỏa tốc", text: "Dùng thay cho đổ xúc xắc: bạn tự chọn đi từ 1 đến 6 bước." },
      ],
    },
  },
  TAM_TUONG_KY: {
    goal: "Ghép yếu tố từ bảy hệ để tìm lại chân dung danh tướng. Không đánh nhau: đây là trò dò công thức. Công thức là biểu trưng của trò chơi, không phải diễn giải sử học.",
    steps: [
      "Chọn thẻ Thường để dò công thức thoải mái, hoặc thẻ Hạng tuần để thi điểm với mọi người.",
      "Bạn khởi đầu với bảy yếu tố gốc là bảy hệ: Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong.",
      "Chọn hai yếu tố đặt lên đài theo thứ tự, rồi bấm ghép.",
      "Ghép đúng thì ra yếu tố mới (vật liệu, tri thức) hoặc ra tướng. Yếu tố mới vào kho để ghép tiếp ở các bước sau.",
      "Ghép ra tướng thì tướng ghi vào Tướng Lục của tài khoản. Ghép sai thì không ra gì, cặp ấy được đánh dấu để lần sau bạn khỏi đặt lại.",
    ],
    rules: [
      "Thứ tự có nghĩa: Lôi rồi Mộc khác Mộc rồi Lôi, hai công thức cho hai kết quả.",
      "Mỗi tướng cần một chuỗi nhiều lần ghép: tướng thường 7 lần, tướng đặc biệt 9 lần, tướng lịch sử 12 lần. Tướng không làm nguyên liệu ghép tiếp.",
      "Chế độ Thường: mỗi lượt chơi tốn một phiếu, được 15 lần ghép trong 24 giờ, nguyên liệu không mất. Mỗi ngày có 2 gợi ý; gợi ý chỉ lộ nhóm hoặc một nguyên liệu, không lộ đủ công thức.",
      "Chế độ Hạng tuần: mỗi lần ghép tiêu nguyên liệu, ghép sai cũng mất, không hoàn lại. Mỗi tuần có 7 tướng đề cử, mỗi ô chỉ hiện lời dẫn và số điểm, tên và chân dung chỉ hiện khi ghép ra.",
      "Cần trình danh, lữ khách không chơi được.",
      "Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội.",
    ],
    rewards: [
      "Bậc Tầm Tướng Ký theo số tướng đã khám phá: Đồng 10, Bạc 20, Vàng 35, Bạch Kim 50, Kim Cương 65, Huyền Thoại 76. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Ban thưởng, mỗi bậc một lần.",
      "Mở đủ một bộ tướng thì nhận vàng và huy hiệu. Mở một tướng lẻ không có thành tựu.",
      "Hạng tuần: tướng đề cử thường 100 điểm, đặc biệt 200, lịch sử 300, mỗi tướng tính một lần. Bằng điểm thì ai tiêu ít nguyên liệu hơn đứng trên. Bảng tuần có thưởng theo hạng.",
      "Nguyên liệu thêm kiếm từ thưởng hạng các chế độ và mua ở Cửa Hàng, có giới hạn mỗi tuần. Phiếu cũng đến từ thưởng hạng các chế độ.",
    ],
    tips: [
      "Phiếu phát ít, nên hãy đọc gợi ý trước khi ghép và tận dụng đủ 15 lần ghép của một lượt.",
      "Nghĩ theo nghĩa: hai hệ gặp nhau sinh ra gì (Hỏa gặp Thổ, Thủy gặp Mộc), rồi từ đó dẫn tới nghề và danh hiệu của tướng.",
      "Dò công thức ở chế độ Thường trước, rồi mới vào Hạng tuần để khỏi phí nguyên liệu vì ghép sai.",
    ],
  },
  EXPEDITION: {
    goal: "Chia sáu tướng làm hai đạo quân, hành quân trên sa bàn để chiếm thành đích trước khi hết ngày. Quyết định chính mỗi ngày là đạo nào tiến, đạo nào nghỉ, và khi nào hai đạo cùng đánh.",
    steps: [
      "Chọn sa bàn (Ải Bắc, Thượng Du, Cửa Biển, Ngã Ba Sông, Kinh Thành, Quần Đảo) và bậc. Mới chơi nên chọn bậc thấp nhất.",
      "Chia đội: Đinh Bộ Lĩnh cùng hai tướng là một đạo, ba tướng còn lại là đạo kia.",
      "Chạm cờ để chọn đạo quân. Ô kề đi được có viền màu của đạo ấy; chạm ô để xem rồi bấm tiến quân.",
      "Mỗi ngày làm một việc: một đạo tiến sang ô kề, trinh sát, hoặc cả hai đóng quân. Đạo không đi thì nghỉ và hồi máu.",
      "Tiến vào ô có giặc thì đánh trận 3 đấu 3 như trận thường. Thắng thì chiếm ô, thua thì đạo đó rút về ô cũ.",
      "Đưa một đạo chiếm được thành đích là thắng.",
    ],
    rules: [
      `Đạo không đi trong ngày thì nghỉ và hồi ${Math.round(EXPEDITION_REST_HEAL * 100)}% máu. Người gục cũng hồi máu khi đạo nghỉ.`,
      "Giặc mạnh thêm 5% mỗi ngày. Hết ngày mà chưa chiếm được thành là thua.",
      "Sa bàn có sương mù: bạn chỉ thấy ô đi được, chòi canh giúp nhìn xa. Đường vượt nước mất 2 ngày.",
      "Đạo kia đứng kề ô đang đánh thì hai đạo giáp công, giặc yếu đi.",
      "Thua trận thì đạo đó rút về ô cũ, cả ba gục, phải nghỉ để hồi. Không mất lượt viễn chinh. Mỗi ngày có 3 lượt xuất quân.",
      "Ký hiệu đường: xanh đứt nét là vượt nước (2 ngày); xanh lá đứt nét là lội đầm (2 ngày); chấm xanh ≈ là cửa nước, chỉ qua lúc nước rút; đỏ ✕ là đường đã biết bị phá. Chấm đỏ trên đồn: đồn đánh dở, địch giữ thương vong.",
      `Trinh sát: đạo đang chọn đứng yên 1 ngày (không hồi sức), vén sương mọi ô trong ${EXPEDITION_SCOUT_SIGHT} bước và phát hiện đường bị phá quanh đó. Đường bị phá trông như đường thường; đi trúng thì mất ngày.`,
    ],
    items: BATTLE_ITEMS,
    rewards: [
      "Thưởng trận như trận thường, lần đầu thắng mỗi bậc có thưởng lớn.",
      "Lữ khách chơi được, không có bảng công trạng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đừng để một đạo đi quá xa: chờ đạo kia tới kề để giáp công thì trận nhẹ hơn nhiều.",
      "Giặc mạnh lên theo ngày, nên đừng nghỉ quá lâu. Cho một đạo tiến trong khi đạo kia nghỉ hồi sức.",
      "Trinh sát trước khi đi đường lạ để khỏi mất ngày vì đường bị phá.",
      "Chia hai đạo cân sức: đạo nào cũng nên có người đánh mạnh và người hồi máu.",
    ],
  },
};
