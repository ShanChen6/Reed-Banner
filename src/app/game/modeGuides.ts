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
import { ELEMENT_NAME } from "./battle/labels";
import { DT_ITEM_INFO } from "./do-tham/items";
import { KL_TOOL_HINT, KL_TOOL_NAME } from "./khai-lo/tools";
import { EXPEDITION_REST_HEAL, EXPEDITION_SCOUT_SIGHT } from "@/core";
import type { PieceType } from "@/core/tam-quan-ky";
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
  | { readonly kind: "tqkPiece"; readonly piece: PieceType };

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
];

/** Cách đổi ô và phím tắt trên bàn cờ trận đấu; trước đây là dòng chữ dưới bàn cờ (Shan 20/11/2026: gợi ý đưa vào Hướng dẫn). */
const BATTLE_CONTROLS =
  "Vuốt, kéo hoặc bấm hai ô kề nhau để đổi chỗ. Bàn phím: mũi tên hoặc WASD di chuyển, Enter chọn ô, 1–6 dùng kỹ năng, Tab đổi người hành động, Esc hủy.";

export const MODE_GUIDES: Readonly<Record<GuideScene, ModeGuide>> = {
  VAY_THANH_KY: {
    goal: "Cờ vây trên bàn đất của bảy hệ: mỗi bên chọn một nguyên tố, quân thành quả cầu của hệ ấy, đất quanh quân đổi sắc theo hệ. Vây được nhiều đất hơn, hoặc bắt quân trước ở ván nhập môn, là thắng.",
    steps: [
      "Chọn cách chơi: đấu sứ quân, hai người cùng máy hoặc đấu người bằng mã phòng. Chọn luật, cỡ bàn 9, 13 hoặc 19 và nguyên tố mỗi bên.",
      "Đấu người: một người bấm Mở phòng rồi gửi mã 6 ký tự, người kia nhập mã và bấm Vào phòng.",
      "Bấm một giao điểm trống để đặt quân. Trên điện thoại chạm một lần để xem trước, chạm lần nữa để đặt.",
      "Không còn chỗ đáng đi thì bấm Bỏ lượt. Hai bên cùng bỏ lượt thì ván dừng để đếm điểm.",
      "Khi đếm điểm, máy đánh dấu quân chết bằng gạch chéo. Bấm vào nhóm quân để sửa, rồi bấm Chốt điểm.",
    ],
    rules: [
      "Mỗi nhóm quân liền nhau cần ít nhất một khí (giao điểm trống kề bên). Hết khí thì cả nhóm bị bắt khỏi bàn.",
      "Không được đặt quân vào chỗ hết khí, trừ khi nước ấy bắt được quân bên kia.",
      "Luật cướp (ko): vừa bị bắt một quân thì chưa được bắt lại ngay ở đúng chỗ ấy, phải đi nơi khác một nước.",
      "Vây đất: điểm là số quân trên bàn cộng đất trống chỉ quân mình bao quanh. Bên đi sau được cộng 7,5 điểm bù.",
      "Bắt quân trước: ván nhập môn bắt đầu từ thế chéo giữa bàn, ai bắt được quân trước là thắng.",
      "Nguyên tố chỉ đổi hình quân và nền đất, không đổi luật. Đất tô màu trong ván là ước lượng vùng ảnh hưởng, điểm thật chỉ tính lúc đếm.",
    ],
    rewards: [
      "Bản thử: mọi ván là giao hữu, chưa có vàng.",
      "Đấu người cần trình danh; máy chủ làm trọng tài, có đồng hồ, hai bên cùng bỏ lượt thì máy chủ tự đếm điểm.",
    ],
    tips: [
      "Góc dễ giữ đất nhất, rồi tới cạnh, giữa bàn khó nhất.",
      "Nhóm có hai mắt (hai khoảng trống tách rời bên trong) thì không bao giờ bị bắt.",
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
    goal: "Bạn đóng vai Đinh Bộ Lĩnh, đi qua 6 chương và 24 nhiệm vụ, từ thuở nhỏ ở Hoa Lư đến đại lễ đăng quang năm 968.",
    steps: [
      "Mở bản đồ Sử ký, chọn chương rồi chọn nhiệm vụ đang mở.",
      "Đọc lời kể. Nhiệm vụ sự kiện và ngoại giao chỉ cần chọn cách đáp, không phải đánh.",
      "Nhiệm vụ có trận thì chọn hai tướng đi cùng chủ tướng, xem cấp gợi ý rồi xuất quân.",
      "Thắng thì nhiệm vụ kế và tướng mới mở ra.",
    ],
    rules: [
      "Lương mang từ trận này sang trận sau, từ 20 đến 100 và bắt đầu ở 60. Ở màn chuẩn bị trận, 3 vàng đổi được 1 lương.",
      "Nhiệm vụ sự kiện và ngoại giao không trừ lương, không tính lượt.",
      "Mỗi đoạn lời kể có nhãn nguồn: sử ghi, dựng lại, còn tranh cãi hoặc hư cấu. Cảnh game sáng tác đều ghi rõ là hư cấu.",
      "Bình Loạn không có bảng công trạng.",
    ],
    rewards: [
      "Trận thắng cho kinh nghiệm, vàng và đồ rơi như trận thường.",
      "Lần đầu hoàn thành một nhiệm vụ hoặc một chương có thêm vàng. Đánh lại chỉ nhận thưởng trận thường.",
      "Tướng lịch sử mở theo mốc chương. Bình Loạn không phát Đá Cường Hóa.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đội dưới cấp gợi ý thì nên luyện thêm ở Giao Tranh trước khi vào trận.",
      "Qua các nhiệm vụ mốc, bạn mở thêm các trận tái đấu sứ quân ở khó hơn, có thưởng riêng.",
    ],
  },
  TRIAL: {
    goal: `Leo ${TRIAL_FLOORS} tầng tháp cố định. Mỗi tầng có một luật chọn đội riêng, bạn xếp đội hợp luật rồi hạ đối thủ.`,
    steps: [
      "Chọn tầng đang mở (100 tầng chia 10 chặng) và đọc luật của tầng.",
      "Chọn 2 tướng kèm, rồi chọn hệ và nghề cho Đinh Bộ Lĩnh. Chấm xanh trên hệ/nghề là chọn vào thì đội hợp luật.",
      "Đội chưa hợp luật thì nút Vào tầng bị khóa và màn ghi rõ luật nào chưa đạt.",
      "Đánh trận 3 đấu 3. Thắng thì về thẳng màn chuẩn bị của tầng kế; thua thì về lại tầng vừa đánh để đổi đội.",
    ],
    rules: [
      "Đinh Bộ Lĩnh luôn ra trận ở vị trí thủ lĩnh. Bạn đổi nghề và hệ cho ông miễn phí trước mỗi tầng; chỉ áp dụng cho trận đó.",
      "Mỗi lần vào tầng, máu và lương bắt đầu lại.",
      "Không đổi được tướng khi trận đang đánh.",
      "Từ tầng 21 trở lên, đối thủ là tướng cửa hàng và luật ghép dần hai, ba điều.",
    ],
    rewards: [
      "Lần đầu qua mỗi tầng được Đá Cường Hóa. Đánh lại tầng đã qua không nhận thêm.",
      "Đã qua tầng 1 thì mỗi ngày quét tháp được 1 đến 12 đá, tùy tầng cao nhất đã qua. Ngày đổi lúc 0 giờ (giờ Việt Nam), lượt bỏ lỡ không cộng dồn.",
      "Đá Cường Hóa hiện chỉ tích trong tài khoản, chưa có chỗ dùng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đọc luật tầng rồi mới chọn tướng. Nếu chưa xếp đủ ba người hợp luật, hãy đổi nghề và hệ của Đinh Bộ Lĩnh.",
    ],
  },
  DESTINY: {
    goal: "Mỗi chu kỳ tuần là một lượt leo tháp với đội hình khóa sẵn. Máu, năng lượng và lương còn lại mang sang tầng sau, nên bạn phải giữ sức cho cả chặng.",
    steps: [
      "Khóa đội hình khi bắt đầu lượt leo. Số tầng của chu kỳ hiện ở đầu màn.",
      "Mỗi tầng chọn ba tướng ra trận từ đội hình, số còn lại là dự bị.",
      "Thắng tầng thì chọn một trong ba ban thưởng giữa tầng: hồi phục hoặc Phúc.",
      "Thắng tầng cuối là hoàn thành lượt leo.",
    ],
    rules: [
      "Đội hình khóa gồm Đinh Bộ Lĩnh và nhiều nhất 8 tướng.",
      "Đối thủ mạnh dần từ chặng Dễ tới chặng Trùm: tầng 1 cấp 1, tăng đều tới tầng 20 cấp 30, không phụ thuộc đội hình của bạn.",
      "Dự bị không tự hồi, trừ khi bạn đã chọn Phúc Hậu quân.",
      "Phúc giữ tới hết lượt leo. Chọn lại một Phúc thì cộng dồn.",
      "Nếu thắng tầng mà Đinh Bộ Lĩnh đã gục, bạn phải chọn Cứu viện cho ông mới lên được tầng kế. Tải lại trang không hồi miễn phí.",
      "Muốn dừng giữa chừng phải xác nhận. Kỷ lục chu kỳ và đá đã nhận vẫn giữ, bạn khóa đội hình mới để leo lại từ tầng 1.",
      "Chu kỳ bắt đầu thứ Hai lúc 0 giờ (giờ Việt Nam) và kéo dài 7 ngày. Luật không đổi trong chu kỳ.",
    ],
    rewards: [
      "Bậc Tháp Thiên Mệnh theo tầng cao nhất từng vượt: Đồng 1, Bạc 4, Vàng 8, Bạch Kim 12, Kim Cương 16, Huyền Thoại 20. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng tuần, mỗi bậc một lần.",
      "Đá Cường Hóa khi lần đầu qua các mốc tầng và theo kỷ lục cuối chu kỳ. Chọn Phúc hoặc hồi phục giữa tầng không cho đá.",
      "Bảng công trạng riêng theo chu kỳ tuần (thẻ Công trạng tuần), có thưởng vàng theo hạng cuối kỳ cho tài khoản đã ghi danh.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Đừng dồn hết sức vào các tầng đầu: tầng sau khó dần và máu không tự đầy lại.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  SURVIVAL: {
    goal: "Giữ ải trên một bàn cờ duy nhất. Đối thủ kéo đến theo từng đợt, mỗi đợt mạnh hơn, và bạn xem mình trụ được bao nhiêu đợt.",
    steps: [
      "Vào ải với Đinh Bộ Lĩnh, hai tướng ra trận và tối đa hai dự bị. Đội hình khóa từ đầu.",
      "Đánh hết đối thủ của đợt. Màn hình luôn báo trước đợt kế tiếp.",
      "Giữa các đợt, bạn được đổi người, hồi sinh tướng đã gục và tăng sức.",
      "Ba tướng ra trận cùng gục thì lượt chơi kết thúc, dù còn dự bị.",
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
    rewards: [
      `${SURVIVAL_WAVE_GOLD} vàng cho mỗi đợt vượt qua, cộng vàng và sách nhặt trên bàn cờ.`,
      "Xếp hạng theo số đợt giữ được, có bảng mùa theo tuần và thưởng vàng theo hạng cuối mùa. Số đợt lên bảng ngay khi bạn vượt qua, không cần dừng lượt chơi.",
      "Bậc theo kỷ lục số đợt: Đồng 1, Bạc 5, Vàng 10, Bạch Kim 15, Kim Cương 20, Huyền Thoại 25. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng, mỗi bậc một lần.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Xoay người giữa các đợt để tướng yếu có lúc hồi sức.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  DAILY: {
    goal: "Mỗi ngày một đề chung cho mọi người. Bạn chỉ đánh một lần, so tài cùng quần hùng trên cùng một bàn.",
    steps: [
      "Xem đề hôm nay: đội cho sẵn và đối thủ.",
      "Bấm Đánh (1 lần) rồi vào trận. Bạn đi trước.",
      "Xong ván, xem hạng của bạn trên bảng trong ngày.",
    ],
    rules: [
      "Đề mới lúc 0 giờ (giờ Việt Nam). Mỗi người một lượt mỗi ngày, tải lại trang vẫn tiếp tục được trận đang dở.",
      "Đội cho sẵn gồm Đinh Bộ Lĩnh theo nghề và hệ của đề, cùng hai tướng. Mọi tướng cấp 10, không trang bị, nên hồ sơ của bạn không ảnh hưởng.",
      "Đối thủ là một sứ quân dẫn hai tùy tướng, đánh trên sân nhà của sứ quân, do máy điều khiển ở mức Khó.",
      "Ai đi cùng một nước thì gặp cùng ô rơi.",
    ],
    rewards: [
      "Bậc Nhật Lệnh theo số ngày đã đánh: Đồng 1, Bạc 7, Vàng 20, Bạch Kim 50, Kim Cương 100, Huyền Thoại 200. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng, mỗi bậc một lần.",
      `Thắng ${DAILY_GOLD.win} vàng, thua vẫn được ${DAILY_GOLD.loss} vàng. Không có kinh nghiệm hay đồ rơi.`,
      "Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng trên, rồi tới còn nhiều máu hơn. Thua thì xếp theo sát thương đã gây.",
      "Bảng hiện 20 người đầu, có thưởng vàng theo hạng cuối ngày.",
      "Điểm danh mỗi ngày ở đầu màn: liền 7 ngày thì vàng tăng dần, bỏ một ngày thì chuỗi về ngày 1.",
      "Nhiệm vụ ngày nằm ngay cạnh đề hôm nay: đánh đủ trận, thắng, nhặt ô vàng và nhận Nhật Lệnh để lấy thêm vàng.",
    ],
    tips: [BATTLE_CONTROLS, "Chưa nghĩ ra thế đánh thì cứ thử một nước nhỏ: đề chỉ chơi một lần nên hãy đọc kỹ đội trước."],
  },
  ARENA: {
    goal: "Đánh với đội phòng thủ của người khác, do máy điều khiển ở mức Khó. Thắng tăng điểm hạng, thua giảm điểm hạng.",
    steps: [
      "Quần Hùng tự chụp đội 3 đấu 3 đang chọn ở Doanh Trại làm đội phòng thủ của bạn.",
      "Chọn một trong ba đối thủ được bày, hoặc bấm Đổi đối thủ để bày lại, miễn phí.",
      "Đánh trận. Điểm hạng đổi ngay sau trận.",
    ],
    rules: [
      `Mỗi ngày có ${ARENA_ATTACKS_PER_DAY} lượt đánh, đổi lúc 0 giờ (giờ Việt Nam).`,
      "Nâng cấp tướng hoặc đổi đội xong thì bấm Cập nhật theo đội hiện tại để đội phòng thủ theo kịp.",
      "Đối thủ ưu tiên người có điểm và lực chiến gần bạn; thẻ đối thủ ghi mạnh hơn, ngang sức hay yếu hơn. Thiếu người thì máy tạo bóng ma luyện tập cùng cấp, 1000 điểm; càng lên cao, đánh bóng ma càng ít điểm.",
      "Trong Quần Hùng, trang bị cộng tối đa 30% Công và máu gốc theo cấp (Thủ tối đa gấp đôi), nên cấp tướng quan trọng hơn đồ.",
      "Điểm hạng bắt đầu từ 1000, tăng giảm theo sức đối thủ và không xuống dưới 0.",
    ],
    rewards: [
      `Thắng nhận thưởng trận thường và thêm ${ARENA_WIN_GOLD} vàng.`,
      "Bậc hạng theo điểm hạng: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Huyền Thoại. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị (từ Lục tới Cam) ở thẻ Công trạng, mỗi bậc một lần; tụt bậc không mất thưởng đã nhận.",
      "Bảng mùa theo tuần chỉ tính các trận bạn đi đánh, không tính phòng thủ. Hạng cuối mùa có thưởng vàng.",
    ],
    tips: [
      BATTLE_CONTROLS,
      "Khi Thư Hùng được mở, bạn chọn thẻ Thư Hùng để đánh trực tiếp 1vs1 với người khác: ai cũng dùng Đinh Bộ Lĩnh, hệ thống ghép người có điểm gần bạn, mỗi lượt 30 giây.",
      "Thư Hùng có một dải bậc hạng chung cho 1vs1 và 3vs3, tính theo điểm hạng cao hơn của hai thể thức, cùng mốc và thưởng với Phá Doanh; lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Công trạng.",
      "Ở Thư Hùng, bỏ lượt liên tục là phá trận và không được tính điểm. Mất mạng được tha 3 lần mỗi ngày; mất mạng quá 90 giây thì máy điều khiển tướng của bạn.",
      "Thắng đối thủ mạnh hơn bạn được nhiều điểm hơn, thua đối thủ yếu hơn mất nhiều điểm hơn.",
      "Cần trình danh để chơi và lên bảng.",
    ],
  },
  FORMATION: {
    goal: "Bày quân tướng theo nghề và hệ để khai thông toàn bộ sa bàn. Không đánh nhau; mỗi ô khai thông lộ một mảnh bản đồ thời Loạn 12 sứ quân.",
    steps: [
      "Chọn bậc: Hướng dẫn 3×3, Thường 5×5, Khó 6×6, Đại trận (cạnh từ 7 đến 10).",
      "Đặt quân hiện tại vào một ô trống sát một quân đã có. Sa bàn đang trống thì đặt ở ô nào cũng được.",
      "Lấp kín một hàng hoặc một cột (từ 3 ô chơi được trở lên) thì quân ở đó được dọn đi, ô vẫn giữ vệt khai thông.",
      "Khai thông hết mọi ô chơi được là thắng và hiện cả bản đồ.",
    ],
    rules: [
      "Quân mới phải cùng nghề hoặc cùng hệ với từng quân kề (trên, dưới, trái, phải). Chỉ cần một quân kề không khớp là không đặt được.",
      "Quân tướng kế tiếp luôn có chung nghề hoặc hệ với một quân trên bàn, nhưng chưa chắc còn chỗ đặt. Lúc đó hãy Bỏ Lệnh.",
      "Bỏ Lệnh đổi sang quân khác nhưng làm ngọn lửa bùng lên. Lửa đầy mà còn bỏ nữa là thua. Đặt quân thành công hạ lửa 1 bậc, dọn được hàng hoặc cột thì tắt hết.",
      "Chướng ngại (núi, rừng, đầm lầy, thành lũy) mọc ngẫu nhiên: không đặt quân được, không cần khai thông và không nối được hai quân.",
    ],
    rewards: [
      "Chơi thường không thưởng, không xếp hạng, chơi bao nhiêu ván tùy ý.",
      "Xếp hạng có thưởng ở các bậc Thường, Khó và Đại trận khi chế độ này đang mở. Bậc Hướng dẫn không xếp hạng.",
      "Bậc Trận Đồ theo số ván xếp hạng đã thắng: Đồng 1, Bạc 5, Vàng 15, Bạch Kim 30, Kim Cương 60, Huyền Thoại 100. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Chiến tích, mỗi bậc một lần.",
      "Điểm: đặt quân 10, mỗi quân kề khớp cả nghề lẫn hệ thêm 5, mỗi hàng hoặc cột dọn 50, thắng thêm 500 và thưởng theo bậc lửa còn trống.",
    ],
    tips: ["Bắt đầu ở bậc Hướng dẫn để quen luật khớp nghề và hệ."],
    items: {
      title: "Quân đặc biệt",
      notes: ["Thỉnh thoảng lệnh bài trao cho bạn một quân đặc biệt thay cho quân tướng."],
      list: [
        { icon: { kind: "formation", piece: "wild" }, name: "Quân Lệnh", text: "Đặt ở ô trống bất kỳ, khớp mọi quân kề." },
        { icon: { kind: "formation", piece: "eraser" }, name: "Thu Hồi", text: "Chạm vào một quân trên bàn để xóa, ô vẫn giữ vệt khai thông." },
      ],
    },
  },
  KHAI_LO: {
    goal: "Giải đố trên bàn cờ quân nguyên tố. Chạm một quân để xóa cả khối cùng hệ, gom khối to để được nhiều điểm và mở đường xuyên bàn cờ.",
    steps: [
      "Chọn Thường (không giới hạn thời gian, quân sót trừ tim) hoặc Cấp tốc (chạy đua với đồng hồ, quân sót trừ giây).",
      "Chạm vào một quân có ít nhất 1 quân cùng hệ liền cạnh. Cả khối biến mất, quân phía trên rơi xuống.",
      `Thường: hết khối thì hết màn. Quân còn sót trừ tim (ván bắt đầu với ${KL_START_HEARTS} tim); không đủ tim đỡ thì hết ván.`,
    ],
    rules: [
      `Bàn có ${KL_WIDTH} cột và ${KL_HEIGHT} hàng. Quân lẻ không xóa được; liền cạnh không tính đường chéo. Không có quân mới rơi vào, cột trống thì các cột bên phải dồn sang trái.`,
      `Mỗi màn chỉ ${KL_KINDS} hệ (đổi theo màn); màn càng sau quân càng vụn, ít khối lớn sẵn.`,
      `Thường: hết khối và hết đạo cụ thì hết màn, mỗi quân còn sót trừ 1 tim. Số quân sót nhiều hơn số tim còn lại là hết ván. Dọn sạch bàn được thêm ${KL_CLEAR_HEARTS} tim. Có thể bấm Kết thúc màn sớm (quân sót vẫn trừ tim).`,
      "Mỗi màn được hoàn tác một lần, chỉ lùi được nước vừa đi.",
      `Cấp tốc: ván bắt đầu với ${KL_TIMED_START_SECONDS} giây. Hết bàn thì sang màn mới ngay: dọn sạch được thêm ${KL_TIMED_CLEAR_SECONDS} giây, mỗi quân còn sót trừ ${KL_TIMED_LEFT_SECONDS} giây. Hết giờ là hết ván. Đồng hồ dừng khi bạn rời trang.`,
    ],
    rewards: [
      "Khối n quân được n² điểm. Ô số (viền vàng, nhãn ×2 hoặc ×3, từ màn 2) nhân điểm cả khối chứa nó; khối có nhiều ô số thì nhân dồn, ví dụ ×2 và ×3 thành ×6.",
      `Dọn sạch bàn: thưởng ${KL_CLEAR_BONUS_BASE} điểm cộng ${KL_CLEAR_BONUS_PER_LEVEL} điểm × số màn (cả hai chế độ). Thường: dọn sạch tự sang màn sau.`,
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng. Ván dở và điểm cao nhất mỗi chế độ lưu trên trình duyệt này.",
    ],
    tips: [
      "Rê chuột qua khối để xem trước số quân và điểm. Trên điện thoại, chạm lần đầu để xem, chạm lần nữa để xóa.",
      "Xóa khối nhỏ trước để các khối khác dồn lại thành khối lớn.",
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
    goal: "Dò bẫy trên sa bàn. Mở từng ô, suy ra chỗ giấu bẫy từ các con số rồi cắm cờ lau. Mọi bàn đều suy luận được từ đầu đến cuối, bạn không cần đoán.",
    steps: [
      `Chọn bậc: Nhập môn ${DT_LEVELS.nhapMon.width}×${DT_LEVELS.nhapMon.height} với ${DT_LEVELS.nhapMon.mines} bẫy, Thường ${DT_LEVELS.thuong.width}×${DT_LEVELS.thuong.height} với ${DT_LEVELS.thuong.mines} bẫy, Khó ${DT_LEVELS.kho.width}×${DT_LEVELS.kho.height} với ${DT_LEVELS.kho.mines} bẫy.`,
      `Chọn tối đa ${DT_ITEM_PICKS} đạo cụ nguyên tố mang theo, rồi mở một ô bất kỳ. Ô đầu và 8 ô quanh nó luôn an toàn.`,
      "Đọc con số trên ô đã mở: đó là số bẫy ở 8 ô quanh nó. Suy ra ô nào có bẫy thì cắm cờ lau, ô nào an toàn thì mở.",
      "Mở hết mọi ô an toàn là thắng.",
    ],
    rules: [
      "Số 0 tự mở lan ra các ô kề.",
      "Chuột phải hoặc chạm giữ để cắm cờ. Cờ chỉ là dấu ghi nhớ, không làm ván thắng hay thua. Bấm vào ô số đã đủ cờ thì mở nhanh các ô còn lại quanh nó; cắm sai cờ thì có thể sa bẫy.",
      "Mở trúng bẫy là thua, trừ khi Khiên đất còn.",
    ],
    rewards: [
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng. Thời gian tốt nhất của từng bậc lưu trên trình duyệt này.",
    ],
    tips: [
      "Bắt đầu từ góc nhỏ có số 1 nằm cạnh các ô đã biết: thường chỉ còn một ô để dò.",
      "Khi hai ô số chung nhau vài ô trống, so sánh số bẫy của chúng để tìm ô chắc chắn.",
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
    goal: "Dẫn tướng qua mê cung lịch sử từ thời Ngô Quyền tới loạn sứ quân. Mỗi ô dừng chân là một câu hỏi sử, đáp đúng mới đứng vững, sai thì đọc sử chép rồi thử lại.",
    steps: [
      `Chọn mê cung, độ khó và hai tướng đi cùng. Dễ ${SL_LEVELS.de.cols}×${SL_LEVELS.de.rows} không sương, Thường ${SL_LEVELS.thuong.cols}×${SL_LEVELS.thuong.rows} có ${SL_LEVELS.thuong.questionSeconds} giây mỗi câu, Khó ${SL_LEVELS.kho.cols}×${SL_LEVELS.kho.rows} có ${SL_LEVELS.kho.questionSeconds} giây mỗi câu.`,
      "Đổ xúc xắc rồi chọn một ô viền vàng để tới (rê chuột vào ô để xem đường đi). Bạn được dừng sớm hơn số đã đổ.",
      "Trả lời câu hỏi ở ô vừa tới. Đúng thì cắm cờ lau, ô đó đã thông.",
      "Tới ô Trấn giữ cổng thì vào giao tranh: đổi ô ghép ba để hạ Thành lực. Hạ xong thì đi vào Cổng là thoát.",
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
      "Đọc kỹ phần sử chép sau mỗi câu: câu sai sẽ hiện lại ở phần ôn tập cuối ván.",
      "Khi đổ số lớn, cân nhắc dừng ở ô Lục gần cổng thay vì chạy vào ô Đỏ xa.",
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
    goal: "Ghép yếu tố từ bảy hệ để tìm lại chân dung danh tướng. Không đánh nhau. Công thức là biểu trưng của trò chơi, không phải diễn giải sử học.",
    steps: [
      "Chọn hai yếu tố đặt lên đài rồi ghép.",
      "Thứ tự có nghĩa: Lôi rồi Mộc khác Mộc rồi Lôi, hai công thức cho hai kết quả.",
      "Ghép ra tướng thì tướng ghi vào Tướng Lục của tài khoản.",
    ],
    rules: [
      "Chế độ Thường: mỗi lượt chơi tốn một phiếu, nguyên liệu không mất. Có gợi ý, nhưng gợi ý không lộ đủ công thức.",
      "Chế độ Hạng tuần: mỗi lần ghép tiêu nguyên liệu, ghép sai cũng mất, không hoàn lại. Danh sách tướng đề cử đổi theo tuần.",
      "Cần trình danh, lữ khách không chơi được.",
      "Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội.",
    ],
    rewards: [
      "Bậc Tầm Tướng Ký theo số tướng đã khám phá: Đồng 10, Bạc 20, Vàng 35, Bạch Kim 50, Kim Cương 65, Huyền Thoại 76. Lần đầu đạt mỗi bậc nhận vàng và một món trang bị ở thẻ Ban thưởng, mỗi bậc một lần.",
      "Mở đủ một bộ tướng thì nhận vàng và huy hiệu. Mở một tướng lẻ không có thành tựu.",
      "Hạng tuần có bảng và thưởng theo hạng. Nguyên liệu thêm kiếm từ thưởng hạng các chế độ và mua ở Cửa Hàng, có giới hạn mỗi tuần.",
    ],
    tips: ["Phiếu kiếm từ thưởng các chế độ khác và phát ít, nên hãy đọc gợi ý trước khi ghép."],
  },
  EXPEDITION: {
    goal: "Chia sáu tướng làm hai đạo quân, hành quân trên sa bàn để chiếm thành đích trước khi hết ngày. Quyết định chính là hôm nay đạo nào tiến, đạo nào nghỉ.",
    steps: [
      "Chọn sa bàn (Ải Bắc, Thượng Du, Cửa Biển, Ngã Ba Sông, Kinh Thành, Quần Đảo) và bậc.",
      "Chia đội: Đinh Bộ Lĩnh cùng hai tướng là một đạo, ba tướng còn lại là đạo kia.",
      "Mỗi ngày làm một việc: một đạo tiến sang ô kề (gặp giặc thì đánh trận), hoặc cả hai đóng quân.",
      "Chiếm được thành đích là thắng.",
    ],
    rules: [
      `Đạo không đi trong ngày thì nghỉ và hồi ${Math.round(EXPEDITION_REST_HEAL * 100)}% máu.`,
      "Giặc mạnh thêm 5% mỗi ngày. Hết ngày mà chưa chiếm được thành là thua.",
      "Sa bàn có sương mù: bạn chỉ thấy ô đi được, chòi canh giúp nhìn xa. Đường vượt nước mất 2 ngày.",
      "Đạo kia đứng kề ô đang đánh thì hai đạo giáp công, giặc yếu đi.",
      "Thua trận thì đạo đó rút về ô cũ, cả ba gục, phải nghỉ để hồi. Không mất lượt viễn chinh. Mỗi ngày có 3 lượt xuất quân.",
      "Chạm cờ để chọn đạo quân, chạm ô kề (viền màu đạo) để xem rồi tiến quân. Người gục cũng hồi máu khi đạo nghỉ.",
      "Ký hiệu đường: xanh đứt nét là vượt nước (2 ngày); xanh lá đứt nét là lội đầm (2 ngày); chấm xanh ≈ là cửa nước, chỉ qua lúc nước rút; đỏ ✕ là đường đã biết bị phá. Chấm đỏ trên đồn: đồn đánh dở, địch giữ thương vong.",
      `Trinh sát: đạo đang chọn đứng yên 1 ngày (không hồi sức), vén sương mọi ô trong ${EXPEDITION_SCOUT_SIGHT} bước và phát hiện đường bị phá quanh đó. Đường bị phá trông như đường thường; đi trúng thì mất ngày.`,
    ],
    rewards: [
      "Thưởng trận như trận thường, lần đầu thắng mỗi bậc có thưởng lớn.",
      "Lữ khách chơi được, không có bảng công trạng.",
    ],
    tips: [BATTLE_CONTROLS, "Đừng để một đạo đi quá xa: chờ đạo kia tới kề để giáp công thì trận nhẹ hơn nhiều."],
  },
};
