// Ba phương án thiết kế khối liên hệ ở footer theo chủ đề phong kiến (đang so sánh, Shan chọn một rồi xóa hai phương án còn lại).
// Chọn bằng ?contact=a|b|c trên địa chỉ màn game; mặc định là phương án A (giá cờ lau).

export const CONTACT_VARIANTS = ["flags", "scroll", "tablets"] as const;
export type ContactVariant = (typeof CONTACT_VARIANTS)[number];

export const DEFAULT_CONTACT_VARIANT: ContactVariant = "flags";

const ALIAS: Readonly<Record<string, ContactVariant>> = { a: "flags", b: "scroll", c: "tablets", flags: "flags", scroll: "scroll", tablets: "tablets" };

/** Đọc giá trị `contact` (a/b/c hoặc tên đầy đủ, không phân biệt hoa thường); sai hoặc thiếu thì dùng mặc định. */
export function parseContactVariant(value: string | null | undefined): ContactVariant {
  return ALIAS[(value ?? "").trim().toLowerCase()] ?? DEFAULT_CONTACT_VARIANT;
}
