import { AccessToken } from "livekit-server-sdk"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { roomName, participantName } = await request.json()

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  console.log("api key dans route create room", apiKey)
  console.log("api secret dans route create room", apiSecret)

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  })

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  })

  return NextResponse.json({ token: at.toJwt() })
}

