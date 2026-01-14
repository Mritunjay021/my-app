import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMiddleware } from "../create/auth";
import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { time } from "console";
import { Message, realtime } from "@/lib/realtime";
import { RealtimeEvents } from "@/lib/realtime";

const querySchema = z.object({
    roomId:z.string(),
})

const bodySchema = z.object({
    sender:z.string().max(100),
    text:z.string().max(1000),
})

export async function POST(req: NextRequest){
    try{
        const {auth} = await authMiddleware(req);
        const {roomId,token} = auth

        const {searchParams} = new URL(req.url)

        querySchema.parse({roomId})

        const {sender,text} = bodySchema.parse(await req.json())

        const roomExist = await redis.exists(`meta:${roomId}`);

        if(!roomExist){
            return NextResponse.json(
                {error:"room-not-found"}
                ,{status:404});
        }

        const message:Message & {token:string}={
            id:nanoid(),
            sender,
            text,
            timestamp:Date.now(),
            roomId,
            token,
        }

        await redis.rpush(`messages:${roomId}`,message);

        const channel = realtime.channel(roomId) as {
            emit<E extends keyof RealtimeEvents>(
            event: E,
            payload: RealtimeEvents[E]
        ): Promise<void>
        }

        await channel.emit("chat.message",message);

        const remaining = await redis.ttl(`meta:${roomId}`)
        await redis.expire(`messages:${roomId}`, remaining)
        await redis.expire(`history:${roomId}`, remaining)
        await redis.expire(roomId, remaining)
        return NextResponse.json({ success: true })
    }catch(e){
        return NextResponse.json(
            {error:(e as Error).message || "internal-server-error"}
            ,{status:500});
    }
}