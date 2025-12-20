import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useApprovedPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'submissions'),
      where('status', '==', 'approved')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const approvedPhotos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort by reviewedAt in JavaScript to avoid needing composite index
        approvedPhotos.sort((a, b) => {
          const aTime = a.reviewedAt?.toMillis?.() || 0
          const bTime = b.reviewedAt?.toMillis?.() || 0
          return bTime - aTime
        })
        setPhotos(approvedPhotos)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching approved photos:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { photos, loading, error }
}
