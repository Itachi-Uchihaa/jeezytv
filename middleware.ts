import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./app/lib/firebase"


export async function middleware(request: NextRequest) {
  const session = await auth.currentUser

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Ici, vous pouvez ajouter une vérification supplémentaire pour s'assurer que l'utilisateur est un administrateur
  }

  return NextResponse.next()
}

