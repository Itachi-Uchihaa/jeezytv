import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialisation de Firebase Admin
const apps = getApps()

if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

// Route pour vérifier si l'utilisateur est admin
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return new NextResponse(null, { status: 401 })
    }

    // Vérifier le token avec Firebase Admin
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie, true)

    // Vérifier si l'utilisateur est admin
    if (!decodedClaim.admin) {
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Erreur de vérification:", error)
    return new NextResponse(null, { status: 401 })
  }
}

// Route pour créer une session
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 jours
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    
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

// Route pour supprimer la session
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return NextResponse.json({ status: "success" }, { status: 200 })
}

