import { InferRealtimeEvents, Realtime } from "@upstash/realtime"
import { z } from "zod"
import { redis } from "./redis"

const message= z.object({
      id: z.string(),
      sender: z.string(),
      text: z.string(),
      timestamp: z.number(),
      roomId: z.string(),
      token: z.string().optional(),
    })

const schema = {
  chat: {
    message,
    destroy: z.object({
      isDestroyed: z.literal(true),
    }),
  },
} as const

export const realtime = new Realtime({
  redis,
  schema,
})

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>
export type Message = z.infer<typeof message>