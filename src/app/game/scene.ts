// Các phân cảnh của màn chơi /game và đường dẫn tương ứng. Màn chơi là một trang duy nhất: đổi phân cảnh chỉ
// đổi state `currentScene` rồi cập nhật thanh địa chỉ (history.pushState), không tải lại trang. Đường dẫn
// /game/<slug> vẫn mở thẳng được (tải lại trang, link chia sẻ) và nút Back quay về phân cảnh trước.

export const SCENES = [
  "MENU",
  "PLAYING",
  "PRACTICE",
  "CAMPAIGN",
  "TRIAL",
  "DESTINY",
  "SURVIVAL",
  "DAILY",
  "ARENA",
  "QUESTS",
  "LEADERBOARD",
  "PROFILE",
  "LOGIN",
  "REGISTER",
  "ACCOUNT",
  "FORGOT_PASSWORD",
  "RESET_PASSWORD",
] as const;

export type Scene = (typeof SCENES)[number];

/** Phần đường dẫn sau /game (tiếng Anh, theo quy ước route). MENU là /game. */
export const SCENE_SLUG: Record<Scene, string> = {
  MENU: "",
  PLAYING: "play",
  PRACTICE: "practice",
  CAMPAIGN: "campaign",
  TRIAL: "trial",
  DESTINY: "destiny",
  SURVIVAL: "survival",
  DAILY: "daily",
  ARENA: "arena",
  QUESTS: "quests",
  LEADERBOARD: "leaderboard",
  PROFILE: "profile",
  LOGIN: "login",
  REGISTER: "register",
  ACCOUNT: "account",
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
};

export const SCENE_TITLE: Record<Scene, string> = {
  MENU: "Màn chính",
  PLAYING: "Giao Tranh",
  PRACTICE: "Thao Luyện",
  CAMPAIGN: "Bình Loạn",
  TRIAL: "Tháp Thí Luyện",
  DESTINY: "Tháp Thiên Mệnh",
  SURVIVAL: "Trấn Ải",
  DAILY: "Nhật Lệnh",
  ARENA: "Quần Hùng",
  QUESTS: "Nhiệm vụ",
  LEADERBOARD: "Bảng xếp hạng",
  PROFILE: "Hồ sơ",
  LOGIN: "Đăng nhập",
  REGISTER: "Đăng ký",
  ACCOUNT: "Tài khoản",
  FORGOT_PASSWORD: "Quên mật khẩu",
  RESET_PASSWORD: "Đặt lại mật khẩu",
};

/** Phân cảnh tài khoản: dựng sẵn ở server (cần cookie, cấu hình) rồi truyền vào màn chơi. */
export type AuthScene = Extract<Scene, "LOGIN" | "REGISTER" | "ACCOUNT" | "FORGOT_PASSWORD" | "RESET_PASSWORD">;

export const GAME_PATH = "/game";

/** Phân cảnh theo slug; slug lạ trả về null (trang báo 404). */
export function sceneOfSlug(slug: string | undefined): Scene | null {
  if (!slug) return "MENU";
  return SCENES.find((s) => s !== "MENU" && SCENE_SLUG[s] === slug) ?? null;
}

/** Phân cảnh theo pathname, kể cả khi không nằm dưới /game (trả về null). */
export function sceneOfPath(pathname: string): Scene | null {
  if (pathname !== GAME_PATH && !pathname.startsWith(`${GAME_PATH}/`)) return null;
  const rest = pathname.slice(GAME_PATH.length + 1).replace(/\/+$/, "");
  return rest.includes("/") ? null : sceneOfSlug(rest);
}

/** Đường dẫn của một phân cảnh, kèm tham số (bỏ tham số rỗng). */
export function scenePath(scene: Scene, params: Readonly<Record<string, string | undefined>> = {}): string {
  const slug = SCENE_SLUG[scene];
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const query = q.toString();
  return `${GAME_PATH}${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
}

/**
 * Phân cảnh thực sự hiện ra: khách mở Tài khoản thì sang Đăng nhập, đã đăng nhập mà mở Đăng nhập/Đăng ký
 * thì sang Tài khoản (giống chuyển hướng ở server của các trang cũ).
 */
export function resolveScene(scene: Scene, signedIn: boolean): Scene {
  if (scene === "ACCOUNT" && !signedIn) return "LOGIN";
  if ((scene === "LOGIN" || scene === "REGISTER") && signedIn) return "ACCOUNT";
  return scene;
}
