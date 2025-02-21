"use client"

import type React from "react"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createNewStream } from "@/lib/stream-utils"
import { toast } from "sonner"

interface StreamInfo {
  rtmpServer: string
  streamKey: string
  streamUrl: string
  rtmpUrl: string
  webrtcUrl: string
}

export default function AdminStreams() {
  const [user] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const newStream = await createNewStream(user.uid, title, description)
      setStreamInfo(newStream as unknown as StreamInfo)
      toast.success("Stream créé avec succès!")
    } catch (error) {
      console.error("Erreur lors de la création du stream:", error)
      toast.error("Erreur lors de la création du stream")
    }
    setLoading(false)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié dans le presse-papier`)
  }

  if (!user) {
    return <div className="p-6">Accès non autorisé</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Streams</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau stream</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre du stream</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de votre stream"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre stream"
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer le stream"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {streamInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informations de diffusion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">URL du serveur (WebRTC)</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded">{streamInfo.rtmpServer}</code>
                    <Button variant="outline" onClick={() => copyToClipboard(streamInfo.rtmpServer, "URL du RTMP")}>
                      Copier
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Clé de stream</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded">{streamInfo.streamKey}</code>
                    <Button variant="outline" onClick={() => copyToClipboard(streamInfo.streamKey, "Clé de stream")}>
                      Copier
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">URL de visionnage</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded">{streamInfo.streamUrl}</code>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(streamInfo.streamUrl, "URL de visionnage")}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {streamInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Instructions pour OBS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Configuration OBS :</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>{"Ouvrez OBS Studio"}</li>
                    <li>{"Allez dans Paramètres Flux"}</li>
                    <li>{"Sélectionnez 'Service personnalisé'"}</li>
                    <li>{"Dans 'Serveur', collez : " + streamInfo.rtmpUrl}</li>
                    <li>{"Dans 'Clé de stream', collez : " + streamInfo.streamKey}</li>
                    <li>{"Cliquez sur 'OK' et 'Démarrer le streaming'"}</li>
                  </ol>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">URL de visionnage pour vos spectateurs :</h3>
                  <p>URL WebRTC : {streamInfo.webrtcUrl}</p>
                  <p>Page de visionnage : {window.location.origin}{streamInfo.streamUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

