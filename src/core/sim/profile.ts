// Hồ sơ dùng chung cho các mô phỏng chế độ chơi (sinh tồn, …).

import { autoProgress, DEFAULT_TEAM, newProfile, type Profile } from "../progress";

/** Hồ sơ mô phỏng: nhân vật chính và đội khởi đầu cùng ở một cấp, điểm kỹ năng tiêu đều. */
export function simProfile(level: number): Profile {
  const p = newProfile();
  return {
    ...p,
    main: autoProgress(level, null),
    companions: Object.fromEntries(
      DEFAULT_TEAM.map((id) => [id, autoProgress(level, null)]),
    ),
  };
}
