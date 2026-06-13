import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase.js'

/**
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth chưa được cấu hình')
  }
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  if (!auth) return
  await firebaseSignOut(auth)
}

/**
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void}
 */
export function subscribeToAuth(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  const code = /** @type {{ code?: string }} */ (error)?.code

  switch (code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ'
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không đúng'
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng thử lại sau'
    default:
      return 'Đăng nhập thất bại. Vui lòng thử lại'
  }
}
