import { db } from "./firebase"
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore"
import { AccessToken } from "livekit-server-sdk"
import dotenv from "dotenv"

dotenv.config()

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

    // Sauvegarder les informations du stream dans Firebase
    const streamDoc = await addDoc(collection(db, "streams"), {
      streamId,
      userId,
      title,
      description,
      status: "created",
      createdAt: serverTimestamp(),
      viewerCount: 0,
    })

    // Retourner les informations pour OBS
    return {
      streamId,
      token,
      rtmpUrl: "wss://jeezytv-0yemfakn.livekit.cloud", // URL WebRTC pour OBS
      streamKey: streamId, // Utiliser le streamId comme clé
      streamUrl: `/stream/${streamId}`, // URL de visionnage
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