// import { redis } from "@/lib/redis";
// import { nanoid } from "nanoid";
// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "./auth";
// import { z } from "zod";

// const queryschema =  z.object({
//     roomId:z.string(),
// })

// export async function POST(){
//     const roomID = nanoid();

//     await redis.hset(`meta:${roomID}`,{
//         connected:JSON.stringify([]),
//         createdAt:Date.now(),
//     })

//     await redis.expire(`meta:${roomID}`,60*10);

//     return NextResponse.json({ roomID });
// }

// export async function GET(req:NextRequest){
//     try{
//         const {auth} = await authMiddleware(req);
        
//         queryschema.parse({roomId:auth.roomId});

//         const ttl = await redis.ttl(`meta:${auth.roomId}`);

//         return NextResponse.json({ttl:ttl>0?ttl:0});
//     }catch (err) {
//     return NextResponse.json(
//       { error: (err as Error).message || "internal-server-error" },
//       { status: 500 }
//     );
//   }
// }

import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./auth";
import { z } from "zod";

/* ------------------ Zod Schema ------------------ */
const querySchema = z.object({
  roomId: z.string().min(1),
});

/* ------------------ POST: Create Room ------------------ */
export async function POST() {
  const roomID = nanoid();

  await redis.hset(`meta:${roomID}`, {
    connected: JSON.stringify([]),
    createdAt: Date.now(),
  });

  await redis.expire(`meta:${roomID}`, 60 * 10);

  return NextResponse.json({ roomID });
}

/* ------------------ GET: Fetch TTL ------------------ */
export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ Parse query params safely */
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      roomId: searchParams.get("roomId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "roomId required" },
        { status: 400 }
      );
    }

    const { roomId } = parsed.data;

    /* 2️⃣ Auth check AFTER validation */
    const { auth } = await authMiddleware(req);

    if (auth.roomId !== roomId) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 403 }
      );
    }

    /* 3️⃣ Fetch TTL */
    const ttl = await redis.ttl(`meta:${roomId}`);

    return NextResponse.json({ ttl: ttl > 0 ? ttl : 0 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "internal-server-error" },
      { status: 500 }
    );
  }
}
