import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { docsToArray, requireDb } from './firestore.helpers.js'

const COLLECTION = 'transactions'

/**
 * @param {import('../types/index.js').Transaction[]} items
 * @param {{ type?: import('../types/index.js').TransactionType, userId?: string }} [filters]
 */
function applyFilters(items, filters) {
  if (!filters) return items
  let result = items
  if (filters.type) result = result.filter((tx) => tx.type === filters.type)
  if (filters.userId) result = result.filter((tx) => tx.userId === filters.userId)
  return result
}

/**
 * @param {{ type?: import('../types/index.js').TransactionType, userId?: string }} [filters]
 * @returns {Promise<import('../types/index.js').Transaction[]>}
 */
export async function getAll(filters) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc')),
  )
  return applyFilters(docsToArray(snapshot), filters)
}

/**
 * @param {string} userId
 * @param {number} [maxResults=50]
 * @returns {Promise<import('../types/index.js').Transaction[]>}
 */
export async function getByUser(userId, maxResults = 50) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    ),
  )
  return docsToArray(snapshot)
}

/**
 * @param {Omit<import('../types/index.js').Transaction, 'id' | 'createdAt'>} data
 * @returns {Promise<string>}
 */
export async function create(data) {
  const db = requireDb()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** @param {string} matchId @returns {Promise<import('../types/index.js').Transaction[]>} */
export async function getByMatchId(matchId) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('matchId', '==', matchId)),
  )
  return docsToArray(snapshot)
}

/** @param {string} matchId @returns {Promise<void>} */
export async function deleteByMatchId(matchId) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('matchId', '==', matchId)),
  )
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}

/** @returns {Promise<void>} */
export async function deleteAllPenalties() {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('type', '==', 'penalty')),
  )
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}
