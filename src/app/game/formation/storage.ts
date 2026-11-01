// Lưu cục bộ của Trận Đồ (chỉ ở trình duyệt, mọi thao tác bọc try/catch vì trình duyệt có thể chặn lưu).

export const SAVE_KEY = "reed-banner:tran-do:save:v1";
export const BEST_KEY = "reed-banner:tran-do:best:v1";
const MAPS_KEY = "reed-banner:tran-do:maps:v1";
const HINTS_KEY = "reed-banner:tran-do:hints:v1";
const TUTORIAL_KEY = "reed-banner:tran-do:tutorial:v1";

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* không lưu được: vẫn chơi được, chỉ không nhớ */
  }
}

export function readBest(): Record<string, number> {
  try {
    const v = JSON.parse(readStorage(BEST_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(v).filter(([, n]) => typeof n === "number" && Number.isFinite(n))) as Record<string, number>;
  } catch {
    return {};
  }
}

/** Bộ sưu tập địa danh đã khai thông (id bản đồ), lưu ở máy: thắng ván chơi thường hoặc ván xếp hạng đều tính. */
export function readCollection(): string[] {
  try {
    const v = JSON.parse(readStorage(MAPS_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 500) : [];
  } catch {
    return [];
  }
}

export function addToCollection(id: string): string[] {
  const cur = readCollection();
  if (cur.includes(id)) return cur;
  const next = [...cur, id];
  writeStorage(MAPS_KEY, JSON.stringify(next));
  return next;
}

/** Gợi ý ô đặt được: null nghĩa là người chơi chưa chọn (mặc định bật ở Hướng dẫn, tắt ở các bậc khác). */
export function readHints(): boolean | null {
  const v = readStorage(HINTS_KEY);
  return v === "on" ? true : v === "off" ? false : null;
}

export const writeHints = (on: boolean) => writeStorage(HINTS_KEY, on ? "on" : "off");

export const tutorialDone = () => readStorage(TUTORIAL_KEY) === "done";
export const markTutorialDone = () => writeStorage(TUTORIAL_KEY, "done");
