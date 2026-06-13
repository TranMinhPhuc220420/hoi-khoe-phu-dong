# Phase 4 — Public UI (Read-only)

**Trạng thái:** Hoàn thành  
**Phụ thuộc:** [Phase 2 — Database & Auth](./phase-02-database-auth.md), [Phase 3 — Core Logic](./phase-03-core-logic.md) (cho leaderboard có data thật)  
**Ước lượng:** 2–3 ngày  
**Milestone:** Người dùng không đăng nhập xem được lịch thi đấu, dự đoán, bảng xếp hạng, quỹ phạt

---

## Mục tiêu

Xây dựng 4 trang công khai với giao diện sạch, responsive, table-heavy. Không yêu cầu authentication — chỉ đọc Firestore.

---

## Deliverables

- [ ] `/` — Public Dashboard
- [ ] `/matches` — Lịch thi đấu & dự đoán
- [ ] `/leaderboard` — Bảng xếp hạng
- [ ] `/penalty` — Quỹ phạt & công nợ
- [ ] `PublicLayout` hoàn chỉnh
- [ ] Real-time hoặc polling refresh (optional)
- [ ] Highlight top scorer & highest debt

---

## Route map

| Route | Page | Data sources |
| ----- | ---- | ------------ |
| `/` | Dashboard | matches (upcoming), users (top 3), penalty summary |
| `/matches` | Matches | matches, predictions |
| `/leaderboard` | Leaderboard | users sorted by totalPoints |
| `/penalty` | Penalty | users, transactions |

---

## Page specifications

### 4.1 Dashboard (`/`)

**Sections:**

1. **Hero / Stats row**
   - Tổng số trận đã kết thúc / tổng trận
   - Top scorer (tên + điểm) — badge highlight vàng
   - Highest debt (tên + số tiền nợ) — badge highlight đỏ

2. **Upcoming matches** (3–5 trận sắp tới)
   - Home vs Away, thời gian, stage badge
   - Link "Xem tất cả" → `/matches`

3. **Mini leaderboard** (top 5)
   - Rank, Name, Points
   - Link → `/leaderboard`

**Empty states:** Trước khi admin seed — friendly message "Chưa có dữ liệu"

### 4.2 Matches (`/matches`)

**Filters:**
- Stage tabs: All | Group | R32 | R16 | QF | SF | 3rd | Final
- Toggle: Chỉ trận chưa kết thúc / Tất cả

**Table columns:**

| Cột | Nội dung |
| --- | -------- |
| Thời gian | `matchTime` formatted (vi-VN timezone) |
| Trận | Home vs Away |
| Vòng | Stage badge |
| Kết quả | `2 - 1` hoặc `-` nếu chưa xong |
| Dự đoán | Matrix hoặc expandable row |

**Dự đoán display options:**

- **Option A (recommended):** Expand row → bảng con 10 members × (predicted score, star icon, points earned)
- **Option B:** Modal click "Xem dự đoán"

**Star indicator:** ⭐ icon cạnh tỉ số dự đoán nếu `isStar`

**Finished matches:** Hiển thị điểm từng user (tính từ Phase 3 hoặc derive client-side cho display)

### 4.3 Leaderboard (`/leaderboard`)

**Table:**

| Rank | Member | Total Points | Stars used (optional) |
| ---- | ------ | ------------ | --------------------- |
| 1 🥇 | ... | ... | ... |
| 2 🥈 | ... | ... | ... |
| 3 🥉 | ... | ... | ... |

- Sort: `totalPoints` DESC
- Top 1 row: background highlight (vàng nhạt)
- Responsive: card layout trên mobile

**Optional stats:**
- Average points per member
- Total predictions count

### 4.4 Penalty Fund (`/penalty`)

**Summary cards:**
- Tổng quỹ phạt tích lũy: `sum(totalPenalty)`
- Tổng đã thu: `sum(paidAmount)`
- Còn nợ: `sum(totalPenalty - paidAmount)`

**Table per member:**

| Member | Total Penalty | Paid | Balance (nợ) |
| ------ | ------------- | ---- | ------------ |
| ... | ... | ... | ... |

- Highlight row **highest debt** (đỏ nhạt)
- Balance = `totalPenalty - paidAmount`
- Sort by balance DESC

**Transaction history (optional collapsible):**
- Recent 20 transactions all members
- Columns: Date, Member, Type (penalty/payment), Amount, Note

---

## UI/UX requirements

| Requirement | Implementation |
| ----------- | -------------- |
| Clean modern | Tailwind, spacing nhất quán, typography rõ |
| Table-heavy | `<Table>` component, horizontal scroll mobile |
| Responsive | Breakpoints: sm/md/lg — stack cards on mobile |
| Loading | Skeleton rows hoặc Spinner |
| Error | ErrorBoundary + retry button |
| i18n | Tiếng Việt labels (primary audience) |

### Stage badge colors

| Stage | Color |
| ----- | ----- |
| group | blue |
| round32 | cyan |
| round16 | teal |
| quarter | purple |
| semi | orange |
| third | gray |
| final | gold/red |

### Navigation (PublicLayout header)

```
[Logo WC 2026]  Dashboard | Lịch thi đấu | Bảng xếp hạng | Quỹ phạt
```

Không hiển thị link Admin trên public nav (admin biết URL `/admin/login`).

---

## Data fetching strategy

```ts
// hooks/useMatches.ts
export function useMatches(stage?: MatchStage) {
  // onSnapshot hoặc getDocs + cache Zustand
}
```

**Optimize Firestore reads:**

| Page | Strategy |
| ---- | -------- |
| Dashboard | 1 query matches (limit 5 upcoming) + 1 query users |
| Matches | 1 query matches filtered by stage; predictions lazy load on expand |
| Leaderboard | 1 query users, sort client |
| Penalty | 1 query users; transactions on demand |

**Caching:** Zustand store `matchesStore`, `usersStore` — TTL 60s hoặc invalidate on focus.

---

## Components to build

| Component | Used in |
| --------- | ------- |
| `MatchRow` | Matches, Dashboard |
| `PredictionMatrix` | Matches expand |
| `LeaderboardTable` | Leaderboard, Dashboard mini |
| `PenaltySummaryCards` | Penalty |
| `MemberPenaltyRow` | Penalty |
| `StageBadge` | Everywhere |
| `StatCard` | Dashboard, Penalty |

---

## Task checklist

- [ ] PublicLayout header + mobile menu
- [ ] Dashboard page với 3 sections
- [ ] Matches page với stage filter
- [ ] Expandable predictions per match
- [ ] Leaderboard với medal icons top 3
- [ ] Penalty page với summary + table
- [ ] Highlight top scorer & highest debt
- [ ] Loading/error states all pages
- [ ] Manual test trên mobile viewport

---

## Definition of Done

1. 4 routes public hoạt động không cần login
2. Data hiển thị đúng từ Firestore
3. Top scorer và highest debt được highlight
4. Responsive trên mobile (375px width)
5. Không có write operations từ public pages

---

## Phase tiếp theo

→ [Phase 5 — Admin UI](./phase-05-admin-ui.md)  
→ [Phase 6 — Finance](./phase-06-finance.md)
