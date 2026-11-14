// Mô phỏng dùng cùng luật Nộ riêng như trận thật (`startMatch`): đội nhiều người thì mỗi tướng có Nộ riêng. Đặt biến môi trường
// PER_FIGHTER_RAGE=0 để chạy lại luật cũ (một Nộ của thủ lĩnh) khi cần so sánh cân bằng.

const disabled = (): boolean => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.PER_FIGHTER_RAGE === "0";

export function simRageOption(sides: readonly { readonly fighters: readonly unknown[] }[]): { readonly perFighterRage?: true } {
  return !disabled() && sides.some((s) => s.fighters.length > 1) ? { perFighterRage: true } : {};
}
