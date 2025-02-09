"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../../lib/firebase"
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  increment,
} from "firebase/firestore"
import Hls from "hls.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  text: string
  userId: string
  timestamp: any
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
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

    const messagesQuery = query(
      collection(db, "streams", params.id, "messages"),
      orderBy("timestamp", "desc"),
      limit(100),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Message,
      )
      setMessages(newMessages.reverse())
    })

    return () => {
      unsubscribe()
      // Decrement viewer count when leaving
      if (stream) {
        updateDoc(doc(db, "streams", params.id), {
          viewerCount: increment(-1),
        })
      }
    }
  }, [params.id, stream]) // Added stream to dependencies

  useEffect(() => {
    if (videoRef.current && stream && stream.hlsUrl) {
      const hls = new Hls()
      hls.loadSource(stream.hlsUrl)
      hls.attachMedia(videoRef.current)
    }
  }, [stream])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && user) {
      await addDoc(collection(db, "streams", params.id, "messages"), {
        text: newMessage,
        userId: user.uid,
        timestamp: new Date(),
      })
      setNewMessage("")
    }
  }

  if (!user) {
    return <div>Vous devez être connecté pour voir ce stream.</div>
  }

  if (!stream) {
    return <div>Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
      <p className="text-gray-600 mb-4">{stream.description}</p>
      <p className="text-sm text-gray-500 mb-4">Spectateurs: {stream.viewerCount}</p>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <video ref={videoRef} controls className="w-full aspect-video bg-black"></video>
        </div>
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-2">
                  <span className="font-semibold">{message.userId}: </span>
                  <span>{message.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                className="flex-grow"
              />
              <Button type="submit">Envoyer</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

