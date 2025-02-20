"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { useRouter } from "next/navigation"

interface StreamViewerProps {
  streamId: string
}

export default function StreamViewer({ streamId }: StreamViewerProps) {
  const [user] = useAuthState(auth)
  const [token, setToken] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page de connexion si non authentifié
    if (!user) {
      router.push("/")
      return
    }

    const getToken = async () => {
      try {
        const response = await fetch("/api/stream/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            streamId,
            userId: user.uid,
            isViewer: true,
          }),
        })
        const data = await response.json()
        setToken(data.token)
      } catch (error) {
        console.error("Error fetching token:", error)
      }
    }

    getToken()
  }, [streamId, user, router])

  if (!user || !token) {
    return <div>Chargement...</div>
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl="wss://jeezytv-0yemfakn.livekit.cloud"
      connect={true}
      className="w-full aspect-video bg-black rounded-lg"
    >
      <VideoConference />
    </LiveKitRoom>
  )
}

