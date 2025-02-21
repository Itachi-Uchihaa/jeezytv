// components/StreamViewer.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { useRouter } from "next/navigation"

const LIVEKIT_SERVER = "wss://jeezytv-0yemfakn.livekit.cloud"

interface StreamViewerProps {
  streamId: string
}

export default function StreamViewer({ streamId }: StreamViewerProps) {
  const [user] = useAuthState(auth)
  const [token, setToken] = useState("")
  const router = useRouter()

  useEffect(() => {
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
            title: `Viewer-${user.displayName || user.uid}`,
            isViewer: true,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to join stream')
        }

        const data = await response.json()
        setToken(data.token)
      } catch (error) {
        console.error("Error fetching token:", error)
      }
    }

    getToken()
  }, [streamId, user, router])

  if (!user || !token) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Connexion au stream...</p>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_SERVER}
      connect={true}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden"
      data-lk-theme="default"
      style={{ height: '60vh' }}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}