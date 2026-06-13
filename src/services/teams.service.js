import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { slugify } from '../utils/slugify.js'
import { docsToArray, docToData, requireDb } from './firestore.helpers.js'
import * as matchesService from './matches.service.js'

const COLLECTION = 'teams'

/**
 * @param {import('../types/index.js').Team} team
 * @returns {string | null}
 */
export function getDisplayLogo(team) {
  if (team.logoUrl) return team.logoUrl
  if (team.countryCode) return `https://flagcdn.com/w40/${team.countryCode}.png`
  return null
}

/** @returns {Promise<import('../types/index.js').Team[]>} */
export async function getAll() {
  const db = requireDb()
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('name')))
  return docsToArray(snapshot)
}

/** @param {string} id @returns {Promise<import('../types/index.js').Team | null>} */
export async function getById(id) {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  return docToData(snap)
}

/**
 * @param {string} id
 * @returns {Promise<number>}
 */
export async function countMatchesUsingTeam(id) {
  const team = await getById(id)
  if (!team) return 0

  const matches = await matchesService.getAll()
  return matches.filter(
    (m) =>
      m.homeTeamId === id ||
      m.awayTeamId === id ||
      m.homeTeam === team.name ||
      m.awayTeam === team.name,
  ).length
}

/**
 * @param {string} teamId
 * @param {string} newName
 * @returns {Promise<void>}
 */
async function syncTeamNameOnMatches(teamId, newName) {
  const matches = await matchesService.getAll()
  await Promise.all(
    matches.map(async (match) => {
      const updates = {}
      if (match.homeTeamId === teamId) updates.homeTeam = newName
      if (match.awayTeamId === teamId) updates.awayTeam = newName
      if (Object.keys(updates).length > 0) {
        await matchesService.update(match.id, updates)
      }
    }),
  )
}

/**
 * @param {Omit<import('../types/index.js').Team, 'id'> & { name: string }} data
 * @returns {Promise<string>}
 */
export async function create(data) {
  const db = requireDb()
  const id = slugify(data.name)
  if (!id) throw new Error('Tên đội không hợp lệ')

  const existing = await getById(id)
  if (existing) throw new Error('Đội bóng với tên này đã tồn tại')

  await setDoc(doc(db, COLLECTION, id), {
    id,
    name: data.name.trim(),
    group: data.group ?? null,
    countryCode: data.countryCode?.trim().toLowerCase() || null,
    logoUrl: data.logoUrl?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

/**
 * @param {string} id
 * @param {Partial<Pick<import('../types/index.js').Team, 'name' | 'group' | 'countryCode' | 'logoUrl'>>} data
 * @returns {Promise<void>}
 */
export async function update(id, data) {
  const db = requireDb()
  const team = await getById(id)
  if (!team) throw new Error('Không tìm thấy đội bóng')

  const nextName = data.name !== undefined ? data.name.trim() : team.name
  const payload = {
    ...(data.name !== undefined ? { name: nextName } : {}),
    ...(data.group !== undefined ? { group: data.group } : {}),
    ...(data.countryCode !== undefined
      ? { countryCode: data.countryCode?.trim().toLowerCase() || null }
      : {}),
    ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl?.trim() || null } : {}),
    updatedAt: serverTimestamp(),
  }

  await updateDoc(doc(db, COLLECTION, id), payload)

  if (data.name !== undefined && nextName !== team.name) {
    await syncTeamNameOnMatches(id, nextName)
  }
}

/** @param {string} id @returns {Promise<void>} */
export async function remove(id) {
  const count = await countMatchesUsingTeam(id)
  if (count > 0) {
    throw new Error('Không thể xóa đội đang có trong lịch thi đấu')
  }

  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}
