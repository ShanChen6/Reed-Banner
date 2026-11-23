// Tên cổ trang của quân Tam Quân Kỳ. Luật lấy nguyên từ cờ tư lệnh (src/core/tam-quan-ky), chỉ tên và hình là riêng của
// Cờ Lau. Shan chốt 23/11/2026: Không quân đổi thành Thiên mã (ngựa bay) cho hợp việc chở voi. Sở chỉ huy gọi Soái trướng
// để khỏi trùng tên màn Doanh Trại (hồ sơ).

import type { MoveKind, PieceType } from "@/core/tam-quan-ky";

export const PIECE_NAME: Readonly<Record<PieceType, string>> = {
  c: "Chủ tướng",
  h: "Soái trướng",
  i: "Bộ binh",
  m: "Hương binh",
  e: "Phu cầu",
  t: "Voi chiến",
  a: "Máy bắn đá",
  g: "Nỏ thủ",
  s: "Hỏa tiễn",
  f: "Thiên mã",
  n: "Chiến thuyền",
};

export const PIECE_MOVE: Readonly<Record<PieceType, string>> = {
  c: "Đi thẳng theo hàng hoặc cột bao xa cũng được khi đường trống, nhưng chỉ ăn quân ngay sát bên. Không được đứng đối mặt Chủ tướng bên kia trên một đường trống.",
  h: "Đứng yên cả ván. Chủ tướng vào trú được. Bên kia chiếm và giữ đủ ba lượt là thắng.",
  i: "Đi và ăn một ô theo hàng hoặc cột.",
  m: "Dân quen địa hình: đi và ăn một ô theo cả tám hướng.",
  e: "Đi một ô theo hàng hoặc cột. Kết bè chở một Máy bắn đá, Nỏ thủ hoặc Hỏa tiễn qua sông ở bất kỳ đâu.",
  t: "Đi và ăn hai ô theo hàng hoặc cột, không vượt quân cản. Trên bành chở được Chủ tướng, Bộ binh hoặc Hương binh.",
  a: "Đi và bắn ba ô theo cả tám hướng, bắn vượt quân cản, được chọn bắn tại chỗ. Qua sông phải đi thẳng trên cầu tre hoặc được Phu cầu chở.",
  g: "Đi và ăn một ô theo hàng hoặc cột. Các ô sát bên là vùng cấm bay. Qua sông phải đi trên cầu tre.",
  s: "Đi hai ô theo hàng hoặc cột, một ô chéo, bắn từ xa. Vùng cấm bay rộng hai ô thẳng, một ô chéo. Qua sông phải đi trên cầu tre.",
  f: "Bay bốn ô theo cả tám hướng, vượt qua quân cản nhưng không bay qua vùng cấm bay. Lao vào vùng cấm bay để đánh thì mất cả hai. Chở được một Voi chiến và một Chủ tướng, Bộ binh hoặc Hương binh.",
  n: "Chỉ đi trên nước (đầm, bãi lau và bến thuyền), bốn ô theo cả tám hướng. Bắn thuyền xa bốn ô, bắn lên bờ xa ba ô. Chở một Thiên mã và một Chủ tướng, Bộ binh, Hương binh hoặc Voi chiến.",
};

export const KIND_NAME: Readonly<Record<MoveKind, string>> = {
  move: "Tiến quân",
  join: "Lên chung",
  capture: "Tiến vào ăn",
  fire: "Bắn tại chỗ",
  strike: "Lao vào, mất cả hai",
};
