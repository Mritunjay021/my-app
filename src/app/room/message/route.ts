import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMiddleware } from "../create/auth";
import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { time } from "console";

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
    }
}