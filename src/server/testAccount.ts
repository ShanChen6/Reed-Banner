// Cấp đầy đủ cho một tài khoản thử nghiệm: vàng, mọi tướng đã phát hành ở cấp tối đa, phiếu và lượt mở trong Tầm Tướng Ký.
// Chỉ biến đổi hồ sơ (thuần); việc ghi vào cơ sở dữ liệu nằm ở `scripts/grant-test-account.mts`, có khóa xác nhận.

import {
  EXPANSION_COMPANIONS,
  MAX_LEVEL,
  PLAYABLE_COMPANIONS,
  autoProgress,
  isReleasedCompanion,
  type Profile,
} from "@/core";
import { TTK_MAX_TICKETS, catalogForPack, newTtkAccount } from "@/core/tam-tuong-ky";

export const TEST_ACCOUNT_GOLD = 1_000_000;
export const TEST_ACCOUNT_UNITS = 1_000;

export function grantFullTestProfile(profile: Profile): Profile {
  const companions = { ...profile.companions };
  for (const c of [...PLAYABLE_COMPANIONS, ...EXPANSION_COMPANIONS]) {
    if (isReleasedCompanion(c.id)) companions[c.id] = autoProgress(MAX_LEVEL, null);
  }
  const ttk = profile.tamTuongKy ?? newTtkAccount(catalogForPack(undefined));
  return {
    ...profile,
    main: autoProgress(MAX_LEVEL, profile.profession),
    companions,
    gold: Math.max(profile.gold, TEST_ACCOUNT_GOLD),
    tamTuongKy: { ...ttk, tickets: TTK_MAX_TICKETS, units: Math.max(ttk.units, TEST_ACCOUNT_UNITS), hints: { day: "", used: 0 } },
  };
}
