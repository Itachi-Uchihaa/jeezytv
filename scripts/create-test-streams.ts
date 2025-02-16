// scripts/create-test-streams.ts
import { db } from '../app/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

const createTestStreams = async () => {
  const streamsCollection = collection(db, 'streams')

  const testStreams = [
    {
      title: "Match PSG vs OM",
      description: "Diffusion du match PSG contre OM",
      userId: "testUser1",
      isLive: true,
      viewerCount: 0,
      hlsUrl: "https://test-stream-url.com/stream1.m3u8",
      thumbnailUrl: "/thumbnails/match1.jpg",
      createdAt: new Date()
    },
    {
      title: "NBA Finals",
      description: "Match final de la NBA",
      userId: "testUser2",
      isLive: true,
      viewerCount: 0,
      hlsUrl: "https://test-stream-url.com/stream2.m3u8",
      thumbnailUrl: "/thumbnails/match2.jpg",
      createdAt: new Date()
    }
  ]

  for (const stream of testStreams) {
    try {
      await addDoc(streamsCollection, stream)
      console.log('Stream ajouté avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'ajout du stream:', error)
    }
  }
}

// Exécuter le script
createTestStreams()