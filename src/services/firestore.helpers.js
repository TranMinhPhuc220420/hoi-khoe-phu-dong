import { db } from './firebase.js'

export function requireDb() {
  if (!db) {
    throw new Error('Firestore chưa được cấu hình. Kiểm tra file .env.local')
  }
  return db
}

/**
 * @template T
 * @param {import('firebase/firestore').DocumentSnapshot} snap
 * @returns {T | null}
 */
export function docToData(snap) {
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * @template T
 * @param {import('firebase/firestore').QuerySnapshot} snapshot
 * @returns {T[]}
 */
export function docsToArray(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
