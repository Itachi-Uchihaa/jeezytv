import { db } from "./firebase"
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore"

const LIVEKIT_SERVER = "jeezytv-0yemfakn.livekit.cloud"

export async function createNewStream(userId: string, title: string, description: string) {
  try {
    // Générer un ID unique pour le stream
    const streamId = `stream-${Math.random().toString(36).slice(2)}`

    // Obtenir le token depuis l'API
    const response = await fetch('/api/stream/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title, streamId }),
    })

    const { token } = await response.json()

    const rtmpServer = `rtmp://${LIVEKIT_SERVER}/live`
    const streamKey = streamId
    const webrtcUrl = `wss://${LIVEKIT_SERVER}`

    // Sauvegarder les informations du stream dans Firebase
    await addDoc(collection(db, "streams"), {
          streamId,
          userId,
          title,
          description,
          status: "created",
          createdAt: serverTimestamp(),
          viewerCount: 0,
          rtmpServer,
          streamKey,
          webrtcUrl,
    })

    // Retourner les informations pour OBS
    return {
      streamId,
      token,
      rtmpServer,
      streamKey,
      webrtcUrl,
      streamUrl: `/stream/${streamId}`,
    }
  } catch (error) {
    console.error("Erreur création stream:", error)
    throw error
  }
}

export async function getStreamInfo(streamId: string) {
  const streamsRef = collection(db, "streams")
  const q = query(streamsRef, where("streamId", "==", streamId))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data(),
  }
} 