"use client";
// Khu tiến trình dưới bàn cờ ở chế độ có lưu: cấp và kỹ năng, trang bị, cửa hàng (offline lưu localStorage,
// online gửi lên server).

import {
  BAG_LIMIT,
  MAIN_ID,
  newProfile,
  type BattleState,
  type Profile,
  type ProfileAction,
  type Element,
  type Profession,
} from "@/core";

import ProgressPanel from "./ProgressPanel";
import GearPanel from "./GearPanel";
import ShopPanel from "./ShopPanel";

import { SceneLink } from "../SceneContext";

export interface ProgressSectionProps {
  readonly changeProfile: (p: Profile) => void;
  /** Hệ và nghề Đinh Bộ Lĩnh đang chọn ở màn chơi thử. */
  readonly element: Element;
  readonly online: boolean;
  readonly profession: Profession;
  readonly profile: Profile;
  readonly profileAction: (a: ProfileAction) => Promise<string | null>;
  readonly started: boolean;
  readonly state: BattleState;
}

export function ProgressSection({
  changeProfile,
  element,
  online,
  profession,
  profile,
  profileAction,
  started,
  state,
}: ProgressSectionProps) {
  return (
    <div
      className={`flex flex-col gap-3 ${started ? "" : "mx-auto w-full max-w-4xl"}`}
    >
      <div className="ui-frame-inset rounded-xl p-3">
        <ShopPanel
          compact={online}
          profile={profile}
          locked={started && state.winner === null}
          onAction={profileAction}
        />
      </div>

      {online ? (
        <p className="ui-frame-inset rounded-xl p-3 text-caption text-on-wood-soft">
          Túi đồ {profile.bag.length}/{BAG_LIMIT} món. Mặc trang bị và nâng kỹ năng ở{" "}
          <SceneLink scene="PROFILE" className="ui-link text-frame-gold underline underline-offset-2">
            Doanh Trại
          </SceneLink>
          , đội sẽ cập nhật ở đây khi quay lại.
        </p>
      ) : (
        <>
          <GearPanel
            noShop={false}
            profile={{ ...profile, element, profession }}
            teamIds={[MAIN_ID, ...profile.team]}
            locked={started && state.winner === null}
            onAction={profileAction}
          />
          <ProgressPanel
            profile={{ ...profile, element }}
            teamIds={[MAIN_ID, ...profile.team]}
            locked={started && state.winner === null}
            storage="lưu trên trình duyệt này"
            onAction={profileAction}
            onReset={() => changeProfile(newProfile())}
          />
        </>
      )}
    </div>
  );
}
