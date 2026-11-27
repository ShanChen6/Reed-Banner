// Mười tám quẻ thời loạn của Điền Trang Ký. Rút ở ô Quẻ bói, xếp lại theo seed đầu ván rồi rút vòng.

export type OmenEffect =
  | { readonly k: "gain"; readonly amount: number }
  | { readonly k: "lose"; readonly amount: number }
  | { readonly k: "loseRate"; readonly rate: number }
  | { readonly k: "repair"; readonly perLevel: number }
  | { readonly k: "payEach"; readonly amount: number }
  | { readonly k: "collectEach"; readonly amount: number }
  | { readonly k: "goto"; readonly tile: number }
  | { readonly k: "step"; readonly by: number }
  | { readonly k: "nearestFree" }
  | { readonly k: "blessing" }
  | { readonly k: "jail" }
  /** Thiên tai: người rút chọn một nhà của người khác. quake: sập một bậc; storm: phải sửa 1..3 lượt, không thu tô. */
  | { readonly k: "disaster"; readonly kind: "quake" | "storm" }
  | { readonly k: "freeBuild" };

export interface Omen {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly effect: OmenEffect;
}

export const OMENS: readonly Omen[] = [
  { id: "muaChiem", title: "Được mùa lúa chiêm", text: "Đồng chiêm trĩu hạt, nhận 150 quan.", effect: { k: "gain", amount: 150 } },
  { id: "cuopKho", title: "Giặc cướp đốt kho", text: "Kho lương cháy một góc, mất 100 quan.", effect: { k: "lose", amount: 100 } },
  { id: "banThuong", title: "Hoa Lư ban thưởng", text: "Triều đình khen công giữ đất, nhận 200 quan.", effect: { k: "gain", amount: 200 } },
  { id: "veHoaLu", title: "Theo cờ lau về Hoa Lư", text: "Đi thẳng về Kinh thành Hoa Lư, nhận lương vòng.", effect: { k: "goto", tile: 0 } },
  { id: "luDe", title: "Lũ tràn bờ đê", text: "Sửa nhà sau lũ, nộp 20 quan mỗi bậc nhà đang có.", effect: { k: "repair", perLevel: 20 } },
  { id: "noCu", title: "Thương lái trả nợ cũ", text: "Món nợ năm xưa nay được trả, nhận 80 quan.", effect: { k: "gain", amount: 80 } },
  { id: "khaoQuan", title: "Mở tiệc khao quân", text: "Đãi quân các nhà, trả mỗi người 30 quan.", effect: { k: "payEach", amount: 30 } },
  { id: "gopLe", title: "Các làng góp lễ mừng", text: "Láng giềng mang lễ tới mừng, nhận của mỗi người 30 quan.", effect: { k: "collectEach", amount: 30 } },
  { id: "ngoaTram", title: "Ngựa trạm gấp", text: "Có tin khẩn, tiến thêm 3 ô.", effect: { k: "step", by: 3 } },
  { id: "satLo", title: "Đường núi sạt lở", text: "Đường phía trước sạt, lùi lại 3 ô.", effect: { k: "step", by: -3 } },
  { id: "diaLy", title: "Thầy địa lý chỉ đất", text: "Tiến tới ô đất trống gần nhất phía trước.", effect: { k: "nearestFree" } },
  { id: "phucAm", title: "Phúc ấm tổ tiên", text: "Được phúc, lần nộp tô kế tiếp được miễn.", effect: { k: "blessing" } },
  { id: "batGiam", title: "Bị quan bắt giam", text: "Vướng vụ kiện đất, bị giải thẳng vào Lao Ngục.", effect: { k: "jail" } },
  { id: "veBenDo", title: "Gọi đò sông Đáy", text: "Đi tới Bến Sông Đáy.", effect: { k: "goto", tile: 30 } },
  { id: "dungNoc", title: "Thợ làng dựng giúp", text: "Ô thấp nhất của bạn được lên một bậc nhà, không mất tiền.", effect: { k: "freeBuild" } },
  { id: "dongDat", title: "Động đất", text: "Đất rung chuyển. Chọn một ngôi nhà của nhà khác, nhà đó sập một bậc. Trang ấp đứng vững.", effect: { k: "disaster", kind: "quake" } },
  { id: "baoLu", title: "Bão lũ", text: "Bão lũ tràn về. Chọn một ngôi nhà của nhà khác, nhà đó phải sửa 1 tới 3 lượt, không thu tô. Trang ấp đứng vững.", effect: { k: "disaster", kind: "storm" } },
  { id: "thueMuoi", title: "Quan thu thuế muối", text: "Nộp một phần mười tiền mặt.", effect: { k: "loseRate", rate: 0.1 } },
];
