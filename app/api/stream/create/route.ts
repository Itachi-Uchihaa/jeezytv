import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { streamId, userId, title } = await request.json()

    console.log("api key dans route stream", process.env.LIVEKIT_API_KEY)
    console.log("api secret dans route stream", process.env.LIVEKIT_API_SECRET)
    // Utilisation de vos clés LiveKit
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: userId,
      name: title,
    })

    at.addGrant({
      room: streamId,
      roomCreate: true,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    // Sauvegarder les informations du stream dans Firebase
    await addDoc(collection(db, "streams"), {
      streamId,
      userId,
      title,
      status: "created",
      createdAt: serverTimestamp(),
      viewerCount: 0,
      streamUrl: `wss://jeezytv-0yemfakn.livekit.cloud`,
    })

    return NextResponse.json({
      token: at.toJwt(),
      streamId,
      serverUrl: "wss://jeezytv-0yemfakn.livekit.cloud",
    })
  } catch (error) {
    console.error("Erreur création stream:", error)
    return NextResponse.json({ error: "Erreur lors de la création du stream" }, { status: 500 })
  }
}

