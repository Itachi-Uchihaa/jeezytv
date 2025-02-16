// lib/stream-utils.ts
import { db } from './firebase'
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { CreateStreamData } from './types/stream'
// Fonction pour générer une clé de stream unique
const generateStreamKey = (length: number = 20) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const createNewStream = async (userId: string, title: string, description: string) => {
  try {
    const streamKey = generateStreamKey()
    // Remplacez ces URLs par celles de votre serveur de streaming
    const rtmpUrl = `rtmp://votre-serveur-rtmp/live`  // URL de votre serveur RTMP
    const playbackUrl = `https://votre-serveur-hls/live/${streamKey}/index.m3u8` // URL HLS

    const streamData: CreateStreamData = {
      title,
      description,
      userId,
      rtmpUrl,
      streamKey,
      playbackUrl,
      isLive: false,
      viewerCount: 0,
      createdAt: serverTimestamp()
    }

    const streamRef = await addDoc(collection(db, 'streams'), streamData)
    
    return {
      id: streamRef.id,
      ...streamData,
      streamUrl: `${rtmpUrl}/${streamKey}` // URL complète pour OBS
    }
  } catch (error) {
    console.error('Erreur lors de la création du stream:', error)
    throw error
  }
}

export const getStreamInfo = async (streamId: string) => {
  const streamRef = doc(db, 'streams', streamId)
  const streamDoc = await streamRef.get()
  
  if (!streamDoc.exists()) {
    throw new Error('Stream non trouvé')
  }
  
  const streamData = streamDoc.data()
  return {
    id: streamDoc.id,
    ...streamData,
    streamUrl: `${streamData.rtmpUrl}/${streamData.streamKey}`
  }
}

export const updateStreamStatus = async (streamId: string, isLive: boolean) => {
  const streamRef = doc(db, 'streams', streamId)
  await updateDoc(streamRef, { isLive })
}

export const endStream = async (streamId: string) => {
  const streamRef = doc(db, 'streams', streamId)
  await updateDoc(streamRef, {
    isLive: false,
    endedAt: serverTimestamp()
  })
}