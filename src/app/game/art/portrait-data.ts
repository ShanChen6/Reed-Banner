/** Ánh xạ dùng chung cho giao diện và bảng file xem thử trên server. */
const PHOTOS: Readonly<Record<string, string>> = {
  dinhBoLinh: "/art/characters/dinh-bo-linh/portrait.webp",
  nguyenBac: "/art/characters/nguyenBac/portrait.webp",
};

export function portraitUrl(id: string): string | null {
  return PHOTOS[id] ?? null;
}
