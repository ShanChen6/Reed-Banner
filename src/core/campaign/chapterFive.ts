// Khung Chương V "Vòng cung phía đông" (M17–M20): tuyến địa lý song song với Chương IV sau khi Chương III xong
// (freeze mục 2.2). Thứ tự hai tuyến là của game. M17 Siêu Loại và M18 Tiên Du là hai trận đánh dẹp 3vs3 dựa
// trên tổng thuật. M19 Tế Giang là sự kiện không có trận: thế lực Lữ Đường suy dần và vùng theo về (S07, `disputed`).
// M20 Tây Phù Liệt là công thành ba trận: phá lũy, giữ đoàn lương (tình tiết phục vụ gameplay), đối đầu quân.

import type { ChapterContent, MissionCopy } from "./chapterOne";

export const CHAPTER_FIVE: ChapterContent = {
  chapter: 5,
  title: "Vòng cung phía đông",
  question: "Những cứ điểm phía đông có chịu về theo một mối không?",
  missions: ["M17", "M18", "M19", "M20"],
  playable: ["M17", "M18", "M19", "M20"],
  region: {
    name: "Siêu Loại",
    modernRegion: "Bắc Ninh",
    at: [106.05, 21.05],
    note: "Khoanh vùng Siêu Loại để định hướng tuyến đông, không phải ranh giới lịch sử. Thứ tự tuyến tây/đông là của game.",
  },
  legendVsRecord: {
    legend:
      "Chương này chưa dùng truyền thuyết địa phương nào. Chuyện kể ở các làng chưa được đối chiếu nên không đưa vào.",
    record:
      "Toàn thư ghi tên và địa bàn các sứ quân phía đông. Kết cục từng người theo tổng thuật hiện đại; trận, ngày tháng và người chỉ huy không rõ.",
  },
  completeLine:
    "Tuyến phía đông khép lại. Thứ tự các nhiệm vụ là của game, không phải thứ tự trong sử.",
};

export const CHAPTER_FIVE_COPY: readonly MissionCopy[] = [
  {
    id: "M17",
    prompt: "Trước khi vào đất Siêu Loại, ai nói với quân?",
    objective: "Đánh dẹp lực lượng Siêu Loại: hạ Lý Khuê và hai tùy tướng.",
    cinematic: [
      {
        text: "Đồng bằng phẳng lặng, những rặng tre bao quanh các làng như tường thành. Phía xa, giáo của đội quân giữ đất phản ánh nắng chiều.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Lý Khuê xưng là Lý Lãng Công, giữ Siêu Loại. Lời chua ghi Siêu Loại là tên huyện, thuộc Bắc Ninh.",
        basis: "recorded",
        refs: ["S01", "W08"],
      },
      {
        text: "Tổng thuật hiện đại xếp thế lực này vào nhóm bị đánh dẹp.",
        basis: "recorded",
        refs: ["S06", "W08"],
      },
      {
        text: "Ai cầm quân, trận diễn ra thế nào và Lý Khuê chết trận hay về hàng sau đó đều chưa rõ. Sử không cho ngày tháng. Trận dưới đây là cách game tái dựng việc đánh dẹp và kết cục ấy.",
        basis: "disputed",
        refs: ["U07"],
      },
      {
        text: "Đội hình, hai tùy tướng và diễn biến trên bàn cờ do game dựng; chuyện giáp dày hay quân tinh của Siêu Loại không có trong sử.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "strategicBriefing",
        label: "Lưu Cơ bàn thế trận",
        beats: [
          {
            speaker: "Lưu Cơ",
            text: "Đất phẳng, làng nào cũng có lũy tre. Đừng đánh vào chỗ họ mạnh nhất; tách tùy tướng khỏi chủ tướng trước.",
            basis: "fictional",
          },
          {
            text: "Lưu Cơ chỉ góp lời bàn trong cảnh này. Game không gán cho ông việc hạ Lý Khuê.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "rallyTroops",
        label: "Đinh Điền động viên quân",
        beats: [
          {
            speaker: "Đinh Điền",
            text: "Đường về phía đông còn dài. Qua được Siêu Loại thì các làng phía sau không còn phải nghe hai lệnh.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: lực lượng Siêu Loại bị đánh dẹp, như tổng thuật xếp loại.",
        basis: "recorded",
        refs: ["S06", "W08"],
      },
      {
        text: "Trận và kết cục trên bàn cờ là game tái dựng. Game không nói Lý Khuê chết, bị bắt hay rút đi đâu, và không nêu ngày tháng.",
        basis: "disputed",
        refs: ["U07"],
      },
    ],
    defeat: [
      {
        text: "Hàng quân phải lui khỏi các lũy tre. Chỉnh đội hình rồi thử lại; kết cục của Siêu Loại trong game không đổi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Lý Khuê, xưng là Lý Lãng Công, giữ Siêu Loại.” Lời chua: Siêu Loại là tên huyện, thuộc phủ Thuận An, Bắc Ninh.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều chưa rõ",
        beats: [
          {
            text: "Một bản khác (Việt Nam sử lược) ghi tước là Lý Lang Công; game dùng Lý Lãng Công theo Toàn thư. Người chỉ huy trận, ngày tháng và số phận Lý Khuê chưa có chứng cứ trong bộ nguồn của game.",
            basis: "disputed",
            refs: ["U07"],
          },
        ],
      },
    ],
  },
  {
    id: "M18",
    prompt: "Lực lượng Tiên Du đông và đủ lương. Quân Hoa Lư lo việc gì trước?",
    objective:
      "Đánh dẹp lực lượng Tiên Du: hạ Nguyễn Thủ Tiệp và hai tùy tướng trước khi lương cạn.",
    cinematic: [
      {
        text: "Những dãy núi thấp quanh Tiên Du chắn tầm nhìn. Ngoài tiền quân, đoàn xe lương nối đuôi nhau trên con đường hẹp, chậm hơn mọi khi.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Nguyễn Thủ Tiệp xưng là Nguyễn Lệnh Công, giữ Tiên Du. Lời chua ghi Tiên Du là tên huyện, thuộc Bắc Ninh.",
        basis: "recorded",
        refs: ["S01", "W09"],
      },
      {
        text: "Tổng thuật hiện đại xếp thế lực này vào nhóm bị đánh dẹp. Sử không chép trận, ngày tháng hay số phận riêng của Nguyễn Thủ Tiệp.",
        basis: "recorded",
        refs: ["S06", "W09"],
      },
      {
        text: "Đội hình, hai tùy tướng và trình tự trận do game tái dựng.",
        basis: "reconstructed",
        refs: ["U07"],
      },
      {
        text: "Luật trận: đối thủ vào trận đầy lương, bàn cờ ít bánh chưng nhất, nên phe ta phải mang đủ lương. Kho lương đầy là luật game, không suy từ sử hay địa danh.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "civilianRelief",
        label: "Trịnh Tú lo cho dân",
        beats: [
          {
            speaker: "Trịnh Tú",
            text: "Đường lương đi qua làng. Trả đủ cho dân từng thúng gạo thì đường lương mới yên.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "prepareLogistics",
        label: "Chuẩn bị hậu cần",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Đếm lại xe lương, chia quân giữ từng chặng. Đánh lâu thì bên nào còn gạo bên ấy thắng.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: lực lượng Tiên Du bị đánh dẹp, như tổng thuật xếp loại. Game không nói Nguyễn Thủ Tiệp chết, bị bắt hay rút đi đâu.",
        basis: "recorded",
        refs: ["S06", "W09"],
      },
      {
        text: "Trận và sức ép lương là cách game kể việc đánh dẹp ấy; lựa chọn trước trận chỉ đổi lời kể.",
        basis: "reconstructed",
      },
    ],
    defeat: [
      {
        text: "Lương cạn trước khi phá được hàng quân Tiên Du. Mua thêm lương rồi thử lại; kết cục của Tiên Du trong game không đổi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Nguyễn Thủ Tiệp, xưng là Nguyễn Lệnh Công, giữ Tiên Du.” Lời chua: Tiên Du là tên huyện, nay thuộc phủ Từ Sơn, Bắc Ninh.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Tên và tước hiệu",
        beats: [
          {
            text: "Danh hiệu “Vũ Ninh Vương” ở bản Chiến dịch cũ chưa có nguồn trong bộ ledger nên không dùng; game gọi theo Toàn thư là Nguyễn Lệnh Công.",
            basis: "disputed",
            refs: ["W09"],
          },
        ],
      },
    ],
  },
  {
    id: "M19",
    prompt:
      "Các làng ven sông Tế Giang muốn biết họ theo về thì được gì. Ai đến nói chuyện?",
    cinematic: [
      {
        text: "Bến đò vắng hơn mọi năm. Thuyền buôn đã đi đường khác, kho của quân giữ đất không còn ai nộp thóc. Mấy cụ già trong làng ngồi chờ ở đình từ sáng.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Lã Đường xưng là Lã Tá Công, giữ Tế Giang. Lời chua ghi Tế Giang nay là Văn Giang, thuộc Bắc Ninh xưa.",
        basis: "recorded",
        refs: ["S01", "W10"],
      },
      {
        text: "Việt Nam sử lược viết là Lữ Đường, Lữ Tá Công. Game dùng tên Lữ Đường, coi Lã Đường là cách gọi khác.",
        basis: "recorded",
        refs: ["S05", "W10"],
      },
      {
        text: "Một bài tổng thuật hiện đại kể Lữ Đường theo về. Toàn thư không kể kết cục riêng của ông, các nguồn khác nhau về cách thức và thời điểm, và chưa có đoạn sử gốc nào được dẫn. Game không kể trận đánh hay thủy chiến nào ở Tế Giang, và không có cảnh Lữ Đường ra hàng giữa trận.",
        basis: "disputed",
        refs: ["S07", "U06"],
      },
      {
        text: "Cảnh dưới đây do game tái dựng: thế lực Tế Giang suy dần, các làng trong vùng lần lượt theo về.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "leHoanObserves",
        label: "Để Lê Hoàn ngồi nghe",
        beats: [
          {
            speaker: "Lê Hoàn",
            text: "Tôi chỉ ngồi nghe. Người ta nói đường sông nào còn đi được, kho nào còn thóc, là biết vùng này đang nghiêng về đâu.",
            basis: "fictional",
          },
          {
            text: "Lê Hoàn chỉ góp mặt trong cảnh này; game không nói đây là lúc ông theo Đinh Bộ Lĩnh.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "anonymousEnvoy",
        label: "Cử một sứ giả vô danh",
        beats: [
          {
            speaker: "Sứ giả Hoa Lư",
            text: "Không ai bắt các làng phải chọn hôm nay. Chỉ xin mở bến cho thuyền lương đi qua, và không ai bị truy xét chuyện cũ.",
            basis: "fictional",
          },
          {
            text: "Sứ giả là nhân vật vô danh do game sáng tác.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: vùng Tế Giang theo về, theo hướng kể của tổng thuật, độ tin cậy vừa đến thấp. Thế cục sứ quân ghi Lữ Đường quy phục (vùng theo về) một lần; không có trận thắng nào được tính.",
        basis: "disputed",
        refs: ["S07", "W10", "U06"],
      },
      {
        text: "Người đến nói chuyện bạn chọn chỉ đổi cảnh kể, không đổi kết cục hay phần thưởng.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Lã Đường, xưng là Lã Tá Công, giữ Tế Giang.” Lời chua: “Tế Giang, nay là Văn Giang, cũng tên huyện; đều thuộc phủ Thuận An, Bắc Ninh.”",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Mức chắc chắn",
        beats: [
          {
            text: "Tên và đất giữ: chắc (Toàn thư). Việc theo về: vừa đến thấp, chỉ có bài tổng thuật của Báo Ninh Bình, không dẫn trang sử gốc. Cách thức, thời điểm, và chuyện có giao chiến hay không: chưa có chứng cứ.",
            basis: "disputed",
            refs: ["S07", "U06"],
          },
          {
            text: "Game không đồng nhất Lữ Đường với Lã Xử Bình, một nhân vật khác trong các nghiên cứu về thời kỳ này.",
            basis: "disputed",
            refs: ["W10"],
          },
        ],
      },
    ],
  },
  {
    id: "M20",
    prompt:
      "Tây Phù Liệt có lũy giữ đường vào. Phá cổng thẳng, hay buộc quân trong lũy phải ra trận?",
    objective:
      "Công thành Tây Phù Liệt qua ba trận: phá lũy, giữ đoàn lương, rồi hạ Nguyễn Siêu và hai tùy tướng.",
    cinematic: [
      {
        text: "Lũy đất chắn ngang con đường vào Tây Phù Liệt. Phía sau quân Hoa Lư, đoàn xe lương còn cách nửa ngày đường.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Toàn thư chép Nguyễn Siêu xưng là Nguyễn Hữu Công, giữ Tây Phù Liệt. Lời chua ghi Tây Phù Liệt là xã thuộc huyện Thanh Trì, Hà Nội.",
        basis: "recorded",
        refs: ["S01", "W11"],
      },
      {
        text: "Tổng thuật hiện đại xếp thế lực này vào nhóm bị đánh dẹp.",
        basis: "recorded",
        refs: ["S06", "W11"],
      },
      {
        text: "Quân số, số lớp lũy, chuyện lũy lửa, ngày tháng và vị trí của trận này trong chuỗi đánh dẹp đều chưa có chứng cứ. Game không chốt điều nào trong số đó.",
        basis: "disputed",
        refs: ["U07"],
      },
      {
        text: "Ba trận dưới đây là cách game dựng một cuộc công thành: phá lũy, giữ đoàn lương, rồi đối đầu quân giữ thành. Đoàn lương và toán chặn đường là tình tiết phục vụ gameplay, sử không chép.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "breachGate",
        label: "Nguyễn Bặc xin phá cổng",
        beats: [
          {
            speaker: "Nguyễn Bặc",
            text: "Lũy chỉ có một cổng chính. Dồn sức vào đó trước khi đoàn lương tới, đừng để quân trong lũy kịp chia ra chặn đường.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "drawOutForces",
        label: "Đinh Điền buộc địch ra trận",
        beats: [
          {
            speaker: "Đinh Điền",
            text: "Vây lâu thì quân ta ăn hết lương trước. Để lộ đoàn xe một chút, họ sẽ phải ra khỏi lũy mà đánh.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: lực lượng Tây Phù Liệt bị đánh dẹp, như tổng thuật xếp loại. Game không nói Nguyễn Siêu chết, bị bắt hay rút đi đâu, và không nêu ngày tháng.",
        basis: "recorded",
        refs: ["S06", "W11"],
      },
      {
        text: "Ba trận công thành và lựa chọn trước trận là cách game kể; lựa chọn chỉ đổi lời kể, không cho thêm lương hay phần thưởng.",
        basis: "reconstructed",
        refs: ["U07"],
      },
    ],
    defeat: [
      {
        text: "Quân phải lui về chỗ đóng trại. Thử lại đúng phase vừa thua; những phase đã qua vẫn giữ, kết cục của Tây Phù Liệt trong game không đổi.",
        basis: "fictional",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966)",
        beats: [
          {
            text: "“Nguyễn Siêu, xưng là Nguyễn Hữu Công, giữ Tây Phù Liệt.” Lời chua: Tây Phù Liệt, tức xã Tây Phù Liệt thuộc huyện Thanh Trì, tỉnh Hà Nội ngày nay.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều chưa rõ",
        beats: [
          {
            text: "Các con số “hơn vạn quân”, hai lớp lũy hay lũy lửa ở một số bài kể không có trong bộ nguồn của game nên không dùng như dữ kiện. Tước hiệu giữ đúng chữ Toàn thư là Nguyễn Hữu Công.",
            basis: "disputed",
            refs: ["U07", "W11"],
          },
        ],
      },
    ],
  },
];
