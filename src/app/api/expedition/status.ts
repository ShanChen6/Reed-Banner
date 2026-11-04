// Mã HTTP cho lỗi Viễn Chinh, dùng chung các route POST.
export function expeditionStatus(result: { readonly ok: boolean; readonly error?: string }): number {
  if (result.ok) return 200;
  if (result.error === "featureDisabled") return 503;
  if (result.error === "conflict" || result.error === "runActive") return 409;
  return 422;
}
