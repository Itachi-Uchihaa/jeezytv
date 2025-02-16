"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../../lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore"
import Hls from "hls.js"
import StreamChat from "../../components/StreamChat"

interface Stream {
  id: string
  title: string
  description: string
  userId: string
  isLive: boolean
  viewerCount: number
  hlsUrl: string
}

export default function Stream({ params }: { params: { id: string } }) {
  const [user] = useAuthState(auth)
  const [stream, setStream] = useState<Stream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const fetchStream = async () => {
      const streamDoc = await getDoc(doc(db, "streams", params.id))
      if (streamDoc.exists()) {
        setStream({ id: streamDoc.id, ...streamDoc.data() } as Stream)

        // Increment viewer count
        await updateDoc(doc(db, "streams", params.id), {
          viewerCount: increment(1),
        })
      }
    }
    fetchStream()

    return () => {
      // Decrement viewer count when leaving
      if (stream) {
        updateDoc(doc(db, "streams", params.id), {
          viewerCount: increment(-1),
        })
      }
    }
  }, [params.id, stream])

  useEffect(() => {
    if (videoRef.current && stream && stream.hlsUrl) {
      const hls = new Hls()
      hls.loadSource(stream.hlsUrl)
      hls.attachMedia(videoRef.current)
    }
  }, [stream])

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold">Vous devez être connecté pour voir ce stream.</h2>
    </div>
  }

  if (!stream) {
    return <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl">Chargement...</h2>
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
      <p className="text-gray-600 mb-4">{stream.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        {stream.viewerCount} spectateur{stream.viewerCount > 1 ? 's' : ''}
      </p>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lecteur vidéo */}
        <div className="lg:w-2/3">
          <video 
            ref={videoRef} 
            controls 
            className="w-full aspect-video bg-black rounded-lg"
          />
        </div>

        {/* Chat */}
        <div className="lg:w-1/3 h-[600px]">
          <StreamChat streamId={params.id} />
        </div>
      </div>
    </div>
  )
}