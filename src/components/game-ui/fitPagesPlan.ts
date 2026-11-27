// Chia các khối nội dung thành trang vừa một khung cao cố định (FitPages). Hàm thuần, có test.

/** Vị trí một khối khi xếp liền mạch tất cả (px, tính từ đỉnh lớp đo). */
export interface FitBox {
  readonly top: number;
  readonly bottom: number;
  /** Khối nằm trong một nhóm (khung có tiêu đề) thì: đỉnh nhóm, khoảng từ đỉnh nhóm tới khối đầu, từ khối cuối tới đáy nhóm. */
  readonly groupTop: number;
  readonly headPad: number;
  readonly tailPad: number;
  /** Khối đầu tiên của nhóm (khối lẻ không nhóm luôn là đầu). */
  readonly first: boolean;
}

/**
 * Chỉ số khối mở đầu mỗi trang. Trang bắt đầu giữa nhóm thì vẫn tính lại phần đầu nhóm (tiêu đề lặp lại "tiếp").
 * Khối cao hơn một trang thì đứng riêng một trang. Không khối nào thì một trang rỗng.
 */
export function planPages(boxes: readonly FitBox[], pageHeight: number): number[] {
  const starts: number[] = [];
  let i = 0;
  while (i < boxes.length) {
    starts.push(i);
    const head = boxes[i]!;
    const from = head.first ? head.groupTop : head.top - head.headPad;
    let k = i;
    while (k + 1 < boxes.length) {
      const next = boxes[k + 1]!;
      if (next.bottom + next.tailPad - from > pageHeight) break;
      k++;
    }
    i = k + 1;
  }
  return starts.length ? starts : [0];
}
