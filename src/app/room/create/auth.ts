export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

export async function authMiddleware(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("x-auth-token")?.value

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get("roomId")

  if (!roomId || !token) {
    throw new AuthError("Missing roomId or token")
  }

  const connected = await redis.hget<string[]>(
    `meta:${roomId}`,
    "connected"
  )

  if (!connected || !connected.includes(token)) {
    throw new AuthError("Invalid token")
  }

  return {
    auth: {
      roomId,
      token,
      connected,
    },
  }
}