// Lời dẫn Chương III "Nhà Ngô rạn vỡ" (M09–M12): tin dữ năm 965, bản đồ không có thứ tự, rồi hai tuyến quy
// phục Đằng Châu (M11) và Bình Kiều (M12). Hai nhiệm vụ quy phục hoàn thành bằng sự kiện hội kiến, không có
// trận hay thanh máu; kết cục ghi vào thế cục sứ quân (factions.ts) một lần, không tính là trận thắng.
// Nguồn theo docs/02-game-modes/campaign/history-sources.md, warlord-matrix.md; locator ở docs/02-game-modes/campaign/chapter-3-sources.md.

import type { ChapterContent, MissionCopy } from "./chapterOne";

export const CHAPTER_THREE: ChapterContent = {
  chapter: 3,
  title: "Nhà Ngô rạn vỡ",
  question:
    "Khi trung tâm cũ không còn giữ được, người ta về theo một mối bằng cách nào?",
  missions: ["M09", "M10", "M11", "M12"],
  playable: ["M09", "M10", "M11", "M12"],
  region: {
    name: "Đằng Châu",
    modernRegion: "Kim Động, Hưng Yên",
    at: [106.08, 20.62],
    note: "Bản đồ khoanh Đằng Châu theo lời chua bản dịch Toàn thư. Bình Kiều không khoanh vì sử ghi “nay không rõ chỗ nào” và các bản tổng thuật đặt ở hai vùng khác nhau.",
  },
  legendVsRecord: {
    legend:
      "Truyện kể chuyện khao quân trước thành Bình Kiều để uy hiếp. Đó là truyền thuyết, game chỉ nhắc trong ghi chú, không kể như sử.",
    record:
      "Toàn thư chép Phạm Phòng Át đem quân về hàng. Với Ngô Xương Xí, các bản tổng thuật hiện đại xếp vào nhóm quy phục nhưng không có tường thuật riêng; cuộc hội đàm trong game là tái dựng.",
  },
  completeLine:
    "Đằng Châu và Bình Kiều về theo một mối qua hội kiến, không có trận nào. Thứ tự các nhiệm vụ là của game, không phải thứ tự trong sử.",
};

export const CHAPTER_THREE_COPY: readonly MissionCopy[] = [
  {
    id: "M09",
    prompt: "Ở Hoa Lư, bạn muốn nghe tin này theo cách nào?",
    intro: [
      {
        text: "Năm 965, Ngô Xương Văn mất trong một trận đánh.",
        basis: "recorded",
        refs: ["E06", "S02"],
      },
      {
        text: "Sử chép trong cùng mục năm ấy rằng Đinh Liễn về lại Hoa Lư.",
        basis: "recorded",
        refs: ["S02"],
      },
      {
        text: "Hoa Lư không gây ra cái chết ấy. Nhiệm vụ này chỉ đặt bối cảnh: khoảng trống quyền lực khiến các vùng tự giữ lấy mình. Phần hệ quả rộng là game tái dựng.",
        basis: "reconstructed",
      },
    ],
    choices: [
      {
        id: "viewTimeline",
        label: "Xem dòng thời gian nhà Ngô",
        beats: [
          {
            text: "939 Ngô Quyền xưng vương, 944 Ngô Quyền mất, 951 Hoa Lư đứng vững, 965 Ngô Xương Văn mất. Năm 950 hay 951 cho việc khôi phục nhà Ngô vẫn còn hai cách ghi.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "fatherSonDialogue",
        label: "Nghe cha con trò chuyện",
        beats: [
          {
            speaker: "Đinh Liễn",
            text: "Kinh thành không còn ai đủ sức giữ các vùng nữa, thưa cha.",
            basis: "fictional",
          },
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Vậy việc của ta không chỉ là giữ Hoa Lư. Phải tìm cách để các vùng thôi đánh nhau.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Bản đồ chuyển sang cục diện sau năm 965. Lựa chọn của bạn chỉ đổi cách kể.",
        basis: "reconstructed",
      },
    ],
  },
  {
    id: "M10",
    prompt: "Lưu Cơ trải bản đồ. Bạn muốn xem tuyến nào trước?",
    intro: [
      {
        text: "Toàn thư liệt kê mười hai sứ quân cùng địa bàn truyền thống trong mục năm 966.",
        basis: "recorded",
        refs: ["E07"],
      },
      {
        text: "Mười hai thế lực có cùng nổi lên một lúc hay không, và có đúng mười hai chiến dịch riêng hay không, vẫn còn tranh luận.",
        basis: "disputed",
        refs: ["U01"],
      },
      {
        text: "Thứ tự các nhiệm vụ sau đây phục vụ cách chơi, không phải thứ tự trong sử. Sử không ghi trình tự, ngày tháng hay cách kết thúc của từng nơi.",
        basis: "reconstructed",
        refs: ["U07"],
      },
      {
        speaker: "Lưu Cơ",
        text: "Mười hai cái tên, mười hai vùng đất. Nếu coi nơi nào cũng là kẻ thù thì ta sẽ chẳng còn ai để cùng giữ dân.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "viewWest",
        label: "Xem tuyến tây trước",
        beats: [
          {
            text: "Lưu Cơ chỉ về Đường Lâm, Tam Đái, Phong Châu, Hồi Hồ. Đây là cách game chia tuyến theo địa lý.",
            basis: "reconstructed",
          },
        ],
      },
      {
        id: "viewEast",
        label: "Xem tuyến đông trước",
        beats: [
          {
            text: "Lưu Cơ chỉ về Siêu Loại, Tiên Du, Tế Giang, Tây Phù Liệt. Đây là cách game chia tuyến theo địa lý.",
            basis: "reconstructed",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Chiến dịch được chia theo tuyến địa lý. Ở bản này các nhiệm vụ vẫn mở lần lượt; tuyến bạn xem trước không đổi gì.",
        basis: "reconstructed",
      },
    ],
  },
  {
    id: "M11",
    prompt:
      "Phạm Phòng Át hỏi: nếu Đằng Châu về theo, người của ông sẽ ra sao?",
    cinematic: [
      {
        text: "Bến sông Đằng Châu lúc sương còn dày. Hai lá cờ đứng cách nhau một bãi cỏ; không ai rút gươm. Giữa bãi, một chiếc chiếu được trải ra cho hai người ngồi.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng Châu.",
        basis: "recorded",
        refs: ["W02", "S01"],
      },
      {
        text: "Đây là một buổi hội kiến, không phải trận đánh. Không có thanh máu; kết cục đã có trong sử và lựa chọn chỉ đổi lời đáp.",
        basis: "fictional",
      },
      {
        text: "Sử không chép đôi bên đã thương thuyết thế nào, cũng không ghi có trận nào trước đó hay không. Điều khoản trong cảnh này do game sáng tác.",
        basis: "fictional",
      },
      {
        speaker: "Phạm Phòng Át",
        text: "Ta giữ Đằng Châu đã lâu. Đem quân đi đánh nhau thêm thì người chết là người của cả hai bên.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "retainForces",
        label: "Cam kết giữ quân cũ",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Quân Đằng Châu vẫn do người Đằng Châu cầm. Ông về theo một mối, không ai phải rời hàng ngũ của mình.",
            basis: "fictional",
          },
          {
            speaker: "Phạm Phòng Át",
            text: "Giữ được người theo ta thì ta không còn gì phải tiếc.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "protectPeople",
        label: "Hứa bảo vệ dân Đằng Châu",
        beats: [
          {
            speaker: "Đinh Bộ Lĩnh",
            text: "Ruộng Đằng Châu cứ cấy, chợ Đằng Châu cứ họp. Không ai đến đây thu lương bằng giáo mác nữa.",
            basis: "fictional",
          },
          {
            speaker: "Phạm Phòng Át",
            text: "Dân yên thì ta yên. Lời ấy ta nhận.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Toàn thư chép: “Phạm Phòng Át đem binh về hàng.” Về sau ông được giữ chức Thân vệ tướng quân.",
        basis: "recorded",
        refs: ["E09", "S01"],
      },
      {
        text: "Kết cục: Đằng Châu quy phục, ghi vào thế cục sứ quân một lần. Không có trận nào được tính, lời đáp bạn chọn không đổi kết cục hay phần thưởng.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Trích Toàn thư (bản dịch, mục 966 và 967)",
        beats: [
          {
            text: "Mục 966: “Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng châu.” Mục 967: “Phạm Phòng Át đem binh về hàng.”",
            basis: "recorded",
            refs: ["S01", "W02", "E09"],
          },
          {
            text: "Lời chua của bản dịch: nay xã Đằng Châu, huyện Kim Động, tỉnh Hưng Yên có đền thờ Phạm sứ quân. Đây là chú giải đời sau, game dùng để khoanh vùng trên bản đồ.",
            basis: "recorded",
            refs: ["S01"],
          },
        ],
      },
      {
        title: "Điều sử không chép",
        beats: [
          {
            text: "Không có ngày, không có điều khoản, không có trận đánh hay quyết đấu nào trước khi về hàng. Bản Chiến dịch cũ bắt thắng ông một trận; cảnh ấy là hư cấu và đã bỏ khỏi câu chuyện chính.",
            basis: "fictional",
          },
        ],
      },
    ],
  },
  {
    id: "M12",
    prompt:
      "Ngô Xương Xí còn mang di sản họ Ngô. Đinh Bộ Lĩnh mở lời bằng cách nào?",
    cinematic: [
      {
        text: "Trong một gian nhà gỗ ngoài thành Bình Kiều, đèn dầu cháy suốt đêm. Một bên là người mang họ Ngô, một bên là người từng giữ Hoa Lư trước quân Ngô. Cả hai đều biết lần này không ai muốn mở cổng bằng máu.",
        basis: "fictional",
      },
    ],
    intro: [
      {
        text: "Ngô Xương Xí là con Thiên Sách Vương Ngô Xương Ngập, giữ Bình Kiều. Sử gọi ông là Ngô sứ quân.",
        basis: "recorded",
        refs: ["W03"],
      },
      {
        text: "Các bản tổng thuật hiện đại xếp ông vào nhóm quy phục, nhưng chính sử không có tường thuật riêng về việc ấy.",
        basis: "recorded",
        refs: ["S06", "W03"],
      },
      {
        text: "Cuộc hội đàm dưới đây do game tái dựng: nơi gặp, lời lẽ và điều kiện đều không có trong sử.",
        basis: "reconstructed",
      },
      {
        text: "Bình Kiều ở đâu vẫn chưa rõ: bản dịch Toàn thư chú “nay không rõ chỗ nào”, các tổng thuật đặt ở hai vùng khác nhau. Game không định vị.",
        basis: "disputed",
        refs: ["U03"],
      },
      {
        speaker: "Ngô Xương Xí",
        text: "Ông muốn ta bỏ cái tên mà ông nội ta để lại sao?",
        basis: "fictional",
      },
      {
        speaker: "Đinh Bộ Lĩnh",
        text: "Không. Tôi muốn cái tên ấy không còn phải giữ bằng giáo mác.",
        basis: "fictional",
      },
    ],
    choices: [
      {
        id: "showStrength",
        label: "Bày quân ngoài thành",
        beats: [
          {
            text: "Quân Hoa Lư dựng trại trong tầm mắt thành Bình Kiều nhưng không tiến thêm. Lời mời hội kiến được gửi kèm danh sách quân số.",
            basis: "fictional",
          },
          {
            speaker: "Ngô Xương Xí",
            text: "Ông cho ta thấy quân để ta khỏi phải đoán. Thôi được, ta nói chuyện.",
            basis: "fictional",
          },
        ],
      },
      {
        id: "privateMeeting",
        label: "Hội kiến kín",
        beats: [
          {
            text: "Đinh Bộ Lĩnh chỉ mang vài người tùy tùng vào gặp. Không có trống, không có cờ.",
            basis: "fictional",
          },
          {
            speaker: "Ngô Xương Xí",
            text: "Đến tay không mà dám nói chuyện một mối. Ta nghe.",
            basis: "fictional",
          },
        ],
      },
    ],
    outro: [
      {
        text: "Kết cục: một thỏa thuận được tái dựng, Bình Kiều quy phục. Không có trận thắng nào được ghi, chỉ có thế cục sứ quân được cập nhật một lần.",
        basis: "reconstructed",
        refs: ["W03"],
      },
      {
        text: "Lời đáp bạn chọn chỉ đổi cảnh kể và ghi chú, không đổi kết cục hay phần thưởng.",
        basis: "reconstructed",
      },
    ],
    sourceNotes: [
      {
        title: "Quy phục theo tổng thuật",
        beats: [
          {
            text: "Bài tổng thuật của Bảo tàng Lịch sử Quốc gia xếp Ngô Xương Xí vào nhóm quy phục. Đó là diễn giải hiện đại, không phải tường thuật chính sử.",
            basis: "recorded",
            refs: ["S06"],
          },
        ],
      },
      {
        title: "Truyền thuyết khao quân",
        beats: [
          {
            text: "Một bài báo địa phương kể chuyện khao quân trước thành để uy hiếp Bình Kiều, và chính bài viết ghi đó là truyền thuyết. Lựa chọn “Bày quân ngoài thành” gợi lại không khí ấy, không phải tái hiện sự kiện.",
            basis: "legend",
            refs: ["S07"],
          },
        ],
      },
      {
        title: "Tên gọi",
        beats: [
          {
            text: "Game gọi ông là Ngô sứ quân như cách gọi của sử. Tước “Kiều công” ở bản Chiến dịch cũ không có trong bộ nguồn và không dùng ở đây.",
            basis: "reconstructed",
            refs: ["W03"],
          },
        ],
      },
    ],
  },
];
