// Gọi API của game từ trình duyệt: luôn bỏ qua cache; lỗi mạng hoặc phản hồi không phải JSON trả null để màn tự báo lỗi.
// Client cần mã trạng thái HTTP (Tầm Tướng Ký, Trận Đồ xếp hạng) có hàm riêng trong thư mục của chế độ đó.

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** POST kèm thân JSON (bỏ trống `body` thì gửi không thân). */
export const postJson = <T,>(url: string, body?: unknown) =>
  requestJson<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
