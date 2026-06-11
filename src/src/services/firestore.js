import {
  doc, collection, setDoc, getDoc, getDocs,
  deleteDoc, updateDoc, query, where, orderBy,
  serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Lista personal del usuario ──────────────────────────
// status: 'watching' | 'completed' | 'planned' | 'dropped' | 'on_hold'

export const addToList = async (userId, entry) => {
  const ref = doc(db, 'users', userId, 'list', `${entry.type}_${entry.id}`)
  await setDoc(ref, {
    ...entry,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const removeFromList = async (userId, type, entryId) => {
  const ref = doc(db, 'users', userId, 'list', `${type}_${entryId}`)
  await deleteDoc(ref)
}

export const updateListEntry = async (userId, type, entryId, updates) => {
  const ref = doc(db, 'users', userId, 'list', `${type}_${entryId}`)
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
}

export const getUserList = async (userId, type = null, status = null) => {
  let q = collection(db, 'users', userId, 'list')
  const constraints = []
  if (type) constraints.push(where('type', '==', type))
  if (status) constraints.push(where('status', '==', status))
  constraints.push(orderBy('updatedAt', 'desc'))
  q = query(q, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}

export const getListEntry = async (userId, type, entryId) => {
  const ref = doc(db, 'users', userId, 'list', `${type}_${entryId}`)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ── Estadísticas de usuario ─────────────────────────────
export const getUserStats = async (userId) => {
  const list = await getUserList(userId)
  const stats = {
    anime: { watching: 0, completed: 0, planned: 0, dropped: 0, on_hold: 0, total: 0 },
    manga: { reading: 0, completed: 0, planned: 0, dropped: 0, on_hold: 0, total: 0 },
    totalEntries: list.length,
  }
  list.forEach(entry => {
    const t = entry.type
    if (stats[t]) {
      stats[t][entry.status] = (stats[t][entry.status] || 0) + 1
      stats[t].total++
    }
  })
  return stats
}

// ── Reseñas ─────────────────────────────────────────────
export const addReview = async (userId, userName, userPhoto, entryId, entryType, entryTitle, reviewText, score) => {
  const ref = doc(collection(db, 'reviews'))
  await setDoc(ref, {
    userId, userName, userPhoto,
    entryId, entryType, entryTitle,
    reviewText, score,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    helpful: 0,
  })
  return ref.id
}

export const updateReview = async (reviewId, reviewText, score) => {
  const ref = doc(db, 'reviews', reviewId)
  await updateDoc(ref, { reviewText, score, updatedAt: serverTimestamp() })
}

export const deleteReview = async (reviewId) => {
  await deleteDoc(doc(db, 'reviews', reviewId))
}

export const getReviewsForEntry = async (entryId, entryType) => {
  const q = query(
    collection(db, 'reviews'),
    where('entryId', '==', entryId),
    where('entryType', '==', entryType),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getUserReviews = async (userId) => {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Perfil de usuario ───────────────────────────────────
export const saveUserProfile = async (userId, data) => {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export const getUserProfile = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? snap.data() : null
}
