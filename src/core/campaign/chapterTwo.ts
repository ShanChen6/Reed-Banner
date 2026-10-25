// Lời dẫn Chương II (M05–M08): hành trình ra Bố Hải, hội kiến Trần Minh Công, trận giữ cửa biển hư cấu và
// việc nhận quân sau khi Trần Minh Công mất. Quan hệ được kể là nương nhờ
// rồi được giao cầm quân (E08), không phải chinh phục: không có trận, thanh máu hay "thắng để được nhận".
// Tuyến đường và lời thoại đều do game dựng; trích Toàn thư theo bản dịch S01, mục năm Đinh Mão 967.

import type { ChapterContent, MissionCopy } from "./chapterOne";

export const CHAPTER_TWO: ChapterContent = {
  chapter: 2,
  title: "Nghĩa tình Bố Hải",
  question: "Người đến nương nhờ và người nhận lời giữ nghĩa với nhau thế nào?",
  missions: ["M05", "M06", "M07", "M08"],
  playable: ["M05", "M06", "M07", "M08"],
  region: {
    name: "Bố Hải Khẩu",
    modernRegion: "Kỳ Bố",
    at: [106.35, 20.4],
    note: "Định vị theo lời chua trong bản dịch Toàn thư (xã Kỳ Bố, phủ Kiến Xương xưa); khoanh vùng để định hướng, không phải ranh giới lịch sử.",
  },
  legendVsRecord: {
    legend:
      "Truyện kể dân gian và thần tích ở địa phương có thể kể khác về cuộc gặp. Game chưa đối chiếu các bản ấy nên không kể chi tiết nào trong đó như sử.",
    record:
      "Toàn thư chép Đinh Bộ Lĩnh cùng con là Liễn sang nương tựa Trần Minh Công, được nhận nuôi và giao cho cầm quân. Sử không ghi rõ chuyện bắt đầu vào năm nào.",
  },
  completeLine:
    "Quân Bố Hải nhận Đinh Bộ Lĩnh làm người cầm quân. Suốt chương, Trần Minh Công là đồng minh, không có trận nào giữa hai người.",
};

const TOAN_THU_967 = ["E08", "S01"] as const;

export const CHAPTER_TWO_COPY: readonly MissionCopy[] = [
  {
    id: "M05",
    prompt: "Trịnh Tú hỏi nên đi lối nào ra cửa biển?",
    intro: [
      {
        text: "Sử chép Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng con là Đinh Liễn sang nương tựa.",
        basis: "recorded",
        refs: [...TOAN_THU_967],
      },
      {
        text: "Toàn thư đặt chuyện này trong mục năm 967, nhưng lời bàn kèm theo nói sử cũ không rõ ngày tháng nên chép gộp. Game không khóa năm khởi hành.",
        basis: "disputed",
        refs: ["U02", "S01"],
      },
      {
        text: "Đoàn người, lối đi và những ngày trên đường dưới đây do game dựng lại. Sử không ghi tuyến đường từ Hoa Lư ra Bố Hải.",
        basis: "reconstructed",
      },
      {
        speaker: "Đinh Liễn",
        text: "Cha bảo đi để tìm người cùng giữ đất, không phải để bỏ Hoa Lư. Con nhớ lời ấy.",
        basis: "fictional",
      },
      {
        speaker: "Đinh Bộ Lĩnh",
        text: "Đứng một mình thì Hoa Lư chỉ giữ được Hoa Lư. Ta đến Bố Hải để xin nương nhờ, và để góp sức.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "riverRoute",
        label: "Trịnh Tú dẫn đường sông",
        beats: [
          {
            speaker: "Trịnh Tú",
            text: "Xuôi thuyền theo các nhánh sông về phía biển, người đỡ mỏi, lương đỡ nặng. Chỉ cần đi thận trọng khi nước lên.",
            basis: "fictional",
          },
          {
            text: "Cảnh thuyền xuôi dòng là cách game kể hành trình; sử không chép đoàn đi đường thủy hay đường bộ.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "landRoute",
        label: "Trịnh Tú dẫn đường bộ",
        beats: [
          {
            speaker: "Trịnh Tú",
            text: "Đi bộ qua các làng ven đê thì chậm hơn, nhưng gặp được người, nghe được tin tức dọc đường.",
            basis: "fictional",
          },
          {
            text: "Cảnh đi dọc đê là cách game kể hành trình; sử không chép đoàn đi đường thủy hay đường bộ.",
            basis: "reconstructed",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Đoàn tới vùng cửa biển Bố Hải, nơi Trần Minh Công đóng giữ. Lối đi bạn chọn chỉ đổi cảnh kể; điểm đến như nhau.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Vị trí Bố Hải Khẩu",
        beats: [
          {
            text: "Toàn thư chép Trần Lãm xưng là Trần Minh Công, giữ cửa biển Bố Hải. Lời chua trong bản dịch đặt nơi đóng quân ở xã Kỳ Bố, huyện Vũ Tiên, phủ Kiến Xương theo sổ tỉnh Nam Định xưa.",
            basis: "recorded",
            refs: ["S01"],
          },
          {
            text: "Lời chua là lớp chú giải đời sau, không phải chính văn. Game dùng nó để khoanh vùng trên bản đồ, không đo đạc ranh giới.",
            basis: "reconstructed",
          },
        ],
      },
    ],
  },
  {
    id: "M06",
    prompt:
      "Trần Minh Công hỏi vì sao ông tìm đến Bố Hải. Đinh Bộ Lĩnh đáp thế nào?",
    intro: [
      {
        text: "Trần Lãm, hiệu Trần Minh Công, giữ cửa biển Bố Hải. Sử xếp ông trong số mười hai sứ quân; ở đây ông là chủ nhà, người nhận lời hay không là quyền của ông.",
        basis: "recorded",
        refs: ["W01", "S01"],
      },
      {
        text: "Đây là một buổi hội kiến, không phải một trận đánh. Không có thanh máu, không có đấu thử: Trần Minh Công cân nhắc con người và lời cam kết.",
        basis: "fictional",
      },
      {
        speaker: "Trần Minh Công",
        text: "Ta cần người biết giữ lời. Ngươi cần một nơi để gom sức. Ta nghĩ đôi bên nên nói chuyện.",
        basis: "fictional",
      },
      {
        speaker: "Đinh Bộ Lĩnh",
        text: "Thưa Minh Công, Hoa Lư đã tự giữ được mình một lần, nhưng không giữ được mãi. Tôi đến xin nương nhờ, và xin được gánh việc ông giao.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "protectPeople",
        label: "“Để giữ dân”",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Quân tôi gom về không để cướp đất ai. Làng nào theo cờ thì làng ấy phải được yên mà cấy gặt.",
            basis: "fictional",
          },
          {
            speaker: "Trần Minh Công",
            text: "Người nói đến dân trước khi nói đến quân. Điều ấy ta nghe được.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "keepWord",
        label: "“Để giữ lời”",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Tôi không hứa điều mình không làm nổi. Việc ông giao, tôi làm đến cùng; điều tôi đã hứa với người dưới trướng, tôi cũng giữ.",
            basis: "fictional",
          },
          {
            speaker: "Trần Minh Công",
            text: "Lời ít mà nặng. Ở đất này, người giữ được lời quý hơn người giỏi gươm.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "unify",
        label: "“Để cùng về một mối”",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Mỗi nơi tự giữ thì mỗi nơi đều yếu. Nếu ông cho phép, tôi muốn góp sức để các vùng bớt đánh nhau.",
            basis: "fictional",
          },
          {
            speaker: "Trần Minh Công",
            text: "Chí lớn đấy. Bắt đầu từ Bố Hải đã, rồi xem người đi được bao xa.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Toàn thư chép Trần Minh Công thấy Bộ Lĩnh mặt mũi khôi ngô, lại có độ lượng, bèn nhận nuôi làm con, rồi giao cho cầm quân.",
        basis: "recorded",
        refs: [...TOAN_THU_967],
      },
      {
        text: "Kết quả nhiệm vụ: Bố Hải và Hoa Lư thành liên minh, Đinh Bộ Lĩnh được giao trách nhiệm quân sự. Lời đáp bạn chọn chỉ đổi lời kể; kết quả và phần thưởng như nhau.",
        basis: "reconstructed",
      },
      {
        text: "Sử không ghi rõ việc nhận nuôi và giao quân xảy ra vào năm nào, cũng không chép lời hai người nói với nhau.",
        basis: "disputed",
        refs: ["U02"],
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục năm Đinh Mão 967)",
        beats: [
          {
            text: "“Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.”",
            basis: "recorded",
            refs: [...TOAN_THU_967],
          },
          {
            text: "“Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…”",
            basis: "recorded",
            refs: [...TOAN_THU_967],
          },
          {
            text: "Đây là bản dịch tiếng Việt do Wikisource lưu, không phải nguyên văn Hán. Sử biên soạn muộn, không phải biên bản tại chỗ.",
            basis: "reconstructed",
          },
        ],
      },
      {
        title: "Lời bàn về ngày tháng",
        beats: [
          {
            text: "Phụ chú của bản sử cho rằng Trần Minh Công dấy binh từ trước khi Ngô Xương Văn lấy lại nước; sử cũ không rõ ngày tháng nên chép tóm tắt cả vào mục 967.",
            basis: "disputed",
            refs: ["U02", "S01"],
          },
        ],
      },
      {
        title: "Truyền thuyết địa phương",
        beats: [
          {
            text: "Truyện kể, thần tích và lễ hội ở các làng có thể kể khác về cuộc gặp và việc giao quân. Bộ nguồn của game chưa đối chiếu thần tích hay văn bia địa phương, nên không đưa chi tiết nào trong đó vào lời kể như sử chép.",
            basis: "legend",
          },
          {
            text: "Cảnh “thử tài” ở bản Chiến dịch cũ là hư cấu của game, đã bỏ khỏi câu chuyện chính. Trần Lãm là đồng minh nên không có trận Đánh trùm với ông.",
            basis: "fictional",
          },
        ],
      },
    ],
  },
  {
    id: "M07",
    prompt: "Trước khi toán cướp vào cửa sông, ai giữ phía nào?",
    objective:
      "Đẩy lui toán cướp: hạ cả ba đối thủ để giữ bến và các làng ven cửa biển.",
    intro: [
      {
        text: "Một toán cướp ghép từ nhiều nhóm vô danh men theo bờ biển, nhắm vào bến thuyền và kho lương của các làng ven cửa sông.",
        basis: "fictional",
      },
      {
        text: "Trận này do game sáng tác để kể việc hai lực lượng học cách phối hợp. Sử không chép trận nào như vậy, và toán cướp không mang tên thế lực có thật.",
        basis: "fictional",
      },
      {
        text: "Bàn cờ dựng theo địa hình cửa sông: nhiều ô âm dương, ít ô bánh chưng, nên lương khó bổ sung hơn trận thường. Lương còn lại sau trận được mang sang nhiệm vụ sau.",
        basis: "reconstructed",
      },
      {
        speaker: "Trần Minh Công",
        text: "Quân Bố Hải thuộc nước, quân Hoa Lư thuộc núi. Hôm nay ta cần cả hai cùng một nhịp.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "leadVanguard",
        label: "Đinh Điền dẫn tiền quân",
        beats: [
          {
            speaker: "Đinh Điền",
            text: "Tôi đưa quân Hoa Lư ra chặn mũi thuyền đầu. Người Bố Hải thuộc luồng lạch, xin giữ hai bên bờ.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "holdRearguard",
        label: "Tướng Bố Hải giữ hậu quân",
        beats: [
          {
            speaker: "Một tướng Bố Hải",
            text: "Kho lương và bến thuyền để quân tôi giữ. Các anh cứ đánh phía trước, sau lưng không hở.",
            basis: "fictional",
          },
          {
            text: "Viên tướng này là nhân vật vô danh do game sáng tác.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Toán cướp rút khỏi cửa sông. Quân hai nơi đứng chung dưới một cờ hiệu, lần đầu đánh cùng một nhịp.",
        basis: "fictional",
      },
      {
        text: "Đây là cảnh game dựng để minh họa quan hệ liên minh mà sử có chép, không phải một trận có ghi chép.",
        basis: "reconstructed",
        refs: ["E08"],
      },
    ],
    defeat: [
      {
        text: "Phòng tuyến ven sông vỡ một đoạn, nhưng dân các làng đã kịp lui vào trong. Chỉnh đội hình, bổ sung lương rồi thử lại.",
        basis: "fictional",
      },
    ],
  },
  {
    id: "M08",
    prompt: "Trước hàng quân Bố Hải, Đinh Bộ Lĩnh làm gì?",
    intro: [
      {
        text: "Trần Minh Công mất. Sử không ghi ông mất năm nào, mất ra sao, cũng không chép lời trăng trối nào. Game không gán ngày hay lời cho ông.",
        basis: "disputed",
        refs: ["U02", "S01"],
      },
      {
        text: "Lời bàn kèm bản Toàn thư tóm lại sử cũ: Bộ Lĩnh đến nương tựa Trần Minh Công, và sau khi Minh Công mất thì coi thay đám quân ấy.",
        basis: "recorded",
        refs: [...TOAN_THU_967],
      },
      {
        text: "Cảnh tưởng niệm và nhận quân dưới đây do game dựng lại; nghi lễ cụ thể không có trong sử.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "silentMemorial",
        label: "Tưởng niệm trong im lặng",
        beats: [
          {
            text: "Đinh Bộ Lĩnh đứng lặng trước nơi thờ Trần Minh Công rất lâu rồi mới quay ra hàng quân. Không ai nói gì, nhưng cũng không ai rời hàng.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "addressTroops",
        label: "Hứa trước hàng quân",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Minh Công đã tin mà giao quân cho ta. Ai muốn về làng thì cứ về; ai ở lại, ta giữ các người như ông đã giữ.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Quân Bố Hải nhận Đinh Bộ Lĩnh làm người cầm quân. Uy tín của ông từ đây không chỉ ở Hoa Lư mà ở cả vùng cửa biển.",
        basis: "reconstructed",
        refs: ["E08"],
      },
      {
        text: "Mở khóa đồng hành và mở Tập dượt với Trần Lãm là phần thưởng của game, không phải mốc lịch sử về việc ai gia nhập lúc nào.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Nguồn cho việc nhận quân",
        beats: [
          {
            text: "Chính văn Toàn thư mục 967 kể việc giao cầm quân khi Minh Công còn sống (“Nhân giao cho cầm quân…”); phụ chú tóm sử cũ: “Minh-Công mất rồi mới coi thay đám quân ấy.”",
            basis: "recorded",
            refs: [...TOAN_THU_967],
          },
          {
            text: "Phụ chú cũng nói sử cũ không rõ ngày tháng nên chép gộp vào mục 967. Vì vậy game không đặt năm mất hay năm chuyển giao.",
            basis: "disputed",
            refs: ["U02", "S01"],
          },
        ],
      },
    ],
  },
];
