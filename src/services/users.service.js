import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { MEMBERS } from '../constants/members.js'
import { slugify } from '../utils/slugify.js'
import { docsToArray, docToData, requireDb } from './firestore.helpers.js'
import * as predictionsService from './predictions.service.js'
import * as transactionsService from './transactions.service.js'

const COLLECTION = 'users'

/**
 * @param {import('../types/index.js').User} user
 * @returns {number}
 */
function getSortOrderValue(user) {
  return typeof user.sortOrder === 'number' ? user.sortOrder : Number.MAX_SAFE_INTEGER
}

/**
 * @param {import('../types/index.js').User[]} users
 * @returns {import('../types/index.js').User[]}
 */
export function sortUsersByOrder(users) {
  return [...users].sort((a, b) => {
    const orderDiff = getSortOrderValue(a) - getSortOrderValue(b)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name, 'vi')
  })
}

/** @returns {Promise<import('../types/index.js').User[]>} */
export async function getAll() {
  const db = requireDb()
  const snapshot = await getDocs(collection(db, COLLECTION))
  return sortUsersByOrder(docsToArray(snapshot))
}

/** @param {string} id @returns {Promise<import('../types/index.js').User | null>} */
export async function getById(id) {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  return docToData(snap)
}

/**
 * @param {string} userId
 * @param {{ totalPoints?: number, totalPenalty?: number, paidAmount?: number }} totals
 * @returns {Promise<void>}
 */
export async function updateTotals(userId, totals) {
  const db = requireDb()
  await updateDoc(doc(db, COLLECTION, userId), {
    ...totals,
    updatedAt: serverTimestamp(),
  })
}

/** @param {string} userId @param {number} amount @returns {Promise<void>} */
export async function incrementTotalPenalty(userId, amount) {
  const user = await getById(userId)
  if (!user) throw new Error(`User ${userId} not found`)
  await updateTotals(userId, { totalPenalty: user.totalPenalty + amount })
}

/** @param {string} userId @param {number} amount @returns {Promise<void>} */
export async function incrementPaidAmount(userId, amount) {
  const user = await getById(userId)
  if (!user) throw new Error(`User ${userId} not found`)
  await updateTotals(userId, { paidAmount: user.paidAmount + amount })
}

/** @returns {Promise<{ totalPenalty: number, totalPaid: number, totalDebt: number }>} */
export async function getFinancialSummary() {
  const users = await getAll()
  const totalPenalty = users.reduce((sum, u) => sum + u.totalPenalty, 0)
  const totalPaid = users.reduce((sum, u) => sum + u.paidAmount, 0)
  return { totalPenalty, totalPaid, totalDebt: totalPenalty - totalPaid }
}

/**
 * @param {string} id
 * @returns {Promise<number>}
 */
export async function countReferences(id) {
  const [predictions, transactions] = await Promise.all([
    predictionsService.getByUser(id),
    transactionsService.getByUser(id),
  ])
  return predictions.length + transactions.length
}

/**
 * @param {{ name: string }} data
 * @returns {Promise<string>}
 */
export async function create(data) {
  const db = requireDb()
  const id = slugify(data.name)
  if (!id) throw new Error('Tên thành viên không hợp lệ')

  const existing = await getById(id)
  if (existing) throw new Error('Thành viên với tên này đã tồn tại')

  const users = await getAll()
  const maxSortOrder = users.reduce(
    (max, user) => Math.max(max, typeof user.sortOrder === 'number' ? user.sortOrder : -1),
    -1,
  )

  await setDoc(doc(db, COLLECTION, id), {
    id,
    name: data.name.trim(),
    totalPoints: 0,
    totalPenalty: 0,
    paidAmount: 0,
    sortOrder: maxSortOrder + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

/**
 * @param {string} id
 * @param {{ name?: string }} data
 * @returns {Promise<void>}
 */
export async function update(id, data) {
  const db = requireDb()
  const user = await getById(id)
  if (!user) throw new Error('Không tìm thấy thành viên')

  if (data.name !== undefined) {
    const nextName = data.name.trim()
    if (!nextName) throw new Error('Nhập tên thành viên')
    await updateDoc(doc(db, COLLECTION, id), {
      name: nextName,
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * @param {string} id
 * @param {'up' | 'down'} direction
 * @returns {Promise<void>}
 */
export async function move(id, direction) {
  const db = requireDb()
  const users = await getAll()
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) throw new Error('Không tìm thấy thành viên')

  const neighborIndex = direction === 'up' ? index - 1 : index + 1
  if (neighborIndex < 0 || neighborIndex >= users.length) return

  const current = users[index]
  const neighbor = users[neighborIndex]
  const currentOrder = getSortOrderValue(current)
  const neighborOrder = getSortOrderValue(neighbor)

  await Promise.all([
    updateDoc(doc(db, COLLECTION, current.id), {
      sortOrder: neighborOrder,
      updatedAt: serverTimestamp(),
    }),
    updateDoc(doc(db, COLLECTION, neighbor.id), {
      sortOrder: currentOrder,
      updatedAt: serverTimestamp(),
    }),
  ])
}

/** @param {string} id @returns {Promise<void>} */
export async function remove(id) {
  const count = await countReferences(id)
  if (count > 0) {
    throw new Error('Không thể xóa thành viên đang có dự đoán hoặc giao dịch')
  }

  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}

/**
 * Seed members if collection is empty. Requires authenticated admin (Firestore rules).
 * @returns {Promise<number>} Number of users created
 */
export async function seedMembersIfEmpty() {
  const existing = await getAll()
  if (existing.length > 0) return 0

  const db = requireDb()
  const now = serverTimestamp()

  await Promise.all(
    MEMBERS.map((name, index) => {
      const id = slugify(name)
      return setDoc(doc(db, COLLECTION, id), {
        id,
        name,
        totalPoints: 0,
        totalPenalty: 0,
        paidAmount: 0,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
    }),
  )

  return MEMBERS.length
}
