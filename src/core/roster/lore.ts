// Tiểu sử hư cấu của tướng thường (42 người) và Xạ thủ, Sát thủ (14 người): ngoại hiệu, phe, xuất thân, tính cách, câu nói,
// quan hệ. Nguồn: docs/03-characters/thiet-ke-lai-nhan-vat.md và ho-so-37-tuong-thuong.md (Shan duyệt 08/11/2026).
// CHỈ là chữ để hiển thị ở tab Chi tiết: không ảnh hưởng chiêu thức, chỉ số, mở khóa hay giá bán. Mọi nhân vật ở đây là
// HƯ CẤU của game, không phải người có trong sử. `id` không đổi khi đổi tên hiển thị (ở roster.ts).

import { ALL_COMPANIONS } from "./roster";

/** 13 phe: nghĩa quân Hoa Lư và 12 sứ quân. `id` trùng id cứ điểm trên bản đồ Sử ký (ký hiệu cờ ở public/art/flags/co-<id>.webp). */
export type FactionId =
  | "hoaLu" | "tranLam" | "phamBachHo" | "ngoXuongXi" | "ngoNhatKhanh" | "nguyenKhoan" | "kieuCongHan"
  | "kieuThuan" | "lyKhue" | "nguyenThuTiep" | "luDuong" | "nguyenSieu" | "doCanhThac";

export interface Faction {
  readonly id: FactionId;
  readonly name: string;
}

export const FACTIONS: Readonly<Record<FactionId, Faction>> = {
  hoaLu: { id: "hoaLu", name: "Nghĩa quân Hoa Lư" },
  tranLam: { id: "tranLam", name: "Bố Hải" },
  phamBachHo: { id: "phamBachHo", name: "Đằng Châu" },
  ngoXuongXi: { id: "ngoXuongXi", name: "Bình Kiều" },
  ngoNhatKhanh: { id: "ngoNhatKhanh", name: "Đường Lâm" },
  nguyenKhoan: { id: "nguyenKhoan", name: "Tam Đái" },
  kieuCongHan: { id: "kieuCongHan", name: "Phong Châu" },
  kieuThuan: { id: "kieuThuan", name: "Hồi Hồ" },
  lyKhue: { id: "lyKhue", name: "Siêu Loại" },
  nguyenThuTiep: { id: "nguyenThuTiep", name: "Tiên Du" },
  luDuong: { id: "luDuong", name: "Tế Giang" },
  nguyenSieu: { id: "nguyenSieu", name: "Tây Phù Liệt" },
  doCanhThac: { id: "doCanhThac", name: "Đỗ Động" },
};

export interface CharacterLore {
  /** Ngoại hiệu (dân gian gọi), ví dụ "Đảm Hỏa". Xạ thủ, Sát thủ: tên hiệu cũ của họ. */
  readonly epithet: string;
  /** Nghĩa ngắn của ngoại hiệu; rỗng nếu tên hiệu đủ rõ. */
  readonly epithetMeaning: string;
  readonly faction: FactionId;
  /** Câu ngắn nói rõ xuất thân quân ngũ, ví dụ "Lính Siêu Loại, theo về Hoa Lư". */
  readonly factionNote: string;
  readonly age?: number;
  readonly hometown?: string;
  readonly backstory: string;
  readonly personality?: string;
  readonly quote?: string;
}

export const CHARACTER_LORE: Readonly<Record<string, CharacterLore>> = {
  haVan: { epithet: "Đảm Hỏa", epithetMeaning: "gánh lửa, nhận phần nặng", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư (cờ lau)", age: 25, hometown: "làng đúc đồng ven sông",
    backstory: "Con gái thợ đúc, lớn lên bên lò lửa và khung dệt của mẹ. Khi cờ lau cần giáo và trống đồng, cô mang lửa lò theo đi, thành người \"gọi lửa\" của đội quân.",
    personality: "điềm tĩnh, kín tiếng, ít cười; thói quen lau lư hương mỗi sáng.",
    quote: "Lửa lò nuôi được cả làng, lửa trận thì tôi xin nhận phần nặng." },
  leThach: { epithet: "Thủ Thổ", epithetMeaning: "giữ đất", faction: "hoaLu", factionNote: "Dân binh trong nghĩa quân Hoa Lư", age: 30, hometown: "làng ven đê",
    backstory: "Người đắp lũy và giữ đê, tay quen vác đất, từng một mình giữ kho thóc làng qua mùa nước lớn. Nghe tin cờ lau, anh dẫn thanh niên làng đi theo.",
    personality: "chắc nịch, ít nói, bền bỉ; có thói quen đặt tay lên đất trước trận.",
    quote: "Đất còn thì lũy còn. Ta đứng đây." },
  maiThanh: { epithet: "Thanh Hồ", epithetMeaning: "hồ trong, thuốc trong hồ lô", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư, lo việc chữa trị", age: 22, hometown: "thuyền thuốc trên sông",
    backstory: "Con nhà thầy thuốc đò, quen hái lá ven sông và chữa người bị thương sau lũ. Cô theo quân vì thấy quá nhiều người ngã xuống mà không ai chữa.",
    personality: "dịu dàng, quả quyết, hay nhắc người khác uống nước; thuộc tên mọi loại lá.",
    quote: "Vết thương nào cũng có thuốc. Cứ để tôi lo." },
  toKim: { epithet: "Toán Lương", epithetMeaning: "tính từng hạt lương", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư, lo lương thảo", age: 35, hometown: "chợ bến sông",
    backstory: "Con nhà buôn chợ bến, giỏi tính từng hạt thóc, từng đường đi. Anh dùng sổ sách và đường buôn để quân có lương trước khi có giáo.",
    personality: "lanh lợi, hơi kiêu, tính toán; hay đếm nhẩm khi suy nghĩ.",
    quote: "Thóc nào đi đường nào, tôi đếm đủ." },
  phungPhong: { epithet: "Báo Phong", epithetMeaning: "báo gió trước trận", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư, trinh sát đưa tin", age: 40, hometown: "vùng núi gió",
    backstory: "Người đưa tin vùng núi, thổi sáo trúc để báo hiệu giữa các làng, đọc gió và mây để đoán thời tiết. Anh theo quân để dẫn đường và báo gió trước trận.",
    personality: "từ tốn, quan sát, ít nói; thường ngước nhìn trời trước khi mở lời.",
    quote: "Gió đã đổi. Quân ta xuất phát." },
  tranCuong: { epithet: "Bất Hạ Môn", epithetMeaning: "cổng không bao giờ hạ", faction: "lyKhue", factionNote: "Lính Siêu Loại, theo về Hoa Lư", age: 38, hometown: "thành lũy tre vùng Siêu Loại",
    backstory: "Đội trưởng giữ cổng, lớn lên bên lò rèn nhà, cầm đại đao từ năm mười lăm tuổi. Khi vùng đất đổi chủ, anh dẫn em gái sang Hoa Lư vì muốn nàng có nơi yên ổn mà chữa người.",
    personality: "nghiêm, ít nói, trọng quy củ; mỗi sáng mài đao trước khi ăn.",
    quote: "Cổng ta giữ chưa từng hở một lần." },
  lyLiet: { epithet: "Cuồng Hỏa", epithetMeaning: "lửa dữ", faction: "phamBachHo", factionNote: "Lính Đằng Châu, theo về Hoa Lư", age: 35, hometown: "chợ bến Đằng Châu",
    backstory: "Lính giữ chợ bến, hay can thiệp khi có kẻ ăn hiếp tiểu thương. Anh theo về cùng em gái, vì cả hai không muốn thấy bến chợ cháy thêm lần nữa.",
    personality: "nóng, thẳng, dễ bực nhưng không nuốt lời; hay bẻ khớp ngón tay.",
    quote: "Cháy thì cháy cho ra lửa." },
  daoLam: { epithet: "Mặc Lam", epithetMeaning: "mực xanh của người ghi chép", faction: "nguyenThuTiep", factionNote: "Lính Tiên Du, theo về Hoa Lư", age: 24, hometown: "chân núi Tiên Du",
    backstory: "Người đọc chú trong đội quân vùng Tiên Du, ghi chép bằng sách thẻ tre. Cô theo anh trai về Hoa Lư vì tin lời anh: nơi mới cần người biết ghi chép.",
    personality: "ham đọc, nhút nhát, bướng khi bị ép sai; hay chép lại câu hay.",
    quote: "Chữ nhớ giúp ta, khi trí nhớ đã mệt." },
  vuLoi: { epithet: "Thiên Cảnh", epithetMeaning: "trời nhắc nhở", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 32, hometown: "miếu thần sấm đầu làng",
    backstory: "Người trông miếu thần sấm, vẫn giữ tục xin mưa mỗi năm. Anh theo cờ lau khi dân làng đòi người ra giúp việc cầu mưa lúc hạn.",
    personality: "nghiêm, ít cười, khi đứng trước dân thì rất hiền.",
    quote: "Trời không giận ai, chỉ nhắc nhở." },
  hoangMoc: { epithet: "Hồ Tử", epithetMeaning: "chàng trai của đầm", faction: "kieuThuan", factionNote: "Lính Hồi Hồ, theo về Hoa Lư", age: 22, hometown: "ven đầm Hồi Hồ",
    backstory: "Lính trẻ, quen chèo xuồng chặt lau, mang theo cây giản sắt ông cậu rèn cho. Anh theo cờ lau vì muốn thấy thế giới ngoài đầm, kéo theo ông cậu cứng đầu.",
    personality: "hồn nhiên, nhanh nhảu, hay quên đường; mê ăn cơm lam.",
    quote: "Đầm lớn lắm, nhưng thế gian còn lớn hơn." },
  caoKien: { epithet: "Trực Mâu", epithetMeaning: "mâu thẳng, lòng gọn", faction: "ngoXuongXi", factionNote: "Lính Bình Kiều, theo về Hoa Lư", age: 36, hometown: "thành Bình Kiều",
    backstory: "Lính giáo giữ thành, từng canh cổng nhiều năm. Anh theo về sau khi thấy người bạn cũ ở phía Hoa Lư vẫn nhớ tên mình.",
    personality: "chịu đựng, giữ lời, ít khoe; thói quen lau giáo mỗi tối.",
    quote: "Giáo dài, nhưng lòng phải ngắn gọn." },
  lucDiep: { epithet: "Hồi Xuân", epithetMeaning: "chữa lành", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 24, hometown: "núi thuốc phía Hoa Lư",
    backstory: "Con nhà hái thuốc, thuộc từng chiếc lá. Cô theo cờ lau để mang thảo dược tới nơi lính cần.",
    personality: "dịu, ham học, hay quên bản thân; vừa đi vừa ngắt lá ngửi.",
    quote: "Lá nào cũng là một lời hứa chữa lành." },
  bachSuong: { epithet: "Sương Phủ", epithetMeaning: "sương phủ lên vết thương", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 29, hometown: "vùng sương mù ven núi",
    backstory: "Người làm hương xông và thuốc giải cảm, ở vùng đồi sương. Cô theo cờ lau khi làng bị cảm dịch mà không ai đến.",
    personality: "nhẹ nhàng, mơ hồ, quan sát; thường nhìn xa.",
    quote: "Sương mỏng, nhưng che được nhiều vết thương." },
  ninhHoa: { epithet: "Tiếu Diện", epithetMeaning: "mặt cười giấu cái cau mày", faction: "nguyenSieu", factionNote: "Lính Tây Phù Liệt, chưa theo về; đi cùng Hoa Lư vì nhiệm vụ riêng", age: 37, hometown: "vùng Tây Phù Liệt",
    backstory: "Quân sư của một đội lũy, lo mưu giữ thành. Ông vào đội Hoa Lư theo một thỏa thuận tạm, còn vợ ông ở phía Đằng Châu đã sang trước.",
    personality: "nhanh, nói liến thoắng, hay đùa; dùng quạt để giấu cái cau mày.",
    quote: "Lũy cao đến đâu, người giữ vẫn là người." },
  quachAn: { epithet: "Nhàn Điếu", epithetMeaning: "cần câu nhàn", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 52, hometown: "bờ sông yên tĩnh",
    backstory: "Ẩn sĩ câu cá ven sông, được dân hỏi ý kiến mỗi khi có chuyện. Ông ra giúp cờ lau khi một người học trò cũ tìm đến.",
    personality: "thong dong, hóm, nói bóng; câu cá để nghĩ.",
    quote: "Cá cắn lúc ta không vội, như thế sự." },
  taThach: { epithet: "Địa Thế", epithetMeaning: "địa thế không biết dối", faction: "doCanhThac", factionNote: "Lính Đỗ Động, theo về Hoa Lư", age: 46, hometown: "vùng đầm Đỗ Động",
    backstory: "Người cầm gậy chỉ huy của đồn, am hiểu địa thế sông đầm. Ông theo về vì thấy địa thế cần được dùng đúng.",
    personality: "chắc, ít nói, từng trải; thích nhìn bản đồ lâu.",
    quote: "Địa thế không biết nói, nhưng không biết dối." },
  macVan: { epithet: "Viễn Âm", epithetMeaning: "tiếng đi xa hơn lời nói", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 30, hometown: "vùng núi nhiều sấm",
    backstory: "Người thổi tù và báo hiệu cho các làng núi, giỏi đọc dấu hiệu trời. Cô theo cờ lau để thổi nhịp tiến cho cả đội.",
    personality: "mạnh mẽ, thẳng, vui; thích thử gió trước khi nói.",
    quote: "Tiếng tù và đi xa hơn tiếng nói." },
  lamTung: { epithet: "Cô Tùng", epithetMeaning: "cây tùng lẻ bên đầm", faction: "kieuThuan", factionNote: "Lính Hồi Hồ, theo về Hoa Lư", age: 30, hometown: "ven đầm Hồi Hồ",
    backstory: "Người đốn lim ở bãi lau sậy, được chọn làm lính canh bờ đầm vì sức khỏe và cái đầu lạnh. Anh theo về sau khi thấy cháu mình muốn đi cùng cờ lau, không nỡ để thằng nhỏ đi một mình.",
    personality: "trầm, kiên nhẫn, thương người nhỏ; hay ngồi chẻ củi khi nghĩ ngợi.",
    quote: "Rừng không dạy ta chạy, chỉ dạy ta đứng." },
  hoLang: { epithet: "Nghịch Lưu", epithetMeaning: "ngược dòng", faction: "luDuong", factionNote: "Lính Tế Giang, theo về Hoa Lư", age: 33, hometown: "bến sông Tế Giang",
    backstory: "Con nhà chài, quen đâm cá bằng đinh ba rồi thành lính thủy giữ bến. Thấy bến vắng thuyền, dân đói, anh theo thuyền lương Hoa Lư vì tin ở đâu có lương, ở đó có chỗ đứng.",
    personality: "phóng khoáng, hay cười, ghét bị trói buộc; thích hát đò.",
    quote: "Nước chảy xuôi, ta đi ngược." },
  khaSon: { epithet: "Bất Thoái", epithetMeaning: "núi không lùi", faction: "nguyenKhoan", factionNote: "Lính Tam Đái, theo về Hoa Lư", age: 40, hometown: "chân núi Tam Đái",
    backstory: "Thợ đẽo đá chuyển sang cầm rìu trận, tay to như cái cối. Anh theo về khi em trai mình rời đồn; anh không nói nhiều, chỉ xách rìu đi theo.",
    personality: "chậm, chắc, ít lời, tốt bụng; thích đứng nhìn núi.",
    quote: "Núi không lùi, ta cũng vậy." },
  tongTan: { epithet: "Nộ Lôi", epithetMeaning: "sấm giận", faction: "kieuCongHan", factionNote: "Lính Phong Châu, theo về Hoa Lư", age: 42, hometown: "ngã ba sông vùng Phong Châu",
    backstory: "Lính kiếm lâu năm, dạy cả lớp trẻ cách giữ nhịp tiến quân. Anh theo về vì tin thế cục mới cần người dạy lính, không cần người chỉ chém.",
    personality: "nóng nhưng giữ lời, nghiêm với học trò, hiền với trẻ con.",
    quote: "Sấm đã nổ thì không thu lại." },
  huaLang: { epithet: "Khinh Phong", epithetMeaning: "gió nhẹ, không chờ ai", faction: "ngoNhatKhanh", factionNote: "Lính Đường Lâm, theo về Hoa Lư", age: 28, hometown: "làng gốm nhà đá ong vùng Đường Lâm",
    backstory: "Con nhà thợ gốm, học kiếm từ ông ngoại từng giữ cổng làng. Nàng theo về vì muốn gió trên đường làng thôi mang tiếng binh đao.",
    personality: "nhanh nhẹn, lém lỉnh, thẳng nhưng tế nhị; hay huýt sáo.",
    quote: "Gió không chờ ai, ta cũng không." },
  chuNgan: { epithet: "Định Tâm", epithetMeaning: "tâm vững, tay không run", faction: "ngoXuongXi", factionNote: "Lính Bình Kiều, theo về Hoa Lư", age: 45, hometown: "thành Bình Kiều",
    backstory: "Thầy khắc bùa bạc, chuyên khắc lên vật dụng của thành để cầu bình an. Ông theo về vì cho rằng thanh kiếm bạc không nên chỉ giữ cho một dòng họ.",
    personality: "cẩn thận, chuộng chữ, nói chậm; hay kiểm lại ba lần.",
    quote: "Bùa chỉ sáng khi người cầm không run." },
  damThao: { epithet: "Thảo Tâm", epithetMeaning: "lòng thật như cây rừng", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 26, hometown: "núi tre phía Hoa Lư",
    backstory: "Người hái thuốc kiêm thầy cúng rừng, dẫn dân qua rừng mỗi mùa lũ. Cô theo cờ lau vì quen đường rừng và thương những người lạc đường.",
    personality: "hiền, mơ màng, quan sát tỉ mỉ; nói chuyện với cây.",
    quote: "Cây không lừa ai, kể cả khi đi qua bão." },
  doanNham: { epithet: "Địa Ức", epithetMeaning: "đất nhớ mọi bước chân", faction: "doCanhThac", factionNote: "Lính Đỗ Động, theo về Hoa Lư", age: 50, hometown: "vùng đầm Đỗ Động",
    backstory: "Thầy cúng đất đầm, quen đọc mạch nước và chân đồi. Ông theo về vì muốn đưa người học trò trẻ khỏi chỗ nguy hiểm.",
    personality: "từ tốn, hay ví von, hơi lẩm cẩm khi kể chuyện cũ.",
    quote: "Đất nhớ mọi bước chân, kể cả bước chân của ta." },
  lieuYen: { epithet: "Hồi Phong", epithetMeaning: "gió mang về", faction: "ngoNhatKhanh", factionNote: "Lính Đường Lâm, theo về Hoa Lư", age: 27, hometown: "vùng Đường Lâm",
    backstory: "Lớn lên bên mái đình cổ, chuyên múa phất trần trong lễ cầu mùa. Cô theo về với hy vọng tìm được người chị thất lạc.",
    personality: "dịu dàng, giữ kẽ, hay mơ; thói quen nghe gió trước khi nói.",
    quote: "Gió từng mang chị em ta đi, gió cũng sẽ mang về." },
  thaiHa: { epithet: "Nhẫn Hải", epithetMeaning: "kiên nhẫn như biển", faction: "tranLam", factionNote: "Lính Bố Hải, đi cùng Hoa Lư theo lời kết minh", age: 44, hometown: "cửa biển Bố Hải",
    backstory: "Lính chèo thuyền hộ tống, tay chai như gỗ chèo. Ông sang giúp Hoa Lư khi liên minh được kết, và vì con trai ông đã đi trước làm trinh sát bến sông.",
    personality: "bình thản, thương con, nói ít; có thói quen đếm sóng.",
    quote: "Biển dạy ta kiên nhẫn, không dạy ta lùi." },
  truongViem: { epithet: "Dạ Tiếu", epithetMeaning: "cười trong đêm gác", faction: "nguyenSieu", factionNote: "Lính Tây Phù Liệt, theo về Hoa Lư", age: 29, hometown: "vùng Tây Phù Liệt",
    backstory: "Lính lũy, nóng tính, hay đùa trong giờ gác. Anh theo về cùng người đồng đội cũ vì chán cảnh gác lũy mà chẳng biết bảo vệ ai.",
    personality: "ồn ào, vui nhộn, thật bụng; thích kể chuyện tục.",
    quote: "Gác đêm thì phải biết cười, không thì lạnh." },
  ongChan: { epithet: "Nhịp Quân", epithetMeaning: "người giữ nhịp cho quân", faction: "kieuCongHan", factionNote: "Lính Phong Châu, theo về Hoa Lư", age: 41, hometown: "vùng núi Phong Châu",
    backstory: "Lính giữ nhịp tiến quân cho cả đội, đánh trống trận khi cần, tay cầm roi sắt. Ông theo về vì tin rằng đội quân mới cần nhịp mới.",
    personality: "thô, thật thà, trọng nghĩa; nói to.",
    quote: "Trống đánh đúng nhịp thì lính bước đúng đường." },
  manhTuong: { epithet: "Truy Phong", epithetMeaning: "đuổi theo gió", faction: "ngoNhatKhanh", factionNote: "Lính Đường Lâm, theo về Hoa Lư", age: 25, hometown: "làng Đường Lâm",
    backstory: "Lính trẻ nhanh chân, chuyên đi báo tin và phóng lao. Anh theo về vì thích nhìn thế giới rộng hơn mái làng.",
    personality: "hăng hái, tự tin quá mức, tốt bụng; thích thi chạy.",
    quote: "Chạy nhanh hơn gió thì còn lo gì." },
  chauNgoc: { epithet: "Nhất Châm", epithetMeaning: "một mũi kim đúng chỗ", faction: "lyKhue", factionNote: "Lính Siêu Loại, theo về Hoa Lư", age: 30, hometown: "thành lũy tre vùng Siêu Loại",
    backstory: "Thầy thuốc quân, giỏi châm cứu cho lính bị thương. Cô theo anh trai sang Hoa Lư vì muốn mở một trạm chữa không phân phe.",
    personality: "điềm tĩnh, chính xác, đôi khi lạnh; luôn đếm kim trước khi dùng.",
    quote: "Một mũi kim đúng chỗ hơn trăm lời an ủi." },
  hongDan: { epithet: "Văn Hỏa", epithetMeaning: "lửa nhỏ nấu thuốc", faction: "phamBachHo", factionNote: "Lính Đằng Châu, theo về Hoa Lư", age: 31, hometown: "chợ bến Đằng Châu",
    backstory: "Thầy thuốc chuyên chữa bỏng và đau xương cho thợ lò. Cô theo quân y về Hoa Lư dù chồng vẫn ở phía bên kia, vì tin việc chữa người không nên đợi ai đồng ý.",
    personality: "thẳng, thương người, hơi ngang bướng; hay nấu thuốc quá lâu.",
    quote: "Thuốc sắc lửa nhỏ, lòng chữa lửa lớn." },
  beLien: { epithet: "Vô Kỳ", epithetMeaning: "không cờ, chữa mọi phe", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 23, hometown: "quê Tam Đái",
    backstory: "Con gái một mưu sĩ Tam Đái, lớn lên bên mẹ làm thuốc nên chọn nghề y. Cô rời cha sang cờ lau vì không muốn chữa người chỉ để họ đi đánh nhau tiếp.",
    personality: "kín đáo, cứng đầu, tử tế; ít khi nói chuyện cha.",
    quote: "Tôi chữa người, không hỏi họ thuộc cờ nào." },
  tieuMinh: { epithet: "Thiên Lý Y", epithetMeaning: "thầy thuốc đi ngàn dặm", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 27, hometown: "thầy thuốc dạo qua các làng",
    backstory: "Thầy thuốc rong, mang túi thuốc đi từ làng này sang làng khác, từng chữa cho cả hai phía. Cô theo cờ lau vì thấy đội này lo cho người bệnh.",
    personality: "hoạt bát, nói nhiều, giản dị; cười lớn.",
    quote: "Đi nhiều mới biết bệnh nào cũng có nhà." },
  nhanTruc: { epithet: "Vô Ngôn", epithetMeaning: "kế hay không nói ra", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 34, hometown: "làng trúc",
    backstory: "Người chép sổ cho cả làng, giỏi tính kế đường rừng. Cô theo cờ lau để lo giấy tờ và đường tiếp tế.",
    personality: "tỉ mỉ, mềm mỏng, khó đoán; thích chép lại những câu hay.",
    quote: "Kế hay nhất là kế không phải nói ra." },
  maNhac: { epithet: "Hồi Thủ", epithetMeaning: "ngoái đầu vì thương con", faction: "nguyenKhoan", factionNote: "Lính Tam Đái, chưa theo về, đi cùng đội vì lệnh", age: 48, hometown: "chân núi Tam Đái",
    backstory: "Thầy bói, quân sư của đồn Tam Đái, gieo quẻ định ngày xuất quân. Con gái ông đã sang cờ lau, ông giả vờ không quan tâm.",
    personality: "thận trọng, mê tín, thương con nhưng cứng miệng.",
    quote: "Quẻ nói đi, nhưng lòng cha vẫn ngoái lại." },
  tuKinh: { epithet: "Trắc Lộ", epithetMeaning: "đo từng con đường", faction: "kieuCongHan", factionNote: "Lính Phong Châu, theo về Hoa Lư", age: 39, hometown: "vùng núi Phong Châu",
    backstory: "Người vẽ đường núi cho quân, dùng cửu tiết tiên để tự vệ. Ông theo về vì muốn bản đồ của mình được dùng cho việc lớn hơn.",
    personality: "nghiêm, hay dò, cầu toàn; thích đo mọi thứ.",
    quote: "Đường ngắn nhất là đường ta đã đo." },
  buiPhieu: { epithet: "Thanh Sổ", epithetMeaning: "sổ sách rõ ràng", faction: "ngoNhatKhanh", factionNote: "Lính Đường Lâm, theo về Hoa Lư", age: 33, hometown: "vùng Đường Lâm",
    backstory: "Thư lại của đồn, giữ tráp sổ sách thuế và lương. Anh theo về vì muốn sổ sách của mình có ích cho người.",
    personality: "khéo, hay cười nhẹ, nói chắc từng chữ; ghét nợ.",
    quote: "Sổ rõ thì lòng yên." },
  nghiemThiet: { epithet: "Thiết Kỷ", epithetMeaning: "kỷ luật sắt", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 44, hometown: "quê gần Hoa Lư",
    backstory: "Người giữ kỷ luật của đội nghĩa quân, từng làm đội trưởng trong thành. Ông nhớ người bạn cũ ở Bình Kiều, nhưng giữ mặt nghiêm.",
    personality: "nghiêm, ngay, ít khen; luôn mang theo lệnh bài.",
    quote: "Quân kỷ là sợi dây giữ cả đội khỏi tan." },
  samTue: { epithet: "Tĩnh Thủy", epithetMeaning: "nước lặng, đọc được trước", faction: "kieuThuan", factionNote: "Lính Hồi Hồ, theo về Hoa Lư", age: 36, hometown: "đầm Hồi Hồ",
    backstory: "Người cầm cờ lệnh của đội lau sậy, giỏi đọc địa hình đầm. Cô theo về vì muốn đưa kiến thức đầm vào thế trận chung.",
    personality: "bình tĩnh, quả quyết, hay suy xét; thường vén tóc khi nghĩ.",
    quote: "Nước lặng chưa chắc yên, ta đọc nó trước." },
  viTrieu: { epithet: "Chính Cổ", epithetMeaning: "trống đúng nhịp", faction: "nguyenThuTiep", factionNote: "Lính Tiên Du, theo về Hoa Lư", age: 31, hometown: "chân núi Tiên Du",
    backstory: "Người cầm trống lệnh của đội quân Tiên Du, giỏi giữ nhịp. Anh theo về cùng em gái vì muốn đưa nhịp trống vào thế trận lớn hơn.",
    personality: "nhanh, vui, thương em; hay gõ nhịp lên mọi thứ.",
    quote: "Trống đúng nhịp, quân đúng bước." },
  tonDiem: { epithet: "Hỏa Lệnh", epithetMeaning: "lệnh ban thì lửa cũng nghe", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư", age: 33, hometown: "làng đúc",
    backstory: "Người cầm cờ lệnh của đội đúc, quen điều hành thợ trong lò lửa. Cô theo cờ lau vì thấy đội này cần người điều phối giỏi.",
    personality: "quyết đoán, sôi nổi, gắt khi mệt; hay bó thẻ tre trước khi họp.",
    quote: "Lệnh đã ban thì lửa cũng phải nghe." },
  bachNoLang: { epithet: "Bạch Nỏ Lang", epithetMeaning: "", faction: "ngoXuongXi", factionNote: "Lính Bình Kiều, theo về Hoa Lư",
    backstory: "Cựu xạ thủ trấn thành mang ký ức trận thủ lũy thất bại; kiệm lời, không tiêu phí một phát nỏ." },
  thanhLamXa: { epithet: "Thanh Lâm Xạ", epithetMeaning: "", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư",
    backstory: "Người dẫn đường núi tre bảo vệ dân chạy loạn; mềm mỏng khi giao tiếp nhưng tuyệt đối bình tĩnh lúc kéo cung." },
  lamGiangPhiDiep: { epithet: "Lam Giang Phi Diệp", epithetMeaning: "", faction: "tranLam", factionNote: "Lính Bố Hải, đi cùng Hoa Lư theo lời kết minh",
    backstory: "Trinh sát bến sông quen đọc dòng chảy và dấu thuyền. Mang phi tiêu gọn thay nỏ để đi qua lối hẹp." },
  xichDiemLuan: { epithet: "Xích Diệm Luân", epithetMeaning: "", faction: "phamBachHo", factionNote: "Lính Đằng Châu, theo về Hoa Lư",
    backstory: "Nữ hộ vệ từng giữ kho lương qua một đêm hỏa hoạn. Tính quyết liệt thể hiện qua vòng phóng và bước xoay chắc." },
  tranSonThach: { epithet: "Trấn Sơn Thạch", epithetMeaning: "", faction: "nguyenKhoan", factionNote: "Lính Tam Đái, theo về Hoa Lư",
    backstory: "Người giữ lối đèo từng nhặt đá bảo vệ đường rút cho dân làng. Dùng phi hoàng thạch đẽo thuôn dẹt, mang trong túi đan mây bọc da." },
  loiMinhXa: { epithet: "Lôi Minh Xạ", epithetMeaning: "", faction: "kieuCongHan", factionNote: "Lính Phong Châu, theo về Hoa Lư",
    backstory: "Người truyền tin miền núi chọn châm phóng gọn để bảo vệ quân lệnh; chiếc chuông cũ vẫn là dấu nhận diện." },
  tatPhongLang: { epithet: "Tật Phong Lăng", epithetMeaning: "", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư",
    backstory: "Nữ kỵ trạm dùng lụa hiệu để truyền tín hiệu qua đèo gió; nhờ thuật Phong hạn chế, dải lụa có thể vươn ra như một vũ khí." },
  bachPhongDao: { epithet: "Bạch Phong Đao", epithetMeaning: "", faction: "lyKhue", factionNote: "Lính Siêu Loại, theo về Hoa Lư",
    backstory: "Nữ cận vệ giữ nửa ấn đồng làm kỷ vật; kiệm động tác, quan sát trước khi hành động." },
  docAnh: { epithet: "Độc Ảnh", epithetMeaning: "", faction: "kieuThuan", factionNote: "Lính Hồi Hồ, theo về Hoa Lư",
    backstory: "Trinh sát rừng trầm lặng mang một lọ thảo mộc; hộp kim nhỏ là dấu nghề." },
  hanGiangKhach: { epithet: "Hàn Giang Khách", epithetMeaning: "", faction: "luDuong", factionNote: "Lính Tế Giang, theo về Hoa Lư",
    backstory: "Khách giang hồ ven sông giấu thân phận sau vẻ mệt mỏi; một lưỡi dao ẩn buộc dưới cẳng tay phải." },
  xichDa: { epithet: "Xích Dạ", epithetMeaning: "", faction: "nguyenSieu", factionNote: "Lính Tây Phù Liệt, theo về Hoa Lư",
    backstory: "Kẻ đột kích đêm mang dấu vải cháy xém trên vai; dùng hai đao giống nhau nhưng hai tay ra đòn không đối xứng." },
  diaAn: { epithet: "Địa Ẩn", epithetMeaning: "", faction: "doCanhThac", factionNote: "Lính Đỗ Động, theo về Hoa Lư",
    backstory: "Trinh sát công sự quen bám đường đá; bộ trảo trên mu tay gợi hình thú săn phục kích, vẫn là người bình thường." },
  loiAnh: { epithet: "Lôi Ảnh", epithetMeaning: "", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư",
    backstory: "Nữ truyền tin đột kích giữ phù hiệu đồng nứt trước ngực; mang một hộp ám khí đóng kín, không mang nỏ." },
  voAnh: { epithet: "Vô Ảnh", epithetMeaning: "", faction: "hoaLu", factionNote: "Nghĩa quân Hoa Lư",
    backstory: "Nữ nhạc công lang bạt từng làm liên lạc, giữ chiếc vòng sợi lau ở đai; vẻ thư thái che giấu âm công sắc và ngắn." },
};

/** Mức chắc chắn: `chot` hiển thị cho người chơi; `goiMo` chỉ ghi nội bộ để viết thoại, có thể đổi. */
export type RelationLevel = "chot" | "goiMo";

/**
 * Một mối quan hệ giữa hai nhân vật. `aIs` là người A là gì của B, `bIs` là người B là gì của A.
 * Quan hệ nằm ở bảng riêng, hồ sơ từng người không viết cứng: thêm nhân vật mới chỉ là thêm dòng, không sửa hồ sơ cũ.
 */
export interface Relation {
  readonly code: string;
  readonly a: string;
  readonly b: string;
  readonly aIs: string;
  readonly bIs: string;
  readonly level: RelationLevel;
}

export const RELATIONS: readonly Relation[] = [
  { code: "R1", a: "tranCuong", b: "chauNgoc", aIs: "Anh", bIs: "Em gái", level: "chot" },
  { code: "R2", a: "thaiHa", b: "lamGiangPhiDiep", aIs: "Cha", bIs: "Con trai", level: "chot" },
  { code: "R3", a: "khaSon", b: "tranSonThach", aIs: "Anh", bIs: "Em trai", level: "chot" },
  { code: "R4", a: "lyLiet", b: "xichDiemLuan", aIs: "Anh", bIs: "Em gái", level: "chot" },
  { code: "R5", a: "hongDan", b: "ninhHoa", aIs: "Vợ", bIs: "Chồng", level: "chot" },
  { code: "R6", a: "maNhac", b: "beLien", aIs: "Cha", bIs: "Con gái", level: "chot" },
  { code: "R7", a: "viTrieu", b: "daoLam", aIs: "Anh", bIs: "Em gái", level: "goiMo" },
  { code: "R8", a: "lieuYen", b: "voAnh", aIs: "Chị em", bIs: "Chị em", level: "goiMo" },
  { code: "R9", a: "doanNham", b: "diaAn", aIs: "Thầy", bIs: "Học trò", level: "goiMo" },
  { code: "R10", a: "quachAn", b: "hanGiangKhach", aIs: "Thầy", bIs: "Học trò", level: "goiMo" },
  { code: "R11", a: "nghiemThiet", b: "caoKien", aIs: "Bạn cũ", bIs: "Bạn cũ", level: "goiMo" },
  { code: "R12", a: "lamTung", b: "hoangMoc", aIs: "Cậu", bIs: "Cháu", level: "goiMo" },
  { code: "R13", a: "tongTan", b: "loiMinhXa", aIs: "Thầy", bIs: "Học trò", level: "goiMo" },
  { code: "R14", a: "damThao", b: "lucDiep", aIs: "Chị em họ", bIs: "Chị em họ", level: "goiMo" },
  { code: "R15", a: "xichDa", b: "truongViem", aIs: "Đồng đội cũ", bIs: "Đồng đội cũ", level: "goiMo" },
];

export function loreOf(id: string): CharacterLore | undefined {
  return CHARACTER_LORE[id];
}

export interface RelatedPerson {
  readonly id: string;
  readonly name: string;
  /** Người kia là gì của nhân vật đang xem ("Em gái", "Cha"…). */
  readonly role: string;
}

/** Người liên quan đến `id`. Mặc định chỉ mức `chot` (phần người chơi thấy); `goiMo` cho công cụ nội bộ. */
export function relatedTo(id: string, levels: readonly RelationLevel[] = ["chot"]): readonly RelatedPerson[] {
  const nameOf = (x: string) => ALL_COMPANIONS.find((c) => c.id === x)?.name ?? x;
  const out: RelatedPerson[] = [];
  for (const r of RELATIONS) {
    if (!levels.includes(r.level)) continue;
    if (r.a === id) out.push({ id: r.b, name: nameOf(r.b), role: r.bIs });
    else if (r.b === id) out.push({ id: r.a, name: nameOf(r.a), role: r.aIs });
  }
  return out;
}
