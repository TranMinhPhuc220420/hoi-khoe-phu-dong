# WC 2026 — Hội Khỏe Phú Đổng

Ứng dụng web quản lý dự đoán World Cup 2026, tính điểm và theo dõi quỹ phạt cho nhóm 10 thành viên.

## Tech stack

- React 19 + Vite
- TailwindCSS v4
- React Router, Zustand
- Firebase (Firestore, Auth, Hosting)

## Yêu cầu

- Node.js 20+
- npm
- Firebase project (Firestore + Email/Password Auth)

## Chạy local

```bash
npm install
cp .env.example .env.local   # điền Firebase config
npm run dev
```

App chạy tại `http://localhost:5173`.

## Firebase setup (Phase 2)

1. Tạo project trên [Firebase Console](https://console.firebase.google.com)
2. Bật **Firestore** (production mode) và **Authentication → Email/Password**
3. Tạo tài khoản admin (email/password) — dùng cho đăng nhập `/admin/login`
4. Copy web app config vào `.env.local` (`VITE_FIREBASE_*`)
5. Deploy security rules:

```bash
npx firebase login
npx firebase use <project-id>
npm run deploy:rules
```

## Seed dữ liệu

Thêm vào `.env.local` (không commit):

```
SEED_ADMIN_EMAIL=your-admin@email.com
SEED_ADMIN_PASSWORD=your-password
```

Chạy seed (10 thành viên + 72 trận vòng bảng):

```bash
npm run seed
```

Script bỏ qua documents đã tồn tại — an toàn chạy lại.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run seed` | Seed Firestore (cần admin auth) |
| `npm run deploy:rules` | Deploy Firestore rules & indexes |

## Routes

**Public (read-only):** `/`, `/matches`, `/leaderboard`, `/penalty`

**Admin:** `/admin/login`, `/admin/dashboard`, `/admin/matches`, `/admin/predictions`, `/admin/finance`

## Tài liệu

- [docs/OVERVIEW.md](docs/OVERVIEW.md) — Spec dự án
- [docs/ROADMAP.md](docs/ROADMAP.md) — Roadmap các phase
- [docs/phase-02-database-auth.md](docs/phase-02-database-auth.md) — Phase 2 chi tiết
