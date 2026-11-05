import { Alert } from "@/components/ui";
import { OrnateFrame } from "@/components/game-ui";
// Khung chung của các phân cảnh LOGIN, REGISTER, ACCOUNT: một khung mức 2 ở giữa màn chơi (thanh trên do màn chơi lo).

import { DongSonBand } from "../art/icons";
import { OnArrival } from "./AuthLinks";

export function AuthCard({ title, oauthError, children }: { title: string; oauthError?: boolean; children: React.ReactNode }) {
  return (
    <main className="demo-bg flex flex-1 items-center justify-center bg-background px-4 py-10 text-on-wood">
      <OrnateFrame level="raised" flush className="w-full max-w-sm">
        <div className="border-b border-frame-line-soft p-6 text-center">
          <h1 className="ui-title-on-wood text-2xl font-bold">{title}</h1>
          <DongSonBand className="mx-auto mt-3 w-32" />
        </div>
        <div className="p-6">
          {oauthError && (
            <OnArrival>
              <Alert className="mb-4">
                Đăng nhập không thành công, bạn thử lại nhé.
              </Alert>
            </OnArrival>
          )}
          {children}
        </div>
      </OrnateFrame>
    </main>
  );
}


export { Divider } from "@/components/ui";
