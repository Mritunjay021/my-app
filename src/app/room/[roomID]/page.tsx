"use client";

import { useUsername } from "@/hooks/use-username";
import type { Message} from "@/lib/realtime";
import { useRealtime } from "@/lib/realtime-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

const Page = () =>{
    const params = useParams();
    const roomId = params.roomID as string;

    const {username} = useUsername();
    const [copystatus,setCopyStatus] = useState("COPY");
    const [timeremain,setTimeRemain] = useState<number|null>(null);
    const [input,setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null); 


    const {data:messages,refetch} = useQuery<Message[]>({
        queryKey:['messages',roomId],
        queryFn:async()=>{
            const res = await fetch(`/api/message?roomId=${roomId}`);
            
            if (!res.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data=await res.json();
            return data.messages;
        }
    })

    const { mutate: sendMessage,isPending } = useMutation({
  mutationFn: async ({ text }: { text: string }) => {
        const res = await fetch(`/api/message?roomId=${roomId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sender: username,
            text,
        }),
        });
        if (!res.ok) {
        throw new Error("Failed to send message");
        }
    },
    });

    useRealtime({
        channels:[roomId],
        events:["chat.message","chat.destroy"],
        onData:({event})=>{
            if(event === "chat.message"){
                refetch();
            }
        },
    })

    const copyLink = ()=>{
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopyStatus("COPIED!");
        setTimeout(()=>{
            setCopyStatus("COPY");
        },2000);
    }

    const formatTime = (seconds:number)=>{
        const mins = Math.floor(seconds/60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <main className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase">
                            Room ID
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-green-500">
                                {roomId}
                            </span>
                            <button className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors" onClick={copyLink}>
                                {copystatus}
                            </button>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"/>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase">
                            Self-Destruct
                        </span>
                        <span className={`text-sm font-bold flex items-center gap-2 ${timeremain !== null && timeremain <=60 ? 'text-red-500' : 'text-green-400'}`}>
                            {timeremain !== null ? formatTime(timeremain):"--:--"}
                        </span>
                    </div>

                </div>

                <button className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-40 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
                    <span className="group-hover:animate-shake">
                       💣 
                    </span>
                    DESTROY NOW
                </button>

            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"> 
                {messages?.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <span className=" text-white-500 animate-pulse">
                            {"</blank>"}
                        </span>
                    </div>
                )}
                {
                    messages?.map((msg)=>(
                    <div key={msg.id} className="flex flex-col items-start">
                        <div className="max-w-[80%] group">
                            <div className="flex items-baseline gap-3 mb-1">
                                <span className={`text-xs font-bold ${msg.sender === username ? 'text-green-400' : 'text-zinc-400'}`}>
                                    {msg.sender === username ? "You" : msg.sender }
                                </span>

                                <span className="text-[10px] text-zinc-600">
                                    {format(msg.timestamp,"hh:mm")}
                                </span>
                            </div>

                            <p className="text-sm text-zinc-300 leading-relaxed break-all">
                                {msg.text}
                            </p>
                        </div>
                        
                    </div>
                    ))
                }
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">{">"}</span>
                        <input autoFocus type="text" value={input} 
                        onChange={(e)=>setInput(e.target.value)} 
                        placeholder="Enter Your Message...."
                        onKeyDown={(e)=>{if(e.key === "Enter" && input.trim())
                             {
                                sendMessage({text:input})
                               inputRef.current?.focus()
                               setInput("")
                            }}}
                        className="w-full bg-black border border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"/>
                    </div>
                    <button onClick={()=>{sendMessage({text:input}) 
                                setInput("")
                                inputRef.current?.focus()}}
                                disabled={input.trim().length===0 || isPending}
                     className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        SEND
                    </button>
                </div>

            </div>

        </main>
    )
}

export default Page;