import type React from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const sessionCookie = headersList.get("x-session-cookie")

  try {
    if (!sessionCookie) {
      redirect("/")
    }

    // Vérifier le token avec Firebase Admin
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie, true)

    // Vérifier si l'utilisateur est admin
    if (!decodedClaim.admin) {
      redirect("/")
    }

    return <>{children}</>
  } catch (error) {
    console.error("Erreur de vérification:", error)
    redirect("/")
  }
}

