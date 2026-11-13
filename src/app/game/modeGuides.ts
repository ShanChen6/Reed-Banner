// Nội dung thẻ Hướng dẫn của từng chế độ chơi. Văn phong theo "Văn phong giao diện" ở docs/00-overview/thuat-ngu.md:
// gọi người chơi là "bạn", câu ngắn nói việc cần làm, tên chế độ và tên riêng viết hoa mọi chữ, tài nguyên viết thường giữa câu.
// Số liệu lấy từ hằng số trong src/core và luật ở docs/02-game-modes/; đổi luật thì sửa cả hai nơi.

import { ARENA_ATTACKS_PER_DAY, ARENA_WIN_GOLD } from "@/core/arena/arena";
import { DAILY_GOLD } from "@/core/daily/daily";
import { SURVIVAL_BOSS_EVERY, SURVIVAL_WAVE_GOLD } from "@/core/survival/survival";
import { TRIAL_FLOORS } from "@/core/progress/dualTowerState";
import { DT_ITEM_PICKS, DT_LEVELS } from "@/core/do-tham";
import { KL_CLEAR_TROOPS, KL_HEIGHT, KL_START_TROOPS, KL_TIME_BONUS_PER_SECOND, KL_WIDTH, levelTimeLimit } from "@/core/khai-lo/engine";
import type { Scene } from "./scene";

/** Các chế độ có thẻ Hướng dẫn (đúng mười một chế độ ở thẻ Chiến Trường). */
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
  | "TAM_TUONG_KY"
  | "EXPEDITION"
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
}

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
  "TAM_TUONG_KY",
  "EXPEDITION",
];

export const MODE_GUIDES: Readonly<Record<GuideScene, ModeGuide>> = {
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
      "Bình Loạn không có bảng xếp hạng.",
    ],
    rewards: [
      "Trận thắng cho kinh nghiệm, vàng và đồ rơi như trận thường.",
      "Lần đầu hoàn thành một nhiệm vụ hoặc một chương có thêm vàng. Đánh lại chỉ nhận thưởng trận thường.",
      "Tướng lịch sử mở theo mốc chương. Bình Loạn không phát Đá Cường Hóa.",
    ],
    tips: [
      "Đội dưới cấp gợi ý thì nên luyện thêm ở Giao Tranh trước khi vào trận.",
      "Qua các nhiệm vụ mốc, bạn mở thêm các trận tái đấu sứ quân ở khó hơn, có thưởng riêng.",
    ],
  },
  TRIAL: {
    goal: `Leo ${TRIAL_FLOORS} tầng tháp cố định. Mỗi tầng có một luật chọn đội riêng, bạn xếp đội hợp luật rồi hạ đối thủ.`,
    steps: [
      "Chọn tầng đang mở và đọc luật của tầng.",
      "Chọn ba tướng ra trận hợp luật. Tướng bị làm mờ là không hợp luật, đã gục hoặc đã đủ người; lý do ghi dưới tên tướng.",
      "Đánh trận 3 đấu 3. Thắng thì tầng kế mở ra.",
    ],
    rules: [
      "Đinh Bộ Lĩnh luôn ra trận ở vị trí thủ lĩnh. Bạn đổi nghề và hệ cho ông miễn phí trước mỗi tầng, miễn là hợp luật.",
      "Mỗi lần vào tầng, máu và lương bắt đầu lại.",
      "Không đổi được tướng khi trận đang đánh.",
      "Từ tầng 21 trở lên, đối thủ là tướng cửa hàng và luật ghép dần hai, ba điều.",
    ],
    rewards: [
      "Lần đầu qua mỗi tầng được Đá Cường Hóa. Đánh lại tầng đã qua không nhận thêm.",
      "Đã qua tầng 1 thì mỗi ngày quét tháp được 1 đến 7 đá, tùy tầng cao nhất đã qua. Ngày đổi lúc 0 giờ giờ Việt Nam, lượt bỏ lỡ không cộng dồn.",
      "Đá Cường Hóa hiện chỉ tích trong tài khoản, chưa có chỗ dùng.",
    ],
    tips: [
      "Đọc luật tầng rồi mới chọn tướng. Nếu chưa xếp đủ ba người hợp luật, hãy đổi nghề và hệ của Đinh Bộ Lĩnh.",
    ],
  },
  DESTINY: {
    goal: "Mỗi chu kỳ tuần là một lượt leo tháp với đội hình khóa sẵn. Máu, năng lượng và lương còn lại mang sang tầng sau, nên bạn phải giữ sức cho cả chặng.",
    steps: [
      "Khóa đội hình khi bắt đầu lượt leo. Số tầng của chu kỳ hiện ở đầu màn.",
      "Mỗi tầng chọn ba tướng ra trận từ đội hình, số còn lại là dự bị.",
      "Thắng tầng thì chọn một trong ba phần thưởng giữa tầng: hồi phục hoặc Phúc.",
      "Thắng tầng cuối là hoàn thành lượt leo.",
    ],
    rules: [
      "Dự bị không tự hồi, trừ khi bạn đã chọn Phúc Hậu quân.",
      "Phúc giữ tới hết lượt leo. Chọn lại một Phúc thì cộng dồn.",
      "Nếu thắng tầng mà Đinh Bộ Lĩnh đã gục, bạn phải chọn Cứu viện cho ông mới lên được tầng kế. Tải lại trang không hồi miễn phí.",
      "Muốn dừng giữa chừng phải xác nhận. Kỷ lục chu kỳ và đá đã nhận vẫn giữ, bạn khóa đội hình mới để leo lại từ tầng 1.",
      "Chu kỳ bắt đầu thứ Hai lúc 0 giờ giờ Việt Nam và kéo dài 7 ngày. Luật không đổi trong chu kỳ.",
    ],
    rewards: [
      "Đá Cường Hóa khi lần đầu qua các mốc tầng và theo kỷ lục cuối chu kỳ. Chọn Phúc hoặc hồi phục giữa tầng không cho đá.",
      "Bảng xếp hạng riêng theo chu kỳ tuần, có thưởng vàng theo hạng cuối kỳ cho tài khoản đã ghi danh.",
    ],
    tips: [
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
      "Bỏ dở quá 24 giờ không bị xử thua: lượt chơi dừng ở đợt cuối đã vượt qua.",
    ],
    rewards: [
      `${SURVIVAL_WAVE_GOLD} vàng cho mỗi đợt vượt qua, cộng vàng và sách nhặt trên bàn cờ.`,
      "Xếp hạng theo số đợt giữ được, có bảng mùa theo tuần và thưởng vàng theo hạng cuối mùa.",
    ],
    tips: [
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
      "Đề mới lúc 0 giờ giờ Việt Nam. Mỗi người một lượt mỗi ngày, tải lại trang vẫn tiếp tục được trận đang dở.",
      "Đội cho sẵn gồm Đinh Bộ Lĩnh theo nghề và hệ của đề, cùng hai tướng. Mọi tướng cấp 10, không trang bị, nên hồ sơ của bạn không ảnh hưởng.",
      "Đối thủ là một sứ quân dẫn hai tùy tướng, đánh trên sân nhà của sứ quân, do máy điều khiển ở mức Khó.",
      "Ai đi cùng một nước thì gặp cùng ô rơi.",
    ],
    rewards: [
      `Thắng ${DAILY_GOLD.win} vàng, thua vẫn được ${DAILY_GOLD.loss} vàng. Không có kinh nghiệm hay đồ rơi.`,
      "Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng trên, rồi tới còn nhiều máu hơn. Thua thì xếp theo sát thương đã gây.",
      "Bảng hiện 20 người đầu, có thưởng vàng theo hạng cuối ngày.",
    ],
    tips: ["Chưa nghĩ ra thế đánh thì cứ thử một nước nhỏ: đề chỉ chơi một lần nên hãy đọc kỹ đội trước."],
  },
  ARENA: {
    goal: "Đánh với đội phòng thủ của người khác, do máy điều khiển ở mức Khó. Thắng tăng điểm hạng, thua giảm điểm hạng.",
    steps: [
      "Quần Hùng tự chụp đội 3 đấu 3 đang chọn ở Doanh Trại làm đội phòng thủ của bạn.",
      "Chọn một trong ba đối thủ được bày, hoặc bấm Đổi đối thủ để bày lại, miễn phí.",
      "Đánh trận. Điểm hạng đổi ngay sau trận.",
    ],
    rules: [
      `Mỗi ngày có ${ARENA_ATTACKS_PER_DAY} lượt đánh, đổi lúc 0 giờ giờ Việt Nam.`,
      "Nâng cấp tướng hoặc đổi đội xong thì bấm Cập nhật theo đội hiện tại để đội phòng thủ theo kịp.",
      "Đối thủ ưu tiên người có điểm gần bạn. Thiếu người thì máy tạo bóng ma luyện tập 1000 điểm; càng lên cao, đánh bóng ma càng ít điểm.",
      "Điểm hạng bắt đầu từ 1000, tăng giảm theo sức đối thủ và không xuống dưới 0.",
    ],
    rewards: [
      `Thắng nhận thưởng trận thường và thêm ${ARENA_WIN_GOLD} vàng.`,
      "Bảng mùa theo tuần chỉ tính các trận bạn đi đánh, không tính phòng thủ. Hạng cuối mùa có thưởng vàng.",
    ],
    tips: [
      "Khi Đấu người được mở, bạn chọn Đấu người để đánh trực tiếp 1vs1 với người khác: ai cũng dùng Đinh Bộ Lĩnh, hệ thống ghép người có điểm gần bạn, mỗi lượt 30 giây.",
      "Ở Đấu người, bỏ lượt liên tục là phá trận và không được tính điểm. Mất mạng được tha 3 lần mỗi ngày; mất mạng quá 90 giây thì máy điều khiển tướng của bạn.",
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
      "Quân Lệnh đặt ở ô trống bất kỳ và khớp mọi quân kề. Thu Hồi xóa một quân trên bàn.",
      "Chướng ngại (núi, rừng, đầm lầy, thành lũy) mọc ngẫu nhiên: không đặt quân được, không cần khai thông và không nối được hai quân.",
    ],
    rewards: [
      "Chơi thường không thưởng, không xếp hạng, chơi bao nhiêu ván tùy ý.",
      "Xếp hạng có thưởng ở các bậc Thường, Khó và Đại trận khi chế độ này đang mở. Bậc Hướng dẫn không xếp hạng.",
      "Điểm: đặt quân 10, mỗi quân kề khớp cả nghề lẫn hệ thêm 5, mỗi hàng hoặc cột dọn 50, thắng thêm 500 và thưởng theo bậc lửa còn trống.",
    ],
    tips: ["Bắt đầu ở bậc Hướng dẫn để quen luật khớp nghề và hệ."],
  },
  KHAI_LO: {
    goal: "Giải đố trên bàn cờ quân nguyên tố. Chạm một quân để xóa cả khối cùng hệ, gom khối to để được nhiều điểm và mở đường xuyên bàn cờ.",
    steps: [
      "Chọn Thường (không giới hạn thời gian) hoặc Cấp tốc (có đồng hồ cho mỗi màn).",
      "Chạm vào một quân có ít nhất 1 quân cùng hệ liền cạnh. Cả khối biến mất, quân phía trên rơi xuống.",
      "Hết khối để xóa thì màn kết thúc. Dọn sạch bàn được thưởng.",
    ],
    rules: [
      `Bàn có ${KL_WIDTH} cột và ${KL_HEIGHT} hàng. Quân lẻ không xóa được; liền cạnh không tính đường chéo. Không có quân mới rơi vào, cột trống thì các cột bên phải dồn sang trái.`,
      "Màn càng sau càng nhiều hệ, từ 3 lên 6.",
      `Ván bắt đầu với ${KL_START_TROOPS} quân lực. Mỗi quân còn sót cuối màn trừ 1 quân lực; hết quân lực là hết ván.`,
      "Đạo cụ Lốc Phong xoay 8 ô quanh một tâm, Sấm Sét phá vùng 3×3. Hai đạo cụ không cộng điểm.",
      "Mỗi màn được hoàn tác một lần, chỉ lùi được nước vừa đi.",
      `Cấp tốc: mỗi màn ${levelTimeLimit(1)} giây ở bàn 3 hệ, thêm 15 giây cho mỗi hệ mới. Hết giờ là hết màn. Đồng hồ dừng khi bạn rời trang.`,
    ],
    rewards: [
      "Khối n quân được n² điểm. Quân hào quang nhân điểm cả khối chứa nó, mỗi quân hào quang cộng thêm một lần.",
      `Dọn sạch bàn: thưởng điểm theo màn, cộng ${KL_CLEAR_TROOPS} quân lực và 1 đạo cụ mỗi loại. Cấp tốc cộng thêm ${KL_TIME_BONUS_PER_SECOND} điểm cho mỗi giây còn dư.`,
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng.",
    ],
    tips: [
      "Rê chuột qua khối để xem trước số quân và điểm. Trên điện thoại, chạm lần đầu để xem, chạm lần nữa để xóa.",
      "Xóa khối nhỏ trước để các khối khác dồn lại thành khối lớn.",
    ],
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
      "Mỗi đạo cụ dùng một lần: Dò chông (Kim) lộ một bẫy; Mầm xanh (Mộc) mở thử một ô không sợ bẫy; Soi nước (Thủy) báo số bẫy trong vùng 3×3; Đốt lau (Hỏa) mở sạch vùng 3×3; Khiên đất (Thổ) đỡ một lần sa bẫy; Sấm báo (Lôi) báo số bẫy cả hàng hoặc cột; Gió mách (Phong) chỉ ra một ô chắc chắn.",
    ],
    rewards: [
      "Chơi ngay trên máy bạn, không thưởng và không xếp hạng. Thời gian tốt nhất của từng bậc lưu trên trình duyệt này.",
    ],
    tips: [
      "Bắt đầu từ góc nhỏ có số 1 nằm cạnh các ô đã biết: thường chỉ còn một ô để dò.",
      "Khi hai ô số chung nhau vài ô trống, so sánh số bẫy của chúng để tìm ô chắc chắn.",
      "Cất Gió mách cho lúc bí: nó luôn chỉ ra một ô suy ra được.",
    ],
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
      "Cần trình danh, khách không chơi được.",
    ],
    rewards: [
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
      "Đạo không đi trong ngày thì nghỉ và hồi 15% máu.",
      "Giặc mạnh thêm 5% mỗi ngày. Hết ngày mà chưa chiếm được thành là thua.",
      "Sa bàn có sương mù: bạn chỉ thấy ô đi được, chòi canh giúp nhìn xa. Đường vượt nước mất 2 ngày.",
      "Đạo kia đứng kề ô đang đánh thì hai đạo giáp công, giặc yếu đi.",
      "Thua trận thì đạo đó rút về và gục. Mỗi ngày có 3 lượt xuất quân.",
    ],
    rewards: [
      "Thưởng trận như trận thường, lần đầu thắng mỗi bậc có thưởng lớn.",
      "Khách chơi được, không có bảng xếp hạng.",
    ],
    tips: ["Đừng để một đạo đi quá xa: chờ đạo kia tới kề để giáp công thì trận nhẹ hơn nhiều."],
  },
};
