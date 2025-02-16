"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import Link from "next/link"

interface Stream {
  id: string
  title: string
  description: string
  userId: string
  isLive: boolean
  viewerCount: number
}

export default function Streams() {
  const [user, loading] = useAuthState(auth)
  const [streams, setStreams] = useState<Stream[]>([])

  useEffect(() => {
    if (user) {
      const streamsQuery = query(collection(db, "streams"), where("isLive", "==", true))
      const unsubscribe = onSnapshot(streamsQuery, (snapshot) => {
        const streamList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Stream[]
        setStreams(streamList)
      })

      return () => unsubscribe()
    }
  }, [user])

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!user) {
    return <div>Vous devez être connecté pour voir cette page.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Streams en direct</h1>
      {streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div key={stream.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{stream.title}</h2>
              <p className="text-gray-600 mb-4">{stream.description}</p>
              <p className="text-sm text-gray-500 mb-2">Spectateurs: {stream.viewerCount}</p>
              <Link href={`/stream/${stream.id}`}>
                <button>Regarder</button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun stream en direct pour le moment.</p>
      )}
    </div>
  )
}

