import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { isFilledPredictionRow } from '../utils/prediction-input.js'
import { canUseStar } from '../utils/star.js'
import { docsToArray, docToData, requireDb } from './firestore.helpers.js'
import * as matchesService from './matches.service.js'

const COLLECTION = 'predictions'

/** @returns {Promise<import('../types/index.js').Prediction[]>} */
export async function getAll() {
  const db = requireDb()
  const snapshot = await getDocs(query(collection(db, COLLECTION)))
  return docsToArray(snapshot)
}

/** @param {string} matchId @returns {Promise<import('../types/index.js').Prediction[]>} */
export async function getByMatch(matchId) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('matchId', '==', matchId)),
  )
  return docsToArray(snapshot)
}

/** @param {string} userId @returns {Promise<import('../types/index.js').Prediction[]>} */
export async function getByUser(userId) {
  const db = requireDb()
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('userId', '==', userId)),
  )
  return docsToArray(snapshot)
}

/** @param {string} id @returns {Promise<import('../types/index.js').Prediction | null>} */
export async function getById(id) {
  const db = requireDb()
  const snap = await getDoc(doc(db, COLLECTION, id))
  return docToData(snap)
}

/**
 * @param {Omit<import('../types/index.js').Prediction, 'id'>} data
 * @returns {Promise<string>}
 */
export async function create(data) {
  await assertStarAllowed(data.userId, data.matchId, data.isStar)

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
 * @param {Partial<import('../types/index.js').Prediction>} data
 * @returns {Promise<void>}
 */
export async function update(id, data) {
  const db = requireDb()
  const existing = await getById(id)
  if (!existing) throw new Error('Dự đoán không tồn tại')

  const next = { ...existing, ...data }
  await assertStarAllowed(next.userId, next.matchId, next.isStar, id)

  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/** @param {string} id @returns {Promise<void>} */
export async function remove(id) {
  const db = requireDb()
  await deleteDoc(doc(db, COLLECTION, id))
}

/**
 * @param {string} userId
 * @param {string} matchId
 * @param {boolean} isStar
 * @param {string} [excludePredictionId]
 */
async function assertStarAllowed(userId, matchId, isStar, excludePredictionId) {
  const match = await matchesService.getById(matchId)
  if (!match) throw new Error('Trận đấu không tồn tại')

  const userPredictions = await getByUser(userId)
  const matchIds = [...new Set(userPredictions.map((p) => p.matchId))]
  const matches = await Promise.all(matchIds.map((id) => matchesService.getById(id)))
  const stageByMatchId = Object.fromEntries(
    matches.filter(Boolean).map((m) => [m.id, m.stage]),
  )

  const predictionsInStage = userPredictions.filter(
    (p) => stageByMatchId[p.matchId] === match.stage,
  )

  const check = canUseStar(userId, match.stage, predictionsInStage, {
    wantsStar: isStar,
    excludePredictionId,
  })

  if (!check.ok) {
    throw new Error(check.reason ?? 'Không thể sử dụng sao')
  }
}

/**
 * @param {string} matchId
 * @param {Array<{ userId: string, hasParticipated?: boolean, predictedHome?: number | null, predictedAway?: number | null, isStar: boolean, predictionId?: string }>} rows
 */
export async function upsertBatch(matchId, rows) {
  const existing = await getByMatch(matchId)
  const byUser = Object.fromEntries(existing.map((p) => [p.userId, p]))
  const nonParticipatingUserIds = rows
    .filter((row) => row.hasParticipated === false)
    .map((row) => row.userId)

  for (const row of rows) {
    const current = byUser[row.userId]

    if (row.hasParticipated === false) {
      if (current) await remove(current.id)
      continue
    }

    if (!isFilledPredictionRow(row)) continue

    const payload = {
      matchId,
      userId: row.userId,
      predictedHome: row.predictedHome,
      predictedAway: row.predictedAway,
      isStar: row.isStar,
    }

    if (current) {
      await update(current.id, payload)
    } else {
      await create(payload)
    }
  }

  await matchesService.update(matchId, { nonParticipatingUserIds })
}
