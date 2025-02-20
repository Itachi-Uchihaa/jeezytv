import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Ne vérifie que les routes /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session")?.value

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Passer le cookie à l'API via les headers
    const response = NextResponse.next()

    // Ajouter le cookie de session dans un header personnalisé
    response.headers.set("x-session-cookie", sessionCookie)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

