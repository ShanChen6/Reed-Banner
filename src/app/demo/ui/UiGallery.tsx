"use client";

import { useState } from "react";
import { Button, ChoiceChip, Tabs } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { PLAYABLE_COMPANIONS } from "@/core";
import CompanionPicker from "@/app/game/campaign/CompanionPicker";
import { FrameInset, ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";

const TABS = [
  { value: "heroes", label: "Tướng sĩ" },
  { value: "team", label: "Đội hình" },
  { value: "gear", label: "Kho đồ" },
] as const;
type Tab = (typeof TABS)[number]["value"];
const LEVELS = ["Dễ", "Thường", "Khó", "Trùm"] as const;
const FLOORS = Array.from({ length: 20 }, (_, i) => `Tầng ${i + 1}`);

export default function UiGallery() {
  const [tab, setTab] = useState<Tab>("heroes");
  const [level, setLevel] = useState<string>("Thường");
  const paged = usePagedItems(FLOORS, 6);
  const [team, setTeam] = useState<readonly string[]>([]);
  return (
    <ModeScreen label="Bộ giao diện chung">
      <ModeBanner title="Tháp Thí Luyện" kicker="Leo tháp" art="/art/home/trial.webp"
        description="Banner chế độ: tranh, nhãn nhỏ, một câu mô tả và vài số liệu. Tên chế độ đã có trên header nên mặc định chỉ đọc cho trình đọc màn hình."
        stats={[{ label: "Đã qua", value: "3/20" }, { label: "Đá Cường Hóa", value: 12 }]} />

      <ModeBanner title="Nhật Lệnh" showTitle kicker="Mỗi ngày" art="/art/home/daily.webp"
        description="Biến thể hiện tên chế độ (showTitle), dùng cho màn không có header riêng."
        actions={<Button size="lg">Vào trận</Button>} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrnateFrame level="raised">
          <SectionTitle description="Mỗi màn tối đa một nút chính.">Nút</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <Button>Nút chính</Button>
            <Button variant="secondary">Nút phụ</Button>
            <Button variant="outline">Viền</Button>
            <Button variant="ghost">Nút chữ</Button>
            <Button variant="danger">Xóa</Button>
            <Button disabled>Đang khóa</Button>
          </div>
        </OrnateFrame>

        <OrnateFrame level="raised">
          <SectionTitle description="Chưa chọn là gỗ viền đồng, đang chọn là giấy dó chữ mực.">Lựa chọn</SectionTitle>
          <Tabs label="Doanh Trại" items={TABS} value={tab} onChange={setTab} fullWidth />
          <div className="mt-3 flex flex-wrap gap-2">
            {LEVELS.map((l) => <ChoiceChip key={l} selected={level === l} onClick={() => setLevel(l)}>{l}</ChoiceChip>)}
            <ChoiceChip selected={false} disabled>Ác mộng</ChoiceChip>
          </div>
        </OrnateFrame>

        <OrnateFrame>
          <SectionTitle>Khung mức 1 (panel)</SectionTitle>
          <p className="text-on-wood-soft">Khối nội dung thường: gỗ, viền mảnh, không góc hoa văn.</p>
          <FrameInset className="mt-3 grid grid-cols-3 gap-2 text-center">
            {["Máu 500", "Công 55", "Thủ 10"].map((s) => <div key={s} className="font-bold text-title-on-wood">{s}</div>)}
          </FrameInset>
        </OrnateFrame>

        <OrnateFrame>
          <SectionTitle description="usePagedItems + PageControls: danh sách dài cắt trang thay vì cuộn.">Phân trang</SectionTitle>
          <ul className="grid grid-cols-3 gap-2">
            {paged.pageItems.map((f) => <li key={f} className="ui-frame-inset p-2 text-center">{f}</li>)}
          </ul>
          <PageControls paged={paged} label="Phân trang mẫu" className="mt-2" />
        </OrnateFrame>

        <OrnateFrame className="lg:col-span-2">
          <SectionTitle description="Chọn người đi cùng trước trận Bình Loạn: tìm tên, lọc hệ/nghề/khắc địch, cắt trang.">Chọn người đi cùng</SectionTitle>
          <CompanionPicker
            owned={PLAYABLE_COMPANIONS.map((c) => c.id)}
            team={team}
            marks={["moc", "phong"]}
            labelId="demo-team"
            onToggle={(id) => setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 2 ? [...t, id] : t))}
          />
        </OrnateFrame>

        <OrnateFrame level="raised" paper>
          <h2 className="text-title text-ink">Giấy dó</h2>
          <p className="mt-1 text-ink-soft">Cho nội dung đọc dài: sử ký, luật chơi chi tiết, thoại. Chữ mực trên nền giấy.</p>
        </OrnateFrame>
      </div>

      <OrnateFrame>
        <SectionTitle>Chữ</SectionTitle>
        <p className="text-kicker text-frame-gold">Nhãn nhỏ · text-kicker</p>
        <p className="ui-title-on-wood text-heading">Tiêu đề lớn · text-heading</p>
        <p className="ui-title-on-wood text-title">Tiêu đề khối · text-title (20px)</p>
        <p>Nội dung · 15–16px</p>
        <p className="text-caption text-on-wood-soft">Chữ phụ · text-caption (13px, nhỏ nhất)</p>
      </OrnateFrame>

      <div className="ui-action-bar flex justify-end gap-2">
        <Button variant="secondary">Về Chiến trường</Button>
        <Button size="lg">Vào trận</Button>
      </div>
    </ModeScreen>
  );
}
