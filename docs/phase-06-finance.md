# Phase 6 — Finance & Penalty Tracking

**Trạng thái:** Hoàn thành ✅  
**Phụ thuộc:** [Phase 3 — Core Logic](./phase-03-core-logic.md), [Phase 5 — Admin UI](./phase-05-admin-ui.md)  
**Ước lượng:** 2 ngày  
**Milestone:** Admin theo dõi công nợ, ghi nhận thanh toán, lịch sử giao dịch đầy đủ

---

## Mục tiêu

Hoàn thiện module tài chính: trang admin finance, ghi nhận thanh toán, đồng bộ `paidAmount` với transactions, và public penalty page hiển thị minh bạch.

---

## Deliverables

- [x] `/admin/finance` — quản lý quỹ phạt & thanh toán
- [x] Ghi nhận payment → tạo transaction + cập nhật `users.paidAmount`
- [x] Penalty transactions tự tạo từ Phase 3 (verify & display)
- [x] Public `/penalty` sync với admin data
- [x] Export CSV lịch sử giao dịch (optional)

---

## Data model recap

### User financial fields

```ts
{
  totalPenalty: number   // Tích lũy từ penalty transactions
  paidAmount: number     // Tích lũy từ payment transactions
}
// Balance (nợ) = totalPenalty - paidAmount
```

### Transaction

```ts
{
  id: string
  userId: string
  amount: number         // Luôn positive
  type: "penalty" | "payment"
  note: string           // e.g. "Group: Brazil vs Serbia" hoặc "Chuyển khoản tháng 6"
  matchId?: string       // penalty only
  createdAt: Timestamp
}
```

---

## Admin Finance Page (`/admin/finance`)

### Layout sections

**1. Summary bar (top)**

| Metric | Formula |
| ------ | ------- |
| Tổng phạt | `Σ users.totalPenalty` |
| Đã thu | `Σ users.paidAmount` |
| Còn nợ | Tổng phạt − Đã thu |

**2. Member balances table**

| Member | Phạt | Đã trả | Nợ | Actions |
| ------ | ---- | ------ | -- | ------- |
| Hoa Le | 50,000 | 30,000 | 20,000 | [Ghi nhận TT] [Lịch sử] |

- Sort default: nợ DESC (highest debt first)
- Highlight highest debt row

**3. Ghi nhận thanh toán (modal)**

Fields:
- Member (pre-selected hoặc dropdown)
- Số tiền (VND, > 0)
- Ghi chú (optional): "CK Vietcombank 13/06"
- Ngày (default: now)

**On submit:**

```ts
async function recordPayment(userId: string, amount: number, note: string) {
  await transactionsService.create({
    userId,
    amount,
    type: "payment",
    note,
  })
  await usersService.incrementPaidAmount(userId, amount)
}
```

**4. Transaction log (bottom)**

Filter: All | Penalty | Payment | By member  
Pagination: 20/page

| Ngày | Member | Loại | Số tiền | Ghi chú |
| ---- | ------ | ---- | ------- | ------- |
| ... | ... | penalty | 10,000 | Group: A vs B |

---

## Penalty auto-creation (Phase 3 integration)

Khi `scoring.service.recalculateMatch()`:

```ts
if (penaltyAmount > 0) {
  await transactionsService.create({
    userId,
    amount: penaltyAmount,
    type: "penalty",
    note: `${stage}: ${homeTeam} vs ${awayTeam}`,
    matchId,
  })
  await usersService.incrementTotalPenalty(userId, penaltyAmount)
}
```

**Idempotency on recalc:**
1. Query existing penalty transactions where `matchId == X && userId == Y`
2. Nếu có → skip hoặc delete & recreate (document strategy in Phase 3)

---

## Public Penalty page enhancements

Đồng bộ với Phase 4, bổ sung:

- **Transparency:** Link "Xem chi tiết phạt" → modal list penalty transactions per member
- **Payment status badge:** "Đã xong" nếu balance = 0; "Dư X ₫" nếu overpaid
- **Progress bar:** paidAmount / totalPenalty per member

---

## Business rules

| Rule | Detail |
| ---- | ------ |
| Payment vượt nợ | Cảnh báo + **xác nhận 2 bước**; vẫn ghi full amount (trả trước / làm tròn) |
| Hiển thị dư | Per member: `credit = max(0, paidAmount - totalPenalty)`; summary **Tổng nợ** = cộng nợ từng người (không trừ dư); **Dư trả trước** = cộng dư từng người đóng dư |
| Bù trừ tự động | Khi phạt mới, balance tăng → credit giảm dần (scoring không đổi) |
| Sửa/xóa transaction? | MVP: không cho sửa; admin tạo payment bù trừ với note |
| Manual penalty adjustment? | Optional admin action "Điều chỉnh phạt" ngoài auto — Phase 6+ nếu cần |
| Currency format | `Intl.NumberFormat('vi-VN')` → `10.000 ₫` |

---

## Service methods

```ts
// transactions.service.ts
create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string>
getByUser(userId: string, limit?: number): Promise<Transaction[]>
getAll(filters?: { type?, userId? }): Promise<Transaction[]>
deleteByMatchId(matchId: string): Promise<void>  // for recalc idempotency

// users.service.ts
incrementTotalPenalty(userId: string, amount: number): Promise<void>
incrementPaidAmount(userId: string, amount: number): Promise<void>
getFinancialSummary(): Promise<{ totalPenalty, totalPaid, totalDebt }>
```

---

## Optional: Export CSV

Button "Xuất CSV" trên transaction log:

```csv
Date,Member,Type,Amount,Note
2026-06-15,Hoa Le,penalty,10000,"group: Brazil vs Serbia"
```

Client-side generate từ fetched data — không cần backend.

---

## Task checklist

- [x] Admin finance page layout
- [x] Member balance table với sort & highlight
- [x] Payment modal + validation
- [x] Transaction log với filters
- [x] Verify penalty auto-create từ scoring
- [x] Public penalty page transaction detail modal
- [x] Currency formatting vi-VN
- [ ] Manual test: full flow penalty → payment → balance = 0

---

## Definition of Done

1. Payment ghi nhận đúng → `paidAmount` và transaction tạo
2. Penalty từ scoring hiển thị trong transaction log
3. Public penalty page khớp số liệu admin
4. Highest debt highlighted cả admin và public
5. Không duplicate penalty trên recalc (idempotent)

---

## Phase tiếp theo

→ [Phase 7 — Seed Data, Deploy & QA](./phase-07-deploy-qa.md)
