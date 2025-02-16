// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialisation de Firebase Admin
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

export async function middleware(request: NextRequest) {
  // Vérifier si la route commence par /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      // Récupérer le token du cookie ou du header
      const sessionCookie = request.cookies.get('session')?.value
      
      if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Vérifier le token avec Firebase Admin
      const decodedClaim = await getAuth().verifySessionCookie(sessionCookie, true)
      
      // Vérifier si l'utilisateur est admin
      if (!decodedClaim.admin) {
        return NextResponse.redirect(new URL("/", request.url))
      }

    } catch (error) {
      console.error('Erreur de vérification:', error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

// Spécifier les routes à protéger
export const config = {
  matcher: [
    '/admin/:path*'
  ]
}