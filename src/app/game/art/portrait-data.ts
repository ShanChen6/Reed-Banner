/** Ánh xạ dùng chung cho giao diện và bảng file xem thử trên server. */
const PHOTOS: Readonly<Record<string, string>> = {
  tranCuong: "/art/characters/tran-cuong/portrait.webp",
  ngoXuongXi: "/art/characters/ngo-xuong-xi/portrait.webp",
  phamBachHo: "/art/characters/pham-bach-ho/portrait.webp",
  tranLam: "/art/characters/tran-lam/portrait.webp",
  dinhLien: "/art/characters/dinh-lien/portrait.webp",
  dinhBoLinh: "/art/characters/dinh-bo-linh/portrait.webp",
  nguyenBac: "/art/characters/nguyenBac/portrait.webp",
  trinhTu: "/art/characters/trinh-tu/portrait.webp",
  luuCo: "/art/characters/luu-co/portrait.webp",
  dinhDien: "/art/characters/dinh-dien/portrait.webp",
  leHoan: "/art/characters/le-hoan/portrait.webp",
  kieuCongHan: "/art/characters/kieu-cong-han/portrait.webp",
  nguyenKhoan: "/art/characters/nguyen-khoan/portrait.webp",
};

export function portraitUrl(id: string): string | null {
  return PHOTOS[id] ?? null;
}
