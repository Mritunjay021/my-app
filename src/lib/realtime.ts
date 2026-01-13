import z from "zod/v4";
import { redis } from "./redis";
import { Realtime } from "@upstash/realtime";

const schema = {
    chat: {
        message: z.object({
            id: z.string(),
            sender: z.string(),
            text: z.string(),
            timestamp: z.number(),
            roomId: z.string(),
            token: z.string().optional(),
        }),
        destroy: z.object({
            isDestroyed: z.literal(true),
        }),
    },
};

export const realtime = new Realtime({ schema, redis });