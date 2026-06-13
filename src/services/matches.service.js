import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { docsToArray, docToData, requireDb } from './firestore.helpers.js'
import * as scoringService from './scoring.service.js'

const COLLECTION = 'matches'

/** @returns {Promise<import('../types/index.js').Match[]>} */
export async function getAll() {
  const db = requireDb()
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('matchTime')))
  return docsToArray(snapshot)
}

/** @param {import('../types/index.js').MatchStage} stage @returns {Promise<import('../types/index.js').Match[]>} */
export async function getByStage(stage) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('stage', '==', stage), orderBy('matchTime')),
  )
  return docsToArray(snapshot)
}

/** @param {string} id @returns {Promise<import('../types/index.js').Match | null>} */
export async function getById(id) {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  return docToData(snap)
}

/**
 * @param {Omit<import('../types/index.js').Match, 'id'>} data
 * @returns {Promise<string>}
 */
export async function create(data) {
  const db = requireDb()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await updateDoc(ref, { id: ref.id })
  return ref.id
}

/**
 * @param {string} id
 * @param {Partial<import('../types/index.js').Match>} data
 * @returns {Promise<void>}
 */
export async function update(id, data) {
  const db = requireDb()
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * @param {string} matchId
 * @param {number} homeScore
 * @param {number} awayScore
 * @returns {Promise<void>}
 */
export async function updateResult(matchId, homeScore, awayScore) {
  await update(matchId, {
    homeScore,
    awayScore,
    isFinished: true,
  })
  await scoringService.recalculateMatch(matchId)
}

/** @param {string} id @returns {Promise<void>} */
export async function remove(id) {
  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}

/** @returns {Promise<number>} */
export async function countAll() {
  const matches = await getAll()
  return matches.length
}
