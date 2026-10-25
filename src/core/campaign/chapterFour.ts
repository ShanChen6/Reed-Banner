// Khung Chương IV "Miền tây tự giữ" (M13–M16). M13 Đường Lâm: tuyến quy phục thứ ba, kể như một thỏa thuận
// chính trị (giảng hòa) tái dựng, hoàn thành bằng sự kiện, không có trận. M15 Phong Châu (đất khô) và M16 Hồi Hồ
// (đầm lầy) là hai trận đánh dẹp 3vs3 dựa trên tổng thuật. M14 Tam Đái là nút chuẩn bị không có trận: thế lực
// Nguyễn Khoan tan rã theo tổng thuật S07, game chỉ kể việc giữ trật tự khi người rời cứ điểm.
// Freeze 1.0 đặt M13 ở Chương IV; task CAMP-04.01 gọi đây là "M10" của Chương III, mã freeze được giữ.

import type { ChapterContent, MissionCopy } from "./chapterOne";

export const CHAPTER_FOUR: ChapterContent = {
  chapter: 4,
  title: "Miền tây tự giữ",
  question: "Một lời cam kết có giữ được hòa khí khi chưa ai chắc về sau?",
  missions: ["M13", "M14", "M15", "M16"],
  playable: ["M13", "M14", "M15", "M16"],
  region: {
    name: "Đường Lâm",
    modernRegion: "Sơn Tây, Hà Nội",
    at: [105.38, 21.12],
    note: "Khoanh theo Đường Lâm của chính văn Toàn thư; sử còn chép một thuyết đặt Ngô Nhật Khánh ở Giao Thủy. Thứ tự các tuyến tây/đông là của game.",
  },
  legendVsRecord: {
    legend:
      "Chương này chưa dùng truyền thuyết địa phương nào. Chuyện kể về Đường Lâm ở các làng chưa được đối chiếu nên không đưa vào.",
    record:
      "Toàn thư chép Ngô Nhật Khánh xưng Ngô Lãm Công, giữ Đường Lâm, và có thuyết nói giữ Giao Thủy. Việc quy phục theo tổng thuật hiện đại; điều kiện cụ thể không có trong sử.",
  },
  completeLine:
    "Tuyến miền tây khép lại. Thứ tự các nhiệm vụ là của game, không phải thứ tự trong sử.",
};

export const CHAPTER_FOUR_COPY: readonly MissionCopy[] = [
  {
    id: "M13",
    prompt:
      "Ngô Lãm Công đòi bảo đảm cho vị thế và người theo mình. Lời cam kết được trao thế nào?",
    cinematic: [
      {
        text: "Gió đầu mùa thổi qua những mái nhà đá ong. Trước sân đình, hai bên đặt chén rượu xuống cùng lúc. Không ai nói đến thắng thua; người ta nói đến những gì còn giữ được.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Ngô Nhật Khánh, người trong họ Ngô Quyền, xưng là Ngô Lãm Công, giữ Đường Lâm.",
        basis: "recorded",
        refs: ["S01", "W04"],
      },
      {
        text: "Chính văn Toàn thư ghi thêm một thuyết rằng ông giữ Giao Thủy. Game dùng Đường Lâm và giữ dị thuyết trong ghi chú.",
        basis: "disputed",
        refs: ["U04", "S01"],
      },
      {
        text: "Tổng thuật hiện đại xếp ông vào nhóm quy phục. Sử không ghi điều kiện, thời điểm hay quan hệ về sau như thế nào.",
        basis: "recorded",
        refs: ["S06", "W04"],
      },
      {
        text: "Cuộc giảng hòa dưới đây do game tái dựng. Quy phục ở đây không có nghĩa trung thành vĩnh viễn; quan hệ về sau để ngỏ.",
        basis: "reconstructed",
      },
      {
        speaker: "Ngô Lãm Công",
        text: "Họ Ngô từng giữ cả nước. Nay ta về theo một mối thì người theo ta lấy gì làm chỗ dựa?",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "publicTerms",
        label: "Công bố điều khoản trước hai quân",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Điều gì tôi hứa, quân hai bên cùng nghe. Đất Đường Lâm do người Đường Lâm giữ, không ai bị truy xét chuyện cũ.",
            basis: "fictional",
          },
          {
            speaker: "Ngô Lãm Công",
            text: "Nói trước mặt quân thì khó rút lời. Được.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "privatePledge",
        label: "Trao lời riêng",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Có những điều không cần ai làm chứng ngoài hai ta. Tôi giữ họ Ngô của ông, ông giữ hòa khí cho vùng này.",
            basis: "fictional",
          },
          {
            speaker: "Ngô Lãm Công",
            text: "Lời riêng nặng hơn lời trước quân, nếu người nói là người giữ lời.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: Đường Lâm về theo một mối bằng một thỏa thuận chính trị do game tái dựng. Thế cục sứ quân ghi Ngô Lãm Công quy phục một lần; không có trận thắng nào được tính.",
        basis: "reconstructed",
        refs: ["W04"],
      },
      {
        text: "Cách trao lời bạn chọn chỉ đổi cảnh kể, không đổi kết cục, phần thưởng hay quan hệ về sau.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Ngô Nhật Khánh, xưng là Ngô Lãm Công, giữ Đường Lâm — có thuyết nói là giữ Giao Thủy.” Lời chua: “Ngô Nhật Khánh, người trong họ Ngô Quyền.”",
            basis: "recorded",
            refs: ["S01", "W04"],
          },
        ],
      },
      {
        title: "Tên và tước hiệu",
        beats: [
          {
            text: "Tước ưu tiên là Ngô Lãm Công. Các tên “Ngô Nam công”, “Ngô Nam Chỉ” ở bản Chiến dịch cũ chưa có nguồn trong bộ ledger nên không dùng trong câu chuyện.",
            basis: "disputed",
            refs: ["U04"],
          },
        ],
      },
      {
        title: "Chuyện hôn phối giữa hai nhà",
        beats: [
          {
            text: "Một số bài tổng thuật kể về quan hệ hôn nhân giữa nhà Đinh và gia đình Ngô Nhật Khánh. Bộ nguồn của game chưa kiểm được đoạn sử gốc chép chuyện này (bản Toàn thư trên Wikisource đang dùng dừng ở mục Ngô sứ quân), và nếu có thì thuộc giai đoạn sau năm 968. Vì chưa kiểm chứng, game không kể chi tiết nào về hôn phối.",
            basis: "disputed",
          },
        ],
      },
    ],
  },
  {
    id: "M14",
    prompt: "Người rời Tam Đái đông và rối. Việc gì làm trước?",
    cinematic: [
      {
        text: "Cổng lũy mở từ sáng. Người gánh gồng, người dắt trâu, xen giữa là những toán lính đã cởi giáp. Không ai biết chắc chiều nay mình sẽ ngủ ở đâu.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Nguyễn Khoan xưng là Nguyễn Thái Bình, giữ Tam Đái. Lời chua ghi Tam Đái là tên châu, xưa thuộc Phong Châu.",
        basis: "recorded",
        refs: ["S01", "W05"],
      },
      {
        text: "Một bài tổng thuật hiện đại kể thế lực Nguyễn Khoan tan rã. Toàn thư không kể kết cục riêng của ông, và các nguồn ghi khác nhau về cách cũng như lúc thế lực ấy tan. Game không gán năm, không nói ông tử trận hay bị bắt.",
        basis: "disputed",
        refs: ["S07", "U06"],
      },
      {
        text: "Cứ điểm, dòng người rời đi và việc giữ trật tự dưới đây do game tái dựng. Đây không phải cảnh vây thành hay trận đánh có sử chép.",
        basis: "reconstructed",
      },
      {
        speaker: "Đinh Bộ Lĩnh",
        text: "Không ai ở đây là tù binh. Ai về làng thì có đường về, ai ở lại thì có việc làm.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "protectCivilians",
        label: "Mở đường cho dân trước",
        beats: [
          {
            text: "Quân Hoa Lư dàn hai bên đường, để người già và trẻ nhỏ qua trước. Kho lúa được canh để không ai cướp phá trong lúc rối.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "collectWeapons",
        label: "Thu vũ khí trước",
        beats: [
          {
            text: "Giáo mác được gom về một chỗ, ghi sổ rồi khóa lại. Lính cũ của Tam Đái được nhận phần lương để về làng, không ai bị trói.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: thế lực Tam Đái tan rã theo hướng kể của tổng thuật, độ tin cậy vừa đến thấp. Thế cục sứ quân ghi Nguyễn Khoan tan rã một lần; không có trận thắng nào được tính.",
        basis: "disputed",
        refs: ["S07", "W05", "U06"],
      },
      {
        text: "Việc làm trước bạn chọn chỉ đổi cảnh kể, không đổi kết cục hay phần thưởng.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Nguyễn Khoan, xưng là Nguyễn Thái Bình: giữ Tam Đái.” Lời chua: “Tam Đái: tên châu; nay là phủ Vĩnh Tường, xưa thuộc Phong Châu.”",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Vì sao không có trận",
        beats: [
          {
            text: "Kết cục tan rã chỉ có trong bài tổng thuật của Báo Ninh Bình, không dẫn trang sử gốc. Cách tan, mốc thời gian và số phận Nguyễn Khoan chưa có chứng cứ, nên game không dựng vây đói, kho cạn hay trận nào ở Tam Đái.",
            basis: "disputed",
            refs: ["S07", "U06"],
          },
          {
            text: "“Thái Bình” ở đây là tên xưng của Nguyễn Khoan, không phải niên hiệu Thái Bình năm 970.",
            basis: "recorded",
            refs: ["W05"],
          },
        ],
      },
    ],
  },
  {
    id: "M15",
    prompt: "Trước khi tiến lên Phong Châu, quân Hoa Lư làm gì?",
    objective:
      "Đánh dẹp lực lượng Phong Châu: hạ Kiều Công Hãn và hai tùy tướng trên bàn cờ đất khô.",
    cinematic: [
      {
        text: "Con đường đất đỏ chạy dọc bờ sông, bụi bốc lên sau từng hàng quân. Phía trước, cờ hiệu trên các gò cao đã dựng sẵn.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Kiểu Công Hãn xưng là Kiểu Tam Chế, giữ Phong Châu. Game viết chuẩn hóa là Kiều Công Hãn, Kiều Tam Chế.",
        basis: "recorded",
        refs: ["S01", "W06"],
      },
      {
        text: "Tổng thuật hiện đại xếp thế lực này vào nhóm phải dùng quân sự để dẹp. Sử không chép trận đánh, ngày tháng, người cầm quân hay số phận riêng của Kiều Công Hãn.",
        basis: "recorded",
        refs: ["S06", "W06"],
      },
      {
        text: "Trục tiến quân, đội hình, hai tùy tướng và diễn biến trên bàn cờ do game tái dựng. Thứ tự Phong Châu sau Đường Lâm là của game.",
        basis: "reconstructed",
        refs: ["U07"],
      },
      {
        text: "Bàn cờ đất khô: nhiều kiếm và bánh chưng, ít âm dương. Đây là luật game, không phải sơ đồ một trận có sử chép.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "offerSurrender",
        label: "Gửi lời kêu gọi trước trận",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Đưa thư lên Phong Châu: ai mở đường thì giữ được quân, giữ được làng. Ta chờ đến hết ngày.",
            basis: "fictional",
          },
          {
            text: "Sứ giả trở về không có lời đáp. Cảnh gửi thư do game dựng; sử không chép cuộc thương lượng nào ở Phong Châu.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "advance",
        label: "Tiến quân ngay",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Đường khô, quân còn sức. Đi ngay trước khi họ kịp đắp thêm lũy.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: lực lượng Phong Châu bị đánh dẹp, như tổng thuật xếp loại. Game không nói Kiều Công Hãn chết, bị bắt hay rút đi đâu.",
        basis: "recorded",
        refs: ["S06", "W06"],
      },
      {
        text: "Trận vừa đánh là cách game kể việc đánh dẹp ấy; lựa chọn trước trận chỉ đổi lời kể.",
        basis: "reconstructed",
      },
    ],
    defeat: [
      {
        text: "Hàng quân bị đẩy lùi xuống chân gò. Chỉnh đội hình, bổ sung lương rồi thử lại; kết cục của Phong Châu trong game không đổi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Kiểu Công Hãn, xưng là Kiểu Tam Chế, giữ Phong Châu — nay là huyện Bạch Hạc.” Lời chua dẫn sổ tỉnh Sơn Tây nói còn nền thành cũ của sứ quân ở xã Phù Lập.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều sử không chép",
        beats: [
          {
            text: "Trận đánh, đường rút và người hạ từng sứ quân chưa có đủ chứng cứ. Game không đồng nhất Kiều Công Hãn với Kiều Công Tiễn hay Kiều Tri Hựu.",
            basis: "disputed",
            refs: ["U07"],
          },
        ],
      },
    ],
  },
  {
    id: "M16",
    prompt: "Trước đầm Hồi Hồ, quân Hoa Lư dò đường hay tiến thẳng?",
    objective:
      "Đánh dẹp lực lượng Hồi Hồ: hạ Kiều Thuận và hai tùy tướng trên bàn cờ đầm lầy.",
    cinematic: [
      {
        text: "Nước đầm đục và lặng, lau sậy cao quá đầu người. Mỗi bước chân lún xuống bùn đều chậm hơn bước trước.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Kiểu Thuận xưng là Kiểu Lệnh Công, giữ Hồi Hồ. Game viết chuẩn hóa là Kiều Thuận, Kiều Lệnh Công.",
        basis: "recorded",
        refs: ["S01", "W07"],
      },
      {
        text: "Tổng thuật hiện đại xếp thế lực này vào nhóm bị đánh dẹp. Sử không chép đầm lầy, thành lũy hay diễn biến trận ở Hồi Hồ.",
        basis: "recorded",
        refs: ["S06", "W07"],
      },
      {
        text: "Đội hình, hai tùy tướng và trình tự trận do game tái dựng.",
        basis: "reconstructed",
        refs: ["U07"],
      },
      {
        text: "Bàn cờ đầm lầy: nhiều âm dương, ít kiếm và bánh chưng, nên trận chậm và lương khó bổ sung. Đầm lầy là luật game, không phải mô tả có sử chép.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "scoutWater",
        label: "Trinh sát bờ nước",
        beats: [
          {
            speaker: "Đinh Liễn",
            text: "Con dẫn vài người men theo bờ lau tìm chỗ nước nông. Đi chậm một chút, nhưng không ai sa xuống bùn.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "advance",
        label: "Tiến thẳng qua đầm",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Càng chần chừ thì quân càng mỏi. Vượt đầm ngay khi nước còn thấp.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: lực lượng Hồi Hồ bị đánh dẹp, như tổng thuật xếp loại. Game không nói Kiều Thuận chết, bị bắt hay rút đi đâu.",
        basis: "recorded",
        refs: ["S06", "W07"],
      },
      {
        text: "Trận đầm lầy là cách game kể việc đánh dẹp ấy; lựa chọn trước trận chỉ đổi lời kể.",
        basis: "reconstructed",
      },
    ],
    defeat: [
      {
        text: "Quân sa lầy và phải lui về bờ khô. Bổ sung lương rồi thử lại; kết cục của Hồi Hồ trong game không đổi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Kiểu Thuận, xưng là Kiểu Lệnh Công, giữ Hồi Hồ.” Chính văn ghi nay còn nền thành cũ; lời chua đặt Hồi Hồ ở huyện Cẩm Khê (xưa là Hoa Khê).",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều sử không chép",
        beats: [
          {
            text: "Chi tiết về đầm, thành và lúc kết thúc ở Hồi Hồ chưa có chứng cứ. Game không gộp Kiều Thuận với Kiều Công Hãn.",
            basis: "disputed",
            refs: ["U07"],
          },
        ],
      },
    ],
  },
];
