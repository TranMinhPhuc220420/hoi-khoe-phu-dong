import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function isConfigValid() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

/** @type {import('firebase/app').FirebaseApp | null} */
let app = null

/** @type {import('firebase/firestore').Firestore | null} */
let db = null

/** @type {import('firebase/auth').Auth | null} */
let auth = null

if (isConfigValid()) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
} else if (import.meta.env.DEV) {
  console.warn(
    '[Firebase] Missing VITE_FIREBASE_* env vars. Copy .env.example to .env.local and fill in your Firebase config.',
  )
}

export { app, db, auth, isConfigValid }
