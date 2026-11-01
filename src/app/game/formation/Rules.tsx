// Bảng luật chơi Trận Đồ (dùng ở màn chế độ và màn chơi).

export default function Rules() {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-snug text-[var(--atlas-ink-on-wood)]/90">
      <li>Mỗi lượt bạn cầm một quân tướng. Chạm ô trống để đặt; ô đó phải sát (trên, dưới, trái, phải) một quân đã có, trừ khi sa bàn đang trống.</li>
      <li>Quân mới phải <b>cùng nghề hoặc cùng hệ</b> với <b>từng</b> quân kề. Có thể cùng nghề với quân này và cùng hệ với quân kia.</li>
      <li>Hàng hoặc cột kín quân (từ 3 ô chơi được trở lên) thì được dọn sạch, nhưng ô vẫn giữ vệt <b>khai thông</b>. Khai thông hết mọi ô chơi được là thắng và hiện cả bản đồ.</li>
      <li><b>Chướng ngại</b> (núi, rừng, đầm lầy, thành lũy) mọc ngẫu nhiên: không đặt quân được, không cần khai thông và không nối được hai quân.</li>
      <li><b>Quân Lệnh</b> đặt ở ô trống bất kỳ và khớp mọi quân kề. <b>Thu Hồi</b> xóa một quân trên bàn.</li>
      <li><b>Bỏ Lệnh</b> đổi sang quân khác nhưng làm ngọn lửa bùng lên; lửa đầy mà còn bỏ nữa là thua. Đặt quân thành công hạ lửa 1 bậc, dọn được hàng hoặc cột thì tắt hết.</li>
    </ul>
  );
}
