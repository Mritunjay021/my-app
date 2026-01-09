import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(){
    const roomID = nanoid();

    await redis.hset(`meta:${roomID}`,{
        connected:JSON.stringify([]),
        createdAt:Date.now(),
    })

    await redis.expire(`meta:${roomID}`,60*10);

    return NextResponse.json({ roomID });
}