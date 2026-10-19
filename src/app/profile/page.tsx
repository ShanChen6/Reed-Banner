// Trang hồ sơ nhân vật: chân dung, 9 ô trang bị, chỉ số, túi đồ; thêm thẻ Kỹ năng và Đội hình & cửa hàng.
// Dữ liệu là hồ sơ trên server (/api/profile) của người đang chơi, khách cũng có.

import type { Metadata } from "next";
import { currentUser } from "@/server/session";
import ProfileScreen from "./ProfileScreen";

export const metadata: Metadata = {
  title: "Hồ sơ · Cờ Lau",
  description:
    "Hồ sơ nhân vật Cờ Lau: trang bị, chỉ số, túi đồ, kỹ năng và đội hình.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { account } = await currentUser();
  return <ProfileScreen playerName={account?.name ?? null} />;
}
