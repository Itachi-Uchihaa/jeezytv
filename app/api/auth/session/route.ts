// app/api/auth/session/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialiser Firebase Admin si ce n'est pas déjà fait
const apps = getApps()

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    
    // Créer un cookie de session
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 jours
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    
    // Configurer les options du cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return NextResponse.json({ status: "success" }, { status: 200 })
  } catch (error) {
    console.error('ERREUR SESSION:', error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return NextResponse.json({ status: "success" }, { status: 200 })
}