import { NextRequest, NextResponse } from "next/server";
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname === "/room/create") {
    return NextResponse.next();
  }
  
  const res = NextResponse.next();

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/);

  if (!roomMatch) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const roomID = roomMatch[1];

  const meta = await redis.hgetall<{
    connected: string;
    createdAt: number;
  }>(`meta:${roomID}`);

  if (!meta) {
    return NextResponse.redirect(
      new URL("/?error=room-not-found", req.url)
    );
  }

  const existingUser = req.cookies.get("x-auth-token")?.value;

  if(existingUser && meta.connected.includes(existingUser)){
    return NextResponse.next();
  }

  if(meta.connected?.length >=2){
    return NextResponse.redirect(
      new URL("/?error=room-full", req.url)
    )
  }

  const token = nanoid();

  res.cookies.set("x-auth-token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    // secure: process.env.NODE_ENV === "production",
  });


  await redis.hset(`meta:${roomID}`, {
    connected: JSON.stringify([...meta.connected, token]),
  });

  return res;
}



export const config = {
  matcher: "/room/:path*",
};
