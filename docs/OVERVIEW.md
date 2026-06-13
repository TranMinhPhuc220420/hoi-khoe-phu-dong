# 🚀 FULL PROJECT PROMPT — World Cup 2026 Prediction & Penalty Fund System

> **Kế hoạch triển khai:** Xem [ROADMAP.md](./ROADMAP.md) và các phase chi tiết (`phase-01` → `phase-07`).

## 🧠 ROLE

You are a **Senior Fullstack Engineer**.

Your task is to **design and implement a production-ready web application** for managing:

* World Cup 2026 match predictions
* Scoring system
* Penalty fund tracking

---

## 🧱 TECH STACK

### Frontend

* React (Vite or Next.js preferred)
* TailwindCSS
* Zustand or Context API (state management)

### Backend (BaaS)

* Firebase

  * Firestore (database)
  * Firebase Auth (ADMIN ONLY)
  * Firebase Hosting

---

## 🔐 AUTHENTICATION RULES

* Only **admin can login**
* Use **Firebase Authentication (Email/Password)**

### Default Admin Account

* Email: `dev.minhphuc@gmail.com`
* Password: `Sateraito2023@@`

### Requirements

* No public user authentication
* Public users DO NOT login
* Protect all admin routes (`/admin/*`)
* Redirect unauthenticated users to `/admin/login`

---

## 👥 USER ROLES

### Admin

* Full CRUD access
* Manage:

  * Matches
  * Predictions
  * Results
  * Scores
  * Penalty fund
  * Payment tracking

### Public Users

* No login required
* Read-only access:

  * Match schedule
  * Predictions
  * Leaderboard
  * Penalty fund

---

## ⚽ MATCH DATA (WORLD CUP 2026)

You MUST:

* Seed initial match data (group stage at minimum)
* Structure matches by:

  * group stage
  * knockout rounds

### Match Model

```ts
{
  id: string
  homeTeam: string
  awayTeam: string
  matchTime: Timestamp
  stage: "group" | "round32" | "round16" | "quarter" | "semi" | "third" | "final"
  homeScore: number | null
  awayScore: number | null
  isFinished: boolean
}
```

---

## 📊 PREDICTION SYSTEM

### Rules

* Correct result (Win/Lose/Draw): +3 points
* Exact score: +5 points total

---

### ⭐ Star Mechanism

* Multiplies match points by 2

#### Star Limits:

* Group stage: 4
* Round of 32: 2
* Round of 16: 2
* Quarterfinal: 1
* Semifinal + Third-place: 1
* Final: always x2 (no need to select star)

#### Penalty Rule:

* If star is used (except final) AND prediction is wrong → **-3 points**

---

## 💸 PENALTY FUND SYSTEM

### No Penalty Condition

* Only if user gets **exact score (5 points)**

### Otherwise → penalty applies

| Stage   | Penalty |
| ------- | ------- |
| Group   | 10,000  |
| Round32 | 15,000  |
| Round16 | 20,000  |
| Quarter | 25,000  |
| Semi    | 30,000  |
| Third   | 35,000  |
| Final   | 50,000  |

---

## 👤 MEMBERS

```ts
[
  "Hoa Le",
  "Kien Pham Duc",
  "Minh Triet",
  "Phuc (Leopard)",
  "Huy Tue",
  "tran quoc dat",
  "Tu Anh Vu Duc",
  "Duoc Thai",
  "Thanh Thao Nguyen",
  "Nhan Pham"
]
```

---

## 🧮 CORE LOGIC

### Score Calculation

```ts
function calculateScore(prediction, result, isStar, stage) {
  let points = 0

  if (correctResult) points += 3
  if (exactScore) points = 5

  if (stage === "final") {
    points *= 2
  } else if (isStar) {
    if (wrongPrediction) return -3
    points *= 2
  }

  return points
}
```

---

### Penalty Calculation

```ts
function calculatePenalty(points, stage) {
  if (points === 5) return 0
  return getPenaltyByStage(stage)
}
```

---

## 🗄️ DATABASE STRUCTURE (FIRESTORE)

### users

```ts
{
  id: string
  name: string
  totalPoints: number
  totalPenalty: number
  paidAmount: number
}
```

---

### matches

```ts
{
  id: string
  homeTeam: string
  awayTeam: string
  matchTime: Timestamp
  stage: string
  homeScore: number | null
  awayScore: number | null
  isFinished: boolean
}
```

---

### predictions

```ts
{
  id: string
  matchId: string
  userId: string
  predictedHome: number
  predictedAway: number
  isStar: boolean
}
```

---

### transactions

```ts
{
  id: string
  userId: string
  amount: number
  type: "penalty" | "payment"
  note: string
  createdAt: Timestamp
}
```

---

## 🧩 UI STRUCTURE

### Public Pages

* `/` → Dashboard
* `/matches`
* `/leaderboard`
* `/penalty`

---

### Admin Pages

* `/admin/login`
* `/admin/dashboard`
* `/admin/matches`
* `/admin/predictions`
* `/admin/finance`

---

## 🎨 UI REQUIREMENTS

* Clean modern admin dashboard (sidebar + navbar)
* Table-heavy layout
* Responsive
* Highlight:

  * Top scorer
  * Highest debt

---

## 🔒 FIRESTORE SECURITY RULES

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ⚙️ SYSTEM WORKFLOW

1. Admin seeds matches
2. Admin inputs predictions
3. After match ends:

   * Admin updates result
4. System auto:

   * Calculate score
   * Calculate penalty
   * Update leaderboard
5. Admin tracks payments

---

## 🧪 EXTRA REQUIREMENTS

* Seed mock data
* Add utility functions
* Use clean architecture (services layer)
* Use reusable components
* Optimize Firestore reads

---

## 🎯 FINAL GOAL

Deliver a **fully working production-ready app**:

* Clean UI
* Accurate scoring logic
* Transparent penalty tracking
* Easy admin workflow

---
