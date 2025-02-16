// app/admin/streams/page.tsx
"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../../lib/firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createNewStream } from "../../lib/stream-utils"

export default function AdminStreams() {
  const [user] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [streamInfo, setStreamInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const newStream = await createNewStream(user.uid, title, description)
      setStreamInfo(newStream)
    } catch (error) {
      console.error("Erreur lors de la création du stream:", error)
    }
    setLoading(false)
  }

  if (!user) {
    return <div>Accès non autorisé</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Streams</h1>
      </div>

      <div className="grid gap-6">
        {/* Formulaire de création */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau stream</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre du stream
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de votre stream"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre stream"
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer le stream"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Informations du stream créé */}
        {streamInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informations de diffusion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">URL du serveur (RTMP)</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded">
                      {streamInfo.rtmpUrl}
                    </code>
                    <Button 
                      variant="outline" 
                      onClick={() => navigator.clipboard.writeText(streamInfo.rtmpUrl)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Clé de stream</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded">
                      {streamInfo.streamKey}
                    </code>
                    <Button 
                      variant="outline" 
                      onClick={() => navigator.clipboard.writeText(streamInfo.streamKey)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">URL complète</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded">
                      {streamInfo.streamUrl}
                    </code>
                    <Button 
                      variant="outline" 
                      onClick={() => navigator.clipboard.writeText(streamInfo.streamUrl)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
