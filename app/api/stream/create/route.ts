// app/api/stream/create/route.ts
import { NextResponse } from "next/server"
import { AccessToken, TrackSource } from "livekit-server-sdk"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const LIVEKIT_SERVER = "jeezytv-0yemfakn.livekit.cloud"

export async function POST(request: Request) {
  try {
    const { streamId, userId, title, isViewer } = await request.json()

    // Créer le token avec les permissions appropriées
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: userId,
      name: isViewer ? `viewer-${userId}` : title,
    })

    // Différentes permissions selon le type d'utilisateur
    if (isViewer) {
      at.addGrant({
        room: streamId,
        roomJoin: true,
        canPublish: false,
        canSubscribe: true,
      })
    } else {
      // Pour le streamer
      at.addGrant({
        room: streamId,
        roomCreate: true,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE],
      })

      // Sauvegarder les informations du stream uniquement pour le streamer
      await addDoc(collection(db, "streams"), {
        streamId,
        userId,
        title,
        status: "created",
        createdAt: serverTimestamp(),
        viewerCount: 0,
        rtmpServer: `rtmp://${LIVEKIT_SERVER}/live`,
        streamKey: streamId,
        webrtcUrl: `wss://${LIVEKIT_SERVER}`,
      })
    }

    // Retourner les informations appropriées
    return NextResponse.json({
      token: at.toJwt(),
      streamId,
      rtmpServer: `rtmp://${LIVEKIT_SERVER}/live`,
      streamKey: streamId,
      webrtcUrl: `wss://${LIVEKIT_SERVER}`,
      viewerUrl: `/stream/${streamId}`,
    })
  } catch (error) {
    console.error("Erreur création stream:", error)
    return NextResponse.json({ error: "Erreur lors de la création du stream" }, { status: 500 })
  }
}