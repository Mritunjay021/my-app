import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./auth";
import { z } from "zod";

const queryschema =  z.object({
    roomId:z.string(),
})

export async function POST(){
    const roomID = nanoid();

    await redis.hset(`meta:${roomID}`,{
        connected:JSON.stringify([]),
        createdAt:Date.now(),
    })

    await redis.expire(`meta:${roomID}`,60*10);

    return NextResponse.json({ roomID });
}

export async function GET(req:NextRequest){
    try{
        const {auth} = await authMiddleware(req);
        
        queryschema.parse({roomId:auth.roomId});

        const ttl = await redis.ttl(`meta:${auth.roomId}`);

        return NextResponse.json({ttl:ttl>0?ttl:0});
    }catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "internal-server-error" },
      { status: 500 }
    );
  }
}

