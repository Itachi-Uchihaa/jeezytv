"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Stream {
  id: string
  title: string
  description: string
  userId: string
  isLive: boolean
  viewerCount: number
  streamId: string
}

export default function Streams() {
  const [user, loading] = useAuthState(auth)
  const [streams, setStreams] = useState<Stream[]>([])

  useEffect(() => {
    if (user) {
      const streamsQuery = query(
        collection(db, "streams"),
        where("isLive", "==", true)
      )
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
    return <div className="container mx-auto px-4 py-8">Chargement...</div>
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        Vous devez être connecté pour voir cette page.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Streams en direct</h1>
      {streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Card key={stream.id}>
              <CardHeader>
                <CardTitle>{stream.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{stream.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Spectateurs: {stream.viewerCount}
                </p>
                <Link href={`/stream/${stream.id}`}>
                  <Button className="w-full">Regarder</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>Aucun stream en direct pour le moment.</p>
      )}
    </div>
  )
}
