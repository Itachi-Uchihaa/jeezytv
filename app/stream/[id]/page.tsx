"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import StreamChat from "@/components/StreamChat"
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { useParams } from "next/navigation"
interface Stream {
  id: string
  title: string
  description: string
  userId: string
  isLive: boolean
  viewerCount: number
  streamId: string // Pour LiveKit
}

export default function Stream() {
  const params = useParams()
  const [user] = useAuthState(auth)
  const [stream, setStream] = useState<Stream | null>(null)
  const [token, setToken] = useState<string>("")

  useEffect(() => {
    const fetchStream = async () => {
      if (!params.id) return

      const streamDoc = await getDoc(doc(db, "streams", params.id as string))

      if (streamDoc.exists()) {
        setStream(streamDoc.data() as Stream)

        // Increment viewer count
        await updateDoc(doc(db, "streams", params.id as string), {
          viewerCount: increment(1),
        })

        // Obtenir le token LiveKit pour le viewer
        const response = await fetch('/api/stream/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            streamId: streamDoc.data().streamId,
            userId: user?.uid,
            title: streamDoc.data().title,
            isViewer: true
          }),
        })
        const data = await response.json()
        setToken(data.token)
      }
    }
    fetchStream()

    return () => {
      // Decrement viewer count when leaving
      if (stream) {
        if (!params.id) return

        updateDoc(doc(db, "streams", params.id as string), {
          viewerCount: increment(-1),
        })
      }
    }
  }, [params.id, user?.uid, stream])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">
          Vous devez être connecté pour voir ce stream.
        </h2>
      </div>
    )
  }

  if (!stream || !token) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl">Chargement...</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
      <p className="text-gray-600 mb-4">{stream.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        {stream.viewerCount} spectateur{stream.viewerCount > 1 ? "s" : ""}
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lecteur vidéo LiveKit */}
        <div className="lg:w-2/3">
          <LiveKitRoom
            token={token}
            serverUrl="wss://jeezytv-0yemfakn.livekit.cloud"
            connect={true}
            className="w-full aspect-video bg-black rounded-lg"
          >
            <VideoConference />
          </LiveKitRoom>
        </div>

        {/* Chat */}
        <div className="lg:w-1/3 h-[600px]">
          <StreamChat streamId={params.id as string} />
        </div>
      </div>
    </div>
  )
}
