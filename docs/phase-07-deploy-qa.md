# Phase 7 — Seed Data, Deploy & QA

**Trạng thái:** Chưa bắt đầu  
**Phụ thuộc:** Tất cả Phase 1–6  
**Ước lượng:** 2–3 ngày  
**Milestone M4:** Production-ready trên Firebase Hosting, mock data đầy đủ, QA pass

---

## Mục tiêu

Hoàn thiện dữ liệu demo, tối ưu hiệu năng Firestore, deploy production, và kiểm thử toàn hệ thống trước khi bàn giao.

---

## Deliverables

- [ ] Seed script mock data đầy đủ (matches + predictions + results mẫu)
- [ ] Firestore read optimization review
- [ ] Firebase Hosting deploy
- [ ] Environment production config
- [ ] QA checklist hoàn thành
- [ ] README dev + deploy documentation
- [ ] (Optional) Firebase Emulators cho local dev

---

## Mock data seeding

### Scope

| Collection | Mock content |
| ---------- | ------------ |
| users | 10 members (Phase 2) |
| matches | Full group stage + skeleton knockout |
| predictions | Sample predictions cho 5–10 trận đã "kết thúc" |
| transactions | Penalty + 1–2 payments mẫu |

### Script structure

```
scripts/
├── seed.mjs              # Entry: members + matches
├── seed-predictions.mjs    # Optional: bulk predictions
└── seed-demo-results.mjs   # Set results + trigger recalc
```

**npm scripts:**

```json
{
  "seed": "node scripts/seed.mjs",
  "seed:demo": "node scripts/seed-demo-results.mjs"
}
```

### Demo scenario (for presentation)

1. 3 trận group stage **finished** với kết quả thật
2. Mỗi trận có 10 predictions (mix: exact score, correct result, wrong, star used)
3. Leaderboard có phân tách điểm rõ ràng
4. 2–3 members có penalty, 1 member đã partial payment

---

## Firestore optimization

### Review checklist

| Area | Action |
| ---- | ------ |
| Duplicate reads | Consolidate queries trong dashboard hooks |
| Real-time vs fetch | Public pages: `getDocs` + cache; admin: `onSnapshot` selective |
| Indexes | Deploy composite indexes nếu console báo lỗi |
| Batch writes | Predictions save all 10 in one batch |
| Pagination | Transaction log paginate 20 items |
| Denormalization | Optional: store `pointsEarned` on prediction doc after calc — giảm client compute |

### Composite indexes file

`firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "stage", "order": "ASCENDING" },
        { "fieldPath": "matchTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "predictions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "matchId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Firebase Hosting deploy

### Setup

```bash
firebase init hosting
# Public directory: dist
# SPA: Yes (rewrite all to index.html)
```

### Build & deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

### `firebase.json` mẫu

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Environment

- Production: Firebase config trong `.env.production` (Vite)
- **Không** embed admin password trong frontend
- Auth domain whitelist trong Firebase Console

---

## QA Test Plan

### A. Authentication

| # | Test | Expected |
| - | ---- | -------- |
| A1 | Access /admin/matches without login | Redirect to /admin/login |
| A2 | Login wrong password | Error message |
| A3 | Login correct | Enter admin area |
| A4 | Logout | Session cleared, redirect login |
| A5 | Public pages without auth | Load normally |

### B. Scoring logic

| # | Test | Expected |
| - | ---- | -------- |
| B1 | Exact score, no star | 5 pts, 0 penalty |
| B2 | Correct result only | 3 pts, penalty by stage |
| B3 | Wrong prediction | 0 pts, penalty |
| B4 | Star + wrong | -3 pts, penalty |
| B5 | Star + exact | 10 pts, 0 penalty |
| B6 | Final exact score | 10 pts (5×2), 0 penalty |
| B7 | Star limit group (5th star) | UI blocks |
| B8 | Recalculate same match | No duplicate penalties |

### C. Admin workflow

| # | Test | Expected |
| - | ---- | -------- |
| C1 | Create match | Appears in list + public |
| C2 | Bulk save 10 predictions | All saved |
| C3 | Update result | Scores + penalties updated |
| C4 | Record payment | Balance decreases |

### D. Public UI

| # | Test | Expected |
| - | ---- | -------- |
| D1 | Leaderboard sort | Highest points first |
| D2 | Top scorer highlight | Visible on dashboard |
| D3 | Highest debt highlight | Visible on penalty page |
| D4 | Mobile 375px | Usable layout |
| D5 | Match predictions expand | Shows all 10 members |

### E. Security

| # | Test | Expected |
| - | ---- | -------- |
| E1 | Unauthenticated Firestore write (devtools) | Denied |
| E2 | Authenticated write | Allowed |
| E3 | Public read all collections | Allowed |

---

## Performance targets

| Metric | Target |
| ------ | ------ |
| First Contentful Paint | < 2s (3G) |
| Lighthouse Performance | ≥ 80 |
| Firestore reads / dashboard load | ≤ 5 queries |
| Bundle size (gzip) | < 500KB (excluding Firebase SDK) |

---

## Documentation deliverables

### README.md updates

- Project description (Vietnamese)
- Prerequisites: Node 20+, Firebase CLI
- Local setup steps
- Env variables
- Seed commands
- Deploy commands
- Admin login note (dev doc, not password in repo)

### docs/ structure (final)

```
docs/
├── OVERVIEW.md           # Spec gốc
├── ROADMAP.md            # Tổng quan phases
├── phase-01-foundation.md
├── phase-02-database-auth.md
├── phase-03-core-logic.md
├── phase-04-public-ui.md
├── phase-05-admin-ui.md
├── phase-06-finance.md
└── phase-07-deploy-qa.md
```

---

## Optional enhancements (post-MVP backlog)

| Item | Priority |
| ---- | -------- |
| Firebase Emulators local | Medium |
| Cloud Function for scoring (server-side) | Low |
| PWA offline cache public pages | Low |
| Dark mode | Low |
| Real-time leaderboard `onSnapshot` | Medium |
| Admin audit log | Low |

---

## Task checklist

- [ ] seed.mjs hoàn chỉnh
- [ ] Demo data scenario chạy được
- [ ] Firestore indexes deployed
- [ ] Read optimization pass
- [ ] Production build succeeds
- [ ] Firebase Hosting live URL
- [ ] QA checklist A–E pass
- [ ] README updated
- [ ] Handoff demo với stakeholder

---

## Definition of Done (Project Complete)

1. App deployed và accessible via HTTPS
2. Admin workflow hoàn chỉnh từ seed → predict → result → pay
3. Public pages hiển thị chính xác và responsive
4. Scoring & penalty logic verified qua QA matrix
5. Documentation đủ cho developer mới onboard

---

## Kết thúc roadmap

Quay lại [ROADMAP.md](./ROADMAP.md) để theo dõi tiến độ từng phase.
