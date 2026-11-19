// Số viết bằng chữ cho trang giới thiệu và Cẩm nang (văn phong: đếm số lượng viết bằng chữ, docs/00-overview/thuat-ngu.md).

const ONES = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** 0–999 thành chữ tiếng Việt ("mười bốn", "bảy mươi lăm", "một trăm"). */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
  if (n < 10) return ONES[n]!;
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    const head = t === 1 ? "mười" : `${ONES[t]} mươi`;
    if (o === 0) return head;
    const tail = o === 5 ? "lăm" : o === 1 && t > 1 ? "mốt" : o === 4 && t > 1 ? "tư" : ONES[o]!;
    return `${head} ${tail}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return `${ONES[h]} trăm`;
  return `${ONES[h]} trăm ${rest < 10 ? `lẻ ${ONES[rest]}` : numberWords(rest)}`;
}

/** Như `numberWords`, viết hoa chữ đầu (đầu câu, đầu tiêu đề). */
export function NumberWords(n: number): string {
  const w = numberWords(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}
