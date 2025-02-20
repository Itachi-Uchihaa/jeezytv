// app/components/StreamChat.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  text: string
  userId: string
  username: string
  timestamp: any
}

export default function StreamChat({ streamId }: { streamId: string }) {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!streamId) return

    const messagesQuery = query(
      collection(db, "streams", streamId, "messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Message)
        .reverse()
      setMessages(newMessages)
    })

    return () => unsubscribe()
  }, [streamId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    try {
      await addDoc(collection(db, "streams", streamId, "messages"), {
        text: newMessage.trim(),
        userId: user.uid,
        username: user.displayName || "Anonyme",
        timestamp: serverTimestamp(),
      })
      setNewMessage("")
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Chat en direct</h2>
      </div>

      <div className="flex-grow overflow-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.userId === user?.uid
                  ? "bg-blue-600 ml-8"
                  : "bg-gray-700 mr-8"
              }`}
            >
              <div className="text-sm text-gray-300 font-medium">
                {message.username || "Anonyme"}
              </div>
              <div className="text-white">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-grow bg-gray-800 text-white border-gray-700"
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim()}
        >
          Envoyer
        </Button>
      </form>
    </div>
  )
}