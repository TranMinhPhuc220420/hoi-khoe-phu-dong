# Phase 1 — Foundation & Project Setup

**Trạng thái:** Chưa bắt đầu  
**Phụ thuộc:** Không  
**Ước lượng:** 1–2 ngày  
**Milestone:** App chạy local với routing skeleton và cấu trúc thư mục chuẩn

---

## Mục tiêu

Thiết lập nền tảng kỹ thuật: React + Vite, TailwindCSS, routing, state management, và cấu trúc clean architecture để các phase sau build lên trực tiếp.

---

## Deliverables

- [ ] Project Vite + React + TypeScript khởi tạo và chạy `npm run dev`
- [ ] TailwindCSS cấu hình xong
- [ ] React Router v6 với route map đầy đủ (placeholder pages)
- [ ] Zustand store skeleton
- [ ] Cấu trúc thư mục theo services layer
- [ ] Firebase SDK cài đặt, file config (chưa cần dữ liệu thật)
- [ ] ESLint + Prettier (nếu chưa có)
- [ ] Biến môi trường `.env.example`

---

## Cấu trúc thư mục đề xuất

```
src/
├── components/
│   ├── ui/              # Button, Table, Badge, Input...
│   ├── layout/          # PublicLayout, AdminLayout, Sidebar, Navbar
│   └── shared/          # Loading, ErrorBoundary, EmptyState
├── pages/
│   ├── public/          # Dashboard, Matches, Leaderboard, Penalty
│   └── admin/           # Login, Dashboard, Matches, Predictions, Finance
├── services/
│   ├── firebase.ts      # Firebase init singleton
│   ├── matches.service.ts
│   ├── predictions.service.ts
│   ├── users.service.ts
│   └── transactions.service.ts
├── stores/
│   └── auth.store.ts
├── hooks/
│   └── useAuth.ts
├── utils/
│   ├── score.ts         # calculateScore (Phase 3)
│   └── penalty.ts       # calculatePenalty (Phase 3)
├── types/
│   └── index.ts         # Match, User, Prediction, Transaction
├── constants/
│   ├── members.ts
│   └── penalty-rates.ts
└── App.tsx
```

---

## Task breakdown

### 1.1 Khởi tạo project

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom zustand firebase
npm install -D @types/node
```

**Acceptance criteria:**
- `npm run dev` mở được trang mặc định
- TypeScript compile không lỗi

### 1.2 TailwindCSS

- Cấu hình `@tailwindcss/vite` trong `vite.config.ts`
- Import `@import "tailwindcss"` trong `index.css`
- Thiết lập theme cơ bản (font, màu primary cho WC 2026 branding nếu cần)

### 1.3 Routing

| Route | Component | Layout | Ghi chú |
| ----- | --------- | ------ | ------- |
| `/` | `PublicDashboard` | PublicLayout | Placeholder |
| `/matches` | `MatchesPage` | PublicLayout | Placeholder |
| `/leaderboard` | `LeaderboardPage` | PublicLayout | Placeholder |
| `/penalty` | `PenaltyPage` | PublicLayout | Placeholder |
| `/admin/login` | `AdminLoginPage` | — | Không sidebar |
| `/admin/dashboard` | `AdminDashboard` | AdminLayout | Protected (Phase 2) |
| `/admin/matches` | `AdminMatches` | AdminLayout | Protected |
| `/admin/predictions` | `AdminPredictions` | AdminLayout | Protected |
| `/admin/finance` | `AdminFinance` | AdminLayout | Protected |

**Router guard placeholder:** Component `ProtectedRoute` trả về children — logic auth thêm ở Phase 2.

### 1.4 Type definitions

Định nghĩa sẵn types theo spec OVERVIEW:

```ts
export type MatchStage =
  | "group" | "round32" | "round16"
  | "quarter" | "semi" | "third" | "final"

export interface Match { ... }
export interface User { ... }
export interface Prediction { ... }
export interface Transaction { ... }
```

### 1.5 Constants

- `constants/members.ts` — danh sách 10 thành viên
- `constants/penalty-rates.ts` — bảng mức phạt theo stage
- `constants/star-limits.ts` — giới hạn sao theo vòng

### 1.6 Firebase init (skeleton)

```ts
// services/firebase.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = { /* từ .env */ }
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

File `.env.example`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 1.7 UI components cơ bản (reusable)

| Component | Mục đích |
| --------- | -------- |
| `Button` | Primary, secondary, danger variants |
| `Input` | Text, number, password |
| `Table` | Wrapper table responsive |
| `Badge` | Stage, status tags |
| `Card` | Dashboard stat cards |
| `Spinner` | Loading state |

---

## Layout wireframe

### PublicLayout
- Header: logo + nav links (Dashboard, Matches, Leaderboard, Penalty)
- Main content area
- Footer tối giản

### AdminLayout (skeleton)
- Sidebar: Dashboard, Matches, Predictions, Finance, Logout
- Top navbar: tiêu đề trang + admin email
- Content area full width, table-heavy

---

## Rủi ro & lưu ý

| Rủi ro | Giảm thiểu |
| ------ | ---------- |
| Chọn Next.js vs Vite | OVERVIEW ưu tiên Vite hoặc Next.js — project hiện tại đã là Vite, giữ nguyên |
| Over-engineering folder structure | Chỉ tạo file service khi Phase tương ứng cần |
| Thiếu `.env` local | Document rõ trong README dev setup |

---

## Definition of Done

1. Tất cả routes truy cập được (placeholder content)
2. `AdminLayout` và `PublicLayout` render đúng
3. Types và constants khớp spec OVERVIEW
4. Firebase SDK import không lỗi (config có thể dummy cho đến Phase 2)
5. Không có lỗi ESLint/TypeScript blocking

---

## Phase tiếp theo

→ [Phase 2 — Database & Authentication](./phase-02-database-auth.md)
