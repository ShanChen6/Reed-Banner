// Khung Chương VI "Về một mối" (M21–M24, freeze mục 2.2). M21 Đỗ Động mở chương: cứ điểm có ghi "phá được" (S04,
// W12), game chọn làm cao trào nghệ thuật, không gọi là trận cuối trong sử (U07). M21 chia ba trận: mở đường vây,
// phá tuyến ngoài (trùm lui khi còn nửa máu), trận quyết (trùm giữ máu còn lại). M22 "Giang Sơn Một Mối" là sự
// kiện tổng kết 12 vùng (CAMP-07.01): đọc thế cục hồ sơ server, không có trận hay đối thủ.

import type { ChapterContent, MissionCopy } from "./chapterOne";

export const CHAPTER_SIX: ChapterContent = {
  chapter: 6,
  title: "Về một mối",
  question: "Thắng trận khác gì với dựng được chính quyền?",
  missions: ["M21", "M22", "M23", "M24"],
  playable: ["M21", "M22", "M23", "M24"],
  region: {
    name: "Đỗ Động Giang",
    modernRegion: "Hà Nội",
    at: [105.78, 20.88],
    note: "Khoanh vùng sông Đỗ Động để định hướng, không phải ranh giới lịch sử.",
  },
  legendVsRecord: {
    legend:
      "Một số bài kể coi Đỗ Động là trận cuối, kèm một cuộc vây rất dài. Bộ nguồn của game chưa chứng minh những điều ấy nên không dùng.",
    record:
      "Toàn thư ghi Đỗ Cảnh Thạc giữ sông Đỗ Động. Sử tổng hợp ghi Đinh Bộ Lĩnh phá được Đỗ Động; năm 968 Đinh Bộ Lĩnh lên ngôi.",
  },
  completeLine:
    "Chương VI khép lại với Hoa Lư. Thứ tự các nhiệm vụ trước đó là của game, không phải thứ tự trong sử.",
};

export const CHAPTER_SIX_COPY: readonly MissionCopy[] = [
  {
    id: "M21",
    prompt: "Trước cổng Đỗ Động, quân Hoa Lư nói gì với người trong đồn?",
    objective:
      "Qua ba trận: mở đường vây, phá tuyến ngoài, rồi hạ Đỗ Cảnh Thạc trong trận quyết.",
    cinematic: [
      {
        text: "Đường vào Đỗ Động men theo bờ sông và những vạt đầm. Bến đò có lính canh, trên gò cao cắm cờ của đồn.",
        basis: "fictional",
      },
      {
        speaker: "Đỗ Cảnh Thạc",
        text: "Đỗ Động sẽ tự quyết lấy đường của mình. Muốn đi qua, các ông phải chứng minh được sức mạnh ấy.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Đỗ Cảnh Thạc xưng là Đỗ Cảnh Công, giữ sông Đỗ Động. Lời chua ghi sông Đỗ Động bắt nguồn từ đầm lớn xã Đàn Viên, huyện Thanh Oai.",
        basis: "recorded",
        refs: ["S01", "W12"],
      },
      {
        text: "Sử tổng hợp ghi Đinh Bộ Lĩnh phá được Đỗ Động; tổng thuật hiện đại xếp thế lực này vào nhóm bị đánh dẹp.",
        basis: "recorded",
        refs: ["S04", "S06", "W12"],
      },
      {
        text: "Đây không phải trận cuối được sử xác nhận. Game chọn Đỗ Động làm cao trào của chiến dịch. Thời gian vây, người cầm quân và số phận Đỗ Cảnh Thạc đều chưa có chứng cứ.",
        basis: "disputed",
        refs: ["U07"],
      },
      {
        text: "Ba trận dưới đây do game dựng: mở đường vây, phá tuyến ngoài, rồi trận quyết. Sức mạnh và máu của trùm mang qua các trận là luật game.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "callOpenGate",
        label: "Trịnh Tú gọi mở cổng",
        beats: [
          {
            speaker: "Trịnh Tú",
            text: "Người trong đồn cũng có nhà ở ven sông. Mở cổng thì không ai bị truy xét chuyện cũ.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "declareAdvance",
        label: "Đinh Bộ Lĩnh tuyên bố tiến quân",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Đường về một mối phải đi qua đây. Ai muốn giữ làng mình thì đứng sang một bên.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: Đỗ Động bị phá, như sử tổng hợp và tổng thuật ghi. Game không nói Đỗ Cảnh Thạc chết, bị bắt hay rút đi đâu, và không nêu ngày tháng.",
        basis: "recorded",
        refs: ["S04", "S06", "W12"],
      },
      {
        text: "Đỗ Động là cao trào game chọn, không phải trận cuối trong sử. Lựa chọn trước trận chỉ đổi lời kể.",
        basis: "reconstructed",
        refs: ["U07"],
      },
    ],
    defeat: [
      {
        text: "Quân lui ra khỏi đầm. Đánh lại đúng phase vừa thua; những phase đã qua vẫn giữ, máu trùm đã mất không hồi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Đỗ Cảnh Thạc, xưng là Đỗ Cảnh Công, giữ sông Đỗ Động.” Lời chua: sông Đỗ Động phát nguyên từ cái đầm lớn xã Đàn Viên, huyện Thanh Oai.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều chưa rõ",
        beats: [
          {
            text: "Chuyện Đỗ Động là trận cuối, độ dài cuộc vây, hay việc các sứ quân khác đã giải quyết xong trước đó không có trong bộ nguồn của game nên không dùng. Tước hiệu giữ theo Toàn thư là Đỗ Cảnh Công.",
            basis: "disputed",
            refs: ["U07", "W12"],
          },
        ],
      },
    ],
  },
  {
    id: "M22",
    prompt:
      "Trước khi bàn chuyện dựng triều, Đinh Bộ Lĩnh xem lại mười hai vùng theo cách nào?",
    cinematic: [
      {
        text: "Ở Hoa Lư, người chép sổ xếp mười hai bó thẻ tre lên chiếu, mỗi bó ghi một vùng. Có bó dày, có bó chỉ vài dòng.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Sử thường đặt việc chấm dứt cát cứ vào cuối năm 967, trước mốc 968. Lịch từng trận, từng cuộc hội kiến thì không chắc.",
        basis: "recorded",
        refs: ["E13"],
      },
      {
        text: "Tổng thuật hiện đại không gom mười hai sứ quân vào một kiểu kết cục: có liên minh, có theo về, có đánh dẹp, và có trường hợp tan rã hay còn tranh luận.",
        basis: "recorded",
        refs: ["S06"],
      },
      {
        text: "Hai trường hợp (Nguyễn Khoan, Lữ Đường) chỉ dựa vào tổng thuật có độ tin cậy vừa đến thấp, nên hồ sơ ghi riêng thành nhóm còn tranh luận.",
        basis: "disputed",
        refs: ["S06"],
      },
      {
        text: "Hồ sơ dưới đây đọc đúng thế cục bạn đã đi qua trong game. Thứ tự các vùng là cách game kể, không phải thứ tự trong sử.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "reviewDossiers",
        label: "Mở hồ sơ 12 sứ quân",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Đọc lại từng bó. Vùng nào về bằng lời hứa thì phải giữ lời hứa ấy; vùng nào phải đánh thì phải lo cho dân ở đó trước.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "hearTheRegions",
        label: "Nghe người các vùng kể",
        beats: [
          {
            speaker: "Lê Hoàn",
            text: "Người từ Đằng Châu, Tế Giang, Đỗ Động đều đang ở ngoài sân. Họ không hỏi ai thắng; họ hỏi năm tới nộp thóc cho ai.",
            basis: "fictional",
          },
          {
            text: "Lê Hoàn chỉ góp mặt trong cảnh này; game không nói đây là lúc ông theo Đinh Bộ Lĩnh.",
            basis: "reconstructed",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Bài học của chặng này: thống nhất không phải là cộng đủ mười hai trận thắng. Có vùng về bằng liên minh, có vùng theo về, có vùng phải đánh dẹp, và có vùng sử chưa nói rõ.",
        basis: "reconstructed",
      },
      {
        text: "Phía trước là mốc có sử chép: năm 968 Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu Đại Cồ Việt, định đô ở Hoa Lư.",
        basis: "recorded",
        refs: ["E10"],
      },
    ],
    sourceNotes: [
      {
        title: "Mốc thời gian",
        beats: [
          {
            text: "Việc chấm dứt cát cứ được đặt vào khoảng cuối năm 967; các nguồn có phạm vi năm khác nhau và không có lịch từng trận. Game không gắn ngày cho từng vùng.",
            basis: "disputed",
            refs: ["E13"],
          },
        ],
      },
    ],
  },

  {
    id: "M23",
    prompt: "Trước lễ lên ngôi, việc gì ở Hoa Lư được lo trước?",
    cinematic: [
      {
        text: "Trong thung lũng giữa các vách đá vôi, người ta dọn sân, chặt tre dựng lán, và bàn xem kho thóc, trại quân, chỗ làm lễ nên đặt ở đâu.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Đinh Bộ Lĩnh gắn với đất Hoa Lư. Năm 968, sau khi lên ngôi, ông định đô ở đây; Hoa Lư thành trung tâm chính quyền nhà Đinh.",
        basis: "recorded",
        refs: ["E10", "S04", "S08"],
      },
      {
        text: "Đây là trích đoạn xây dựng quốc gia do game tái dựng: một buổi bàn việc trước lễ, không phải biên bản hay chính sách có sử chép. Lựa chọn chỉ đổi lời kể, không đổi lịch sử hay kinh tế trong game.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "army",
        label: "Ưu tiên quân",
        beats: [
          {
            speaker: "Nguyễn Bặc",
            text: "Quân các vùng mới về chung một lệnh. Phải chia trại, đặt người giữ cửa ải trước, kẻo trong thành chưa yên đã có chuyện.",
            basis: "fictional",
          },
          {
            text: "Kết quả: sổ ghi việc chia trại và giữ các lối vào Hoa Lư được làm trước.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "livelihood",
        label: "Ưu tiên dân",
        beats: [
          {
            speaker: "Trịnh Tú",
            text: "Dân theo về vì muốn yên. Kho thóc, đường chợ, bến đò phải sửa trước khi bắt ai đi làm việc lớn.",
            basis: "fictional",
          },
          {
            text: "Kết quả: sổ ghi việc sửa kho thóc và đường chợ quanh Hoa Lư được làm trước.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "law",
        label: "Ưu tiên triều nghi",
        beats: [
          {
            speaker: "Đinh Điền",
            text: "Các vùng đã chung một mối thì cần một lễ và một phép chung. Người nhận lệnh phải biết lệnh từ đâu ra.",
            basis: "fictional",
          },
          {
            text: "Kết quả: sổ ghi việc dọn chỗ làm lễ và bàn phép tắc trong triều được làm trước.",
            basis: "reconstructed",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Hoa Lư sẵn sàng cho lễ lên ngôi. Việc nào làm trước là cách game kể; game không nói nhà Đinh đã chọn ưu tiên nào.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Về hình ảnh Hoa Lư",
        beats: [
          {
            text: "Nhiệm vụ này không dùng tranh kiến trúc. Các công trình thấy ở Hoa Lư ngày nay phần lớn được dựng hoặc tu bổ về sau, không phải cung điện năm 968; nếu sau này thêm hình minh họa thì phải ghi rõ là tái dựng.",
            basis: "reconstructed",
          },
        ],
      },
    ],
  },
  {
    id: "M24",
    prompt: "Trong buổi lễ, bạn đứng nhìn từ đâu?",
    cinematic: [
      {
        text: "Trống đồng nổi ba hồi dưới chân núi đá. Lá cờ lau năm nào giờ được cắm cạnh hàng cờ của các vùng đã theo về.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu là Đại Cồ Việt và định đô ở Hoa Lư.",
        basis: "recorded",
        refs: ["E10", "S04", "S08"],
      },
      {
        text: "Sử không chép chi tiết nghi lễ. Cách xếp hàng quân, người đứng xem và lời nói trong cảnh này là game tái dựng.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "armyView",
        label: "Đứng cùng hàng quân",
        beats: [
          {
            speaker: "Một người lính già",
            text: "Hồi ở Hoa Lư, mấy đứa chăn trâu cầm bông lau làm cờ. Giờ cờ ấy đứng trước cả hàng quân.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "hoaLuView",
        label: "Nhìn từ đồi Hoa Lư",
        beats: [
          {
            speaker: "Một người dân Hoa Lư",
            text: "Từ trên đồi chỉ thấy cờ và khói hương. Người ta bảo từ nay lệnh ra từ đây, không phải từ mười hai nơi nữa.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "dinhLienView",
        label: "Đi cùng Đinh Liễn",
        beats: [
          {
            speaker: "Đinh Liễn",
            text: "Cha đứng đó, nhưng việc giữ cho các vùng yên mới bắt đầu. Con sẽ nhớ hôm nay.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Đại Cồ Việt, kinh đô Hoa Lư, năm 968: đây là mốc kết của chiến dịch.",
        basis: "recorded",
        refs: ["E10", "S04", "S08"],
      },
      {
        text: "Hành trình từ lá cờ lau tới buổi lễ này là cách game kể. Các nhiệm vụ trước không gắn ngày tháng vào năm 968.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Năm 970: niên hiệu Thái Bình",
        beats: [
          {
            text: "Niên hiệu Thái Bình bắt đầu từ năm 970, hai năm sau lễ lên ngôi. Game không đưa niên hiệu này vào cảnh năm 968.",
            basis: "recorded",
            refs: ["E11", "S04", "S08"],
          },
        ],
      },
      {
        title: "Năm 971: đặt quan chức",
        beats: [
          {
            text: "Một số tổng thuật kể việc định phẩm trật quan văn võ của triều Đinh vào khoảng năm 971. Mốc này chưa có trong sổ nguồn của game, nên chỉ ghi ở đây để phân biệt; buổi lễ 968 trong game không có cảnh phong chức.",
            basis: "reconstructed",
          },
        ],
      },
    ],
  },
];
