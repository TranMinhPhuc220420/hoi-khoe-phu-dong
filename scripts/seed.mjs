import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { MEMBERS } from '../src/constants/members.js'
import { buildGroupStageMatches, GROUPS } from './data/group-stage-matches.js'
import { getCountryCodeForTeam } from './data/team-codes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function parseEnvValue(raw) {
  let value = raw.trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  return value
}

function loadEnvFile(filename) {
  const path = resolve(root, filename)
  if (!existsSync(path)) return

  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = parseEnvValue(trimmed.slice(eq + 1))
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const createAdmin = process.argv.includes('--create-admin')
const backfillOnly = process.argv.includes('--backfill-team-refs')
const backfillSortOrder = process.argv.includes('--backfill-sort-order')

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const email =
  process.env.SEED_ADMIN_EMAIL || process.env.VITE_SEED_ADMIN_EMAIL || ''
const password =
  process.env.SEED_ADMIN_PASSWORD || process.env.VITE_SEED_ADMIN_PASSWORD || ''

if (process.env.VITE_SEED_ADMIN_PASSWORD) {
  console.warn(
    'Warning: VITE_SEED_ADMIN_PASSWORD is exposed to the frontend bundle. Use SEED_ADMIN_PASSWORD instead.',
  )
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * @returns {Array<{ id: string, name: string, group: string, countryCode: string | null }>}
 */
function buildTeamsFromGroups() {
  /** @type {Map<string, { id: string, name: string, group: string, countryCode: string | null }>} */
  const byName = new Map()

  for (const [group, teamNames] of Object.entries(GROUPS)) {
    for (const name of teamNames) {
      if (byName.has(name)) continue
      byName.set(name, {
        id: slugify(name),
        name,
        group,
        countryCode: getCountryCodeForTeam(name),
      })
    }
  }

  return [...byName.values()]
}

/**
 * @param {import('firebase/auth').Auth} auth
 */
async function ensureAdminSignedIn(auth) {
  console.log(`Signing in as ${email}...`)
  try {
    await signInWithEmailAndPassword(auth, email, password)
    console.log('Signed in.')
    return
  } catch (err) {
    const code = /** @type {{ code?: string }} */ (err)?.code

    if (code !== 'auth/invalid-credential' && code !== 'auth/user-not-found') {
      throw err
    }

    if (!createAdmin) {
      console.error(`
auth/invalid-credential — đăng nhập thất bại.

Nguyên nhân thường gặp:
  1. Tài khoản admin chưa tồn tại trên Firebase Authentication
  2. Email hoặc mật khẩu trong .env.local không khớp
  3. Email/Password chưa bật trong Firebase Console

Cách xử lý (chọn một):

  A) Tạo user qua script (cần bật Email/Password sign-up):
     npm run seed -- --create-admin

  B) Tạo thủ công trên Firebase Console:
     Authentication → Users → Add user
     Email: ${email}

  C) Kiểm tra .env.local — dùng SEED_ADMIN_* (không dùng VITE_ prefix):
     SEED_ADMIN_EMAIL=${email}
     SEED_ADMIN_PASSWORD="your-password"

Mật khẩu có ký tự đặc biệt (@, #, ...) nên bọc trong dấu ngoặc kép.
`)
      process.exit(1)
    }

    console.log('Sign-in failed — creating admin account (--create-admin)...')
    await createUserWithEmailAndPassword(auth, email, password)
    console.log('Admin account created and signed in.')
  }
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @returns {Promise<Record<string, string>>}
 */
async function loadTeamNameToId(db) {
  const snapshot = await getDocs(collection(db, 'teams'))
  /** @type {Record<string, string>} */
  const nameToId = {}
  for (const teamDoc of snapshot.docs) {
    const data = teamDoc.data()
    if (data.name) nameToId[data.name] = teamDoc.id
  }
  return nameToId
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @returns {Promise<Record<string, string>>}
 */
async function seedTeams(db) {
  const teams = buildTeamsFromGroups()
  let created = 0

  for (const team of teams) {
    const ref = doc(db, 'teams', team.id)
    const existing = await getDoc(ref)
    if (existing.exists()) continue

    await setDoc(ref, {
      id: team.id,
      name: team.name,
      group: team.group,
      countryCode: team.countryCode,
      logoUrl: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    created++
  }

  console.log(`Teams: ${created} created (${teams.length} total expected)`)

  /** @type {Record<string, string>} */
  const nameToId = {}
  for (const team of teams) {
    nameToId[team.name] = team.id
  }
  return nameToId
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @param {Record<string, string>} nameToId
 */
async function backfillMatchTeamRefs(db, nameToId) {
  const snapshot = await getDocs(collection(db, 'matches'))
  let updated = 0

  for (const matchDoc of snapshot.docs) {
    const data = matchDoc.data()
    const updates = {}

    if (!data.homeTeamId && data.homeTeam && nameToId[data.homeTeam]) {
      updates.homeTeamId = nameToId[data.homeTeam]
    }
    if (!data.awayTeamId && data.awayTeam && nameToId[data.awayTeam]) {
      updates.awayTeamId = nameToId[data.awayTeam]
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(matchDoc.ref, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      updated++
    }
  }

  console.log(`Match team refs: ${updated} matches updated`)
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @returns {Promise<number>}
 */
async function backfillUserSortOrder(db) {
  const snapshot = await getDocs(collection(db, 'users'))
  const memberOrder = Object.fromEntries(MEMBERS.map((name, index) => [slugify(name), index]))
  let nextOrder = MEMBERS.length
  let updated = 0

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data()
    if (typeof data.sortOrder === 'number') continue

    const sortOrder = memberOrder[userDoc.id] ?? nextOrder++
    await updateDoc(userDoc.ref, {
      sortOrder,
      updatedAt: serverTimestamp(),
    })
    updated++
  }

  return updated
}

async function main() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Missing VITE_FIREBASE_* in .env.local')
    process.exit(1)
  }

  if (!email || !password) {
    console.error(
      'Missing SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local\n' +
        'Example:\n' +
        '  SEED_ADMIN_EMAIL=admin@example.com\n' +
        '  SEED_ADMIN_PASSWORD="your-secure-password"',
    )
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  await ensureAdminSignedIn(auth)

  const nameToId = await seedTeams(db)

  if (backfillOnly) {
    const nameToId = await loadTeamNameToId(db)
    await backfillMatchTeamRefs(db, nameToId)
    console.log('Backfill complete.')
    return
  }

  if (backfillSortOrder) {
    const updated = await backfillUserSortOrder(db)
    console.log(`Users sortOrder: ${updated} updated`)
    return
  }

  let usersCreated = 0
  for (let index = 0; index < MEMBERS.length; index++) {
    const name = MEMBERS[index]
    const id = slugify(name)
    const ref = doc(db, 'users', id)
    const existing = await getDoc(ref)
    if (existing.exists()) continue

    await setDoc(ref, {
      id,
      name,
      totalPoints: 0,
      totalPenalty: 0,
      paidAmount: 0,
      sortOrder: index,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    usersCreated++
  }
  console.log(`Users: ${usersCreated} created (${MEMBERS.length} total expected)`)

  let matchesCreated = 0
  const matches = buildGroupStageMatches()
  for (const match of matches) {
    const ref = doc(db, 'matches', match.id)
    const existing = await getDoc(ref)
    if (existing.exists()) continue

    const { id, homeTeam, awayTeam, matchTime, stage, homeScore, awayScore, isFinished } = match
    await setDoc(ref, {
      id,
      homeTeam,
      awayTeam,
      homeTeamId: nameToId[homeTeam] ?? null,
      awayTeamId: nameToId[awayTeam] ?? null,
      matchTime: Timestamp.fromDate(matchTime),
      stage,
      homeScore,
      awayScore,
      isFinished,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    matchesCreated++
  }
  console.log(`Matches: ${matchesCreated} created (${matches.length} total expected)`)

  await backfillMatchTeamRefs(db, await loadTeamNameToId(db))
  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
