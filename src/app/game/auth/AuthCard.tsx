import { Alert, Card, CardHeader, CardBody } from "@/components/ui";
// Khung chung của các phân cảnh LOGIN, REGISTER, ACCOUNT: một thẻ ở giữa màn chơi (thanh trên do màn chơi lo).

import { DongSonBand } from "../art/icons";
import { OnArrival } from "./AuthLinks";

export function AuthCard({ title, oauthError, children }: { title: string; oauthError?: boolean; children: React.ReactNode }) {
  return (
    <main className="demo-bg flex flex-1 items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card padding="none" className="w-full max-w-sm">
        <CardHeader className="p-6 text-center">
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          <DongSonBand className="mx-auto mt-3 w-32" />
        </CardHeader>
        <CardBody className="p-6">
          {oauthError && (
            <OnArrival>
              <Alert className="mb-4">
                Đăng nhập không thành công, bạn thử lại nhé.
              </Alert>
            </OnArrival>
          )}
          {children}
        </CardBody>
      </Card>
    </main>
  );
}


export { Divider } from "@/components/ui";
