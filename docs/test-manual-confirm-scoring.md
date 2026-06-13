# Checklist manual E2E: Xác nhận & tính điểm

Checklist kiểm thử thủ công trên môi trường staging/dev Firebase sau khi unit test pass.

**Phạm vi:** Chỉ user đã có dự đoán (không test user thiếu dự đoán).

**Chuẩn bị:** Admin đăng nhập, 3 user test (A, B, C) có prediction trên cùng 1 trận mỗi vòng.

---

## Ma trận nhanh theo vòng

| Vòng | User A (exact + sao*) | User B (đúng KQ) | User C (sai + sao) | Phạt khi không exact |
|------|------------------------|------------------|--------------------|----------------------|
| Vòng bảng | 10 điểm, 0 phạt | 3 điểm, 10k | -3 điểm, 10k | 10k |
| Vòng 32 | 10 điểm, 0 phạt | 3 điểm, 15k | -3 điểm, 15k | 15k |
| Vòng 16 | 10 điểm, 0 phạt | 3 điểm, 20k | -3 điểm, 20k | 20k |
| Tứ kết | 10 điểm, 0 phạt | 3 điểm, 25k | -3 điểm, 25k | 25k |
| Bán kết | 10 điểm, 0 phạt | 3 điểm, 30k | -3 điểm, 30k | 30k |
| Hạng 3 | 10 điểm, 0 phạt | 3 điểm, 35k | -3 điểm, 35k | 35k |
| Chung kết | 10 điểm, 0 phạt (không cần sao) | 6 điểm, 50k | 0 điểm, 50k | 50k |

\* Chung kết: User A exact không sao vẫn 10 điểm (auto ×2).

**Gợi ý tỉ số mẫu (kết quả thực 2-1):**

- User A: dự đoán 2-1 (+ sao nếu vòng cho phép)
- User B: dự đoán 3-1
- User C: dự đoán 1-1 (+ sao)

---

## Checklist theo vòng

Lặp lại block dưới cho từng vòng: `group`, `round32`, `round16`, `quarter`, `semi`, `third`, `final`.

### [ ] Vòng: _______________

**Setup**

- [ ] Tạo/chọn 1 trận thuộc vòng này
- [ ] Nhập dự đoán cho User A, B, C theo ma trận trên
- [ ] Ghi nhận `totalPoints` và `totalPenalty` ban đầu của 3 user

**Admin — Xác nhận & tính điểm**

- [ ] Mở modal "Cập nhật kết quả"
- [ ] Nhập tỉ số thực (vd. 2-1), bấm **Xác nhận & tính điểm**
- [ ] Toast hiện: "Đã cập nhật kết quả & tính điểm"
- [ ] Modal đóng, trận hiển thị `isFinished`

**Verify dữ liệu**

- [ ] User A: delta điểm/phạt khớp ma trận
- [ ] User B: delta điểm/phạt khớp ma trận
- [ ] User C: delta điểm/phạt khớp ma trận
- [ ] Transaction penalty tạo đúng amount cho B, C (A không có nếu exact)
- [ ] `/leaderboard` phản ánh `totalPoints` mới
- [ ] `/penalty` phản ánh `totalPenalty` và nợ mới

**Recalc (sửa kết quả)**

- [ ] Sửa tỉ số trận đã finished (vd. 2-1 → 3-1)
- [ ] Điểm/phạt **không bị cộng đôi** — chỉ phản ánh kết quả mới
- [ ] Transaction penalty cũ bị thay thế (không duplicate)

---

## Checklist UI admin (Nhóm E)

### [ ] E-01 — Submit hợp lệ

- [ ] Bấm "Xác nhận & tính điểm" → toast success, modal đóng, bảng refresh

### [ ] E-02 — Validation tỉ số

- [ ] Nhập số âm hoặc không phải số nguyên → lỗi "Tỉ số phải là số nguyên ≥ 0", không gọi API

### [ ] E-03 — Trận đã finished

- [ ] Banner: "Trận đã kết thúc — cập nhật sẽ tính lại điểm và phạt"

### [ ] E-04 — Public refresh

- [ ] Sau xác nhận, leaderboard/dashboard cập nhật (`fetchUsers`)

### [ ] E-05 — Cảnh báo thiếu dự đoán (< 10)

- [ ] Trận chỉ có vài dự đoán → cảnh báo amber hiện, vẫn tính cho user có prediction

---

## Ghi nhận kết quả

| Vòng | Ngày test | Tester | Pass/Fail | Ghi chú |
|------|-----------|--------|-----------|---------|
| group | | | | |
| round32 | | | | |
| round16 | | | | |
| quarter | | | | |
| semi | | | | |
| third | | | | |
| final | | | | |

---

## Coverage gap (ngoài phạm vi lần này)

- User không có dự đoán: hệ thống hiện **không** tự phạt — cần fix riêng nếu yêu cầu nghiệp vụ thay đổi.
- Admin UI: chưa có automated component test (chỉ manual smoke ở trên).
