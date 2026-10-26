// Chữ có chân cho màn Sử ký (MAP-01): Noto Serif đủ dấu tiếng Việt, chỉ gắn vào khung .campaign-atlas.
import { Noto_Serif } from "next/font/google";

export const atlasSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  variable: "--font-atlas",
  display: "swap",
});
