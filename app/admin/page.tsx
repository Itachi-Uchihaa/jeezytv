"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import { addDoc, collection } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function AdminPage() {
  const [user, loading] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [streamKey, setStreamKey] = useState("")
  const [message, setMessage] = useState("")

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage("Vous devez être connecté pour créer un stream.")
      return
    }

    try {
      const streamDoc = await addDoc(collection(db, "streams"), {
        title,
        description,
        streamKey,
        userId: user.uid,
        createdAt: new Date(),
        isLive: false,
        viewerCount: 0,
      })

      setMessage(`Stream créé avec succès. ID: ${streamDoc.id}`)
      setTitle("")
      setDescription("")
      setStreamKey("")
    } catch (error) {
      setMessage("Erreur lors de la création du stream.")
      console.error(error)
    }
  }

  if (loading) return <div>Chargement...</div>
  if (!user) return <div>Accès non autorisé</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page d'administration</h1>
      <form onSubmit={handleCreateStream} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre du stream
          </label>
          <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="streamKey" className="block text-sm font-medium text-gray-700">
            Clé de stream
          </label>
          <Input id="streamKey" type="text" value={streamKey} onChange={(e) => setStreamKey(e.target.value)} required />
        </div>
        <Button type="submit">Créer le stream</Button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
}
